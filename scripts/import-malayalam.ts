import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";
import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const registryPath = join(process.cwd(), "public/audio/registry.json");
  const registry = JSON.parse(readFileSync(registryPath, "utf-8"));
  
  const songs = Object.values(registry).filter((s: any) => s.genre === "malayalam");
  console.log(`Found ${songs.length} malayalam songs to import to Supabase`);
  
  // Get category ID or create it
  let { data: catData } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", "malayalam")
    .single();
    
  if (!catData) {
    console.log("Category 'malayalam' not found, creating...");
    const { data: newCat, error: createError } = await supabase
      .from("categories")
      .insert({ slug: "malayalam", label: "Malayalam", description: "Malayalam Dance Hits" })
      .select("id")
      .single();
      
    if (createError) throw createError;
    catData = newCat;
  }
  
  const categoryId = catData.id;
  let success = 0;
  
  for (const s of songs as any[]) {
    const { error } = await supabase.from("songs").upsert({
      soundcloud_id: s.id, 
      title: s.title,
      artist: s.artist,
      artwork_url: s.artworkUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop",
      streamable: s.streamable ?? true,
      category_id: categoryId,
      normalized_title: s.title.toLowerCase().replace(/[^a-z0-9]/g, ""),
      normalized_artist: s.artist.toLowerCase().replace(/[^a-z0-9]/g, ""),
    }, { onConflict: 'soundcloud_id' });
    
    if (error) {
      console.error(`Error inserting ${s.title}:`, error.message);
    } else {
      success++;
      console.log(`Imported ${success}/${songs.length}: ${s.title}`);
    }
  }
  
  console.log(`\nImport complete: ${success}/${songs.length} imported.`);
}

main().catch(console.error);
