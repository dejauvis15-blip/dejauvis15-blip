"use client";

import { PROFILE } from "@/lib/content";
import { SCREENS, type ScreenId } from "@/lib/scene-config";
import { useExperience } from "@/lib/store";

/** DOM overlay shown over the 3D room: intro copy + accessible ways in. */
export function RoomHud() {
  const mode = useExperience((s) => s.mode);
  const enter = useExperience((s) => s.enter);
  const show = mode === "room" || mode === "intro";

  const actions: { id: ScreenId; label: string; primary?: boolean }[] = [
    { id: "monitor", label: SCREENS.monitor.hint, primary: true },
    { id: "poster", label: SCREENS.poster.hint },
  ];

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-5 transition-opacity duration-700 sm:p-8 ${
        show ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden={!show}
    >
      <header className="max-w-sm">
        <p className="text-[12px] font-medium tracking-[0.2em] text-indigo-200/80 uppercase">Portfolio</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{PROFILE.name}</h1>
        <p className="mt-1 text-[15px] text-white/70">{PROFILE.role}</p>
      </header>

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
        <p className="hidden text-[12px] text-white/45 sm:block">
          Move your mouse to look around · click the monitor or the poster
        </p>
        <div className="flex flex-wrap gap-2">
          {actions.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => enter(a.id)}
              tabIndex={show ? 0 : -1}
              className={`${show ? "pointer-events-auto" : ""} rounded-full border px-5 py-2.5 text-[14px] font-medium shadow-lg backdrop-blur-md transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300 ${
                a.primary
                  ? "border-white/20 bg-white/90 text-neutral-900 hover:bg-white"
                  : "border-white/20 bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {a.label} →
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
