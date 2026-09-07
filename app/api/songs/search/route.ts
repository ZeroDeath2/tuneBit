import { NextResponse } from "next/server";
import { getMusicProvider } from "@/lib/music/music-provider";
import { SearchQuerySchema } from "@/lib/validation";
import { checkRateLimit, getRateLimitKey } from "@/lib/utils/rate-limit";
import { headers } from "next/headers";

export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") ?? "unknown";

    const { allowed } = checkRateLimit(
      getRateLimitKey("search", ip),
      30,
      60_000
    );
    if (!allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const parsed = SearchQuerySchema.safeParse({
      q: searchParams.get("q"),
      limit: searchParams.get("limit") ?? "10",
      language: searchParams.get("language") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    }

    const { q, limit, language } = parsed.data;
    const provider = getMusicProvider();
    const tracks = await provider.searchTracks(q, limit, language);

    return NextResponse.json(
      { tracks },
      {
        headers: {
          "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    console.error("[/api/songs/search] error:", err);
    return NextResponse.json({ error: "Search unavailable" }, { status: 503 });
  }
}
