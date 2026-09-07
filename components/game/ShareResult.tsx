"use client";

import { useState, useCallback } from "react";
import { Share2, Copy, Check } from "lucide-react";
import type { GameState } from "@/lib/game/types";

interface ShareResultProps {
  gameState: GameState;
}

export function ShareResult({ gameState }: ShareResultProps) {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  const buildShareText = useCallback(async (): Promise<string> => {
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: gameState.sessionId }),
      });
      if (!res.ok) throw new Error("Share failed");
      const data = await res.json() as { shareText: string };
      return data.shareText;
    } catch {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://tunebit.zeusserver.in";
      const emoji = gameState.status === "won" ? "🎵" : "❌";
      return `TuneBit\n${emoji} ${gameState.attemptsUsed}/6\n${appUrl}`;
    }
  }, [gameState]);

  const handleShare = useCallback(async () => {
    setSharing(true);
    try {
      const text = await buildShareText();
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ text, title: "TuneBit" });
      } else {
        await handleCopy(text);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("[ShareResult]", err);
      }
    } finally {
      setSharing(false);
    }
  }, [buildShareText]);

  const handleCopy = useCallback(async (text?: string) => {
    const shareText = text ?? (await buildShareText());
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  }, [buildShareText]);

  const canNativeShare =
    typeof navigator !== "undefined" && "share" in navigator;

  return (
    <div className="flex gap-2 w-full">
      {canNativeShare ? (
        <button
          onClick={handleShare}
          disabled={sharing}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all"
        >
          <Share2 className="w-4 h-4" aria-hidden />
          {sharing ? "Sharing…" : "Share Result"}
        </button>
      ) : (
        <button
          onClick={() => void handleCopy()}
          disabled={sharing}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" aria-hidden />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" aria-hidden />
              Copy Result
            </>
          )}
        </button>
      )}
    </div>
  );
}
