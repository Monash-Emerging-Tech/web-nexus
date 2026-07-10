"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";

// The home page scrolls inside drei's ScrollControls, so window scroll stays
// at 0 and ScrollIndicator can't see progress. This null-render scene child
// mirrors the drei scroll offset into the --scroll-progress custom property
// the indicator's fill reads from.
const ScrollProgressBridge = () => {
  const scroll = useScroll();
  const last = useRef(-1);

  useFrame(() => {
    const offset = scroll.offset;
    if (Math.abs(offset - last.current) > 0.002) {
      last.current = offset;
      document.documentElement.style.setProperty(
        "--scroll-progress",
        String(Math.min(1, Math.max(0, offset)))
      );
    }
  });

  useEffect(() => {
    return () => {
      document.documentElement.style.setProperty("--scroll-progress", "0");
    };
  }, []);

  return null;
};

export default ScrollProgressBridge;
