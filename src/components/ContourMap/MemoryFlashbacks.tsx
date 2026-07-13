"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll, Html } from "@react-three/drei";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import type { PerformanceConfig } from "./usePerformanceTier";

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

const STIFFNESS = 2.2; // spring constant toward the anchor — heavy, slow wax
const DAMPING = 1.1; // < critical (2*sqrt(k)≈3.0) → slow jelly overshoot
const MAX_SPEED = 18; // world units/s, prevents tunneling
const FLASH_INTERVAL = 0.5; // s between page flips while hovered
const BURST_DURATION = 0.25; // s of glitch per flip

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
const _camRight = new THREE.Vector3();
const _camUp = new THREE.Vector3();

// Shared wax-feel constants — tuned for heavy, gooey lava-lamp bloblets.
const WAX_RESTITUTION = 0.2; // wax barely bounces, it deforms
const WAX_MAX_DEFORM = 0.3; // cap squash/stretch so wax never goes taffy
const WAX_SQUASH_FACTOR = 0.65; // contact overlap → compression amount
const WAX_SQUASH_DECAY = 1.6; // per-second squash relaxation

interface WaxBody {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  radius: number;
  deform: THREE.Vector3;
  deformS: number;
  deformAxis: THREE.Vector2;
  squashAmt: number;
  squashAxis: THREE.Vector2;
}

const _nrm = new THREE.Vector3();
const _relVel = new THREE.Vector3();

function collideWax(bodies: WaxBody[], camRight: THREE.Vector3, camUp: THREE.Vector3, minRadius = 0.3) {
  for (let i = 0; i < bodies.length; i++) {
    const a = bodies[i];
    if (a.radius < minRadius) continue;
    for (let j = i + 1; j < bodies.length; j++) {
      const b = bodies[j];
      if (b.radius < minRadius) continue;
      _nrm.copy(a.pos).sub(b.pos);
      const dist = _nrm.length();
      const rSum = a.radius + b.radius;
      if (dist >= rSum || dist < 1e-4) continue;
      _nrm.multiplyScalar(1 / dist);
      const overlap = rSum - dist;

      // Soft positional separation — wax gives before it bounces
      a.pos.addScaledVector(_nrm, overlap * 0.3);
      b.pos.addScaledVector(_nrm, -overlap * 0.3);

      _relVel.copy(a.vel).sub(b.vel);
      const vn = _relVel.dot(_nrm);
      if (vn < 0) {
        const jImp = -(1 + WAX_RESTITUTION) * vn * 0.5; // equal masses
        a.vel.addScaledVector(_nrm, jImp);
        b.vel.addScaledVector(_nrm, -jImp);
      }

      // Record contact squash along the normal, projected to screen plane
      const amt = Math.min(overlap / (rSum * 0.5), 1);
      const ax = _nrm.dot(camRight);
      const ay = _nrm.dot(camUp);
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
}

function decayWaxSquash(body: WaxBody, dt: number) {
  body.squashAmt = Math.max(0, body.squashAmt - dt * WAX_SQUASH_DECAY);
}

function updateWaxDeform(
  body: WaxBody,
  camRight: THREE.Vector3,
  camUp: THREE.Vector3,
  stretchThreshold = 0.4,
  stretchGain = 0.06
) {
  const vx = body.vel.dot(camRight);
  const vy = body.vel.dot(camUp);
  const sp = Math.hypot(vx, vy);
  let targetS = 1;
  if (body.squashAmt > 0.02) {
    // Collision: compress along the contact normal
    targetS = 1 - Math.min(body.squashAmt * WAX_SQUASH_FACTOR, WAX_MAX_DEFORM);
    body.deformAxis.set(body.squashAxis.x, body.squashAxis.y);
  } else if (sp > stretchThreshold) {
    // Motion: stretch along the velocity, teardrop-style
    targetS = 1 + Math.min((sp - stretchThreshold) * stretchGain, WAX_MAX_DEFORM);
    body.deformAxis.set(vx / sp, vy / sp);
  }
  // Fast attack on impact, slow gooey relax back to round
  const rate = Math.abs(targetS - 1) > Math.abs(body.deformS - 1) ? 0.45 : 0.05;
  body.deformS += (targetS - body.deformS) * rate;

  const sS = THREE.MathUtils.clamp(
    body.deformS,
    1 - WAX_MAX_DEFORM,
    1 + WAX_MAX_DEFORM
  );
  const p = 1 / sS;
  const q = sS;
  const ux = body.deformAxis.x;
  const uy = body.deformAxis.y;
  body.deform.set(
    p * ux * ux + q * uy * uy,
    p * uy * uy + q * ux * ux,
    (p - q) * ux * uy
  );
}

interface NavPage {
  route: string;
  label: string;
  image: string;
}

const NAV_PAGES: NavPage[] = [
  { route: "/about-us", label: "ABOUT US", image: "/img/Nav-About-Temp.JPG" },
  { route: "/portfolios", label: "PORTFOLIO", image: "/img/Nav-Projects.png" },
  { route: "/outreach", label: "OUTREACH", image: "/img/Nav-Events.JPG" },
  {
    route: "/collaborators",
    label: "COLLABORATORS",
    image: "/img/facilities/mixed-reality-studio.jpg",
  },
];

const setLinkCursor = (on: boolean) => {
  window.dispatchEvent(
    new CustomEvent("mnet:cursor", { detail: on ? "link" : "" })
  );
  document.body.style.cursor = on ? "pointer" : "";
};

const MNET_BLOB_COLORS = {
  colorA: "#030CAB",
  colorB: "#DC003B",
  rim: "#FFFFFF",
  ink: "#0B0B0B",
} as const;

const lavaBlobVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const lavaBlobFragmentShader = /* glsl */ `
  uniform sampler2D uTexA;
  uniform sampler2D uTexB;
  uniform float uAspectA;
  uniform float uAspectB;
  uniform float uMix;
  uniform float uTime;
  uniform float uOpacity;
  uniform float uHover;
  uniform float uGlitch;
  uniform float uPhase;
  uniform float uWobbleAmp;
  uniform float uRestPhoto;
  uniform float uHasPhoto;
  uniform vec3 uInkColor;
  uniform float uContourStrength;
  uniform float uRimStrength;
  uniform float uGlowStrength;
  uniform vec3 uDeform;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uRimColor;
  varying vec2 vUv;

  float hash(float n) { return fract(sin(n) * 43758.5453123); }

  float hash2(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float noise2(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash2(i);
    float b = hash2(i + vec2(1.0, 0.0));
    float c = hash2(i + vec2(0.0, 1.0));
    float d = hash2(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  // object-fit: cover in GLSL
  vec2 coverUv(vec2 uv, float aspect) {
    float a = max(0.01, aspect);
    vec2 t = uv;
    if (a > 1.0) {
      t.x = (uv.x - 0.5) / a + 0.5;
    } else {
      t.y = (uv.y - 0.5) * a + 0.5;
    }
    return t;
  }

  void main() {
    mat2 deform = mat2(uDeform.x, uDeform.z, uDeform.z, uDeform.y);
    vec2 c = deform * (vUv - 0.5);
    float ang = atan(c.y, c.x);
    float dist = length(c);

    vec2 rimP = vec2(cos(ang), sin(ang));
    float organic = noise2(rimP * 1.6 + uPhase * 7.0 + uTime * 0.09)
                  + 0.5 * noise2(rimP * 3.2 - uPhase * 3.0 - uTime * 0.13);
    organic = organic / 1.5 * 2.0 - 1.0;
    float lobes = 0.75 * sin(ang * 2.0 + uTime * 0.17 + uPhase * 6.2831)
                + 0.25 * sin(ang * 3.0 - uTime * 0.26 + uPhase * 12.566);
    float morph = 0.45 * organic + 0.55 * lobes;
    float tearAng = uTime * 0.07 + uPhase * 6.2831;
    float tearGate = smoothstep(0.1, 0.9, 0.5 + 0.5 * sin(uTime * 0.11 + uPhase * 3.0));
    morph += 0.35 * tearGate * cos(ang - tearAng);
    morph = clamp(morph, -1.35, 1.35);
    float breathe = 1.0 + 0.04 * sin(uTime * 0.30 + uPhase * 6.2831)
                          * smoothstep(0.0, 0.02, uWobbleAmp);
    float radius = 0.30 * breathe * (1.0 + uWobbleAmp * morph);
    float d = dist - radius;

    if (d > 0.085) {
      discard;
    }

    float edgeW = max(fwidth(d) * 1.5, 0.002);
    float body = 1.0 - smoothstep(-edgeW, edgeW, d);

    float dn = clamp(dist / radius, 0.0, 1.0);
    float z = sqrt(max(0.0, 1.0 - dn * dn));
    vec2 dir = dist > 0.0001 ? c / dist : vec2(0.0);
    vec3 n = normalize(vec3(dir * dn, max(z, 0.001)));

    float sphereDist = asin(dn) / 1.5707963;
    vec2 sphereUv = vec2(0.5) + dir * radius * sphereDist;
    sphereUv += (noise2(sphereUv * 3.0 + uPhase * 11.0 + uTime * 0.1) - 0.5)
                * 0.03 * (1.0 - uHover * 0.8) * smoothstep(0.0, 0.02, uWobbleAmp);

    vec2 guv = sphereUv;
    float band = floor(vUv.y * 14.0);
    float seed = floor(uTime * 20.0);
    if (uGlitch > 0.03) {
      if (hash(band * 91.7 + seed) < 0.35 + 0.3 * uGlitch) {
        guv.x += (hash(band + seed * 1.3) - 0.5) * 0.12 * uGlitch;
      }
      float tj = floor(uTime * 15.0);
      guv += (vec2(hash(tj), hash(tj + 7.0)) - 0.5) * 0.02 * uGlitch;
    }

    float m = clamp(uMix + (hash(band * 3.7 + uPhase * 17.0) - 0.5) * uGlitch, 0.0, 1.0);
    float sel = step(0.5, m);

    vec2 ca = vec2(0.014, 0.006) * uGlitch * (1.0 + (1.0 - z) * 0.5);
    vec2 uvA = coverUv(guv, uAspectA);
    vec2 uvB = coverUv(guv, uAspectB);
    vec3 texA = vec3(
      texture2D(uTexA, uvA + ca).r,
      texture2D(uTexA, uvA).g,
      texture2D(uTexA, uvA - ca).b
    );
    vec3 texB = vec3(
      texture2D(uTexB, uvB + ca).r,
      texture2D(uTexB, uvB).g,
      texture2D(uTexB, uvB - ca).b
    );
    vec3 photo = mix(texA, texB, sel);

    vec3 bodyCol = uInkColor * mix(0.55, 1.1, z);

    float luma = dot(photo, vec3(0.299, 0.587, 0.114));
    vec3 ghost = mix(bodyCol * 0.35, mix(bodyCol, vec3(1.0), 0.75),
                     smoothstep(0.0, 1.0, luma));
    vec3 interior = mix(ghost, photo, uHover);
    float photoAmt = mix(uRestPhoto, 1.0, uHover) * uHasPhoto;
    vec3 col = mix(bodyCol, interior, photoAmt);

    vec2 contourUv = sphereUv * 6.5 + vec2(uPhase * 3.7, uPhase * 1.3);
    float elevation = noise2(contourUv * 0.6 + uTime * 0.1) * 2.5
                    + noise2(contourUv * 1.6 - uTime * 0.05) * 0.8;
    float cVal = elevation * 3.0;
    float cf = fract(cVal);
    float cdf = fwidth(cVal);
    float cLine = smoothstep(cdf * 1.4, 0.0, abs(cf - 0.5));
    float cGlow = smoothstep(2.2, 0.0, abs(cf - 0.5) / cdf) * 0.35;
    vec3 contourLineColor = mix(uColorA, uColorB, clamp(elevation / 3.0, 0.0, 1.0));
    col += contourLineColor * (cLine + cGlow)
         * uContourStrength * (1.0 + 0.5 * uGlowStrength)
         * (1.0 - photoAmt * 0.7) * mix(0.7, 1.0, z);

    float outline = 1.0 - smoothstep(0.0, edgeW * 3.0, abs(d));
    col += contourLineColor * outline * (0.9 + 0.5 * uHover);

    col += uRimColor * pow(1.0 - z, 3.0) * uRimStrength;
    col += contourLineColor * pow(1.0 - z, 1.5) * 0.5 * uGlowStrength;

    float bodyAlpha = mix(0.88, 0.97, uHover);
    float haloFall = mix(45.0, 30.0, uGlowStrength);
    float haloAmp = 0.25 + 0.75 * uGlowStrength;
    float halo = exp(-max(d, 0.0) * haloFall) * haloAmp;
    vec3 outCol = mix(contourLineColor, col, body);
    float alpha = uOpacity * (body * bodyAlpha + (1.0 - body) * halo);

    gl_FragColor = vec4(outCol, alpha);
  }
`;

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
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const scroll = useScroll();

  const [hovered, setHovered] = useState(false);
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

  // If the orb unmounts mid-hover (e.g. navigation), release the cursor.
  useEffect(() => {
    return () => {
      if (prevHoveredRef.current) setLinkCursor(false);
    };
  }, []);

  const uniforms = useMemo(() => {
    return {
      uTexA: { value: textures[assignedPage] },
      uTexB: { value: textures[assignedPage] },
      uAspectA: { value: aspects[assignedPage] },
      uAspectB: { value: aspects[assignedPage] },
      uMix: { value: 0 },
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uHover: { value: 0 },
      uGlitch: { value: 0 },
      uPhase: { value: phase },
      uWobbleAmp: { value: wobbleAmp },
      uRestPhoto: { value: 0.0 },
      uHasPhoto: { value: 1.0 },
      uInkColor: { value: new THREE.Color(MNET_BLOB_COLORS.ink) },
      uContourStrength: { value: 3.5 },
      uRimStrength: { value: 0.15 },
      uGlowStrength: { value: 0.0 },
      uDeform: { value: new THREE.Vector3(1, 1, 0) },
      uColorA: { value: new THREE.Color(MNET_BLOB_COLORS.colorA) },
      uColorB: { value: new THREE.Color(MNET_BLOB_COLORS.colorB) },
      uRimColor: { value: new THREE.Color(MNET_BLOB_COLORS.rim) },
    };
  }, [textures, aspects, assignedPage, phase, wobbleAmp]);

  useFrame((state) => {
    const mesh = meshRef.current;
    const mat = materialRef.current;
    if (!mesh || !mat) return;

    const time = state.clock.elapsedTime;
    const scrollOffset = scroll.offset;

    // Camera current distance along path
    const d_cam = 20 + scrollOffset * 100;
    const distInFront = d_cam - sim.pathDist;

    // Proximity-based opacity as the camera flies past
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

    // Report back to the sim: world radius and hover state.
    sim.radius = mesh.scale.x * 1.5 * 0.32;
    sim.hovered = hovered;

    // ---- hover flash state machine ----------------------------------------
    const f = flashRef.current;
    if (!reducedMotion) {
      if (hovered && !prevHoveredRef.current) {
        f.nextAt = time + FLASH_INTERVAL;
      }
      if (!hovered) {
        f.nextAt = Infinity;
        // Revert to the assigned page so the blob's identity is stable between hovers.
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
    mat.uniforms.uGlowStrength.value = THREE.MathUtils.lerp(
      mat.uniforms.uGlowStrength.value,
      hovered ? 1.0 : 0.0,
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
      <shaderMaterial
        ref={materialRef}
        vertexShader={lavaBlobVertexShader}
        fragmentShader={lavaBlobFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
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
  flashbackUrls?: string[];
  perf?: PerformanceConfig;
  onNavigate?: (route: string) => void;
}

const MemoryFlashbacks: React.FC<MemoryFlashbacksProps> = ({
  perf,
  onNavigate,
}) => {
  const router = useRouter();
  const navigate = onNavigate || ((route) => {
    // Dispatch/trigger clicking behavior to activate setLeaving(true) in ContourMap
    const anchor = document.createElement("a");
    anchor.href = route;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    router.push(route);
  });

  const tier = perf?.tier || "mid";
  const flashbackCount = perf?.flashbackCount ?? (tier === "high" ? 16 : tier === "mid" ? 12 : 8);
  const blobWobbleAmp = perf?.blobWobbleAmp ?? (tier === "low" ? 0.10 : 0.16);
  const reducedMotion = perf?.reducedMotion ?? false;

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

  const [textures, setTextures] = useState<THREE.Texture[]>([]);
  const [aspects, setAspects] = useState<number[]>([]);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    let active = true;

    const loadedTexs: THREE.Texture[] = [];
    const loadedAspects: number[] = [];
    let loadedCount = 0;

    NAV_PAGES.forEach((page, i) => {
      loader.load(
        page.image,
        (tex) => {
          if (!active) return;
          tex.minFilter = THREE.LinearFilter;
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.needsUpdate = true;
          const img = tex.image;
          const w = img ? (img.naturalWidth || img.width || 0) : 0;
          const h = img ? (img.naturalHeight || img.height || 0) : 0;
          const aspect = w > 0 && h > 0 ? w / h : 1.0;

          loadedTexs[i] = tex;
          loadedAspects[i] = aspect;
          loadedCount++;

          if (loadedCount === NAV_PAGES.length) {
            setTextures([...loadedTexs]);
            setAspects([...loadedAspects]);
          }
        },
        undefined,
        (err) => {
          console.error("Error loading page texture:", page.image, err);
          if (!active) return;
          const dummyTex = new THREE.Texture();
          loadedTexs[i] = dummyTex;
          loadedAspects[i] = 1.0;
          loadedCount++;
          if (loadedCount === NAV_PAGES.length) {
            setTextures([...loadedTexs]);
            setAspects([...loadedAspects]);
          }
        }
      );
    });

    return () => {
      active = false;
    };
  }, []);

  // Layout slots along the camera path
  const layouts = useMemo(() => {
    const count = flashbackCount;
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
  }, [flashbackCount, isMobile]);

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
          convAmp: 0.8 + Math.random() * 0.6,
          impulseGain: 0.7 + Math.random() * 0.6, // ±30% Jitter
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

  // The lava-lamp sim. Priority -1 so blob positions are settled before the orbs' own frames read them.
  useFrame((state, delta) => {
    if (textures.length < NAV_PAGES.length || aspects.length < NAV_PAGES.length) return;

    if (reducedMotion) {
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

      // Fast scrolling slings blobs along the path
      s.vel.addScaledVector(
        PATH_DIR,
        shove * s.impulseGain * (s.hovered ? 0.5 : 1)
      );

      // Underdamped spring back to the anchor
      _force.copy(s.anchor).sub(s.pos).multiplyScalar(STIFFNESS);
      _force.addScaledVector(s.vel, -DAMPING);
      s.vel.addScaledVector(_force, dt);
      const speed = s.vel.length();
      if (speed > MAX_SPEED) s.vel.multiplyScalar(MAX_SPEED / speed);
      s.pos.addScaledVector(s.vel, dt);

      decayWaxSquash(s, dt);
    }

    // Pairwise wax collisions, then squash/stretch
    collideWax(sims, _camRight, _camUp);
    for (const s of sims) {
      updateWaxDeform(s, _camRight, _camUp);
    }
  }, -1);

  if (textures.length < NAV_PAGES.length || aspects.length < NAV_PAGES.length) {
    return null;
  }

  const wobbleAmp = reducedMotion ? 0 : blobWobbleAmp;

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
          reducedMotion={reducedMotion}
          onNavigate={navigate}
        />
      ))}
    </group>
  );
};

export default MemoryFlashbacks;
