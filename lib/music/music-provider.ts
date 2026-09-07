export type { MusicProvider, Track } from "./types";

export { SoundCloudProvider } from "./soundcloud-provider";
export { LocalMusicProvider } from "./local-provider";

let _provider: import("./types").MusicProvider | null = null;

export function getMusicProvider(): import("./types").MusicProvider {
  if (!_provider) {
    if (process.env.USE_LOCAL_MUSIC === "true") {
      const { LocalMusicProvider } = require("./local-provider");
      _provider = new LocalMusicProvider() as import("./types").MusicProvider;
    } else {
      const { SoundCloudProvider } = require("./soundcloud-provider");
      _provider = new SoundCloudProvider() as import("./types").MusicProvider;
    }
  }
  return _provider!;
}
