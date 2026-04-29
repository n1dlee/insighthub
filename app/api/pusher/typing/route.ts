import { NextRequest, NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId, userId, event } = await req.json() as {
    conversationId: number;
    userId:         number;
    event:          "typing:start" | "typing:stop";
  };

  if (!conversationId || !userId || !event) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await pusherServer.trigger(
    `private-conversation-${conversationId}`,
    event,
    { userId }
  );

  return NextResponse.json({ ok: true });
}
