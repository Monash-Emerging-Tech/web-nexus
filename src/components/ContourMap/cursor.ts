/**
 * Cursor feedback for clickable objects inside the WebGL scene, shared by the
 * flashback blobs and the cube's nav bubbles. Drives the custom cursor via the
 * `mnet:cursor` event (see CustomCursor.tsx) with a plain-cursor fallback for
 * devices where the custom cursor is inactive.
 */
export const setLinkCursor = (on: boolean) => {
  window.dispatchEvent(
    new CustomEvent("mnet:cursor", { detail: on ? "link" : "" })
  );
  document.body.style.cursor = on ? "pointer" : "";
};
