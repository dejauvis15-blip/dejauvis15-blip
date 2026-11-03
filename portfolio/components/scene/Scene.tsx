"use client";

import { AdaptiveDpr, Lightformer, Environment, Sparkles, useProgress } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import * as THREE from "three";
import { CAMERA, SCENE } from "@/lib/scene-config";
import { useExperience } from "@/lib/store";
import { CameraRig } from "./CameraRig";
import { DesignPoster } from "./DesignPoster";
import { Monitor } from "./Monitor";
import { PlaceholderRoom } from "./PlaceholderRoom";
import { RoomModel } from "./RoomModel";

function Lights() {
  return (
    <>
      <hemisphereLight args={["#b9c3ff", "#3a2a20", 0.45]} />
      <ambientLight intensity={0.12} />
      {/* evening light through the window */}
      <directionalLight
        position={[-5, 3.6, 0.2]}
        intensity={1.5}
        color="#ffb88a"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-1}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
      />
      {/* cool fill from the room side */}
      <pointLight position={[2, 2.4, 1.5]} intensity={1.4} distance={7} color="#c7d2fe" />
      {/* local-only environment for soft reflections (no network fetch) */}
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={1.2} color="#ffd6b0" position={[-4, 2, 0]} scale={[2, 2, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={0.6} color="#a5b4fc" position={[2, 3, 3]} scale={[4, 1, 1]} />
        <Lightformer form="ring" intensity={0.5} color="#8b5cf6" position={[0, 2.4, -3]} scale={2} />
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
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
      // Clicking the room around a focused screen steps back out.
      onPointerMissed={() => leave()}
      className="!fixed inset-0"
    >
      <color attach="background" args={["#0d0e14"]} />
      <fog attach="fog" args={["#0d0e14", 6, 14]} />
      <Suspense fallback={null}>
        <Lights />
        {SCENE.roomModelUrl ? <RoomModel url={SCENE.roomModelUrl} /> : <PlaceholderRoom />}
        <Monitor />
        <DesignPoster />
        <Sparkles count={40} scale={[4, 2.2, 3]} position={[-0.6, 1.4, -1]} size={1.6} speed={0.25} opacity={0.35} color="#ffd8b0" />
        <ReadySignal />
      </Suspense>
      <CameraRig />
      <AdaptiveDpr pixelated={false} />
    </Canvas>
  );
}
