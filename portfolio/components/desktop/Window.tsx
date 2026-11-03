"use client";

import gsap from "gsap";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useDesktop, type WindowState } from "@/lib/desktop-store";
import { prefersReducedMotion } from "@/lib/store";

const MENU_H = 32;
const DOCK_CLEARANCE = 96;

function useIsCompact() {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const on = () => setCompact(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return compact;
}

interface Props {
  win: WindowState;
  title: string;
  active: boolean;
  children: React.ReactNode;
  /** Register a function the desktop can call to close this window with animation. */
  registerClose: (id: WindowState["id"], fn: () => void) => void;
}

export function Window({ win, title, active, children, registerClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { close, focus, minimize, toggleMaximize, move } = useDesktop.getState();
  const compact = useIsCompact();
  const fullscreen = win.maximized || compact;
  const d = (s: number) => (prefersReducedMotion() ? 0 : s);

  // Open / restore-from-minimize animation.
  useLayoutEffect(() => {
    if (win.minimized || !ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, scale: 0.94, y: 14 },
      { opacity: 1, scale: 1, y: 0, duration: d(0.32), ease: "power3.out", clearProps: "transform" },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [win.minimized]);

  const animateClose = () => {
    if (!ref.current) return close(win.id);
    gsap.to(ref.current, { opacity: 0, scale: 0.94, duration: d(0.18), ease: "power2.in", onComplete: () => close(win.id) });
  };
  const animateMinimize = () => {
    if (!ref.current) return minimize(win.id);
    const r = ref.current.getBoundingClientRect();
    gsap.to(ref.current, {
      opacity: 0,
      scale: 0.25,
      y: window.innerHeight - r.top - r.height * 0.4,
      duration: d(0.35),
      ease: "power3.in",
      onComplete: () => minimize(win.id),
    });
  };

  useEffect(() => {
    registerClose(win.id, animateClose);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dragging: mutate style during the drag, commit to the store on release.
  const drag = useRef<{ dx: number; dy: number; x: number; y: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    focus(win.id);
    if (fullscreen || e.button !== 0 || (e.target as HTMLElement).closest("button")) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { dx: e.clientX - win.x, dy: e.clientY - win.y, x: win.x, y: win.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current || !ref.current) return;
    const maxX = window.innerWidth - 120;
    const maxY = window.innerHeight - 80;
    const x = Math.min(maxX, Math.max(120 - win.w, e.clientX - drag.current.dx));
    const y = Math.min(maxY, Math.max(MENU_H + 4, e.clientY - drag.current.dy));
    drag.current.x = x;
    drag.current.y = y;
    ref.current.style.left = `${x}px`;
    ref.current.style.top = `${y}px`;
  };
  const onPointerUp = () => {
    if (drag.current) move(win.id, drag.current.x, drag.current.y);
    drag.current = null;
  };

  const style: React.CSSProperties = fullscreen
    ? { left: compact ? 6 : 8, top: MENU_H + 6, right: compact ? 6 : 8, bottom: DOCK_CLEARANCE, zIndex: win.z }
    : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z };

  return (
    <section
      ref={ref}
      role="dialog"
      aria-label={title}
      onPointerDown={() => focus(win.id)}
      style={style}
      hidden={win.minimized}
      className={`absolute flex flex-col overflow-hidden rounded-xl border bg-[var(--win-bg)] text-[var(--win-fg)] backdrop-blur-2xl transition-[box-shadow,border-color] duration-200 ${
        active
          ? "border-white/20 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.65)]"
          : "border-white/10 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.5)]"
      }`}
    >
      <header
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onDoubleClick={() => !compact && toggleMaximize(win.id)}
        className={`relative flex h-10 shrink-0 select-none items-center border-b border-black/5 px-3 ${
          fullscreen ? "" : "cursor-grab active:cursor-grabbing"
        } ${active ? "bg-white/60" : "bg-white/35"}`}
      >
        <div className="group flex items-center gap-2">
          <TrafficLight color="bg-[#ff5f57]" label={`Close ${title}`} onClick={animateClose} glyph="×" />
          <TrafficLight color="bg-[#febc2e]" label={`Minimize ${title}`} onClick={animateMinimize} glyph="–" />
          {!compact && (
            <TrafficLight
              color="bg-[#28c840]"
              label={win.maximized ? `Restore ${title}` : `Maximize ${title}`}
              onClick={() => toggleMaximize(win.id)}
              glyph="+"
            />
          )}
        </div>
        <h2 className="pointer-events-none absolute inset-x-0 text-center text-[13px] font-semibold text-neutral-700">{title}</h2>
      </header>
      <div className="min-h-0 flex-1 overflow-auto overscroll-contain">{children}</div>
    </section>
  );
}

function TrafficLight({ color, label, onClick, glyph }: { color: string; label: string; onClick: () => void; glyph: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`grid h-3.5 w-3.5 place-items-center rounded-full ${color} text-[10px] leading-none font-bold text-black/0 ring-1 ring-black/10 transition group-hover:text-black/55 focus-visible:text-black/55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500`}
    >
      <span aria-hidden className="-mt-px">{glyph}</span>
    </button>
  );
}
