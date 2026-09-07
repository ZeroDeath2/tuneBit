import { z } from "zod";

export const GuessRequestSchema = z.object({
  sessionId: z.string().uuid(),
  songId: z.string().min(1).max(50),
});

export const SkipRequestSchema = z.object({
  sessionId: z.string().uuid(),
});

export const StartGameRequestSchema = z.object({
  gauntletId: z.string().min(1).optional(),
  mode: z.enum(["daily", "practice"]),
  category: z.string().min(1).default("all"),
  language: z.string().min(1).default("all"),
  difficulty: z.enum(["easy", "normal", "hard"]).default("normal"),
  roundNumber: z.number().optional(),
  totalScore: z.number().optional(),
});

export const SearchQuerySchema = z.object({
  q: z.string().min(1).max(100),
  limit: z.coerce.number().int().min(1).max(20).default(10),
  language: z.string().optional(),
});

export const LeaderboardQuerySchema = z.object({
  window: z.enum(["today", "week", "alltime"]).default("today"),
  language: z.enum(["english", "malayalam", "all"]).default("all"),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const ShareRequestSchema = z.object({
  sessionId: z.string().uuid(),
});

export type GuessRequest = z.infer<typeof GuessRequestSchema>;
export type SkipRequest = z.infer<typeof SkipRequestSchema>;
export type StartGameRequest = z.infer<typeof StartGameRequestSchema>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type LeaderboardQuery = z.infer<typeof LeaderboardQuerySchema>;
export type ShareRequest = z.infer<typeof ShareRequestSchema>;
