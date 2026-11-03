"use client";

import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { CAMERA, COMPACT_QUERY, MONITOR_CONTENT, SCREENS, TIMING, type ScreenId } from "@/lib/scene-config";
import { prefersReducedMotion, useExperience } from "@/lib/store";

type Vec3 = [number, number, number];

/** Resting position, pulled back on portrait/narrow viewports so the desk fits. */
function roomPose(aspect: number): { position: Vec3; target: Vec3 } {
  const { position, target } = CAMERA.room;
  const k = aspect < 1 ? CAMERA.mobilePullback : aspect < 1.4 ? 1.15 : 1;
  return {
    position: [
      target[0] + (position[0] - target[0]) * k,
      target[1] + (position[1] - target[1]) * k,
      target[2] + (position[2] - target[2]) * k,
    ],
    target,
  };
}

/**
 * Head-on pose in front of a screen.
 *  - "cover":   the surface fills the viewport edge to edge, so a full-screen
 *               DOM layer (desktop OS, or the phone fallback) can fade in
 *               over it without a visible seam.
 *  - "contain": the whole surface is visible with a little frame around it,
 *               so the live page reads as sitting inside the room.
 */
function screenPose(id: ScreenId, aspect: number, fov: number, fit: "cover" | "contain"): { position: Vec3; target: Vec3 } {
  const [sx, sy, sz] = SCREENS[id].center;
  const [sw, sh] = SCREENS[id].size;
  const t = Math.tan(THREE.MathUtils.degToRad(fov / 2));
  const dByHeight = sh / 2 / t;
  const dByWidth = sw / 2 / (t * aspect);
  const d = fit === "cover" ? Math.min(dByHeight, dByWidth) * 0.97 : Math.max(dByHeight, dByWidth) * CAMERA.screenMargin;
  return { position: [sx, sy, sz + d], target: [sx, sy, sz] };
}

function fitFor(id: ScreenId): "cover" | "contain" {
  if (window.matchMedia(COMPACT_QUERY).matches) return "cover";
  return id === "monitor" && MONITOR_CONTENT === "desktop" ? "cover" : "contain";
}

export function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const mode = useExperience((s) => s.mode);
  const focus = useExperience((s) => s.focus);
  const setMode = useExperience((s) => s.setMode);

  // The rig state GSAP animates. useFrame turns it into a camera pose.
  const rig = useRef({
    px: CAMERA.intro.position[0],
    py: CAMERA.intro.position[1],
    pz: CAMERA.intro.position[2],
    tx: CAMERA.room.target[0],
    ty: CAMERA.room.target[1],
    tz: CAMERA.room.target[2],
    parallax: 0,
  });
  const pointer = useRef(new THREE.Vector2());
  const smoothed = useRef(new THREE.Vector2());
  const tween = useRef<gsap.core.Tween | null>(null);

  // Track the pointer across the whole window (the DOM HUD sits over the canvas).
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    const aspect = size.width / size.height;
    const reduced = prefersReducedMotion();
    const go = (
      pose: { position: Vec3; target: Vec3 },
      parallax: number,
      duration: number,
      ease: string,
      onComplete?: () => void,
    ) => {
      tween.current?.kill();
      tween.current = gsap.to(rig.current, {
        px: pose.position[0],
        py: pose.position[1],
        pz: pose.position[2],
        tx: pose.target[0],
        ty: pose.target[1],
        tz: pose.target[2],
        parallax,
        duration: reduced ? 0.01 : duration,
        ease,
        onComplete,
      });
    };

    switch (mode) {
      case "intro":
        go(roomPose(aspect), 1, TIMING.intro, "power3.inOut", () => setMode("room"));
        break;
      case "room":
        // Also handles resizes while resting.
        go(roomPose(aspect), 1, 0.6, "power2.out");
        break;
      case "zooming-in":
        if (focus) go(screenPose(focus, aspect, camera.fov, fitFor(focus)), 0, TIMING.zoomIn, "power3.inOut", () => setMode("focused"));
        break;
      case "focused":
        if (focus) go(screenPose(focus, aspect, camera.fov, fitFor(focus)), 0, 0.3, "power2.out");
        break;
      case "zooming-out":
        go(roomPose(aspect), 1, TIMING.zoomOut, "power3.inOut", () => setMode("room"));
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, size.width, size.height]);

  useEffect(() => () => void tween.current?.kill(), []);

  const lookAt = useRef(new THREE.Vector3());
  useFrame((_, dt) => {
    const r = rig.current;
    smoothed.current.x = THREE.MathUtils.damp(smoothed.current.x, pointer.current.x, 3, dt);
    smoothed.current.y = THREE.MathUtils.damp(smoothed.current.y, pointer.current.y, 3, dt);
    const ox = smoothed.current.x * CAMERA.parallax.x * r.parallax;
    const oy = smoothed.current.y * CAMERA.parallax.y * r.parallax;
    camera.position.set(r.px + ox, r.py + oy, r.pz - ox * 0.4);
    lookAt.current.set(r.tx + ox * 0.15, r.ty + oy * 0.15, r.tz);
    camera.lookAt(lookAt.current);
  });

  return null;
}
