/**
 * All 3D layout numbers live here so the placeholder room can be swapped
 * for a Blender model without touching component code.
 *
 * Units are meters. +Y is up, the back wall (behind the desk) sits at -Z.
 * When you export your Blender room, keep the same scale (1 unit = 1 m)
 * and update SCREENS so the interactive surfaces line up with your model.
 */

type Vec3 = [number, number, number];

export const SCENE = {
  /**
   * Path to a .glb in /public. Leave null to render the placeholder room.
   * Example: "/models/room.glb"
   */
  roomModelUrl: null as string | null,
} as const;

/**
 * What the monitor shows when you sit down:
 *  - "site"    → the existing dev portfolio (public/site), live inside the 3D screen
 *  - "desktop" → the desktop-OS style portfolio (components/desktop)
 */
export const MONITOR_CONTENT: "site" | "desktop" = "site";

export type ScreenId = "monitor" | "poster";

export interface ScreenConfig {
  /** Center of the visible surface (world space). Surfaces face +Z. */
  center: Vec3;
  /** Visible size in meters. */
  size: [number, number];
  /** Page loaded into the surface. */
  url: string;
  /** CSS pixel size the page is laid out at before being scaled onto the surface. */
  virtual: [number, number];
  title: string;
  /** Public address used for "open in new tab". Defaults to url. */
  href?: string;
  /** Shown in the hint bubble in room view. */
  hint: string;
}

export const SCREENS: Record<ScreenId, ScreenConfig> = {
  monitor: {
    center: [0, 1.13, -2.24],
    size: [0.64, 0.36], // 16:9 ≈ 27" monitor
    url: "/site/index.html",
    virtual: [1280, 720],
    title: "jauvis.dev",
    href: "https://www.jauvis.dev",
    hint: "Dev portfolio",
  },
  poster: {
    center: [-1.05, 1.72, -2.468],
    size: [0.6, 0.85],
    url: "https://jauvis-dozier-portfolio.vercel.app/",
    virtual: [900, 1275],
    title: "Design portfolio",
    hint: "Design portfolio",
  },
};

export const MONITOR_BEZEL = 0.018;

export const CAMERA = {
  fov: 38,
  /** Cinematic resting position, facing the desk. */
  room: {
    position: [1.75, 1.62, 1.35] as Vec3,
    target: [-0.15, 1.05, -2.05] as Vec3,
  },
  /** Where the intro fly-in starts. */
  intro: {
    position: [3.4, 2.6, 3.8] as Vec3,
  },
  /** How far (m) the camera drifts with the mouse in room view. */
  parallax: { x: 0.28, y: 0.14 },
  /** Narrow screens get pulled back so the desk still fits. */
  mobilePullback: 1.45,
  /** Breathing room around a live screen when zoomed in (1 = edge to edge). */
  screenMargin: 1.1,
};

/** Below this width, zooming into a screen hands off to a full-screen view. */
export const COMPACT_QUERY = "(max-width: 767px)";

export const TIMING = {
  intro: 2.2,
  zoomIn: 1.6,
  zoomOut: 1.4,
};
