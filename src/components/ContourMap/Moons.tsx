"use client";

import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface MoonProps {
  label: string;
  color: string;
  emissive: string;
  orbitRadius: number;
  moonRadius: number;
  speed: number;
  phase: number;
  tilt: number;
}

// A single moon orbiting the cube on a tilted circular path. The tilt lives
// on the outer group so the (x, z) position written every frame on the inner
// group is expressed in the tilted local space, bending the flat circle into
// an inclined orbit instead of just spinning the (symmetric) sphere.
const Moon: React.FC<MoonProps> = ({ label, color, emissive, orbitRadius, moonRadius, speed, phase, tilt }) => {
  const angleRef = useRef(phase);
  const orbitRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    // Hover freezes the orbit in place so the label has a stable anchor.
    if (!hovered) {
      angleRef.current += speed * delta;
    }
    if (orbitRef.current) {
      orbitRef.current.position.set(
        Math.cos(angleRef.current) * orbitRadius,
        0,
        Math.sin(angleRef.current) * orbitRadius
      );
    }
  });

  return (
    <group rotation={[tilt, 0, 0]}>
      <group ref={orbitRef}>
        <mesh
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={() => setHovered(false)}
        >
          <sphereGeometry args={[moonRadius, 24, 24]} />
          <meshStandardMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={0.2}
            roughness={0.6}
            metalness={0.1}
          />
        </mesh>
        {hovered && (
          <Html position={[0, moonRadius * 2, 0]} center style={{ pointerEvents: "none" }}>
            <span
              className="glitch-soft"
              style={{
                fontFamily: "var(--font-offbit, monospace)",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.2em",
                color: "#ffffff",
                textShadow: "0 0 6px rgba(0,0,0,0.85)",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </span>
          </Html>
        )}
      </group>
    </group>
  );
};

interface MoonsProps {
  // Bounding-sphere radius (local units) of the cube at scale=1 — orbit and
  // moon sizes are derived from it so they stay proportional to the cube
  // regardless of the glb's actual dimensions.
  cubeRadius: number;
}

const Moons: React.FC<MoonsProps> = ({ cubeRadius }) => {
  const moonRadius = cubeRadius * 0.22;

  return (
    <>
      <Moon
        label="PODCAST"
        color="#0a0a0a"
        emissive="#151515"
        orbitRadius={cubeRadius * 2.3}
        moonRadius={moonRadius}
        speed={0.35}
        phase={0}
        tilt={0.35}
      />
      <Moon
        label="REALITY CHECK"
        color="#f5f5f5"
        emissive="#ffffff"
        orbitRadius={cubeRadius * 2.9}
        moonRadius={moonRadius}
        speed={-0.24}
        phase={Math.PI}
        tilt={-0.25}
      />
    </>
  );
};

export default Moons;
