"use client";

import { useEffect } from "react";
import { COMPACT_QUERY, MONITOR_CONTENT, SCREENS } from "@/lib/scene-config";
import { useExperience } from "@/lib/store";
import { useMedia } from "@/lib/use-media";

/**
 * Controls while zoomed into a live page (monitor site or design poster):
 * a "back to room" bar, Esc to leave, and on phones a full-screen view of
 * the page, since a desktop layout scaled onto a 3D surface is unreadable there.
 */
export function ScreenControls() {
  const mode = useExperience((s) => s.mode);
  const focus = useExperience((s) => s.focus);
  const leave = useExperience((s) => s.leave);
  const compact = useMedia(COMPACT_QUERY);

  const isLive = focus === "poster" || (focus === "monitor" && MONITOR_CONTENT === "site");
  const visible = mode === "focused" && isLive;

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && leave();
    window.addEventListener("keydown", onKey);
    // Same-origin pages (the dev site) swallow key events; listen inside them too.
    const frames = Array.from(document.querySelectorAll<HTMLIFrameElement>("iframe[data-screen]"));
    const wins: Window[] = [];
    for (const f of frames) {
      try {
        f.contentWindow?.addEventListener("keydown", onKey);
        if (f.contentWindow) wins.push(f.contentWindow);
      } catch {
        /* cross-origin: rely on the button */
      }
    }
    return () => {
      window.removeEventListener("keydown", onKey);
      for (const w of wins) {
        try {
          w.removeEventListener("keydown", onKey);
        } catch {}
      }
    };
  }, [visible, leave]);

  if (!visible || !focus) return null;
  const cfg = SCREENS[focus];

  return (
    <>
      {compact && (
        <iframe
          src={cfg.url}
          title={cfg.title}
          data-screen={`${focus}-fullscreen`}
          className="fixed inset-x-0 top-12 bottom-0 z-30 h-[calc(100dvh-3rem)] w-full border-0 bg-[#0d0e14]"
        />
      )}
      <div
        className={`fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-2 px-3 ${
          compact ? "h-12 bg-[#0d0e14]/90 backdrop-blur" : "pointer-events-none h-16 sm:px-6"
        }`}
      >
        <button
          type="button"
          onClick={leave}
          className="pointer-events-auto rounded-full border border-white/15 bg-black/50 px-4 py-2 text-[13px] font-medium text-white backdrop-blur-md hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-indigo-300"
        >
          ← Back to room
        </button>
        <div className="pointer-events-auto flex items-center gap-2">
          <span className="hidden text-[12px] text-white/50 sm:inline">Esc to leave</span>
          <a
            href={cfg.href ?? cfg.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/15 bg-black/50 px-4 py-2 text-[13px] font-medium text-white backdrop-blur-md hover:bg-black/70"
          >
            Open {cfg.title} ↗
          </a>
        </div>
      </div>
    </>
  );
}
