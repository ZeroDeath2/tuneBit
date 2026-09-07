"use client";

import { create } from "zustand";
import type { GameState } from "@/lib/game/types";

interface GameStore {
  gameState: GameState | null;
  isLoading: boolean;
  isSubmitting: boolean;
  pendingGuessId: string | null;
  streamUrl: string | null;
  practicePlayedIds: Set<string>;

  setGameState: (state: GameState | null) => void;
  setLoading: (v: boolean) => void;
  setSubmitting: (v: boolean) => void;
  setPendingGuessId: (id: string | null) => void;
  setStreamUrl: (url: string | null) => void;
  addPracticePlayedId: (id: string) => void;
  resetPracticePool: () => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: null,
  isLoading: false,
  isSubmitting: false,
  pendingGuessId: null,
  streamUrl: null,
  practicePlayedIds: new Set(),

  setGameState: (state) => set({ gameState: state }),
  setLoading: (v) => set({ isLoading: v }),
  setSubmitting: (v) => set({ isSubmitting: v }),
  setPendingGuessId: (id) => set({ pendingGuessId: id }),
  setStreamUrl: (url) => set({ streamUrl: url }),
  addPracticePlayedId: (id) =>
    set((s) => ({ practicePlayedIds: new Set([...s.practicePlayedIds, id]) })),
  resetPracticePool: () => set({ practicePlayedIds: new Set() }),
  reset: () =>
    set({
      gameState: null,
      isLoading: false,
      isSubmitting: false,
      pendingGuessId: null,
      streamUrl: null,
    }),
}));
