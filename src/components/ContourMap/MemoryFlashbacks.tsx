"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll, useTexture, Html } from "@react-three/drei";
import * as THREE from "three";
import { NAV_PAGES } from "./navPages";
import type { PerformanceConfig } from "./usePerformanceTier";
import "../LavaBlob/LavaBlobMaterial";
import type { LavaBlobMaterialImpl } from "../LavaBlob/LavaBlobMaterial";

// Start fetching the four page images as soon as the home bundle loads so
// hover flashing never hits an unloaded frame.
NAV_PAGES.forEach((p) => useTexture.preload(p.image));

// Camera path basis — must stay in sync with CameraHandler / Terrain tilt.
const MAP_ANGLE = -Math.PI / 2.5;
const NY = -Math.sin(MAP_ANGLE); // ~0.951
const NZ = Math.cos(MAP_ANGLE); // ~0.309
const PATH_DIR = new THREE.Vector3(0, NY, NZ); // unit length by construction

// ---------------------------------------------------------------------------
// Lava-lamp physics
// ---------------------------------------------------------------------------
// Each blob is a point mass on an underdamped spring anchored to its layout
// slot. Fast scrolling shoves blobs along the camera path so they collide,
// squash, and snap back like wax bloblets in a real lamp.

const STIFFNESS = 4.5; // spring constant toward the anchor
const DAMPING = 2.0; // < critical (2*sqrt(k)≈4.2) → jelly overshoot
const RESTITUTION = 0.35; // squishy wax, not billiard balls
const MAX_SPEED = 18; // world units/s, prevents tunneling
const MAX_DEFORM = 0.22; // cap squash/stretch so blobs stay wax, not taffy
const FLASH_INTERVAL = 1.0; // s between page flips while hovered
const BURST_DURATION = 0.35; // s of glitch per flip

interface BlobSim {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  anchor: THREE.Vector3;
  home: THREE.Vector3;
  phase: number;
  convSpeed: number; // buoyant convection cycle (rad/s)
  convAmp: number; // convection amplitude (world units)
  impulseGain: number; // per-blob scroll shove multiplier
  radius: number; // current world radius, written back by the orb
  hovered: boolean; // written back by the orb
  pathDist: number;
  deform: THREE.Vector3; // packed symmetric sampling matrix (m00, m11, m01)
  deformS: number;
  deformAxis: THREE.Vector2;
  squashAmt: number;
  squashAxis: THREE.Vector2;
}

// Pre-allocated scratch — the sim runs single-threaded inside one useFrame.
const _force = new THREE.Vector3();
const _nrm = new THREE.Vector3();
const _relVel = new THREE.Vector3();
const _camRight = new THREE.Vector3();
const _camUp = new THREE.Vector3();

// ---------------------------------------------------------------------------
// FlashbackOrb — one lava blob bound to a page of the site
// ---------------------------------------------------------------------------

interface FlashbackOrbProps {
  sim: BlobSim;
  textures: THREE.Texture[];
  aspects: number[];
  assignedPage: number;
  isMobile: boolean;
  wobbleAmp: number;
  reducedMotion: boolean;
  onNavigate: (route: string) => void;
}

const FlashbackOrb: React.FC<FlashbackOrbProps> = ({
  sim,
  textures,
  aspects,
  assignedPage,
  isMobile,
  wobbleAmp,
  reducedMotion,
  onNavigate,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<LavaBlobMaterialImpl>(null);
  const scroll = useScroll();

  const [hovered, setHovered] = useState(false);
  // Mirrors pageRef for the hover label; updated at most once per second.
  const [labelPage, setLabelPage] = useState(assignedPage);

  const pageRef = useRef(assignedPage);
  const flashRef = useRef({
    nextAt: Infinity,
    burstStart: -1,
    to: assignedPage,
  });
  const prevHoveredRef = useRef(false);
  const idleGlitchRef = useRef(0);
  const lerpScaleTarget = useRef(new THREE.Vector3());

  const phase = sim.phase;

  const setLinkCursor = (on: boolean) => {
    window.dispatchEvent(
      new CustomEvent("mnet:cursor", { detail: on ? "link" : "" })
    );
    document.body.style.cursor = on ? "pointer" : "";
  };

  // If the orb unmounts mid-hover (e.g. navigation), release the cursor.
  useEffect(() => {
    return () => {
      if (prevHoveredRef.current) setLinkCursor(false);
    };
  }, []);

  useFrame((state) => {
    const mesh = meshRef.current;
    const mat = materialRef.current;
    if (!mesh || !mat) return;

    const time = state.clock.elapsedTime;
    const scrollOffset = scroll.offset;

    // Camera current distance along path
    const d_cam = 20 + scrollOffset * 100;
    const distInFront = d_cam - sim.pathDist;

    // Proximity-based opacity as the camera flies past (unchanged behavior)
    let opacity = 0;
    if (distInFront >= -5 && distInFront < 5) {
      const t = Math.max(0.0, Math.min(1.0, (distInFront + 5) / 10));
      opacity = t * t * (3.0 - 2.0 * t);
    } else if (distInFront >= 5 && distInFront < 45) {
      opacity = 1.0;
    } else if (distInFront >= 45 && distInFront < 65) {
      const t = Math.max(0.0, Math.min(1.0, (65 - distInFront) / 20));
      opacity = t * t * (3.0 - 2.0 * t);
    }

    // Hide at start (Hero overlay) and end (Cube navigation focus)
    if (scrollOffset < 0.1) {
      opacity *= Math.max(0, (scrollOffset - 0.02) / 0.06);
    }
    const mapFade = (() => {
      const x = Math.max(0, Math.min(1, (scrollOffset - 0.8) / (0.2 - 0.8)));
      return x * x * (3 - 2 * x);
    })();
    opacity *= mapFade;

    // Position comes straight from the physics sim
    mesh.position.copy(sim.pos);
    mesh.lookAt(state.camera.position);
    mesh.rotation.z = Math.sin(time * 0.3 + phase) * 0.08;

    // Scale with opacity and hover
    const targetBaseScale = isMobile
      ? hovered
        ? 1.9
        : 1.45
      : hovered
        ? 4.9
        : 3.9;
    lerpScaleTarget.current.setScalar(targetBaseScale * opacity);
    mesh.scale.lerp(lerpScaleTarget.current, 0.12);
    mesh.visible = opacity > 0.001;

    // Report back to the sim: world radius (quad is 1.5 units, silhouette
    // ≈0.36 of it with breathing/morph averaged in) and hover state.
    sim.radius = mesh.scale.x * 1.5 * 0.36;
    sim.hovered = hovered;

    // ---- hover flash state machine (all clock-driven, freezes with the
    // frameloop; no timers) ------------------------------------------------
    const f = flashRef.current;
    if (!reducedMotion) {
      if (hovered && !prevHoveredRef.current) {
        f.nextAt = time + FLASH_INTERVAL;
      }
      if (!hovered) {
        f.nextAt = Infinity;
        // Revert to the assigned page so the blob's identity is stable
        // between hovers.
        if (pageRef.current !== assignedPage && f.burstStart < 0) {
          f.to = assignedPage;
          mat.uniforms.uTexA.value = textures[pageRef.current];
          mat.uniforms.uAspectA.value = aspects[pageRef.current];
          mat.uniforms.uTexB.value = textures[assignedPage];
          mat.uniforms.uAspectB.value = aspects[assignedPage];
          pageRef.current = assignedPage;
          setLabelPage(assignedPage);
          f.burstStart = time;
        }
      } else if (time >= f.nextAt) {
        // Slot-machine flip to a guaranteed-different page
        const next =
          (pageRef.current +
            1 +
            Math.floor(Math.random() * (NAV_PAGES.length - 1))) %
          NAV_PAGES.length;
        f.to = next;
        mat.uniforms.uTexA.value = textures[pageRef.current];
        mat.uniforms.uAspectA.value = aspects[pageRef.current];
        mat.uniforms.uTexB.value = textures[next];
        mat.uniforms.uAspectB.value = aspects[next];
        pageRef.current = next;
        setLabelPage(next);
        f.burstStart = time;
        f.nextAt = time + FLASH_INTERVAL;
      }
    }
    prevHoveredRef.current = hovered;

    let glitchBurst = 0;
    if (f.burstStart >= 0) {
      const bt = (time - f.burstStart) / BURST_DURATION;
      if (bt >= 1) {
        mat.uniforms.uTexA.value = textures[f.to];
        mat.uniforms.uAspectA.value = aspects[f.to];
        mat.uniforms.uMix.value = 0;
        f.burstStart = -1;
      } else {
        glitchBurst = 1 - bt;
        mat.uniforms.uMix.value = THREE.MathUtils.smoothstep(bt, 0, 0.6);
      }
    }

    // ---- uniforms ---------------------------------------------------------
    // Reduced motion: freeze shader time so the wax sits still.
    mat.uniforms.uTime.value = reducedMotion ? phase * 10 : time;
    mat.uniforms.uHover.value = THREE.MathUtils.lerp(
      mat.uniforms.uHover.value,
      hovered ? 1.0 : 0.0,
      0.15
    );
    mat.uniforms.uOpacity.value = THREE.MathUtils.lerp(
      mat.uniforms.uOpacity.value,
      opacity,
      0.15
    );
    (mat.uniforms.uDeform.value as THREE.Vector3).copy(sim.deform);

    // Subtle idle glitch driven by scroll speed; bursts override it.
    const idleTarget = reducedMotion
      ? 0
      : hovered
        ? 0
        : Math.min(Math.abs(scroll.delta) * 5.0 + 0.04, 1);
    idleGlitchRef.current = THREE.MathUtils.lerp(
      idleGlitchRef.current,
      idleTarget,
      0.06
    );
    mat.uniforms.uGlitch.value = Math.max(idleGlitchRef.current, glitchBurst);
  });

  return (
    <mesh
      ref={meshRef}
      position={sim.home.toArray()}
      scale={[0, 0, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        setLinkCursor(true);
      }}
      onPointerOut={() => {
        setHovered(false);
        setLinkCursor(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
        setLinkCursor(false);
        onNavigate(NAV_PAGES[pageRef.current].route);
      }}
    >
      <planeGeometry args={[1.5, 1.5]} />
      <lavaBlobMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        uPhase={phase}
        uWobbleAmp={wobbleAmp}
        uHasPhoto={1}
        uTexA={textures[assignedPage]}
        uTexB={textures[assignedPage]}
        uAspectA={aspects[assignedPage]}
        uAspectB={aspects[assignedPage]}
      />
      {hovered && (
        <Html
          center
          position={[0, -0.62, 0]}
          zIndexRange={[40, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              fontFamily: "var(--font-offbit, monospace)",
              fontSize: isMobile ? 11 : 14,
              fontWeight: 700,
              letterSpacing: "0.2em",
              whiteSpace: "nowrap",
              color: "#fff",
              textShadow: "0 0 8px rgba(0,0,0,0.9)",
            }}
          >
            {NAV_PAGES[labelPage].label}
          </div>
        </Html>
      )}
    </mesh>
  );
};

// ---------------------------------------------------------------------------
// MemoryFlashbacks — layout, shared textures, and the lava-lamp sim
// ---------------------------------------------------------------------------

interface MemoryFlashbacksProps {
  perf: PerformanceConfig;
  onNavigate: (route: string) => void;
}

const MemoryFlashbacks: React.FC<MemoryFlashbacksProps> = ({
  perf,
  onNavigate,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const scroll = useScroll();
  const lastOffsetRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Four shared page textures for every blob (suspends until loaded).
  const textures = useTexture(NAV_PAGES.map((p) => p.image));
  const aspects = useMemo(
    () =>
      textures.map((tex) => {
        tex.minFilter = THREE.LinearFilter;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        const img = tex.image as
          | { naturalWidth?: number; naturalHeight?: number; width?: number; height?: number }
          | undefined;
        const w = img?.naturalWidth || img?.width || 0;
        const h = img?.naturalHeight || img?.height || 0;
        return w > 0 && h > 0 ? w / h : 1.0;
      }),
    [textures]
  );

  // Layout slots along the camera path — same lanes/scatter as before, with
  // a random page of the site tree assigned to each blob.
  const layouts = useMemo(() => {
    const count = perf.flashbackCount;
    return Array.from({ length: count }, (_, i) => {
      const pathDist = 22 + (i / (count - 1)) * 53;
      const isEven = i % 2 === 0;
      const baseOffset = isMobile ? (isEven ? 4.5 : -4.5) : isEven ? 14.5 : -14.5;
      const offsetX = baseOffset + Math.sin(i * 1.5) * (isMobile ? 1.0 : 2.5);
      const perpMultiplier = isMobile ? 18.0 : 9.0;
      const offsetPerp =
        Math.cos(i * 2.2) * perpMultiplier + Math.sin(i) * (isMobile ? 4.0 : 2.0);
      return {
        index: i,
        pathDist,
        offsetX,
        offsetPerp,
        assignedPage: Math.floor(Math.random() * NAV_PAGES.length),
      };
    });
  }, [perf.flashbackCount, isMobile]);

  const sims = useMemo<BlobSim[]>(
    () =>
      layouts.map((cfg) => {
        const home = new THREE.Vector3(
          cfg.offsetX,
          NY * cfg.pathDist - 5 - NZ * cfg.offsetPerp,
          NZ * cfg.pathDist + NY * cfg.offsetPerp
        );
        return {
          pos: home.clone(),
          vel: new THREE.Vector3(),
          anchor: home.clone(),
          home,
          phase: Math.random() * Math.PI * 2,
          convSpeed: 0.16 + Math.random() * 0.09, // 25–40 s cycles
          convAmp: 0.5 + Math.random() * 0.4,
          impulseGain: 0.7 + Math.random() * 0.6, // ±30% jitter
          radius: 0,
          hovered: false,
          pathDist: cfg.pathDist,
          deform: new THREE.Vector3(1, 1, 0),
          deformS: 1,
          deformAxis: new THREE.Vector2(1, 0),
          squashAmt: 0,
          squashAxis: new THREE.Vector2(1, 0),
        };
      }),
    [layouts]
  );

  // The lava-lamp sim. Priority -1 so blob positions are settled before the
  // orbs' own frames read them (negative priority keeps auto-render on).
  useFrame((state, delta) => {
    if (perf.reducedMotion) {
      for (const s of sims) {
        s.pos.copy(s.home);
        s.vel.set(0, 0, 0);
        s.deform.set(1, 1, 0);
      }
      return;
    }

    const dt = Math.min(delta, 1 / 30);
    const t = state.clock.elapsedTime;
    const offset = scroll.offset;
    const shove = (offset - lastOffsetRef.current) * 100; // world units the camera moved
    lastOffsetRef.current = offset;

    _camRight.setFromMatrixColumn(state.camera.matrixWorld, 0);
    _camUp.setFromMatrixColumn(state.camera.matrixWorld, 1);
    const d_cam = 20 + offset * 100;

    // --- integrate each blob toward its living anchor ---------------------
    for (const s of sims) {
      const distInFront = d_cam - s.pathDist;
      const parallaxFactor = Math.max(0.4, 2.0 - (distInFront / 35.0) * 1.5);
      s.anchor.set(
        s.home.x +
          Math.sin(t * 0.7 + s.phase) * 0.25 +
          state.mouse.x * 0.9 * parallaxFactor,
        s.home.y +
          Math.cos(t * 0.5 + s.phase) * 0.2 +
          // buoyant convection — slow wax circulation
          Math.sin(t * s.convSpeed + s.phase * 2.3) * s.convAmp +
          (s.hovered ? 0.35 : 0) +
          state.mouse.y * 0.9 * parallaxFactor,
        s.home.z + Math.sin(t * 0.4 + s.phase) * 0.15
      );

      // Fast scrolling slings blobs along the path (unevenly, so they meet)
      s.vel.addScaledVector(
        PATH_DIR,
        shove * s.impulseGain * (s.hovered ? 0.5 : 1)
      );

      // Underdamped spring back to the anchor — the jelly snap-back
      _force.copy(s.anchor).sub(s.pos).multiplyScalar(STIFFNESS);
      _force.addScaledVector(s.vel, -DAMPING);
      s.vel.addScaledVector(_force, dt);
      const speed = s.vel.length();
      if (speed > MAX_SPEED) s.vel.multiplyScalar(MAX_SPEED / speed);
      s.pos.addScaledVector(s.vel, dt);

      s.squashAmt = Math.max(0, s.squashAmt - dt * 2.5);
    }

    // --- pairwise wax collisions ------------------------------------------
    for (let i = 0; i < sims.length; i++) {
      const a = sims[i];
      if (a.radius < 0.3) continue; // faded-out blobs don't collide
      for (let j = i + 1; j < sims.length; j++) {
        const b = sims[j];
        if (b.radius < 0.3) continue;
        _nrm.copy(a.pos).sub(b.pos);
        const distC = _nrm.length();
        const rSum = a.radius + b.radius;
        if (distC >= rSum || distC < 1e-4) continue;
        _nrm.multiplyScalar(1 / distC);
        const overlap = rSum - distC;

        // Soft positional separation — wax gives before it bounces
        a.pos.addScaledVector(_nrm, overlap * 0.3);
        b.pos.addScaledVector(_nrm, -overlap * 0.3);

        _relVel.copy(a.vel).sub(b.vel);
        const vn = _relVel.dot(_nrm);
        if (vn < 0) {
          const jImp = -(1 + RESTITUTION) * vn * 0.5; // equal masses
          a.vel.addScaledVector(_nrm, jImp);
          b.vel.addScaledVector(_nrm, -jImp);
        }

        // Record contact squash along the normal, projected to screen plane
        const amt = Math.min(overlap / (rSum * 0.5), 1);
        const ax = _nrm.dot(_camRight);
        const ay = _nrm.dot(_camUp);
        const len2d = Math.hypot(ax, ay);
        if (len2d > 1e-3) {
          if (amt > a.squashAmt) {
            a.squashAmt = amt;
            a.squashAxis.set(ax / len2d, ay / len2d);
          }
          if (amt > b.squashAmt) {
            b.squashAmt = amt;
            b.squashAxis.set(ax / len2d, ay / len2d);
          }
        }
      }
    }

    // --- squash & stretch targets → packed sampling matrices ---------------
    for (const s of sims) {
      const vx = s.vel.dot(_camRight);
      const vy = s.vel.dot(_camUp);
      const sp = Math.hypot(vx, vy);
      let targetS = 1;
      if (s.squashAmt > 0.02) {
        // Collision: compress along the contact normal
        targetS = 1 - Math.min(s.squashAmt * 0.5, MAX_DEFORM);
        s.deformAxis.set(s.squashAxis.x, s.squashAxis.y);
      } else if (sp > 0.6) {
        // Motion: stretch along the velocity, teardrop-style
        targetS = 1 + Math.min((sp - 0.6) * 0.045, MAX_DEFORM);
        s.deformAxis.set(vx / sp, vy / sp);
      }
      // Fast attack on impact, slow relax back to round
      const rate = Math.abs(targetS - 1) > Math.abs(s.deformS - 1) ? 0.35 : 0.08;
      s.deformS += (targetS - s.deformS) * rate;

      // Pack the inverse deformation R·diag(1/s, s)·Rᵀ (volume-preserving)
      const sS = THREE.MathUtils.clamp(s.deformS, 1 - MAX_DEFORM, 1 + MAX_DEFORM);
      const p = 1 / sS;
      const q = sS;
      const ux = s.deformAxis.x;
      const uy = s.deformAxis.y;
      s.deform.set(
        p * ux * ux + q * uy * uy,
        p * uy * uy + q * ux * ux,
        (p - q) * ux * uy
      );
    }
  }, -1);

  const wobbleAmp = perf.reducedMotion ? 0 : perf.blobWobbleAmp;

  return (
    <group>
      {layouts.map((cfg, idx) => (
        <FlashbackOrb
          key={`blob-${cfg.index}`}
          sim={sims[idx]}
          textures={textures}
          aspects={aspects}
          assignedPage={cfg.assignedPage}
          isMobile={isMobile}
          wobbleAmp={wobbleAmp}
          reducedMotion={perf.reducedMotion}
          onNavigate={onNavigate}
        />
      ))}
    </group>
  );
};

export default MemoryFlashbacks;
