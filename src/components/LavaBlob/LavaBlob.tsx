"use client";

import React, { Suspense, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import "./LavaBlobMaterial";
import type { LavaBlobMaterialImpl } from "./LavaBlobMaterial";
import { MNET_BLOB_COLORS } from "./shaders";

export interface LavaBlobProps {
  /** Optional image shown faintly inside the wax, clear on hover. */
  image?: string;
  /** Override the brand palette if a page needs a variation. */
  colors?: { colorA?: string; colorB?: string; rim?: string };
  /** CSS size of the square canvas, e.g. 240 or "16rem". Default 240px. */
  size?: number | string;
  className?: string;
}

const BlobMesh: React.FC<{
  image?: string;
  colors?: LavaBlobProps["colors"];
  hovered: boolean;
}> = ({ image, colors, hovered }) => {
  const materialRef = useRef<LavaBlobMaterialImpl>(null);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);

  // useLoader caches per-URL; a 1x1 transparent placeholder keeps the hook
  // call unconditional when no image is supplied.
  const texture = useLoader(
    THREE.TextureLoader,
    image ?? "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
  );
  const aspect = useMemo(() => {
    const img = texture.image as { width?: number; height?: number } | undefined;
    return img?.width && img?.height ? img.width / img.height : 1;
  }, [texture]);

  useFrame((state) => {
    const mat = materialRef.current;
    if (!mat) return;
    mat.uniforms.uTime.value = state.clock.elapsedTime + phase * 10;
    mat.uniforms.uOpacity.value = 1;
    mat.uniforms.uHover.value = THREE.MathUtils.lerp(
      mat.uniforms.uHover.value,
      hovered ? 1 : 0,
      0.15
    );
  });

  return (
    <mesh>
      <planeGeometry args={[1.9, 1.9]} />
      <lavaBlobMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        uTexA={texture}
        uTexB={texture}
        uAspectA={aspect}
        uAspectB={aspect}
        uPhase={phase}
        uHasPhoto={image ? 1 : 0}
        uColorA={new THREE.Color(colors?.colorA ?? MNET_BLOB_COLORS.colorA)}
        uColorB={new THREE.Color(colors?.colorB ?? MNET_BLOB_COLORS.colorB)}
        uRimColor={new THREE.Color(colors?.rim ?? MNET_BLOB_COLORS.rim)}
      />
    </mesh>
  );
};

/**
 * Standalone lava-lamp blob with its own lightweight canvas — drop it into
 * any page for the site-wide lava theme. The continuous morph lives in the
 * shader, so it wobbles like the home-hero blobs without the physics sim.
 */
const LavaBlob: React.FC<LavaBlobProps> = ({ image, colors, size = 240, className }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={className}
      style={{ width: size, height: size }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <Canvas
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0, 2], fov: 50 }}
      >
        <Suspense fallback={null}>
          <BlobMesh image={image} colors={colors} hovered={hovered} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default LavaBlob;
