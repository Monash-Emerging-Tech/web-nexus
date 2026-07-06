import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface MnetCubeProps {
  position?: [number, number, number];
  scale?: number;
}

export const MnetCube: React.FC<MnetCubeProps> = ({ position = [0, 0, 0], scale = 1 }) => {
  const { scene } = useGLTF('/assets/mnetcube.glb');

  // The GLB's MNET_Black material is unlit pure black (0,0,0), identical to
  // the scene background — lift it to dark grey so the faces stay visible.
  useMemo(() => {
    scene.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((material) => {
        if (material.name === 'MNET_Black') {
          (material as THREE.MeshBasicMaterial).color.set('#1a1a1a');
        }
      });
    });
  }, [scene]);

  return (
    <group position={position} scale={scale} rotation={[0, Math.PI, 0]}>
      <primitive object={scene} />
    </group>
  );
};

// Preload the model
useGLTF.preload('/assets/mnetcube.glb');

export default MnetCube;
