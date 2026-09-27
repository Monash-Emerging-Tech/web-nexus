"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";

// The home page scrolls inside drei's ScrollControls, so window scroll stays
// at 0 and ScrollIndicator can't see progress. This null-render scene child
// mirrors the drei scroll offset into the --scroll-progress custom property
// the indicator's fill reads from, and keeps data-hero-at-top="true|false" on
// <html> in sync (set on mount, updated on change, removed on unmount) so
// CustomCursor can show its SCROLL hint.
const HERO_TOP_THRESHOLD = 0.02;

const ScrollProgressBridge = () => {
  const scroll = useScroll();
  const last = useRef(-1);
  const atTop = useRef<boolean | null>(null);

  useFrame(() => {
    const offset = scroll.offset;
    if (Math.abs(offset - last.current) > 0.002) {
      last.current = offset;
      document.documentElement.style.setProperty(
        "--scroll-progress",
        String(Math.min(1, Math.max(0, offset)))
      );
    }
    const nextAtTop = offset < HERO_TOP_THRESHOLD;
    if (nextAtTop !== atTop.current) {
      atTop.current = nextAtTop;
      document.documentElement.dataset.heroAtTop = String(nextAtTop);
    }
  });

  useEffect(() => {
    return () => {
      document.documentElement.style.setProperty("--scroll-progress", "0");
    };
  }, []);

  // Publish immediately instead of waiting for a frame, and clear the cached
  // value on cleanup so a re-run (StrictMode replay, remount) always rewrites
  // the attribute rather than the change-only check above skipping it.
  useEffect(() => {
    const html = document.documentElement;
    atTop.current = scroll.offset < HERO_TOP_THRESHOLD;
    html.dataset.heroAtTop = String(atTop.current);
    return () => {
      atTop.current = null;
      delete html.dataset.heroAtTop;
    };
  }, [scroll]);

  return null;
};

export default ScrollProgressBridge;
