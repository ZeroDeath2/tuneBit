import { createServerClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export interface DailyGauntletInfo {
  gauntletId: string;
  language: string;
  date: string;
}

export async function getDailyGauntlet(
  date: string,
  language: string
): Promise<DailyGauntletInfo | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("daily_gauntlets")
    .select("id, gauntlet_date, language")
    .eq("gauntlet_date", date)
    .eq("language", language)
    .single();

  if (error || !data) {
    // Generate it just-in-time using service role if it doesn't exist
    return await generateGauntlet(date, language);
  }

  return {
    gauntletId: data.id as string,
    language: data.language as string,
    date: data.gauntlet_date as string,
  };
}

async function generateGauntlet(
  date: string,
  language: string
): Promise<DailyGauntletInfo | null> {
  const serviceClient = createServiceRoleClient();

  let query = serviceClient.from("songs").select("id").eq("streamable", true);
  if (language !== "all") {
    query = query.eq("language", language);
  }

  const { data: songs, error } = await query.limit(500);

  if (error || !songs || songs.length < 3) {
    console.error(`Not enough songs to generate gauntlet for ${language}`);
    return null;
  }

  // Shuffle and pick 3 using a seeded random based on date and language
  const seed = hashDateCategory(date, language);
  const shuffled = [...songs].sort((a, b) => {
    const hashA = hashDateCategory(date, a.id);
    const hashB = hashDateCategory(date, b.id);
    return hashA - hashB; // deterministic sort
  });

  // Since we used deterministic sort, we can just take first 3, but let's rotate them by seed just in case
  const offset = seed % Math.max(1, songs.length - 2);
  const pickedIds = [
    shuffled[offset % shuffled.length]?.id,
    shuffled[(offset + 1) % shuffled.length]?.id,
    shuffled[(offset + 2) % shuffled.length]?.id,
  ].filter(Boolean);

  if (pickedIds.length < 3) {
    return null;
  }

  const { data: newGauntlet, error: insertError } = await serviceClient
    .from("daily_gauntlets")
    .insert({
      gauntlet_date: date,
      language,
      song_ids: pickedIds,
    })
    .select("id")
    .single();

  if (insertError || !newGauntlet) {
    console.error("Failed to insert daily gauntlet:", insertError);
    return null;
  }

  return {
    gauntletId: newGauntlet.id as string,
    language,
    date,
  };
}

export function hashDateCategoryForTest(date: string, category: string): number {
  return hashDateCategory(date, category);
}

function hashDateCategory(date: string, category: string): number {
  const str = `${date}:${category}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

