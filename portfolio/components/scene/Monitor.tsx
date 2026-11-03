"use client";

import { Html, RoundedBox, useCursor } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { PROFILE } from "@/lib/content";
import { MONITOR_BEZEL, MONITOR_CONTENT, SCREENS } from "@/lib/scene-config";
import { useExperience } from "@/lib/store";
import { drawWallpaper } from "@/lib/wallpaper";
import { LiveScreen } from "./LiveScreen";

/** Draws the "lock screen" shown on the 3D monitor before you zoom in. */
function useScreenTexture() {
  const { canvas, texture } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1280;
    canvas.height = 720;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    return { canvas, texture };
  }, []);

  useEffect(() => {
    const ctx = canvas.getContext("2d")!;
    const draw = () => {
      const { width: w, height: h } = canvas;
      if (MONITOR_CONTENT === "desktop") {
        drawWallpaper(ctx, w, h);
      } else {
        // Mirrors the dev site (black, snow, mono type) so the hand-off from
        // this texture to the live page underneath is invisible.
        ctx.fillStyle = "#050505";
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 160; i++) {
          const r = ((i * 9301 + 49297) % 233280) / 233280;
          const q = ((i * 4253 + 1931) % 1000) / 1000;
          ctx.fillStyle = `rgba(255,251,244,${0.25 + q * 0.6})`;
          ctx.beginPath();
          ctx.arc(r * w, h * 0.55 + q * h * 0.4, 1 + q * 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = "#e9e4da";
        ctx.fillRect(0, h * 0.94, w, h * 0.06);
      }
      ctx.fillStyle = "rgba(240,236,228,0.92)";
      ctx.textAlign = "left";
      ctx.font = "500 44px ui-monospace, Menlo, monospace";
      ctx.fillText(PROFILE.name.toLowerCase(), w * 0.25, h * 0.2);
      ctx.font = "400 22px ui-monospace, Menlo, monospace";
      ctx.fillStyle = "rgba(240,236,228,0.6)";
      ctx.fillText("click to sit down", w * 0.25, h * 0.28);
      texture.needsUpdate = true;
    };
    draw();
  }, [canvas, texture]);

  return texture;
}

export function Monitor() {
  const mode = useExperience((s) => s.mode);
  const hovered = useExperience((s) => s.hovered === "monitor");
  const setHovered = useExperience((s) => s.setHovered);
  const enter = useExperience((s) => s.enter);
  const texture = useScreenTexture();
  const halo = useHaloTexture();

  const interactive = mode === "room" || mode === "intro";
  useCursor(hovered && interactive);

  const screenMat = useRef<THREE.MeshBasicMaterial>(null);
  const glowMat = useRef<THREE.MeshBasicMaterial>(null);
  const screenLight = useRef<THREE.PointLight>(null);

  const [sx, sy, sz] = SCREENS.monitor.center;
  const [sw, sh] = SCREENS.monitor.size;
  const b = MONITOR_BEZEL;

  // Ease the hover glow in/out rather than snapping.
  useFrame((_, dt) => {
    const on = hovered && interactive ? 1 : 0;
    if (screenMat.current) {
      const target = on ? 1 : 0.85;
      const c = screenMat.current.color;
      const v = THREE.MathUtils.damp(c.r, target, 8, dt);
      c.setRGB(v, v, v);
    }
    if (glowMat.current) glowMat.current.opacity = THREE.MathUtils.damp(glowMat.current.opacity, on * 0.55, 8, dt);
    if (screenLight.current)
      screenLight.current.intensity = THREE.MathUtils.damp(screenLight.current.intensity, 0.35 + on * 0.4, 8, dt);
  });

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (interactive) setHovered("monitor");
  };
  const onOut = () => setHovered(null);
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (interactive) enter("monitor");
  };

  return (
    <group position={[sx, sy, sz]}>
      {/* hover halo behind the bezel */}
      <mesh position={[0, 0, -0.03]}>
        <planeGeometry args={[sw + 0.14, sh + 0.14]} />
        <meshBasicMaterial ref={glowMat} color="#a5b4fc" transparent opacity={0} depthWrite={false} toneMapped={false} alphaMap={halo} />
      </mesh>

      {/* body / bezel */}
      <RoundedBox
        args={[sw + b * 2, sh + b * 2 + 0.014, 0.022]}
        radius={0.008}
        position={[0, -0.007, -0.012]}
        castShadow
        receiveShadow
        onPointerOver={onOver}
        onPointerOut={onOut}
        onClick={onClick}
      >
        <meshStandardMaterial color="#0d0d0e" roughness={0.35} metalness={0.3} />
      </RoundedBox>

      {/* the screen itself */}
      <mesh position={[0, 0, 0.0005]} onPointerOver={onOver} onPointerOut={onOut} onClick={onClick} name="MonitorScreen">
        <planeGeometry args={[sw, sh]} />
        <meshBasicMaterial ref={screenMat} map={texture} toneMapped={false} />
      </mesh>
      {MONITOR_CONTENT === "site" && <LiveScreen id="monitor" />}

      {/* back plate where the arm attaches (arm itself is part of the room) */}
      <RoundedBox args={[sw * 0.42, sh * 0.42, 0.035]} radius={0.01} position={[0, -0.01, -0.045]} castShadow>
        <meshStandardMaterial color="#141414" roughness={0.5} metalness={0.3} />
      </RoundedBox>

      {/* light spill from the screen onto the desk */}
      <pointLight ref={screenLight} position={[0, -0.05, 0.25]} intensity={0.35} distance={1.2} decay={2} color="#e8eefc" />

      {/* hint bubble */}
      <Html position={[0, sh / 2 + 0.09, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
        <div
          className={`whitespace-nowrap rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-md transition-all duration-500 ${
            mode === "room" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
          }`}
        >
          <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-300 align-middle" />
          {hovered ? `Open ${SCREENS.monitor.hint.toLowerCase()}` : "Click the monitor"}
        </div>
      </Html>
    </group>
  );
}

function useHaloTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 20, 64, 64, 64);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(1, "#000000");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
}
