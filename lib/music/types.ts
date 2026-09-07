export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  artworkUrl?: string;
  duration?: number;
  streamable: boolean;
  genre?: string;
  permalinkUrl?: string;
}

export interface MusicProvider {
  searchTracks(query: string, limit?: number, language?: string): Promise<Track[]>;
  getTrack(id: string): Promise<Track | null>;
  getStreamUrl(id: string): Promise<string | null>;
}
