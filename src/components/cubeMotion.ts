import * as THREE from "three";

/** One complete intro rotation around a stable diagonal axis. */
export const CUBE_SPIN_AXIS = new THREE.Vector3(0.35, 1, 0.18).normalize();
export const CUBE_SPIN_DURATION = 2.4;

/**
 * Constant slow turntable spin (rad/s) the cube keeps once it has settled, so
 * it's always gently rotating. ~0.2 rad/s ≈ one full turn every ~31s. Any
 * drag-flick momentum decays back onto this baseline.
 */
export const CUBE_IDLE_SPIN = 0.2;

export function cubeSpinEase(progress: number) {
  const t = THREE.MathUtils.clamp(progress, 0, 1);
  // Quintic smootherstep gives the spin zero angular velocity at both ends.
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export type CubeRevealPhase = "waiting" | "spin" | "idle";

export interface CubeRevealState {
  phase: CubeRevealPhase;
  elapsed: number;
  spinFrom: THREE.Quaternion;
}

export function createCubeRevealState(initialPhase: CubeRevealPhase = "waiting"): CubeRevealState {
  return {
    phase: initialPhase,
    elapsed: 0,
    spinFrom: new THREE.Quaternion(),
  };
}
