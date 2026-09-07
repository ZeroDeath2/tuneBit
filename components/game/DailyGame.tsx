"use client";

import { useEffect, useState } from "react";
import { GameBoard } from "./GameBoard";
import { useGame } from "@/hooks/useGame";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function DailyGame({ language = "all" }: { language?: string }) {
  const { startDailyGame, isLoading, gameState } = useGame();
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (initialized) return;
    setInitialized(true);

    const init = async () => {
      try {
        const res = await fetch(`/api/daily?language=${language}`);
        if (!res.ok) throw new Error("No daily gauntlet available");
        const data = await res.json() as { gauntletId: string; language: string };
        await startDailyGame(data.gauntletId, data.language);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load today's gauntlet");
      }
    };

    void init();
  }, [initialized, startDailyGame, language]);

  // If game is fully complete, redirect to home
  useEffect(() => {
    if (gameState?.status !== "playing" && gameState?.roundNumber === 3) {
      // Give a tiny delay so the user sees the final round screen if they just finished it
      // Actually, we want to let them see the summary, so we shouldn't auto-redirect here.
      // We will handle the redirect on a "Return Home" button in GameResult instead.
    }
  }, [gameState?.status, gameState?.roundNumber]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" aria-hidden />
        <p className="text-muted-foreground text-sm">Loading today's gauntlet…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 px-4">
        <p className="text-destructive font-medium">{error}</p>
        <button
          onClick={() => { setInitialized(false); setError(null); }}
          className="text-sm text-primary underline underline-offset-4"
        >
          Try again
        </button>
      </div>
    );
  }

  return <GameBoard />;
}
