import { NextResponse } from "next/server";
import { createServerClient, createServiceRoleClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const serviceClient = createServiceRoleClient();

    const { data: session, error } = await serviceClient
      .from("game_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.user_id && session.user_id !== user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { data: guesses } = await serviceClient
      .from("game_guesses")
      .select("guessed_song_id, attempt_number, is_correct, created_at, songs(title, artist)")
      .eq("session_id", sessionId)
      .order("attempt_number", { ascending: true });

    const response: Record<string, unknown> = {
      sessionId,
      gauntletId: session.gauntlet_id,
      status: session.status,
      attemptsUsed: session.attempts_used,
      maxAttempts: 6,
      revealStage: session.current_reveal_stage,
      mode: session.mode,
      roundNumber: session.round_number,
      totalScore: session.total_score,
      guesses: (guesses ?? []).map((g) => ({
        songId: g.guessed_song_id,
        title: (g.songs as unknown as { title: string } | null)?.title,
        artist: (g.songs as unknown as { artist: string } | null)?.artist,
        type: g.guessed_song_id ? "guess" : "skip",
        correct: g.is_correct,
        attemptNumber: g.attempt_number,
        timestamp: g.created_at,
      })),
    };

    if (session.status !== "playing") {
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
    console.error("[/api/game/[id]] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
