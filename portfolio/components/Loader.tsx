"use client";

import { useProgress } from "@react-three/drei";
import { useExperience } from "@/lib/store";

export function Loader() {
  const mode = useExperience((s) => s.mode);
  const { progress } = useProgress();
  const done = mode !== "loading";
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-50 grid place-items-center bg-[#0d0e14] transition-opacity duration-700 ${
        done ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="w-48 text-center">
        <p className="text-[13px] tracking-wide text-white/60">Setting up the room…</p>
        <div className="mt-3 h-0.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-indigo-400 transition-[width] duration-300" style={{ width: `${Math.max(8, progress)}%` }} />
        </div>
      </div>
    </div>
  );
}
