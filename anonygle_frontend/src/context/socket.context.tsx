"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type SocketContextType = {
  socket: Socket | null;
  connected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io("http://localhost:4000", {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(socketInstance);

    socketInstance.on("connect", () => setConnected(true));
    socketInstance.on("disconnect", () => setConnected(false));
    socketInstance.on("connect_error", (err) =>
      console.log("Socket error:", err),
    );
    socketInstance.on("error", (err) => console.log("Socket error:", err));
    socketInstance.on("connect_timeout", (err) =>
      console.log("Socket connection timeout:", err),
    );
    socketInstance.io.on("reconnect_attempt", () => {
      console.log("Trying to reconnect");
    });

    socketInstance.io.on("reconnect_failed", () => {
      console.log("Reconnection failed.");
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
