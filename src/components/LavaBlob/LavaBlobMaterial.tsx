"use client";

import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend, type ThreeElement } from "@react-three/fiber";
import {
  lavaBlobVertexShader,
  lavaBlobFragmentShader,
  MNET_BLOB_COLORS,
} from "./shaders";

/**
 * Reusable R3F material for the MNET lava-lamp blob. drei's shaderMaterial
 * generates per-uniform accessors, so consumers can drive it either via
 * `mat.uTime = t` or `mat.uniforms.uTime.value = t`.
 */
export const LavaBlobMaterial = shaderMaterial(
  {
    uTexA: null as THREE.Texture | null,
    uTexB: null as THREE.Texture | null,
    uAspectA: 1.0,
    uAspectB: 1.0,
    uMix: 0,
    uTime: 0,
    uOpacity: 0,
    uHover: 0,
    uGlitch: 0,
    uPhase: 0,
    uWobbleAmp: 0.09,
    uRestPhoto: 0.35,
    uHasPhoto: 0,
    uDeform: new THREE.Vector3(1, 1, 0),
    uColorA: new THREE.Color(MNET_BLOB_COLORS.colorA),
    uColorB: new THREE.Color(MNET_BLOB_COLORS.colorB),
    uRimColor: new THREE.Color(MNET_BLOB_COLORS.rim),
  },
  lavaBlobVertexShader,
  lavaBlobFragmentShader
);

export type LavaBlobMaterialImpl = InstanceType<typeof LavaBlobMaterial>;

extend({ LavaBlobMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    lavaBlobMaterial: ThreeElement<typeof LavaBlobMaterial>;
  }
}
