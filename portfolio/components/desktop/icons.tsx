import type { AppId } from "@/lib/desktop-store";

/** App-tile icons: gradient squircle + white glyph, drawn as inline SVG. */
const TILES: Record<AppId, { from: string; to: string; glyph: React.ReactNode }> = {
  projects: {
    from: "#60a5fa",
    to: "#2563eb",
    glyph: <path d="M5 8.5A2.5 2.5 0 0 1 7.5 6h4l2 2.2h7A2.5 2.5 0 0 1 23 10.7v8.8a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 5 19.5z" fill="#fff" />,
  },
  about: {
    from: "#f472b6",
    to: "#db2777",
    glyph: (
      <g fill="#fff">
        <circle cx="14" cy="10.5" r="4" />
        <path d="M6.5 22c.8-4 3.8-6.2 7.5-6.2s6.7 2.2 7.5 6.2z" />
      </g>
    ),
  },
  experience: {
    from: "#fbbf24",
    to: "#ea580c",
    glyph: (
      <g fill="#fff">
        <path d="M11 6.5h6a1.5 1.5 0 0 1 1.5 1.5v1.5h-2V8.5h-5v1H9.5V8A1.5 1.5 0 0 1 11 6.5z" />
        <rect x="5" y="10" width="18" height="12" rx="2.5" />
      </g>
    ),
  },
  resume: {
    from: "#e5e7eb",
    to: "#9ca3af",
    glyph: (
      <g>
        <path d="M8 5h8.5L21 9.5V22a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 7 22V6.5A1.5 1.5 0 0 1 8 5z" fill="#fff" />
        <path d="M10 13h8M10 16h8M10 19h5" stroke="#6b7280" strokeWidth="1.4" strokeLinecap="round" />
      </g>
    ),
  },
  contact: {
    from: "#34d399",
    to: "#059669",
    glyph: (
      <g>
        <rect x="5" y="8" width="18" height="13" rx="2.5" fill="#fff" />
        <path d="m6 9.5 8 6 8-6" stroke="#059669" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
      </g>
    ),
  },
  welcome: {
    from: "#a78bfa",
    to: "#6d28d9",
    glyph: (
      <g fill="#fff">
        <path d="M14 5l2.3 5.7L22 13l-5.7 2.3L14 21l-2.3-5.7L6 13l5.7-2.3z" />
      </g>
    ),
  },
};

export function AppIcon({ id, size = 56 }: { id: AppId; size?: number }) {
  const t = TILES[id];
  const gid = `g-${id}`;
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden className="drop-shadow-[0_6px_14px_rgba(0,0,0,0.35)]">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={t.from} />
          <stop offset="1" stopColor={t.to} />
        </linearGradient>
      </defs>
      <rect x="0.5" y="0.5" width="27" height="27" rx="7" fill={`url(#${gid})`} />
      <rect x="0.5" y="0.5" width="27" height="27" rx="7" fill="none" stroke="rgba(255,255,255,0.25)" />
      {t.glyph}
    </svg>
  );
}

export const ExternalIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4.5 2.5h5v5M9.5 2.5 3 9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
