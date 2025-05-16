"use client";

import React, {createContext,useContext,useEffect,useCallback,useState} from "react";

type WebRTCContextType = {
  peer: RTCPeerConnection | null;
  createOffer: () => Promise<RTCSessionDescriptionInit | null>;
  createAnswer : (offer:RTCSessionDescriptionInit) => Promise<RTCSessionDescriptionInit | undefined>
  handleIncommingAnswer:(answer:RTCSessionDescriptionInit)=> Promise<void>
};

const WebRTCContext = createContext<WebRTCContextType | null>(null);

export const WebRTCProvider = ({ children }: { children: React.ReactNode }) => {
  const [peer, setPeer] = useState<RTCPeerConnection | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const newPeer = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
        ],
      });
      setPeer(newPeer);
    }
  }, []);

  const createOffer = useCallback(async () => {
    if (!peer) return null;
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    return offer;
  }, [peer]);

  const createAnswer =  useCallback(async (offer:RTCSessionDescriptionInit)=>{
    await peer?.setRemoteDescription(offer)
    const answer = await peer?.createAnswer()
    await peer?.setLocalDescription(answer)
    return answer
  },[peer])

  const handleIncommingAnswer = useCallback(async (answer:RTCSessionDescriptionInit)=>{
        await peer?.setRemoteDescription(answer)
  },[peer])

  return (
    <WebRTCContext.Provider value={{ peer, createOffer,createAnswer,handleIncommingAnswer }}>
      {children}
    </WebRTCContext.Provider>
  );
};

export const useWebRTC = (): WebRTCContextType => {
  const context = useContext(WebRTCContext);
  if (!context) {
    throw new Error("useWebRTC must be used inside WebRTCProvider");
  }
  return context;
};
