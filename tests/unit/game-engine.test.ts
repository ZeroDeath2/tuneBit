import { describe, it, expect } from "vitest";
import { createInitialGameState, processGuess, processSkip, isGameComplete } from "@/lib/game/game-engine";
import { getRevealStages, MAX_ATTEMPTS } from "@/lib/game/reveal-stages";
import { calculateScore } from "@/lib/game/scoring";

const CORRECT_SONG_ID = "song-abc";
const DEFAULT_STAGES = getRevealStages("all");

function makeState(attemptsUsed = 0) {
  const state = createInitialGameState({
    sessionId: "test-session",
    gauntletId: "gauntlet-1",
    mode: "daily",
    category: "all",
    language: "all",
    difficulty: "normal",
  });
  
  if (attemptsUsed > 0) {
    state.attemptsUsed = attemptsUsed;
    state.revealStage = Math.min(attemptsUsed, MAX_ATTEMPTS - 1);
  }
  return state;
}

describe("createInitialGameState", () => {
  it("starts with status=playing, 0 attempts, stage 0", () => {
    const s = makeState();
    expect(s.status).toBe("playing");
    expect(s.attemptsUsed).toBe(0);
    expect(s.revealStage).toBe(0);
    expect(s.revealDuration).toBeCloseTo(DEFAULT_STAGES[0] as number);
    expect(s.maxAttempts).toBe(MAX_ATTEMPTS);
    expect(s.guesses).toHaveLength(0);
  });
});

describe("processGuess — correct guess", () => {
  it("sets status=won, increments attemptsUsed, calculates score", () => {
    const state = makeState();
    const { newState, result } = processGuess(state, {
      songId: CORRECT_SONG_ID,
      title: "Test Song",
      artist: "Test Artist",
      correctSongId: CORRECT_SONG_ID,
    });

    expect(result.correct).toBe(true);
    expect(newState.status).toBe("won");
    expect(newState.attemptsUsed).toBe(1);
    expect(result.score).toBeGreaterThan(0);
    expect(isGameComplete(newState)).toBe(true);
  });

  it("score is 100 for first attempt", () => {
    expect(calculateScore(1)).toBe(100);
  });

  it("score decreases with more attempts", () => {
    for (let i = 1; i < MAX_ATTEMPTS; i++) {
      expect(calculateScore(i + 1)).toBeLessThan(calculateScore(i));
    }
  });
});

describe("processGuess — wrong guess", () => {
  it("keeps status=playing after one wrong guess", () => {
    const state = makeState();
    const { newState } = processGuess(state, {
      songId: "wrong-song",
      title: "Wrong",
      artist: "Artist",
      correctSongId: CORRECT_SONG_ID,
    });

    expect(newState.status).toBe("playing");
    expect(newState.attemptsUsed).toBe(1);
    expect(isGameComplete(newState)).toBe(false);
  });

  it("sets status=lost after MAX_ATTEMPTS wrong guesses", () => {
    let state = makeState();
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      const result = processGuess(state, {
        songId: `wrong-${i}`,
        title: `Wrong ${i}`,
        artist: "Artist",
        correctSongId: CORRECT_SONG_ID,
      });
      state = result.newState;
    }
    expect(state.status).toBe("lost");
    expect(isGameComplete(state)).toBe(true);
  });

  it("throws on duplicate guess", () => {
    const state = makeState();
    const { newState } = processGuess(state, {
      songId: "dup-song",
      title: "Dup",
      artist: "Artist",
      correctSongId: CORRECT_SONG_ID,
    });

    expect(() =>
      processGuess(newState, {
        songId: "dup-song",
        title: "Dup",
        artist: "Artist",
        correctSongId: CORRECT_SONG_ID,
      })
    ).toThrow("Duplicate guess");
  });
});

describe("processSkip", () => {
  it("increments attemptsUsed but keeps playing", () => {
    const state = makeState();
    const { newState, result } = processSkip(state);

    expect(newState.attemptsUsed).toBe(1);
    expect(newState.status).toBe("playing");
    expect(result.attemptsRemaining).toBe(MAX_ATTEMPTS - 1);
  });

  it("sets status=lost after MAX_ATTEMPTS skips", () => {
    let state = makeState();
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      state = processSkip(state).newState;
    }
    expect(state.status).toBe("lost");
  });

  it("advances reveal stage on each skip", () => {
    const state = makeState();
    const { newState } = processSkip(state);
    expect(newState.revealStage).toBe(1);
    expect(newState.revealDuration).toBeCloseTo(DEFAULT_STAGES[1] as number);
  });
});

describe("reveal stage progression", () => {
  it("reveal duration matches DEFAULT_STAGES at each step", () => {
    let state = makeState();
    for (let i = 0; i < MAX_ATTEMPTS - 1; i++) {
      const expected = DEFAULT_STAGES[Math.min(i + 1, DEFAULT_STAGES.length - 1)];
      state = processSkip(state).newState;
      expect(state.revealDuration).toBeCloseTo(expected as number);
    }
  });
});

describe("deterministic daily gauntlet hash", () => {
  it("same date + category always produces same hash", async () => {
    const { hashDateCategoryForTest } = await import("@/lib/game/gauntlet-selector");
    const h1 = hashDateCategoryForTest("2024-01-01", "pop");
    const h2 = hashDateCategoryForTest("2024-01-01", "pop");
    expect(h1).toBe(h2);
  });

  it("different dates produce different hashes", async () => {
    const { hashDateCategoryForTest } = await import("@/lib/game/gauntlet-selector");
    const h1 = hashDateCategoryForTest("2024-01-01", "all");
    const h2 = hashDateCategoryForTest("2024-01-02", "all");
    expect(h1).not.toBe(h2);
  });
});
