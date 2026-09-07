import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { ShareRequestSchema } from "@/lib/validation";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json() as unknown;
    const parsed = ShareRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { sessionId } = parsed.data;
    const serviceClient = createServiceRoleClient();

    const { data: session } = await serviceClient
      .from("game_sessions")
      .select("status, attempts_used, gauntlet_id, practice_song_id, mode, round_number, total_score, language")
      .eq("id", sessionId)
      .single();

    if (!session || session.status === "playing") {
      return NextResponse.json({ error: "Game not completed" }, { status: 400 });
    }

    const { data: guesses } = await serviceClient
      .from("game_guesses")
      .select("is_correct, guessed_song_id, round_number")
      .eq("session_id", sessionId)
      .order("round_number", { ascending: true })
      .order("attempt_number", { ascending: true });

    let shareText = "";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://tunebit.zeusserver.in";

    if (session.mode === "practice" && session.practice_song_id) {
      const { data: song } = await serviceClient
        .from("songs")
        .select("title, artist")
        .eq("id", session.practice_song_id)
        .single();

      const title = song?.title ?? "Unknown";
      const artist = song?.artist ?? "Unknown";

      const emojiGrid = (guesses ?? [])
        .map((g) => {
          if (g.is_correct) return "🟩";
          if (g.guessed_song_id === null) return "⬛";
          return "🟥";
        })
        .join("");

      shareText = `TuneBit Practice\n${emojiGrid}\n${session.attempts_used}/6\n${title} by ${artist}\n${appUrl}`;
    } else if (session.gauntlet_id) {
      if (session.round_number !== 3) {
         return NextResponse.json({ error: "Gauntlet not fully completed" }, { status: 400 });
      }

      // Group guesses by round
      const rounds: Record<number, typeof guesses> = { 1: [], 2: [], 3: [] };
      (guesses ?? []).forEach(g => {
        const r = g.round_number || 1;
        if (rounds[r]) {
          rounds[r].push(g);
        }
      });

      const grids = [1, 2, 3].map(r => {
        const roundGuesses = rounds[r] || [];
        return roundGuesses.map((g) => {
          if (g.is_correct) return "🟩";
          if (g.guessed_song_id === null) return "⬛";
          return "🟥";
        }).join("");
      });

      const totalAttempts = (guesses ?? []).length;
      const langLabel = session.language ? session.language.charAt(0).toUpperCase() + session.language.slice(1) : "Daily";
      
      shareText = `TuneBit ${langLabel} Gauntlet\n${grids[0]}\n${grids[1]}\n${grids[2]}\nScore: ${session.total_score} | ${totalAttempts}/18 attempts\n${appUrl}`;
    } else {
      return NextResponse.json({ error: "Could not find game data for session" }, { status: 404 });
    }

    const shareId = randomUUID();

    return NextResponse.json({
      shareId,
      shareText,
      url: `${appUrl}`,
    });
  } catch (err) {
    console.error("[/api/share] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
