import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface MnetCubeProps {
  position?: [number, number, number];
  scale?: number;
  /** White edge outlines. On for the hero cube; off for the navbar logo. */
  edges?: boolean;
}

// Only outline edges where adjacent faces meet at a sharp angle, so the
// cube silhouette pops without tracing every tessellation seam.
const EDGE_THRESHOLD_ANGLE = 20;

const edgeMaterial = new THREE.LineBasicMaterial({
  color: '#ffffff',
  transparent: true,
  opacity: 0.75,
});

export const MnetCube: React.FC<MnetCubeProps> = ({ position = [0, 0, 0], scale = 1, edges = true }) => {
  const { scene } = useGLTF('/assets/mnetcube.glb');

  // useGLTF returns ONE shared scene object. A THREE.Object3D can only live at
  // one place in the scene graph, so when both the hero cube and the navbar
  // cube render `<primitive object={scene} />`, they fight over it and one
  // loses the mesh entirely. Clone per instance so each gets its own object
  // (geometry/materials are still shared, which is fine across contexts), and
  // add the white edge outlines to the clone.
  const cube = useMemo(() => {
    const clone = scene.clone(true);
    if (edges) {
      clone.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.add(
            new THREE.LineSegments(
              new THREE.EdgesGeometry(mesh.geometry, EDGE_THRESHOLD_ANGLE),
              edgeMaterial,
            ),
          );
        }
      });
    }
    return clone;
  }, [scene, edges]);

  return (
    <group position={position} scale={scale} rotation={[0, Math.PI, 0]}>
      <primitive object={cube} />
    </group>
  );
};

// Preload the model
useGLTF.preload('/assets/mnetcube.glb');

export default MnetCube;
