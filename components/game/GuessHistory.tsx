"use client";

import { motion } from "framer-motion";
import { Check, X, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Guess } from "@/lib/game/types";
import { MAX_ATTEMPTS } from "@/lib/game/reveal-stages";

interface GuessHistoryProps {
  guesses: Guess[];
}

export function GuessHistory({ guesses }: GuessHistoryProps) {
  return (
    <ul className="w-full space-y-2" aria-label="Guess history">
      {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => {
        const guess = guesses[i];

        return (
          <li
            key={i}
            className={cn(
              "flex items-center px-4 rounded-xl text-base border h-[52px] transition-colors overflow-hidden",
              guess
                ? guess.correct
                  ? "bg-correct/10 border-correct/30 text-correct"
                  : guess.type === "skip"
                  ? "bg-skipped/10 border-skipped/30 text-skipped"
                  : "bg-incorrect/10 border-incorrect/30 text-incorrect"
                : "border-dashed border-border/50 bg-muted/20 text-muted-foreground/50"
            )}
          >
            {guess ? (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 w-full"
              >
                <span
                  className={cn(
                    "shrink-0 w-6 h-6 rounded-full flex items-center justify-center",
                    guess.correct
                      ? "bg-correct text-white"
                      : guess.type === "skip"
                      ? "bg-skipped text-white"
                      : "bg-incorrect text-white"
                  )}
                  aria-hidden
                >
                  {guess.correct ? (
                    <Check className="w-4 h-4" />
                  ) : guess.type === "skip" ? (
                    <SkipForward className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </span>

                <span className="flex-1 truncate font-medium">
                  {guess.type === "skip" ? (
                    <span className="italic text-muted-foreground">Skipped</span>
                  ) : (
                    <>
                      {guess.title ?? "Unknown"}{" "}
                      {guess.artist && (
                        <span className="font-normal text-muted-foreground">
                          — {guess.artist}
                        </span>
                      )}
                    </>
                  )}
                </span>

                <span className="sr-only">
                  {guess.correct
                    ? "Correct"
                    : guess.type === "skip"
                    ? "Skipped"
                    : "Incorrect"}
                  , attempt {guess.attemptNumber}
                </span>
              </motion.div>
            ) : (
              <div className="flex items-center gap-3 w-full opacity-60">
                <span
                  className="shrink-0 w-6 h-6 rounded-full border border-border/50 flex items-center justify-center text-xs font-medium"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <span className="flex-1 truncate italic text-sm">
                  Attempt {i + 1}
                </span>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
