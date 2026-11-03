"use client";

import { Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { COMPACT_QUERY, SCREENS, type ScreenId } from "@/lib/scene-config";
import { useExperience } from "@/lib/store";
import { useMedia } from "@/lib/use-media";

/**
 * A real web page mapped onto a flat surface in the 3D scene.
 *
 * The page is laid out at `virtual` CSS pixels and drei's <Html transform>
 * scales it to the surface's size in meters. It stays click-through while
 * you're in the room (so the 3D mesh underneath gets hover/click), and
 * becomes interactive once the camera has zoomed in on it.
 */
export function LiveScreen({ id }: { id: ScreenId }) {
  const cfg = SCREENS[id];
  const mode = useExperience((s) => s.mode);
  const focus = useExperience((s) => s.focus);
  const hovered = useExperience((s) => s.hovered === id);
  const compact = useMedia(COMPACT_QUERY);
  // drei's <Html> re-parents itself when the canvas event target connects and
  // comes back empty if it mounted before that, so wait for it.
  const connected = useThree((s) => s.events.connected);

  const [vw, vh] = cfg.virtual;
  // drei maps 1 CSS px to distanceFactor / 400 world units.
  const distanceFactor = (400 * cfg.size[0]) / vw;
  const active = mode === "focused" && focus === id && !compact;
  const lit = active || hovered;

  if (!connected) return null;
  return (
    <Html
      transform
      position={[0, 0, 0.002]}
      distanceFactor={distanceFactor}
      zIndexRange={[10, 0]}
      pointerEvents={active ? "auto" : "none"}
      style={{ width: vw, height: vh }}
    >
      <iframe
        src={cfg.url}
        title={cfg.title}
        data-screen={id}
        loading="eager"
        tabIndex={active ? 0 : -1}
        aria-hidden={!active}
        className="block h-full w-full border-0 bg-[#0d0e14] transition-[filter] duration-300"
        style={{ width: vw, height: vh, filter: lit ? "brightness(1)" : "brightness(0.8)" }}
      />
    </Html>
  );
}
