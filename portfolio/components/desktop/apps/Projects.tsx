"use client";

import { useState } from "react";
import { PROJECT_CATEGORIES, PROJECTS, type Project, type ProjectCategory } from "@/lib/content";
import { ExternalIcon } from "../icons";

type Filter = "all" | ProjectCategory;

export function Projects() {
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const list = PROJECTS.filter((p) => filter === "all" || p.category === filter);
  const open = PROJECTS.find((p) => p.id === openId);

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: "All Projects", count: PROJECTS.length },
    ...PROJECT_CATEGORIES.map((c) => ({ ...c, count: PROJECTS.filter((p) => p.category === c.id).length })),
  ];

  return (
    <div className="flex h-full flex-col sm:flex-row">
      <nav aria-label="Project categories" className="flex shrink-0 gap-1 overflow-x-auto border-b border-black/5 bg-black/[0.03] p-2 sm:w-48 sm:flex-col sm:border-r sm:border-b-0 sm:p-3">
        <p className="hidden px-2 pb-1 text-[11px] font-semibold tracking-wide text-neutral-400 uppercase sm:block">Library</p>
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => {
              setFilter(f.id);
              setOpenId(null);
            }}
            aria-pressed={filter === f.id}
            className={`flex shrink-0 items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-left text-[13px] transition ${
              filter === f.id ? "bg-indigo-500 text-white" : "text-neutral-700 hover:bg-black/5"
            }`}
          >
            {f.label}
            <span className={`text-[11px] ${filter === f.id ? "text-white/80" : "text-neutral-400"}`}>{f.count}</span>
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-auto">
        {open ? (
          <ProjectDetail project={open} onBack={() => setOpenId(null)} />
        ) : (
          <ul className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
            {list.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(p.id)}
                  className="group w-full overflow-hidden rounded-xl border border-black/5 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-indigo-500"
                >
                  <Thumb project={p} />
                  <div className="p-3.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[14px] font-semibold text-neutral-900">{p.title}</h3>
                      {p.draft && <DraftBadge />}
                    </div>
                    <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-neutral-500">{p.summary}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Thumb({ project, tall }: { project: Project; tall?: boolean }) {
  const cat = PROJECT_CATEGORIES.find((c) => c.id === project.category)?.label;
  return (
    <div
      className={`relative ${tall ? "h-44" : "h-28"} overflow-hidden`}
      style={{ background: `linear-gradient(135deg, ${project.accent[0]}, ${project.accent[1]})` }}
    >
      <div className="absolute -right-6 -bottom-10 h-36 w-36 rounded-full bg-white/15 transition-transform duration-500 group-hover:scale-110" />
      <div className="absolute top-4 -left-4 h-16 w-28 rotate-12 rounded-lg bg-white/10" />
      <span className="absolute top-3 left-3 rounded-full bg-black/20 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur">{cat}</span>
      <span className="absolute right-3 bottom-3 font-mono text-[11px] text-white/80">{project.year}</span>
    </div>
  );
}

function ProjectDetail({ project, onBack }: { project: Project; onBack: () => void }) {
  return (
    <article className="pb-6">
      <div className="sticky top-0 z-10 flex items-center border-b border-black/5 bg-white/80 px-4 py-2 backdrop-blur">
        <button type="button" onClick={onBack} className="rounded-md px-2 py-1 text-[13px] font-medium text-indigo-600 hover:bg-indigo-50">
          ← All projects
        </button>
      </div>
      <Thumb project={project} tall />
      <div className="mx-auto max-w-2xl px-5 pt-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-2xl font-semibold tracking-tight text-neutral-900">{project.title}</h3>
          {project.draft && <DraftBadge />}
        </div>
        <p className="mt-2 text-[14px] leading-relaxed text-neutral-600">{project.summary}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-black/[0.03] p-3.5 text-[12.5px]">
          <div>
            <dt className="text-neutral-400">Role</dt>
            <dd className="font-medium text-neutral-800">{project.role}</dd>
          </div>
          <div>
            <dt className="text-neutral-400">Year</dt>
            <dd className="font-medium text-neutral-800">{project.year}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-neutral-400">Tools</dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              {project.tools.map((t) => (
                <span key={t} className="rounded-full bg-white px-2 py-0.5 text-[11.5px] text-neutral-700 ring-1 ring-black/5">
                  {t}
                </span>
              ))}
            </dd>
          </div>
        </dl>
        {project.sections.map((s) => (
          <section key={s.heading} className="mt-5">
            <h4 className="text-[13px] font-semibold tracking-wide text-indigo-600 uppercase">{s.heading}</h4>
            <p className="mt-1.5 text-[14px] leading-relaxed text-neutral-700">{s.body}</p>
          </section>
        ))}
        {project.links && (
          <div className="mt-6 flex flex-wrap gap-2">
            {project.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 py-2 text-[13px] font-medium text-white hover:bg-neutral-700"
              >
                {l.label} <ExternalIcon />
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export function DraftBadge() {
  return (
    <span title="Placeholder content — edit lib/content.ts" className="rounded-full bg-amber-100 px-2 py-0.5 text-[10.5px] font-semibold text-amber-700">
      Draft
    </span>
  );
}
