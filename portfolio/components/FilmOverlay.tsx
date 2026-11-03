"use client";

import { LOOK } from "@/lib/scene-config";
import { useExperience } from "@/lib/store";

/**
 * Grain, scanlines and vignette drawn in CSS on top of everything — the 3D
 * canvas *and* the live pages (which sit in DOM above the canvas and so
 * aren't touched by the WebGL post-processing). It eases off while you're
 * zoomed in on a page so text stays readable.
 */
export function FilmOverlay() {
  const mode = useExperience((s) => s.mode);
  if (!LOOK.retro) return null;
  const focused = mode === "focused" || mode === "zooming-in";
  return (
    <div aria-hidden className={`film-overlay ${focused ? "film-overlay--soft" : ""}`}>
      <div className="film-grain" />
      <div className="film-scanlines" />
      <div className="film-vignette" />
    </div>
  );
}
