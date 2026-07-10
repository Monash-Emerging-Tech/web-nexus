import * as THREE from "three";

// Shared wax-feel constants — tuned for heavy, gooey lava-lamp bloblets.
export const WAX_RESTITUTION = 0.2; // wax barely bounces, it deforms
export const WAX_MAX_DEFORM = 0.3; // cap squash/stretch so wax never goes taffy
export const WAX_SQUASH_FACTOR = 0.65; // contact overlap → compression amount
export const WAX_SQUASH_DECAY = 1.6; // per-second squash relaxation

/**
 * Minimal state a body needs to participate in wax collisions and drive the
 * blob shader's packed squash/stretch matrix (uDeform).
 */
export interface WaxBody {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  /** Current world radius; bodies below `minRadius` are skipped. */
  radius: number;
  /** Packed symmetric sampling matrix (m00, m11, m01) for uDeform. */
  deform: THREE.Vector3;
  deformS: number;
  deformAxis: THREE.Vector2;
  squashAmt: number;
  squashAxis: THREE.Vector2;
}

const _nrm = new THREE.Vector3();
const _relVel = new THREE.Vector3();

/**
 * Pairwise soft wax collisions: positional separation, squishy impulse, and
 * contact squash recorded along the collision normal projected onto the
 * camera plane (the billboard plane the deformation lives in).
 */
export function collideWax(
  bodies: WaxBody[],
  camRight: THREE.Vector3,
  camUp: THREE.Vector3,
  minRadius = 0.3
) {
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

/** Relax contact squash; call once per body per frame. */
export function decayWaxSquash(body: WaxBody, dt: number) {
  body.squashAmt = Math.max(0, body.squashAmt - dt * WAX_SQUASH_DECAY);
}

/**
 * Resolve the body's squash/stretch target (collision squash wins over
 * velocity stretch), ease toward it with fast attack / slow gooey relax, and
 * pack the inverse deformation R·diag(1/s, s)·Rᵀ (volume-preserving) into
 * `deform` for the shader.
 */
export function updateWaxDeform(
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
