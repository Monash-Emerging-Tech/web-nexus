"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
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
  // On-screen orientation (radians, counterclockwise from horizontal) of the
  // ring's major axis — the line the ring appears to rotate about is the
  // perpendicular. Used to slot each orbit into the gaps between nav labels.
  axisAngle: number;
}

// A single moon circling the cube in a camera-facing plane: the orbit is
// built every frame from the camera's right/up/forward basis vectors, so
// from the viewer's perspective the moon traces a ring around the cube (at a
// constant on-screen distance) instead of sweeping edge-on across its face.
// The parent group carries no rotation and uniform scale, so world-space
// camera directions are valid as local ones here.
interface CraterProps {
  phi: number;
  theta: number;
  size: number;
  moonRadius: number;
  moonColor: string;
}

const Crater: React.FC<CraterProps> = ({ phi, theta, size, moonRadius, moonColor }) => {
  const craterSize = moonRadius * size;
  
  const position = useMemo(() => {
    // Offset the crater position slightly outwards from the sphere surface to avoid z-fighting/clipping
    const offsetRadius = moonRadius + craterSize * 0.02;
    const x = offsetRadius * Math.sin(phi) * Math.cos(theta);
    const y = offsetRadius * Math.sin(phi) * Math.sin(theta);
    const z = offsetRadius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  }, [phi, theta, moonRadius, craterSize]);

  const quaternion = useMemo(() => {
    const normal = position.clone().normalize();
    const up = new THREE.Vector3(0, 0, 1);
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(up, normal);
    return q;
  }, [position]);

  const isDarkMoon = moonColor === "#0a0a0a";
  const rimColor = isDarkMoon ? "#333333" : "#d0d0d0";
  const rimEmissive = isDarkMoon ? "#1a1a1a" : "#b0b0b0";
  const floorColor = isDarkMoon ? "#050505" : "#c8c8c8";

  return (
    <group position={position} quaternion={quaternion}>
      {/* Torus for the crater rim/wall */}
      <mesh>
        <torusGeometry args={[craterSize, craterSize * 0.12, 6, 18]} />
        <meshStandardMaterial
          color={rimColor}
          emissive={rimEmissive}
          emissiveIntensity={isDarkMoon ? 0.3 : 0.1}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      {/* Ring/circle for the crater floor/depression */}
      <mesh position={[0, 0, -craterSize * 0.05]}>
        <ringGeometry args={[0, craterSize * 0.98, 18]} />
        <meshStandardMaterial
          color={floorColor}
          roughness={0.9}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

// A single moon circling the cube in a camera-facing plane: the orbit is
// built every frame from the camera's right/up/forward basis vectors, so
// from the viewer's perspective the moon traces a ring around the cube (at a
// constant on-screen distance) instead of sweeping edge-on across its face.
// The parent group carries no rotation and uniform scale, so world-space
// camera directions are valid as local ones here.
const Moon: React.FC<MoonProps> = ({ label, color, emissive, orbitRadius, moonRadius, speed, phase, tilt, axisAngle }) => {
  const angleRef = useRef(phase);
  const orbitRef = useRef<THREE.Group>(null);
  const billboardRef = useRef<THREE.Group>(null);
  const moonMeshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const tempV3 = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    if (hovered) {
      window.dispatchEvent(new CustomEvent("mnet:cursor", { detail: "pointer" }));
      document.body.style.cursor = "pointer";
    } else {
      window.dispatchEvent(new CustomEvent("mnet:cursor", { detail: "default" }));
      document.body.style.cursor = "";
      window.dispatchEvent(
        new CustomEvent("mnet:moon-hover", {
          detail: { visible: false },
        })
      );
    }
    return () => {
      window.dispatchEvent(new CustomEvent("mnet:cursor", { detail: "default" }));
      document.body.style.cursor = "";
      window.dispatchEvent(
        new CustomEvent("mnet:moon-hover", {
          detail: { visible: false },
        })
      );
    };
  }, [hovered]);

  // Pre-calculate the static points of the screen-aligned ellipse in local space
  const points = useMemo(() => {
    const pts = [];
    const count = 64;
    const cosAxis = Math.cos(axisAngle);
    const sinAxis = Math.sin(axisAngle);
    const cosTilt = Math.cos(tilt);
    const sinTilt = Math.sin(tilt);
    
    for (let i = 0; i <= count; i++) {
      const theta = (i / count) * Math.PI * 2;
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      
      const x = cosAxis * c * orbitRadius - sinAxis * s * cosTilt * orbitRadius;
      const y = sinAxis * c * orbitRadius + cosAxis * s * cosTilt * orbitRadius;
      const z = s * sinTilt * orbitRadius;
      
      pts.push(new THREE.Vector3(x, y, z));
    }
    return pts;
  }, [axisAngle, orbitRadius, tilt]);

  useFrame((state, delta) => {
    // Keep the billboard group aligned with the camera's viewport orientation
    if (billboardRef.current) {
      billboardRef.current.quaternion.copy(state.camera.quaternion);
    }

    // Hover freezes the orbit in place so the label has a stable anchor.
    if (!hovered) {
      angleRef.current += speed * delta;
    }

    // Slowly rotate the moon on its axis for a premium 3D effect showing the craters
    if (moonMeshRef.current) {
      moonMeshRef.current.rotation.y += delta * 0.3;
      moonMeshRef.current.rotation.x += delta * 0.1;
    }

    // Update the moon's position along the local elliptical path
    if (orbitRef.current) {
      const c = Math.cos(angleRef.current);
      const s = Math.sin(angleRef.current);
      
      const cosAxis = Math.cos(axisAngle);
      const sinAxis = Math.sin(axisAngle);
      const cosTilt = Math.cos(tilt);
      const sinTilt = Math.sin(tilt);
      
      const x = cosAxis * c * orbitRadius - sinAxis * s * cosTilt * orbitRadius;
      const y = sinAxis * c * orbitRadius + cosAxis * s * cosTilt * orbitRadius;
      const z = s * sinTilt * orbitRadius;
      
      orbitRef.current.position.set(x, y, z);

      if (hovered) {
        // Manually update the moon's world matrix and camera's view projection matrix
        // to sync frame positions, which prevents coordinate projection jitter.
        orbitRef.current.updateMatrixWorld(true);
        state.camera.updateMatrixWorld(true);

        orbitRef.current.getWorldPosition(tempV3);
        tempV3.project(state.camera);
        const screenX = Math.round((tempV3.x * 0.5 + 0.5) * state.size.width);
        const screenY = Math.round((-tempV3.y * 0.5 + 0.5) * state.size.height);
        window.dispatchEvent(
          new CustomEvent("mnet:moon-hover", {
            detail: {
              label,
              x: screenX,
              y: screenY,
              visible: true,
            },
          })
        );
      }
    }
  });

  // Define 18 craters with different positions and sizes for a richer textured surface
  const cratersConfig = useMemo(() => [
    { phi: 0.6, theta: 0.5, size: 0.18 },
    { phi: 1.2, theta: 1.8, size: 0.24 },
    { phi: 2.0, theta: 3.2, size: 0.15 },
    { phi: 1.5, theta: 4.8, size: 0.20 },
    { phi: 0.8, theta: 5.5, size: 0.12 },
    { phi: 2.4, theta: 1.0, size: 0.16 },
    { phi: 1.8, theta: 0.2, size: 0.22 },
    { phi: 2.1, theta: 5.9, size: 0.14 },
    { phi: 0.3, theta: 2.5, size: 0.10 },
    { phi: 0.9, theta: 3.8, size: 0.16 },
    { phi: 1.4, theta: 0.9, size: 0.13 },
    { phi: 1.7, theta: 2.7, size: 0.19 },
    { phi: 2.2, theta: 4.1, size: 0.11 },
    { phi: 2.7, theta: 5.2, size: 0.15 },
    { phi: 2.9, theta: 1.6, size: 0.08 },
    { phi: 1.1, theta: 6.1, size: 0.17 },
    { phi: 0.5, theta: 4.5, size: 0.14 },
    { phi: 2.5, theta: 3.0, size: 0.21 },
  ], []);

  return (
    <group ref={billboardRef}>
      <Line
        points={points}
        color={emissive === "#151515" ? "#ffffff" : color}
        lineWidth={2}
        dashed
        dashScale={30}
        dashSize={0.4}
        gapSize={0.3}
        transparent
        opacity={0.25}
        depthWrite={false}
      />
      <group ref={orbitRef}>
        <group ref={moonMeshRef}>
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
          {cratersConfig.map((crater, index) => (
            <Crater
              key={index}
              phi={crater.phi}
              theta={crater.theta}
              size={crater.size}
              moonRadius={moonRadius}
              moonColor={color}
            />
          ))}
        </group>

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
  const moonRadius = cubeRadius * 0.14;

  // The nav label arc sits at 1.2x the cube's projected radius. With
  // camera-facing orbits the on-screen distance is orbitRadius (shrunk
  // along the minor axis by cos(tilt)), so 1.5x / 1.85x keeps both rings
  // clearly outside the arc at every point of the orbit without flying
  // off-screen.
  //
  // The labels sit at 23°, 73°, 203° and 253° on screen (LABEL_CONFIG diag
  // directions), i.e. two antipodal pairs. The bisectors of the gaps
  // between them are the 48° and 138° lines, so each ring's axis takes one
  // of those — evenly spaced between the labels, perpendicular to each
  // other.
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
        tilt={Math.PI / 2 - 0.15}
        axisAngle={THREE.MathUtils.degToRad(116.5)}
      />
      <Moon
        label="REALITY CHECK"
        color="#0a0a0a"
        emissive="#151515"
        orbitRadius={cubeRadius * 1.85}
        moonRadius={moonRadius}
        speed={-0.24}
        phase={Math.PI}
        tilt={-Math.PI / 2 + 0.15}
        axisAngle={THREE.MathUtils.degToRad(160)}
      />
    </>
  );
};

export default Moons;
