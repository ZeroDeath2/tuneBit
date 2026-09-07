#!/usr/bin/env tsx
/**
 * Song import CLI
 * Usage:
 *   npm run songs:import -- --query "pop hits 2024" --limit 20 --category pop
 *   npm run songs:import -- --csv ./songs.csv --category hiphop
 *
 * Required env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *                    SOUNDCLOUD_CLIENT_ID, SOUNDCLOUD_CLIENT_SECRET
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { parseArgs } from "util";
import { readFileSync } from "fs";
import { parse } from "csv-parse/sync";
import { getMusicProvider } from "../lib/music/music-provider";

const { values: args } = parseArgs({
  options: {
    query:    { type: "string", short: "q" },
    limit:    { type: "string", short: "l", default: "20" },
    category: { type: "string", short: "c", default: "all" },
    csv:      { type: "string" },
    "dry-run":{ type: "boolean", default: false },
  },
});

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌  NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  process.exit(1);
}

// Polyfill WebSocket for Node 18 (required by Supabase v3)
if (typeof global.WebSocket === "undefined") {
  global.WebSocket = require("ws");
}

const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function getCategoryId(slug: string): Promise<string | null> {
  const { data } = await db.from("categories").select("id").eq("slug", slug).single();
  if (data?.id) return data.id;

  // Create it if missing
  const { data: newCategory, error } = await db.from("categories")
    .insert({
      slug,
      label: slug.charAt(0).toUpperCase() + slug.slice(1),
      description: `Auto-created ${slug} category`
    })
    .select("id")
    .single();

  if (error) {
    console.error(`❌ Failed to create category '${slug}':`, error.message);
    return null;
  }
  return newCategory?.id ?? null;
}

async function upsertSong(row: {
  soundcloudId: string;
  title: string;
  artist: string;
  artworkUrl?: string;
  genre?: string;
  categoryId?: string;
  dryRun: boolean;
}) {
  if (row.dryRun) {
    console.log(`  [dry-run] Would upsert: "${row.title}" by ${row.artist} (sc:${row.soundcloudId})`);
    return;
  }

  const { error } = await db.from("songs").upsert(
    {
      soundcloud_id: row.soundcloudId,
      title: row.title,
      artist: row.artist,
      artwork_url: row.artworkUrl ?? null,
      genre: row.genre ?? null,
      category_id: row.categoryId ?? null,
      streamable: true,
    },
    { onConflict: "soundcloud_id" }
  );

  if (error) {
    console.error(`  ❌ Failed to upsert "${row.title}": ${error.message}`);
  } else {
    console.log(`  ✅ "${row.title}" by ${row.artist}`);
  }
}

async function main() {
  const isDryRun = Boolean(args["dry-run"]);
  const categorySlug = args.category ?? "all";
  const categoryId = await getCategoryId(categorySlug);

  if (!categoryId) {
    console.error(`❌  Unknown category slug: ${categorySlug}`);
    process.exit(1);
  }

  console.log(`\n📂 Category: ${categorySlug} (${categoryId})`);
  if (isDryRun) console.log("🔍 DRY RUN — nothing will be written\n");

  if (args.csv) {
    // Import from CSV file
    console.log(`📄 Importing from CSV: ${args.csv}\n`);
    const raw = readFileSync(args.csv, "utf-8");
    const rows = parse(raw, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

    for (const row of rows) {
      const id = row["soundcloud_id"] ?? row["id"];
      const title = row["title"];
      const artist = row["artist"];
      if (!id || !title || !artist) {
        console.warn(`  ⚠️  Skipping row with missing fields: ${JSON.stringify(row)}`);
        continue;
      }
      await upsertSong({
        soundcloudId: id,
        title,
        artist,
        artworkUrl: row["artwork_url"],
        genre: row["genre"],
        categoryId,
        dryRun: isDryRun,
      });
    }
  } else if (args.query) {
    // Search provider and import results
    const limit = parseInt(args.limit ?? "20", 10);
    console.log(`🔎 Searching music provider: "${args.query}" (limit: ${limit})\n`);

    const provider = getMusicProvider();
    const tracks = await provider.searchTracks(args.query, limit);

    if (tracks.length === 0) {
      console.log("No tracks found.");
      return;
    }

    for (const track of tracks) {
      await upsertSong({
        soundcloudId: track.id,
        title: track.title,
        artist: track.artist,
        artworkUrl: track.artworkUrl,
        genre: track.genre,
        categoryId,
        dryRun: isDryRun,
      });
    }
  } else {
    console.error("❌  Provide either --query or --csv");
    process.exit(1);
  }

  console.log("\n✨ Done");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
