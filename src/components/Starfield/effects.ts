import * as THREE from "three";

const COLORS = ["#FF0040", "#0033ff", "#ffffff"];
const SPARKLE_COLOR = new THREE.Color("#ffffff").multiplyScalar(5); // Bright flash

export function initializeStarColors(scene: any): {
  instancedMesh: THREE.InstancedMesh | null;
  baseColors: THREE.Color[];
  meshes: THREE.Mesh[];
  meshBaseColors: THREE.Color[];
} {
  let instancedMesh: THREE.InstancedMesh | null = null;
  const baseColors: THREE.Color[] = [];
  const meshes: THREE.Mesh[] = [];
  const meshBaseColors: THREE.Color[] = [];

  scene.traverse((object: any) => {
    if (object.isInstancedMesh) {
      instancedMesh = object;
      for (let i = 0; i < object.count; i++) {
        const color = new THREE.Color(
          COLORS[Math.floor(Math.random() * COLORS.length)],
        );
        baseColors.push(color.clone());
        object.setColorAt(i, color);
      }
      if (object.instanceColor) object.instanceColor.needsUpdate = true;
    } else if (object.isMesh && object.material) {
      object.material = object.material.clone();
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      if (object.material.color) object.material.color.set(color);
      if (object.material.emissive) {
        object.material.emissive.set(color);
        object.material.emissiveIntensity = 0;
      }
      meshes.push(object);
      meshBaseColors.push(new THREE.Color(color));
    }
  });

  return { instancedMesh, baseColors, meshes, meshBaseColors };
}

import type { PerformanceConfig } from "../ContourMap/usePerformanceTier";

export function startSparkleEffect(
  sceneData: ReturnType<typeof initializeStarColors>,
  perf: PerformanceConfig
) {
  const { instancedMesh, baseColors, meshes, meshBaseColors } = sceneData;

  if (instancedMesh) {
    const count = instancedMesh.count;
    return setInterval(() => {
      const numSparkles = Math.max(1, Math.floor(count * perf.sparkleFraction));
      const sparkledIndices: number[] = [];

      for (let i = 0; i < numSparkles; i++) {
        const idx = Math.floor(Math.random() * count);
        sparkledIndices.push(idx);
        instancedMesh.setColorAt(idx, SPARKLE_COLOR);
      }
      if (instancedMesh.instanceColor)
        instancedMesh.instanceColor.needsUpdate = true;

      setTimeout(() => {
        for (const idx of sparkledIndices)
          instancedMesh.setColorAt(idx, baseColors[idx]);
        if (instancedMesh.instanceColor)
          instancedMesh.instanceColor.needsUpdate = true;
      }, perf.sparkleDurationMs);
    }, perf.sparkleIntervalMs);
  }

  if (meshes.length > 0) {
    return setInterval(() => {
      const numSparkles = Math.max(1, Math.floor(meshes.length * perf.sparkleFraction));
      const sparkledIndices: number[] = [];

      for (let i = 0; i < numSparkles; i++) {
        const idx = Math.floor(Math.random() * meshes.length);
        sparkledIndices.push(idx);
        const mat = meshes[idx].material as any;
        if (mat.emissive) {
          mat.emissive.copy(SPARKLE_COLOR);
          mat.emissiveIntensity = 5;
        }
      }

      setTimeout(() => {
        for (const idx of sparkledIndices) {
          const mat = meshes[idx].material as any;
          if (mat.emissive) {
            mat.emissive.copy(meshBaseColors[idx]);
            mat.emissiveIntensity = 0;
          }
        }
      }, perf.sparkleDurationMs);
    }, perf.sparkleIntervalMs);
  }
}
