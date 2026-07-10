"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { ScrollControls, Scroll, Environment } from "@react-three/drei";
import { useRouter } from "next/navigation";
import Experience from "./Experience";
import Overlay from "./Overlay";
import ScrollProgressBridge from "./ScrollProgressBridge";
import { LABEL_CONFIG } from "./Labels";
import { NAV_PAGES } from "./navPages";
import usePerformanceTier from "./usePerformanceTier";
import { Starfield } from "../Starfield";
import Link from "next/link";

interface ContourMapProps {
  children?: React.ReactNode;
}

// Label → route map for the cube's anatomical labels, derived from the same
// page pool the lava blobs use.
const NAV_ROUTES: Record<string, string> = Object.fromEntries(
  NAV_PAGES.map((p) => [p.label, p.route])
);

const ContourMap: React.FC<ContourMapProps> = ({ children }) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // Set the instant a nav label is clicked, before router.push. Freezes the
  // R3F render loop immediately so the WebGL scene's teardown doesn't run
  // concurrently with (and block) the route transition.
  const [leaving, setLeaving] = useState(false);
  const perf = usePerformanceTier();
  const router = useRouter();

  // Navigation triggered from inside the WebGL scene (lava-blob clicks).
  // Freeze the render loop first, same as the label links, so teardown
  // doesn't compete with the route transition.
  const handleSceneNavigate = useCallback(
    (route: string) => {
      setLeaving(true);
      router.push(route);
    },
    [router]
  );

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
          <Experience overlayRef={overlayRef} perf={perf} onNavigate={handleSceneNavigate} />
          {children && (
            <Scroll html style={{ width: '100%', height: '100%' }}>
              <Overlay>{children}</Overlay>
            </Scroll>
          )}
        </ScrollControls>
      </Canvas>

      {/* 2D Anatomical Labels — rendered outside Canvas, positioned via projected coords */}
      <div
        ref={overlayRef}
        className="absolute top-0 left-0 pointer-events-none"
        style={{ opacity: 0, transition: 'opacity 0.4s' }}
      >
        {LABEL_CONFIG.map((label) => {
          let diagX = label.diag[0];
          let diagY = label.diag[1];
          let shelf = label.shelf;

          if (isMobile) {
            // Push labels higher/lower and compress horizontal distance (smaller diagX) to prevent cutoffs
            if (label.text === "ABOUT US") {
              diagX = 30;
              diagY = -320;
            } else if (label.text === "PORTFOLIO") {
              diagX = 55;
              diagY = -190;
            } else if (label.text === "OUTREACH") {
              diagX = -55;
              diagY = 320;
            } else if (label.text === "COLLABORATORS") {
              diagX = -30;
              diagY = 190;
            }
            diagX *= 0.65;
            diagY *= 0.65;
            shelf *= 0.45; // Shorter shelf to prevent spilling off-screen
          }

          const isRight = shelf > 0;
          const endX = diagX + shelf;
          const endY = diagY;

          return (
            <div 
              key={label.text} 
              style={{ 
                position: 'absolute', 
                left: 0, 
                top: 0,
                transform: 'scale(var(--nav-scale, 0))',
                transformOrigin: '0 0',
              }}
            >
              {(() => {
                const dx = diagX;
                const dy = diagY;
                const theta = Math.atan2(dy, dx);
                
                // Radius of imaginary circle around the cube (larger than rotation scope)
                const R = isMobile ? 65 : 160;
                
                // Arc span in radians (approx 15 degrees total)
                const deltaTheta = 0.13; 
                const theta1 = theta - deltaTheta;
                const theta2 = theta + deltaTheta;
                
                // Arc start and end coordinates
                const xArc1 = R * Math.cos(theta1);
                const yArc1 = R * Math.sin(theta1);
                const xArc2 = R * Math.cos(theta2);
                const yArc2 = R * Math.sin(theta2);
                
                // Diagonal leader line starts from the center of the arc
                const xStart = R * Math.cos(theta);
                const yStart = R * Math.sin(theta);
                
                return (
                  <svg style={{
                    position: 'absolute', left: 0, top: 0,
                    overflow: 'visible', width: 1, height: 1,
                    pointerEvents: 'none',
                  }}>
                    {/* The circular arc segment */}
                    <path
                      d={`M ${xArc1},${yArc1} A ${R},${R} 0 0,1 ${xArc2},${yArc2}`}
                      fill="none"
                      stroke="rgba(255,255,255,0.7)"
                      strokeWidth={isMobile ? 1.25 : 2}
                    />
                    {/* Leader Line starting from the arc */}
                    <polyline
                      points={`${xStart},${yStart} ${dx},${dy} ${endX},${endY}`}
                      fill="none"
                      stroke="rgba(255,255,255,0.7)"
                      strokeWidth={isMobile ? 1.25 : 2}
                    />
                    {/* Horizontal tick marker */}
                    <line
                      x1={endX} y1={endY - (isMobile ? 3 : 6)}
                      x2={endX} y2={endY + (isMobile ? 3 : 6)}
                      stroke="rgba(255,255,255,0.7)"
                      strokeWidth={isMobile ? 1.25 : 2}
                    />
                  </svg>
                );
              })()}

              {/* Text label — a real link so it works for keyboards,
                  screen readers, and crawlers, not just pointer clicks */}
              <Link
                href={NAV_ROUTES[label.text.toUpperCase()] ?? "/"}
                data-ccursor
                className="cube-label"
                style={{
                  position: 'absolute',
                  left: isRight ? endX + (isMobile ? 6 : 14) : endX - (isMobile ? 6 : 14),
                  top: endY - (isMobile ? 7 : 11),
                  whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-offbit, monospace)',
                  fontSize: isMobile ? 12 : 18,
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textAlign: isRight ? 'left' : 'right',
                  transform: isRight ? 'none' : 'translateX(-100%)',
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                  color: 'inherit',
                  textDecoration: 'none',
                  display: 'block',
                }}
                onClick={() => setLeaving(true)}
              >
                <span className="cube-label-text">{label.text}</span>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContourMap;
