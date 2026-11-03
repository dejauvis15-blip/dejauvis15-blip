/**
 * Portfolio content. Everything the desktop windows display comes from here.
 *
 * Entries with `draft: true` are placeholders: they render with a "Draft"
 * badge so they're easy to spot. Replace them with real work and remove
 * the flag.
 */

export const PROFILE = {
  name: "Jauvis Dozier",
  firstName: "Jauvis",
  role: "UX Designer & Front-End Developer",
  tagline:
    "Information Science student designing thoughtful digital experiences — and building them.",
  location: "Knoxville, TN",
  school: "University of Tennessee, Knoxville",
  program: "Information Science",
  concentration: "User Experience Design",
  // TODO: add graduation term, e.g. "Expected May 2027"
  graduation: "",
  bio: [
    "I'm an Information Science student at the University of Tennessee, Knoxville, concentrating in User Experience Design. I care about the full arc of a product: understanding people, shaping the experience, and shipping it in code.",
    "Right now I'm building web applications, exploring backend technologies, and sharpening my software development skills — this portfolio is itself a little experiment in mixing 3D, motion, and interface design.",
  ],
  interests: [
    "Interaction & motion design",
    "Design systems",
    "Full-stack web development",
    "Music & data",
    "3D on the web",
  ],
  skills: {
    Design: ["Figma", "User research", "Wireframing", "Prototyping", "Usability testing"],
    Languages: ["TypeScript", "JavaScript", "Python", "HTML", "CSS"],
    Frontend: ["React", "Next.js", "Tailwind CSS", "Framer Motion", "Three.js", "GSAP"],
    Backend: ["Flask", "MongoDB", "REST APIs"],
    Tools: ["Git", "GitHub", "Docker", "Vercel", "Blender"],
  } as Record<string, string[]>,
};

export const CONTACT = {
  email: "dejauvis15@gmail.com",
  designPortfolio: "https://jauvis-dozier-portfolio.vercel.app/",
  linkedin: "https://www.linkedin.com/in/jauvisdozier",
  github: "https://github.com/dejauvis15-blip",
  website: "https://www.jauvis.dev",
};

/** Same PDF the existing sites link to. Swap for "/resume.pdf" to self-host. */
export const RESUME_URL = "https://jauvis-dozier-portfolio.vercel.app/resume.pdf";

export type ProjectCategory = "ux" | "branding" | "development";

export const PROJECT_CATEGORIES: { id: ProjectCategory; label: string }[] = [
  { id: "ux", label: "UX Case Studies" },
  { id: "branding", label: "Branding" },
  { id: "development", label: "Development" },
];

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  year: string;
  summary: string;
  role: string;
  tools: string[];
  /** Two-stop gradient used for the project thumbnail. */
  accent: [string, string];
  sections: { heading: string; body: string }[];
  links?: { label: string; href: string }[];
  draft?: boolean;
}

export const PROJECTS: Project[] = [
  {
    id: "ux-case-study",
    title: "UX Case Study (placeholder)",
    category: "ux",
    year: "2026",
    summary:
      "Swap this for a real case study: the problem, who you designed for, and what changed because of your work.",
    role: "UX Researcher & Designer",
    tools: ["Figma", "Interviews", "Usability testing"],
    accent: ["#6366f1", "#ec4899"],
    sections: [
      { heading: "Problem", body: "What was broken or missing, and for whom?" },
      { heading: "Research", body: "Methods, participants, and the key insights you uncovered." },
      { heading: "Design", body: "Flows, wireframes, and the decisions behind them. Add images to /public/projects." },
      { heading: "Outcome", body: "Metrics, feedback, or what you'd do next." },
    ],
    draft: true,
  },
  {
    id: "brand-identity",
    title: "Brand Identity (placeholder)",
    category: "branding",
    year: "2026",
    summary:
      "Swap this for a branding project: logo, type, color, and how the system holds together across touchpoints.",
    role: "Visual Designer",
    tools: ["Figma", "Illustrator"],
    accent: ["#f59e0b", "#ef4444"],
    sections: [
      { heading: "Brief", body: "Who the brand is for and what it needed to communicate." },
      { heading: "System", body: "Logo, typography, color, and usage rules." },
      { heading: "Applications", body: "Where the identity shows up in the real world." },
    ],
    draft: true,
  },
  {
    id: "commit-analyzer",
    title: "GitHub Commit Analyzer",
    category: "development",
    year: "2025",
    summary:
      "A Python and Flask backend that analyzes GitHub activity using MongoDB and the GitHub API.",
    role: "Backend Developer",
    tools: ["Python", "Flask", "MongoDB", "GitHub API"],
    accent: ["#10b981", "#0ea5e9"],
    sections: [
      { heading: "Overview", body: "Pulls commit history from the GitHub API, stores it in MongoDB, and exposes REST endpoints that summarize a developer's activity." },
      { heading: "What I learned", body: "Designing a clean API surface, handling rate limits, and modeling time-series data in a document store." },
    ],
    links: [{ label: "View on GitHub", href: "https://github.com/dejauvis15-blip/Github-commit-analyzer-" }],
  },
  {
    id: "autm",
    title: "Autm",
    category: "development",
    year: "2025",
    summary: "A music analytics web application featuring listening statistics and social features.",
    role: "Full-Stack Developer & Designer",
    tools: ["React", "TypeScript", "REST APIs"],
    accent: ["#a855f7", "#f43f5e"],
    sections: [
      { heading: "Overview", body: "Turns listening history into readable stats and lets friends compare taste." },
      { heading: "Design focus", body: "Making dense data feel personal: clear hierarchy, playful charts, and social moments." },
    ],
    links: [{ label: "View on GitHub", href: "https://github.com/dejauvis15-blip/Autm-" }],
  },
  {
    id: "portfolio-3d",
    title: "This Portfolio",
    category: "development",
    year: "2026",
    summary:
      "An interactive 3D bedroom built with React Three Fiber, where the monitor opens into a desktop-style portfolio.",
    role: "Designer & Developer",
    tools: ["Next.js", "TypeScript", "React Three Fiber", "GSAP", "Tailwind CSS", "Blender"],
    accent: ["#3b82f6", "#8b5cf6"],
    sections: [
      { heading: "Idea", body: "Portfolios usually tell you someone can design and build. This one tries to show it — the room is the landing page, the monitor is the navigation." },
      { heading: "Build", body: "Camera choreography with GSAP, a lightweight placeholder scene ready to swap for a Blender model, and an accessible windowed UI with keyboard support." },
    ],
    links: [{ label: "Source", href: "https://github.com/dejauvis15-blip/dejauvis15-blip" }],
  },
];

export interface Role {
  title: string;
  org: string;
  period: string;
  location?: string;
  points: string[];
  draft?: boolean;
}

export const EXPERIENCE: Role[] = [
  {
    title: "UX Analysis Intern",
    org: "Tombras",
    period: "Oct 2026 — Dec 2026",
    // TODO: add 2–3 bullets on what you analyzed and what came of it.
    points: [],
  },
  {
    title: "Web Design Researcher",
    org: "FCMF · University of Tennessee",
    period: "Jun 2026",
    // TODO: add 2–3 bullets on the research and your contribution.
    points: [],
  },
];
