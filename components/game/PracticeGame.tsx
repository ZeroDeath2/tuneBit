"use client";

import { useEffect, useState } from "react";
import { GameBoard } from "./GameBoard";
import { useGame } from "@/hooks/useGame";
import { useUiStore } from "@/store/ui-store";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  { slug: "all", label: "All Genres" },
  { slug: "pop", label: "Pop" },
  { slug: "hiphop", label: "Hip-Hop" },
  { slug: "rock", label: "Rock" },
  { slug: "electronic", label: "Electronic" },
  { slug: "rnb", label: "R&B" },
];

const LANGUAGES = [
  { slug: "all", label: "All Languages" },
  { slug: "english", label: "English" },
  { slug: "malayalam", label: "Malayalam" },
];

const DIFFICULTIES = [
  { slug: "easy", label: "Easy" },
  { slug: "normal", label: "Normal" },
  { slug: "hard", label: "Hard" },
];

const getDiffClass = (slug: string, isActive: boolean) => {
  if (!isActive) return "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground";
  switch (slug) {
    case 'easy': return "bg-green-600 text-white shadow-md border-transparent";
    case 'hard': return "bg-red-600 text-white shadow-md border-transparent";
    case 'normal':
    default: return "bg-blue-600 text-white shadow-md border-transparent";
  }
};

const getLangClass = (slug: string, isActive: boolean) => {
  if (!isActive) return "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground";
  switch (slug) {
    case 'english': return "bg-blue-500 text-white shadow-sm border-transparent";
    case 'malayalam': return "bg-emerald-600 text-white shadow-sm border-transparent";
    case 'all':
    default: return "bg-primary text-primary-foreground shadow-sm border-transparent";
  }
};

const getCatClass = (slug: string, isActive: boolean) => {
  if (!isActive) return "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground";
  switch (slug) {
    case 'pop': return "bg-pink-500 text-white shadow-sm border-transparent";
    case 'hiphop': return "bg-orange-500 text-white shadow-sm border-transparent";
    case 'rock': return "bg-red-600 text-white shadow-sm border-transparent";
    case 'electronic': return "bg-cyan-500 text-white shadow-sm border-transparent";
    case 'rnb': return "bg-indigo-500 text-white shadow-sm border-transparent";
    case 'all':
    default: return "bg-primary text-primary-foreground shadow-sm border-transparent";
  }
};

export function PracticeGame() {
  const { startPracticeGame, isLoading } = useGame();
  const {
    activeCategory, setActiveCategory,
    activeLanguage, setActiveLanguage,
    activeDifficulty, setActiveDifficulty
  } = useUiStore();
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialized) return;
    setInitialized(true);
    void startPracticeGame(activeCategory, activeLanguage, activeDifficulty).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to load practice game");
    });
  }, [initialized, startPracticeGame, activeCategory, activeLanguage, activeDifficulty]);

  const handleCategoryChange = async (slug: string) => {
    const prevCategory = activeCategory;
    setActiveCategory(slug);
    setError(null);
    try {
      await startPracticeGame(slug, activeLanguage, activeDifficulty);
    } catch (err) {
      toast.error("Music of this genre not available at the moment");
      setActiveCategory(prevCategory);
    }
  };

  const handleLanguageChange = async (slug: string) => {
    const prevLanguage = activeLanguage;
    setActiveLanguage(slug);
    setError(null);
    try {
      await startPracticeGame(activeCategory, slug, activeDifficulty);
    } catch (err) {
      toast.error("Music of this language not available at the moment");
      setActiveLanguage(prevLanguage);
    }
  };

  const handleDifficultyChange = async (slug: string) => {
    const prevDifficulty = activeDifficulty;
    setActiveDifficulty(slug);
    setError(null);
    try {
      await startPracticeGame(activeCategory, activeLanguage, slug);
    } catch (err) {
      toast.error("Failed to change difficulty");
      setActiveDifficulty(prevDifficulty);
    }
  };

  const filtersHeader = (
    <div className="flex flex-col gap-4 items-start w-full">
      {/* Difficulty filter */}
      <div className="flex gap-2 justify-start flex-wrap" role="group" aria-label="Select difficulty">
        {DIFFICULTIES.map((diff) => (
          <button
            key={diff.slug}
            onClick={() => void handleDifficultyChange(diff.slug)}
            aria-pressed={activeDifficulty === diff.slug}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 border ${getDiffClass(diff.slug, activeDifficulty === diff.slug)}`}
          >
            {diff.label}
          </button>
        ))}
      </div>

      {/* Language filter */}
      <div className="flex gap-2 justify-start flex-wrap" role="group" aria-label="Select language">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.slug}
            onClick={() => void handleLanguageChange(lang.slug)}
            aria-pressed={activeLanguage === lang.slug}
            className={`shrink-0 px-3 py-1 rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 border ${getLangClass(lang.slug, activeLanguage === lang.slug)}`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 justify-start flex-wrap pb-1" role="group" aria-label="Select category">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => void handleCategoryChange(cat.slug)}
            aria-pressed={activeCategory === cat.slug}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 border ${getCatClass(cat.slug, activeCategory === cat.slug)}`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" aria-hidden />
          <p className="text-muted-foreground text-sm">Loading practice game…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 px-4">
          <p className="text-destructive font-medium">{error}</p>
          <button
            onClick={() => { setInitialized(false); setError(null); }}
            className="text-sm text-primary underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      ) : (
        <GameBoard header={filtersHeader} />
      )}
    </div>
  );
}
