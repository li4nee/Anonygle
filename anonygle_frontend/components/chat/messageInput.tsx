"use client";

import { useState, useRef, type KeyboardEvent, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

export function MessageInput({ onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSend = () => {
    const trimmed = message.trim();
    if (trimmed) {
      onSendMessage(trimmed);
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-3 border-t border-gray-200 bg-white flex items-end gap-2 animate-in fade-in slide-in-from-bottom-2">
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        aria-label="Message"
        className="resize-none min-h-[50px] max-h-[120px] flex-1 text-gray-400 rounded-lg shadow-sm focus:ring-2 focus:ring-gray-500 transition-all"
      />
      <Button
        onClick={handleSend}
        disabled={!message.trim()}
        className="h-[50px] w-[50px] p-0 rounded-full bg-blue-600 hover:bg-blue-700 hover:cursor-pointer transition-colors disabled:opacity-50 flex items-center justify-center"
        aria-label="Send message"
      >
        <Send className="h-5 w-5" />
      </Button>
    </div>
  );
}
