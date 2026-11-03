import { create } from "zustand";
import type { ScreenId } from "./scene-config";

/**
 * loading     → waiting for the scene
 * intro       → camera flies in after the scene loads
 * room        → resting view, mouse parallax, screens are clickable
 * zooming-in  → camera travels to the focused screen
 * focused     → camera parked on a screen; its content is interactive
 * zooming-out → camera travels back to the room view
 */
export type Mode = "loading" | "intro" | "room" | "zooming-in" | "focused" | "zooming-out";

interface ExperienceState {
  mode: Mode;
  /** Which screen the camera is on (or heading to / leaving). */
  focus: ScreenId | null;
  hovered: ScreenId | null;
  setMode: (mode: Mode) => void;
  setHovered: (id: ScreenId | null) => void;
  /** Start the zoom into a screen (only from the resting room view). */
  enter: (id: ScreenId) => void;
  /** Start the zoom back out. */
  leave: () => void;
}

export const useExperience = create<ExperienceState>((set, get) => ({
  mode: "loading",
  focus: null,
  hovered: null,
  setMode: (mode) => set(mode === "room" ? { mode, focus: null } : { mode }),
  setHovered: (hovered) => set({ hovered }),
  enter: (id) => {
    const { mode } = get();
    if (mode === "room" || mode === "intro") set({ mode: "zooming-in", focus: id, hovered: null });
  },
  leave: () => {
    if (get().mode === "focused") set({ mode: "zooming-out" });
  },
}));

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
