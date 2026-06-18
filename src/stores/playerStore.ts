import { create } from "zustand";
import type { RepeatMode, Track } from "@/types/music";

interface PlayerState {
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  progress: number; // seconds played
  volume: number; // 0..1
  shuffle: boolean;
  repeat: RepeatMode;
  playbackRate: number;
  showLyrics: boolean;
  broadcastToProfile: boolean;
  current: Track | null;

  loadQueue: (tracks: Track[], startIndex?: number) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  setVolume: (v: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setRate: (r: number) => void;
  bumpRate: (delta: number) => void;
  toggleLyrics: () => void;
  toggleBroadcast: () => void;
  tick: (delta: number) => void;
}

export const usePlayer = create<PlayerState>((set, get) => ({
  queue: [],
  currentIndex: 0,
  isPlaying: false,
  progress: 0,
  volume: 0.7,
  shuffle: false,
  repeat: "off",
  playbackRate: 1.0,
  showLyrics: false,
  broadcastToProfile: false,
  current: null,

  loadQueue: (tracks, startIndex = 0) => {
    if (!tracks.length) return;
    const idx = Math.max(0, Math.min(startIndex, tracks.length - 1));
    set({
      queue: tracks,
      currentIndex: idx,
      current: tracks[idx],
      progress: 0,
      isPlaying: true,
    });
  },
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  toggle: () => set((s) => ({ isPlaying: !s.isPlaying && s.current !== null ? true : false })),
  next: () => {
    const { queue, currentIndex, shuffle, repeat } = get();
    if (!queue.length) return;
    let nextIdx = currentIndex + 1;
    if (shuffle) nextIdx = Math.floor(Math.random() * queue.length);
    if (nextIdx >= queue.length) {
      if (repeat === "playlist" || repeat === "one") nextIdx = 0;
      else nextIdx = queue.length - 1;
    }
    set({ currentIndex: nextIdx, current: queue[nextIdx], progress: 0, isPlaying: true });
  },
  prev: () => {
    const { queue, currentIndex, progress } = get();
    if (!queue.length) return;
    if (progress > 4) {
      set({ progress: 0 });
      return;
    }
    const prevIdx = Math.max(0, currentIndex - 1);
    set({ currentIndex: prevIdx, current: queue[prevIdx], progress: 0, isPlaying: true });
  },
  seek: (seconds) => set({ progress: Math.max(0, seconds) }),
  setVolume: (v) => set({ volume: Math.max(0, Math.min(1, v)) }),
  toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),
  cycleRepeat: () =>
    set((s) => ({
      repeat: s.repeat === "off" ? "playlist" : s.repeat === "playlist" ? "one" : "off",
    })),
  setRate: (r) => set({ playbackRate: Math.max(0.1, Math.min(3.0, +r.toFixed(2))) }),
  bumpRate: (delta) =>
    set((s) => ({ playbackRate: Math.max(0.1, Math.min(3.0, +(s.playbackRate + delta).toFixed(2))) })),
  toggleLyrics: () => set((s) => ({ showLyrics: !s.showLyrics })),
  toggleBroadcast: () => set((s) => ({ broadcastToProfile: !s.broadcastToProfile })),

  tick: (delta) => {
    const s = get();
    if (!s.isPlaying || !s.current) return;
    let np = s.progress + delta * s.playbackRate;
    if (np >= s.current.duration) {
      if (s.repeat === "one") {
        set({ progress: 0 });
        return;
      }
      get().next();
      return;
    }
    set({ progress: np });
  },
}));
