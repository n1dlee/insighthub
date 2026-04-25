"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import DOMPurify from "dompurify";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/hooks/use-socket";
import { getInitials, getProfileImageUrl, formatRelativeTime } from "@/lib/utils";
import type { SocketMessage } from "@/lib/socket-server";

interface Message {
  id:             number;
  conversationId: number;
  senderId:       number;
  content:        string;
  createdAt:      string;
}

interface Participant {
  id:           number;
  name:         string;
  surname:      string;
  profileImage: string | null;
}

interface Props {
  conversationId:  number;
  currentUserId:   number;
  other:           Participant;
  initialMessages: Message[];
}

export function ChatWindow({ conversationId, currentUserId, other, initialMessages }: Props) {
  const [messages,    setMessages]    = useState<Message[]>(initialMessages);
  const [input,       setInput]       = useState("");
  const [sending,     setSending]     = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const bottomRef   = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherTyping]);

  const handleNewMessage = useCallback((msg: SocketMessage) => {
    setMessages(prev => [...prev, { ...msg }]);
  }, []);

  const handleTypingStart = useCallback((userId: number) => {
    if (userId !== currentUserId) setOtherTyping(true);
  }, [currentUserId]);

  const handleTypingStop = useCallback((userId: number) => {
    if (userId !== currentUserId) setOtherTyping(false);
  }, [currentUserId]);

  const { broadcastMessage, emitTypingStart, emitTypingStop } = useSocket({
    conversationId,
    onMessage:     handleNewMessage,
    onTypingStart: handleTypingStart,
    onTypingStop:  handleTypingStop,
  });

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
    emitTypingStart(currentUserId);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => emitTypingStop(currentUserId), 1500);
  }

  async function sendMessage() {
    const content = input.trim();
    if (!content || sending) return;
    setSending(true);
    setInput("");
    emitTypingStop(currentUserId);

    try {
      const res  = await fetch(`/api/chat/${conversationId}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ content }),
      });
      const data = await res.json() as { message?: Message; error?: string };
      if (!res.ok) { toast.error(data.error ?? "Failed to send"); return; }
      if (data.message) {
        setMessages(prev => [...prev, data.message!]);
        // Broadcast to other participants via Socket.io
        broadcastMessage({ ...data.message!, createdAt: new Date(data.message!.createdAt).toISOString() });
      }
    } catch { toast.error("Network error"); }
    finally  { setSending(false); }
  }

  const otherInitials = getInitials(other.name, other.surname);
  const otherImage    = getProfileImageUrl("student", other.id, other.profileImage);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="glass border-b border-[rgba(99,102,241,0.1)] px-4 sm:px-6 py-3 flex items-center gap-3 shrink-0">
        <Link href="/chat" className="text-[#9CA3AF] hover:text-[#6366F1] transition-colors mr-1 cursor-pointer">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>

        <Avatar className="h-9 w-9">
          <AvatarFallback className="text-xs font-semibold text-white" style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}>
            {otherInitials}
          </AvatarFallback>
          {otherImage && <AvatarFallback><img src={otherImage} alt="" /></AvatarFallback>}
        </Avatar>

        <div>
          <p className="font-semibold text-[#1E1B4B] text-sm">{other.name} {other.surname}</p>
          {otherTyping && (
            <p className="text-xs text-[#10B981] animate-pulse">typing…</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4 scrollbar-thin">
        {messages.length === 0 && (
          <div className="text-center text-[#9CA3AF] text-sm py-10">
            Start the conversation! Say hello 👋
          </div>
        )}

        {messages.map(msg => {
          const isMe = msg.senderId === currentUserId;
          // Sanitize content to prevent XSS
          const safeContent = typeof window !== "undefined"
            ? DOMPurify.sanitize(msg.content)
            : msg.content;

          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              {!isMe && (
                <Avatar className="h-7 w-7 mr-2 shrink-0 self-end">
                  <AvatarFallback className="text-[10px] font-semibold text-white" style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}>
                    {otherInitials}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={`max-w-[70%] group`}>
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isMe
                      ? "text-white rounded-br-sm"
                      : "bg-white text-[#1E1B4B] rounded-bl-sm shadow-sm border border-[rgba(99,102,241,0.1)]"
                  }`}
                  style={isMe ? { background: "linear-gradient(135deg, #6366F1, #8B5CF6)" } : {}}
                  // Safe: content was passed through DOMPurify
                  dangerouslySetInnerHTML={{ __html: safeContent }}
                />
                <p className={`text-[10px] text-[#9CA3AF] mt-1 ${isMe ? "text-right" : "text-left"} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  {formatRelativeTime(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {otherTyping && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-[rgba(99,102,241,0.1)] flex gap-1 items-center">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-[#9CA3AF] animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="glass border-t border-[rgba(99,102,241,0.1)] px-4 sm:px-6 py-4 shrink-0">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMessage(); } }}
            placeholder="Type a message…"
            maxLength={5000}
            className="flex-1 rounded-xl border border-[rgba(99,102,241,0.2)] bg-white/60 px-4 py-2.5 text-sm text-[#1E1B4B] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#6366F1] transition-shadow"
          />
          <Button
            onClick={() => void sendMessage()}
            disabled={!input.trim() || sending}
            className="h-10 w-10 rounded-xl p-0 shrink-0 cursor-pointer"
            style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
            aria-label="Send message"
          >
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
