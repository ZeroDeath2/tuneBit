import { NextResponse } from "next/server";
import { createServerClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getMusicProvider } from "@/lib/music/music-provider";
import { checkRateLimit, getRateLimitKey } from "@/lib/utils/rate-limit";
import { headers } from "next/headers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") ?? "unknown";

    const { allowed } = checkRateLimit(
      getRateLimitKey("stream", ip),
      30,
      60_000
    );
    if (!allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const { id: sessionId } = await params;
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const serviceClient = createServiceRoleClient();

    const { data: session, error } = await serviceClient
      .from("game_sessions")
      .select("gauntlet_id, practice_song_id, round_number, user_id, status, mode")
      .eq("id", sessionId)
      .single();

    if (error || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.user_id && session.user_id !== user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    let soundcloudId: string | null = null;

    if (session.mode === "practice" && session.practice_song_id) {
      const { data: song } = await serviceClient
        .from("songs")
        .select("soundcloud_id")
        .eq("id", session.practice_song_id)
        .single();
      soundcloudId = song?.soundcloud_id ?? null;
    } else if (session.gauntlet_id) {
      const { data: gauntlet } = await serviceClient
        .from("daily_gauntlets")
        .select("song_ids")
        .eq("id", session.gauntlet_id)
        .single();
        
      if (gauntlet && Array.isArray(gauntlet.song_ids)) {
        const roundIndex = (session.round_number || 1) - 1;
        const currentSongId = gauntlet.song_ids[roundIndex];
        
        if (currentSongId) {
          const { data: song } = await serviceClient
            .from("songs")
            .select("soundcloud_id")
            .eq("id", currentSongId)
            .single();
          soundcloudId = song?.soundcloud_id ?? null;
        }
      }
    }

    if (!soundcloudId) {
      return NextResponse.json({ error: "Song not found for this session" }, { status: 404 });
    }

    const provider = getMusicProvider();
    const streamUrl = await provider.getStreamUrl(soundcloudId);

    if (!streamUrl) {
      return NextResponse.json({ error: "Stream unavailable" }, { status: 503 });
    }

    return NextResponse.json({ streamUrl });
  } catch (err) {
    console.error("[/api/game/[id]/stream] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
