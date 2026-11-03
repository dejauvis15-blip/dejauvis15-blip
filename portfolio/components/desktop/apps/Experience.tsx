import { EXPERIENCE } from "@/lib/content";
import { DraftBadge } from "./Projects";

export function Experience() {
  return (
    <div className="mx-auto max-w-xl p-5 sm:p-7">
      <h3 className="text-xl font-semibold tracking-tight text-neutral-900">Experience</h3>
      <p className="mt-1 text-[13px] text-neutral-500">Internships and professional work.</p>
      <ol className="relative mt-6 border-l border-neutral-200 pl-6">
        {EXPERIENCE.map((r, i) => (
          <li key={i} className="relative pb-8 last:pb-0">
            <span className="absolute top-1.5 -left-[31px] h-3 w-3 rounded-full border-2 border-white bg-indigo-500 ring-4 ring-indigo-100" />
            <p className="font-mono text-[11.5px] text-neutral-400">
              {r.period}
              {r.location ? ` · ${r.location}` : ""}
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <h4 className="text-[15px] font-semibold text-neutral-900">{r.title}</h4>
              {r.draft && <DraftBadge />}
            </div>
            <p className="text-[13px] font-medium text-indigo-600">{r.org}</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-[13.5px] leading-relaxed text-neutral-700 marker:text-neutral-300">
              {r.points.map((p, j) => (
                <li key={j}>{p}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
