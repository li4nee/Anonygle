import type { ChatStatus } from "../../../typings/base.typings"

interface StatusBarProps {
  status: ChatStatus
  onlineCount?: number
}

export function StatusBar({ status, onlineCount }: StatusBarProps) {
  const statusConfig = {
    idle: { color: "bg-muted-foreground", label: "Disconnected" },
    waiting: { color: "bg-yellow-500 animate-pulse", label: "Connecting..." },
    connected: { color: "bg-green-500 glow-red", label: "Connected" },
    error: { color: "bg-destructive glow-red-strong", label: "Connection Error" },
    disconnected: { color: "bg-muted-foreground", label: "Disconnected" },
  }

  const config = statusConfig[status] || statusConfig.idle

  return (
    <div className="bg-card border-b border-border p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className={`h-3 w-3 rounded-full ${config.color}`} />
        <span className="font-medium text-foreground">{config.label}</span>
      </div>

      {onlineCount !== undefined && (
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
          <span className="text-sm text-muted-foreground">{onlineCount} online</span>
        </div>
      )}
    </div>
  )
}
