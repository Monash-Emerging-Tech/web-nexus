"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";

interface OverlayProps {
  children: React.ReactNode;
}

const Overlay: React.FC<OverlayProps> = ({ children }) => {
  const scroll = useScroll();
  const overlayRef = useRef<HTMLDivElement>(null);

  useFrame(() => {
    if (overlayRef.current) {
      // Fade out the hero content as we start to warp (0.0 to 0.4)
      const opacity = Math.max(0, 1 - scroll.offset * 2.5);
      overlayRef.current.style.opacity = opacity.toString();
      overlayRef.current.style.visibility = opacity <= 0 ? 'hidden' : 'visible';
    }
  });

  return (
    <div ref={overlayRef} className="w-full h-full">
      {children}
    </div>
  );
};

export default Overlay;
