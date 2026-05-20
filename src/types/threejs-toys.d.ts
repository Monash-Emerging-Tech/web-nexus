declare module 'threejs-toys' {
  export interface SwarmBackgroundOptions {
    el: HTMLElement;
    eventsEl?: HTMLElement;
    gpgpuSize?: number;
    geometry?: 'cube' | 'sphere';
    [key: string]: any;
  }

  export function swarmBackground(options: SwarmBackgroundOptions): any;
}
