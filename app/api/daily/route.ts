import { NextResponse } from "next/server";
import { getDailyGauntlet } from "@/lib/game/gauntlet-selector";
import { getRevealStages, MAX_ATTEMPTS } from "@/lib/game/reveal-stages";
import { getTodayUTC } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const language = url.searchParams.get("language");
    
    const today = getTodayUTC();

    if (language) {
      const gauntlet = await getDailyGauntlet(today, language);
      if (!gauntlet) {
        return NextResponse.json(
          { error: "No gauntlet available for today" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        gauntletId: gauntlet.gauntletId,
        language: gauntlet.language,
        date: today,
        maxAttempts: MAX_ATTEMPTS,
        revealStages: getRevealStages(),
      });
    } else {
      // Fetch all 3
      const languages = ["all", "english", "malayalam"];
      const gauntlets = await Promise.all(
        languages.map(lang => getDailyGauntlet(today, lang))
      );

      return NextResponse.json({
        date: today,
        gauntlets: gauntlets.filter(Boolean),
      });
    }
  } catch (err) {
    console.error("[/api/daily] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
