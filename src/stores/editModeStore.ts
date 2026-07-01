import { create } from "zustand";
import type { LayoutPreset, PanelState } from "@/types/music";

interface EditModeState {
  isEditing: boolean;
  backgroundColor: string;
  backgroundImage: string | null;
  interactiveBackground: boolean;
  panels: Record<string, PanelState>;
  recentColors: string[];
  recentImages: string[];
  presets: LayoutPreset[];
  activePresetId: string | null;

  // draft (for cancel)
  draftBackgroundColor: string;
  draftBackgroundImage: string | null;
  draftInteractive: boolean;
  draftPanels: Record<string, PanelState>;

  enterEdit: () => void;
  cancelEdit: () => void;
  saveEdit: () => void;
  setDraftBg: (v: string) => void;
  setDraftBgImage: (v: string | null) => void;
  setDraftInteractive: (v: boolean) => void;
  setPanelDraft: (id: string, patch: Partial<PanelState>) => void;
  toggleCollapse: (id: string) => void;
  savePreset: (name: string) => void;
  applyPreset: (id: string) => void;
  deletePreset: (id: string) => void;
  renamePreset: (id: string, name: string) => void;
}

const DEFAULT_BG = "hsl(222 28% 7%)";

const LS_KEY = "abar:edit-mode:v1";

function load(): Pick<
  EditModeState,
  "backgroundColor" | "backgroundImage" | "interactiveBackground" | "panels" | "recentColors" | "recentImages" | "presets" | "activePresetId"
> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return defaults();
    const p = JSON.parse(raw);
    return {
      backgroundColor: p.backgroundColor ?? DEFAULT_BG,
      backgroundImage: p.backgroundImage ?? null,
      interactiveBackground: !!p.interactiveBackground,
      panels: p.panels ?? {},
      recentColors: p.recentColors ?? [],
      recentImages: p.recentImages ?? [],
      presets: p.presets ?? [],
      activePresetId: p.activePresetId ?? null,
    };
  } catch {
    return defaults();
  }
}

function defaults() {
  return {
    backgroundColor: DEFAULT_BG,
    backgroundImage: null,
    interactiveBackground: false,
    panels: {},
    recentColors: [] as string[],
    recentImages: [] as string[],
    presets: [] as LayoutPreset[],
    activePresetId: null as string | null,
  };
}

function persist(state: EditModeState) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({
      backgroundColor: state.backgroundColor,
      backgroundImage: state.backgroundImage,
      interactiveBackground: state.interactiveBackground,
      panels: state.panels,
      recentColors: state.recentColors,
      recentImages: state.recentImages,
      presets: state.presets,
      activePresetId: state.activePresetId,
    }));
  } catch {}
}

const loaded = load();

export const useEditMode = create<EditModeState>((set, get) => ({
  isEditing: false,
  ...loaded,

  draftBackgroundColor: loaded.backgroundColor,
  draftBackgroundImage: loaded.backgroundImage,
  draftInteractive: loaded.interactiveBackground,
  draftPanels: loaded.panels,

  enterEdit: () => {
    const s = get();
    set({
      isEditing: true,
      draftBackgroundColor: s.backgroundColor,
      draftBackgroundImage: s.backgroundImage,
      draftInteractive: s.interactiveBackground,
      draftPanels: { ...s.panels },
    });
  },
  cancelEdit: () => set({ isEditing: false }),
  saveEdit: () => {
    const s = get();
    const recent = [s.draftBackgroundColor, ...s.recentColors.filter(c => c !== s.draftBackgroundColor)].slice(0, 5);
    const recentImgs = s.draftBackgroundImage
      ? [s.draftBackgroundImage, ...s.recentImages.filter(x => x !== s.draftBackgroundImage)].slice(0, 5)
      : s.recentImages;
    const newState = {
      isEditing: false,
      backgroundColor: s.draftBackgroundColor,
      backgroundImage: s.draftBackgroundImage,
      interactiveBackground: s.draftInteractive,
      panels: { ...s.draftPanels },
      recentColors: recent,
      recentImages: recentImgs,
    };
    set(newState);
    persist(get());
  },
  setDraftBg: (v) => set({ draftBackgroundColor: v }),
  setDraftBgImage: (v) => set({ draftBackgroundImage: v }),
  setDraftInteractive: (v) => set({ draftInteractive: v }),
  setPanelDraft: (id, patch) =>
    set((s) => ({
      draftPanels: {
        ...s.draftPanels,
        [id]: { ...(s.draftPanels[id] ?? { x: 0, y: 0 }), ...patch },
      },
    })),
  toggleCollapse: (id) =>
    set((s) => {
      const key = s.isEditing ? "draftPanels" : "panels";
      const source = s[key];
      const cur = source[id] ?? { x: 0, y: 0 };
      const next = { ...source, [id]: { ...cur, collapsed: !cur.collapsed } };
      const patch: Partial<EditModeState> = { [key]: next } as any;
      set(patch);
      if (!s.isEditing) persist(get());
      return {};
    }),
  savePreset: (name) =>
    set((s) => {
      const preset: LayoutPreset = {
        id: `preset-${Date.now()}`,
        name: name.trim() || "Пресет",
        panels: { ...s.draftPanels },
        backgroundColor: s.draftBackgroundColor,
        backgroundImage: s.draftBackgroundImage,
        interactiveBackground: s.draftInteractive,
      };
      const presets = [...s.presets, preset];
      const next = { presets, activePresetId: preset.id };
      persist({ ...s, ...next });
      return next;
    }),
  applyPreset: (id) =>
    set((s) => {
      const p = s.presets.find(x => x.id === id);
      if (!p) return s;
      return {
        draftBackgroundColor: p.backgroundColor,
        draftBackgroundImage: p.backgroundImage,
        draftInteractive: p.interactiveBackground,
        draftPanels: { ...p.panels },
        activePresetId: id,
      };
    }),
  deletePreset: (id) =>
    set((s) => {
      const presets = s.presets.filter(p => p.id !== id);
      const next = { presets, activePresetId: s.activePresetId === id ? null : s.activePresetId };
      persist({ ...s, ...next });
      return next;
    }),
  renamePreset: (id, name) =>
    set((s) => {
      const presets = s.presets.map(p => p.id === id ? { ...p, name } : p);
      const next = { presets };
      persist({ ...s, ...next });
      return next;
    }),
}));
