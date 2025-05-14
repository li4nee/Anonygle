"use client"

import { useState, useEffect } from "react"
import { Video, VideoOff, SkipForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import useSocketIo from "../../../hook/socket/socketIo"
import { ChatStatus, Message } from "../../../typings/base.typings"
import ChatInterface from "../../../components/chat/chatinterface"
import { cn } from "@/lib/utils"

export default function ChatPage() {
  const { socket } = useSocketIo()
  const [status, setStatus] = useState<ChatStatus>("idle")
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState<string | null>(null)
  const [noOffOnline, setNoOfOnline] = useState(0)
  const startChat = () => {
    socket?.emit("start-match-making")
    setStatus("waiting")
  }

  const handleOnlineUsers = (count: number) => {
    setNoOfOnline(count)
  }

  const cancelMatchmaking = () => {
    socket?.emit("cancel-match-making")
    setStatus("idle")
  }

  const sendMessage = (text: string) => {
    if (socket) {
      socket.emit("message", text)
      setMessages(prev => [...prev, { content: text, fromSelf: true }])
    }
  }

  const disconnectChat = () => {
    socket?.emit("disconnect-match-making")
    setStatus("idle")
  }

  const nextChat = () => {
    socket?.emit("next-match-making")
    setStatus("waiting")
  }

  useEffect(() => {
    const handleMatchFound = ({ roomId }: { roomId: string }) => {
      socket?.emit("join-room", roomId)
      setStatus("connected")
    }

    const handleError = (e: string) => {
      setError(e)
      setStatus("error")
    }

    const handlePartnerDisconnected = () => {
      setStatus("disconnected")
    }

    const handleIncomingMessage = ({ message }: { message: string }) => {
      setMessages(prev => [...prev, { content: message, fromSelf: false }])
    }

    socket?.on("match-found", handleMatchFound)
    socket?.on("error", handleError)
    socket?.on("partner-disconnected", handlePartnerDisconnected)
    socket?.on("new-message", handleIncomingMessage)
    socket?.on("online-users", handleOnlineUsers)
    return () => {
      socket?.off("match-found", handleMatchFound)
      socket?.off("error", handleError)
      socket?.off("partner-disconnected", handlePartnerDisconnected)
      socket?.off("new-message", handleIncomingMessage)
      socket?.off("online-users", handleOnlineUsers)
    }
  }, [socket])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="container mx-auto py-10 px-6">
        <h1 className="text-4xl font-bold text-center mb-10 text-white">Anonygle</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="w-full flex flex-col">
            <div className="aspect-video bg-black rounded-lg shadow-lg overflow-hidden relative mb-6 h-[500px]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-gray-500 flex flex-col items-center">
                  <Video size={75} className="mb-3 opacity-30" />
                  <p className="text-lg opacity-50">Camera disconnected</p>
                </div>
              </div>
              <div className="absolute top-6 left-6 flex items-center">
                <div
                  className={cn(
                    "h-3 w-3 m-2 rounded-full",
                    status === "idle" && "bg-gray-400",
                    status === "waiting" && "bg-yellow-400",
                    status === "connected" && "bg-green-400",
                    status === "error" && "bg-red-400",
                  )}
                />
                <span className="font-medium">
                  {status === "idle" && " Disconnected"}
                  {status === "waiting" && " Connecting..."}
                  {status === "connected" && " Connected"}
                  {status === "error" && " Error"}
                </span>
              </div>
              <div className="absolute top-6 right-6 bg-gray-800 bg-opacity-70 px-4 py-2 rounded-full">
                <span className="text-gray-300 text-base">{noOffOnline} users online</span>
              </div>
            </div>

            <div className="flex justify-between gap-6 mb-6">
              <Button variant="outline" size="lg" className="flex-1 bg-gray-800 border-gray-700 text-white hover:bg-gray-700 text-lg py-6">
                <VideoOff className="mr-3 h-6 w-6" />
                Stop
              </Button>
              <Button size="lg" className="flex-1 bg-red-600 hover:bg-red-700 text-white text-lg py-6" onClick={nextChat}>
                <SkipForward className="mr-3 h-6 w-6" />
                Next
              </Button>
            </div>
          </div>

          <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
            <ChatInterface
              status={status}
              error={error}
              messages={messages}
              onSendMessage={sendMessage}
              onStart={startChat}
              onCancel={cancelMatchmaking}
              onDisconnect={disconnectChat}
              onNext={nextChat}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
