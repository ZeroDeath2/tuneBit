# TuneBit — Build Specification

This document merges two source specifications into a single authoritative build spec for a TuneBit-style music guessing game.

**Precedence rule:** Where the two source plans conflict (technology choices, schema details, endpoint shapes, etc.), **Plan 1 (the production build prompt) is the source of truth**. Plan 2 (the reverse-engineered gameplay spec) is used only to **fill in gaps** Plan 1 left unspecified — e.g. genre categories, guess-distribution charts, dev/admin preview tooling, PWA/SEO notes, and some UX phrasing. Nothing from Plan 2 overrides Plan 1's stack, security model, or architecture.

---

## 0. Role & Mandate

You are a senior full-stack/product engineer. Build a complete, production-quality, TuneBit-style music guessing game from scratch.

Non-negotiable constraints:

- Do **not** use Spotify.
- Use **SoundCloud** as the music provider (abstracted behind an interface so it can be swapped later).
- Use **Supabase** for PostgreSQL + Auth. Auth provider is **Google OAuth**.
- Guests can play the **entire game** without signing in. Only the leaderboard and cloud stats require auth.
- **Never trust client-submitted scores, attempts, reveal stage, or win/loss state.** The server is authoritative.
- Before touching SoundCloud integration, inspect the **current official SoundCloud API docs** and current restrictions — do not follow outdated tutorials or deprecated endpoints. If real-world API behavior differs from assumptions in this spec, follow the current docs and adapt rather than inventing unsupported behavior. Do not use deprecated APIs when a current alternative exists.

---

## 1. Product Concept

**TuneBit**: a daily (plus unlimited practice) music identification game.

Core loop: the player hears a progressively longer fragment of a mystery song and must identify it before running out of attempts.

> The less audio you need to hear, the better you performed.

Design principle carried through every layer: **"I have enough to guess, or I spend an attempt to hear more?"** is the central decision the whole product exists to support. Nothing in the UI should compete with that loop.

- Initial clip is almost imperceptibly short (default 0.1s).
- Wrong guess → consumes an attempt → unlocks more audio.
- Skip → **also** consumes an attempt (it is a deliberate strategic move, not a free action) → unlocks more audio.
- Correct guess → immediate win, game ends.
- 6 wrong attempts/skips exhausted → loss, answer revealed.
- Default reveal stages (must be configurable in one place, not hardcoded in components):

```ts
export const REVEAL_STAGES = [0.1, 0.5, 1, 2, 5, 15]; // seconds
```

Audio window is always `[0, currentStageSeconds]` — the same starting point, expanding — never arbitrary unrelated segments of the track.

A full round should be completable in a few minutes.

---

## 2. Game Modes

### A. Daily
- Exactly one globally identical puzzle per calendar day.
- Deterministic, server-controlled selection — never chosen client-side.
- Resets at a clearly defined global time (**UTC** internally). UI may show a live countdown ("Next puzzle in 05:42:18") purely cosmetically — the **server**, not the client clock, is authoritative for which puzzle is current.
- A completed daily puzzle cannot be replayed.

### B. Practice / Unlimited ("Ultimate")
- Unlimited random rounds, does not affect the daily leaderboard.
- Avoid immediate repeats within a session (track a played-song-ids set per session; reset the pool when exhausted).
- Engine must be mode-agnostic so more modes can be added later without rewrites.

### C. Categories / Genres (fills gap in Plan 1)
- Implement at minimum: **All, Rock, Hip Hop**, extensible to Pop, Electronic, Indie, Country, R&B, etc.
- Categories are database-driven, not hardcoded.
- Each category has its **own independent daily puzzle**; switching category loads that category's puzzle and its own independent game state.
- Active category must be visually obvious in the UI (e.g. tab bar: `[ All ] [ Rock ] [ Hip Hop ]`).

---

## 3. Guest Experience

Guests (no sign-in) can:
- Play Daily and Practice
- Search songs, guess, skip, win, lose, see results
- See local statistics and maintain a local streak
- Share their result

Guests cannot:
- Appear on the leaderboard, or have leaderboard entries
- Have cloud-synced statistics

Persistence: `localStorage` (or IndexedDB), keyed per puzzle/date/category, e.g.:

```
tunebit:daily:2026-08-26:all
```

Stored guest data: completed daily puzzles, local streak, games played/won, local game results/guesses. **Never store sensitive data client-side.**

On load: fetch puzzle → load local state → restore in-progress or completed game so a refresh never destroys an active game and a completed game stays completed.

The UI must clearly communicate: **"You don't need an account to play."** Authentication must never gate the game itself.

---

## 4. Authentication

- Supabase Auth + Google OAuth; authentication is optional everywhere except leaderboard writes/reads of personal cloud stats.
- When a guest tries to reach the leaderboard: friendly prompt — **"Sign in with Google to compete on the leaderboard."** — then return them to the leaderboard after success.
- Supabase Auth user ID is the single application identity; do not build a parallel auth system.
- Public `profiles` table linked to `auth.users`. Never expose email addresses publicly (including on the leaderboard).
- Authenticated users get: persistent account, cloud game history/stats/streak, leaderboard eligibility, display name, avatar.

### Guest → Authenticated transition
Preferred flow:

```
Guest starts game → server creates anonymous game session (user_id = NULL)
  → server records guesses → guest wins
  → guest signs in with Google
  → anonymous session is associated with the new user (server-validated, not trusted from localStorage)
  → server creates the leaderboard entry
```

A guest must never lose a legitimately-earned result just because they weren't signed in when they started. Never blindly trust localStorage data when doing this association — validate the underlying session server-side.

---

## 5. Database (Supabase PostgreSQL)

Do not introduce another database service. Approximate schema (Plan 1's shape is authoritative; Plan 2's flatter shape is superseded by this):

**profiles** — `id (UUID, FK auth.users)`, `display_name`, `avatar_url`, `created_at`, `updated_at`

**songs** — `id`, `soundcloud_id`, `title`, `artist`, `album`, `artwork_url`, `duration`, `streamable`, `metadata JSONB`, `normalized_title`, `normalized_artist` (from Plan 2, useful for fallback text matching), `genre`/`category_id` (to support §2C), `created_at`, `updated_at`

**categories** — `id`, `name`, `slug`, `created_at` (supports §2C; extensible without code changes)

**daily_puzzles** — `id`, `puzzle_date DATE`, `category_id`, `song_id`, `created_at`, unique on `(puzzle_date, category_id)`

**game_sessions** — `id`, `user_id NULLABLE`, `puzzle_id NULLABLE`, `mode`, `status`, `attempts_used`, `current_reveal_stage`, `started_at`, `completed_at` (guest sessions supported via nullable `user_id`)

**game_guesses** — `id`, `session_id`, `guessed_song_id`, `attempt_number`, `is_correct`, `created_at`

**user_stats** — `user_id PK`, `games_played`, `games_won`, `current_streak`, `best_streak`, `average_attempts`, `updated_at`

**leaderboard_entries** — `id`, `user_id NOT NULL`, `puzzle_id NOT NULL`, `attempts`, `score`, `completed_at` (a leaderboard entry **requires** an authenticated user — no exceptions)

Optional per Plan 2, low priority: a `share_results` table storing only the public share representation (no answer, no puzzle ID that leaks the answer).

Consider a uniqueness guard so the same song isn't reused as a daily puzzle within e.g. the last 30 days (admin-enforced at minimum).

---

## 6. Security Model

Never trust from the client: score, attempts, win/loss status, completion time, puzzle answer, reveal stage.

The client only submits **actions**:

```
POST /api/game/guess
{ "sessionId": "...", "songId": "..." }
```

The **server** determines: session existence/ownership, puzzle correctness, guess validity, attempt number, current reveal stage, win state, game-over state, and score — and is the only writer of leaderboard entries.

`{ "score": 999999 }` submitted by a browser must never be accepted.

- Enforce with Supabase **Row Level Security**: users read/write only their own private data; public leaderboard rows are readable; leaderboard **inserts** are never directly permitted from the client (server/service-role or a security-definer function only).
- Rate limit public endpoints, e.g.: search ~30 req/min/IP, guess/skip ~10 req/min/player.
- Guest session IDs must not be predictable/guessable (no sequential IDs) to prevent session hijacking.
- Admin routes require server-side role checks, never client-only gating.
- Never expose stack traces to the browser.

### Security checklist (must all pass before "done")
- SoundCloud credentials never reach the browser
- Supabase service-role key never reaches the browser
- Google OAuth secrets protected
- Correct song never present in API responses before game completion
- Scores/attempts cannot be forged client-side
- Leaderboard entries cannot be arbitrarily inserted
- Users cannot modify another user's stats
- Admin endpoints protected
- Guest sessions cannot be hijacked via predictable IDs
- All API input validated (Zod)
- Rate limiting considered for public endpoints

---

## 7. Game Engine (UI-independent)

```
lib/game/
  game-engine.ts
  reveal-stages.ts
  scoring.ts
  puzzle-selector.ts
  types.ts
```

Conceptual API: `createGame()`, `startGame()`, `submitGuess()`, `skip()`, `getGameState()`, `calculateScore()`, `isGameComplete()`.

`GameState` shape (merging both plans' fields):

```ts
interface GameState {
  puzzleId: string;
  category: string;
  revealStage: number;
  attemptsUsed: number;
  maxAttempts: number; // 6
  status: "playing" | "won" | "lost";
  guesses: Guess[];
  startedAt: string;
  completedAt?: string;
}

interface Guess {
  songId?: string;
  title?: string;
  artist?: string;
  type: "guess" | "skip";
  correct: boolean;
  attemptNumber: number;
  timestamp: string;
}
```

Hard rule to avoid a common implementation mistake: **both** wrong guesses **and** skips consume an attempt and advance the reveal stage. Skip is never free.

The engine must know nothing about SoundCloud, and the UI must never contain authoritative game rules.

---

## 8. Music Provider Abstraction

```ts
interface MusicProvider {
  searchTracks(query: string): Promise<Track[]>;
  getTrack(id: string): Promise<Track>;
  getStreamUrl(id: string): Promise<string | null>;
}
```

Implement `SoundCloudProvider` against it. Before implementation:
1. Read the current official SoundCloud API docs.
2. Confirm the current auth method.
3. Confirm how public track search works today.
4. Confirm how playable tracks are identified.
5. Confirm how stream URLs are resolved.
6. Confirm current attribution requirements.
7. Confirm current API restrictions relevant to this app.
8. Follow current docs over any older example code.

Do not scatter SoundCloud-specific calls through the app — only inside the provider implementation. Do not download or permanently copy SoundCloud audio; do not scrape YouTube; respect licensing at all times. For local dev, royalty-free/test audio files are acceptable (Plan 2's suggestion of ~20 seeded test songs, e.g. `test-song-01.mp3` … `test-song-20.mp3`, with realistic metadata, is a good seed set).

Gracefully handle: unavailable/removed/non-playable tracks, stream errors, network errors, expired stream URLs. If a selected track becomes unplayable, the server should be able to swap in a replacement valid track for that puzzle slot.

Never autoplay the mystery audio, especially on mobile — playback must originate from a real user gesture (`HTMLMediaElement.play()` promise rejections must be handled).

---

## 9. Audio Reveal Mechanic & Player UX

- Playback range is server/engine-enforced: given current stage duration `d`, playback starts at `0` and hard-stops at `d`; seeking beyond the unlocked region is prevented.
- Custom audio player (no bare browser controls). States: `▶ Play` → `❚❚ Pause` (while playing) → `▶ Play again` (once the unlocked segment ends). Re-pressing Play restarts the currently unlocked segment from `0` unless there's a strong reason to resume.
- Visually communicate the *actual* unlocked duration, not just "attempt number." Progress bar is proportional to real elapsed-audio time against the configured final stage (e.g. if final stage is 15s, then 0.1s ≈ 0.67%, 5s ≈ 33.3%, 15s = 100%) — the six stages must **not** be rendered as six equal-width segments.
- UI copy should make the unlocked amount explicit, e.g. "You have heard 2 seconds."
- Accessible label for progress, e.g. "Audio revealed: 1 second of 15 seconds."

---

## 10. Song Search / Autocomplete

- `GET /api/songs/search?q=...` — server-side only; SoundCloud credentials never touch the client.
- Debounce client requests (~200–300ms); begin suggesting after ~2 characters typed.
- Show loading state, title, artist, optionally artwork; filter out non-playable tracks where possible.
- Cap suggestions to roughly 8–10 results.
- Keyboard support: Arrow Up/Down to navigate, Enter to select/submit, Escape to close.
- Mobile touch friendly; combobox/listbox ARIA semantics for screen readers.
- Selection submits a **canonical song ID**, not a free-text string (canonical-ID matching avoids "Weeknd - Blinding Lights" vs "Blinding Lights - The Weeknd" mismatches). If a manual free-text fallback is ever implemented, normalize case, punctuation, apostrophes, whitespace, and common Unicode variants — but don't make matching so loose it becomes trivially exploitable.

---

## 11. Daily Puzzle Selection

- `GET /api/daily` (and effectively per-category, e.g. `/api/daily/:category`) returns what the client needs to play — **never** the answer.
- Server-side deterministic strategy, e.g. `date + category → seed → eligible song`, or (preferred for production control) an explicit `daily_puzzles` table an admin populates directly.
- Guarantees: no duplicate daily puzzle for a given date+category, only verified-playable songs are eligible, answer is never exposed pre-completion.
- Local song catalog lives in Postgres (SoundCloud is used to *discover/import*, not queried live on every request) — this gives deterministic puzzles, fast search, fewer external calls, resilience to SoundCloud outages, and admin control over content. Postgres full-text/trigram search is sufficient; do not add Elasticsearch.

---

## 12. Scoring

Isolated in `lib/game/scoring.ts`, server-calculated only, easy to tune. Reward fewer attempts (and optionally less audio revealed):

```
1st attempt → highest score (e.g. 100)
2nd → e.g. 85
3rd → e.g. 70
4th → e.g. 55
5th → e.g. 40
6th → e.g. 25
Loss → 0
```

The server computes and stores the final score; the leaderboard only ever stores server-calculated values.

---

## 13. Leaderboard

- Authenticated users only; guests can play but never submit entries.
- Fields: rank, score, attempts, display name, avatar — never email, Google ID, or private session data.
- Deterministic tie-breaking: (1) highest score → (2) lowest attempts → (3) earliest completion time.
- Reasonable time windows to support: Today / This Week / All-Time (Daily-only leaderboard is the MVP requirement; broader windows are a nice-to-have from Plan 2).
- Server/database generated — never client-assembled.

---

## 14. Results & Sharing

**Win:** song, artist, attempts (e.g. "2 / 6 attempts"), seconds of audio needed to solve it, server score, share button, today's stats, streak, leaderboard CTA (or a guest-specific "Sign in with Google to join the leaderboard" CTA).

**Loss:** reveal correct song/artist/artwork, score, attempts used, share button, "play again" for practice mode.

**Share text:** puzzle number/date, attempt-pattern emoji grid, attempt count, and a URL — **never** the song/artist. Example:

```
TuneBit #142
🟩🟩⬜⬜⬜⬜
2/6
tunebit.zeusserver.in
```

Use the Web Share API where supported, with a clipboard-copy fallback. Never encode the answer or answer-revealing metadata into share URLs (e.g. don't do `/share?puzzle=song_1042` if that lets people reverse-engineer the answer); prefer an opaque share ID resolving only to the public result representation.

---

## 15. Statistics & Streaks

Minimum stats: games played, games won, win %, current streak, best streak, average attempts. Nice-to-have: average audio revealed, and a Wordle-style guess-distribution bar chart (1–6 and a loss/"X" bucket), e.g.:

```
1  ███████████  8
2  ███████████████  11
3  ███████  5
4  ███  2
5  ██  1
6  █  1
X  ██  2
```

Streak rules are server-authoritative for authenticated users (never derived from client timestamps): streak increments on a daily win, and resets per whatever miss/loss rule is chosen (document the chosen rule explicitly in the README).

---

## 16. Frontend

**Stack (authoritative):** Next.js (App Router), React, TypeScript (strict; avoid `any` unless truly unavoidable), Tailwind CSS, shadcn/ui, Framer Motion, Zustand.

Zustand holds only client/UI/game state that genuinely needs to be global — not a dumping ground for everything. Server state stays server/API/DB-controlled. Guest persistence uses `localStorage`; authenticated persistence comes from Supabase.

### Pages
```
/            Landing / Daily game
/play        Practice mode
/leaderboard Leaderboard
/stats       User statistics
/profile     Optional profile
/admin       Admin (protected)
```

### Project structure
```
app/
  page.tsx
  play/page.tsx
  leaderboard/page.tsx
  stats/page.tsx
  profile/page.tsx
  admin/page.tsx
  api/
    daily/
    game/
    songs/
    leaderboard/
    stats/

components/
  game/
    GameBoard.tsx
    AudioPlayer.tsx
    GuessInput.tsx
    GuessHistory.tsx
    AttemptIndicator.tsx
    GameResult.tsx
    ShareResult.tsx
  leaderboard/
  layout/
  auth/
  ui/

lib/
  game/ (game-engine.ts, scoring.ts, reveal-stages.ts, puzzle-selector.ts, types.ts)
  music/ (music-provider.ts, soundcloud-provider.ts, types.ts)
  supabase/ (client.ts, server.ts, middleware.ts)
  auth/
  validation/
  utils/

store/
  game-store.ts
  ui-store.ts

supabase/
  migrations/

tests/
  unit/
  e2e/
```

(Plan 2's monorepo layout, `packages/game-engine`, Prisma/Drizzle, and Vite/Express suggestions are **not** used — Plan 1's Next.js/Supabase-centric structure above is authoritative. Plan 2's component-tree sketch and dev-tooling ideas below are folded in as supplementary detail.)

### Layout
- **Header:** logo/name, Daily, Practice/Ultimate, Leaderboard, Stats/Profile, Sign-in button when logged out; secondary nav collapses into a menu on mobile.
- **Game area:** category tabs, audio player, reveal/progress indicator, guess search box, attempt history, skip button, remaining-attempts indicator.
- **Result area:** win/loss state, correct song/artist, score, share, leaderboard CTA.
- Keep the central game card narrow and free of clutter; avoid excessive gradients/cards/generic dashboard aesthetics — this should feel like a standalone game, not a CRUD admin panel.

### Component sketch (illustrative, from Plan 2)
```
App
├── Header
├── CategoryTabs
├── DailyGame
│   ├── GameHeader
│   ├── AudioPlayer
│   ├── AudioProgress
│   ├── SongSearch
│   ├── GuessButton
│   ├── SkipButton
│   ├── AttemptIndicator
│   └── GameResult
├── Countdown
├── StatsModal
├── ShareModal
└── Footer
```

`AudioPlayer` should not know or care whether it's rendering Daily or Practice mode; `SongSearch` should not know about game rules.

---

## 17. Visual & Interaction Design

- Minimalist, modern, high-contrast, restrained animation, excellent typography, responsive. Prefer white/off-white background + dark type + one accent color + rounded controls + subtle shadows, with dark-mode support.
- Support widths from ~320px through 1440px+; minimum touch target 44px; large Play button and full-width search on mobile; no horizontal scroll; controls reachable at the bottom.
- Animate sparingly and respect `prefers-reduced-motion`: guess submission, correct/incorrect feedback (e.g. a subtle shake on wrong guesses), reveal-stage progression, result reveal, streak/result transitions, autocomplete appearance, countdown transitions.
- Full keyboard operability: Enter to submit, Escape to close autocomplete, Arrow keys to navigate suggestions, Space to play/pause **only when focus is not inside the search input** (never hijack Space while typing).
- Never rely on color alone to communicate correct/incorrect state.

---

## 18. API Design

```
GET  /api/daily
GET  /api/daily/:category        (per Plan 2, if categories are implemented)
POST /api/game/start
POST /api/game/guess
POST /api/game/skip
GET  /api/game/:id
GET  /api/songs/search
GET  /api/leaderboard
GET  /api/stats
POST /api/share
```

Validate every request with Zod; return explicit typed responses; never leak the answer.

**Daily response (no answer):**
```json
{
  "puzzleId": "daily_2026_08_26_all",
  "category": "all",
  "date": "2026-08-26",
  "maxAttempts": 6,
  "revealStages": [0.1, 0.5, 1, 2, 5, 15]
}
```

**Guess response (server-derived, never client-echoed):**
```json
{
  "correct": false,
  "attemptsUsed": 1,
  "attemptsRemaining": 5,
  "revealStage": 1,
  "revealDuration": 0.5,
  "status": "playing"
}
```
On win, `status: "won"`; the correct song is only included once the session is actually complete.

**Skip response:** shape mirrors the guess response, minus a `correct` field.

---

## 19. Admin

Basic protected admin area (must not be reachable by ordinary users; enforce server-side, not just hidden UI):

- View/add/remove eligible songs; disable a song
- Create/view daily puzzles per date + category, assign category
- Preview audio at each reveal stage before publishing a puzzle (e.g. Play 0.1s / 0.5s / 1s / 2s / 5s / full) so a puzzle with a poor progression isn't shipped
- Inspect game sessions; view basic statistics

A song-import script/CLI (e.g. `npm run songs:import` from a CSV of `title,artist,album,genre,audio_url` or via SoundCloud discovery) should validate fields, normalize title/artist, and detect duplicates before insert/update.

---

## 20. Dev Tooling (non-production)

A development-only panel to jump directly to a given reveal stage or force a win/loss, to speed up manual testing. This must be excluded from production builds entirely (not just hidden behind a flag that could be toggled client-side).

---

## 21. Error Handling

Gracefully handle: SoundCloud API unavailable, track deleted/non-playable, stream URL failure, database failure, expired session, Google auth failure, network failure, duplicate guess, invalid/already-completed game session, stale search-result IDs (re-validate server-side rather than trusting a cached ID), audio load failure (retry without consuming an attempt), and offline state (block submissions, show a clear offline indicator). Never expose stack traces; always show a clear, actionable UI message and, where sensible, a retry action.

---

## 22. Multi-tab / Clock / Edge Cases

- Multiple open tabs: synchronize state where reasonable using `BroadcastChannel` or storage events.
- Client system clock is never trusted for puzzle selection — the server's date/time is authoritative.
- If the underlying song becomes unplayable mid-flight, the server may substitute a replacement for that puzzle slot rather than failing the whole daily puzzle.

---

## 23. Performance & SEO/PWA (supplementary)

- Prefer Next.js server components by default; use client components only where interactivity requires it; dynamic imports for heavy/rare code paths; debounced search; optimized images; DB indexes on hot lookup columns (puzzle date+category, song search fields); cache SoundCloud auth tokens, search results, and metadata where the API's terms allow — never cache/persist audio beyond what's permitted.
- Don't ship the whole song catalog to the browser; search stays server-side. Use `preload="metadata"` (or controlled fetch) for audio rather than eager full downloads.
- Basic SEO: descriptive `<title>`/`<meta description>`, without letting SEO concerns leak into or complicate the actual game UI.
- Optional PWA support (manifest + service worker) for an app-like installed experience — never cache today's answer or other sensitive puzzle metadata insecurely in a service worker cache.

---

## 24. Accessibility

Keyboard navigation throughout; visible focus states; screen-reader labels (e.g. Play button labeled "Play audio"; progress bar exposes "Audio revealed: X of Y seconds"); semantic buttons; accessible autocomplete combobox/listbox pattern; accessible dialogs/modals; sufficient color contrast; respect `prefers-reduced-motion`; never communicate success/failure via color alone.

---

## 25. Testing

**Unit (Vitest):** reveal-stage progression, scoring, guess validation (including duplicate guesses), win state, loss state, daily puzzle selection/determinism, streak calculation.

**End-to-end (Playwright)**, covering at least:
1. Guest opens the daily game
2. Guest starts a game
3. Guest hears audio
4. Guest submits an incorrect guess
5. Reveal stage increases
6. Guest skips
7. Guest submits a correct guess
8. Result screen appears
9. Guest cannot access a leaderboard entry
10. Guest signs in with Google
11. Guest's result is associated with their account
12. Leaderboard displays the result
13. An authenticated user plays a new game
14. The authenticated user's stats update

Also worth covering: refresh mid-game restores state correctly; a new calendar date serves a new puzzle; category switching serves independent puzzles; a completed daily puzzle cannot be replayed.

Mock SoundCloud in automated tests — do not depend on a live SoundCloud track for every CI run.

---

## 26. Environment Variables

`.env.example` (placeholders only, never commit real secrets):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

SUPABASE_SERVICE_ROLE_KEY=

SOUNDCLOUD_CLIENT_ID=
SOUNDCLOUD_CLIENT_SECRET=

NEXT_PUBLIC_APP_URL=https://tunebit.zeusserver.in
```

Use current Supabase env-var naming conventions where they've changed from older tutorials. `NEXT_PUBLIC_APP_URL` is the canonical production origin (see §27) and must be used anywhere the app needs to build an absolute URL — OAuth redirects, share links, `sitemap`/`robots`, Open Graph tags — rather than hardcoding the domain in multiple places.

---

## 27. Hosting & Deployment (AWS)

The application is hosted on **Amazon Web Services** under the custom domain **`tunebit.zeusserver.in`**. Supabase remains the database/auth backend regardless of where the app itself runs (Supabase is a separate managed service, not something to self-host on AWS).

### 27.1 Reference architecture

Pick one of the following AWS hosting paths for the Next.js app; document whichever is chosen in the README so it isn't ambiguous later:

- **Option A — Amplify Hosting (simplest):** connect the Git repo, let Amplify build/deploy the Next.js app (SSR + API routes supported via Amplify's Next.js adapter), attach the custom domain and let Amplify manage the ACM certificate.
- **Option B — ECS Fargate behind an ALB:** containerize the Next.js app (Dockerfile, `output: "standalone"` in `next.config`), run it on Fargate, front it with an Application Load Balancer, terminate TLS on the ALB with an ACM certificate for `tunebit.zeusserver.in`.
- **Option C — Lambda@Edge / CloudFront + S3 (via OpenNext or similar):** build the app with an adapter that targets Lambda, serve static/edge assets from S3 behind CloudFront, dynamic routes via Lambda.

Whichever option is chosen, it must support Next.js **server components, API routes, and server-side rendering** — a purely static export is not sufficient for this app (auth callbacks, server-authoritative game APIs, and SSR pages all require a server runtime).

### 27.2 DNS & TLS

- `tunebit.zeusserver.in` is the production domain; DNS for it is managed wherever the `zeusserver.in` zone lives (e.g. Route 53 if the zone has been migrated there, or the existing DNS provider with a CNAME/ALIAS record pointing at the AWS endpoint — CloudFront distribution, ALB, or Amplify default domain).
- Provision a TLS certificate for `tunebit.zeusserver.in` via **AWS Certificate Manager** (ACM) in the same region as the load balancer/CloudFront distribution (CloudFront specifically requires the cert in `us-east-1`).
- Enforce HTTPS-only; redirect all `http://` traffic to `https://`.
- If a `www.tunebit.zeusserver.in` alias is ever added, redirect it to the apex/subdomain the app actually serves from — pick one canonical host and 301-redirect the other.

### 27.3 Secrets & configuration

- Store all secrets (`SUPABASE_SERVICE_ROLE_KEY`, `SOUNDCLOUD_CLIENT_SECRET`, etc.) in **AWS Secrets Manager** or **SSM Parameter Store** (SecureString), injected into the runtime environment at deploy time — never baked into the container image or committed to the repo.
- Public, non-secret config (`NEXT_PUBLIC_*`) can be set as plain build-time environment variables in the chosen hosting service's build configuration.
- Configure the Google OAuth client's **Authorized redirect URIs** and **Authorized JavaScript origins** to include `https://tunebit.zeusserver.in` (and the Supabase Auth callback URL), and update Supabase Auth's **Site URL** / **Redirect URLs** to `https://tunebit.zeusserver.in` so post-login redirects land on the production domain rather than `localhost`.

### 27.4 CDN, caching & scaling

- Serve static assets (images, artwork, JS/CSS bundles) through **CloudFront** for edge caching and to reduce load on the origin, whichever origin type is chosen.
- Cache `GET /api/songs/search` and `GET /api/daily` responses briefly at the edge/CDN layer where safe (short TTL, cache key includes the query/category/date) — never cache authenticated, per-user, or guess/skip endpoints.
- Auto-scaling: rely on the chosen compute option's native scaling (Amplify's managed compute, Fargate service auto-scaling on CPU/request count, or Lambda's inherent concurrency scaling) rather than provisioning fixed capacity.

### 27.5 CI/CD

- Deploy on push to the main branch (Amplify's built-in CI, or a GitHub Actions workflow that builds, runs `tsc`/lint/unit tests, builds the container or bundle, and deploys to the chosen AWS target).
- Run database migrations against Supabase as an explicit, separate deploy step (never implicitly on app boot) so schema changes are reviewable and rollback-able independent of app deploys.
- Keep a staging environment (e.g. `staging.tunebit.zeusserver.in` or a separate Amplify branch/ECS service) pointed at a separate Supabase project, so production data and the production Google OAuth client are never touched by test deploys.

### 27.6 Observability

- Ship application logs to **CloudWatch Logs**; set up basic CloudWatch alarms (5xx rate, latency, Fargate/Lambda error count) so hosting problems are caught before users report them.
- Track SoundCloud API failures and Supabase errors as distinct log categories so a SoundCloud outage vs. a database issue can be told apart quickly during incident response.

---

## 28. Development Approach & Phasing

Build incrementally — do not attempt one giant file/PR.

```
Phase 1  Project setup (Next.js, TS, Tailwind, shadcn/ui)
Phase 2  Supabase (DB, migrations, Auth, Google OAuth)
Phase 3  Music provider abstraction + SoundCloud search/playable-track discovery
Phase 4  Game engine (reveal stages, guess validation, scoring)
Phase 5  Game UI (audio player, guess interface, results)
Phase 6  Daily puzzle, guest sessions, authenticated sessions
Phase 7  Leaderboard, stats, streaks
Phase 8  Admin panel
Phase 9  Testing, security review, performance optimization
```

Within Phase 3–7, favor Plan 2's finer-grained ordering where helpful (core game loop and 6-attempt mechanic first, then search/autocomplete, then daily+categories+countdown+persistence, then polish/animations/dark mode/accessibility, then accounts/cloud stats/streaks, then share+leaderboard, then admin) — but the phase groupings above from Plan 1 remain the top-level plan.

---

## 29. Separation of Concerns (guiding principle)

```
GAME LOGIC        → Game Engine (lib/game/*)
MUSIC              → Music Provider (lib/music/*)
AUTHENTICATION     → Supabase Auth
DATABASE           → Supabase PostgreSQL
UI                 → React / Next.js
```

The React UI must never contain authoritative game rules. The game engine must never contain SoundCloud-specific code. The database must never depend on SoundCloud's response formats. This separation exists specifically so the music provider can be replaced later without touching game logic, UI, or schema.

---

## 30. Deliverables

1. Complete source code
2. Database migrations
3. `.env.example`
4. Setup instructions
5. Supabase setup instructions
6. Google OAuth setup instructions
7. SoundCloud developer/API setup instructions
8. Local development instructions
9. Production deployment instructions for AWS, including: which hosting option was chosen (§27.1), DNS/ACM setup for `tunebit.zeusserver.in`, secrets configuration, and CI/CD pipeline setup
10. Test instructions
11. README explaining the architecture (including the separation-of-concerns model above, the chosen streak-reset rule, and the AWS hosting architecture)

---

## 31. Acceptance Criteria

**Game:** starts at the shortest configured reveal stage; exactly 6 attempts; wrong guesses and skips both consume an attempt and advance the reveal stage; reveal reaches the configured final stage; correct guess ends the game immediately; 6 failures produce a loss with the answer revealed.

**Search:** autocomplete works, begins after ~2 characters, shows title+artist, selection uses a canonical song ID, keyboard navigation works.

**Daily:** one deterministic puzzle per category per date; all users get the same puzzle; puzzle changes at reset; a completed daily puzzle cannot be replayed.

**Categories:** All/Rock/Hip Hop exist; architecture supports adding more without rewrites.

**Persistence:** refresh never destroys an active game; completed games stay completed; guest progress persists locally; authenticated progress persists remotely.

**Stats:** played, won, win %, current streak, best streak, attempt distribution available.

**UX:** responsive desktop/tablet/mobile; dark mode; full keyboard accessibility; loading states; audio/search error states; working share flow.

**Engineering:** no answer ever exposed to the client before completion; server validates every guess; server controls attempts and the daily puzzle; API is rate-limited; automated unit + e2e tests exist; README with setup instructions; `.env.example` present; production build succeeds; TypeScript checks and lint pass.

---

## 32. Final Product Goal

The player opens the page, sees today's category, presses Play, and hears an almost microscopic fragment of music. They type a song — if they know it, they win fast; if not, they spend an attempt or skip to hear more. The reveal should feel like it's transforming from almost nothing → a tiny clue → recognizable texture → melody → hook → full reveal. Every piece of the implementation (UI, engine, audio provider, puzzle selection, song database, auth, stats, leaderboard, admin) exists to protect that single moment-to-moment decision — hearing the answer emerge from silence.

Do not copy proprietary source code, assets, branding, or copyrighted audio from any reference game. Recreate the mechanics and experience independently, respecting SoundCloud's current terms and API restrictions throughout.
