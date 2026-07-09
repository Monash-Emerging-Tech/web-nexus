declare module 'threejs-toys' {
  import type * as THREE from 'three';

  export interface SwarmBackgroundOptions {
    el: HTMLElement;
    eventsEl?: HTMLElement;
    gpgpuSize?: number;
    geometry?: 'cube' | 'sphere';
    [key: string]: unknown;
  }

  export interface SwarmBackgroundInstance {
    three: {
      camera: THREE.Camera;
      scene: THREE.Scene;
      [key: string]: unknown;
    };
    destroy?: () => void;
    [key: string]: unknown;
  }

  export function swarmBackground(options: SwarmBackgroundOptions): SwarmBackgroundInstance;
}
