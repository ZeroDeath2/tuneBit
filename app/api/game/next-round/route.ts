import { NextResponse } from "next/server";
import { createServerClient, createServiceRoleClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { sessionId: string };
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

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

    if (session.mode !== "daily") {
      return NextResponse.json({ error: "Next round is only for daily gauntlets" }, { status: 400 });
    }

    if (session.round_number >= 3) {
      return NextResponse.json({ error: "Gauntlet already complete" }, { status: 400 });
    }

    const newRoundNumber = (session.round_number || 1) + 1;

    const { error: updateError } = await serviceClient
      .from("game_sessions")
      .update({
        round_number: newRoundNumber,
        status: "playing",
        attempts_used: 0,
        current_reveal_stage: 0,
        completed_at: null,
      })
      .eq("id", sessionId);

    if (updateError) {
      console.error("[/api/game/next-round] update error:", updateError);
      return NextResponse.json({ error: "Failed to advance round" }, { status: 500 });
    }

    return NextResponse.json({ success: true, roundNumber: newRoundNumber });
  } catch (err) {
    console.error("[/api/game/next-round] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
