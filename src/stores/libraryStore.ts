import { create } from "zustand";
import { MOCK_TRACKS, MOCK_PLAYLISTS, MOCK_ARTISTS, MOCK_PROFILES, GENIUS_ARTIST_NAMES } from "@/constants/mockData";
import type { Track, Playlist, Artist, UserProfile, Tag } from "@/types/music";

function normalizeArtistName(name: string): string {
  const lower = name.toLowerCase().trim();
  return GENIUS_ARTIST_NAMES[lower] ?? name;
}

interface LibraryState {
  tracks: Track[];
  playlists: Playlist[];
  artists: Artist[];
  recentlyPlayedIds: string[];
  laterListIds: string[];
  profiles: UserProfile[];
  savedProfileIds: string[];

  setTracks: (t: Track[]) => void;
  updateTrack: (id: string, patch: Partial<Track>) => void;
  removeTrack: (id: string, fromPlatform?: boolean) => void;
  addTrackAgain: (id: string) => void;
  addTrack: (track: Track) => void;
  addTagToTrack: (id: string, tag: Tag) => void;
  setLater: (id: string) => void;
  pushRecent: (id: string) => void;
  saveProfile: (id: string) => void;
  unsaveProfile: (id: string) => void;
  reorderPlaylists: (from: number, to: number) => void;
  reorderArtists: (from: number, to: number) => void;
  reorderTracksById: (fromId: string, toId: string) => void;
  updatePlaylist: (id: string, patch: Partial<Playlist>) => void;
  deletePlaylist: (id: string) => void;
  addTrackToPlaylist: (playlistId: string, trackId: string) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
}

const initialRecent = MOCK_TRACKS.slice(0, 18).map(t => t.id);

export const useLibrary = create<LibraryState>((set) => ({
  tracks: MOCK_TRACKS,
  playlists: MOCK_PLAYLISTS,
  artists: MOCK_ARTISTS,
  recentlyPlayedIds: initialRecent,
  laterListIds: [],
  profiles: MOCK_PROFILES,
  savedProfileIds: ["u-1", "u-4"],

  setTracks: (tracks) => set({ tracks }),
  updateTrack: (id, patch) =>
    set((s) => ({ tracks: s.tracks.map(t => t.id === id ? { ...t, ...patch } : t) })),
  removeTrack: (id, fromPlatform) =>
    set((s) => ({
      tracks: fromPlatform
        ? s.tracks.filter(t => t.id !== id)
        : s.tracks.map(t => t.id === id ? { ...t, addedCount: 0 } : t),
    })),
  addTrackAgain: (id) =>
    set((s) => {
      const t = s.tracks.find(x => x.id === id);
      if (!t) return s;
      const updated = { ...t, addedCount: t.addedCount + 1, addedAt: Date.now() };
      const others = s.tracks.filter(x => x.id !== id);
      return { tracks: [updated, ...others] };
    }),
  addTrack: (track) =>
    set((s) => {
      const normalizedArtist = normalizeArtistName(track.artist);
      const newTrack: Track = { ...track, artist: normalizedArtist, addedAt: Date.now() };
      const tracks = [newTrack, ...s.tracks];

      // auto-create artist circle if new
      const exists = s.artists.some(a => a.name.toLowerCase() === normalizedArtist.toLowerCase());
      const artists = exists
        ? s.artists
        : [
            { id: `artist-${Date.now()}`, name: normalizedArtist, cover: track.cover },
            ...s.artists,
          ];

      return { tracks, artists };
    }),
  addTagToTrack: (id, tag) =>
    set((s) => ({
      tracks: s.tracks.map(t =>
        t.id === id ? { ...t, tags: [...t.tags, tag] } : t
      ),
    })),
  setLater: (id) =>
    set((s) => ({
      laterListIds: s.laterListIds.includes(id)
        ? s.laterListIds.filter(x => x !== id)
        : [...s.laterListIds, id],
    })),
  pushRecent: (id) =>
    set((s) => ({
      recentlyPlayedIds: [id, ...s.recentlyPlayedIds.filter(x => x !== id)].slice(0, 30),
    })),
  saveProfile: (id) =>
    set((s) => ({
      savedProfileIds: s.savedProfileIds.includes(id) ? s.savedProfileIds : [...s.savedProfileIds, id],
    })),
  unsaveProfile: (id) =>
    set((s) => ({ savedProfileIds: s.savedProfileIds.filter(x => x !== id) })),
  reorderPlaylists: (from, to) =>
    set((s) => {
      const list = [...s.playlists];
      const [item] = list.splice(from, 1);
      list.splice(to, 0, item);
      return { playlists: list };
    }),
  reorderArtists: (from, to) =>
    set((s) => {
      const list = [...s.artists];
      const [item] = list.splice(from, 1);
      list.splice(to, 0, item);
      return { artists: list };
    }),
  reorderTracksById: (fromId, toId) =>
    set((s) => {
      const list = [...s.tracks];
      const fromIdx = list.findIndex(t => t.id === fromId);
      const toIdx = list.findIndex(t => t.id === toId);
      if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return s;
      const [item] = list.splice(fromIdx, 1);
      list.splice(toIdx, 0, item);
      return { tracks: list };
    }),
  updatePlaylist: (id, patch) =>
    set((s) => ({
      playlists: s.playlists.map(p => p.id === id ? { ...p, ...patch } : p),
    })),
  deletePlaylist: (id) =>
    set((s) => ({ playlists: s.playlists.filter(p => p.id !== id) })),
  addTrackToPlaylist: (playlistId, trackId) =>
    set((s) => ({
      playlists: s.playlists.map(p =>
        p.id === playlistId
          ? { ...p, trackIds: p.trackIds.includes(trackId) ? p.trackIds : [...p.trackIds, trackId] }
          : p
      ),
    })),
  removeTrackFromPlaylist: (playlistId, trackId) =>
    set((s) => ({
      playlists: s.playlists.map(p =>
        p.id === playlistId
          ? { ...p, trackIds: p.trackIds.filter(id => id !== trackId) }
          : p
      ),
    })),
}));
