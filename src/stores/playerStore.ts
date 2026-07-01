import { create } from "zustand";
import type { RepeatMode, Track, EqPreset } from "@/types/music";
import { BUILTIN_EQ_PRESETS } from "@/constants/mockData";

interface PlayerState {
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  progress: number;
  playedThisTrack: number; // for 30s counter
  volume: number;
  shuffle: boolean;
  repeat: RepeatMode;
  playbackRate: number;
  showLyrics: boolean;
  broadcastToProfile: boolean;
  current: Track | null;

  // volume popup
  volumePopupShownAt: number;

  // equalizer
  eqBands: number[]; // 10, -12..12
  eqQ: number[]; // 10, 0..3
  eqPreset: string;
  savedPresets: EqPreset[];

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
  tick: (delta: number, onCount?: (id: string) => void) => void;

  setEqBand: (index: number, value: number) => void;
  setEqQ: (index: number, value: number) => void;
  applyPreset: (name: string) => void;
  savePreset: (name: string) => void;
  deletePreset: (name: string) => void;
  renamePreset: (oldName: string, newName: string) => void;
}

export const usePlayer = create<PlayerState>((set, get) => ({
  queue: [],
  currentIndex: 0,
  isPlaying: false,
  progress: 0,
  playedThisTrack: 0,
  volume: 0.7,
  shuffle: false,
  repeat: "off",
  playbackRate: 1.0,
  showLyrics: false,
  broadcastToProfile: false,
  current: null,
  volumePopupShownAt: 0,

  eqBands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  eqQ: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  eqPreset: "Плоский",
  savedPresets: [...BUILTIN_EQ_PRESETS],

  loadQueue: (tracks, startIndex = 0) => {
    if (!tracks.length) return;
    const idx = Math.max(0, Math.min(startIndex, tracks.length - 1));
    set({
      queue: tracks,
      currentIndex: idx,
      current: tracks[idx],
      progress: 0,
      playedThisTrack: 0,
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
    set({ currentIndex: nextIdx, current: queue[nextIdx], progress: 0, playedThisTrack: 0, isPlaying: true });
  },
  prev: () => {
    const { queue, currentIndex, progress } = get();
    if (!queue.length) return;
    if (progress > 4) {
      set({ progress: 0 });
      return;
    }
    const prevIdx = Math.max(0, currentIndex - 1);
    set({ currentIndex: prevIdx, current: queue[prevIdx], progress: 0, playedThisTrack: 0, isPlaying: true });
  },
  seek: (seconds) => set({ progress: Math.max(0, seconds) }),
  setVolume: (v) => set({ volume: Math.max(0, Math.min(1, v)), volumePopupShownAt: Date.now() }),
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

  tick: (delta, onCount) => {
    const s = get();
    if (!s.isPlaying || !s.current) return;
    const step = delta * s.playbackRate;
    const newPlayed = s.playedThisTrack + step;
    // fire once per track when crossing 30s
    if (s.playedThisTrack < 30 && newPlayed >= 30) {
      onCount?.(s.current.id);
    }
    let np = s.progress + step;
    if (np >= s.current.duration) {
      if (s.repeat === "one") {
        set({ progress: 0, playedThisTrack: 0 });
        return;
      }
      get().next();
      return;
    }
    set({ progress: np, playedThisTrack: newPlayed });
  },

  setEqBand: (index, value) =>
    set((s) => {
      const bands = [...s.eqBands];
      bands[index] = Math.max(-12, Math.min(12, value));
      return { eqBands: bands, eqPreset: "Свой" };
    }),
  setEqQ: (index, value) =>
    set((s) => {
      const q = [...s.eqQ];
      q[index] = Math.max(0, Math.min(3, +value.toFixed(2)));
      return { eqQ: q, eqPreset: "Свой" };
    }),
  applyPreset: (name) =>
    set((s) => {
      const p = s.savedPresets.find((x) => x.name === name);
      if (!p) return s;
      return { eqBands: [...p.bands], eqQ: [...p.qBands], eqPreset: name };
    }),
  savePreset: (name) =>
    set((s) => {
      const trimmed = name.trim();
      if (!trimmed) return s;
      const existing = s.savedPresets.findIndex((p) => p.name === trimmed);
      const preset: EqPreset = { name: trimmed, bands: [...s.eqBands], qBands: [...s.eqQ] };
      const arr = [...s.savedPresets];
      if (existing >= 0) arr[existing] = preset;
      else arr.push(preset);
      return { savedPresets: arr, eqPreset: trimmed };
    }),
  deletePreset: (name) =>
    set((s) => ({
      savedPresets: s.savedPresets.filter((p) => p.name !== name || p.builtIn),
    })),
  renamePreset: (oldName, newName) =>
    set((s) => ({
      savedPresets: s.savedPresets.map((p) =>
        p.name === oldName && !p.builtIn ? { ...p, name: newName } : p
      ),
      eqPreset: s.eqPreset === oldName ? newName : s.eqPreset,
    })),
}));
