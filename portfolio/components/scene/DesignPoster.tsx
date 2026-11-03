"use client";

import { Html, useCursor } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { SCREENS } from "@/lib/scene-config";
import { useExperience } from "@/lib/store";
import { LiveScreen } from "./LiveScreen";

/**
 * A framed poster on the wall that shows the design portfolio live.
 * Click it to zoom in and browse; the page is interactive once you're there.
 */
export function DesignPoster() {
  const cfg = SCREENS.poster;
  const [px, py, pz] = cfg.center;
  const [w, h] = cfg.size;
  const mode = useExperience((s) => s.mode);
  const hovered = useExperience((s) => s.hovered === "poster");
  const setHovered = useExperience((s) => s.setHovered);
  const enter = useExperience((s) => s.enter);
  const interactive = mode === "room" || mode === "intro";
  useCursor(hovered && interactive);

  const glow = useRef<THREE.MeshBasicMaterial>(null);
  useFrame((_, dt) => {
    if (glow.current) glow.current.opacity = THREE.MathUtils.damp(glow.current.opacity, hovered && interactive ? 0.5 : 0, 8, dt);
  });

  // Shown underneath the page while it loads (or if the site refuses to be framed).
  const cover = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 600;
    c.height = 850;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#f5efe4";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.arc(380, 300, 170, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#6366f1";
    ctx.fillRect(70, 430, 300, 240);
    ctx.fillStyle = "#111827";
    ctx.font = "700 54px system-ui, sans-serif";
    ctx.fillText("DESIGN", 60, 760);
    ctx.font = "400 30px system-ui, sans-serif";
    ctx.fillText("portfolio", 62, 800);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  const halo = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 24, 64, 64, 64);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(1, "#000000");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (interactive) setHovered("poster");
  };
  const onOut = () => setHovered(null);
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (interactive) enter("poster");
  };

  const frame = 0.03;
  return (
    <group position={[px, py, pz]}>
      <mesh position={[0, 0, -0.012]}>
        <planeGeometry args={[w + 0.25, h + 0.25]} />
        <meshBasicMaterial ref={glow} color="#fdba74" transparent opacity={0} alphaMap={halo} depthWrite={false} toneMapped={false} />
      </mesh>
      {/* frame */}
      <mesh position={[0, 0, -0.008]} castShadow onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
        <boxGeometry args={[w + frame * 2, h + frame * 2, 0.02]} />
        <meshStandardMaterial color="#14151b" roughness={0.5} />
      </mesh>
      {/* print */}
      <mesh position={[0, 0, 0.0025]} onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={cover} toneMapped={false} />
      </mesh>
      <LiveScreen id="poster" />
      <Html position={[0, -h / 2 - 0.07, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
        <div
          className={`rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow-lg backdrop-blur-md transition-all duration-300 ${
            hovered && interactive ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
          }`}
        >
          Open {cfg.hint.toLowerCase()}
        </div>
      </Html>
    </group>
  );
}
