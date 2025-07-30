export type ChatStatus =
  | "idle"
  | "waiting"
  | "connected"
  | "error"
  | "disconnected";

export type Message = {
  content: string;
  fromSelf: boolean;
};
