"use client";

import { Button } from "@/components/ui/button";
import { X, MessageCircle, Users } from "lucide-react";
import type { ChatStatus, Message } from "../../../typings/base.typings";
import { StatusBar } from "./statusBar";
import { WaitingScreen } from "./waitingScreen";
import { ChatWindow } from "./chatWIndow";
import { MessageInput } from "./messageInput";

interface ChatInterfaceProps {
  status: ChatStatus;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onStart: () => void;
  onCancel: () => void;
  onDisconnect: () => void;
  onNext: () => void;
  onlineCount?: number;
}

export default function ChatInterface({
  status,
  messages,
  onSendMessage,
  onStart,
  onCancel,
  onDisconnect,
  onNext,
  onlineCount,
}: ChatInterfaceProps) {
  return (
    <div className="flex flex-col h-[80vh] w-full bg-card rounded-xl shadow-2xl overflow-hidden border border-border glow-red">
      <StatusBar status={status} onlineCount={onlineCount} />

      <div className="flex-1 overflow-hidden relative">
        {status === "idle" ? (
          <div className="flex flex-col items-center justify-center h-full p-6 space-y-6 bg-gradient-to-br from-background to-card">
            <div className="bg-primary/20 rounded-full p-6 glow-red">
              <MessageCircle className="h-12 w-12 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                Talk to Strangers
              </h2>
              <p className="text-muted-foreground max-w-sm">
                Connect with random people from around the world for anonymous
                video chats.
              </p>
            </div>
            <Button
              onClick={onStart}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-full font-medium glow-red transition-all"
            >
              <Users className="h-5 w-5 mr-2" />
              Start Chatting
            </Button>
          </div>
        ) : status === "waiting" ? (
          <WaitingScreen onCancel={onCancel} />
        ) : status === "disconnected" ? (
          <div className="flex flex-col items-center justify-center h-full p-6 space-y-6 bg-gradient-to-br from-background to-card">
            <div className="bg-muted/20 rounded-full p-6">
              <X className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                User Disconnected
              </h2>
              <p className="text-muted-foreground">
                The person you were chatting with has left.
              </p>
            </div>
            <Button
              onClick={onNext}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-full font-medium glow-red transition-all"
            >
              <Users className="h-5 w-5 mr-2" />
              Find Next Chat
            </Button>
          </div>
        ) : (
          <ChatWindow messages={messages} />
        )}
      </div>

      {status === "connected" && (
        <>
          <MessageInput onSendMessage={onSendMessage} />
          <div className="p-4 bg-card border-t border-border flex justify-between items-center">
            <Button
              onClick={onDisconnect}
              variant="destructive"
              className="flex items-center gap-2 bg-destructive hover:bg-destructive/90 px-4 py-2 rounded-full text-sm glow-red-strong"
            >
              <X size={16} />
              Disconnect
            </Button>
            <Button
              onClick={onNext}
              variant="outline"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm border-border hover:bg-secondary transition-all bg-transparent"
            >
              <Users size={16} />
              Next Chat
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
