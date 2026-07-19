import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface MnetCubeProps {
  position?: [number, number, number];
  scale?: number;
}

// Only outline edges where adjacent faces meet at a sharp angle, so the
// cube silhouette pops without tracing every tessellation seam.
const EDGE_THRESHOLD_ANGLE = 20;

const edgeMaterial = new THREE.LineBasicMaterial({
  color: '#ffffff',
  transparent: true,
  opacity: 0.75,
});

export const MnetCube: React.FC<MnetCubeProps> = ({ position = [0, 0, 0], scale = 1 }) => {
  const { scene } = useGLTF('/assets/mnetcube.glb');

  // useGLTF caches and shares the scene, so tag meshes to avoid stacking
  // duplicate outlines across remounts.
  useMemo(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && !child.userData.hasEdgeOutline) {
        const mesh = child as THREE.Mesh;
        const edges = new THREE.LineSegments(
          new THREE.EdgesGeometry(mesh.geometry, EDGE_THRESHOLD_ANGLE),
          edgeMaterial,
        );
        mesh.add(edges);
        mesh.userData.hasEdgeOutline = true;
      }
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