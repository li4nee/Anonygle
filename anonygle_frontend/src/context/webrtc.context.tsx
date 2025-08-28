"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
  useRef,
} from "react";
import { useSocket } from "./socket.context";

type WebRTCContextType = {
  peer: RTCPeerConnection | null;
  createOffer: () => Promise<RTCSessionDescriptionInit | null>;
  createAnswer: (
    offer: RTCSessionDescriptionInit
  ) => Promise<RTCSessionDescriptionInit | undefined>;
  handleIncommingAnswer: (answer: RTCSessionDescriptionInit) => Promise<void>;
  myStream: MediaStream | null;
  remoteStream: MediaStream | null;
};

const WebRTCContext = createContext<WebRTCContextType | null>(null);

export const WebRTCProvider = ({ children }: { children: React.ReactNode }) => {
  const [peer, setPeer] = useState<RTCPeerConnection | null>(null);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const { socket } = useSocket();
  const remoteDescriptionSet = useRef(false);

  const createPeerConnection = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
      ],
    });
    const resetPeer = () => {
      if (peer) {
        peer.close();
      }
      setPeer(null);
      setMyStream(null);
      setRemoteStream(null);
      remoteDescriptionSet.current = false;
    };
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.emit("ice-candidate", { candidate: event.candidate });
      }
    };
    peer.ontrack = (event) => {
      const remoteStream = event.streams[0];
      if (remoteStream) {
        setRemoteStream(remoteStream);
      } else {
        console.error("No remote stream found");
      }
    };
    peer.onconnectionstatechange = () => {
      if (
        peer?.connectionState === "disconnected" ||
        peer?.connectionState === "closed"
      ) {
        resetPeer();
      }
    };
    peer.oniceconnectionstatechange = () => {
      if (
        peer?.iceConnectionState === "disconnected" ||
        peer?.iceConnectionState === "closed"
      ) {
        resetPeer();
      }
    };
    peer.onicegatheringstatechange = () => {
      if (
        peer?.iceGatheringState === "complete" &&
        !remoteDescriptionSet.current
      ) {
        console.warn("ICE gathering complete but remote description not set");
      }
    };
    if (stream) {
      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });
    }
    return peer;
  }, [socket]);

  useEffect(() => {
    const setupPeer = async () => {
      if (typeof window !== "undefined") {
        const newPeer = await createPeerConnection();
        setPeer(newPeer);
      }
    };

    setupPeer();
  }, [createPeerConnection]);

  const createOffer = useCallback(async () => {
    if (!peer) return null;
    const offer = await peer.createOffer();
    await peer.setLocalDescription(new RTCSessionDescription(offer));
    return offer;
  }, [peer]);

  const createAnswer = useCallback(
    async (offer: RTCSessionDescriptionInit) => {
      if (!peer) return undefined;
      if (remoteDescriptionSet.current) return undefined;
      await peer.setRemoteDescription(offer);
      remoteDescriptionSet.current = true;
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(new RTCSessionDescription(answer));
      return answer;
    },
    [peer]
  );

  const handleIncommingAnswer = useCallback(
    async (answer: RTCSessionDescriptionInit) => {
      if (!peer) return;
      if (!remoteDescriptionSet.current)
        await peer.setRemoteDescription(new RTCSessionDescription(answer));
      else
        console.warn(
          "Remote description already set, ignoring incoming answer"
        );
      remoteDescriptionSet.current = true;
    },
    [peer]
  );

  const addIceCandidate = useCallback(
    async (candidate: RTCIceCandidateInit) => {
      if (!peer) return;
      try {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    },
    [peer]
  );

  useEffect(() => {
    const handleRemoteIceCandidate = (data: {
      candidate: RTCIceCandidateInit;
    }) => {
      if (!remoteDescriptionSet.current)
        return console.warn(
          "Cannot add ICE candidate before remote description is set"
        );
      const { candidate } = data;
      if (!candidate) return;
      if (candidate.sdpMid !== null && candidate.sdpMid !== undefined) {
        addIceCandidate(candidate);
      } else if (
        candidate.sdpMLineIndex !== null &&
        candidate.sdpMLineIndex !== undefined
      ) {
        addIceCandidate(candidate);
      }
    };

    socket?.on("ice-candidate", handleRemoteIceCandidate);

    return () => {
      socket?.off("ice-candidate", handleRemoteIceCandidate);
    };
  }, [socket, addIceCandidate]);

  return (
    <WebRTCContext.Provider
      value={{
        peer,
        createOffer,
        createAnswer,
        handleIncommingAnswer,
        myStream,
        remoteStream,
      }}
    >
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