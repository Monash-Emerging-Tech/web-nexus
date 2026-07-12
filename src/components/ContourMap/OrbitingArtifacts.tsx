"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

type ArtifactKind = "podcast" | "blog";

interface OrbitingArtifactProps {
  kind: ArtifactKind;
  label: string;
  orbitColor: string;
  orbitRadius: number;
  artifactRadius: number;
  speed: number;
  phase: number;
  tilt: number;
  axisAngle: number;
}

const PodcastArtifact = () => (
  <group>
    {/* Broadcast arcs form a subtle MNET signal mark behind the mic. */}
    <mesh position={[0, 0.2, -0.18]} rotation={[0, 0, -Math.PI * 0.73]}>
      <torusGeometry args={[0.83, 0.035, 6, 36, Math.PI * 1.45]} />
      <meshStandardMaterial color="#DC003B" emissive="#DC003B" emissiveIntensity={1.5} />
    </mesh>
    <mesh position={[0, 0.2, -0.2]} rotation={[0, 0, -Math.PI * 0.73]}>
      <torusGeometry args={[1.03, 0.028, 6, 40, Math.PI * 1.45]} />
      <meshStandardMaterial color="#040DC1" emissive="#040DC1" emissiveIntensity={1.8} />
    </mesh>

    {/* Black studio microphone with alternating red/blue grille rails. */}
    <mesh position={[0, 0.28, 0]}>
      <capsuleGeometry args={[0.34, 0.72, 6, 18]} />
      <meshStandardMaterial color="#070707" roughness={0.42} metalness={0.55} />
    </mesh>
    {[-0.18, 0.03, 0.24, 0.45].map((y, index) => (
      <mesh key={y} position={[0, y, 0.32]} scale={[0.57, 0.055, 0.06]}>
        <boxGeometry />
        <meshStandardMaterial
          color={index % 2 === 0 ? "#DC003B" : "#040DC1"}
          emissive={index % 2 === 0 ? "#DC003B" : "#040DC1"}
          emissiveIntensity={1.1}
        />
      </mesh>
    ))}
    <mesh position={[-0.37, 0.25, 0]} scale={[0.055, 0.92, 0.38]}>
      <boxGeometry />
      <meshStandardMaterial color="#040DC1" emissive="#040DC1" emissiveIntensity={0.9} />
    </mesh>
    <mesh position={[0.37, 0.25, 0]} scale={[0.055, 0.92, 0.38]}>
      <boxGeometry />
      <meshStandardMaterial color="#DC003B" emissive="#DC003B" emissiveIntensity={0.9} />
    </mesh>

    <mesh position={[0, -0.62, 0]}>
      <cylinderGeometry args={[0.09, 0.12, 0.55, 14]} />
      <meshStandardMaterial color="#0a0a0a" metalness={0.7} roughness={0.3} />
    </mesh>
    <mesh position={[0, -0.92, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.42, 0.07, 8, 28]} />
      <meshStandardMaterial color="#DC003B" emissive="#DC003B" emissiveIntensity={0.8} />
    </mesh>
  </group>
);

const BlogArtifact = () => (
  <group rotation={[0.08, -0.18, -0.08]}>
    {/* Offset blue/red sheets make the editorial card read in depth. */}
    <mesh position={[-0.18, 0.12, -0.2]} rotation={[0, 0, -0.1]} scale={[1.18, 1.48, 0.12]}>
      <boxGeometry />
      <meshStandardMaterial color="#040DC1" emissive="#040DC1" emissiveIntensity={0.75} />
    </mesh>
    <mesh position={[0.12, -0.08, -0.1]} rotation={[0, 0, 0.06]} scale={[1.18, 1.48, 0.12]}>
      <boxGeometry />
      <meshStandardMaterial color="#DC003B" emissive="#DC003B" emissiveIntensity={0.65} />
    </mesh>

    {/* Reality Check's dark article card and brand-colour information rails. */}
    <mesh scale={[1.2, 1.52, 0.16]}>
      <boxGeometry />
      <meshStandardMaterial color="#070707" roughness={0.48} metalness={0.35} />
    </mesh>
    <mesh position={[0, 0.61, 0.11]} scale={[0.92, 0.13, 0.045]}>
      <boxGeometry />
      <meshStandardMaterial color="#DC003B" emissive="#DC003B" emissiveIntensity={1.15} />
    </mesh>
    <mesh position={[-0.34, 0.34, 0.11]} scale={[0.23, 0.18, 0.045]}>
      <boxGeometry />
      <meshStandardMaterial color="#040DC1" emissive="#040DC1" emissiveIntensity={1.3} />
    </mesh>
    {[0.32, 0.08, -0.16, -0.4].map((y, index) => (
      <mesh
        key={y}
        position={[index === 0 ? 0.2 : 0, y, 0.11]}
        scale={[index === 0 ? 0.38 : index === 3 ? 0.6 : 0.78, 0.045, 0.04]}
      >
        <boxGeometry />
        <meshStandardMaterial
          color={index === 2 ? "#DC003B" : "#F2F2F2"}
          emissive={index === 2 ? "#DC003B" : "#333333"}
          emissiveIntensity={index === 2 ? 1 : 0.35}
        />
      </mesh>
    ))}
    {/* Folded-corner cue. */}
    <mesh position={[0.48, 0.62, 0.17]} rotation={[0, 0, Math.PI / 4]} scale={[0.18, 0.18, 0.05]}>
      <boxGeometry />
      <meshStandardMaterial color="#040DC1" emissive="#040DC1" emissiveIntensity={1.2} />
    </mesh>
  </group>
);

const OrbitingArtifact: React.FC<OrbitingArtifactProps> = ({
  kind,
  label,
  orbitColor,
  orbitRadius,
  artifactRadius,
  speed,
  phase,
  tilt,
  axisAngle,
}) => {
  const angleRef = useRef(phase);
  const orbitRef = useRef<THREE.Group>(null);
  const billboardRef = useRef<THREE.Group>(null);
  const artifactRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const tempV3 = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    if (hovered) {
      window.dispatchEvent(new CustomEvent("mnet:cursor", { detail: "pointer" }));
      document.body.style.cursor = "pointer";
    } else {
      window.dispatchEvent(new CustomEvent("mnet:cursor", { detail: "default" }));
      document.body.style.cursor = "";
      window.dispatchEvent(new CustomEvent("mnet:artifact-hover", { detail: { visible: false } }));
    }
    return () => {
      window.dispatchEvent(new CustomEvent("mnet:cursor", { detail: "default" }));
      document.body.style.cursor = "";
      window.dispatchEvent(new CustomEvent("mnet:artifact-hover", { detail: { visible: false } }));
    };
  }, [hovered]);

  const points = useMemo(() => {
    const result: THREE.Vector3[] = [];
    const cosAxis = Math.cos(axisAngle);
    const sinAxis = Math.sin(axisAngle);
    const cosTilt = Math.cos(tilt);
    const sinTilt = Math.sin(tilt);
    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * Math.PI * 2;
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      result.push(new THREE.Vector3(
        cosAxis * c * orbitRadius - sinAxis * s * cosTilt * orbitRadius,
        sinAxis * c * orbitRadius + cosAxis * s * cosTilt * orbitRadius,
        s * sinTilt * orbitRadius,
      ));
    }
    return result;
  }, [axisAngle, orbitRadius, tilt]);

  useFrame((state, delta) => {
    billboardRef.current?.quaternion.copy(state.camera.quaternion);
    if (!hovered) angleRef.current += speed * delta;

    if (artifactRef.current) {
      // Keep both symbols front-readable while still giving them dimensional
      // motion; a full yaw would periodically turn the editorial card edge-on.
      artifactRef.current.rotation.y = Math.sin(
        state.clock.elapsedTime * (kind === "podcast" ? 0.52 : 0.38) + phase,
      ) * (kind === "podcast" ? 0.28 : 0.18);
      artifactRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.65 + phase) * 0.1;
    }

    if (!orbitRef.current) return;
    const c = Math.cos(angleRef.current);
    const s = Math.sin(angleRef.current);
    const cosAxis = Math.cos(axisAngle);
    const sinAxis = Math.sin(axisAngle);
    const cosTilt = Math.cos(tilt);
    const sinTilt = Math.sin(tilt);
    orbitRef.current.position.set(
      cosAxis * c * orbitRadius - sinAxis * s * cosTilt * orbitRadius,
      sinAxis * c * orbitRadius + cosAxis * s * cosTilt * orbitRadius,
      s * sinTilt * orbitRadius,
    );

    if (hovered) {
      orbitRef.current.updateMatrixWorld(true);
      state.camera.updateMatrixWorld(true);
      orbitRef.current.getWorldPosition(tempV3).project(state.camera);
      window.dispatchEvent(new CustomEvent("mnet:artifact-hover", {
        detail: {
          label,
          x: Math.round((tempV3.x * 0.5 + 0.5) * state.size.width),
          y: Math.round((-tempV3.y * 0.5 + 0.5) * state.size.height),
          visible: true,
        },
      }));
    }
  });

  return (
    <group ref={billboardRef}>
      <Line
        points={points}
        color={orbitColor}
        lineWidth={2}
        dashed
        dashScale={30}
        dashSize={0.4}
        gapSize={0.3}
        transparent
        opacity={0.32}
        depthWrite={false}
      />
      <group ref={orbitRef}>
        <group
          ref={artifactRef}
          scale={artifactRadius * (kind === "podcast" ? 0.78 : 0.88)}
          onPointerOver={(event) => {
            event.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={() => setHovered(false)}
        >
          {kind === "podcast" ? <PodcastArtifact /> : <BlogArtifact />}
        </group>
      </group>
    </group>
  );
};

interface OrbitingArtifactsProps {
  cubeRadius: number;
}

const OrbitingArtifacts: React.FC<OrbitingArtifactsProps> = ({ cubeRadius }) => {
  const artifactRadius = cubeRadius * 0.18;
  return (
    <>
      <OrbitingArtifact
        kind="podcast"
        label="NEXUS CONDUIT PODCAST"
        orbitColor="#ffffff"
        orbitRadius={cubeRadius * 1.5}
        artifactRadius={artifactRadius}
        speed={0.35}
        phase={0}
        tilt={Math.PI / 2 - 0.15}
        axisAngle={THREE.MathUtils.degToRad(116.5)}
      />
      <OrbitingArtifact
        kind="blog"
        label="REALITY CHECK BLOG"
        orbitColor="#ffffff"
        orbitRadius={cubeRadius * 1.85}
        artifactRadius={artifactRadius}
        speed={-0.24}
        phase={Math.PI}
        tilt={-Math.PI / 2 + 0.15}
        axisAngle={THREE.MathUtils.degToRad(160)}
      />
    </>
  );
};

export default OrbitingArtifacts;
