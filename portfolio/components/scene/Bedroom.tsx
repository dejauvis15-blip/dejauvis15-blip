"use client";

import { Instance, Instances, RoundedBox } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import {
  camoMatTexture,
  coverTexture,
  foliageArtTexture,
  nightWindowTexture,
  paintTexture,
  pegboardTexture,
  radialAlphaTexture,
  templeArtTexture,
  woodFloorTexture,
} from "@/lib/textures";

/**
 * A primitive-geometry recreation of the real room (from photos): sage-green
 * walls, white wainscoting and crown molding, a window with curtains behind a
 * white standing desk, portrait + landscape monitors, pegboard and shelves on
 * the left, a white PC on drawers to the right, hardwood floor.
 *
 * The interactive monitor screen and the design poster are NOT here — they
 * live in <Monitor/> and <DesignPoster/> so they keep working when this is
 * swapped for a Blender model (SCENE.roomModelUrl).
 */

export const ROOM = {
  wallZ: -2.3,
  leftX: -2.2,
  rightX: 2.4,
  ceiling: 2.45,
  frontZ: 3.2,
};

const C = {
  wall: "#5b8560",
  trim: "#f1efe8",
  white: "#eeece6",
  offWhite: "#e3e0d8",
  black: "#151515",
  curtain: "#cfcbc3",
  chairFrame: "#e9e7e2",
  chairMesh: "#9a9894",
};

type MeshProps = Omit<ThreeElements["mesh"], "args">;

function Box({
  args,
  color,
  roughness = 0.75,
  metalness = 0,
  map,
  ...props
}: { args: [number, number, number]; color?: string; roughness?: number; metalness?: number; map?: THREE.Texture } & MeshProps) {
  return (
    <mesh castShadow receiveShadow {...props}>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} map={map} />
    </mesh>
  );
}

function RBox({
  args,
  radius = 0.01,
  color,
  roughness = 0.6,
  metalness = 0,
  ...props
}: { args: [number, number, number]; radius?: number; color: string; roughness?: number; metalness?: number } & Omit<MeshProps, "children">) {
  return (
    <RoundedBox args={args} radius={radius} smoothness={3} castShadow receiveShadow {...(props as object)}>
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
    </RoundedBox>
  );
}

/* ------------------------------------------------------------------ shell */

function Shell() {
  const floor = useMemo(() => woodFloorTexture(), []);
  const paint = useMemo(() => paintTexture(C.wall), []);
  const ceiling = useMemo(() => paintTexture("#e7e3da", 9), []);
  const { wallZ, leftX, rightX, ceiling: H, frontZ } = ROOM;
  const width = rightX - leftX;
  const depth = frontZ - wallZ;
  const cx = (leftX + rightX) / 2;
  const cz = (wallZ + frontZ) / 2;

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[cx, 0, cz]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial map={floor} roughness={0.42} metalness={0.05} />
      </mesh>
      {/* back wall */}
      <mesh position={[cx, H / 2, wallZ]} receiveShadow>
        <planeGeometry args={[width, H]} />
        <meshStandardMaterial map={paint} roughness={0.92} />
      </mesh>
      {/* left + right walls */}
      <mesh position={[leftX, H / 2, cz]} rotation-y={Math.PI / 2} receiveShadow>
        <planeGeometry args={[depth, H]} />
        <meshStandardMaterial map={paint} roughness={0.92} />
      </mesh>
      <mesh position={[rightX, H / 2, cz]} rotation-y={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[depth, H]} />
        <meshStandardMaterial map={paint} roughness={0.92} />
      </mesh>
      {/* ceiling */}
      <mesh position={[cx, H, cz]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial map={ceiling} roughness={0.95} />
      </mesh>

      {/* crown molding (stepped profile) */}
      {[0, 1].map((i) => (
        <group key={i}>
          <Box args={[width, 0.05 + i * 0.03, 0.03 + i * 0.03]} position={[cx, H - 0.025 - i * 0.03, wallZ + 0.015 + i * 0.015]} color={C.trim} roughness={0.5} />
          <Box args={[0.03 + i * 0.03, 0.05 + i * 0.03, depth]} position={[leftX + 0.015 + i * 0.015, H - 0.025 - i * 0.03, cz]} color={C.trim} roughness={0.5} />
          <Box args={[0.03 + i * 0.03, 0.05 + i * 0.03, depth]} position={[rightX - 0.015 - i * 0.015, H - 0.025 - i * 0.03, cz]} color={C.trim} roughness={0.5} />
        </group>
      ))}

      {/* baseboards */}
      <Box args={[width, 0.1, 0.015]} position={[cx, 0.05, wallZ + 0.008]} color={C.trim} roughness={0.5} />
      <Box args={[0.015, 0.1, depth]} position={[rightX - 0.008, 0.05, cz]} color={C.trim} roughness={0.5} />

      {/* ceiling fixture (off) */}
      <group position={[0.1, H, -0.4]}>
        <mesh position={[0, -0.04, 0]}>
          <cylinderGeometry args={[0.2, 0.22, 0.07, 48]} />
          <meshStandardMaterial color="#d8d6d0" roughness={0.35} />
        </mesh>
        <mesh position={[0, -0.04, 0]}>
          <torusGeometry args={[0.215, 0.012, 8, 48]} />
          <meshStandardMaterial color="#9a9a98" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* floor vent */}
      <group position={[0.92, 0.002, -1.55]}>
        <mesh rotation-x={-Math.PI / 2}>
          <planeGeometry args={[0.3, 0.1]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.5} />
        </mesh>
        {Array.from({ length: 9 }).map((_, i) => (
          <mesh key={i} rotation-x={-Math.PI / 2} position={[-0.13 + i * 0.0325, 0.001, 0]}>
            <planeGeometry args={[0.008, 0.08]} />
            <meshStandardMaterial color="#0c0c0c" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Board-and-batten wainscoting (left part of the back wall + left wall). */
function Wainscot() {
  const { wallZ, leftX } = ROOM;
  const h = 1.55;
  const x0 = leftX;
  const x1 = -1.42;
  const w = x1 - x0;
  const leftLen = 2.2;
  return (
    <group>
      {/* back wall section */}
      <Box args={[w, h, 0.012]} position={[x0 + w / 2, h / 2, wallZ + 0.006]} color={C.white} roughness={0.55} />
      <Box args={[w, 0.05, 0.035]} position={[x0 + w / 2, h, wallZ + 0.018]} color={C.trim} roughness={0.45} />
      {[x0 + 0.04, x0 + w - 0.04].map((x, i) => (
        <Box key={i} args={[0.07, h - 0.12, 0.022]} position={[x, h / 2 + 0.02, wallZ + 0.017]} color={C.trim} roughness={0.45} />
      ))}
      <Box args={[w - 0.08, 0.06, 0.022]} position={[x0 + w / 2, 1.0, wallZ + 0.017]} color={C.trim} roughness={0.45} />
      <Box args={[w - 0.08, 0.06, 0.022]} position={[x0 + w / 2, h - 0.08, wallZ + 0.017]} color={C.trim} roughness={0.45} />
      {/* left wall section */}
      <Box args={[0.012, h, leftLen]} position={[leftX + 0.006, h / 2, wallZ + leftLen / 2]} color={C.white} roughness={0.55} />
      <Box args={[0.035, 0.05, leftLen]} position={[leftX + 0.018, h, wallZ + leftLen / 2]} color={C.trim} roughness={0.45} />
      {[0.5, 1.1, 1.7].map((z) => (
        <Box key={z} args={[0.022, h - 0.12, 0.07]} position={[leftX + 0.017, h / 2 + 0.02, wallZ + z]} color={C.trim} roughness={0.45} />
      ))}
      <Box args={[0.022, 0.06, leftLen]} position={[leftX + 0.017, h - 0.08, wallZ + leftLen / 2]} color={C.trim} roughness={0.45} />
    </group>
  );
}

/* ----------------------------------------------------------------- window */

function curtainGeometry(w: number, h: number, folds: number, depth: number) {
  const g = new THREE.PlaneGeometry(w, h, folds * 8, 12);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const t = (x / w + 0.5) * folds * Math.PI * 2;
    // deeper folds toward the bottom, gathered at the rod
    const amp = depth * (0.6 + 0.4 * (0.5 - y / h));
    pos.setZ(i, Math.sin(t) * amp);
  }
  g.computeVertexNormals();
  return g;
}

function WindowWall() {
  const night = useMemo(() => nightWindowTexture(), []);
  const curtain = useMemo(() => curtainGeometry(0.48, 1.46, 5, 0.025), []);
  const z = ROOM.wallZ;
  const cx = 0.25;
  const w = 1.1;
  const bottom = 0.98;
  const top = 2.02;
  const h = top - bottom;
  return (
    <group>
      {/* glass */}
      <mesh position={[cx, bottom + h / 2, z + 0.004]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={night} toneMapped={false} />
      </mesh>
      <mesh position={[cx, bottom + h / 2, z + 0.03]}>
        <planeGeometry args={[w, h]} />
        <meshPhysicalMaterial color="#0b0f12" transparent opacity={0.18} roughness={0.05} metalness={0} clearcoat={1} />
      </mesh>
      {/* sash frame */}
      <Box args={[w + 0.08, 0.05, 0.06]} position={[cx, top, z + 0.03]} color={C.trim} roughness={0.4} />
      <Box args={[w + 0.08, 0.05, 0.08]} position={[cx, bottom, z + 0.04]} color={C.trim} roughness={0.4} />
      <Box args={[0.05, h, 0.06]} position={[cx - w / 2, bottom + h / 2, z + 0.03]} color={C.trim} roughness={0.4} />
      <Box args={[0.05, h, 0.06]} position={[cx + w / 2, bottom + h / 2, z + 0.03]} color={C.trim} roughness={0.4} />
      <Box args={[0.04, h, 0.05]} position={[cx + 0.02, bottom + h / 2, z + 0.035]} color={C.trim} roughness={0.4} />
      {/* rolled-up blinds */}
      <Box args={[w, 0.14, 0.05]} position={[cx, top - 0.1, z + 0.045]} color="#e6e3dc" roughness={0.6} />
      {/* curtain rod */}
      <mesh position={[cx, 2.2, z + 0.12]} rotation-z={Math.PI / 2} castShadow>
        <cylinderGeometry args={[0.009, 0.009, 1.9, 12]} />
        <meshStandardMaterial color="#8c8c8a" metalness={0.8} roughness={0.35} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[cx + s * 0.95, 2.2, z + 0.12]}>
          <sphereGeometry args={[0.018, 12, 12]} />
          <meshStandardMaterial color="#8c8c8a" metalness={0.8} roughness={0.35} />
        </mesh>
      ))}
      {/* curtains */}
      {[cx - w / 2 - 0.17, cx + w / 2 + 0.17].map((x, i) => (
        <mesh key={i} geometry={curtain} position={[x, 2.2 - 0.73, z + 0.1]} castShadow receiveShadow>
          <meshStandardMaterial color={C.curtain} roughness={1} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------- left side */

function LeftCorner() {
  const z = ROOM.wallZ;
  return (
    <group>
      {/* white ledge cabinet in the corner */}
      <Box args={[0.76, 0.94, 0.28]} position={[-1.82, 0.47, z + 0.14]} color={C.white} roughness={0.55} />
      <Box args={[0.8, 0.03, 0.32]} position={[-1.82, 0.955, z + 0.16]} color={C.trim} roughness={0.45} />
      {/* tripod + camera */}
      <group position={[-2.04, 0.97, z + 0.17]}>
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2 + 0.4;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.08, 0.28, Math.sin(a) * 0.06]} rotation={[Math.sin(a) * 0.28, 0, -Math.cos(a) * 0.28]} castShadow>
              <cylinderGeometry args={[0.006, 0.008, 0.58, 6]} />
              <meshStandardMaterial color={C.black} roughness={0.5} />
            </mesh>
          );
        })}
        <mesh position={[0, 0.62, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.16, 8]} />
          <meshStandardMaterial color={C.black} />
        </mesh>
        <RBox args={[0.11, 0.07, 0.06]} radius={0.01} position={[0, 0.74, 0]} color="#1c1c1c" roughness={0.45} />
        <mesh position={[0.075, 0.74, 0]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.024, 0.026, 0.05, 20]} />
          <meshStandardMaterial color="#111" roughness={0.3} />
        </mesh>
        <mesh position={[-0.02, 0.69, 0.05]} rotation-x={0.3}>
          <cylinderGeometry args={[0.004, 0.004, 0.16, 6]} />
          <meshStandardMaterial color={C.black} />
        </mesh>
      </group>
      {/* small plant on the ledge */}
      <SmallPlant position={[-1.55, 0.97, z + 0.16]} pot="#e6e3dc" scale={0.9} />
    </group>
  );
}

function SmallPlant({ position, pot, scale = 1 }: { position: [number, number, number]; pot: string; scale?: number }) {
  const leaves = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        r: [0.6 + (i % 3) * 0.25, (i / 14) * Math.PI * 2 * 2.3, 0] as [number, number, number],
        s: 0.03 + (i % 4) * 0.006,
      })),
    [],
  );
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.03, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.032, 0.06, 20]} />
        <meshStandardMaterial color={pot} roughness={0.55} />
      </mesh>
      {leaves.map((l, i) => (
        <group key={i} position={[0, 0.06, 0]} rotation={l.r}>
          <mesh position={[0, l.s * 1.6, 0]} scale={[l.s * 0.5, l.s * 1.6, l.s * 0.15]} castShadow>
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial color={i % 3 ? "#3f8f4c" : "#5aa863"} roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Pegboard() {
  const tex = useMemo(() => pegboardTexture(), []);
  const z = ROOM.wallZ;
  const x = -1.15;
  const y = 1.32;
  return (
    <group position={[x, y, z + 0.025]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.56, 0.56, 0.012]} />
        <meshStandardMaterial map={tex} roughness={0.6} />
      </mesh>
      {/* shelf 1 with plant + cup */}
      <Box args={[0.26, 0.012, 0.09]} position={[0.08, 0.13, 0.05]} color={C.white} />
      <SmallPlant position={[0.03, 0.137, 0.05]} pot="#e8e6df" scale={0.85} />
      <mesh position={[0.15, 0.17, 0.05]} castShadow>
        <cylinderGeometry args={[0.018, 0.018, 0.07, 12]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
      </mesh>
      {/* shelf 2 with orange pots */}
      <Box args={[0.26, 0.012, 0.09]} position={[-0.12, -0.02, 0.05]} color={C.white} />
      <SmallPlant position={[-0.19, -0.014, 0.05]} pot="#f07b2e" scale={0.7} />
      <SmallPlant position={[-0.07, -0.014, 0.05]} pot="#f07b2e" scale={0.75} />
      {/* container */}
      <Box args={[0.08, 0.08, 0.06]} position={[0.1, -0.02, 0.04]} color={C.offWhite} />
      {/* spare keyboard on a rail */}
      <Box args={[0.3, 0.012, 0.06]} position={[0.0, -0.17, 0.04]} color={C.white} />
      <Box args={[0.28, 0.02, 0.09]} position={[0.0, -0.15, 0.05]} rotation-x={-0.5} color="#e2e0db" />
      {/* headphones hanging below */}
      <group position={[-0.23, -0.34, 0.08]}>
        <mesh rotation-z={Math.PI}>
          <torusGeometry args={[0.07, 0.009, 8, 24, Math.PI]} />
          <meshStandardMaterial color="#202020" roughness={0.5} />
        </mesh>
        {[-1, 1].map((s) => (
          <RBox key={s} args={[0.04, 0.07, 0.05]} radius={0.015} position={[s * 0.07, -0.07, 0]} color="#1d1d1d" roughness={0.6} />
        ))}
      </group>
    </group>
  );
}

function BookShelf() {
  const z = ROOM.wallZ;
  const art = useMemo(() => templeArtTexture(), []);
  const covers = useMemo(
    () => [
      coverTexture("#f6d36b", "#d24d33", "#2c64b0", 2),
      coverTexture("#e8e0cf", "#3f7d4a", "#e0503a", 4),
      coverTexture("#f0b23a", "#8f2b1e", "#f8f1e0", 6),
    ],
    [],
  );
  const spines = ["#f3efe5", "#e9452d", "#f3efe5", "#202020", "#f1c24a", "#f3efe5", "#6b2c1f"];
  return (
    <group position={[-1.15, 1.8, z]}>
      <Box args={[0.82, 0.035, 0.2]} position={[0, 0, 0.1]} color={C.white} roughness={0.5} />
      {/* manga: two front-facing covers + spines */}
      <mesh position={[-0.33, 0.1, 0.12]} rotation-y={0.12} castShadow>
        <boxGeometry args={[0.11, 0.165, 0.012]} />
        <meshStandardMaterial map={covers[0]} roughness={0.6} />
      </mesh>
      {spines.map((c, i) => (
        <Box key={i} args={[0.017, 0.16, 0.115]} position={[-0.25 + i * 0.019, 0.098, 0.1]} color={c} roughness={0.7} />
      ))}
      <mesh position={[0.25, 0.1, 0.13]} rotation-y={-0.1} castShadow>
        <boxGeometry args={[0.11, 0.165, 0.012]} />
        <meshStandardMaterial map={covers[2]} roughness={0.6} />
      </mesh>
      {/* leaning art print */}
      <group position={[0.06, 0.24, 0.05]} rotation-x={-0.08}>
        <Box args={[0.31, 0.43, 0.01]} color="#0e1210" />
        <mesh position={[0, 0, 0.006]}>
          <planeGeometry args={[0.29, 0.41]} />
          <meshStandardMaterial map={art} roughness={0.7} />
        </mesh>
      </group>
      {/* trailing pothos */}
      <group position={[-0.05, 0.018, 0.13]}>
        <mesh position={[0, 0.04, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.035, 0.08, 16]} />
          <meshStandardMaterial color="#f0eee8" roughness={0.6} />
        </mesh>
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i / 16) * Math.PI * 2;
          const hang = (i % 4) * 0.035;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.05, 0.06 - hang, 0.02 + Math.sin(a) * 0.04]} rotation={[0.5, a, 0.3]} castShadow>
              <sphereGeometry args={[0.022, 8, 6]} />
              <meshStandardMaterial color={i % 2 ? "#3d8546" : "#56a35c"} roughness={0.6} />
            </mesh>
          );
        })}
      </group>
      {/* puck lights under the shelf */}
      {[-0.17, 0.13].map((x) => (
        <mesh key={x} position={[x, -0.022, 0.11]}>
          <cylinderGeometry args={[0.03, 0.03, 0.01, 20]} />
          <meshBasicMaterial color={[3, 3, 2.8]} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------- desk */

const DESK = { x: 0.15, z: -1.87, w: 1.4, d: 0.7, top: 0.74 };

function Desk() {
  const mat = useMemo(() => camoMatTexture(), []);
  const { x, z, w, d, top } = DESK;
  return (
    <group>
      <RBox args={[w, 0.025, d]} radius={0.008} position={[x, top - 0.0125, z]} color={C.white} roughness={0.45} />
      {/* standing-desk frame: two columns, feet, crossbar */}
      {[-1, 1].map((s) => (
        <group key={s} position={[x + s * (w / 2 - 0.12), 0, z]}>
          <Box args={[0.07, top - 0.08, 0.05]} position={[0, (top - 0.08) / 2 + 0.03, 0]} color={C.offWhite} roughness={0.4} metalness={0.2} />
          <Box args={[0.06, 0.03, d - 0.06]} position={[0, 0.015, 0]} color={C.offWhite} roughness={0.4} metalness={0.2} />
          <Box args={[0.06, 0.03, d - 0.1]} position={[0, top - 0.04, 0]} color={C.offWhite} roughness={0.4} metalness={0.2} />
        </group>
      ))}
      <Box args={[w - 0.3, 0.04, 0.04]} position={[x, top - 0.05, z - 0.15]} color={C.offWhite} roughness={0.4} metalness={0.2} />
      {/* height controller */}
      <Box args={[0.1, 0.02, 0.04]} position={[x + 0.25, top - 0.035, z + d / 2 - 0.03]} color="#1d1d1d" />

      {/* desk mat */}
      <mesh position={[x + 0.12, top + 0.002, z + 0.08]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[0.95, 0.42]} />
        <meshStandardMaterial map={mat} roughness={0.95} />
      </mesh>
      <Keyboard position={[x + 0.12, top + 0.004, z + 0.13]} />
      {/* mouse */}
      <mesh position={[x + 0.45, top + 0.018, z + 0.12]} scale={[0.032, 0.018, 0.058]} castShadow>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color="#f2f1ee" roughness={0.35} />
      </mesh>
      {/* small black remote + dial */}
      <RBox args={[0.035, 0.012, 0.09]} radius={0.004} position={[x + 0.56, top + 0.008, z + 0.1]} color="#151515" roughness={0.4} />
      <mesh position={[x - 0.2, top + 0.01, z + 0.12]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.018, 24]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.35} metalness={0.4} />
      </mesh>
      {/* cable grommets */}
      {[x - 0.1, x + 0.48].map((gx) => (
        <mesh key={gx} position={[gx, top + 0.001, z - 0.27]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.03, 24]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      ))}
      <LedStrip />
    </group>
  );
}

function Keyboard({ position }: { position: [number, number, number] }) {
  const keys = useMemo(() => {
    const out: { p: [number, number]; w: number; dark: boolean }[] = [];
    const pitch = 0.0185;
    for (let r = 0; r < 5; r++) {
      const n = r === 4 ? 0 : 14 - (r === 0 ? 0 : r === 3 ? 2 : 1);
      for (let c = 0; c < n; c++)
        out.push({ p: [-0.12 + c * pitch + (r % 2) * 0.004, -0.037 + r * pitch], w: 0.016, dark: (r === 0 && c === 0) || c === n - 1 });
    }
    out.push({ p: [0, -0.037 + 4 * pitch], w: 0.11, dark: false });
    return out;
  }, []);
  return (
    <group position={position}>
      <RBox args={[0.29, 0.016, 0.1]} radius={0.005} position={[0, 0.008, 0]} color="#efede8" roughness={0.45} />
      <Instances limit={keys.length} castShadow>
        <boxGeometry args={[1, 0.009, 0.016]} />
        <meshStandardMaterial roughness={0.5} />
        {keys.map((k, i) => (
          <Instance key={i} position={[k.p[0] + k.w / 2, 0.021, k.p[1]]} scale={[k.w, 1, 1]} color={k.dark ? "#5c5c5e" : "#f6f4ef"} />
        ))}
      </Instances>
    </group>
  );
}

/** Lavender LED strip behind the desk, washing the curtains and wall. */
function LedStrip() {
  const alpha = useMemo(() => radialAlphaTexture(), []);
  const { x, z, top } = DESK;
  return (
    <group>
      <mesh position={[x + 0.05, top - 0.03, z - 0.345]}>
        <boxGeometry args={[1.2, 0.008, 0.008]} />
        <meshBasicMaterial color={[2.2, 1.6, 3.2]} toneMapped={false} />
      </mesh>
      <mesh position={[x + 0.05, top + 0.22, ROOM.wallZ + 0.11]}>
        <planeGeometry args={[1.9, 0.75]} />
        <meshBasicMaterial color="#b9a2ff" transparent opacity={0.12} alphaMap={alpha} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <pointLight position={[x - 0.25, top + 0.08, z - 0.4]} color="#b49bff" intensity={0.35} distance={1.2} decay={2} />
      <pointLight position={[x + 0.45, top + 0.08, z - 0.4]} color="#c3a6ff" intensity={0.35} distance={1.2} decay={2} />
    </group>
  );
}

/** Portrait monitor on the left (decorative; the main one is <Monitor/>). */
function PortraitMonitor() {
  const art = useMemo(() => foliageArtTexture(), []);
  const w = 0.31;
  const h = 0.55;
  return (
    <group position={[-0.34, DESK.top, -2.0]} rotation-y={0.32}>
      <group position={[0, 0.04 + h / 2, 0]}>
        <RBox args={[w + 0.014, h + 0.014, 0.022]} radius={0.004} position={[0, 0, -0.012]} color="#0d0d0e" roughness={0.4} />
        <mesh position={[0, 0, 0.0005]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial map={art} color={[1.15, 1.15, 1.15]} toneMapped={false} />
        </mesh>
        <rectAreaLight args={["#8fe3a0", 2.2, w, h]} position={[0, 0, 0.02]} />
      </group>
      {/* stand */}
      <Box args={[0.04, 0.16, 0.02]} position={[0, 0.1, -0.05]} color="#1a1a1a" />
      <RBox args={[0.18, 0.01, 0.14]} radius={0.003} position={[0, 0.005, -0.04]} color="#1a1a1a" roughness={0.4} />
    </group>
  );
}

/** Black clamp arm that holds the main monitor. */
function MonitorArm() {
  const { z, top } = DESK;
  return (
    <group position={[0.74, top, z - 0.27]}>
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.018, 0.44, 16]} />
        <meshStandardMaterial color="#141414" roughness={0.35} metalness={0.5} />
      </mesh>
      <RBox args={[0.07, 0.02, 0.07]} radius={0.004} position={[0, 0.01, 0]} color="#141414" roughness={0.4} />
      {/* elbow arm reaching behind the monitor */}
      <Box args={[0.36, 0.03, 0.04]} position={[-0.19, 0.27, 0.06]} rotation-y={0.25} color="#141414" roughness={0.4} metalness={0.4} />
    </group>
  );
}

/* ------------------------------------------------------------ right side */

function DrawersAndPc() {
  const z = ROOM.wallZ + 0.3;
  const x = 1.25;
  const H = 0.7;
  return (
    <group position={[x, 0, z]}>
      <Box args={[0.36, H, 0.58]} position={[0, H / 2, 0]} color={C.white} roughness={0.5} />
      {Array.from({ length: 5 }).map((_, i) => {
        const dh = (H - 0.04) / 5;
        const y = 0.02 + dh * i + dh / 2;
        return (
          <group key={i}>
            <Box args={[0.35, dh - 0.008, 0.012]} position={[0, y, 0.292]} color="#f1f0ec" roughness={0.45} />
            <Box args={[0.09, 0.02, 0.004]} position={[0, y + dh / 2 - 0.02, 0.299]} color="#3a3a3a" />
          </group>
        );
      })}
      <PcCase position={[0, H, 0.02]} />
    </group>
  );
}

function PcCase({ position }: { position: [number, number, number] }) {
  const w = 0.27;
  const h = 0.48;
  const d = 0.46;
  return (
    <group position={position}>
      {/* body (right, top, back panels) */}
      <Box args={[0.01, h, d]} position={[w / 2 - 0.005, h / 2, 0]} color={C.white} roughness={0.45} />
      <Box args={[w, 0.012, d]} position={[0, h - 0.006, 0]} color={C.white} roughness={0.45} />
      <Box args={[w, 0.02, d]} position={[0, 0.01, 0]} color={C.white} roughness={0.45} />
      <Box args={[w, h, 0.01]} position={[0, h / 2, -d / 2 + 0.005]} color={C.white} roughness={0.45} />
      {/* front panel: glass with white trim */}
      <Box args={[w, h, 0.012]} position={[0, h / 2, d / 2 - 0.006]} color={C.white} roughness={0.45} />
      {/* feet */}
      {[-1, 1].map((s) => (
        <Box key={s} args={[0.03, 0.012, 0.03]} position={[s * 0.1, -0.006, d / 2 - 0.05]} color="#d0cec8" />
      ))}
      {/* glass side panel (facing the desk) */}
      <mesh position={[-w / 2 + 0.003, h / 2, 0]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[d - 0.01, h - 0.02]} />
        <meshPhysicalMaterial color="#cfd6db" transparent opacity={0.16} roughness={0.05} clearcoat={1} />
      </mesh>
      {/* internals */}
      <Box args={[0.02, h - 0.06, d - 0.06]} position={[w / 2 - 0.05, h / 2, 0]} color="#f2f2f0" />
      <Box args={[0.2, 0.05, 0.3]} position={[0.0, h * 0.42, 0.0]} color="#f4f4f2" roughness={0.35} />
      <Box args={[0.14, 0.03, 0.34]} position={[0.02, h - 0.06, 0]} color="#e8e8e6" />
      <mesh position={[0.02, h * 0.66, 0]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.032, 0.032, 0.025, 28]} />
        <meshStandardMaterial color="#e9e9e7" />
      </mesh>
      <mesh position={[-0.0, h * 0.66, 0]} rotation-y={Math.PI / 2}>
        <torusGeometry args={[0.028, 0.003, 8, 32]} />
        <meshBasicMaterial color={[2.6, 2.6, 2.6]} toneMapped={false} />
      </mesh>
      {/* AIO tubes */}
      {[-0.012, 0.012].map((zz) => (
        <mesh key={zz} position={[0.02, h * 0.8, zz]} rotation-z={0.2}>
          <cylinderGeometry args={[0.006, 0.006, 0.14, 8]} />
          <meshStandardMaterial color="#f0f0ee" />
        </mesh>
      ))}
      <pointLight position={[0, h * 0.55, 0]} color="#eef3ff" intensity={0.25} distance={0.6} decay={2} />
      {/* power LED */}
      <mesh position={[0.09, h - 0.01, d / 2 + 0.001]}>
        <circleGeometry args={[0.004, 12]} />
        <meshBasicMaterial color={[3, 3, 3]} toneMapped={false} />
      </mesh>
    </group>
  );
}

function TrophyShelf() {
  const z = ROOM.wallZ;
  return (
    <group position={[1.9, 1.62, z]}>
      <Box args={[0.8, 0.04, 0.2]} position={[0, 0, 0.1]} color={C.white} roughness={0.5} />
      {/* football helmet */}
      <group position={[-0.15, 0.1, 0.1]} rotation-y={-0.6}>
        <mesh scale={[0.1, 0.085, 0.11]} castShadow>
          <sphereGeometry args={[1, 24, 18]} />
          <meshStandardMaterial color="#1b1d22" roughness={0.25} metalness={0.3} />
        </mesh>
        <mesh position={[0, -0.02, 0.09]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.05, 0.006, 6, 18, Math.PI]} />
          <meshStandardMaterial color="#d8d8d8" metalness={0.5} roughness={0.4} />
        </mesh>
      </group>
      {/* "player of the week" plaque */}
      <group position={[0.15, 0.02, 0.1]}>
        <Box args={[0.1, 0.03, 0.06]} position={[0, 0.015, 0]} color="#151515" />
        <mesh position={[0, 0.14, 0]} rotation-z={Math.PI / 4} castShadow>
          <boxGeometry args={[0.14, 0.14, 0.012]} />
          <meshStandardMaterial color="#26292e" roughness={0.2} metalness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ chair */

function Chair() {
  const frame = C.chairFrame;
  return (
    <group position={[-0.5, 0, -1.22]} rotation-y={0.4}>
      {/* base */}
      {[0, 1, 2, 3, 4].map((i) => (
        <group key={i} rotation-y={(i / 5) * Math.PI * 2}>
          <Box args={[0.04, 0.035, 0.32]} position={[0, 0.075, 0.16]} rotation-x={0.08} color={frame} roughness={0.4} />
          <mesh position={[0, 0.03, 0.3]} castShadow>
            <sphereGeometry args={[0.028, 12, 12]} />
            <meshStandardMaterial color="#cfcfcf" roughness={0.4} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.03, 0.34, 16]} />
        <meshStandardMaterial color="#d9d9d6" roughness={0.3} metalness={0.4} />
      </mesh>
      {/* seat: white frame + grey mesh */}
      <RBox args={[0.5, 0.05, 0.48]} radius={0.02} position={[0, 0.46, 0]} color={frame} roughness={0.45} />
      <RBox args={[0.44, 0.03, 0.42]} radius={0.012} position={[0, 0.49, 0]} color={C.chairMesh} roughness={0.95} />
      {/* armrests */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.27, 0, 0.02]}>
          <Box args={[0.03, 0.22, 0.04]} position={[0, 0.58, 0.05]} rotation-x={-0.25} color={frame} roughness={0.45} />
          <RBox args={[0.07, 0.025, 0.24]} radius={0.01} position={[0, 0.7, 0.0]} color="#2a2a2a" roughness={0.8} />
        </group>
      ))}
      {/* tall mesh back: frame rails + panel */}
      <group position={[0, 0.5, 0.24]} rotation-x={-0.12}>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.22, 0.34, 0]} rotation-z={s * 0.05} castShadow>
            <capsuleGeometry args={[0.018, 0.62, 6, 12]} />
            <meshStandardMaterial color={frame} roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, 0.66, 0]} rotation-z={Math.PI / 2} castShadow>
          <capsuleGeometry args={[0.018, 0.42, 6, 12]} />
          <meshStandardMaterial color={frame} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.34, 0.005]}>
          <planeGeometry args={[0.42, 0.62]} />
          <meshStandardMaterial color="#8a8884" roughness={1} side={THREE.DoubleSide} />
        </mesh>
        {/* lumbar */}
        <RBox args={[0.34, 0.07, 0.03]} radius={0.012} position={[0, 0.14, -0.015]} color={frame} roughness={0.45} />
        {/* headrest */}
        <group position={[0, 0.86, -0.02]}>
          <mesh rotation-x={Math.PI / 2}>
            <torusGeometry args={[0.13, 0.016, 8, 24, Math.PI]} />
            <meshStandardMaterial color={frame} roughness={0.4} />
          </mesh>
          <RBox args={[0.24, 0.1, 0.03]} radius={0.015} position={[0, 0.02, 0]} color={C.chairMesh} roughness={1} />
          <mesh position={[0, -0.11, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.22, 8]} />
            <meshStandardMaterial color={frame} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/* ---------------------------------------------------------------- lights */

/** Practical lights that exist in the real room. */
function RoomLights() {
  const z = ROOM.wallZ;
  const target = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(-1.0, 0.4, -1.6);
    return o;
  }, []);
  const shelfTarget = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(-1.15, 0.9, z + 0.05);
    return o;
  }, [z]);
  return (
    <group>
      {/* puck light high on the wall by the corner — the key light in the photos */}
      <mesh position={[-1.35, 2.3, z + 0.02]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.04, 0.04, 0.02, 20]} />
        <meshBasicMaterial color={[4, 4, 3.8]} toneMapped={false} />
      </mesh>
      <primitive object={target} />
      <spotLight
        position={[-1.35, 2.27, z + 0.06]}
        target={target}
        color="#f2f5e8"
        intensity={9}
        angle={0.95}
        penumbra={0.85}
        decay={2}
        distance={6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
      />
      {/* under-shelf pucks onto the pegboard */}
      <primitive object={shelfTarget} />
      <spotLight position={[-1.15, 1.76, z + 0.12]} target={shelfTarget} color="#f6f6ee" intensity={2.4} angle={1.1} penumbra={1} decay={2} distance={2} />
      {/* TV glow from the left (off-camera) */}
      <pointLight position={[-1.9, 1.0, -0.5]} color="#7d95ff" intensity={0.8} distance={3} decay={2} />
      {/* red underglow on the floor, lower right */}
      <pointLight position={[0.95, 0.05, -0.9]} color="#ff4b2b" intensity={0.45} distance={1.3} decay={2} />
      {/* moonlight through the window */}
      <pointLight position={[0.25, 1.5, z + 0.35]} color="#5d7290" intensity={0.25} distance={2.5} decay={2} />
    </group>
  );
}

export function Bedroom() {
  return (
    <group>
      <Shell />
      <Wainscot />
      <WindowWall />
      <LeftCorner />
      <Pegboard />
      <BookShelf />
      <Desk />
      <PortraitMonitor />
      <MonitorArm />
      <DrawersAndPc />
      <TrophyShelf />
      <Chair />
      <RoomLights />
    </group>
  );
}
