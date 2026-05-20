"use client";

import React, { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import * as THREE from "three";
import MnetCube from "../MnetCube";

interface PlanetProps {
  overlayRef: React.RefObject<HTMLDivElement | null>;
}

const Planet: React.FC<PlanetProps> = ({ overlayRef }) => {
  const planetRef = useRef<THREE.Group>(null);
  const scroll = useScroll();
  const { size } = useThree();

  useFrame((state) => {
    const scrollOffset = scroll.offset;
    
    if (planetRef.current) {
      const mapAngle = -Math.PI / 2.5;
      const ny = -Math.sin(mapAngle);
      const nz = Math.cos(mapAngle);
      
      const appearance = smoothstep(0.6, 1.0, scrollOffset);
      planetRef.current.scale.setScalar(appearance * 1.5);
      
      planetRef.current.position.y = ny * 80 * appearance;
      planetRef.current.position.z = nz * 80 * appearance;
      
      planetRef.current.rotation.y += 0.005;
      planetRef.current.rotation.x += 0.003;

      if ((window as any).updateStarfield) {
        const zoom = 100 + appearance * 100;
        (window as any).updateStarfield(appearance, zoom);
      }

      // Project cube position to screen for HTML overlay labels
      if (overlayRef.current) {
        const worldPos = state.camera.userData.worldPos || (state.camera.userData.worldPos = new THREE.Vector3());
        const projected = state.camera.userData.projected || (state.camera.userData.projected = new THREE.Vector3());

        planetRef.current.getWorldPosition(worldPos);
        projected.copy(worldPos).project(state.camera);
        
        const screenX = (projected.x * 0.5 + 0.5) * size.width;
        const screenY = (-projected.y * 0.5 + 0.5) * size.height;
        const cubeScale = planetRef.current.scale.x;

        if (cubeScale > 0.3) {
          overlayRef.current.style.opacity = '1';
          overlayRef.current.style.transform = `translate(${screenX}px, ${screenY}px)`;
        } else {
          overlayRef.current.style.opacity = '0';
        }
      }
    }
  });

  function smoothstep(min: number, max: number, value: number) {
    const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
    return x * x * (3 - 2 * x);
  }

  return (
    <group ref={planetRef} position={[0, 8, 0]} scale={[0, 0, 0]}>
      <MnetCube />
      <pointLight intensity={500} distance={50} color="#ffffff" />
      <pointLight position={[2, 2, 2]} intensity={200} color="#0033ff" />
    </group>
  );
};

export default Planet;
