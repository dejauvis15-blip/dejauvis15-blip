import { create } from "zustand";

export type AppId = "welcome" | "projects" | "about" | "experience" | "resume" | "contact";

export interface WindowState {
  id: AppId;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
}

export const APP_SIZES: Record<AppId, { w: number; h: number }> = {
  welcome: { w: 440, h: 360 },
  projects: { w: 860, h: 580 },
  about: { w: 720, h: 560 },
  experience: { w: 640, h: 520 },
  resume: { w: 620, h: 600 },
  contact: { w: 520, h: 540 },
};

interface DesktopState {
  windows: WindowState[];
  topZ: number;
  open: (id: AppId) => void;
  close: (id: AppId) => void;
  focus: (id: AppId) => void;
  minimize: (id: AppId) => void;
  toggleMaximize: (id: AppId) => void;
  move: (id: AppId, x: number, y: number) => void;
  reset: () => void;
}

const MENU_H = 32;

export const useDesktop = create<DesktopState>((set, get) => ({
  windows: [],
  topZ: 10,
  open: (id) => {
    const existing = get().windows.find((w) => w.id === id);
    if (existing) {
      set((s) => ({
        topZ: s.topZ + 1,
        windows: s.windows.map((w) => (w.id === id ? { ...w, minimized: false, z: s.topZ + 1 } : w)),
      }));
      return;
    }
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const size = APP_SIZES[id];
    const w = Math.min(size.w, vw - 32);
    const h = Math.min(size.h, vh - MENU_H - 110);
    // Cascade new windows so they don't stack exactly on top of each other.
    const n = get().windows.length;
    const x = Math.max(16, Math.round((vw - w) / 2 + (n % 5) * 28 - 56));
    const y = Math.max(MENU_H + 12, Math.round((vh - h) / 2 + (n % 5) * 24 - 60));
    set((s) => ({
      topZ: s.topZ + 1,
      windows: [...s.windows, { id, x, y, w, h, z: s.topZ + 1, minimized: false, maximized: false }],
    }));
  },
  close: (id) => set((s) => ({ windows: s.windows.filter((w) => w.id !== id) })),
  focus: (id) =>
    set((s) => {
      const win = s.windows.find((w) => w.id === id);
      if (!win || win.z === s.topZ) return s;
      return { topZ: s.topZ + 1, windows: s.windows.map((w) => (w.id === id ? { ...w, z: s.topZ + 1 } : w)) };
    }),
  minimize: (id) => set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, minimized: true } : w)) })),
  toggleMaximize: (id) =>
    set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w)) })),
  move: (id, x, y) => set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, x, y } : w)) })),
  reset: () => set({ windows: [] }),
}));

/** The visible window with the highest z (what Escape closes, what the menu bar names). */
export const topWindow = (windows: WindowState[]) =>
  windows.filter((w) => !w.minimized).sort((a, b) => b.z - a.z)[0];
