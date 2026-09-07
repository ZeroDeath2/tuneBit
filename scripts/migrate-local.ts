import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, readdirSync, renameSync } from "fs";
import { join } from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing supabase credentials");
  process.exit(1);
}

if (typeof global.WebSocket === "undefined") {
  global.WebSocket = require("ws");
}

const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const audioDir = join(process.cwd(), "public/audio");
  const metadataPath = join(audioDir, "songsmetadata.txt");
  const registryPath = join(audioDir, "registry.json");

  const metadata = readFileSync(metadataPath, "utf-8");
  const lines = metadata.split("\n");
  const registry: Record<string, any> = {};

  const files = readdirSync(audioDir);

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (!line || !line.trim()) continue;
    line = line.trim();

    const idNum = (i + 1).toString();
    const match = line.match(/^([^-]+)\s*-\s*(.+)$/);
    if (!match) {
      console.warn(`Could not parse line: ${line}`);
      continue;
    }

    const artist = match[1]!.trim();
    let title = match[2]!.trim();
    
    // Some lines have extra weird spaces
    title = title.replace(/\s+/g, " ");

    const existingFile = files.find(f => f.startsWith(`${idNum}.`) && f.endsWith(".mp3"));
    if (!existingFile) {
      console.warn(`Could not find mp3 file for id ${idNum}`);
      continue;
    }

    // Replace invalid filename characters
    const safeTitle = title.replace(/[<>:"/\\|?*]/g, "_");
    const newFileName = `${safeTitle}.mp3`;
    
    // Rename
    const oldPath = join(audioDir, existingFile);
    const newPath = join(audioDir, newFileName);
    if (oldPath !== newPath) {
      renameSync(oldPath, newPath);
      console.log(`Renamed: ${existingFile} -> ${newFileName}`);
    }

    const localId = `local_song_${idNum}`;
    
    registry[localId] = {
      id: localId,
      title: title,
      artist: artist,
      artworkUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop",
      streamable: true,
      genre: "pop",
      file: newFileName
    };
  }

  writeFileSync(registryPath, JSON.stringify(registry, null, 2));
  console.log("Updated registry.json");

  // Get or create category
  const { data: catData } = await db.from("categories").select("id").eq("slug", "pop").single();
  let categoryId = catData?.id;
  if (!categoryId) {
    const { data: newCat } = await db.from("categories").insert({
      slug: "pop",
      name: "Pop",
      description: "Pop hits"
    }).select("id").single();
    categoryId = newCat?.id;
  }

  // Insert into Supabase
  for (const key of Object.keys(registry)) {
    const song = registry[key];
    const { error } = await db.from("songs").upsert({
      soundcloud_id: song.id,
      title: song.title,
      artist: song.artist,
      artwork_url: song.artworkUrl,
      genre: song.genre,
      category_id: categoryId,
      streamable: true
    }, { onConflict: "soundcloud_id" });

    if (error) {
      console.error(`Failed to insert ${song.title}:`, error);
    } else {
      console.log(`Inserted to DB: ${song.title}`);
    }
  }
}

main().catch(console.error);
