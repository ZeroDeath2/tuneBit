"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShareResult } from "./ShareResult";
import type { GameState, SongReveal } from "@/lib/game/types";

interface GameResultProps {
  gameState: GameState;
  song: SongReveal | null;
  onPlayAgain?: () => void;
  onNextRound?: () => void;
}

export function GameResult({ gameState, song, onPlayAgain, onNextRound }: GameResultProps) {
  const router = useRouter();
  const won = gameState.status === "won";
  const isDaily = gameState.mode === "daily";
  const isFinalRound = gameState.roundNumber === 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full space-y-4"
    >
      {/* Result banner */}
      <div
        className={`text-center py-3 px-4 rounded-lg ${won ? "bg-correct/10 text-correct" : "bg-incorrect/10 text-incorrect"}`}
        role="status"
        aria-live="polite"
      >
        <p className="text-2xl font-bold">{won ? "🎉 Got it!" : "❌ Not this time"}</p>
        {won && gameState.score !== undefined && (
          <p className="text-sm mt-1 opacity-80">
            {gameState.attemptsUsed} attempt{gameState.attemptsUsed !== 1 ? "s" : ""} ·{" "}
            {gameState.score} point{gameState.score !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Song reveal */}
      {song && (
        <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
          {song.artworkUrl && (
            <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden relative">
              <Image
                src={song.artworkUrl}
                alt={`Album art for ${song.title}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-bold text-base truncate">{song.title}</p>
            <p className="text-muted-foreground text-sm truncate">{song.artist}</p>
            {song.album && (
              <p className="text-muted-foreground text-sm truncate italic">{song.album}</p>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2">
        {(!isDaily || isFinalRound) && <ShareResult gameState={gameState} />}
        
        {onPlayAgain && (
          <button
            onClick={onPlayAgain}
            className="w-full py-2.5 px-4 rounded-lg border text-sm font-medium hover:bg-accent transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Play Again (Practice)
          </button>
        )}

        {onNextRound && (
          <button
            onClick={onNextRound}
            className="w-full py-2.5 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Start Next Song
          </button>
        )}

        {isDaily && isFinalRound && (
          <button
            onClick={() => router.push("/")}
            className="w-full py-2.5 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Return to Dashboard
          </button>
        )}
      </div>
    </motion.div>
  );
}
