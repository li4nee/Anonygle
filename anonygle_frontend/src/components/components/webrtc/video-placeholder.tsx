"use client"

import { User, VideoOff } from "lucide-react"

interface VideoPlaceholderProps {
  type: "local" | "remote"
  userName?: string
}

export function VideoPlaceholder({ type, userName }: VideoPlaceholderProps) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-card to-secondary flex flex-col items-center justify-center border-2 border-border rounded-lg">
      <div className="bg-primary/20 rounded-full p-6 mb-4 glow-red">
        <User className="h-12 w-12 text-primary" />
      </div>
      <div className="text-center">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <VideoOff className="h-4 w-4" />
          <span className="text-sm">Camera off</span>
        </div>
        <p className="text-foreground font-medium">{type === "local" ? "You" : userName || "Anonymous User"}</p>
      </div>
    </div>
  )
}
