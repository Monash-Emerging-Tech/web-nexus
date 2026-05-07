"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface SpeedLinesProps {
  count?: number;
  scrollOffset: number;
}

const SpeedLines: React.FC<SpeedLinesProps> = ({ count = 200, scrollOffset }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  const lines = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        x: (Math.random() - 0.5) * 60,
        y: (Math.random() - 0.5) * 60,
        z: Math.random() * 200 - 100,
        speed: Math.random() * 2 + 1,
        length: Math.random() * 15 + 5
      });
    }
    return temp;
  }, [count]);

  useFrame(() => {
    if (groupRef.current) {
      // Rotate group to be perpendicular to map (Map is at -Math.PI / 2.5 on X)
      groupRef.current.rotation.x = -Math.PI / 2.5;
      
      groupRef.current.children.forEach((child, i) => {
        const line = lines[i];
        // Move lines towards camera based on scroll velocity + constant speed
        const speed = line.speed * (1 + scrollOffset * 10);
        child.position.z += speed * 0.1;
        
        // Loop lines back to the distance
        if (child.position.z > 50) {
          child.position.z = -150;
        }
      });
      groupRef.current.rotation.z += 0.0005;
    }
  });

  // Fade in instantly as we scroll, peak fast, fade out at the very end
  const opacity = Math.sin(Math.pow(scrollOffset, 0.5) * Math.PI);

  return (
    <group ref={groupRef}>
      {lines.map((line, i) => (
        <mesh key={i} position={[line.x, line.y, line.z]}>
          <boxGeometry args={[0.03, 0.03, line.length]} />
          <meshBasicMaterial 
            color="#ffffff" 
            transparent 
            opacity={opacity * 0.4} 
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
};

export default SpeedLines;
