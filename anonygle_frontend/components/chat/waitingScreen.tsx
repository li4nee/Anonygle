"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

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
    <div className="flex flex-col items-center justify-center h-full p-6 space-y-6 bg-gradient-to-b from-gray-50 to-gray-100">
      <Loader2 className="h-12 w-12 text-red-600 animate-spin" />
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-800">
          Finding someone to chat with{dots}
        </h3>
        <p className="text-gray-600 mt-2">This may take a moment</p>
      </div>
      <button
        onClick={onCancel}
        className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full font-medium transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}
