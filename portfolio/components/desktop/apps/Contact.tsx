"use client";

import { useState } from "react";
import { CONTACT } from "@/lib/content";
import { ExternalIcon } from "../icons";

export function Contact() {
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${CONTACT.email}`;
    }
  };

  const mailto = `mailto:${CONTACT.email}?subject=${encodeURIComponent(
    `Hello from ${name || "your portfolio"}`,
  )}&body=${encodeURIComponent(message)}`;

  const links = [
    { label: "LinkedIn", href: CONTACT.linkedin, handle: CONTACT.linkedin.replace(/^https?:\/\/(www\.)?/, "") },
    { label: "GitHub", href: CONTACT.github, handle: CONTACT.github.replace(/^https?:\/\//, "") },
  ];

  return (
    <div className="mx-auto max-w-md p-5 sm:p-7">
      <h3 className="text-xl font-semibold tracking-tight text-neutral-900">Let&apos;s talk</h3>
      <p className="mt-1 text-[13.5px] text-neutral-500">Open to internships, collaborations, and good conversations about design.</p>

      <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-black/5 bg-white p-3.5">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-wide text-neutral-400 uppercase">Email</p>
          <a href={`mailto:${CONTACT.email}`} className="block truncate text-[14px] font-medium text-neutral-900 hover:text-indigo-600">
            {CONTACT.email}
          </a>
        </div>
        <button type="button" onClick={copy} className="shrink-0 rounded-md bg-black/5 px-3 py-1.5 text-[12.5px] font-medium text-neutral-700 hover:bg-black/10">
          <span aria-live="polite">{copied ? "Copied ✓" : "Copy"}</span>
        </button>
      </div>

      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-xl border border-black/5 bg-white p-3.5 transition hover:border-indigo-200 hover:shadow-sm"
            >
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold tracking-wide text-neutral-400 uppercase">{l.label}</span>
                <span className="block truncate text-[13px] font-medium text-neutral-800">{l.handle}</span>
              </span>
              <span className="text-neutral-400">
                <ExternalIcon />
              </span>
            </a>
          </li>
        ))}
      </ul>

      <form
        className="mt-6 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          window.location.href = mailto;
        }}
      >
        <p className="text-[11px] font-semibold tracking-wide text-neutral-400 uppercase">Quick message</p>
        <label className="block">
          <span className="sr-only">Your name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[14px] text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100"
          />
        </label>
        <label className="block">
          <span className="sr-only">Message</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What are you working on?"
            rows={4}
            className="w-full resize-none rounded-lg border border-black/10 bg-white px-3 py-2 text-[14px] text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100"
          />
        </label>
        <button type="submit" disabled={!message.trim()} className="w-full rounded-lg bg-indigo-600 py-2.5 text-[14px] font-medium text-white transition hover:bg-indigo-500 disabled:bg-neutral-300">
          Open in mail app
        </button>
      </form>
    </div>
  );
}
