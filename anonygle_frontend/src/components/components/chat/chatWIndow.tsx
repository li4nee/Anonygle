"use client";
import { useEffect, useRef } from "react";
import { Message } from "../../../typings/base.typings";
interface ChatWindowProps {
  messages: Message[];
}

export function ChatWindow({ messages }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black text-white">
      {messages.map((msg, index) => {
        return (
          <div
            key={index}
            className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
              msg.fromSelf
                ? "bg-red-600 text-white self-end ml-auto"
                : "bg-zinc-800 text-white self-start mr-auto"
            }`}
          >
            {msg.content}
          </div>
        );
      })}

      <div ref={messagesEndRef} />
    </div>
  );
}
