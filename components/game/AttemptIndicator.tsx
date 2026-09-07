"use client";

import { cn } from "@/lib/utils";
import { Check, X, FastForward } from "lucide-react";
import { MAX_ATTEMPTS } from "@/lib/game/reveal-stages";
import type { Guess } from "@/lib/game/types";

interface AttemptIndicatorProps {
  attemptsUsed: number;
  guesses: Guess[];
}

export function AttemptIndicator({ attemptsUsed, guesses }: AttemptIndicatorProps) {
  const remaining = MAX_ATTEMPTS - attemptsUsed;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1.5" role="group" aria-label={`Attempts: ${attemptsUsed} used, ${remaining} remaining`}>
        {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => {
          const guess = guesses[i];
          const isUsed = i < attemptsUsed;

          let status: "correct" | "incorrect" | "skip" | "unused" | "future" = "future";
          if (isUsed && guess) {
            if (guess.correct) status = "correct";
            else if (guess.type === "skip") status = "skip";
            else status = "incorrect";
          } else if (isUsed) {
            status = "unused";
          }

          return (
            <div
              key={i}
              aria-label={
                status === "future"
                  ? `Attempt ${i + 1}: available`
                  : status === "correct"
                  ? `Attempt ${i + 1}: correct`
                  : status === "skip"
                  ? `Attempt ${i + 1}: skipped`
                  : `Attempt ${i + 1}: incorrect`
              }
              className={cn(
                "w-7 h-7 sm:w-8 sm:h-8 rounded-sm border-2 transition-all flex items-center justify-center",
                status === "correct" && "bg-correct border-correct text-primary-foreground",
                status === "incorrect" && "bg-incorrect border-incorrect text-destructive-foreground",
                status === "skip" && "bg-skipped border-skipped text-foreground",
                status === "unused" && "bg-muted border-muted",
                status === "future" && "bg-transparent border-border"
              )}
            >
              {status === "correct" && <Check className="w-4 h-4 sm:w-5 sm:h-5" />}
              {status === "incorrect" && <X className="w-4 h-4 sm:w-5 sm:h-5" />}
              {status === "skip" && <FastForward className="w-4 h-4 sm:w-5 sm:h-5" />}
            </div>
          );
        })}
      </div>
      <p className="text-base text-muted-foreground mt-1">
        <span className="font-semibold text-foreground">{remaining}</span>{" "}
        attempt{remaining !== 1 ? "s" : ""} remaining
      </p>
    </div>
  );
}
