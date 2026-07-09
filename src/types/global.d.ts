export {};

declare global {
  interface Window {
    updateStarfield?: (opacity: number, zoomOut: number) => void;
  }
}
