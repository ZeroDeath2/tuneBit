import { NextResponse } from "next/server";
import { createServerClient, createServiceRoleClient } from "@/lib/supabase/server";
import { processSkip } from "@/lib/game/game-engine";
import { SkipRequestSchema } from "@/lib/validation";
import { checkRateLimit, getRateLimitKey } from "@/lib/utils/rate-limit";
import { headers } from "next/headers";
import type { GameState } from "@/lib/game/types";

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") ?? "unknown";

    const body = await request.json() as unknown;
    const parsed = SkipRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { sessionId } = parsed.data;

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const rateLimitId = user?.id ?? ip;

    const { allowed } = checkRateLimit(
      getRateLimitKey("guess", rateLimitId),
      10,
      60_000
    );
    if (!allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const serviceClient = createServiceRoleClient();

    const { data: session, error: sessionError } = await serviceClient
      .from("game_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.user_id && session.user_id !== user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (session.status !== "playing") {
      return NextResponse.json({ error: "Game is already complete" }, { status: 400 });
    }

    const { data: prevGuesses } = await serviceClient
      .from("game_guesses")
      .select("guessed_song_id, attempt_number, is_correct, songs(title, artist)")
      .eq("session_id", sessionId)
      .eq("round_number", session.round_number || 1)
      .order("attempt_number", { ascending: true });

    const gameState: GameState = {
      sessionId,
      gauntletId: session.gauntlet_id as string,
      mode: session.mode as "daily" | "practice",
      category: "all",
      language: session.language ?? "all",
      difficulty: session.difficulty ?? "normal",
      revealStage: session.current_reveal_stage as number,
      revealDuration: 0,
      attemptsUsed: session.attempts_used as number,
      maxAttempts: 6,
      status: "playing",
      roundNumber: session.round_number as number,
      totalScore: session.total_score as number,
      guesses: (prevGuesses ?? []).map((g) => {
        const songData = g.songs as unknown as { title: string; artist: string } | null;
        return {
          songId: g.guessed_song_id as string | undefined,
          title: songData?.title,
          artist: songData?.artist,
          type: g.guessed_song_id ? "guess" : "skip",
          correct: g.is_correct as boolean,
          attemptNumber: g.attempt_number as number,
          timestamp: "",
        };
      }),
      startedAt: session.started_at as string,
    };

    const { newState, result } = processSkip(gameState);

    await serviceClient.from("game_guesses").insert({
      session_id: sessionId,
      round_number: session.round_number || 1,
      guessed_song_id: null,
      attempt_number: newState.attemptsUsed,
      is_correct: false,
    });

    const isRoundOver = newState.status !== "playing";
    const newTotalScore = isRoundOver ? (session.total_score + (result.score ?? 0)) : session.total_score;

    await serviceClient
      .from("game_sessions")
      .update({
        attempts_used: newState.attemptsUsed,
        current_reveal_stage: newState.revealStage,
        status: newState.status,
        completed_at: newState.completedAt ?? null,
        total_score: newTotalScore,
      })
      .eq("id", sessionId);

    if (isRoundOver && user?.id) {
      if (session.mode === "daily" && session.round_number === 3) {
        // Calculate total attempts across all rounds
        const { data: allGuesses } = await serviceClient
          .from("game_guesses")
          .select("id")
          .eq("session_id", sessionId);
        const totalAttempts = allGuesses ? allGuesses.length : newState.attemptsUsed;

        await serviceClient.from("leaderboard_entries").insert({
          user_id: user.id,
          gauntlet_id: session.gauntlet_id,
          attempts: totalAttempts,
          score: newTotalScore,
          completed_at: newState.completedAt,
        });

        // Upsert stats considering win/loss logic for full gauntlet
        const hasWonAny = newTotalScore > 0;
        await upsertUserStats(serviceClient, user.id, hasWonAny, totalAttempts);
      } else if (session.mode === "practice") {
        await upsertUserStats(serviceClient, user.id, newState.status === "won", newState.attemptsUsed);
      }
    }

    const response: Record<string, unknown> = {
      attemptsUsed: result.attemptsUsed,
      attemptsRemaining: result.attemptsRemaining,
      revealStage: result.revealStage,
      revealDuration: result.revealDuration,
      status: result.status,
      score: result.score,
      totalScore: newTotalScore,
      roundNumber: session.round_number,
      guesses: newState.guesses,
    };

    if (isRoundOver) {
      let correctSongId: string | null = null;
      if (session.mode === "practice" && session.practice_song_id) {
        correctSongId = session.practice_song_id as string;
      } else if (session.gauntlet_id) {
        const { data: gauntlet } = await serviceClient
          .from("daily_gauntlets")
          .select("song_ids")
          .eq("id", session.gauntlet_id)
          .single();
        if (gauntlet && Array.isArray(gauntlet.song_ids)) {
          const roundIndex = (session.round_number || 1) - 1;
          correctSongId = gauntlet.song_ids[roundIndex] ?? null;
        }
      }

      if (correctSongId) {
        const { data: song } = await serviceClient
          .from("songs")
          .select("id, title, artist, album, artwork_url")
          .eq("id", correctSongId)
          .single();
        if (song) {
          response.song = {
            id: song.id,
            title: song.title,
            artist: song.artist,
            album: song.album,
            artworkUrl: song.artwork_url,
          };
        }
      }
    }

    return NextResponse.json(response);
  } catch (err) {
    console.error("[/api/game/skip] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function upsertUserStats(
  serviceClient: ReturnType<typeof createServiceRoleClient>,
  userId: string,
  won: boolean,
  attemptsUsed: number
) {
  const { data: existing } = await serviceClient
    .from("user_stats")
    .select("*")
    .eq("user_id", userId)
    .single();

  const today = new Date().toISOString().slice(0, 10);
  const lastPlayed = existing?.last_played_date as string | null | undefined;

  const alreadyPlayedToday = lastPlayed === today;

  let currentStreak = existing?.current_streak ?? 0;
  if (won) {
    if (!alreadyPlayedToday) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);
      if (lastPlayed === yesterdayStr) {
        currentStreak += 1;
      } else {
        currentStreak = 1;
      }
    }
  } else if (!alreadyPlayedToday) {
    currentStreak = 0;
  }

  const gamesPlayed = (existing?.games_played ?? 0) + (alreadyPlayedToday ? 0 : 1);
  const gamesWon = (existing?.games_won ?? 0) + (!alreadyPlayedToday && won ? 1 : 0);
  const bestStreak = Math.max(existing?.best_streak ?? 0, currentStreak);
  const prevGames = existing?.games_played ?? 0;
  const totalAttempts = (existing?.average_attempts ?? 0) * prevGames + attemptsUsed;
  const averageAttempts = gamesPlayed > 0 ? totalAttempts / gamesPlayed : 0;

  await serviceClient.from("user_stats").upsert({
    user_id: userId,
    games_played: gamesPlayed,
    games_won: gamesWon,
    current_streak: currentStreak,
    best_streak: bestStreak,
    average_attempts: Math.round(averageAttempts * 100) / 100,
    last_played_date: today,
    updated_at: new Date().toISOString(),
  });
}
