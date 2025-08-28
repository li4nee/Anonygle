"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WaitingScreenProps {
  onCancel: () => void;
}

export function WaitingScreen({ onCancel }: WaitingScreenProps) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 space-y-6 bg-gradient-to-br from-background to-card">
      <div className="relative">
        <Loader2 className="h-16 w-16 text-primary animate-spin glow-red" />
        <div className="absolute inset-0 h-16 w-16 border-2 border-primary/20 rounded-full animate-ping" />
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-foreground">
          Finding someone to chat with{dots}
        </h3>
        <p className="text-muted-foreground">This may take a moment</p>
      </div>

      <Button
        onClick={onCancel}
        variant="outline"
        className="mt-4 px-6 py-2 border-border hover:bg-secondary transition-colors bg-transparent"
      >
        <X className="h-4 w-4 mr-2" />
        Cancel
      </Button>
    </div>
  );
}
