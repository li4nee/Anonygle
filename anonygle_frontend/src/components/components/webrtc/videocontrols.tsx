"use client"

import { useState } from "react"
import { Mic, MicOff, Video, VideoOff, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VideoControlsProps {
  myStream: MediaStream | null
  remoteStream: MediaStream | null
  onToggleVideo?: () => void
  onToggleAudio?: () => void
}

export function VideoControls({ myStream, remoteStream, onToggleVideo, onToggleAudio }: VideoControlsProps) {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isRemoteAudioMuted, setIsRemoteAudioMuted] = useState(false)

  const toggleVideo = () => {
    if (myStream) {
      const videoTrack = myStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
        onToggleVideo?.()
      }
    }
  }

  const toggleAudio = () => {
    if (myStream) {
      const audioTrack = myStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
        onToggleAudio?.()
      }
    }
  }

  const toggleRemoteAudio = () => {
    if (remoteStream) {
      const audioTracks = remoteStream.getAudioTracks()
      audioTracks.forEach((track) => {
        track.enabled = isRemoteAudioMuted
      })
      setIsRemoteAudioMuted(!isRemoteAudioMuted)
    }
  }

  return (
    <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-lg p-2 border border-border">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleVideo}
        className={`h-10 w-10 p-0 rounded-full transition-all ${
          isVideoEnabled
            ? "bg-secondary hover:bg-secondary/80 text-foreground"
            : "bg-destructive hover:bg-destructive/80 text-destructive-foreground glow-red"
        }`}
      >
        {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={toggleAudio}
        className={`h-10 w-10 p-0 rounded-full transition-all ${
          isAudioEnabled
            ? "bg-secondary hover:bg-secondary/80 text-foreground"
            : "bg-destructive hover:bg-destructive/80 text-destructive-foreground glow-red"
        }`}
      >
        {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
      </Button>

      {remoteStream && (
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleRemoteAudio}
          className={`h-10 w-10 p-0 rounded-full transition-all ${
            !isRemoteAudioMuted
              ? "bg-secondary hover:bg-secondary/80 text-foreground"
              : "bg-destructive hover:bg-destructive/80 text-destructive-foreground glow-red"
          }`}
        >
          {!isRemoteAudioMuted ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>
      )}
    </div>
  )
}
