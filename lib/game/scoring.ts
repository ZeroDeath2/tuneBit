import { MAX_ATTEMPTS } from "./reveal-stages";

const SCORE_TABLE: Record<number, number> = {
  1: 100,
  2: 85,
  3: 70,
  4: 55,
  5: 40,
  6: 25,
};

export function calculateScore(attemptsUsed: number): number {
  if (attemptsUsed < 1 || attemptsUsed > MAX_ATTEMPTS) return 0;
  return SCORE_TABLE[attemptsUsed] ?? 0;
}

export function isWinningScore(score: number): boolean {
  return score > 0;
}
