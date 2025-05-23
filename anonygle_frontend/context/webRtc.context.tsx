"use client";

import React, {createContext,useContext,useEffect,useCallback,useState, useRef} from "react";

type WebRTCContextType = {
  peer: RTCPeerConnection | null;
  createOffer: () => Promise<RTCSessionDescriptionInit | null>;
  createAnswer : (offer:RTCSessionDescriptionInit) => Promise<RTCSessionDescriptionInit | undefined>
  handleIncommingAnswer:(answer:RTCSessionDescriptionInit)=> Promise<void>
  addIceCandidate: (candidate: RTCIceCandidateInit) => Promise<void>;
  resetPeer: () => void;
};

const WebRTCContext = createContext<WebRTCContextType | null>(null);

export const WebRTCProvider = ({ children }: { children: React.ReactNode }) => {
  const [peer, setPeer] = useState<RTCPeerConnection | null>(null);
  const remoteDescriptionSet = useRef(false);
  const candidateQueue = useRef<RTCIceCandidateInit[]>([]);
  const createPeerConnection = () => {
    return new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
      ],
      iceTransportPolicy: 'all',
      iceCandidatePoolSize: 1
    });
  };
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const newPeer = createPeerConnection();
      setPeer(newPeer);
    }
  }, []);
  
  const resetPeer = () => {
    if (peer) {
      peer.getSenders().forEach(sender => peer.removeTrack(sender));
      peer.close();
    }
    const newPeer = createPeerConnection();
    setPeer(newPeer);
  };
  

  const createOffer = useCallback(async () => {
    if (!peer) return null;
    const offer = await peer.createOffer();
    await peer.setLocalDescription(new RTCSessionDescription(offer));
    return offer;
  }, [peer]);

  // const createAnswer =  useCallback(async (offer:RTCSessionDescriptionInit)=>{
  //   if (!peer) 
  //     return undefined;
  //   await peer?.setRemoteDescription(offer)
  //   const answer = await peer?.createAnswer()
  //   await peer?.setLocalDescription(new RTCSessionDescription(answer))
  //   return answer
  // },[peer])

  // const handleIncommingAnswer = useCallback(async (answer:RTCSessionDescriptionInit)=>{
  //   if (!peer)
  //     return
  //   await peer?.setRemoteDescription(answer)
  // },[peer])


  // const addIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
  //   if (!peer || !candidate || (!candidate.sdpMid && candidate.sdpMLineIndex === undefined)) {
  //     console.warn('Invalid ICE candidate rejected:', candidate);
  //     return;
  //   }
  //   try {
  //     await peer.addIceCandidate(new RTCIceCandidate(candidate));
  //   } catch (err) {
  //     console.error('ICE candidate add error:', err);
  //   }
  // }, [peer]);

  const createAnswer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    if (!peer) return undefined;
  
    await peer.setRemoteDescription(offer);
    remoteDescriptionSet.current = true;

    for (const candidate of candidateQueue.current) {
      try {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('Error adding queued ICE candidate:', err);
      }
    }
    candidateQueue.current = [];
  
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    return answer;
  }, [peer]);
  
  
  const handleIncommingAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    if (!peer) 
      return;
    await peer.setRemoteDescription(answer);
    remoteDescriptionSet.current = true;
    for (const candidate of candidateQueue.current) {
      await peer.addIceCandidate(new RTCIceCandidate(candidate));
    }
    candidateQueue.current = [];
  }, [peer]);
  
  const addIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    if (!peer || peer.connectionState === 'closed') 
      return;
    
    try {
      if (peer.remoteDescription && candidate.sdpMid && candidate.sdpMLineIndex !== undefined) {
        console.log(peer.remoteDescription);
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        candidateQueue.current.push(candidate);
      }
    } catch (error) {
      console.error('ICE candidate error:', error);
    }
  }, [peer]);

  

  return (
    <WebRTCContext.Provider value={{ peer, createOffer,createAnswer,handleIncommingAnswer,addIceCandidate,resetPeer }}>
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
