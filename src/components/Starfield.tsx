"use client";

import { useEffect, useRef } from "react";

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
        bg.three.scene.traverse((object) => {
          if (object.isMesh && object.material) {
            const mat = object.material as any;
            if (mat.color) mat.color.set("#FF0040");
            // if (mat.emissive) {
            //   mat.emissive.set("#FF0040");
            //   mat.emissiveIntensity = 0.2;
            // }
          }
        });

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
