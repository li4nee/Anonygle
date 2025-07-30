"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { StatusBar } from "./statusBar";
import { WaitingScreen } from "./waitingScreen";
import { ChatWindow } from "./chatWIndow";
import { MessageInput } from "./messageInput";
import { ChatStatus, Message } from "../../src/typings/base.typings";

interface ChatInterfaceProps {
  status: ChatStatus;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onStart: () => void;
  onCancel: () => void;
  onDisconnect: () => void;
  onNext: () => void;
}

export default function ChatInterface({
  status,
  messages,
  onSendMessage,
  onStart,
  onCancel,
  onDisconnect,
  onNext,
}: ChatInterfaceProps) {
  return (
    <div className="flex flex-col h-[80vh] w-full bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      <StatusBar status={status} />

      <div className="flex-1 overflow-hidden relative">
        {status === "idle" ? (
          <div className="flex flex-col items-center justify-center h-full p-6 space-y-4 bg-gradient-to-b from-gray-50 to-gray-100">
            <h2 className="text-2xl font-bold text-gray-800">
              Talk to Strangers
            </h2>
            <p className="text-gray-600 text-center">
              Connect with random people from around the world for a chat.
            </p>
            <Button
              onClick={onStart}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-medium"
            >
              Start Chatting
            </Button>
          </div>
        ) : status === "waiting" ? (
          <WaitingScreen onCancel={onCancel} />
        ) : status === "disconnected" ? (
          <div className="flex flex-col items-center justify-center h-full p-6 space-y-4 bg-gradient-to-b from-gray-100 to-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">
              User Disconnected
            </h2>
            <p className="text-gray-600 text-center">
              The person you were chatting with has left.
            </p>
            <Button
              onClick={onNext}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium hover:cursor-pointer"
            >
              Next Chat
            </Button>
          </div>
        ) : (
          <ChatWindow messages={messages} />
        )}
      </div>

      {status === "connected" && (
        <>
          <MessageInput onSendMessage={onSendMessage} />
          <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center animate-in fade-in slide-in-from-bottom-2">
            <Button
              onClick={onDisconnect}
              variant="destructive"
              className="flex items-center gap-2 bg-red-600 hover:cursor-pointer px-4 py-2 rounded-full text-sm"
              aria-label="Disconnect from chat"
            >
              <X size={16} />
              Disconnect
            </Button>
            <Button
              onClick={onNext}
              variant="outline"
              className="flex items-center gap-2 px-4 py-2 hover:cursor-pointer rounded-full text-sm hover:bg-gray-700 transition"
              aria-label="Find next chat"
            >
              <span>Next</span>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
