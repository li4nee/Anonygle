import { ChatStatus } from "../../typings/base.typings"

interface StatusBarProps {
  status: ChatStatus
}

export function StatusBar({ status}: StatusBarProps) {
  const statusColor =
    status === "idle"
      ? "bg-gray-400"
      : status === "waiting"
      ? "bg-yellow-400"
      : status === "connected"
      ? "bg-green-400"
      : status === "error"
      ? "bg-red-400"
      : "bg-gray-500" // fallback for unknown

  const statusLabel =
    status === "idle"
      ? "Disconnected"
      : status === "waiting"
      ? "Connecting..."
      : status === "connected"
      ? "Connected"
      : status === "error"
      ? "Error"
      : "Unknown"

  return (
    <div className="bg-gray-800 text-white p-3 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className={`h-3 w-3 rounded-full ${statusColor}`} />
        <span className="font-medium">{statusLabel}</span>
      </div>

      {/* {error && <div className="text-red-300 text-sm">{error}</div>} */}
    </div>
  )
}
