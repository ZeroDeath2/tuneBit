export const REVEAL_STAGES = {
  easy: [1, 2, 4, 8, 15, 30],
  normal: [0.5, 1, 2, 5, 10, 20],
  hard: [0.2, 0.5, 1, 2, 5, 15],
} as const;

export type Difficulty = keyof typeof REVEAL_STAGES;
export type RevealStageIndex = 0 | 1 | 2 | 3 | 4 | 5;

export const MAX_ATTEMPTS = 6;

export function getRevealStages(difficulty: string = "normal"): readonly number[] {
  if (difficulty === "easy" || difficulty === "normal" || difficulty === "hard") {
    return REVEAL_STAGES[difficulty];
  }
  return REVEAL_STAGES.normal;
}

export function getRevealDuration(attemptsUsed: number, difficulty: string = "normal"): number {
  const stages = getRevealStages(difficulty);
  const index = Math.min(attemptsUsed, stages.length - 1);
  return stages[index] as number;
}

export function getRevealStageIndex(attemptsUsed: number, difficulty: string = "normal"): number {
  const stages = getRevealStages(difficulty);
  return Math.min(attemptsUsed, stages.length - 1);
}
