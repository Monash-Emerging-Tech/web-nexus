# ContourMap — Adaptive Performance System

## Overview

The ContourMap now benchmarks the client device on mount and selects one of three performance tiers (`low` / `mid` / `high`). Each tier tunes **7 rendering parameters** so low-end devices get a smooth experience while high-end ones keep full visual fidelity.

## Files Changed

| File | Change |
|---|---|
| [usePerformanceTier.ts](file:///Users/lucidmach/Monash/MNET/web-nexus/src/components/ContourMap/usePerformanceTier.ts) | **New** — hook that benchmarks & returns config |
| [Shaders.ts](file:///Users/lucidmach/Monash/MNET/web-nexus/src/components/ContourMap/Shaders.ts) | Added `uContourFrequency` uniform (was hardcoded `14.0`) |
| [Experience.tsx](file:///Users/lucidmach/Monash/MNET/web-nexus/src/components/ContourMap/Experience.tsx) | Accepts `perf` prop; tier-driven segments, shake, lerp, speed lines |
| [index.tsx](file:///Users/lucidmach/Monash/MNET/web-nexus/src/components/ContourMap/index.tsx) | Calls hook; threads config into Canvas & children |

## Tier Matrix

| Parameter | Low | Mid | High |
|---|---|---|---|
| Terrain segments | 64×64 | 128×128 | 256×256 |
| Speed lines | 60 | 120 | 200 |
| DPR | `[1, 1]` | `[1, 1.5]` | `[1, 2]` |
| Antialias | ✗ | ✓ | ✓ |
| Camera shake | ✗ | ✓ | ✓ |
| Contour frequency | 8 | 12 | 14 |
| Environment HDR | ✗ | ✓ | ✓ |
| Scroll damping | 0.15 | 0.1 | 0.1 |

## Benchmarking Heuristics (scored cumulatively)

1. **Hardware concurrency** — `navigator.hardwareConcurrency`
2. **Device memory** — `navigator.deviceMemory` (Chromium only)
3. **Screen pixel count** — width × height × devicePixelRatio
4. **Mobile UA / touch** — penalises phones & tablets
5. **GPU renderer string** — `WEBGL_debug_renderer_info` (RTX → bonus, Intel HD → penalty)
6. **Compute microbenchmark** — 500K sin/cos iterations, timed < 5ms → fast

> [!TIP]
> In development, check the console for `[ContourMap] Performance tier: HIGH` to see what tier was selected.
