"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { ScrollControls, Scroll, Environment } from "@react-three/drei";
import Experience from "./Experience";
import Overlay from "./Overlay";
import ScrollProgressBridge from "./ScrollProgressBridge";
import { LABEL_CONFIG } from "./Labels";
import usePerformanceTier from "./usePerformanceTier";
import { ShaderBackground } from "./ShaderBackground";
import Link from "next/link";

interface ContourMapProps {
  children?: React.ReactNode;
  flashbackUrls?: string[];
}

const NAV_ROUTES: Record<string, string> = {
  "ABOUT US": "/about-us",
  "OUTREACH": "/outreach",
  "PORTFOLIO": "/portfolios",
  "COLLABORATORS": "/collaborators",
};

const ContourMap: React.FC<ContourMapProps> = ({ children, flashbackUrls = [] }) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // Set the instant a nav label is clicked, before router.push. Freezes the
  // R3F render loop immediately so the WebGL scene's teardown doesn't run
  // concurrently with (and block) the route transition.
  const [leaving, setLeaving] = useState(false);
  const perf = usePerformanceTier();
  // Cube's live apparent on-screen radius (px), reported by Planet every
  // frame it changes. Drives the nav arc radius so it always tracks the
  // cube's actual projected size instead of a guessed constant.
  const [cubeRadius, setCubeRadius] = useState(160);
  const moonTooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMoonHover = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const el = moonTooltipRef.current;
      if (!el) return;
      if (detail.visible) {
        el.style.display = "block";
        el.style.left = `${detail.x}px`;
        el.style.top = `${detail.y}px`;
        const textEl = el.firstElementChild as HTMLElement;
        if (textEl) textEl.textContent = detail.label;
      } else {
        el.style.display = "none";
      }
    };
    window.addEventListener("mnet:moon-hover", handleMoonHover);
    return () => window.removeEventListener("mnet:moon-hover", handleMoonHover);
  }, []);

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
      <ShaderBackground />
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
          <Experience overlayRef={overlayRef} perf={perf} flashbackUrls={flashbackUrls} onCubeRadiusChange={setCubeRadius} />
          {children && (
            <Scroll html style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
              <Overlay>{children}</Overlay>
            </Scroll>
          )}
        </ScrollControls>
      </Canvas>

      {/* 2D Anatomical Labels — rendered outside Canvas, positioned via projected coords */}
      <div
        ref={overlayRef}
        className="absolute top-0 left-0 pointer-events-none"
        style={{ opacity: 0, visibility: 'hidden', transition: 'opacity 0.4s, visibility 0.4s' }}
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

          // LABEL_CONFIG's diag/shelf pixel values were designed around the
          // default 160px cube radius. Scale them with the cube's live
          // projected radius so the whole assembly (arc, leader lines, text
          // anchors) sits proportionally 20% outside the cube at every
          // moment — including mid-spring, since cubeRadius updates every
          // frame the cube is animating.
          const k = cubeRadius / 160;
          diagX *= k;
          diagY *= k;
          shelf *= k;

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
              }}
            >
              {(() => {
                const dx = diagX;
                const dy = diagY;
                const theta = Math.atan2(dy, dx);
                
                // Radius of imaginary circle around the cube — always 20%
                // bigger than the cube's actual live on-screen radius, so
                // the arc stays locked to the cube as it scales/rotates.
                const R = cubeRadius * 1.2;
                
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

      <div
        ref={moonTooltipRef}
        className="pointer-events-none"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          transform: "translate(-50%, -50%)",
          zIndex: 1000,
          display: "none",
        }}
      >
        <div
          className="glitch-soft"
          style={{
            fontFamily: "var(--font-offbit, monospace)",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.25em",
            color: "#ffffff",
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            padding: "6px 12px",
            borderRadius: "4px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
            whiteSpace: "nowrap",
            textAlign: "center",
          }}
        />
      </div>
    </div>
  );
};

export default ContourMap;
