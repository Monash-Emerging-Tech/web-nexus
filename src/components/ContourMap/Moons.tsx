"use client";

import React, { useMemo, useRef, useState } from "react";
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
  // Inclination (radians) of the orbit ring out of the screen plane — 0 is a
  // flat on-screen circle; larger values swing the moon toward/away from the
  // camera for depth. Keep |tilt| small enough that the projected ring stays
  // outside the nav label arc (see Moons below).
  tilt: number;
}

// A single moon circling the cube in a camera-facing plane: the orbit is
// built every frame from the camera's right/up/forward basis vectors, so
// from the viewer's perspective the moon traces a ring around the cube (at a
// constant on-screen distance) instead of sweeping edge-on across its face.
// The parent group carries no rotation and uniform scale, so world-space
// camera directions are valid as local ones here.
const Moon: React.FC<MoonProps> = ({ label, color, emissive, orbitRadius, moonRadius, speed, phase, tilt }) => {
  const angleRef = useRef(phase);
  const orbitRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const { camRight, camUp, camForward } = useMemo(
    () => ({ camRight: new THREE.Vector3(), camUp: new THREE.Vector3(), camForward: new THREE.Vector3() }),
    []
  );

  useFrame((state, delta) => {
    // Hover freezes the orbit in place so the label has a stable anchor.
    if (!hovered) {
      angleRef.current += speed * delta;
    }
    if (orbitRef.current) {
      camRight.setFromMatrixColumn(state.camera.matrixWorld, 0);
      camUp.setFromMatrixColumn(state.camera.matrixWorld, 1);
      camForward.setFromMatrixColumn(state.camera.matrixWorld, 2);
      const c = Math.cos(angleRef.current);
      const s = Math.sin(angleRef.current);
      orbitRef.current.position
        .set(0, 0, 0)
        .addScaledVector(camRight, c * orbitRadius)
        .addScaledVector(camUp, s * Math.cos(tilt) * orbitRadius)
        .addScaledVector(camForward, s * Math.sin(tilt) * orbitRadius);
    }
  });

  return (
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

  // The nav label arc sits at 1.2x the cube's projected radius. With
  // camera-facing orbits the on-screen distance is orbitRadius (shrunk
  // vertically by cos(tilt)), so 1.5x / 1.85x keeps both rings clearly
  // outside the arc at every point of the orbit without flying off-screen.
  return (
    <>
      <Moon
        label="PODCAST"
        color="#0a0a0a"
        emissive="#151515"
        orbitRadius={cubeRadius * 1.5}
        moonRadius={moonRadius}
        speed={0.35}
        phase={0}
        tilt={0.35}
      />
      <Moon
        label="REALITY CHECK"
        color="#f5f5f5"
        emissive="#ffffff"
        orbitRadius={cubeRadius * 1.85}
        moonRadius={moonRadius}
        speed={-0.24}
        phase={Math.PI}
        tilt={-0.5}
      />
    </>
  );
};

export default Moons;
