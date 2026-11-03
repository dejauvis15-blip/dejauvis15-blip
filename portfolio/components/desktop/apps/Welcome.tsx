import { useDesktop } from "@/lib/desktop-store";
import { PROFILE } from "@/lib/content";

export function Welcome() {
  const open = useDesktop((s) => s.open);
  return (
    <div className="p-6">
      <p className="text-[13px] font-medium text-indigo-600">Welcome to my desk 👋</p>
      <h3 className="mt-1 text-xl font-semibold tracking-tight text-neutral-900">I&apos;m {PROFILE.firstName}.</h3>
      <p className="mt-2 text-[13.5px] leading-relaxed text-neutral-600">{PROFILE.tagline}</p>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <button type="button" onClick={() => open("projects")} className="rounded-lg bg-indigo-600 px-3 py-2 text-[13px] font-medium text-white hover:bg-indigo-500">
          See my work
        </button>
        <button type="button" onClick={() => open("about")} className="rounded-lg bg-black/5 px-3 py-2 text-[13px] font-medium text-neutral-800 hover:bg-black/10">
          About me
        </button>
      </div>
      <p className="mt-5 text-[12px] leading-relaxed text-neutral-400">
        Tip: drag windows by their title bar. Press <kbd className="rounded border border-black/10 bg-white px-1 font-mono">Esc</kbd> to close a
        window, or use <span className="font-medium text-neutral-500">Leave desk</span> to step back into the room.
      </p>
    </div>
  );
}
