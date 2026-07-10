import type * as THREE from "three";

export interface StarfieldRenderableObject {
  isMesh?: boolean;
  material?: { color?: { set: (value: string) => void } };
}

export interface StarfieldInstance {
  three: {
    camera: THREE.Camera;
    scene: THREE.Scene;
  };
  destroy?: () => void;
}
