"use client"
import { useEffect, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"

export default function useSocketIo() {
  const websocket = "http://localhost:4000"
  const socketRef = useRef<Socket | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const socket = io(websocket, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketRef.current = socket

    const onConnect = () => {
      setConnected(true)
    }

    const onDisconnect = () => {
      setConnected(false)
    }

    const onError = (err:Error) => {
      console.log("Socket error:", err)
    }
    
    socket.io.on("reconnect_attempt", () => {
      console.log("Trying to reconnect")
    })

    socket.io.on("reconnect_failed", () => {
      console.log("Reconnection failed.")
    })
    
    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)
    socket.on("connect_error", onError)
    socket.on("error", onError)

    
    return () => {
      socket.disconnect()
      setConnected(false)
    }
  }, [])

  return { socket: socketRef.current, connected }
}
