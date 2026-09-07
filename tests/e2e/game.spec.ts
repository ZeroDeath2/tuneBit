import { test, expect } from "@playwright/test";

test.describe("Daily game — guest flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("loads the home page and shows the audio player", async ({ page }) => {
    await expect(page).toHaveTitle(/TuneBit/);
    await expect(page.getByRole("button", { name: /play audio/i })).toBeVisible({ timeout: 15000 });
  });

  test("skip button increments reveal stage", async ({ page }) => {
    const skipBtn = page.getByRole("button", { name: /skip/i });
    await skipBtn.waitFor({ timeout: 15000 });
    await skipBtn.click();
    await expect(page.getByText(/5 attempts remaining/i)).toBeVisible({ timeout: 5000 });
  });

  test("guess input shows search results", async ({ page }) => {
    const input = page.getByRole("combobox", { name: /search for a song/i });
    await input.waitFor({ timeout: 15000 });
    await input.fill("shape of you");
    await expect(page.getByRole("listbox")).toBeVisible({ timeout: 10000 });
  });

  test("state persists on page refresh", async ({ page }) => {
    const skipBtn = page.getByRole("button", { name: /skip/i });
    await skipBtn.waitFor({ timeout: 15000 });
    await skipBtn.click();
    await page.waitForTimeout(500);
    await page.reload();
    await expect(page.getByText(/5 attempts remaining/i)).toBeVisible({ timeout: 10000 });
  });

  test("audio does not autoplay on load", async ({ page }) => {
    const playBtn = page.getByRole("button", { name: /play audio/i });
    await playBtn.waitFor({ timeout: 15000 });
    const audioHandle = await page.$("audio");
    const paused = await audioHandle?.evaluate((el: HTMLAudioElement) => el.paused);
    expect(paused).toBe(true);
  });
});

test.describe("Practice mode", () => {
  test("loads practice page with category filter", async ({ page }) => {
    await page.goto("/play");
    await expect(page.getByRole("button", { name: /pop/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("button", { name: /skip/i })).toBeVisible({ timeout: 15000 });
  });
});

test.describe("Navigation", () => {
  test("header links navigate correctly", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /leaderboard/i }).click();
    await expect(page).toHaveURL(/\/leaderboard/);
    await page.getByRole("link", { name: /stats/i }).click();
    await expect(page).toHaveURL(/\/stats/);
  });
});

test.describe("Completed daily puzzle replay prevention", () => {
  test("shows result screen if daily puzzle is already completed", async ({ page, context }) => {
    const todayKey = `tunebit:daily:${new Date().toISOString().slice(0, 10)}:all`;
    const completedState = JSON.stringify({
      sessionId: "test-session-id",
      puzzleId: "puzzle-1",
      mode: "daily",
      category: "all",
      revealStage: 2,
      revealDuration: 1,
      attemptsUsed: 3,
      maxAttempts: 6,
      status: "won",
      score: 70,
      guesses: [],
      startedAt: new Date().toISOString(),
    });

    await context.addInitScript((args) => {
      window.localStorage.setItem(args.key, args.value);
    }, { key: todayKey, value: completedState });

    await page.goto("/");
    await expect(page.getByText(/got it/i)).toBeVisible({ timeout: 15000 });
  });
});
