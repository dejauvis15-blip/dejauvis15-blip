"use client";

import { Bloom, ChromaticAberration, EffectComposer, HueSaturation, Noise, ToneMapping, Vignette } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import { useMemo } from "react";
import * as THREE from "three";
import { COMPACT_QUERY } from "@/lib/scene-config";
import { useMedia } from "@/lib/use-media";

/**
 * The "retro realistic" grade: glowing practicals (bloom), filmic tone
 * mapping, a touch of lens fringing, grain and vignette. Phones get a
 * lighter stack.
 */
export function Effects() {
  const compact = useMedia(COMPACT_QUERY);
  const ca = useMemo(() => new THREE.Vector2(0.0009, 0.0006), []);
  if (compact) {
    return (
      <EffectComposer multisampling={0} enableNormalPass={false}>
        <Bloom mipmapBlur luminanceThreshold={0.85} luminanceSmoothing={0.2} intensity={0.6} radius={0.7} />
        <ToneMapping mode={ToneMappingMode.AGX} />
        <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.14} />
        <Vignette offset={0.28} darkness={0.7} />
      </EffectComposer>
    );
  }
  return (
    <EffectComposer multisampling={4} enableNormalPass={false}>
      <Bloom mipmapBlur luminanceThreshold={0.85} luminanceSmoothing={0.2} intensity={0.9} radius={0.75} />
      <ToneMapping mode={ToneMappingMode.AGX} />
      <HueSaturation saturation={0.06} hue={0} />
      <ChromaticAberration offset={ca} radialModulation modulationOffset={0.35} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.16} />
      <Vignette offset={0.28} darkness={0.72} />
    </EffectComposer>
  );
}
