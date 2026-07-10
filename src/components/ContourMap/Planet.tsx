"use client";

import React, { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import * as THREE from "three";
import MnetCube from "../MnetCube";
import type { CubeState } from "./NavBubbles";

interface PlanetProps {
  cubeStateRef: React.MutableRefObject<CubeState>;
  reducedMotion?: boolean;
}

// Idle autospin rates (rad/s) — drag momentum decays back TO these rates, so
// letting go of a flick blends seamlessly into the autospin (feel inspired by
// the AI Hardware Squeeze tower's OrbitControls damping).
const BASE_ROT_Y = 0.3;
const BASE_ROT_X = 0.18;
const DRAG_RAD_PER_PX = 0.008;
const MAX_SPIN = 6; // rad/s flick cap

const setGrabCursor = (state: "grab" | "grabbing" | "default") => {
  window.dispatchEvent(new CustomEvent("mnet:cursor", { detail: state }));
  // Fallback for devices where the custom cursor is inactive.
  document.body.style.cursor = state === "default" ? "" : state;
};

const Planet: React.FC<PlanetProps> = ({ cubeStateRef, reducedMotion = false }) => {
  const planetRef = useRef<THREE.Group>(null);
  const scroll = useScroll();
  const { size } = useThree();
  const springRef = useRef({ scale: 0, velocity: 0 });
  // Cube bounding radius in group-local units, measured once from the glb.
  const localRadiusRef = useRef(0);
  const dragRef = useRef({
    dragging: false,
    touch: false,
    pointerId: -1,
    lastX: 0,
    lastY: 0,
    lastT: 0,
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

  // Window-level move/up so a drag survives leaving the cube's raycast area.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d.dragging || e.pointerId !== d.pointerId) return;
      const now = performance.now();
      const dt = Math.max((now - d.lastT) / 1000, 1e-3);
      const dx = e.clientX - d.lastX;
      const dy = e.clientY - d.lastY;
      d.pendingYaw += dx * DRAG_RAD_PER_PX;
      d.pendingPitch += dy * DRAG_RAD_PER_PX;
      // Smoothed instantaneous velocity — this is the momentum a flick leaves.
      d.vy = THREE.MathUtils.lerp(d.vy, (dx * DRAG_RAD_PER_PX) / dt, 0.35);
      d.vx = THREE.MathUtils.lerp(d.vx, (dy * DRAG_RAD_PER_PX) / dt, 0.35);
      d.lastX = e.clientX;
      d.lastY = e.clientY;
      d.lastT = now;
    };
    const onUp = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d.dragging || e.pointerId !== d.pointerId) return;
      d.dragging = false;
      setGrabCursor(d.hovered ? "grab" : "default");
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

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

      // ---- spin: drag follows the pointer; release keeps the flick's
      // momentum and decays back into the idle autospin ---------------------
      const d = dragRef.current;
      if (d.dragging) {
        planetRef.current.rotation.y += d.pendingYaw;
        planetRef.current.rotation.x += d.pendingPitch;
        d.pendingYaw = 0;
        d.pendingPitch = 0;
      } else {
        d.vx = THREE.MathUtils.clamp(d.vx, -MAX_SPIN, MAX_SPIN);
        d.vy = THREE.MathUtils.clamp(d.vy, -MAX_SPIN, MAX_SPIN);
        planetRef.current.rotation.y += d.vy * dt;
        planetRef.current.rotation.x += d.vx * dt;
        const decay = Math.exp(-dt * (reducedMotion ? 10.8 : 1.8));
        d.vy = BASE_ROT_Y + (d.vy - BASE_ROT_Y) * decay;
        d.vx = BASE_ROT_X + (d.vx - BASE_ROT_X) * decay;
      }

      if (window.updateStarfield) {
        const zoom = 100 + animatedScale * 100;
        window.updateStarfield(animatedScale, zoom);
      }

      // ---- cube telemetry for the nav bubbles ------------------------------
      // Measure the glb's local bounding radius once it has real size.
      const groupScale = planetRef.current.scale.x;
      if (localRadiusRef.current === 0 && groupScale > 0.05) {
        const box = new THREE.Box3().setFromObject(planetRef.current);
        if (!box.isEmpty()) {
          const sphere = box.getBoundingSphere(new THREE.Sphere());
          if (sphere.radius > 0) {
            localRadiusRef.current = sphere.radius / groupScale;
          }
        }
      }
      cubeStateRef.current.scale = animatedScale;
      cubeStateRef.current.worldRadius = localRadiusRef.current * groupScale;
    }
  });

  function smoothstep(min: number, max: number, value: number) {
    const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
    return x * x * (3 - 2 * x);
  }

  return (
    <group
      ref={planetRef}
      position={[0, 8, 0]}
      scale={[0, 0, 0]}
      onPointerOver={(e) => {
        if (springRef.current.scale < 0.3) return;
        e.stopPropagation();
        dragRef.current.hovered = true;
        if (!dragRef.current.dragging) setGrabCursor("grab");
      }}
      onPointerOut={() => {
        dragRef.current.hovered = false;
        if (!dragRef.current.dragging) setGrabCursor("default");
      }}
      onPointerDown={(e) => {
        if (springRef.current.scale < 0.3) return;
        e.stopPropagation();
        const d = dragRef.current;
        d.dragging = true;
        d.touch = e.pointerType === "touch";
        d.pointerId = e.pointerId;
        d.lastX = e.clientX;
        d.lastY = e.clientY;
        d.lastT = performance.now();
        d.vx = 0;
        d.vy = 0;
        setGrabCursor("grabbing");
      }}
    >
      <MnetCube />
      <pointLight intensity={500} distance={50} color="#ffffff" />
      <pointLight position={[2, 2, 2]} intensity={200} color="#0033ff" />
    </group>
  );
};

export default Planet;
