"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { ScrollControls, Scroll, Environment } from "@react-three/drei";
import Experience from "./Experience";
import Overlay from "./Overlay";
import { LABEL_CONFIG } from "./Labels";
import usePerformanceTier from "./usePerformanceTier";
import { Starfield } from "../Starfield";

interface ContourMapProps {
  children?: React.ReactNode;
}

const ContourMap: React.FC<ContourMapProps> = ({ children }) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const perf = usePerformanceTier();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-full bg-black" />;
  }

  return (
    <div className="w-full h-full overflow-hidden bg-black relative">
      <Starfield />
      <Canvas 
        camera={{ position: [0, 5, 15], fov: 40 }} 
        gl={{ antialias: perf.antialias }}
        dpr={perf.dpr}
      >
        {perf.enableEnvironment && <Environment preset="city" />}
        <ambientLight intensity={2.0} />
        
        {/* Global lights */}
        <pointLight position={[10, 10, 10]} intensity={50} />
        <pointLight position={[-10, -10, -10]} color="#0033ff" intensity={30} />
        
        <ScrollControls pages={4} damping={perf.scrollDamping}>
          <Experience overlayRef={overlayRef} perf={perf} />
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
          const isRight = label.shelf > 0;
          const endX = label.diag[0] + label.shelf;
          const endY = label.diag[1];

          return (
            <div key={label.text} style={{ position: 'absolute', left: 0, top: 0 }}>
              {/* Anchor dot */}
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#fff',
                boxShadow: '0 0 8px rgba(255,255,255,0.8)',
                position: 'absolute', left: -3, top: -3,
              }} />

              {/* Leader line: diagonal + horizontal shelf */}
              <svg style={{
                position: 'absolute', left: 0, top: 0,
                overflow: 'visible', width: 1, height: 1,
                pointerEvents: 'none',
              }}>
                <polyline
                  points={`0,0 ${label.diag[0]},${label.diag[1]} ${endX},${endY}`}
                  fill="none"
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth={1}
                />
                <line
                  x1={endX} y1={endY - 4}
                  x2={endX} y2={endY + 4}
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth={1}
                />
              </svg>

              {/* Text label */}
              <div
                style={{
                  position: 'absolute',
                  left: isRight ? endX + 10 : endX - 10,
                  top: endY - 8,
                  whiteSpace: 'nowrap',
                  color: '#fff',
                  fontFamily: 'var(--font-offbit, monospace)',
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textAlign: isRight ? 'left' : 'right',
                  transform: isRight ? 'none' : 'translateX(-100%)',
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                  textShadow: '0 0 10px rgba(255,255,255,0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#f21';
                  e.currentTarget.style.textShadow = '0 0 16px rgba(68,170,255,0.7)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.textShadow = '0 0 10px rgba(255,255,255,0.3)';
                }}
                onClick={() => console.log(`Navigate to: ${label.text}`)}
              >
                {label.text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContourMap;
