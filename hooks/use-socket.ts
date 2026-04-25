"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import type { SocketMessage } from "@/lib/socket-server";

interface UseSocketOptions {
  conversationId?: number;
  onMessage?:      (msg: SocketMessage) => void;
  onTypingStart?:  (userId: number)     => void;
  onTypingStop?:   (userId: number)     => void;
}

export function useSocket({
  conversationId,
  onMessage,
  onTypingStart,
  onTypingStop,
}: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to the Socket.io server
    const socket = io({ path: "/socket.io", transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      if (conversationId) {
        socket.emit("join:conversation", conversationId);
      }
    });

    socket.on("message:received", (msg: SocketMessage) => {
      onMessage?.(msg);
    });

    socket.on("typing:start", ({ userId }: { userId: number }) => {
      onTypingStart?.(userId);
    });

    socket.on("typing:stop", ({ userId }: { userId: number }) => {
      onTypingStop?.(userId);
    });

    return () => {
      if (conversationId) socket.emit("leave:conversation", conversationId);
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  /** Broadcast a message to the room (call AFTER persisting via REST) */
  const broadcastMessage = useCallback((msg: SocketMessage) => {
    socketRef.current?.emit("message:send", msg);
  }, []);

  const emitTypingStart = useCallback((userId: number) => {
    if (!conversationId) return;
    socketRef.current?.emit("typing:start", { conversationId, userId });
  }, [conversationId]);

  const emitTypingStop = useCallback((userId: number) => {
    if (!conversationId) return;
    socketRef.current?.emit("typing:stop", { conversationId, userId });
  }, [conversationId]);

  return { broadcastMessage, emitTypingStart, emitTypingStop };
}
