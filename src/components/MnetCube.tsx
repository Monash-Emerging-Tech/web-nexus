import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MnetCubeProps {
  position?: [number, number, number];
  scale?: number;
}

export const MnetCube: React.FC<MnetCubeProps> = ({ position = [0, 0, 0], scale = 1 }) => {
  const { scene } = useGLTF('/assets/mnetcube.glb');
  
  return (
    <group position={position} scale={scale} rotation={[0, Math.PI, 0]}>
      <primitive object={scene} />
    </group>
  );
};

// Preload the model
useGLTF.preload('/assets/mnetcube.glb');

export default MnetCube;
