import { MusicProvider, Track } from "./types";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

interface LocalTrack extends Track {
  file: string; // The filename in public/audio/
}

export class LocalMusicProvider implements MusicProvider {
  private getRegistry(): Record<string, LocalTrack> {
    try {
      const path = join(process.cwd(), "public/audio/registry.json");
      if (!existsSync(path)) return {};
      return JSON.parse(readFileSync(path, "utf-8"));
    } catch (err) {
      console.error("[LocalMusicProvider] Failed to read registry:", err);
      return {};
    }
  }

  async searchTracks(query: string, limit = 10, language?: string): Promise<Track[]> {
    const registry = this.getRegistry();
    let tracks = Object.values(registry);
    
    if (language && language !== "all") {
      // For local tracks, we map genre to language for the malayalam tracks
      tracks = tracks.filter(t => 
        (language === "malayalam" && t.genre === "malayalam") ||
        (language === "english" && t.genre !== "malayalam")
      );
    }
    
    const q = query.toLowerCase();
    
    return tracks
      .filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.artist.toLowerCase().includes(q)
      )
      .slice(0, limit);
  }

  async getTrack(id: string): Promise<Track | null> {
    const registry = this.getRegistry();
    return registry[id] || null;
  }

  async getStreamUrl(id: string): Promise<string | null> {
    const registry = this.getRegistry();
    const track = registry[id];
    if (!track) return null;
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    
    if (supabaseUrl) {
      // Direct public URL to the Supabase storage bucket
      return `${supabaseUrl}/storage/v1/object/public/audio/${encodeURIComponent(track.file)}`;
    }
    
    // Fallback to local if no Supabase URL is found
    return `/audio/${encodeURIComponent(track.file)}`;
  }
}
