
import { cn } from "@/lib/utils"
import { ChatStatus } from "../../typings/base.typings"

interface StatusBarProps {
  status: ChatStatus
  error: string | null
}

export function StatusBar({ status, error }: StatusBarProps) {
  return (
    <div className="bg-gray-800 text-white p-3 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div
          className={cn(
            "h-3 w-3 rounded-full",
            status === "idle" && "bg-gray-400",
            status === "waiting" && "bg-yellow-400",
            status === "connected" && "bg-green-400",
            status === "error" && "bg-red-400",
          )}
        />
        <span className="font-medium">
          {status === "idle" && "Disconnected"}
          {status === "waiting" && "Connecting..."}
          {status === "connected" && "Connected"}
          {status === "error" && "Error"}
        </span>
      </div>

      {error && <div className="text-red-300 text-sm">{error}</div>}
    </div>
  )
}
