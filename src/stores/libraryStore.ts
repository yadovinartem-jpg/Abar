import { create } from "zustand";
import { MOCK_TRACKS, MOCK_PLAYLISTS, MOCK_ARTISTS, MOCK_PROFILES } from "@/constants/mockData";
import type { Track, Playlist, Artist, UserProfile, Tag } from "@/types/music";

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
  addTagToTrack: (id: string, tag: Tag) => void;
  setLater: (id: string) => void;
  pushRecent: (id: string) => void;
  saveProfile: (id: string) => void;
  unsaveProfile: (id: string) => void;
  reorderPlaylists: (from: number, to: number) => void;
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
}));
