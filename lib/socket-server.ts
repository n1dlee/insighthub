import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";

export interface SocketMessage {
  id:             number;
  conversationId: number;
  senderId:       number;
  content:        string;
  createdAt:      string;
}

let io: SocketIOServer | null = null;

export function initSocketIO(httpServer: HTTPServer): SocketIOServer {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    cors: {
      origin:      process.env.NEXTAUTH_URL ?? "http://localhost:3000",
      credentials: true,
    },
    path: "/socket.io",
  });

  io.on("connection", socket => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // ── Join a conversation room ───────────────────────────────────────────
    socket.on("join:conversation", (conversationId: number) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`[Socket.io] ${socket.id} joined conversation:${conversationId}`);
    });

    socket.on("leave:conversation", (conversationId: number) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // ── Real-time message (persisted via REST, broadcast via socket) ───────
    socket.on("message:send", (message: SocketMessage) => {
      // Broadcast only to the conversation room (NOT to all users!)
      socket.to(`conversation:${message.conversationId}`).emit("message:received", message);
    });

    // ── Typing indicators ─────────────────────────────────────────────────
    socket.on("typing:start", ({ conversationId, userId }: { conversationId: number; userId: number }) => {
      socket.to(`conversation:${conversationId}`).emit("typing:start", { userId });
    });

    socket.on("typing:stop", ({ conversationId, userId }: { conversationId: number; userId: number }) => {
      socket.to(`conversation:${conversationId}`).emit("typing:stop", { userId });
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}
