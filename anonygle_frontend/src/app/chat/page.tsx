"use client"

import { useState, useEffect} from "react"
import { VideoOff, SkipForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatStatus, Message } from "../../../typings/base.typings"
import ChatInterface from "../../../components/chat/chatinterface"
import { cn } from "@/lib/utils"
import { useSocket } from "../../../context/socket.context"
import { useWebRTC } from "../../../context/webRtc.context"
import ReactPlayer from "react-player"

export default function ChatPage() {
  const { socket } = useSocket()
  const [status, setStatus] = useState<ChatStatus>("idle")
  const [messages, setMessages] = useState<Message[]>([])
  const [noOffOnline, setNoOfOnline] = useState(0)
  const {peer,createOffer,createAnswer,handleIncommingAnswer,remoteStream,myStream} = useWebRTC()

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

  const sendMessage = (text: string) => {
    socket?.emit("message", text)
    setMessages(prev => [...prev, { content: text, fromSelf: true }])
  }


  // const handleNegoNeeded = useCallback(async () => {
  //   const offer = await createOffer()
  //   socket?.emit("peer:nego:needed", { offer});
  // }, [socket,createOffer]);

  // useEffect(() => {
  //   peer?.addEventListener("negotiationneeded", handleNegoNeeded);
  //   return () => {
  //     peer?.removeEventListener("negotiationneeded", handleNegoNeeded);
  //   };
  // }, [handleNegoNeeded,peer]);

  // const handleNegoNeedIncomming = useCallback(
  //   async ({offer}:{offer:RTCSessionDescriptionInit}) => {
  //     const ans = await createAnswer(offer)
  //     socket?.emit("peer:nego:done", {ans });
  //   },
  //   [socket,createAnswer]
  // );

  // const handleNegoNeedFinal = useCallback(async ({answer}:{answer:RTCSessionDescriptionInit}) => {
  //   await handleIncommingAnswer(answer);
  // }, [handleIncommingAnswer]);


  /**
   * * This useeffect le chai handles the incoming answer from the other peer.
   * Like main main sab kam esle nai garcha
   */
  useEffect(() => {
    const handleMatchFound = async () => {
        const offer = await createOffer()
        socket?.emit("offer-connection", { offer }) 
    }

    const handleIncommingRequest = async ({offer}:{offer:RTCSessionDescriptionInit})=>{
      const answer = await createAnswer(offer)  
      socket?.emit("answer",{answer})
      setStatus("connected")
    }

    const manageIncommingOfferAnswer = async ({answer}:{answer:RTCSessionDescriptionInit})=>{
        await handleIncommingAnswer(answer)
        setStatus("connected");
    }


    socket?.on("incomming-offer-connection",(offer)=>{
        handleIncommingRequest(offer)
    })
    

    socket?.on("answer-reply", manageIncommingOfferAnswer)
    socket?.on("match-found", handleMatchFound)

    socket?.on("new-message", ({ message }: { message: string }) => {
      setMessages(prev => [...prev, { content: message, fromSelf: false }])
    })
    socket?.on("partner-disconnected", () => {
      setStatus("disconnected")
      setMessages([])
    })

    socket?.on("online-users", setNoOfOnline)

    // socket?.on("peer:nego:needed", handleNegoNeedIncomming);
    // socket?.on("peer:nego:final", handleNegoNeedFinal);
    return () => {
      socket?.off("match-found")
      socket?.off("new-message")
      socket?.off("partner-disconnected")
      socket?.off("online-users")
      socket?.off("offer-connection")
      socket?.off("incomming-offer-connection")
      socket?.off("answer-reply")
      socket?.off("peer:nego:needed")
      socket?.off("peer:nego:final")
    }
  }, [socket,status,createOffer,createAnswer,handleIncommingAnswer,,peer,myStream])

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="container mx-auto py-10 px-6">
        <h1 className="text-4xl font-bold text-center mb-10 text-white">Anonygle</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="w-full flex flex-col">
        <div className="relative w-full aspect-video bg-black rounded-2xl shadow-xl overflow-hidden mb-6 h-[500px]">        
        {remoteStream && (
        
        <ReactPlayer
          url={remoteStream}
          playing
          muted={false}
          width="100%"
          height="100%"
          className="absolute inset-0 object-cover"
        />
      )} 
        {myStream && (
        <div className="absolute bottom-4 right-4 w-60 h-48 z-10 border-2 border-white rounded-md overflow-hidden shadow-md">
          <ReactPlayer
            url={myStream}
            muted
            playing
            width="100%"
            height="100%"
          />
        </div>
    )}

        <div className="absolute top-6 left-6 flex items-center space-x-2">
          <div
            className={cn(
              "h-3 w-3 rounded-full",
              status === "idle" && "bg-gray-400",
              status === "waiting" && "bg-yellow-400",
              status === "connected" && "bg-green-400",
              status === "error" && "bg-red-500",
              status === "disconnected" && "bg-gray-400"
            )}
          />
          <span className="text-white font-medium text-sm sm:text-base">
            {status === "idle" && "Disconnected"}
            {status === "waiting" && "Connecting..."}
            {status === "connected" && "Connected"}
            {status === "error" && "Error"}
            {status === "disconnected" && "Disconnected"}
          </span>
        </div>

        <div className="absolute top-6 right-6 bg-gray-900 bg-opacity-60 px-4 py-2 rounded-full">
          <span className="text-white text-sm sm:text-base">
            {noOffOnline} users online
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-6 mb-6">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 bg-gray-800 border-gray-700 text-white hover:bg-gray-700 text-lg py-5"
          onClick={disconnectChat}
        >
          <VideoOff className="mr-3 h-6 w-6" />
          Stop
        </Button>

        <Button
          size="lg"
          className="flex-1 bg-red-600 hover:bg-red-700 text-white text-lg py-5"
          onClick={nextChat}
        >
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
