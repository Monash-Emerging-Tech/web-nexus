"use client";

import React, { useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ScrollControls, useScroll, Scroll, Float, Environment } from "@react-three/drei";
import * as THREE from "three";
import MnetCube from "./MnetCube";

// --- Speed Lines Component ---
const SpeedLines = ({ count = 200, scrollOffset }: { count?: number; scrollOffset: number }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  const lines = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        x: (Math.random() - 0.5) * 60,
        y: (Math.random() - 0.5) * 60,
        z: Math.random() * 200 - 100,
        speed: Math.random() * 2 + 1,
        length: Math.random() * 15 + 5
      });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (groupRef.current) {
      // Rotate group to be perpendicular to map (Map is at -Math.PI / 2.5 on X)
      groupRef.current.rotation.x = -Math.PI / 2.5;
      
      groupRef.current.children.forEach((child, i) => {
        const line = lines[i];
        // Move lines towards camera based on scroll velocity + constant speed
        const speed = line.speed * (1 + scrollOffset * 10);
        child.position.z += speed * 0.1;
        
        // Loop lines back to the distance
        if (child.position.z > 50) {
          child.position.z = -150;
        }
      });
      groupRef.current.rotation.z += 0.0005;
    }
  });

  // Fade in instantly as we scroll, peak fast, fade out at the very end
  const opacity = Math.sin(Math.pow(scrollOffset, 0.5) * Math.PI);


  return (
    <group ref={groupRef}>
      {lines.map((line, i) => (
        <mesh key={i} position={[line.x, line.y, line.z]}>
          <boxGeometry args={[0.03, 0.03, line.length]} />
          <meshBasicMaterial 
            color="#ffffff" 
            transparent 
            opacity={opacity * 0.4} 
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
};


// --- Shader Helper ---
const vertexShader = `
  varying vec2 vUv;
  varying float vElevation;
  uniform float uTime;
  
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    vUv = uv;
    vec2 pos = position.xy;
    float elevation = noise(pos * 0.15 + uTime * 0.1) * 2.5;
    elevation += noise(pos * 0.4 - uTime * 0.05) * 0.8;
    vElevation = elevation;
    vec3 newPosition = position;
    newPosition.z += elevation;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  varying float vElevation;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uScroll;

  void main() {
    float t = clamp(vElevation / 3.0, 0.0, 1.0);
    vec3 colorLow = vec3(0.008, 0.051, 0.671);
    vec3 colorHigh = vec3(0.82, 0.008, 0.224);
    vec3 lineColor = mix(colorLow, colorHigh, t);
    
    float frequency = 14.0;
    float val = vElevation * frequency;
    float f = fract(val);
    float df = fwidth(val);
    float thickness = 1.0; 
    float lineMask = smoothstep(df * (thickness + 1.0), df * thickness, abs(f - 0.5));
    float glow = smoothstep(1.5, 0.0, abs(f - 0.5) / df) * 0.4;
    
    vec3 finalColor = lineColor * (lineMask + glow);
    
    float spotlightDist = distance(vUv, uMouse);
    float spotlightSpread = 20.0;
    float spotlightGlow = exp(-spotlightDist * spotlightDist * spotlightSpread) * 0.6;
    finalColor += lineColor * spotlightGlow;

    float edgeFade = 1.0 - smoothstep(0.3, 0.5, length(vUv - 0.5));
    
    // Fade out faster as we warp
    float scrollFade = smoothstep(0.6, 0.2, uScroll);
    gl_FragColor = vec4(finalColor, edgeFade * scrollFade);
  }
`;

// --- Anatomical Label Config ---
const LABEL_CONFIG = [
  { text: "PROJECTS",      diag: [55, -45],  shelf: 70  },
  { text: "EVENTS",        diag: [-55, -45], shelf: -70 },
  { text: "TEAM",          diag: [55, 45],   shelf: 70  },
  { text: "COLLABORATORS", diag: [-55, 45],  shelf: -70 },
];

const Experience = ({ overlayRef }: { overlayRef: React.RefObject<HTMLDivElement | null> }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const planetRef = useRef<THREE.Group>(null);
  const scroll = useScroll();
  const { size } = useThree();
  
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uScroll: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    const scrollOffset = scroll.offset;
    uniforms.uTime.value = state.clock.getElapsedTime();
    uniforms.uScroll.value = scrollOffset;
    
    const targetX = (state.mouse.x + 1.0) * 0.5;
    const targetY = (state.mouse.y + 1.0) * 0.5;
    uniforms.uMouse.value.x += (targetX - uniforms.uMouse.value.x) * 0.1;
    uniforms.uMouse.value.y += (targetY - uniforms.uMouse.value.y) * 0.1;
    
    // Warp Intensity: Start immediately, peak fast, fade out at the very end
    const warpIntensity = Math.sin(Math.pow(scrollOffset, 0.5) * Math.PI); 
    
    // FOV stretches immediately during the warp
    const targetFov = 40 + warpIntensity * 60; 
    (state.camera as THREE.PerspectiveCamera).fov = THREE.MathUtils.lerp((state.camera as THREE.PerspectiveCamera).fov, targetFov, 0.15);
    (state.camera as THREE.PerspectiveCamera).updateProjectionMatrix();

    // Map Angle
    const mapAngle = -Math.PI / 2.5;

    // Perpendicular Movement Vector (The Normal)
    // For a plane rotated around X by 'theta', the normal is [0, -sin(theta), cos(theta)]
    const nx = 0;
    const ny = -Math.sin(mapAngle); // positive
    const nz = Math.cos(mapAngle);  // positive
    
    // Move along the normal
    const distance = THREE.MathUtils.lerp(20, 120, scrollOffset);
    const targetCamX = 0;
    const targetCamY = ny * distance - 5; // offset to stay centered
    const targetCamZ = nz * distance;
    
    // Camera shake starts immediately
    const shake = warpIntensity * 0.2;
    const shakeX = (Math.random() - 0.5) * shake;
    const shakeY = (Math.random() - 0.5) * shake;
    const shakeZ = (Math.random() - 0.5) * shake;
    
    state.camera.position.set(targetCamX + shakeX, targetCamY + shakeY, targetCamZ + shakeZ);
    state.camera.lookAt(0, 0, 0);

    // Terrain parallax and tilt
    if (meshRef.current) {
      const targetRotationX = mapAngle - state.mouse.y * 0.1;
      const targetRotationY = state.mouse.x * 0.1;
      meshRef.current.rotation.x += (targetRotationX - meshRef.current.rotation.x) * 0.05;
      meshRef.current.rotation.y += (targetRotationY - meshRef.current.rotation.y) * 0.05;
      
      // Sink terrain down immediately along its own negative normal? 
      // Or just sink it globally Y. Let's do globally Y but faster.
      meshRef.current.position.y = -1.5 - scrollOffset * 60;
    }


    // Planet (MnetCube) logic
    if (planetRef.current) {
      // Appear later, once we are deep in the warp
      const appearance = smoothstep(0.6, 1.0, scrollOffset);
      planetRef.current.scale.setScalar(appearance * 1.5); // final cube size at end of transition
      
      // Position it further along the normal
      planetRef.current.position.y = ny * 80 * appearance;
      planetRef.current.position.z = nz * 80 * appearance;
      
      // Rotate about 2 axes slowly
      planetRef.current.rotation.y += 0.005;
      planetRef.current.rotation.x += 0.003;
    }

    // --- Project cube position to screen for HTML overlay labels ---
    if (planetRef.current && overlayRef.current) {
      const worldPos = new THREE.Vector3();
      planetRef.current.getWorldPosition(worldPos);

      const projected = worldPos.clone().project(state.camera);
      const screenX = (projected.x * 0.5 + 0.5) * size.width;
      const screenY = (-projected.y * 0.5 + 0.5) * size.height;
      const cubeScale = planetRef.current.scale.x;

      if (cubeScale > 0.3) {
        overlayRef.current.style.opacity = '1';
        overlayRef.current.style.transform = `translate(${screenX}px, ${screenY}px)`;
      } else {
        overlayRef.current.style.opacity = '0';
      }
    }

  });


  function smoothstep(min: number, max: number, value: number) {
    const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
    return x * x * (3 - 2 * x);
  }

  return (
    <>
      <SpeedLines scrollOffset={scroll.offset} />
      
      {/* Light that follows the camera's view */}
      <directionalLight position={[0, 0, 1]} intensity={1.5} />
      
      <mesh ref={meshRef} rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -1.5, 0]}>
        <planeGeometry args={[40, 40, 256, 256]} /> 
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </mesh>

      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <group ref={planetRef} position={[0, 8, 0]} scale={[0, 0, 0]}>
          <MnetCube />
          {/* Light that travels with the planet */}
          <pointLight intensity={500} distance={50} color="#ffffff" />
          <pointLight position={[2, 2, 2]} intensity={200} color="#0033ff" />
        </group>
      </Float>
    </>
  );
};


const Overlay = ({ children }: { children: React.ReactNode }) => {
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

const ContourMap = ({ children }: { children?: React.ReactNode }) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full h-full overflow-hidden bg-black relative">
      <Canvas camera={{ position: [0, 5, 15], fov: 40 }} gl={{ antialias: true }}>
        <color attach="background" args={["#000000"]} />
        <Environment preset="city" />
        <ambientLight intensity={2.0} />
        
        {/* Global lights */}
        <pointLight position={[10, 10, 10]} intensity={50} />
        <pointLight position={[-10, -10, -10]} color="#0033ff" intensity={30} />
        
        <ScrollControls pages={4} damping={0.1}>
          <Experience overlayRef={overlayRef} />
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
