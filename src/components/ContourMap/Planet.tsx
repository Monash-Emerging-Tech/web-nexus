"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useScroll } from "@react-three/drei";
import * as THREE from "three";
import MnetCube from "../MnetCube";
import OrbitingArtifacts from "./OrbitingArtifacts";
import {
  CUBE_IDLE_SPIN,
  CUBE_SPIN_AXIS,
  CUBE_SPIN_DURATION,
  createCubeRevealState,
  cubeSpinEase,
} from "../cubeMotion";

interface PlanetProps {
  overlayRef: React.RefObject<HTMLDivElement | null>;
  onCubeRadiusChange?: (radiusPx: number) => void;
  reducedMotion?: boolean;
}

const DRAG_RAD_PER_PX = 0.008;
const MAX_SPIN = 6; // rad/s flick cap
const _introSpinQuaternion = new THREE.Quaternion();

const setGrabCursor = (state: "grab" | "grabbing" | "default") => {
  window.dispatchEvent(new CustomEvent("mnet:cursor", { detail: state }));
  // Fallback for devices where the custom cursor is inactive.
  document.body.style.cursor = state === "default" ? "" : state;
};

const Planet: React.FC<PlanetProps> = ({ overlayRef, onCubeRadiusChange, reducedMotion = false }) => {
  const planetRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);
  const scroll = useScroll();
  const { size } = useThree();
  const scaleRef = useRef(0);
  const revealRef = useRef(createCubeRevealState());
  const labelsShownRef = useRef(false);
  const lastReportedRadiusRef = useRef(-1);
  const { scene: cubeScene } = useGLTF("/assets/mnetcube.glb");
  const cubeLocalRadius = useMemo(() => {
    return new THREE.Box3()
      .setFromObject(cubeScene)
      .getBoundingSphere(new THREE.Sphere()).radius;
  }, [cubeScene]);
  const dragRef = useRef({
    dragging: false,
    touch: false,
    pointerId: -1,
    lastX: 0,
    lastY: 0,
    lastT: 0,
    pendingYaw: 0,
    pendingPitch: 0,
    vx: 0,
    vy: 0,
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

      // Begin the arrival earlier and ease it across the final section with
      // frame-rate-independent damping instead of a snapping scale change.
      const targetScale = smoothstep(0.48, 0.98, scrollOffset);

      const dt = Math.min(delta, 0.05);
      scaleRef.current = THREE.MathUtils.damp(
        scaleRef.current,
        targetScale,
        reducedMotion ? 8 : 3.6,
        dt,
      );

      const isMobile = size.width < 768;
      const baseScale = isMobile ? 1.3 : 3.4;
      const animatedScale = scaleRef.current;
      planetRef.current.scale.setScalar(animatedScale * baseScale);
      planetRef.current.visible = animatedScale > 0.001;

      planetRef.current.position.y = ny * 80 * animatedScale;
      planetRef.current.position.z = nz * 80 * animatedScale;

      // ---- one complete intro spin, then user-controlled movement only ----
      const d = dragRef.current;
      const reveal = revealRef.current;
      const spin = spinRef.current;

      if (animatedScale <= 0.02) {
        reveal.phase = "waiting";
        reveal.elapsed = 0;
        spin?.quaternion.identity();
      } else if (reveal.phase === "waiting" && spin) {
        d.pendingYaw = 0;
        d.pendingPitch = 0;
        d.vx = 0;
        d.vy = 0;
        if (reducedMotion) {
          reveal.phase = "idle";
        } else {
          reveal.phase = "spin";
          reveal.elapsed = 0;
          reveal.spinFrom.copy(spin.quaternion);
        }
      }

      if (spin && reveal.phase === "spin") {
        reveal.elapsed += dt;
        const progress = Math.min(reveal.elapsed / CUBE_SPIN_DURATION, 1);
        _introSpinQuaternion.setFromAxisAngle(
          CUBE_SPIN_AXIS,
          cubeSpinEase(progress) * Math.PI * 2,
        );
        spin.quaternion
          .copy(reveal.spinFrom)
          .multiply(_introSpinQuaternion);
        if (progress >= 1) {
          reveal.phase = "idle";
          reveal.elapsed = 0;
        }
      } else if (reveal.phase === "idle" && d.dragging) {
        if (spin) {
          spin.rotateY(d.pendingYaw);
          spin.rotateX(d.pendingPitch);
        }
        d.pendingYaw = 0;
        d.pendingPitch = 0;
      } else if (reveal.phase === "idle") {
        d.vx = THREE.MathUtils.clamp(d.vx, -MAX_SPIN, MAX_SPIN);
        d.vy = THREE.MathUtils.clamp(d.vy, -MAX_SPIN, MAX_SPIN);
        // Constant slow turntable spin as the resting state; any drag-flick
        // momentum (d.vy/d.vx) rides on top and decays back onto it.
        const baseSpin = reducedMotion ? 0 : CUBE_IDLE_SPIN;
        if (spin) {
          spin.rotateY(baseSpin * dt + d.vy * dt);
          spin.rotateX(d.vx * dt);
        }
        const decay = Math.exp(-dt * (reducedMotion ? 10.8 : 1.8));
        d.vy *= decay;
        d.vx *= decay;
      }

      if (window.updateStarfield) {
        const zoom = 100 + animatedScale * 100;
        // The starfield "airplanes" ramp in with the cube; keep them faint so
        // the neon lava-lamp backdrop leads the last scene instead of a dense
        // swarm of particles.
        window.updateStarfield(animatedScale * 0.35, zoom);
      }

      // Moon-branch composition: project the cube centre and radius into
      // screen space so its HTML/SVG navigation remains locked to the model.
      const overlay = overlayRef.current;
      if (overlay) {
        const worldPos = state.camera.userData.cubeWorldPos ||
          (state.camera.userData.cubeWorldPos = new THREE.Vector3());
        const projected = state.camera.userData.cubeProjected ||
          (state.camera.userData.cubeProjected = new THREE.Vector3());
        planetRef.current.getWorldPosition(worldPos);
        projected.copy(worldPos).project(state.camera);
        const screenX = (projected.x * 0.5 + 0.5) * size.width;
        const screenY = (-projected.y * 0.5 + 0.5) * size.height;

        if (animatedScale > 0.3 && reveal.phase === "idle") {
          overlay.style.opacity = "1";
          overlay.style.visibility = "visible";
          overlay.style.transform = `translate(${screenX}px, ${screenY}px)`;

          if (!labelsShownRef.current) {
            labelsShownRef.current = true;
            window.dispatchEvent(new CustomEvent("mnet:cube-labels-shown"));
          }

          if (onCubeRadiusChange) {
            const right = state.camera.userData.cubeRight ||
              (state.camera.userData.cubeRight = new THREE.Vector3());
            const edge = state.camera.userData.cubeEdge ||
              (state.camera.userData.cubeEdge = new THREE.Vector3());
            right.setFromMatrixColumn(state.camera.matrixWorld, 0);
            edge.copy(worldPos).addScaledVector(
              right,
              cubeLocalRadius * planetRef.current.scale.x,
            ).project(state.camera);
            const edgeX = (edge.x * 0.5 + 0.5) * size.width;
            const edgeY = (-edge.y * 0.5 + 0.5) * size.height;
            const radius = Math.round(
              Math.hypot(edgeX - screenX, edgeY - screenY) * 2,
            ) / 2;
            if (radius !== lastReportedRadiusRef.current) {
              lastReportedRadiusRef.current = radius;
              onCubeRadiusChange(radius);
            }
          }
        } else {
          overlay.style.opacity = "0";
          overlay.style.visibility = "hidden";
          if (labelsShownRef.current) {
            labelsShownRef.current = false;
            window.dispatchEvent(new CustomEvent("mnet:cube-labels-hidden"));
          }
        }
      }
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
        if (scaleRef.current < 0.3 || revealRef.current.phase !== "idle") return;
        e.stopPropagation();
        dragRef.current.hovered = true;
        if (!dragRef.current.dragging) setGrabCursor("grab");
      }}
      onPointerOut={() => {
        dragRef.current.hovered = false;
        if (!dragRef.current.dragging) setGrabCursor("default");
      }}
      onPointerDown={(e) => {
        if (scaleRef.current < 0.3 || revealRef.current.phase !== "idle") return;
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
      <group ref={spinRef}>
        <MnetCube />
        <pointLight intensity={500} distance={50} color="#ffffff" />
        <pointLight position={[2, 2, 2]} intensity={200} color="#0033ff" />
      </group>
      <OrbitingArtifacts cubeRadius={cubeLocalRadius} />
    </group>
  );
};

export default Planet;
