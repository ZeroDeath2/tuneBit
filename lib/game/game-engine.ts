import { getRevealStages, MAX_ATTEMPTS, getRevealDuration, getRevealStageIndex } from "./reveal-stages";
import { calculateScore } from "./scoring";
import type { GameState, GameStatus, Guess, GuessResult, SkipResult } from "./types";

export function createInitialGameState(params: {
  sessionId: string;
  gauntletId: string | null;
  mode: "daily" | "practice";
  category: string;
  language: string;
  difficulty: string;
  roundNumber?: number;
  totalScore?: number;
}): GameState {
  return {
    sessionId: params.sessionId,
    gauntletId: params.gauntletId,
    mode: params.mode,
    category: params.category,
    language: params.language,
    difficulty: params.difficulty,
    revealStage: 0,
    revealDuration: getRevealDuration(0, params.difficulty),
    attemptsUsed: 0,
    maxAttempts: MAX_ATTEMPTS,
    status: "playing",
    guesses: [],
    score: 0,
    startedAt: new Date().toISOString(),
    roundNumber: params.roundNumber ?? 1,
    totalScore: params.totalScore ?? 0,
  };
}

export function processGuess(
  state: GameState,
  params: {
    songId: string;
    title: string;
    artist: string;
    correctSongId: string;
  }
): { newState: GameState; result: GuessResult } {
  if (state.status !== "playing") {
    throw new Error("Game is already complete");
  }

  const isDuplicate = state.guesses.some(
    (g) => g.type === "guess" && g.songId === params.songId
  );
  if (isDuplicate) {
    throw new Error("Duplicate guess: this song has already been guessed");
  }

  const isCorrect = params.songId === params.correctSongId;
  const newAttemptsUsed = state.attemptsUsed + 1;

  const guess: Guess = {
    songId: params.songId,
    title: params.title,
    artist: params.artist,
    type: "guess",
    correct: isCorrect,
    attemptNumber: newAttemptsUsed,
    timestamp: new Date().toISOString(),
  };

  let newStatus: GameStatus = "playing";
  let score: number | undefined;

  if (isCorrect) {
    newStatus = "won";
    score = calculateScore(newAttemptsUsed);
  } else if (newAttemptsUsed >= MAX_ATTEMPTS) {
    newStatus = "lost";
    score = 0;
  }

  const newRevealStageIndex = getRevealStageIndex(newAttemptsUsed, state.difficulty);
  const newRevealDuration = getRevealDuration(newAttemptsUsed, state.difficulty);

  const newState: GameState = {
    ...state,
    attemptsUsed: newAttemptsUsed,
    revealStage: newRevealStageIndex,
    revealDuration: newRevealDuration,
    status: newStatus,
    guesses: [...state.guesses, guess],
    completedAt: newStatus !== "playing" ? new Date().toISOString() : undefined,
    score,
  };

  const result: GuessResult = {
    correct: isCorrect,
    attemptsUsed: newAttemptsUsed,
    attemptsRemaining: Math.max(0, MAX_ATTEMPTS - newAttemptsUsed),
    revealStage: newRevealStageIndex,
    revealDuration: newRevealDuration,
    status: newStatus,
    score,
  };

  return { newState, result };
}

export function processSkip(
  state: GameState
): { newState: GameState; result: SkipResult } {
  if (state.status !== "playing") {
    throw new Error("Game is already complete");
  }

  const newAttemptsUsed = state.attemptsUsed + 1;

  const guess: Guess = {
    type: "skip",
    correct: false,
    attemptNumber: newAttemptsUsed,
    timestamp: new Date().toISOString(),
  };

  let newStatus: GameStatus = "playing";
  if (newAttemptsUsed >= MAX_ATTEMPTS) {
    newStatus = "lost";
  }

  const newRevealStageIndex = getRevealStageIndex(newAttemptsUsed, state.difficulty);
  const newRevealDuration = getRevealDuration(newAttemptsUsed, state.difficulty);

  const newState: GameState = {
    ...state,
    attemptsUsed: newAttemptsUsed,
    revealStage: newRevealStageIndex,
    revealDuration: newRevealDuration,
    status: newStatus,
    guesses: [...state.guesses, guess],
    completedAt: newStatus !== "playing" ? new Date().toISOString() : undefined,
    score: newStatus === "lost" ? 0 : undefined,
  };

  const result: SkipResult = {
    attemptsUsed: newAttemptsUsed,
    attemptsRemaining: Math.max(0, MAX_ATTEMPTS - newAttemptsUsed),
    revealStage: newRevealStageIndex,
    revealDuration: newRevealDuration,
    status: newStatus,
  };

  return { newState, result };
}

export function isGameComplete(state: GameState): boolean {
  return state.status !== "playing";
}

export function getRevealStageDurations(difficulty?: string | null): readonly number[] {
  return getRevealStages(difficulty ?? undefined);
}
