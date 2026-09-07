import { MusicProvider, Track } from "./types";

interface LocalTrack extends Track {
  file: string; // The filename in public/audio/
}

export class LocalMusicProvider implements MusicProvider {
  private async getRegistry(): Promise<Record<string, LocalTrack>> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) return {};
      
      const registryUrl = `${supabaseUrl}/storage/v1/object/public/audio/registry.json`;
      const res = await fetch(registryUrl, { next: { revalidate: 3600 } });
      
      if (!res.ok) {
        console.error("[LocalMusicProvider] Failed to fetch registry from Supabase");
        return {};
      }
      
      return await res.json();
    } catch (err) {
      console.error("[LocalMusicProvider] Error reading registry:", err);
      return {};
    }
  }

  async searchTracks(query: string, limit = 10, language?: string): Promise<Track[]> {
    const registry = await this.getRegistry();
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
    const registry = await this.getRegistry();
    return registry[id] || null;
  }

  async getStreamUrl(id: string): Promise<string | null> {
    const registry = await this.getRegistry();
    const track = registry[id];
    if (!track) return null;
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    
    if (supabaseUrl) {
      // Direct public URL to the Supabase storage bucket
      return `${supabaseUrl}/storage/v1/object/public/audio/${encodeURIComponent(track.file)}`;
    }
    
    return null;
  }
}
