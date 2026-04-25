import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { StartConversationSchema } from "@/lib/validations";
import { apiError, apiOk } from "@/lib/utils";
import { auth } from "@/lib/auth";

// GET /api/chat — list all conversations for current user
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const userId = Number(session.user.id);

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ participant1Id: userId }, { participant2Id: userId }],
    },
    include: {
      participant1: {
        select: { id: true, name: true, surname: true, profileImage: true },
      },
      participant2: {
        select: { id: true, name: true, surname: true, profileImage: true },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take:    1,   // last message preview
      },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  return apiOk({ conversations });
}

// POST /api/chat — start or retrieve conversation
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  let body: unknown;
  try { body = await req.json(); }
  catch { return apiError("Invalid JSON body", 400); }

  const parsed = StartConversationSchema.safeParse(body);
  if (!parsed.success) return apiError("participantId is required", 422);

  const userId = Number(session.user.id);
  const otherId = parsed.data.participantId;

  if (userId === otherId) return apiError("Cannot start conversation with yourself", 400);

  // Normalize: smaller id is always participant1
  const p1 = Math.min(userId, otherId);
  const p2 = Math.max(userId, otherId);

  const conversation = await prisma.conversation.upsert({
    where:  { participant1Id_participant2Id: { participant1Id: p1, participant2Id: p2 } },
    create: { participant1Id: p1, participant2Id: p2 },
    update: {},
    include: {
      participant1: { select: { id: true, name: true, surname: true, profileImage: true } },
      participant2: { select: { id: true, name: true, surname: true, profileImage: true } },
      messages:     { orderBy: { createdAt: "asc" } },
    },
  });

  return apiOk({ conversation }, 201);
}
