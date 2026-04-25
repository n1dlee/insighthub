import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChatWindow } from "@/components/chat/chat-window";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Conversation #${id}` };
}

export default async function ChatPage({ params }: Props) {
  const session = await auth();
  const { id }  = await params;
  const userId  = Number(session?.user?.id);

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: Number(id),
      OR: [{ participant1Id: userId }, { participant2Id: userId }],
    },
    include: {
      participant1: { select: { id: true, name: true, surname: true, profileImage: true } },
      participant2: { select: { id: true, name: true, surname: true, profileImage: true } },
      messages:     { orderBy: { createdAt: "asc" } },
    },
  });

  if (!conversation) notFound();

  const other = conversation.participant1Id === userId
    ? conversation.participant2
    : conversation.participant1;

  return (
    <ChatWindow
      conversationId={conversation.id}
      currentUserId={userId}
      other={other}
      initialMessages={conversation.messages.map((m: { id: number; conversationId: number; senderId: number; content: string; createdAt: Date }) => ({
        id:             m.id,
        conversationId: m.conversationId,
        senderId:       m.senderId,
        content:        m.content,
        createdAt:      m.createdAt.toISOString(),
      }))}
    />
  );
}
