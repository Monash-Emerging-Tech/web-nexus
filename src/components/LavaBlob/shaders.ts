// Reusable GLSL for the MNET lava-lamp blob billboard.
//
// The blob is a flat plane whose fragment shader fakes a glossy 3D wax
// bloblet: a continuously morphing silhouette, fake-sphere shading with
// fresnel rim + dual speculars, an optional photo refracted "inside" the
// wax, and a dual-texture Spider-Verse glitch cut for page flashing.
//
// Consumers: the home hero's MemoryFlashbacks orbs, and the standalone
// <LavaBlob> component for reuse across the rest of the site.

import * as THREE from "three";

/** Brand palette — mirrors --mnet-* tokens in src/app/globals.css. */
export const MNET_BLOB_COLORS = {
  /** MNET blue (--mnet-blue) */
  colorA: "#030CAB",
  /** MNET red (--mnet-red) */
  colorB: "#DC003B",
  /** Rim + specular highlights (--mnet-white) */
  rim: "#FFFFFF",
} as const;

/**
 * Silhouette base radius as a fraction of the quad. Kept small enough that
 * breathing (±3%) + morph (±uWobbleAmp) + a mesh-independent squash/stretch
 * of up to ~1.25x still fits inside the plane: 0.34 * 1.03 * 1.09 * 1.25 ≈ 0.48.
 */
export const BLOB_BASE_RADIUS = 0.34;

export const lavaBlobVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const lavaBlobFragmentShader = /* glsl */ `
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
  // Symmetric 2x2 squash/stretch sampling matrix packed as (m00, m11, m01).
  // Identity = (1, 1, 0). Driven by the physics sim (velocity stretch,
  // collision squash) so the whole blob deforms like soft wax.
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
    // Physics squash/stretch: sample through the inverse deformation so the
    // silhouette, photo and shading all deform together like pressed wax.
    mat2 deform = mat2(uDeform.x, uDeform.z, uDeform.z, uDeform.y);
    vec2 c = deform * (vUv - 0.5);
    float ang = atan(c.y, c.x);
    float dist = length(c);

    // ---- continuously morphing silhouette --------------------------------
    // Organic layer: value noise sampled around the unit circle (seam-free)
    // drifting through time — the boundary never repeats and never rests.
    vec2 rimP = vec2(cos(ang), sin(ang));
    float organic = noise2(rimP * 1.6 + uPhase * 7.0 + uTime * 0.15)
                  + 0.5 * noise2(rimP * 3.2 - uPhase * 3.0 - uTime * 0.23);
    organic = organic / 1.5 * 2.0 - 1.0; // → roughly [-1, 1]
    // Harmonic layer: two slow low-order lobes for the big lava shapes.
    // Integer frequencies keep the outline continuous across atan's ±PI seam.
    float lobes = 0.6 * sin(ang * 2.0 + uTime * 0.31 + uPhase * 6.2831)
                + 0.4 * sin(ang * 3.0 - uTime * 0.47 + uPhase * 12.566);
    float morph = 0.55 * organic + 0.45 * lobes;
    // Slow whole-blob breathing, gated off with the wobble for reduced motion.
    float breathe = 1.0 + 0.03 * sin(uTime * 0.48 + uPhase * 6.2831)
                          * smoothstep(0.0, 0.02, uWobbleAmp);
    float radius = ${BLOB_BASE_RADIUS} * breathe * (1.0 + uWobbleAmp * morph);
    float d = dist - radius;

    if (d > 0.085) {
      discard; // keep a soft halo band outside the body
    }

    float edgeW = max(fwidth(d) * 1.5, 0.002);
    float body = 1.0 - smoothstep(-edgeW, edgeW, d);

    // ---- fake 3D normal on the wobbled dome ------------------------------
    float dn = clamp(dist / radius, 0.0, 1.0);
    float z = sqrt(max(0.0, 1.0 - dn * dn));
    vec2 dir = dist > 0.0001 ? c / dist : vec2(0.0);
    vec3 n = normalize(vec3(dir * dn, max(z, 0.001)));

    // ---- lens refraction of the photo into the dome ----------------------
    float sphereDist = asin(dn) / 1.5707963;
    vec2 sphereUv = vec2(0.5) + dir * radius * sphereDist;
    // Liquid swim: the photo drifts inside the wax; steadies on hover.
    sphereUv += (noise2(sphereUv * 3.0 + uPhase * 11.0 + uTime * 0.1) - 0.5)
                * 0.03 * (1.0 - uHover * 0.8) * smoothstep(0.0, 0.02, uWobbleAmp);

    // ---- Spider-Verse glitch flash (dual texture) ------------------------
    vec2 guv = sphereUv;
    float band = floor(vUv.y * 14.0);
    float seed = floor(uTime * 20.0);
    if (uGlitch > 0.03) {
      // Sliced horizontal displacement, re-randomized ~20 Hz
      if (hash(band * 91.7 + seed) < 0.35 + 0.3 * uGlitch) {
        guv.x += (hash(band + seed * 1.3) - 0.5) * 0.12 * uGlitch;
      }
      // Whole-frame jitter quantized to ~15 fps for the stop-motion feel
      float tj = floor(uTime * 15.0);
      guv += (vec2(hash(tj), hash(tj + 7.0)) - 0.5) * 0.02 * uGlitch;
    }

    // Bands flip between outgoing/incoming page early or late — sliced cut.
    float m = clamp(uMix + (hash(band * 3.7 + uPhase * 17.0) - 0.5) * uGlitch, 0.0, 1.0);
    float sel = step(0.5, m);

    // RGB split, heavier toward the rim like the old lens
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

    // ---- glossy lava shading ---------------------------------------------
    // Rolling brand gradient across the dome, deeper toward the edges.
    float gradT = 0.5 + 0.5 * sin(uTime * 0.4 + uPhase * 6.2831 + n.y * 2.0 + n.x * 0.7);
    vec3 bodyCol = mix(uColorA, uColorB, gradT);
    bodyCol *= mix(0.55, 1.15, z);

    // Photo ghosted into the wax at rest, true colors on hover.
    float luma = dot(photo, vec3(0.299, 0.587, 0.114));
    vec3 ghost = mix(bodyCol * 0.35, mix(bodyCol, vec3(1.0), 0.75),
                     smoothstep(0.0, 1.0, luma));
    vec3 interior = mix(ghost, photo, uHover);
    float photoAmt = mix(uRestPhoto, 1.0, uHover) * uHasPhoto;
    vec3 col = mix(bodyCol, interior, photoAmt);

    // Fresnel rim — the bright liquid edge.
    float fres = pow(1.0 - z, 2.2);
    col += uRimColor * fres * (0.9 + 0.6 * uHover);

    // Two fake speculars for the glass-drop look.
    vec3 lightA = normalize(vec3(-0.45, 0.6, 0.66));
    vec3 lightB = normalize(vec3(0.5, -0.35, 0.79));
    float specA = pow(max(dot(n, lightA), 0.0), 60.0);
    float specB = 0.5 * pow(max(dot(n, lightB), 0.0), 140.0);
    col += uRimColor * (specA * 1.3 + specB);

    // Translucent interior, brighter rim, opaque-ish when showing the photo,
    // soft glow halo outside the body.
    float bodyAlpha = mix(mix(0.78, 0.92, fres), 0.96, uHover);
    float halo = exp(-max(d, 0.0) * 45.0) * 0.35;
    float alpha = uOpacity * (body * bodyAlpha + (1.0 - body) * halo);

    gl_FragColor = vec4(col, alpha);
  }
`;

/**
 * Fresh uniforms object for a plain THREE.ShaderMaterial. The drei-based
 * <lavaBlobMaterial> builds its own defaults; this factory exists for
 * consumers that manage uniforms manually.
 */
export function createLavaBlobUniforms() {
  return {
    uTexA: { value: null as THREE.Texture | null },
    uTexB: { value: null as THREE.Texture | null },
    uAspectA: { value: 1.0 },
    uAspectB: { value: 1.0 },
    uMix: { value: 0 },
    uTime: { value: 0 },
    uOpacity: { value: 0 },
    uHover: { value: 0 },
    uGlitch: { value: 0 },
    uPhase: { value: 0 },
    uWobbleAmp: { value: 0.09 },
    uRestPhoto: { value: 0.35 },
    uHasPhoto: { value: 0 },
    uDeform: { value: new THREE.Vector3(1, 1, 0) },
    uColorA: { value: new THREE.Color(MNET_BLOB_COLORS.colorA) },
    uColorB: { value: new THREE.Color(MNET_BLOB_COLORS.colorB) },
    uRimColor: { value: new THREE.Color(MNET_BLOB_COLORS.rim) },
  };
}
