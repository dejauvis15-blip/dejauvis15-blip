import { PROFILE } from "@/lib/content";

export function About() {
  return (
    <div className="mx-auto max-w-2xl p-5 sm:p-7">
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        {/* Replace with <Image src="/me.jpg" .../> once you have a photo */}
        <div className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-orange-400 text-3xl font-semibold text-white shadow-lg">
          {PROFILE.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>
        <div>
          <h3 className="text-2xl font-semibold tracking-tight text-neutral-900">{PROFILE.name}</h3>
          <p className="text-[14px] font-medium text-indigo-600">{PROFILE.role}</p>
          <p className="mt-1 text-[13px] text-neutral-500">{PROFILE.location}</p>
        </div>
      </div>

      <div className="mt-6 space-y-3 text-[14px] leading-relaxed text-neutral-700">
        {PROFILE.bio.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <Section title="Education">
        <div className="rounded-xl border border-black/5 bg-white p-4">
          <p className="text-[14px] font-semibold text-neutral-900">{PROFILE.school}</p>
          <p className="text-[13px] text-neutral-600">
            {PROFILE.program} · Concentration in {PROFILE.concentration}
          </p>
          {PROFILE.graduation && <p className="mt-1 text-[12px] text-neutral-400">{PROFILE.graduation}</p>}
        </div>
      </Section>

      <Section title="Skills">
        <div className="space-y-3">
          {Object.entries(PROFILE.skills).map(([group, items]) => (
            <div key={group} className="sm:flex sm:gap-4">
              <p className="w-24 shrink-0 pt-1 text-[12px] font-semibold text-neutral-400">{group}</p>
              <ul className="mt-1 flex flex-wrap gap-1.5 sm:mt-0">
                {items.map((s) => (
                  <li key={s} className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[12.5px] text-neutral-700">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Interests">
        <ul className="flex flex-wrap gap-2">
          {PROFILE.interests.map((s) => (
            <li key={s} className="rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[13px] text-indigo-700">
              {s}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <h4 className="mb-3 text-[12px] font-semibold tracking-wide text-neutral-400 uppercase">{title}</h4>
      {children}
    </section>
  );
}
