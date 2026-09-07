import { NextResponse } from "next/server";
import { createServerClient, createServiceRoleClient } from "@/lib/supabase/server";
import { LeaderboardQuerySchema } from "@/lib/validation";

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to view the leaderboard" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const parsed = LeaderboardQuerySchema.safeParse({
      window: searchParams.get("window") ?? "today",
      language: searchParams.get("language") ?? "all",
      limit: searchParams.get("limit") ?? "20",
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    }

    const { window, language, limit } = parsed.data;
    const serviceClient = createServiceRoleClient();
    const today = new Date().toISOString().slice(0, 10);

    let dateFilter: string | null = null;
    if (window === "today") dateFilter = today;
    else if (window === "week") {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      dateFilter = d.toISOString().slice(0, 10);
    }

    let query = serviceClient
      .from("leaderboard_entries")
      .select(
        `
        id,
        attempts,
        score,
        completed_at,
        profiles!inner ( display_name, avatar_url ),
        daily_gauntlets!inner ( language )
      `
      )
      .eq("daily_gauntlets.language", language)
      .order("score", { ascending: false })
      .order("attempts", { ascending: true })
      .order("completed_at", { ascending: true })
      .limit(limit);

    if (dateFilter) {
      query = query.gte("completed_at", `${dateFilter}T00:00:00Z`);
    }

    const { data: entries, error } = await query;

    if (error) {
      console.error("[/api/leaderboard] query error:", error);
      return NextResponse.json({ error: "Failed to load leaderboard" }, { status: 500 });
    }

    const ranked = (entries ?? []).map((e, i) => ({
      rank: i + 1,
      score: e.score,
      attempts: e.attempts,
      completedAt: e.completed_at,
      displayName: (e.profiles as unknown as { display_name: string })?.display_name ?? "Anonymous",
      avatarUrl: (e.profiles as unknown as { avatar_url: string | null })?.avatar_url ?? null,
    }));

    return NextResponse.json({ entries: ranked, window });
  } catch (err) {
    console.error("[/api/leaderboard] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
