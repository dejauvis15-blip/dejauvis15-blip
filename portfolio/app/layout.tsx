import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-face", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.jauvis.dev"),
  title: "Jauvis Dozier — UX Designer & Front-End Developer",
  description:
    "Step into my room: an interactive 3D portfolio. Information Science student at UT Knoxville concentrating in UX Design.",
  openGraph: {
    title: "Jauvis Dozier — Portfolio",
    description: "An interactive 3D bedroom where the monitor opens into my work.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0e14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
