"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import type { DailyGauntletInfo } from "@/lib/game/types";
import { getLocalStorageKey } from "@/lib/utils";

interface GauntletOption {
  gauntletId: string;
  language: string;
  date: string;
}

interface HomeTilesProps {
  isSignedIn?: boolean;
}

export function HomeTiles({ isSignedIn = false }: HomeTilesProps) {
  const router = useRouter();
  const [gauntlets, setGauntlets] = useState<GauntletOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Record<string, { totalScore: number }>>({});

  useEffect(() => {
    const fetchGauntlets = async () => {
      try {
        const res = await fetch("/api/daily");
        if (!res.ok) throw new Error("Failed to load gauntlets");
        const data = await res.json();
        setGauntlets(data.gauntlets);

        // Check local storage for completed states
        const today = new Date().toISOString().slice(0, 10);
        const comp: Record<string, { totalScore: number }> = {};
        
        data.gauntlets.forEach((g: GauntletOption) => {
          const key = getLocalStorageKey("daily", today, g.language);
          const saved = localStorage.getItem(key);
          if (saved) {
            const parsed = JSON.parse(saved);
            // If round 3 is completed, or game is otherwise done
            if (parsed.status !== "playing" && parsed.roundNumber === 3) {
              comp[g.language] = { totalScore: parsed.totalScore ?? 0 };
            }
          }
        });
        setCompleted(comp);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading");
      } finally {
        setLoading(false);
      }
    };
    void fetchGauntlets();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-destructive">
        {error}
      </div>
    );
  }

  const getLabel = (lang: string) => {
    if (lang === "all") return "All Languages";
    return lang.charAt(0).toUpperCase() + lang.slice(1);
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Daily Gauntlet</h1>
        <p className="text-muted-foreground">3 Songs. 18 Attempts. Pick your challenge.</p>
      </div>

      {!isSignedIn && (
        <div className="flex items-center justify-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-900 mx-auto max-w-lg text-center">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p>Sign in to save your scores to the leaderboard and track your stats!</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {gauntlets.map((g) => {
          const isCompleted = !!completed[g.language];
          const score = completed[g.language]?.totalScore;

          return (
            <button
              key={g.gauntletId}
              onClick={() => {
                if (!isCompleted) {
                  router.push(`/play/${g.language}`);
                }
              }}
              className={`relative flex flex-col items-center justify-center p-8 rounded-xl border-2 transition-all text-left ${
                isCompleted 
                  ? "border-correct/50 bg-correct/5 cursor-default" 
                  : "border-border hover:border-primary hover:bg-accent cursor-pointer group"
              }`}
            >
              <h2 className="text-xl font-bold mb-2">{getLabel(g.language)}</h2>
              
              {isCompleted ? (
                <div className="flex flex-col items-center text-correct font-medium">
                  <span className="flex items-center gap-1 bg-correct text-white text-xs px-2 py-1 rounded-full uppercase tracking-wider mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Completed
                  </span>
                  <span className="text-lg">{score} / 300</span>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  Play Now →
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
