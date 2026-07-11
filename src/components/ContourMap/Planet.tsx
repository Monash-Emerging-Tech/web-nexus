"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useScroll } from "@react-three/drei";
import * as THREE from "three";
import MnetCube from "../MnetCube";
import Moons from "./Moons";

interface PlanetProps {
  overlayRef: React.RefObject<HTMLDivElement | null>;
  // Reports the cube's current apparent on-screen radius (px), so the nav
  // arcs (drawn outside the Canvas as HTML/SVG) can track the cube's actual
  // projected size instead of guessing fixed pixel values.
  onCubeRadiusChange?: (radiusPx: number) => void;
}

// Idle autospin rates (rad/s) — the previous per-frame constants (0.005/0.003)
// at 60fps, now delta-scaled. Drag inertia decays back TO these rates, so
// letting go of a flick blends seamlessly into the autospin (feel inspired by
// the AI Hardware Squeeze tower's OrbitControls damping).
const BASE_ROT_Y = 0.3;
const BASE_ROT_X = 0.18;

const setGrabCursor = (state: "grab" | "grabbing" | "default") => {
  window.dispatchEvent(new CustomEvent("mnet:cursor", { detail: state }));
  // Fallback for devices where the custom cursor is inactive.
  document.body.style.cursor = state === "default" ? "" : state;
};

const Planet: React.FC<PlanetProps> = ({ overlayRef, onCubeRadiusChange }) => {
  const planetRef = useRef<THREE.Group>(null);
  // Spin is applied to this inner group (cube + its lights) only, so the
  // moons orbit in a fixed frame — freezing a moon's orbit angle on hover
  // then actually holds it still on screen instead of it being carried
  // along by the parent's rotation.
  const spinRef = useRef<THREE.Group>(null);
  const scroll = useScroll();
  const { size } = useThree();
  const springRef = useRef({ scale: 0, velocity: 0 });
  // Bounding-sphere radius of the cube mesh at scale=1, in local units —
  // used every frame to derive its true projected screen radius so the nav
  // arcs can stay locked to the cube's actual apparent size.
  const { scene: cubeScene } = useGLTF('/assets/mnetcube.glb');
  const cubeLocalRadius = useMemo(() => {
    const sphere = new THREE.Box3().setFromObject(cubeScene).getBoundingSphere(new THREE.Sphere());
    return sphere.radius;
  }, [cubeScene]);
  const dragRef = useRef({
    dragging: false,
    touch: false,
    pointerId: -1,
    lastX: 0,
    lastY: 0,
    pendingYaw: 0,
    pendingPitch: 0,
    vx: BASE_ROT_X,
    vy: BASE_ROT_Y,
    hovered: false,
  });

  // Touch-drags on the cube must not scroll the page. touch-action can't be
  // flipped mid-gesture, so preventDefault the touch events on drei's scroll
  // element while a cube drag is active (R3F's pointerdown raycast has already
  // run by the time touchstart/touchmove fire, so `dragging` is current).
  useEffect(() => {
    const el = scroll.el;
    if (!el) return;
    const blockTouch = (e: TouchEvent) => {
      if (dragRef.current.dragging && dragRef.current.touch) e.preventDefault();
    };
    el.addEventListener("touchstart", blockTouch, { passive: false });
    el.addEventListener("touchmove", blockTouch, { passive: false });
    return () => {
      el.removeEventListener("touchstart", blockTouch);
      el.removeEventListener("touchmove", blockTouch);
    };
  }, [scroll.el]);

  useEffect(() => {
    return () => setGrabCursor("default");
  }, []);

  useFrame((state, delta) => {
    const scrollOffset = scroll.offset;
    
    if (planetRef.current) {
      const mapAngle = -Math.PI / 2.5;
      const ny = -Math.sin(mapAngle);
      const nz = Math.cos(mapAngle);
      
      const targetScale = smoothstep(0.6, 1.0, scrollOffset);
      
      // Spring physics: stiffness = 250, damping = 10 (explosive/springy overshoot)
      const stiffness = 250;
      const damping = 10;
      const force = stiffness * (targetScale - springRef.current.scale) - damping * springRef.current.velocity;
      
      // Limit dt to avoid spikes
      const dt = Math.min(delta, 0.1);
      springRef.current.velocity += force * dt;
      springRef.current.scale += springRef.current.velocity * dt;

      // Clamp scale to 0 to avoid negative scale and bounce back
      if (springRef.current.scale < 0) {
        springRef.current.scale = 0;
        springRef.current.velocity = 0;
      }
      
      const isMobile = size.width < 768;
      const baseScale = isMobile ? 0.85 : 2.3;
      const animatedScale = springRef.current.scale;
      planetRef.current.scale.setScalar(animatedScale * baseScale);
      planetRef.current.visible = animatedScale > 0.001;
      
      planetRef.current.position.y = ny * 80 * animatedScale;
      planetRef.current.position.z = nz * 80 * animatedScale;
      
      if (spinRef.current) {
        spinRef.current.rotation.y += 0.005;
        spinRef.current.rotation.x += 0.003;
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
          overlayRef.current.style.visibility = 'visible';
          overlayRef.current.style.transform = `translate(${screenX}px, ${screenY}px)`;

          // Apparent on-screen radius of the cube: project a point offset
          // from its center by its world-space bounding radius along the
          // camera's right vector, then measure the pixel distance to the
          // center. This accounts for perspective (the cube also moves
          // toward/away from the camera as it scales), unlike a fixed pixel
          // constant would. Only tracked while the labels are visible —
          // matches the opacity gate above, since the arcs are invisible
          // otherwise.
          if (onCubeRadiusChange) {
            const worldRadius = cubeLocalRadius * cubeScale;
            const rightVec = state.camera.userData.rightVec || (state.camera.userData.rightVec = new THREE.Vector3());
            rightVec.setFromMatrixColumn(state.camera.matrixWorld, 0);

            const edgeWorld = state.camera.userData.edgeWorld || (state.camera.userData.edgeWorld = new THREE.Vector3());
            edgeWorld.copy(worldPos).addScaledVector(rightVec, worldRadius);

            const edgeProjected = state.camera.userData.edgeProjected || (state.camera.userData.edgeProjected = new THREE.Vector3());
            edgeProjected.copy(edgeWorld).project(state.camera);

            const edgeScreenX = (edgeProjected.x * 0.5 + 0.5) * size.width;
            const edgeScreenY = (-edgeProjected.y * 0.5 + 0.5) * size.height;
            const radiusPx = Math.hypot(edgeScreenX - screenX, edgeScreenY - screenY);

            // Round to avoid re-render churn from sub-pixel float noise once
            // the cube settles at rest (idle rotation doesn't change a
            // bounding-sphere radius, so this converges to a stable value).
            onCubeRadiusChange(Math.round(radiusPx * 2) / 2);
          }
        } else {
          // visibility also kills hit-testing on the label links while
          // hidden — the container's pointer-events: none doesn't, because
          // the links override it with pointer-events: auto.
          overlayRef.current.style.opacity = '0';
          overlayRef.current.style.visibility = 'hidden';
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
      <group ref={spinRef}>
        <MnetCube />
        <pointLight intensity={500} distance={50} color="#ffffff" />
        <pointLight position={[2, 2, 2]} intensity={200} color="#0033ff" />
      </group>
      <Moons cubeRadius={cubeLocalRadius} />
    </group>
  );
};

export default Planet;
