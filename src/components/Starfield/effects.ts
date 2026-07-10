import * as THREE from "three";

const COLORS = ["#FF0040", "#0033ff", "#ffffff"];
const SPARKLE_COLOR = new THREE.Color("#ffffff").multiplyScalar(5); // Bright flash

type ColorableMaterial = THREE.Material & {
  color?: THREE.Color;
  emissive?: THREE.Color;
  emissiveIntensity?: number;
};

export function initializeStarColors(scene: THREE.Object3D): {
  instancedMesh: THREE.InstancedMesh | null;
  baseColors: THREE.Color[];
  meshes: THREE.Mesh[];
  meshBaseColors: THREE.Color[];
} {
  let instancedMesh: THREE.InstancedMesh | null = null;
  const baseColors: THREE.Color[] = [];
  const meshes: THREE.Mesh[] = [];
  const meshBaseColors: THREE.Color[] = [];

  scene.traverse((object) => {
    const instanced = object as THREE.InstancedMesh;
    if (instanced.isInstancedMesh) {
      instancedMesh = instanced;
      for (let i = 0; i < instanced.count; i++) {
        const color = new THREE.Color(
          COLORS[Math.floor(Math.random() * COLORS.length)],
        );
        baseColors.push(color.clone());
        instanced.setColorAt(i, color);
      }
      if (instanced.instanceColor) instanced.instanceColor.needsUpdate = true;
      return;
    }

    const mesh = object as THREE.Mesh;
    if (mesh.isMesh && mesh.material) {
      const material = (mesh.material as ColorableMaterial).clone() as ColorableMaterial;
      mesh.material = material;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      if (material.color) material.color.set(color);
      if (material.emissive) {
        material.emissive.set(color);
        material.emissiveIntensity = 0;
      }
      meshes.push(mesh);
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
        const mat = meshes[idx].material as ColorableMaterial;
        if (mat.emissive) {
          mat.emissive.copy(SPARKLE_COLOR);
          mat.emissiveIntensity = 5;
        }
      }

      setTimeout(() => {
        for (const idx of sparkledIndices) {
          const mat = meshes[idx].material as ColorableMaterial;
          if (mat.emissive) {
            mat.emissive.copy(meshBaseColors[idx]);
            mat.emissiveIntensity = 0;
          }
        }
      }, perf.sparkleDurationMs);
    }, perf.sparkleIntervalMs);
  }
}
