"use client";

import { AdaptiveDpr, Environment, Lightformer, Sparkles, useProgress } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import * as THREE from "three";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import { CAMERA, LOOK, SCENE } from "@/lib/scene-config";
import { useExperience } from "@/lib/store";
import { CameraRig } from "./CameraRig";
import { DesignPoster } from "./DesignPoster";
import { Monitor } from "./Monitor";
import { Bedroom } from "./Bedroom";
import { Effects } from "./Effects";
import { RoomModel } from "./RoomModel";

// RectAreaLights (monitor glow) need their lookup tables initialised once.
RectAreaLightUniformsLib.init();

/** Low ambient fill; the real light comes from the practicals in <Bedroom/>. */
function Lights() {
  return (
    <>
      <hemisphereLight args={["#a9c4a8", "#2a1a10", 0.22]} />
      <ambientLight intensity={0.04} />
      {/* local-only environment for soft reflections on the floor and glossy bits */}
      <Environment resolution={64} frames={1} environmentIntensity={0.25}>
        <Lightformer form="rect" intensity={1} color="#c8f0d0" position={[0, 1.5, -3]} scale={[2, 1, 1]} />
        <Lightformer form="rect" intensity={0.6} color="#b9a2ff" position={[0, 0.8, -3]} scale={[2, 0.3, 1]} />
        <Lightformer form="circle" intensity={1.2} color="#ffffff" position={[-1.4, 2.4, -2]} scale={0.4} />
      </Environment>
    </>
  );
}

/** Flips loading → intro once suspense resolves and assets are in. */
function ReadySignal() {
  const { active } = useProgress();
  const mode = useExperience((s) => s.mode);
  const setMode = useExperience((s) => s.setMode);
  useEffect(() => {
    if (!active && mode === "loading") {
      const id = setTimeout(() => setMode("intro"), 250);
      return () => clearTimeout(id);
    }
  }, [active, mode, setMode]);
  return null;
}

export default function Scene() {
  const leave = useExperience((s) => s.leave);
  return (
    <Canvas
      shadows="soft"
      dpr={[1, 2]}
      camera={{ fov: CAMERA.fov, near: 0.05, far: 40, position: CAMERA.intro.position }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        // With the retro grade on, tone mapping happens in the effect stack.
        gl.toneMapping = LOOK.retro ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.1;
      }}
      // Clicking the room around a focused screen steps back out.
      onPointerMissed={() => leave()}
      className="!fixed inset-0"
    >
      <color attach="background" args={["#07090a"]} />
      <fog attach="fog" args={["#07090a", 5, 12]} />
      <Suspense fallback={null}>
        <Lights />
        {SCENE.roomModelUrl ? <RoomModel url={SCENE.roomModelUrl} /> : <Bedroom />}
        <Monitor />
        <DesignPoster />
        <Sparkles count={36} scale={[3, 2, 2.5]} position={[-0.4, 1.3, -1.2]} size={1.4} speed={0.2} opacity={0.3} color="#f2f5e8" />
        <ReadySignal />
      </Suspense>
      <CameraRig />
      {LOOK.retro && <Effects />}
      <AdaptiveDpr pixelated={false} />
    </Canvas>
  );
}
