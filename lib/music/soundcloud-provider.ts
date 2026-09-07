import type { MusicProvider, Track } from "./types";

interface SoundCloudTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface SoundCloudTrack {
  id: number;
  title: string;
  user: { username: string };
  artwork_url: string | null;
  duration: number;
  streamable: boolean;
  genre: string | null;
  permalink_url: string;
  stream_url?: string;
  media?: {
    transcodings: Array<{
      url: string;
      format: { protocol: string; mime_type: string };
    }>;
  };
}

interface SoundCloudSearchResponse {
  collection: SoundCloudTrack[];
  total_results: number;
}

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const clientId = process.env.SOUNDCLOUD_CLIENT_ID;
  const clientSecret = process.env.SOUNDCLOUD_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("SoundCloud credentials not configured");
  }

  const response = await fetch("https://api.soundcloud.com/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`SoundCloud auth failed: ${response.status}`);
  }

  const data = (await response.json()) as SoundCloudTokenResponse;
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + data.expires_in * 1000;
  return cachedToken;
}

async function scFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const token = await getAccessToken();
  const url = new URL(`https://api.soundcloud.com${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `OAuth ${token}`,
      Accept: "application/json; charset=utf-8",
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`SoundCloud API error ${response.status} for ${path}`);
  }

  return response.json() as Promise<T>;
}

function mapTrack(t: SoundCloudTrack): Track {
  return {
    id: String(t.id),
    title: t.title,
    artist: t.user.username,
    artworkUrl: t.artwork_url?.replace("-large", "-t500x500") ?? undefined,
    duration: Math.round(t.duration / 1000),
    streamable: t.streamable,
    genre: t.genre ?? undefined,
    permalinkUrl: t.permalink_url,
  };
}

export class SoundCloudProvider implements MusicProvider {
  async searchTracks(query: string, limit = 10, language?: string): Promise<Track[]> {
    try {
      const data = await scFetch<SoundCloudSearchResponse>("/tracks", {
        q: query,
        limit: String(limit),
        streamable: "true",
        access: "playable",
      });
      let tracks = data.collection.filter((t) => t.streamable).map(mapTrack);
      
      // Attempt rudimentary language filtering if possible, though SoundCloud doesn't have a strict language query param
      if (language && language !== "all") {
        if (language === "malayalam") {
          tracks = tracks.filter(t => t.genre?.toLowerCase().includes("malayalam"));
        } else if (language === "english") {
          tracks = tracks.filter(t => !t.genre?.toLowerCase().includes("malayalam"));
        }
      }
      
      return tracks;
    } catch (err) {
      console.error("[SoundCloud] searchTracks error:", err);
      return [];
    }
  }

  async getTrack(id: string): Promise<Track | null> {
    try {
      const track = await scFetch<SoundCloudTrack>(`/tracks/${id}`);
      return mapTrack(track);
    } catch {
      return null;
    }
  }

  async getStreamUrl(id: string): Promise<string | null> {
    try {
      const track = await scFetch<SoundCloudTrack>(`/tracks/${id}`);

      const transcodings = track.media?.transcodings ?? [];
      const progressive = transcodings.find(
        (t) =>
          t.format.protocol === "progressive" &&
          t.format.mime_type === "audio/mpeg"
      );

      const transcoding = progressive ?? transcodings[0];
      if (!transcoding) return null;

      const streamResponse = await scFetch<{ url: string }>(
        transcoding.url.replace("https://api.soundcloud.com", "")
      );

      return streamResponse.url ?? null;
    } catch {
      return null;
    }
  }
}
