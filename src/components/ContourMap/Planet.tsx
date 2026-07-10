"use client";

import React, { useEffect, useRef } from "react";
import { useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import * as THREE from "three";
import MnetCube from "../MnetCube";

interface PlanetProps {
  overlayRef: React.RefObject<HTMLDivElement | null>;
}

// Idle autospin rates (rad/s) — the previous per-frame constants (0.005/0.003)
// at 60fps, now delta-scaled. Drag inertia decays back TO these rates, so
// letting go of a flick blends seamlessly into the autospin (feel inspired by
// the AI Hardware Squeeze tower's OrbitControls damping).
const BASE_ROT_Y = 0.3;
const BASE_ROT_X = 0.18;
const DRAG_SENSITIVITY = 0.008; // rad per px of pointer travel
const INERTIA_LAMBDA = 1.5; // higher = flicks settle into autospin faster
const MAX_SPIN = 8; // rad/s cap so violent flicks stay sane

const setGrabCursor = (state: "grab" | "grabbing" | "default") => {
  window.dispatchEvent(new CustomEvent("mnet:cursor", { detail: state }));
  // Fallback for devices where the custom cursor is inactive.
  document.body.style.cursor = state === "default" ? "" : state;
};

const Planet: React.FC<PlanetProps> = ({ overlayRef }) => {
  const planetRef = useRef<THREE.Group>(null);
  const scroll = useScroll();
  const { size } = useThree();
  const springRef = useRef({ scale: 0, velocity: 0 });
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

  const endDrag = (e: ThreeEvent<PointerEvent>) => {
    const drag = dragRef.current;
    if (!drag.dragging || e.pointerId !== drag.pointerId) return;
    drag.dragging = false;
    drag.pointerId = -1;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    setGrabCursor(drag.hovered ? "grab" : "default");
  };

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (springRef.current.scale < 0.5) return; // cube not meaningfully visible yet
    e.stopPropagation();
    const drag = dragRef.current;
    drag.dragging = true;
    drag.touch = e.pointerType === "touch";
    drag.pointerId = e.pointerId;
    drag.lastX = e.clientX;
    drag.lastY = e.clientY;
    drag.pendingYaw = 0;
    drag.pendingPitch = 0;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setGrabCursor("grabbing");
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    const drag = dragRef.current;
    if (!drag.dragging || e.pointerId !== drag.pointerId) return;
    e.stopPropagation();
    drag.pendingYaw += (e.clientX - drag.lastX) * DRAG_SENSITIVITY;
    drag.pendingPitch += (e.clientY - drag.lastY) * DRAG_SENSITIVITY;
    drag.lastX = e.clientX;
    drag.lastY = e.clientY;
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    if (springRef.current.scale < 0.5) return;
    e.stopPropagation();
    dragRef.current.hovered = true;
    if (!dragRef.current.dragging) setGrabCursor("grab");
  };

  const handlePointerOut = () => {
    dragRef.current.hovered = false;
    if (!dragRef.current.dragging) setGrabCursor("default");
  };

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
      
      planetRef.current.rotation.y += 0.005;
      planetRef.current.rotation.x += 0.003;

      if (window.updateStarfield) {
        const zoom = 100 + animatedScale * 100;
        window.updateStarfield(animatedScale, zoom);
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
          overlayRef.current.style.setProperty('--nav-scale', animatedScale.toString());
        } else {
          overlayRef.current.style.opacity = '0';
          overlayRef.current.style.setProperty('--nav-scale', '0');
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
