export type ChatStatus = "idle" | "waiting" | "connected" | "disconnected" | "error"

export interface Message {
  content: string
  fromSelf: boolean
  timestamp?: Date
}

export interface User {
  id: string
  name?: string
  avatar?: string
}
