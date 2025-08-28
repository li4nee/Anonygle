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
  closeConnection: () => Promise<void>;
  resetPeer: () => Promise<void>; 
  initPeerConnection: () => Promise<void>;
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

    const newPeer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
      ],
    });

    newPeer.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.emit("ice-candidate", { candidate: event.candidate });
      }
    };

    newPeer.ontrack = (event) => {
      const remoteStream = event.streams[0];
      if (remoteStream) {
        setRemoteStream(remoteStream);
      } else {
        console.error("No remote stream found");
      }
    };

    newPeer.onconnectionstatechange = () => {
      if (
        newPeer.connectionState === "disconnected" ||
        newPeer.connectionState === "closed"
      ) {
        resetPeer();
      }
    };

    newPeer.oniceconnectionstatechange = () => {
      if (
        newPeer.iceConnectionState === "disconnected" ||
        newPeer.iceConnectionState === "closed"
      ) {
        resetPeer();
      }
    };

    newPeer.onicegatheringstatechange = () => {
      if (
        newPeer.iceGatheringState === "complete" &&
        !remoteDescriptionSet.current
      ) {
        console.warn("ICE gathering complete but remote description not set");
      }
    };

    if (stream) {
      stream.getTracks().forEach((track) => {
        newPeer.addTrack(track, stream);
      });
    }

    return newPeer;
  }, [socket]);

  const resetPeer = useCallback(async () => {
    if (peer) {
      peer.close();
    }
    setPeer(null);
    // Do NOT clear local stream here, so your camera stays live
    setRemoteStream(null);
    remoteDescriptionSet.current = false;
  }, [peer]);

  const stopLocalStream = useCallback(() => {
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
    }
    setMyStream(null);
  }, [myStream]);

  const closeConnection = useCallback(async () => {
    await resetPeer();
    stopLocalStream();
  }, [resetPeer, stopLocalStream]);

  // Initialization to create peer connection on demand
  const initPeerConnection = useCallback(async () => {
    const newPeer = await createPeerConnection();
    setPeer(newPeer);
  }, [createPeerConnection]);

  // Setup peer connection once at mount
  useEffect(() => {
    initPeerConnection();
  }, [initPeerConnection]);

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
        closeConnection,
        resetPeer,
        initPeerConnection,
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
