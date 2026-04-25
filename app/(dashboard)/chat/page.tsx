import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, getProfileImageUrl, formatRelativeTime } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Messages" };

export default async function ChatListPage() {
  const session = await auth();
  const userId  = Number(session?.user?.id);

  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ participant1Id: userId }, { participant2Id: userId }] },
    include: {
      participant1: { select: { id: true, name: true, surname: true, profileImage: true } },
      participant2: { select: { id: true, name: true, surname: true, profileImage: true } },
      messages:     { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1E1B4B]">Messages</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</p>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-20 text-[#9CA3AF]">
          <svg className="mx-auto h-12 w-12 mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
          <p className="font-medium">No conversations yet</p>
          <p className="text-sm mt-1">Visit a student profile to start chatting</p>
          <Link href="/discover" className="mt-4 inline-block text-sm text-[#6366F1] hover:underline">
            Discover students →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv: typeof conversations[number]) => {
            const other       = conv.participant1Id === userId ? conv.participant2 : conv.participant1;
            const lastMsg     = conv.messages[0];
            const initials    = getInitials(other.name, other.surname);
            const imageUrl    = getProfileImageUrl("student", other.id, other.profileImage);

            return (
              <Link
                key={conv.id}
                href={`/chat/${conv.id}`}
                className="flex items-center gap-4 glass rounded-2xl p-4 card-hover cursor-pointer group"
              >
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarImage src={imageUrl ?? undefined} />
                  <AvatarFallback className="text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}>
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="font-semibold text-[#1E1B4B] text-sm group-hover:text-[#6366F1] transition-colors truncate">
                      {other.name} {other.surname}
                    </p>
                    {lastMsg && (
                      <span className="text-xs text-[#9CA3AF] shrink-0 ml-2">
                        {formatRelativeTime(lastMsg.createdAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#9CA3AF] truncate">
                    {lastMsg ? lastMsg.content : "No messages yet"}
                  </p>
                </div>

                <svg className="h-4 w-4 text-[#D1D5DB] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
