"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface StarfieldRenderableObject {
  isMesh?: boolean;
  material?: {
    color?: {
      set: (value: string) => void;
    };
  };
}

interface StarfieldInstance {
  three: {
    camera: { position: { set: (x: number, y: number, z: number) => void } };
    scene: {
      traverse: (callback: (object: StarfieldRenderableObject) => void) => void;
    };
  };
  destroy?: () => void;
}

export function Starfield() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    let destroyStarfield: (() => void) | undefined;
    const container = containerRef.current;

    if (!container) {
      return;
    }

    void import("threejs-toys")
      .then(({ swarmBackground }) => {
        if (!mounted) {
          return;
        }

        const bg = swarmBackground({
          el: container,
          eventsEl: container,
          gpgpuSize: 60,
          geometry: "cube",
        }) as StarfieldInstance;

        bg.three.camera.position.set(0, 0, 100);

        const colors = ["#FF0040", "#0033ff", "#ffffff"];
        const sparkleColor = new THREE.Color("#ffffff").multiplyScalar(5); // Bright flash
        
        let instancedMesh: THREE.InstancedMesh | null = null;
        let baseColors: THREE.Color[] = [];
        let meshes: THREE.Mesh[] = [];
        let meshBaseColors: THREE.Color[] = [];

        bg.three.scene.traverse((object: any) => {
          if (object.isInstancedMesh) {
            instancedMesh = object;
            const instanceCount = object.count;
            for (let i = 0; i < instanceCount; i++) {
              const colorHex = colors[Math.floor(Math.random() * colors.length)];
              const color = new THREE.Color(colorHex);
              baseColors.push(color.clone());
              object.setColorAt(i, color);
            }
            if (object.instanceColor) {
              object.instanceColor.needsUpdate = true;
            }
          } else if (object.isMesh && object.material) {
            const mat = object.material.clone();
            object.material = mat;
            
            const colorHex = colors[Math.floor(Math.random() * colors.length)];
            if (mat.color) mat.color.set(colorHex);
            if (mat.emissive) {
              mat.emissive.set(colorHex);
              mat.emissiveIntensity = 0;
            }
            meshes.push(object);
            meshBaseColors.push(new THREE.Color(colorHex));
          }
        });

        let sparkleInterval: NodeJS.Timeout | undefined;

        if (instancedMesh) {
          const count = (instancedMesh as THREE.InstancedMesh).count;
          sparkleInterval = setInterval(() => {
            const numSparkles = Math.max(1, Math.floor(count / 100));
            const sparkledIndices: number[] = [];
            
            for (let i = 0; i < numSparkles; i++) {
              const idx = Math.floor(Math.random() * count);
              sparkledIndices.push(idx);
              (instancedMesh as THREE.InstancedMesh).setColorAt(idx, sparkleColor);
            }
            if ((instancedMesh as THREE.InstancedMesh).instanceColor) {
              (instancedMesh as THREE.InstancedMesh).instanceColor!.needsUpdate = true;
            }
            
            setTimeout(() => {
              if (!instancedMesh) return;
              for (const idx of sparkledIndices) {
                instancedMesh.setColorAt(idx, baseColors[idx]);
              }
              if (instancedMesh.instanceColor) {
                instancedMesh.instanceColor.needsUpdate = true;
              }
            }, 100);
          }, 250);
        } else if (meshes.length > 0) {
          sparkleInterval = setInterval(() => {
            const numSparkles = Math.max(1, Math.floor(meshes.length / 100));
            const sparkledIndices: number[] = [];
            
            for (let i = 0; i < numSparkles; i++) {
              const idx = Math.floor(Math.random() * meshes.length);
              sparkledIndices.push(idx);
              const mat = meshes[idx].material as any;
              if (mat.emissive) {
                mat.emissive.copy(sparkleColor);
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
            }, 100);
          }, 250);
        }

        // Expose update function to window for Experience.tsx
        (window as any).updateStarfield = (
          opacity: number,
          zoomOut: number,
        ) => {
          if (container) {
            container.style.opacity = opacity.toString();
          }
          bg.three.camera.position.set(0, 0, zoomOut);
        };

        destroyStarfield = () => {
          if (sparkleInterval) clearInterval(sparkleInterval);
          bg.destroy?.();
          delete (window as any).updateStarfield;
        };
      })
      .catch(() => {});

    return () => {
      mounted = false;
      destroyStarfield?.();
    };
  }, []);

  return (
    <div
      id="starfield-bg"
      ref={containerRef}
      className="absolute inset-0 z-0 bg-black pointer-events-none brightness-200"
      style={{ opacity: 0 }}
    />
  );
}
