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
    center: [0.3, 0.99, -2.06],
    size: [0.6, 0.3375], // 16:9 ≈ 27" monitor
    url: "/site/index.html",
    virtual: [1280, 720],
    title: "jauvis.dev",
    href: "https://www.jauvis.dev",
    hint: "Dev portfolio",
  },
  poster: {
    // framed poster in the wainscot panel, left of the pegboard
    center: [-1.72, 1.29, -2.268],
    size: [0.37, 0.52],
    url: "https://jauvis-dozier-portfolio.vercel.app/",
    virtual: [900, 1265],
    title: "Design portfolio",
    hint: "Design portfolio",
  },
};

export const MONITOR_BEZEL = 0.008;

export const CAMERA = {
  fov: 42,
  /** Cinematic resting position: front-left of the desk, like the photos. */
  room: {
    position: [-0.55, 1.55, 0.95] as Vec3,
    target: [-0.2, 1.22, -2.2] as Vec3,
  },
  /** Where the intro fly-in starts. */
  intro: {
    position: [-1.2, 2.1, 2.9] as Vec3,
  },
  /** How far (m) the camera drifts with the mouse in room view. */
  parallax: { x: 0.22, y: 0.1 },
  /** Narrow screens get pulled back so the desk still fits. */
  mobilePullback: 1.45,
  /** Breathing room around a live screen when zoomed in (1 = edge to edge). */
  screenMargin: 1.1,
};

/** Below this width, zooming into a screen hands off to a full-screen view. */
export const COMPACT_QUERY = "(max-width: 767px)";

/** Look & feel. */
export const LOOK = {
  /** Film grade: bloom, grain, vignette, slight chromatic aberration. */
  retro: true,
};

export const TIMING = {
  intro: 2.2,
  zoomIn: 1.6,
  zoomOut: 1.4,
};
