import { NextResponse } from "next/server";
import { createServerClient, createServiceRoleClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const serviceClient = createServiceRoleClient();

    const { data: stats } = await serviceClient
      .from("user_stats")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const { data: leaderboardEntries } = await serviceClient
      .from("leaderboard_entries")
      .select("attempts")
      .eq("user_id", user.id);

    const { data: lostSessions } = await serviceClient
      .from("game_sessions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "lost")
      .eq("mode", "daily");

    const distribution: Record<string, number> = {
      "3-5": 0, "6-8": 0, "9-11": 0, "12-14": 0, "15-18": 0, X: 0,
    };

    (leaderboardEntries ?? []).forEach((e) => {
      const a = e.attempts;
      if (a >= 3 && a <= 5) distribution["3-5"] = (distribution["3-5"] || 0) + 1;
      else if (a >= 6 && a <= 8) distribution["6-8"] = (distribution["6-8"] || 0) + 1;
      else if (a >= 9 && a <= 11) distribution["9-11"] = (distribution["9-11"] || 0) + 1;
      else if (a >= 12 && a <= 14) distribution["12-14"] = (distribution["12-14"] || 0) + 1;
      else if (a >= 15 && a <= 18) distribution["15-18"] = (distribution["15-18"] || 0) + 1;
    });

    distribution["X"] = lostSessions?.length ?? 0;

    const gamesPlayed = stats?.games_played ?? 0;
    const gamesWon = stats?.games_won ?? 0;

    return NextResponse.json({
      gamesPlayed,
      gamesWon,
      winPercentage: gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0,
      currentStreak: stats?.current_streak ?? 0,
      bestStreak: stats?.best_streak ?? 0,
      averageAttempts: stats?.average_attempts ?? 0,
      distribution,
    });
  } catch (err) {
    console.error("[/api/stats] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
