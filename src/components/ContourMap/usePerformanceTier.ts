"use client";

import { useState, useEffect } from "react";

export type PerformanceTier = "low" | "mid" | "high";

export interface PerformanceConfig {
  tier: PerformanceTier;
  /** PlaneGeometry segment count (NxN) */
  terrainSegments: number;
  /** Number of speed-line meshes */
  speedLineCount: number;
  /** Device pixel ratio range [min, max] */
  dpr: [number, number];
  /** Enable WebGL antialiasing */
  antialias: boolean;
  /** Enable camera shake during warp */
  cameraShake: boolean;
  /** Mouse-lerp smoothing factor (lower = smoother but laggier) */
  lerpFactor: number;
  /** ScrollControls damping */
  scrollDamping: number;
  /** Enable the <Environment> HDR probe */
  enableEnvironment: boolean;
  /** Contour line frequency in the fragment shader */
  contourFrequency: number;
}

const TIER_CONFIGS: Record<PerformanceTier, PerformanceConfig> = {
  low: {
    tier: "low",
    terrainSegments: 64,
    speedLineCount: 60,
    dpr: [1, 1],
    antialias: false,
    cameraShake: false,
    lerpFactor: 0.2,
    scrollDamping: 0.15,
    enableEnvironment: false,
    contourFrequency: 8.0,
  },
  mid: {
    tier: "mid",
    terrainSegments: 128,
    speedLineCount: 120,
    dpr: [1, 1.5],
    antialias: true,
    cameraShake: true,
    lerpFactor: 0.1,
    scrollDamping: 0.1,
    enableEnvironment: true,
    contourFrequency: 12.0,
  },
  high: {
    tier: "high",
    terrainSegments: 256,
    speedLineCount: 200,
    dpr: [1, 2],
    antialias: true,
    cameraShake: true,
    lerpFactor: 0.1,
    scrollDamping: 0.1,
    enableEnvironment: true,
    contourFrequency: 14.0,
  },
};

/**
 * Gauge client device capability via a battery of lightweight heuristics
 * and return appropriate rendering parameters for the ContourMap.
 */
function detectTier(): PerformanceTier {
  if (typeof window === "undefined") return "mid"; // SSR fallback

  let score = 0; // –N … +N  →  low / mid / high

  // ── 1. Hardware concurrency (logical cores) ──────────────────────
  const cores = navigator.hardwareConcurrency ?? 4;
  if (cores >= 8) score += 2;
  else if (cores >= 4) score += 1;
  else score -= 2;

  // ── 2. Device memory (Chrome/Edge only) ──────────────────────────
  const mem = (navigator as { deviceMemory?: number }).deviceMemory;
  if (mem !== undefined) {
    if (mem >= 8) score += 2;
    else if (mem >= 4) score += 1;
    else score -= 2;
  }

  // ── 3. Screen resolution ─────────────────────────────────────────
  const totalPixels = window.screen.width * window.screen.height * (window.devicePixelRatio || 1);
  if (totalPixels > 4_000_000) score += 1; // Retina / 4K
  else if (totalPixels < 1_500_000) score -= 1; // Low-res / mobile

  // ── 4. Touch / mobile heuristic ──────────────────────────────────
  const isMobile =
    /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ||
    ("ontouchstart" in window && cores <= 4);
  if (isMobile) score -= 2;

  // ── 5. GPU renderer string (WebGL) ──────────────────────────────
  try {
    const cvs = document.createElement("canvas");
    const gl =
      cvs.getContext("webgl2") || cvs.getContext("webgl");
    if (gl) {
      const dbg = gl.getExtension("WEBGL_debug_renderer_info");
      if (dbg) {
        const renderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) as string;
        const lower = renderer.toLowerCase();

        // Known high-end tokens
        if (/rtx|radeon rx (6|7)|apple m[2-9]|apple m\d{2}/i.test(lower)) {
          score += 3;
        } else if (/gtx 10[6-8]|radeon rx 5|apple m1|geforce mx/i.test(lower)) {
          score += 1;
        }
        // Known low-end / integrated
        if (/intel|mali|adreno [3-5]|powervr|swiftshader/i.test(lower)) {
          score -= 2;
        }
      }
    }
  } catch {
    // Canvas / GL not available — leave score as-is
  }

  // ── 6. Quick compute micro-benchmark (< 5 ms) ───────────────────
  try {
    const t0 = performance.now();
    let acc = 0;
    for (let i = 0; i < 500_000; i++) {
      acc += Math.sin(i * 0.001) * Math.cos(i * 0.002);
    }
    const elapsed = performance.now() - t0;
    // Prevent dead-code elimination
    if (acc === Infinity) console.log(acc);

    if (elapsed < 5) score += 2;       // Blazing fast
    else if (elapsed < 15) score += 1; // Decent
    else if (elapsed > 40) score -= 2; // Slow
  } catch {
    // performance.now unavailable
  }

  // ── Map cumulative score → tier ──────────────────────────────────
  if (score >= 4) return "high";
  if (score >= 0) return "mid";
  return "low";
}

/**
 * React hook — runs the benchmark once on mount, memoises the result.
 *
 * During SSR / before hydration the hook defaults to "mid" so the
 * initial shell is usable on any device; the real tier is resolved
 * after the first client-side effect.
 */
export function usePerformanceTier(): PerformanceConfig {
  const [config, setConfig] = useState<PerformanceConfig>(TIER_CONFIGS.mid);

  useEffect(() => {
    const applyTier = () => {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reducedMotion) {
        // Respect the OS-level motion preference: minimal animation work,
        // no camera shake.
        setConfig({
          ...TIER_CONFIGS.low,
          cameraShake: false,
        });
        return;
      }

      const tier = detectTier();
      setConfig(TIER_CONFIGS[tier]);

      if (process.env.NODE_ENV === "development") {
        console.log(
          `%c[ContourMap] Performance tier: ${tier.toUpperCase()}`,
          "color: #0f0; font-weight: bold;"
        );
      }
    };

    applyTier();
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    mql.addEventListener("change", applyTier);
    return () => mql.removeEventListener("change", applyTier);
  }, []);

  return config;
}

export default usePerformanceTier;
