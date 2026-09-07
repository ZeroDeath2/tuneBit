"use client";

import { useCallback } from "react";
import { useGameStore } from "@/store/game-store";
import { getLocalStorageKey } from "@/lib/utils";
import type { GameState } from "@/lib/game/types";

export function useGame() {
  const {
    gameState,
    isLoading,
    isSubmitting,
    streamUrl,
    setGameState,
    setLoading,
    setSubmitting,
    setStreamUrl,
  } = useGameStore();

  const startDailyGame = useCallback(
    async (gauntletId: string, language: string) => {
      setLoading(true);
      try {
        const storageKey = getLocalStorageKey(
          "daily",
          new Date().toISOString().slice(0, 10),
          language
        );
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved) as GameState;
          setGameState(parsed);
          await fetchStreamUrl(parsed.sessionId);
          return;
        }

        const res = await fetch("/api/game/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "daily", language, gauntletId }),
        });
        if (!res.ok) throw new Error("Failed to start game");
        const data = await res.json() as GameState;
        setGameState(data);
        localStorage.setItem(storageKey, JSON.stringify(data));
        await fetchStreamUrl(data.sessionId);
      } catch (err) {
        console.error("[useGame.startDailyGame]", err);
      } finally {
        setLoading(false);
      }
    },
    [setGameState, setLoading]
  );

  const startPracticeGame = useCallback(
    async (category = "all", language = "all", difficulty = "normal") => {
      setLoading(true);
      try {
        const res = await fetch("/api/game/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "practice", category, language, difficulty }),
        });
        if (!res.ok) throw new Error("Failed to start game");
        const data = await res.json() as GameState;
        setGameState(data);
        await fetchStreamUrl(data.sessionId);
      } catch (err) {
        console.error("[useGame.startPracticeGame]", err);
      } finally {
        setLoading(false);
      }
    },
    [setGameState, setLoading]
  );

  const fetchStreamUrl = useCallback(
    async (sessionId: string) => {
      try {
        const res = await fetch(`/api/game/${sessionId}/stream`);
        if (!res.ok) return;
        const { streamUrl: url } = await res.json() as { streamUrl: string };
        setStreamUrl(url);
      } catch {
        // Stream fetch failed silently; AudioPlayer will show error state
      }
    },
    [setStreamUrl]
  );

  const submitGuess = useCallback(
    async (songId: string) => {
      if (!gameState || isSubmitting) return;
      setSubmitting(true);
      try {
        const res = await fetch("/api/game/guess", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: gameState.sessionId, songId }),
        });
        if (!res.ok) {
          const { error } = await res.json() as { error: string };
          throw new Error(error);
        }
        const result = await res.json() as Partial<GameState> & { correct: boolean };
        const updated: GameState = {
          ...gameState,
          attemptsUsed: result.attemptsUsed ?? gameState.attemptsUsed,
          revealStage: result.revealStage ?? gameState.revealStage,
          revealDuration: result.revealDuration ?? gameState.revealDuration,
          status: result.status ?? gameState.status,
          score: result.score,
          totalScore: result.totalScore ?? gameState.totalScore,
          roundNumber: result.roundNumber ?? gameState.roundNumber,
          guesses: result.guesses ?? gameState.guesses ?? [],
        };
        setGameState(updated);
        persistIfDaily(updated);
        if (updated.status !== "playing") {
          await fetchStreamUrl(updated.sessionId);
        }
        return result;
      } catch (err) {
        console.error("[useGame.submitGuess]", err);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [gameState, isSubmitting, setGameState, setSubmitting, fetchStreamUrl]
  );

  const skip = useCallback(async () => {
    if (!gameState || isSubmitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/game/skip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: gameState.sessionId }),
      });
      if (!res.ok) {
        const { error } = await res.json() as { error: string };
        throw new Error(error);
      }
      const result = await res.json() as Partial<GameState>;
      const updated: GameState = {
        ...gameState,
        attemptsUsed: result.attemptsUsed ?? gameState.attemptsUsed,
        revealStage: result.revealStage ?? gameState.revealStage,
        revealDuration: result.revealDuration ?? gameState.revealDuration,
        status: result.status ?? gameState.status,
        guesses: result.guesses ?? gameState.guesses ?? [],
        score: result.score,
        totalScore: result.totalScore ?? gameState.totalScore,
        roundNumber: result.roundNumber ?? gameState.roundNumber,
      };
      setGameState(updated);
      persistIfDaily(updated);
      if (updated.status !== "playing") {
        await fetchStreamUrl(updated.sessionId);
      }
      return result;
    } catch (err) {
      console.error("[useGame.skip]", err);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [gameState, isSubmitting, setGameState, setSubmitting, fetchStreamUrl]);

  const advanceRound = useCallback(async () => {
    if (!gameState || isSubmitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/game/next-round", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: gameState.sessionId }),
      });
      if (!res.ok) {
        const { error } = await res.json() as { error: string };
        throw new Error(error);
      }
      const { roundNumber } = await res.json() as { roundNumber: number };
      const updated: GameState = {
        ...gameState,
        status: "playing",
        attemptsUsed: 0,
        revealStage: 0,
        revealDuration: 1, // Default initial
        guesses: [],
        roundNumber,
        score: 0,
      };
      setGameState(updated);
      persistIfDaily(updated);
      await fetchStreamUrl(updated.sessionId);
    } catch (err) {
      console.error("[useGame.advanceRound]", err);
    } finally {
      setSubmitting(false);
    }
  }, [gameState, isSubmitting, setGameState, setSubmitting, fetchStreamUrl]);

  return {
    gameState,
    isLoading,
    isSubmitting,
    streamUrl,
    startDailyGame,
    startPracticeGame,
    submitGuess,
    skip,
    advanceRound,
  };
}

function persistIfDaily(state: GameState) {
  if (state.mode !== "daily") return;
  const key = getLocalStorageKey(
    "daily",
    new Date().toISOString().slice(0, 10),
    state.language
  );
  localStorage.setItem(key, JSON.stringify(state));
}
