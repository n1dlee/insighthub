import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { SendMessageSchema } from "@/lib/validations";
import { apiError, apiOk } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";

type Ctx = { params: Promise<{ conversationId: string }> };

// GET /api/chat/:conversationId — fetch messages
export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const { conversationId } = await params;
  const convId  = Number(conversationId);
  const userId  = Number(session.user.id);

  // Verify user is a participant
  const conv = await prisma.conversation.findFirst({
    where: {
      id: convId,
      OR: [{ participant1Id: userId }, { participant2Id: userId }],
    },
    include: {
      participant1: { select: { id: true, name: true, surname: true, profileImage: true } },
      participant2: { select: { id: true, name: true, surname: true, profileImage: true } },
      messages:     { orderBy: { createdAt: "asc" } },
    },
  });

  if (!conv) return apiError("Conversation not found", 404);
  return apiOk({ conversation: conv });
}

// POST /api/chat/:conversationId — send a message
export async function POST(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const { conversationId } = await params;
  const convId  = Number(conversationId);
  const userId  = Number(session.user.id);

  // Verify participant access
  const conv = await prisma.conversation.findFirst({
    where: { id: convId, OR: [{ participant1Id: userId }, { participant2Id: userId }] },
  });
  if (!conv) return apiError("Conversation not found or access denied", 403);

  let body: unknown;
  try { body = await req.json(); }
  catch { return apiError("Invalid JSON body", 400); }

  const parsed = SendMessageSchema.safeParse({ conversationId: convId, ...body as object });
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Validation error", 422);
  }

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId: convId,
        senderId:       userId,
        senderType:     "STUDENT",
        content:        parsed.data.content,
      },
    }),
    // Update lastMessageAt for sorting
    prisma.conversation.update({
      where: { id: convId },
      data:  { lastMessageAt: new Date() },
    }),
  ]);

  // Broadcast to all participants via Pusher (fire-and-forget)
  await pusherServer.trigger(
    `private-conversation-${convId}`,
    "message:received",
    {
      id:             message.id,
      conversationId: convId,
      senderId:       message.senderId,
      content:        message.content,
      createdAt:      message.createdAt.toISOString(),
    }
  );

  return apiOk({ message }, 201);
}
