"use client";

import { useGLTF } from "@react-three/drei";
import { useLayoutEffect } from "react";
import * as THREE from "three";

/**
 * Loads your Blender export. Set SCENE.roomModelUrl in lib/scene-config.ts
 * to enable it. Every mesh casts/receives shadows; a mesh named
 * "MonitorScreen" in the file is hidden because <Monitor/> renders the
 * interactive screen on top (align MONITOR.screenCenter to it).
 */
export function RoomModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  useLayoutEffect(() => {
    scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
      if (o.name === "MonitorScreen") o.visible = false;
    });
  }, [scene]);
  return <primitive object={scene} />;
}
