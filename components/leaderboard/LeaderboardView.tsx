"use client";

import { useEffect, useState } from "react";
import { Trophy, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  rank: number;
  score: number;
  attempts: number;
  completedAt: string;
  displayName: string;
  avatarUrl: string | null;
}

type Window = "today" | "week" | "alltime";

export function LeaderboardView() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [window, setWindow] = useState<Window>("today");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetch(`/api/leaderboard?window=${window}`)
      .then((r) => {
        if (r.status === 401) throw new Error("Sign in to view the leaderboard");
        if (!r.ok) throw new Error("Failed to load leaderboard");
        return r.json() as Promise<{ entries: LeaderboardEntry[] }>;
      })
      .then((data) => setEntries(data.entries))
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [window]);

  return (
    <div className="space-y-4 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-2">
        <Trophy className="w-5 h-5 text-primary" aria-hidden />
        <h1 className="text-xl font-bold">Leaderboard</h1>
      </div>

      {/* Window tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg" role="tablist" aria-label="Leaderboard time window">
        {(["today", "week", "alltime"] as const).map((w) => (
          <button
            key={w}
            role="tab"
            aria-selected={window === w}
            onClick={() => setWindow(w)}
            className={cn(
              "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
              window === w
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {w === "today" ? "Today" : w === "week" ? "This Week" : "All Time"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" aria-hidden />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>{error}</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No entries yet for this period.</p>
        </div>
      ) : (
        <ol className="space-y-2" aria-label="Leaderboard rankings">
          {entries.map((entry) => (
            <li
              key={`${entry.rank}-${entry.displayName}`}
              className="flex items-center gap-3 px-4 py-3 rounded-lg border bg-card"
            >
              <span
                className={cn(
                  "w-7 h-7 shrink-0 flex items-center justify-center rounded-full text-sm font-bold",
                  entry.rank === 1 && "bg-yellow-400/20 text-yellow-600",
                  entry.rank === 2 && "bg-slate-300/30 text-slate-500",
                  entry.rank === 3 && "bg-amber-600/20 text-amber-700",
                  entry.rank > 3 && "bg-muted text-muted-foreground"
                )}
                aria-label={`Rank ${entry.rank}`}
              >
                {entry.rank}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{entry.displayName}</p>
                <p className="text-sm text-muted-foreground">
                  {entry.attempts} attempt{entry.attempts !== 1 ? "s" : ""}
                </p>
              </div>
              <span className="font-bold text-primary">{entry.score} pts</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
