export interface StarfieldRenderableObject {
  isMesh?: boolean;
  material?: { color?: { set: (value: string) => void } };
}

export interface StarfieldInstance {
  three: {
    camera: { position: { set: (x: number, y: number, z: number) => void } };
    scene: {
      traverse: (callback: (object: StarfieldRenderableObject) => void) => void;
    };
  };
  destroy?: () => void;
}
