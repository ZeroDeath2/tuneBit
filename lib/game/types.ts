export type GameMode = "daily" | "practice";
export type GameStatus = "playing" | "won" | "lost";
export type GuessType = "guess" | "skip";

export interface Guess {
  songId?: string;
  title?: string;
  artist?: string;
  type: GuessType;
  correct: boolean;
  attemptNumber: number;
  timestamp: string;
}

export interface GameState {
  sessionId: string;
  gauntletId: string | null;
  mode: GameMode;
  category: string;
  language: string;
  difficulty: string;
  revealStage: number;
  revealDuration: number;
  attemptsUsed: number;
  maxAttempts: number;
  status: GameStatus;
  guesses: Guess[];
  startedAt: string;
  completedAt?: string;
  score?: number;
  roundNumber: number;
  totalScore: number;
}

export interface DailyGauntletInfo {
  gauntletId: string;
  language: string;
  date: string;
  maxAttempts: number;
  revealStages: readonly number[];
  roundNumber: number;
  totalScore: number;
}

export interface GuessResult {
  correct: boolean;
  attemptsUsed: number;
  attemptsRemaining: number;
  revealStage: number;
  revealDuration: number;
  status: GameStatus;
  score?: number;
  totalScore?: number;
  song?: SongReveal;
  guesses?: Guess[];
  roundNumber?: number;
}

export interface SkipResult {
  attemptsUsed: number;
  attemptsRemaining: number;
  revealStage: number;
  revealDuration: number;
  status: GameStatus;
  song?: SongReveal;
  guesses?: Guess[];
  score?: number;
  totalScore?: number;
  roundNumber?: number;
}

export interface SongReveal {
  id: string;
  title: string;
  artist: string;
  album?: string;
  artworkUrl?: string;
  streamUrl?: string;
}
