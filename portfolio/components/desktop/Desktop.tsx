"use client";

import gsap from "gsap";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { PROFILE } from "@/lib/content";
import { topWindow, useDesktop, type AppId } from "@/lib/desktop-store";
import { MONITOR_CONTENT } from "@/lib/scene-config";
import { prefersReducedMotion, useExperience } from "@/lib/store";
import { wallpaperCss } from "@/lib/wallpaper";
import { About } from "./apps/About";
import { Contact } from "./apps/Contact";
import { Experience } from "./apps/Experience";
import { Projects } from "./apps/Projects";
import { Resume } from "./apps/Resume";
import { Welcome } from "./apps/Welcome";
import { AppIcon } from "./icons";
import { Window } from "./Window";

const APPS: Record<AppId, { title: string; label: string; Component: React.ComponentType }> = {
  welcome: { title: "Welcome", label: "Welcome", Component: Welcome },
  projects: { title: "Projects", label: "Projects", Component: Projects },
  about: { title: "About Me", label: "About Me", Component: About },
  experience: { title: "Experience", label: "Experience", Component: Experience },
  resume: { title: "Resume", label: "Resume", Component: Resume },
  contact: { title: "Contact", label: "Contact", Component: Contact },
};

const DESKTOP_ICONS: AppId[] = ["projects", "about", "experience", "resume", "contact"];

export function Desktop() {
  const mode = useExperience((s) => s.mode);
  const focus = useExperience((s) => s.focus);
  const leaveDesktop = useExperience((s) => s.leave);
  const windows = useDesktop((s) => s.windows);
  const open = useDesktop((s) => s.open);
  const reset = useDesktop((s) => s.reset);
  const root = useRef<HTMLDivElement>(null);
  const closers = useRef(new Map<AppId, () => void>());
  const leaving = useRef(false);
  const [booted, setBooted] = useState(false);

  const visible = MONITOR_CONTENT === "desktop" && mode === "focused" && focus === "monitor";
  const top = topWindow(windows);

  // "Screen turns on" when the camera arrives.
  useLayoutEffect(() => {
    if (!visible || !root.current) return;
    leaving.current = false;
    const reduced = prefersReducedMotion();
    gsap.fromTo(
      root.current,
      { opacity: 0, filter: "brightness(1.6) blur(6px)" },
      { opacity: 1, filter: "brightness(1) blur(0px)", duration: reduced ? 0 : 0.55, ease: "power2.out", clearProps: "filter" },
    );
    if (!booted) {
      setBooted(true);
      const id = setTimeout(() => open("welcome"), reduced ? 0 : 450);
      return () => clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const exit = useCallback(() => {
    if (leaving.current || !root.current) return;
    leaving.current = true;
    gsap.to(root.current, {
      opacity: 0,
      duration: prefersReducedMotion() ? 0 : 0.35,
      ease: "power2.in",
      onComplete: () => {
        reset();
        setBooted(false);
        leaveDesktop();
      },
    });
  }, [leaveDesktop, reset]);

  // Esc closes the front window; with nothing open it leaves the desk.
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const t = topWindow(useDesktop.getState().windows);
      if (t) closers.current.get(t.id)?.();
      else exit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, exit]);

  const registerClose = useCallback((id: AppId, fn: () => void) => closers.current.set(id, fn), []);

  if (!visible) return null;

  return (
    <div
      ref={root}
      className="fixed inset-0 z-30 overflow-hidden text-white select-none"
      style={{ background: wallpaperCss() }}
      aria-label={`${PROFILE.firstName}'s desktop`}
    >
      <MenuBar activeTitle={top ? APPS[top.id].title : "Finder"} onExit={exit} />

      {/* Desktop icons */}
      <nav aria-label="Desktop" className="absolute top-12 left-3 grid grid-cols-3 gap-1 sm:top-14 sm:left-5 sm:grid-cols-1 sm:gap-2">
        {DESKTOP_ICONS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => open(id)}
            className="group flex w-[84px] flex-col items-center gap-1.5 rounded-lg p-2 outline-none focus-visible:bg-white/15"
          >
            <span className="transition-transform duration-200 group-hover:-translate-y-0.5 group-active:scale-95">
              <AppIcon id={id} size={52} />
            </span>
            <span className="rounded px-1.5 text-[12px] font-medium [text-shadow:0_1px_3px_rgba(0,0,0,0.6)] group-focus-visible:bg-indigo-500">
              {APPS[id].label}
            </span>
          </button>
        ))}
      </nav>

      {/* Windows */}
      {windows.map((w) => {
        const { Component, title } = APPS[w.id];
        return (
          <Window key={w.id} win={w} title={title} active={top?.id === w.id} registerClose={registerClose}>
            <Component />
          </Window>
        );
      })}

      <Dock running={windows.map((w) => w.id)} onOpen={open} />
    </div>
  );
}

function MenuBar({ activeTitle, onExit }: { activeTitle: string; onExit: () => void }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);
  return (
    <header className="absolute inset-x-0 top-0 z-[9999] flex h-8 items-center justify-between bg-black/25 px-3 text-[13px] backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <span className="font-semibold tracking-tight">◆ {PROFILE.firstName}OS</span>
        <span className="hidden font-semibold sm:inline">{activeTitle}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-white/80 tabular-nums sm:inline" suppressHydrationWarning>
          {now?.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}{" "}
          {now?.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
        </span>
        <button
          type="button"
          onClick={onExit}
          className="rounded-md bg-white/15 px-2.5 py-0.5 text-[12.5px] font-medium hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-white"
        >
          ← Leave desk
        </button>
      </div>
    </header>
  );
}

function Dock({ running, onOpen }: { running: AppId[]; onOpen: (id: AppId) => void }) {
  return (
    <nav aria-label="Dock" className="absolute inset-x-0 bottom-3 z-[9999] flex justify-center px-3">
      <ul className="flex items-end gap-1.5 rounded-2xl border border-white/20 bg-white/15 px-2 py-1.5 shadow-2xl backdrop-blur-2xl sm:gap-2 sm:px-2.5">
        {DESKTOP_ICONS.map((id) => (
          <li key={id} className="relative">
            <button
              type="button"
              onClick={() => onOpen(id)}
              aria-label={`Open ${APPS[id].title}`}
              className="group relative block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span className="pointer-events-none absolute -top-9 left-1/2 hidden -translate-x-1/2 rounded-md bg-black/70 px-2 py-1 text-[11.5px] whitespace-nowrap opacity-0 transition group-hover:opacity-100 sm:block">
                {APPS[id].title}
              </span>
              <span className="block origin-bottom transition-transform duration-200 ease-out group-hover:-translate-y-1.5 group-hover:scale-115">
                <AppIcon id={id} size={44} />
              </span>
            </button>
            <span
              aria-hidden
              className={`absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-white transition-opacity ${
                running.includes(id) ? "opacity-90" : "opacity-0"
              }`}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}
