"use client";

import { useMemo } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { NAV_PAGES } from "./navPages";

// Start fetching the page images as soon as the home bundle loads so nothing
// downstream (hover flashing, nav bubbles) ever shows an unloaded frame.
NAV_PAGES.forEach((p) => useTexture.preload(p.image));

/**
 * The four shared page textures + their aspect ratios, one GPU copy for every
 * consumer (flashback blobs, nav bubbles). Suspends until loaded — call from
 * inside a <Suspense> boundary.
 */
export function usePageTextures() {
  const textures = useTexture(NAV_PAGES.map((p) => p.image));
  const aspects = useMemo(
    () =>
      textures.map((tex) => {
        tex.minFilter = THREE.LinearFilter;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        const img = tex.image as
          | { naturalWidth?: number; naturalHeight?: number; width?: number; height?: number }
          | undefined;
        const w = img?.naturalWidth || img?.width || 0;
        const h = img?.naturalHeight || img?.height || 0;
        return w > 0 && h > 0 ? w / h : 1.0;
      }),
    [textures]
  );
  return { textures, aspects };
}
