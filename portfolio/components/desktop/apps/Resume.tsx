"use client";

import { useEffect, useState } from "react";
import { RESUME_URL } from "@/lib/content";
import { ExternalIcon } from "../icons";

export function Resume() {
  // Only embed the PDF if it actually exists, so a missing file doesn't show a 404 page.
  // Only self-hosted files are checked; an external URL is assumed to exist.
  const external = /^https?:/.test(RESUME_URL);
  const [status, setStatus] = useState<"checking" | "ok" | "missing">(external ? "ok" : "checking");
  useEffect(() => {
    if (external) return;
    let alive = true;
    fetch(RESUME_URL, { method: "HEAD" })
      .then((r) => alive && setStatus(r.ok && (r.headers.get("content-type") ?? "").includes("pdf") ? "ok" : "missing"))
      .catch(() => alive && setStatus("missing"));
    return () => {
      alive = false;
    };
  }, [external]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/5 px-4 py-2.5">
        <p className="text-[13px] font-medium text-neutral-700">Resume.pdf</p>
        <div className="flex gap-2">
          <a
            href={RESUME_URL}
            target="_blank"
            rel="noreferrer"
            aria-disabled={status !== "ok"}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-medium ring-1 ring-black/10 ${
              status === "ok" ? "text-neutral-800 hover:bg-black/5" : "pointer-events-none text-neutral-400"
            }`}
          >
            Open <ExternalIcon />
          </a>
          <a
            href={RESUME_URL}
            download
            aria-disabled={status !== "ok"}
            className={`rounded-md px-3 py-1.5 text-[12.5px] font-medium text-white ${
              status === "ok" ? "bg-indigo-600 hover:bg-indigo-500" : "pointer-events-none bg-neutral-300"
            }`}
          >
            Download
          </a>
        </div>
      </div>
      <div className="min-h-0 flex-1 bg-neutral-100">
        {status === "ok" && <iframe src={`${RESUME_URL}#view=FitH`} title="Resume" className="h-full w-full" />}
        {status === "checking" && <p className="p-6 text-center text-[13px] text-neutral-400">Loading…</p>}
        {status === "missing" && (
          <div className="grid h-full place-items-center p-8 text-center">
            <div>
              <p className="text-[15px] font-semibold text-neutral-800">Resume coming soon</p>
              <p className="mt-1 text-[13px] text-neutral-500">
                Add <code className="rounded bg-white px-1 py-0.5 font-mono text-[12px]">public/resume.pdf</code> and it will appear here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
