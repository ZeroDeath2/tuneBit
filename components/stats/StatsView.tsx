"use client";

import { useEffect, useState } from "react";
import { BarChart3, Loader2, Flame } from "lucide-react";

interface Stats {
  gamesPlayed: number;
  gamesWon: number;
  winPercentage: number;
  currentStreak: number;
  bestStreak: number;
  averageAttempts: number;
  distribution: Record<string, number>;
}

export function StatsView() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => {
        if (r.status === 401) throw new Error("Sign in to view your stats");
        if (!r.ok) throw new Error("Failed to load stats");
        return r.json() as Promise<Stats>;
      })
      .then(setStats)
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" aria-hidden />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>{error ?? "No stats available yet."}</p>
      </div>
    );
  }

  const maxDistValue = Math.max(1, ...Object.values(stats.distribution));

  return (
    <div className="space-y-6 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" aria-hidden />
        <h1 className="text-xl font-bold">Statistics</h1>
      </div>

      {/* Summary grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Played", value: stats.gamesPlayed },
          { label: "Win %", value: `${stats.winPercentage}%` },
          { label: "Current Streak", value: stats.currentStreak, icon: <Flame className="w-4 h-4 text-orange-400" aria-hidden /> },
          { label: "Best Streak", value: stats.bestStreak },
        ].map(({ label, value, icon }) => (
          <div key={label} className="flex flex-col items-center justify-center p-4 rounded-lg border bg-card gap-1">
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold">{value}</span>
              {icon}
            </div>
            <span className="text-xs text-muted-foreground text-center">{label}</span>
          </div>
        ))}
      </div>

      {/* Guess distribution */}
      <div className="space-y-2">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Gauntlet Total Attempts
        </h2>
        <div className="space-y-1.5" role="list" aria-label="Guess distribution chart">
          {["3-5", "6-8", "9-11", "12-14", "15-18", "X"].map((key) => {
            const count = stats.distribution[key] ?? 0;
            const widthPct = Math.max(4, (count / maxDistValue) * 100);
            return (
              <div key={key} className="flex items-center gap-2 text-sm" role="listitem">
                <span className="w-12 shrink-0 font-mono text-right mr-2">{key}</span>
                <div className="flex-1 relative h-6">
                  <div
                    className="h-full bg-primary/20 rounded-sm"
                    style={{ width: `${widthPct}%` }}
                    aria-hidden
                  />
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium">
                    {count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
