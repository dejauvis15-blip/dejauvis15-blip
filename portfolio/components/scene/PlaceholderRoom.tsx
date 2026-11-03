"use client";

import { Instance, Instances, RoundedBox } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";

/**
 * A simple, stylized stand-in for the real bedroom. Everything here is
 * primitive geometry so it's cheap to render and easy to replace with a
 * Blender export later (see SCENE.roomModelUrl in lib/scene-config.ts).
 *
 * The monitor is NOT part of this file — it lives in <Monitor/> so it stays
 * interactive no matter which room is loaded.
 */

const C = {
  wall: "#2f3448",
  wallAccent: "#262a3b",
  floor: "#6b4f3a",
  rug: "#4b4566",
  deskTop: "#e8e2d6",
  metal: "#1d1f27",
  chair: "#23252f",
  chairAccent: "#6366f1",
  bed: "#d7d2c8",
  blanket: "#5b6b8c",
  wood: "#a27b5c",
  plant: "#3f7d58",
  pot: "#e7e1d6",
};

function Box({
  args,
  color,
  roughness = 0.8,
  metalness = 0,
  ...props
}: { args: [number, number, number]; color: string; roughness?: number; metalness?: number } & Omit<ThreeElements["mesh"], "args">) {
  return (
    <mesh castShadow receiveShadow {...props}>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
    </mesh>
  );
}

function Shell() {
  return (
    <group>
      {/* floor */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[8, 7]} />
        <meshStandardMaterial color={C.floor} roughness={0.75} />
      </mesh>
      {/* floorboard seams */}
      {Array.from({ length: 16 }).map((_, i) => (
        <mesh key={i} rotation-x={-Math.PI / 2} position={[-4 + i * 0.5, 0.001, 0]}>
          <planeGeometry args={[0.006, 7]} />
          <meshBasicMaterial color="#4f3a2b" transparent opacity={0.5} />
        </mesh>
      ))}
      {/* back wall */}
      <mesh position={[0, 1.6, -2.5]} receiveShadow>
        <planeGeometry args={[8, 3.2]} />
        <meshStandardMaterial color={C.wall} roughness={0.95} />
      </mesh>
      {/* left wall */}
      <mesh position={[-3, 1.6, 0]} rotation-y={Math.PI / 2} receiveShadow>
        <planeGeometry args={[7, 3.2]} />
        <meshStandardMaterial color={C.wallAccent} roughness={0.95} />
      </mesh>
      {/* baseboards */}
      <Box args={[8, 0.1, 0.02]} position={[0, 0.05, -2.49]} color="#1f2230" />
      <Box args={[0.02, 0.1, 7]} position={[-2.99, 0.05, 0]} color="#1f2230" />
    </group>
  );
}

function Window() {
  return (
    <group position={[-2.98, 1.65, -0.9]} rotation-y={Math.PI / 2}>
      {/* dusk sky */}
      <mesh position={[0, 0, -0.005]}>
        <planeGeometry args={[1.3, 1.1]} />
        <meshBasicMaterial toneMapped={false}>
          <GradientTexture />
        </meshBasicMaterial>
      </mesh>
      {/* frame */}
      <Box args={[1.42, 0.06, 0.06]} position={[0, 0.58, 0]} color="#e8e2d6" />
      <Box args={[1.42, 0.06, 0.06]} position={[0, -0.58, 0]} color="#e8e2d6" />
      <Box args={[0.06, 1.2, 0.06]} position={[-0.68, 0, 0]} color="#e8e2d6" />
      <Box args={[0.06, 1.2, 0.06]} position={[0.68, 0, 0]} color="#e8e2d6" />
      <Box args={[0.03, 1.1, 0.04]} position={[0, 0, 0]} color="#e8e2d6" />
      <Box args={[1.5, 0.04, 0.16]} position={[0, -0.62, 0.06]} color="#e8e2d6" />
    </group>
  );
}

/** Small vertical gradient used for the window "sky". */
function GradientTexture() {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 4;
    c.height = 256;
    const ctx = c.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, "#1e2a5a");
    g.addColorStop(0.55, "#7b5ea7");
    g.addColorStop(0.85, "#f39b6d");
    g.addColorStop(1, "#ffd29d");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 4, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return <primitive object={tex} attach="map" />;
}

function Desk() {
  const legs: [number, number][] = [
    [-0.86, -0.36],
    [0.86, -0.36],
    [-0.86, 0.36],
    [0.86, 0.36],
  ];
  return (
    <group position={[0, 0, -2.08]}>
      <RoundedBox args={[1.9, 0.045, 0.8]} radius={0.012} position={[0, 0.75, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={C.deskTop} roughness={0.55} />
      </RoundedBox>
      {legs.map(([x, z], i) => (
        <Box key={i} args={[0.04, 0.73, 0.04]} position={[x, 0.365, z]} color={C.metal} roughness={0.4} metalness={0.6} />
      ))}
      {/* drawer unit */}
      <Box args={[0.42, 0.55, 0.62]} position={[-0.6, 0.45, -0.05]} color="#d9d2c5" />
      <Box args={[0.12, 0.012, 0.01]} position={[-0.6, 0.62, 0.265]} color={C.metal} />
      <Box args={[0.12, 0.012, 0.01]} position={[-0.6, 0.38, 0.265]} color={C.metal} />
    </group>
  );
}

function Keyboard() {
  const keys = useMemo(() => {
    const out: [number, number][] = [];
    for (let r = 0; r < 5; r++) for (let c = 0; c < 15; c++) out.push([-0.196 + c * 0.028, -0.052 + r * 0.026]);
    return out;
  }, []);
  return (
    <group position={[-0.05, 0.775, -1.86]} rotation-x={0.04}>
      <RoundedBox args={[0.44, 0.016, 0.14]} radius={0.005} castShadow receiveShadow>
        <meshStandardMaterial color="#2a2d38" roughness={0.6} />
      </RoundedBox>
      <Instances limit={keys.length} castShadow>
        <boxGeometry args={[0.022, 0.01, 0.02]} />
        <meshStandardMaterial color="#e9e6f2" roughness={0.5} />
        {keys.map(([x, z], i) => (
          <Instance key={i} position={[x, 0.012, z]} color={i === 35 || i === 63 ? "#a5b4fc" : "#e9e6f2"} />
        ))}
      </Instances>
      {/* space bar */}
      <Box args={[0.16, 0.01, 0.02]} position={[0, 0.012, 0.072]} color="#e9e6f2" />
    </group>
  );
}

function DeskItems() {
  return (
    <group>
      {/* desk mat */}
      <RoundedBox args={[0.9, 0.004, 0.36]} radius={0.002} position={[0.1, 0.774, -1.86]} receiveShadow>
        <meshStandardMaterial color="#353047" roughness={0.95} />
      </RoundedBox>
      {/* mouse */}
      <mesh position={[0.36, 0.785, -1.85]} scale={[0.032, 0.018, 0.055]} castShadow>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color="#eeeeee" roughness={0.35} />
      </mesh>
      {/* mug */}
      <group position={[0.68, 0.773, -1.95]}>
        <mesh position={[0, 0.05, 0]} castShadow>
          <cylinderGeometry args={[0.038, 0.034, 0.1, 24]} />
          <meshStandardMaterial color="#f472b6" roughness={0.4} />
        </mesh>
        <mesh position={[0.045, 0.05, 0]} rotation-z={Math.PI / 2} castShadow>
          <torusGeometry args={[0.022, 0.007, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#f472b6" roughness={0.4} />
        </mesh>
      </group>
      {/* notebook */}
      <Box args={[0.17, 0.016, 0.23]} position={[-0.52, 0.781, -1.9]} rotation-y={0.25} color="#6366f1" />
      <Box args={[0.16, 0.004, 0.22]} position={[-0.52, 0.791, -1.9]} rotation-y={0.25} color="#f5f2ea" />
      {/* small succulent */}
      <group position={[0.8, 0.773, -2.32]}>
        <mesh position={[0, 0.04, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.035, 0.08, 20]} />
          <meshStandardMaterial color={C.pot} roughness={0.7} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[Math.cos(i * 1.3) * 0.02, 0.1, Math.sin(i * 1.3) * 0.02]} rotation={[Math.sin(i) * 0.5, i, Math.cos(i) * 0.5]} castShadow>
            <coneGeometry args={[0.018, 0.08, 6]} />
            <meshStandardMaterial color="#6fae7f" roughness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function DeskLamp() {
  return (
    <group position={[-0.72, 0.773, -2.3]} rotation-y={0.5}>
      <mesh position={[0, 0.01, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.08, 0.02, 24]} />
        <meshStandardMaterial color={C.metal} roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.2, 0.03]} rotation-x={0.25} castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.4, 8]} />
        <meshStandardMaterial color={C.metal} metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.39, 0.1]} rotation-x={-0.9} castShadow>
        <coneGeometry args={[0.07, 0.12, 24, 1, true]} />
        <meshStandardMaterial color="#f5f2ea" side={THREE.DoubleSide} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.36, 0.13]}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshBasicMaterial color="#ffe2b0" toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0.33, 0.16]} intensity={1.6} distance={2.2} decay={2} color="#ffc98a" />
    </group>
  );
}

function Chair() {
  return (
    <group position={[0.1, 0, -1.15]} rotation-y={-0.35}>
      {/* base star */}
      {[0, 1, 2, 3, 4].map((i) => (
        <group key={i} rotation-y={(i / 5) * Math.PI * 2}>
          <Box args={[0.03, 0.03, 0.3]} position={[0, 0.07, 0.15]} color={C.metal} metalness={0.6} roughness={0.35} />
          <mesh position={[0, 0.03, 0.29]} castShadow>
            <sphereGeometry args={[0.028, 12, 12]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.27, 0]} castShadow>
        <cylinderGeometry args={[0.022, 0.022, 0.4, 12]} />
        <meshStandardMaterial color={C.metal} metalness={0.7} roughness={0.3} />
      </mesh>
      <RoundedBox args={[0.5, 0.08, 0.48]} radius={0.03} position={[0, 0.5, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={C.chair} roughness={0.85} />
      </RoundedBox>
      <RoundedBox args={[0.48, 0.62, 0.07]} radius={0.04} position={[0, 0.86, 0.24]} rotation-x={-0.12} castShadow receiveShadow>
        <meshStandardMaterial color={C.chair} roughness={0.85} />
      </RoundedBox>
      <RoundedBox args={[0.3, 0.12, 0.02]} radius={0.01} position={[0, 0.95, 0.205]} rotation-x={-0.12}>
        <meshStandardMaterial color={C.chairAccent} roughness={0.6} />
      </RoundedBox>
      {/* armrests */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <Box args={[0.03, 0.2, 0.03]} position={[s * 0.25, 0.62, 0.02]} color={C.metal} />
          <Box args={[0.06, 0.03, 0.24]} position={[s * 0.25, 0.73, 0.0]} color={C.chair} />
        </group>
      ))}
    </group>
  );
}

function Bed() {
  return (
    <group position={[2.35, 0, -1.3]}>
      <Box args={[1.5, 0.3, 2.3]} position={[0, 0.2, 0]} color={C.wood} roughness={0.7} />
      <RoundedBox args={[1.42, 0.2, 2.2]} radius={0.06} position={[0, 0.44, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={C.bed} roughness={0.95} />
      </RoundedBox>
      <RoundedBox args={[1.46, 0.08, 1.5]} radius={0.04} position={[0, 0.55, 0.38]} castShadow receiveShadow>
        <meshStandardMaterial color={C.blanket} roughness={1} />
      </RoundedBox>
      <RoundedBox args={[0.55, 0.13, 0.35]} radius={0.06} position={[-0.32, 0.6, -0.85]} rotation-x={-0.2} castShadow>
        <meshStandardMaterial color="#f3efe7" roughness={1} />
      </RoundedBox>
      <RoundedBox args={[0.55, 0.13, 0.35]} radius={0.06} position={[0.32, 0.6, -0.85]} rotation-x={-0.2} castShadow>
        <meshStandardMaterial color="#f3efe7" roughness={1} />
      </RoundedBox>
      {/* headboard */}
      <Box args={[1.56, 0.9, 0.06]} position={[0, 0.55, -1.16]} color={C.wood} />
    </group>
  );
}

function Shelf() {
  const books: [number, number, string][] = [
    [0.035, 0.24, "#ef4444"],
    [0.03, 0.22, "#f59e0b"],
    [0.04, 0.26, "#e8e2d6"],
    [0.028, 0.2, "#6366f1"],
    [0.036, 0.23, "#10b981"],
    [0.03, 0.25, "#1f2937"],
  ];
  let x = -0.36;
  return (
    <group position={[0.95, 1.78, -2.38]}>
      <Box args={[0.9, 0.03, 0.22]} color={C.wood} />
      {books.map(([w, h, c], i) => {
        const px = x + w / 2;
        x += w + 0.006;
        return <Box key={i} args={[w, h, 0.16]} position={[px, h / 2 + 0.015, 0]} color={c} />;
      })}
      {/* leaning book */}
      <Box args={[0.03, 0.22, 0.16]} position={[-0.08, 0.115, 0]} rotation-z={-0.35} color="#ec4899" />
      {/* tiny speaker / figure */}
      <mesh position={[0.25, 0.08, 0]} castShadow>
        <boxGeometry args={[0.1, 0.13, 0.1]} />
        <meshStandardMaterial color="#e8e2d6" />
      </mesh>
      <mesh position={[0.25, 0.09, 0.051]}>
        <circleGeometry args={[0.03, 24]} />
        <meshStandardMaterial color="#1d1f27" />
      </mesh>
    </group>
  );
}

function Poster({ position, size, colors, rotation = 0 }: { position: [number, number, number]; size: [number, number]; colors: string[]; rotation?: number }) {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = Math.round((256 * size[1]) / size[0]);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = colors[0];
    ctx.fillRect(0, 0, c.width, c.height);
    // abstract shapes
    ctx.fillStyle = colors[1];
    ctx.beginPath();
    ctx.arc(c.width * 0.62, c.height * 0.38, c.width * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = colors[2];
    ctx.fillRect(c.width * 0.12, c.height * 0.55, c.width * 0.5, c.height * 0.3);
    ctx.strokeStyle = colors[3] ?? "#fff";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(c.width * 0.1, c.height * 0.15);
    ctx.lineTo(c.width * 0.9, c.height * 0.9);
    ctx.stroke();
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [colors, size]);
  return (
    <group position={position} rotation-y={rotation}>
      <Box args={[size[0] + 0.04, size[1] + 0.04, 0.02]} color="#14151b" />
      <mesh position={[0, 0, 0.011]}>
        <planeGeometry args={size} />
        <meshStandardMaterial map={tex} roughness={0.6} />
      </mesh>
    </group>
  );
}

function FloorPlant() {
  const leaves = useMemo(
    () =>
      Array.from({ length: 9 }).map((_, i) => ({
        rot: [0.5 + (i % 3) * 0.2, (i / 9) * Math.PI * 2, 0] as [number, number, number],
        y: 0.55 + (i % 3) * 0.12,
      })),
    [],
  );
  return (
    <group position={[-1.45, 0, -2.1]}>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.17, 0.13, 0.4, 24]} />
        <meshStandardMaterial color={C.pot} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.012, 0.015, 0.3, 6]} />
        <meshStandardMaterial color="#4b3a2a" />
      </mesh>
      {leaves.map((l, i) => (
        <group key={i} position={[0, l.y, 0]} rotation={l.rot}>
          <mesh position={[0, 0.22, 0]} scale={[0.09, 0.22, 0.02]} castShadow>
            <sphereGeometry args={[1, 12, 8]} />
            <meshStandardMaterial color={i % 2 ? C.plant : "#4f9a6b"} roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function LedStrip() {
  const wash = useWashTexture();
  return (
    <group>
      <mesh position={[0, 2.45, -2.49]}>
        <boxGeometry args={[3.2, 0.015, 0.01]} />
        <meshBasicMaterial color="#a78bfa" toneMapped={false} />
      </mesh>
      {/* soft wash on the wall */}
      <mesh position={[0, 2.25, -2.495]}>
        <planeGeometry args={[3.6, 0.6]} />
        <meshBasicMaterial transparent opacity={0.22} color="#8b5cf6" depthWrite={false} alphaMap={wash} />
      </mesh>
      <pointLight position={[0, 2.3, -2.2]} intensity={1.2} distance={3} color="#8b5cf6" />
    </group>
  );
}

function useWashTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 4;
    c.height = 64;
    const ctx = c.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 0, 64);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(1, "#000000");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 4, 64);
    return new THREE.CanvasTexture(c);
  }, []);
}

export function PlaceholderRoom() {
  return (
    <group>
      <Shell />
      <Window />
      <mesh rotation-x={-Math.PI / 2} position={[0.1, 0.004, -1.2]} receiveShadow>
        <circleGeometry args={[1.0, 48]} />
        <meshStandardMaterial color={C.rug} roughness={1} />
      </mesh>
      <Desk />
      <Keyboard />
      <DeskItems />
      <DeskLamp />
      <Chair />
      <Bed />
      <Shelf />
      {/* the big poster left of the desk is <DesignPoster/> (live design portfolio) */}
      <Poster position={[-0.38, 1.85, -2.485]} size={[0.4, 0.5]} colors={["#1e1b4b", "#ec4899", "#fbbf24", "#e0e7ff"]} />
      <Poster position={[-2.985, 1.7, -2.0]} size={[0.5, 0.5]} colors={["#0f766e", "#fde68a", "#fb7185", "#ffffff"]} rotation={Math.PI / 2} />
      <FloorPlant />
      <LedStrip />
    </group>
  );
}
