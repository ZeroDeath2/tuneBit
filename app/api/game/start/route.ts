import { NextResponse } from "next/server";
import { createServerClient, createServiceRoleClient } from "@/lib/supabase/server";
import { createInitialGameState } from "@/lib/game/game-engine";
import { StartGameRequestSchema } from "@/lib/validation";
import { checkRateLimit, getRateLimitKey } from "@/lib/utils/rate-limit";
import { randomUUID } from "crypto";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") ?? "unknown";

    const { allowed } = checkRateLimit(
      getRateLimitKey("start", ip),
      20,
      60_000
    );
    if (!allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const body = await request.json() as unknown;
    const parsed = StartGameRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const { mode, category, gauntletId, language, difficulty, roundNumber, totalScore } = parsed.data;

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const serviceClient = createServiceRoleClient();
    const sessionId = randomUUID();

    let finalGauntletId = gauntletId ?? null;
    let practiceSongId = null;

    if (mode === "practice" && !finalGauntletId) {
      // Pick a random song for the practice game
      let query = serviceClient.from("songs").select("id").eq("streamable", true);
      
      if (category && category !== "all") {
        const { data: catData } = await serviceClient
          .from("categories")
          .select("id")
          .eq("slug", category)
          .single();
        if (catData) {
          query = query.eq("category_id", catData.id);
        }
      }

      if (language && language !== "all") {
        query = query.eq("language", language);
      }

      // We only select the id column. Supabase limits to 1000 rows by default but we can fetch them all 
      // or at least a large number since it's just UUIDs, then pick randomly in JS.
      // A better long-term approach for huge tables is a Postgres RPC function returning 1 random row.
      const { data: songs, error: songsErr } = await query.limit(10000);
      
      if (songsErr || !songs || songs.length === 0) {
        return NextResponse.json({ error: "No songs available for practice" }, { status: 404 });
      }

      const randomSong = songs[Math.floor(Math.random() * songs.length)];
      if (!randomSong) {
        return NextResponse.json({ error: "No songs available for practice" }, { status: 404 });
      }
      practiceSongId = randomSong.id;
    }

    const gameState = createInitialGameState({
      sessionId,
      gauntletId: finalGauntletId,
      mode,
      category,
      language,
      difficulty,
      roundNumber: roundNumber ?? 1,
      totalScore: totalScore ?? 0,
    });

    const { error } = await serviceClient.from("game_sessions").insert({
      id: sessionId,
      user_id: user?.id ?? null,
      gauntlet_id: finalGauntletId,
      practice_song_id: practiceSongId,
      mode,
      language,
      difficulty,
      round_number: gameState.roundNumber,
      total_score: gameState.totalScore,
      status: "playing",
      attempts_used: 0,
      current_reveal_stage: 0,
      started_at: gameState.startedAt,
    });

    if (error) {
      console.error("[/api/game/start] DB insert error:", error);
      return NextResponse.json({ error: "Failed to create game session" }, { status: 500 });
    }

    return NextResponse.json({
      sessionId,
      mode,
      category,
      language,
      difficulty,
      gauntletId: finalGauntletId,
      attemptsUsed: 0,
      maxAttempts: gameState.maxAttempts,
      revealStage: 0,
      revealDuration: gameState.revealDuration,
      status: "playing",
      guesses: [],
      roundNumber: gameState.roundNumber,
      totalScore: gameState.totalScore,
    });
  } catch (err) {
    console.error("[/api/game/start] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
