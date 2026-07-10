"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { ScrollControls, Scroll, Environment } from "@react-three/drei";
import { useRouter } from "next/navigation";
import Experience from "./Experience";
import Overlay from "./Overlay";
import ScrollProgressBridge from "./ScrollProgressBridge";
import usePerformanceTier from "./usePerformanceTier";
import { Starfield } from "../Starfield";

interface ContourMapProps {
  children?: React.ReactNode;
}

const ContourMap: React.FC<ContourMapProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  // Set the instant a nav bubble (or any link leaving "/") is clicked, before
  // router.push. Freezes the R3F render loop immediately so the WebGL scene's
  // teardown doesn't run concurrently with (and block) the route transition.
  const [leaving, setLeaving] = useState(false);
  const perf = usePerformanceTier();
  const router = useRouter();

  // Navigation triggered from inside the WebGL scene (lava-blob and nav-bubble
  // clicks). Freeze the render loop first so teardown doesn't compete with
  // the route transition.
  const handleSceneNavigate = useCallback(
    (route: string) => {
      setLeaving(true);
      router.push(route);
    },
    [router]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // ContourMap only ever mounts on the home page, so any click on a link
  // leaving "/" (e.g. the top Navbar, which has its own <Link>s) also needs
  // to freeze the scene before Next starts the route transition. Capture
  // phase so this runs before the link's own navigation handler.
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      try {
        const url = new URL(anchor.href, window.location.origin);
        if (url.origin === window.location.origin && url.pathname !== "/") {
          setLeaving(true);
        }
      } catch {
        // ignore malformed/non-http hrefs (mailto:, tel:, etc.)
      }
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-black relative">
        {/* SSR Static Layout Overlay: painted immediately by browser for instant FCP/LCP */}
        <div className="absolute inset-0 z-10 w-full h-full">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="contour-scene w-full h-full overflow-hidden bg-black relative">
      <Starfield perf={perf} />
      <Canvas
        camera={{ position: [0, 5, 15], fov: 40 }}
        gl={{ antialias: perf.antialias }}
        dpr={perf.dpr}
        frameloop={leaving ? "never" : "always"}
      >
        {perf.enableEnvironment && <Environment files="/assets/potsdamer_platz_1k.hdr" />}
        <ambientLight intensity={2.0} />

        {/* Global lights */}
        <pointLight position={[10, 10, 10]} intensity={50} />
        <pointLight position={[-10, -10, -10]} color="#0033ff" intensity={30} />

        <ScrollControls pages={4} damping={perf.scrollDamping} style={{ scrollbarWidth: "none" }}>
          <ScrollProgressBridge />
          <Experience perf={perf} onNavigate={handleSceneNavigate} />
          {children && (
            <Scroll html style={{ width: '100%', height: '100%' }}>
              <Overlay>{children}</Overlay>
            </Scroll>
          )}
        </ScrollControls>
      </Canvas>
    </div>
  );
};

export default ContourMap;
