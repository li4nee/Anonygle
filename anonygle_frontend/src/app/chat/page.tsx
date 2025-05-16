"use client"

import { useState, useEffect} from "react"
import { VideoOff, SkipForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatStatus, Message } from "../../../typings/base.typings"
import ChatInterface from "../../../components/chat/chatinterface"
import { cn } from "@/lib/utils"
import { useSocket } from "../../../context/socket.context"
import { useWebRTC } from "../../../context/webRtc.context"
import StreamVideo from "../../../components/webrtc/video.component"

export default function ChatPage() {
  const { socket } = useSocket()
  const [status, setStatus] = useState<ChatStatus>("idle")
  const [messages, setMessages] = useState<Message[]>([])
  const [noOffOnline, setNoOfOnline] = useState(0)
  const {createOffer,createAnswer,handleIncommingAnswer} = useWebRTC()
  const [myStream,setMyStream] = useState<MediaStream|null>(null)

  const disconnectChat = () => {
    socket?.emit("disconnect-match-making")
    setMessages([])
    setStatus("idle")
  }

  const startChat = () => {
    socket?.emit("start-match-making")
    setStatus("waiting")
  }

  const nextChat = () => {
    socket?.emit("next-match-making")
    setMessages([])
    setStatus("waiting") 
  }

  const setUpMyDevice = async ()=>{
    const stream = await navigator.mediaDevices.getUserMedia({audio:true,video:true})
    setMyStream(stream)
  }

  useEffect(() => {
    
    const handleMatchFound = async () => {
        setUpMyDevice()
        const offer = await createOffer()
        socket?.emit("offer-connection", { offer }) 
        setStatus("connected");
    }

    const handleIncommingRequest = async ({offer}:{offer:RTCSessionDescriptionInit})=>{
      const answer = await createAnswer(offer)
      socket?.emit("answer",{answer})
    }

    const manageIncommingOfferAnswer = async ({answer}:{answer:RTCSessionDescriptionInit})=>{
      handleIncommingAnswer(answer)
    }


    socket?.on("incomming-offer-connection",(offer)=>{
        handleIncommingRequest(offer)
    })
    
    socket?.on("answer-reply",manageIncommingOfferAnswer)

    socket?.on("match-found", handleMatchFound)

    socket?.on("new-message", ({ message }: { message: string }) => {
      setMessages(prev => [...prev, { content: message, fromSelf: false }])
    })
    socket?.on("partner-disconnected", () => {
      setStatus("disconnected")
      setMessages([])
    })
    socket?.on("online-users", setNoOfOnline)

    return () => {
      socket?.off("match-found")
      socket?.off("new-message")
      socket?.off("partner-disconnected")
      socket?.off("online-users")
      socket?.off("offer-connection")
      socket?.off("incomming-offer-connection")
      socket?.off("answer-reply")
    }
  }, [socket,status,createOffer,createAnswer,handleIncommingAnswer])

  const sendMessage = (text: string) => {
    socket?.emit("message", text)
    setMessages(prev => [...prev, { content: text, fromSelf: true }])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="container mx-auto py-10 px-6">
        <h1 className="text-4xl font-bold text-center mb-10 text-white">Anonygle</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="w-full flex flex-col">
            <div className="aspect-video bg-black rounded-lg shadow-lg overflow-hidden relative mb-6 h-[500px]">
              {
                myStream && 
                <StreamVideo stream={myStream} muted autoPlay className="absolute w-48 h-32 bottom-4 right-4 z-10 border border-white rounded-md"/>
              }
              
              <video
                // ref={remoteVideoRef}
                autoPlay
                className="w-full h-full object-cover"
              />
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
              <Button variant="outline" size="lg" className="flex-1 bg-gray-800 border-gray-700 text-white hover:bg-gray-700 text-lg py-6" onClick={disconnectChat}>
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
              messages={messages}
              onSendMessage={sendMessage}
              onStart={startChat}
              onCancel={() => setStatus("idle")}
              onDisconnect={disconnectChat}
              onNext={nextChat}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
