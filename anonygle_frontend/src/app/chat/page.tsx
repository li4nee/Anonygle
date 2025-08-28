"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { VideoOff, SkipForward, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatStatus, Message } from "../../typings/base.typings";
import { cn } from "@/lib/utils";
import { useSocket } from "@/context/socket.context";
import ChatInterface from "@/components/components/chat/chatinterface";
import { useWebRTC } from "@/context/webrtc.context";
import { VideoPlaceholder } from "@/components/components/webrtc/video-placeholder";
import { VideoControls } from "@/components/components/webrtc/videocontrols";

export default function ChatPage() {
  const { socket } = useSocket();
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [noOfOnline, setNoOfOnline] = useState(0);

  const {
    peer,
    createOffer,
    createAnswer,
    handleIncommingAnswer,
    remoteStream,
    myStream,
    closeConnection,
    initPeerConnection,
    resetPeer
  } = useWebRTC();

  // Refs for video elements
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const hasLocalVideo = !!myStream;
  const hasRemoteVideo = !!remoteStream;

  useEffect(() => {
    if (localVideoRef.current && myStream) {
      localVideoRef.current.srcObject = myStream;
    }
  }, [myStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const startChat = () => {
    socket?.emit("start-match-making");
    setStatus("waiting");
  };

  const disconnectChat = async () => {
    await closeConnection();
    await initPeerConnection();
    socket?.emit("disconnect-match-making");
    setMessages([]);
    setStatus("idle");
  };

  const nextChat = async () => {
    await closeConnection();
    await initPeerConnection();
    socket?.emit("next-match-making");
    setMessages([]);
    setStatus("waiting");
  };

  const sendMessage = (text: string) => {
    socket?.emit("message", text);
    setMessages((prev) => [...prev, { content: text, fromSelf: true }]);
  };

  const handleNegoNeeded = useCallback(async () => {
    const offer = await createOffer();
    if (offer) socket?.emit("peer:nego:needed", { offer });
  }, [socket, createOffer]);

  useEffect(() => {
    if (!peer) return;
    peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded, peer]);

  const handleNegoNeedIncomming = useCallback(
    async ({ offer }: { offer: RTCSessionDescriptionInit }) => {
      const ans = await createAnswer(offer);
      if (ans) socket?.emit("peer:nego:done", { ans });
    },
    [socket, createAnswer]
  );

  const handleNegoNeedFinal = useCallback(
    async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      await handleIncommingAnswer(answer);
    },
    [handleIncommingAnswer]
  );

  useEffect(() => {
    const handleMatchFound = async () => {
      const offer = await createOffer();
      if (offer) socket?.emit("offer-connection", { offer });
    };

    const handleIncommingRequest = async ({
      offer,
    }: {
      offer: RTCSessionDescriptionInit;
    }) => {
      const answer = await createAnswer(offer);
      if (answer) {
        socket?.emit("answer", { answer });
        setStatus("connected");
      }
    };

    const manageIncommingOfferAnswer = async ({
      answer,
    }: {
      answer: RTCSessionDescriptionInit;
    }) => {
      await handleIncommingAnswer(answer);
      setStatus("connected");
    };

    socket?.on("incomming-offer-connection", (offer) => {
      handleIncommingRequest(offer);
    });

    socket?.on("answer-reply", manageIncommingOfferAnswer);
    socket?.on("match-found", handleMatchFound);

    socket?.on("new-message", ({ message }: { message: string }) => {
      setMessages((prev) => [...prev, { content: message, fromSelf: false }]);
    });
    socket?.on("partner-disconnected", () => {
      setStatus("disconnected");
      resetPeer();
    });

    socket?.on("online-users", setNoOfOnline);
    socket?.on("peer:nego:needed", handleNegoNeedIncomming);
    socket?.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket?.off("match-found");
      socket?.off("new-message");
      socket?.off("partner-disconnected");
      socket?.off("online-users");
      socket?.off("offer-connection");
      socket?.off("incomming-offer-connection");
      socket?.off("answer-reply");
      socket?.off("peer:nego:needed");
      socket?.off("peer:nego:final");
    };
  }, [
    socket,
    status,
    createOffer,
    createAnswer,
    handleIncommingAnswer,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
    peer,
    myStream,
    resetPeer,
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card gradient-mesh">
      <div className="container mx-auto py-8 px-6">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-foreground mb-2 text-glow">
            Anonygle
          </h1>
          <p className="text-muted-foreground">Anonymous video chat platform</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="w-full flex flex-col">
            <div className="relative w-full aspect-video bg-card rounded-2xl shadow-2xl overflow-hidden mb-6 h-[500px] border-2 border-border glow-red">
              {hasRemoteVideo ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <VideoPlaceholder type="remote" userName="Anonymous User" />
              )}

              <div className="absolute bottom-4 right-4 w-60 h-48 z-10 border-2 border-primary rounded-lg overflow-hidden shadow-lg glow-red">
                {hasLocalVideo ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full"
                  />
                ) : (
                  <VideoPlaceholder type="local" />
                )}
              </div>

              <div className="absolute top-6 left-6 flex items-center space-x-3 bg-card/80 backdrop-blur-sm rounded-full px-4 py-2 border border-border">
                <div
                  className={cn(
                    "h-3 w-3 rounded-full transition-all",
                    status === "idle" && "bg-muted-foreground",
                    status === "waiting" && "bg-yellow-500 animate-pulse",
                    status === "connected" && "bg-green-500 glow-red",
                    status === "error" && "bg-destructive glow-red-strong",
                    status === "disconnected" && "bg-muted-foreground"
                  )}
                />
                <span className="text-foreground font-medium text-sm">
                  {status === "idle" && "Disconnected"}
                  {status === "waiting" && "Connecting..."}
                  {status === "connected" && "Connected"}
                  {status === "error" && "Error"}
                  {status === "disconnected" && "Disconnected"}
                </span>
              </div>

              <div className="absolute top-6 right-6 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border">
                <div className="flex items-center space-x-2">
                  <Wifi className="h-4 w-4 text-primary" />
                  <span className="text-foreground text-sm font-medium">
                    {noOfOnline} online
                  </span>
                </div>
              </div>

              {status === "connected" && (
                <div className="absolute bottom-4 left-4">
                  <VideoControls myStream={myStream} remoteStream={remoteStream} />
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-6 mb-6">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 bg-card border-border text-foreground hover:bg-secondary text-lg py-6 transition-all"
                onClick={disconnectChat}
              >
                <VideoOff className="mr-3 h-6 w-6" />
                Stop
              </Button>
              <Button
                size="lg"
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6 glow-red transition-all"
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
              onlineCount={noOfOnline}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
