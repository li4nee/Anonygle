import { Button } from "@/components/ui/button";
import React from "react";

export default function VideoOffErrorPage() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-800/50 backdrop-blur-sm z-50">
      <div className="bg-card border border-border rounded-xl p-6 max-w-md shadow-2xl text-center relative z-10">
        <h2 className="text-xl font-semibold text-destructive mb-3">
          Camera & Microphone Blocked
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Please allow camera and microphone access in your browser settings and
          refresh the page. <br />
          <span className="font-medium">
            Don’t worry — you can mute your mic or turn off your video anytime
            after joining the call.
          </span>
        </p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    </div>
  );
}
