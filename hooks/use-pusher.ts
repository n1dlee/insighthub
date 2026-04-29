"use client";

import { useEffect, useCallback } from "react";
import { pusherClient } from "@/lib/pusher-client";

export interface SocketMessage {
  id:             number;
  conversationId: number;
  senderId:       number;
  content:        string;
  createdAt:      string;
}

interface UsePusherOptions {
  conversationId?: number;
  onMessage?:      (msg: SocketMessage) => void;
  onTypingStart?:  (userId: number)     => void;
  onTypingStop?:   (userId: number)     => void;
}

export function usePusher({
  conversationId,
  onMessage,
  onTypingStart,
  onTypingStop,
}: UsePusherOptions) {
  useEffect(() => {
    if (!conversationId) return;

    const channelName = `private-conversation-${conversationId}`;
    const channel = pusherClient.subscribe(channelName);

    channel.bind("message:received", (msg: SocketMessage) => {
      onMessage?.(msg);
    });

    channel.bind("typing:start", ({ userId }: { userId: number }) => {
      onTypingStart?.(userId);
    });

    channel.bind("typing:stop", ({ userId }: { userId: number }) => {
      onTypingStop?.(userId);
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(channelName);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  /** No-op: server already triggered Pusher after persisting via REST */
  const broadcastMessage = useCallback((_msg: SocketMessage) => {}, []);

  const emitTypingStart = useCallback((userId: number) => {
    if (!conversationId) return;
    void fetch("/api/pusher/typing", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ conversationId, userId, event: "typing:start" }),
    });
  }, [conversationId]);

  const emitTypingStop = useCallback((userId: number) => {
    if (!conversationId) return;
    void fetch("/api/pusher/typing", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ conversationId, userId, event: "typing:stop" }),
    });
  }, [conversationId]);

  return { broadcastMessage, emitTypingStart, emitTypingStop };
}
