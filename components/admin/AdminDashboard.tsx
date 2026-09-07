"use client";

import { useState, useCallback } from "react";
import { Search, Plus, Loader2, Check } from "lucide-react";
import type { Track } from "@/lib/music/types";

interface SongRow {
  id: string;
  soundcloudId: string;
  title: string;
  artist: string;
  artworkUrl?: string;
  added: boolean;
}

export function AdminDashboard() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set());
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    try {
      const res = await fetch(`/api/songs/search?q=${encodeURIComponent(query)}&limit=20`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json() as { tracks: Track[] };
      setResults(data.tracks);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Search error");
    } finally {
      setIsSearching(false);
    }
  }, [query]);

  const addSong = useCallback(async (track: Track) => {
    setAddingIds((prev) => new Set([...prev, track.id]));
    try {
      const res = await fetch("/api/admin/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          soundcloudId: track.id,
          title: track.title,
          artist: track.artist,
          artworkUrl: track.artworkUrl,
          genre: track.genre,
        }),
      });
      if (!res.ok) throw new Error("Failed to add song");
      setAddedIds((prev) => new Set([...prev, track.id]));
    } catch (err) {
      console.error("[AdminDashboard.addSong]", err);
    } finally {
      setAddingIds((prev) => {
        const next = new Set(prev);
        next.delete(track.id);
        return next;
      });
    }
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Admin Dashboard</h1>

      {/* Song search */}
      <section className="space-y-3">
        <h2 className="font-semibold">Add Songs</h2>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void handleSearch(); }}
              placeholder="Search SoundCloud…"
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : "Search"}
          </button>
        </div>

        {searchError && (
          <p className="text-destructive text-sm" role="alert">{searchError}</p>
        )}

        {results.length > 0 && (
          <ul className="space-y-2 max-h-[60vh] overflow-y-auto" aria-label="Search results">
            {results.map((track) => (
              <li
                key={track.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg border bg-card"
              >
                {track.artworkUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={track.artworkUrl}
                    alt=""
                    aria-hidden
                    className="w-10 h-10 rounded object-cover shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{track.title}</p>
                  <p className="text-muted-foreground text-xs truncate">{track.artist}</p>
                </div>
                <button
                  onClick={() => void addSong(track)}
                  disabled={addingIds.has(track.id) || addedIds.has(track.id)}
                  aria-label={addedIds.has(track.id) ? "Song added" : `Add ${track.title}`}
                  className="shrink-0 w-8 h-8 flex items-center justify-center rounded-md border hover:bg-accent transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {addingIds.has(track.id) ? (
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                  ) : addedIds.has(track.id) ? (
                    <Check className="w-4 h-4 text-correct" aria-hidden />
                  ) : (
                    <Plus className="w-4 h-4" aria-hidden />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
