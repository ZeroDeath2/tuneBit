## TuneBit

A daily music-guessing game. Identify the song from progressively longer audio clips (0.1 → 0.5 → 1 → 2 → 5 → 15 seconds). A new puzzle every day.

Live: **https://tunebit.zeusserver.in**

---

## Architecture

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, `output: standalone`) |
| Language | TypeScript (strict + `noUncheckedIndexedAccess`) |
| Styling | Tailwind CSS v4, shadcn/ui, Framer Motion |
| State | Zustand |
| Validation | Zod |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Auth | Google OAuth via Supabase |
| Music | SoundCloud API (abstracted behind `MusicProvider` interface) |
| Hosting | AWS Amplify (free tier) |
| Testing | Vitest (unit) · Playwright (E2E) |

---

## Reveal stages

`[0.1, 0.5, 1, 2, 5, 15]` seconds. Each wrong guess or skip unlocks the next stage. Scoring: **100 / 85 / 70 / 55 / 40 / 25** for attempts 1–6; 0 for a loss.

## Streak rule

Missing a calendar day **resets** the streak (same rule as Wordle). The server clock is always authoritative — the client clock is never trusted for puzzle selection.

## AWS choice

AWS Amplify (Option A) gives zero-config Next.js SSR hosting on the free tier, built-in CloudFront CDN, automatic HTTPS via ACM, and GitHub CI/CD with no server management.

---

## Local development

```bash
# 1. Install Node 22
nvm install 22.12.0 && nvm use

# 2. Install dependencies
npm install

# 3. Copy env template
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
# SUPABASE_SERVICE_ROLE_KEY, SOUNDCLOUD_CLIENT_ID, SOUNDCLOUD_CLIENT_SECRET,
# ADMIN_EMAILS

# 4. Run migrations against your Supabase project
# In the Supabase dashboard: SQL Editor → paste each migration file in order

# 5. Start dev server
npm run dev
```

---

## Supabase setup

1. Create a new project at https://supabase.com
2. In **Authentication → Providers** enable Google OAuth (add your client ID/secret)
3. Set **Redirect URL** to `https://<your-domain>/api/auth/callback`
4. Run migrations in order:
   - `supabase/migrations/20240001_initial_schema.sql`
   - `supabase/migrations/20240002_rls_policies.sql`
5. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
6. Copy **anon/public key** → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
7. Copy **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

---

## SoundCloud setup

1. Create an app at https://developers.soundcloud.com
2. Copy **Client ID** → `SOUNDCLOUD_CLIENT_ID`
3. Copy **Client Secret** → `SOUNDCLOUD_CLIENT_SECRET`

---

## Importing songs

```bash
# Search SoundCloud and import results
npm run songs:import -- --query "top pop 2024" --limit 20 --category pop

# Import from a CSV (columns: soundcloud_id, title, artist, artwork_url, genre)
npm run songs:import -- --csv ./songs.csv --category hiphop

# Dry run (no writes)
npm run songs:import -- --query "jazz classics" --dry-run
```

---

## Testing

```bash
# Unit tests
npm test

# Unit tests in watch mode
npm run test:watch

# E2E tests (requires running dev server)
npm run test:e2e

# Type checking
npm run type-check

# Lint
npm run lint
```

---

## AWS Amplify deployment

1. Push repo to GitHub
2. In Amplify Console: **New App → Host web app → GitHub**
3. Select the repository and branch
4. Amplify detects `amplify.yml` automatically
5. Add environment variables (all from `.env.example`) in **App settings → Environment variables**
6. In **Domain management** add `tunebit.zeusserver.in` — Amplify issues an ACM certificate automatically
7. Point your DNS CNAME to the Amplify domain

---

## Security notes

- SoundCloud credentials and `SUPABASE_SERVICE_ROLE_KEY` **never** reach the browser
- All game actions (guess, skip, score, win/loss) are server-authoritative
- Leaderboard entries are only inserted by the service role
- Admin routes check `ADMIN_EMAILS` server-side; client-side gating is for UX only
- Share URLs never encode the answer
- RLS policies prevent cross-user data access
