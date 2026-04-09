"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ScrollControls, useScroll, Text, Html } from "@react-three/drei";
import * as THREE from "three";
import MnetCube from "./MnetCube";

// --- Shader Helpers ---
const vertexShader = `
  varying vec2 vUv;
  varying float vElevation;
  varying vec2 vLocalPos;
  
  uniform float uTime;
  uniform vec2 uOffset;
  
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
    vLocalPos = position.xy;
    
    vec2 worldPos = position.xy + uOffset;
    
    // Create a dynamic "terrain" effect using the true world position for seamless edges
    float elevation = noise(worldPos * 0.15 + uTime * 0.1) * 2.5;
    elevation += noise(worldPos * 0.4 - uTime * 0.05) * 0.8;
    
    vElevation = elevation;
    
    vec3 newPosition = position;
    newPosition.z += elevation;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  varying float vElevation;
  varying vec2 vLocalPos;
  
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

    // Morph mask: from rectangle (1.0) to circle with border
    float distToCenter = length(vLocalPos);
    
    // Tighter circles as uScroll goes up (radius shrinks down to 6.5)
    float maxRadius = mix(15.0, 6.5, uScroll); 
    
    // Add an edge fade when it's a circle
    float alpha = smoothstep(maxRadius, maxRadius - 1.5, distToCenter);
    
    // Draw a prominent glowing ring around the circumference of the circle
    float ringThickness = 0.5;
    float ring = smoothstep(maxRadius - ringThickness, maxRadius - ringThickness * 2.0, distToCenter);
    float ringAlpha = (1.0 - ring) * alpha * uScroll; // Only visible when scrolled
    
    vec3 circleColor = finalColor + colorLow * ringAlpha * 3.0; // Glow the ring slightly blue
    
    // Dim the section slightly based on uScroll to make the lines pop more when detached
    gl_FragColor = vec4(circleColor, alpha);
  }
`;

const Quadrant = ({ size, offset, dir, uniforms }:any) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);
  
  useEffect(() => {
    document.body.style.cursor = hovered && uniforms.uScroll.value > 0.8 ? 'pointer' : 'auto';
  }, [hovered, uniforms.uScroll.value]);
  
  const quadUniforms = useMemo(() => ({
    uTime: uniforms.uTime,
    uMouse: uniforms.uMouse,
    uScroll: uniforms.uScroll,
    uOffset: { value: new THREE.Vector2(offset[0], offset[1]) }
  }), [uniforms, offset]);

    useFrame(() => {
    if (meshRef.current) {
      // Split distance (how far they push apart) - brought closer to cube (7.0)
      const splitAmt = uniforms.uScroll.value * 7.0; 
      const popAmt = hovered && uniforms.uScroll.value > 0.8 ? 3.0 : 0;
      const scaleAmt = hovered && uniforms.uScroll.value > 0.8 ? 1.1 : 1.0;
      
      const targetX = offset[0] + dir[0] * splitAmt;
      const targetY = offset[1] + dir[1] * splitAmt;
      
      meshRef.current.position.x += (targetX - meshRef.current.position.x) * 0.1;
      meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.1;
      // Z popup when hovering the interactive island
      meshRef.current.position.z += (popAmt - meshRef.current.position.z) * 0.1;
      meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, scaleAmt, 0.1));
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      position={[offset[0], offset[1], 0]}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
      onPointerOut={() => setHover(false)}
      onPointerDown={(e) => {
        // Prevent drag from triggering clicks too easily
        if (uniforms.uScroll.value > 0.8) {
          console.log(`Quadrant clicked`);
        }
      }}
    >
      <planeGeometry args={[size, size, 128, 128]} /> 
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={quadUniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
};

const Carousel = () => {
  const scroll = useScroll();
  const groupRef = useRef<THREE.Group>(null);
  const cubeRef = useRef<THREE.Group>(null);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isCasting, setIsCasting] = useState(false);
  const [rotationVelocity, setRotationVelocity] = useState(0);

  const swipeRotationRef = useRef(0);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uScroll: { value: 0 },
    }),
    []
  );

  // Swipe capture logic
  useEffect(() => {
    let lastX = 0;
    
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      setIsCasting(true);
      lastX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    };
    
    const onPointerUp = () => setIsCasting(false);
    
    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (isCasting && groupRef.current) {
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const deltaX = clientX - lastX;
        setRotationVelocity(deltaX * 0.005);
        lastX = clientX;
      }
    };

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('touchstart', onPointerDown);
    window.addEventListener('touchend', onPointerUp);
    window.addEventListener('touchmove', onPointerMove);

    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchend', onPointerUp);
      window.removeEventListener('touchmove', onPointerMove);
    };
  }, [isCasting]);


  useFrame((state) => {
    uniforms.uTime.value = state.clock.getElapsedTime();
    // uScroll maps to how far we scrolled. With pages=4, let's make the transition
    // last for the first 1.5 pages (offset of 0.375).
    const scrollVal = Math.min(scroll.offset / 0.4, 1.0); 
    // Smooth interpolator
    uniforms.uScroll.value += (scrollVal - uniforms.uScroll.value) * 0.1;
    
    const targetX = (state.mouse.x + 1.0) * 0.5;
    const targetY = (state.mouse.y + 1.0) * 0.5;
    uniforms.uMouse.value.x += (targetX - uniforms.uMouse.value.x) * 0.1;
    uniforms.uMouse.value.y += (targetY - uniforms.uMouse.value.y) * 0.1;
    
    // Accumulate swipe rotation and apply friction
    swipeRotationRef.current += rotationVelocity;
    if (!isCasting) {
      setRotationVelocity(v => v * 0.95);
    }
    
    // Dynamically animate camera position and FOV for better perspective
    const camX = 0;
    const camY = THREE.MathUtils.lerp(5, 18, uniforms.uScroll.value);
    const camZ = THREE.MathUtils.lerp(15, 20, uniforms.uScroll.value);
    const targetFov = THREE.MathUtils.lerp(45, 75, uniforms.uScroll.value);
    
    state.camera.position.set(camX, camY, camZ);
    if ((state.camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
      (state.camera as THREE.PerspectiveCamera).fov = targetFov;
      (state.camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    }
    state.camera.lookAt(0, 0, 0);
    
    if (groupRef.current) {
      const baseX = -Math.PI / 2.5; 
      const targetRotationX = THREE.MathUtils.lerp(baseX, -Math.PI / 2, uniforms.uScroll.value);
      
      groupRef.current.rotation.x = targetRotationX;
      
      // Combine scroll-based rotation with manual swipe rotation
      const scrollRotation = scroll.offset * Math.PI * 2.0; // One full rotation over the page
      groupRef.current.rotation.z = scrollRotation + swipeRotationRef.current;
    }

    if (cubeRef.current) {
      // Scale up the cube based on scroll
      const cubeScale = THREE.MathUtils.lerp(0, 1.5, uniforms.uScroll.value);
      cubeRef.current.scale.setScalar(cubeScale);
      
      // Float the cube higher on the page (Z pushes it UP globally when group is flat on X)
      const targetCubeZ = THREE.MathUtils.lerp(0, 5, uniforms.uScroll.value);
      cubeRef.current.position.z = targetCubeZ;
    }
  });

  return (
    <group ref={groupRef} position={[0, -1.5, 0]}>
      {/* 4 Quadrants summing up to 40x40. Each is 20x20. */}
      <Quadrant 
        size={10} offset={[-5, 5]} dir={[-1, 1]} uniforms={uniforms} 
      />
      <Quadrant 
        size={10} offset={[5, 5]} dir={[1, 1]} uniforms={uniforms} 
      />
      <Quadrant 
        size={10} offset={[-5, -5]} dir={[-1, -1]} uniforms={uniforms} 
      />
      <Quadrant 
        size={10} offset={[5, -5]} dir={[1, -1]} uniforms={uniforms} 
      />

      {/* Center 3D Logo */}
      <group ref={cubeRef} rotation={[Math.PI / 2, 0, 0]}>
        <MnetCube />
      </group>
    </group>
  );
};

const ContourMap = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="w-full h-[100dvh]">
      <Canvas camera={{ position: [0, 15, 30], fov: 45 }} gl={{ antialias: true }}>
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} />
        
        {/* Increased length by setting pages to 4 */}
        <ScrollControls pages={4} damping={0.1}>
          <GridOverlay>{children}</GridOverlay>
          <Carousel />
        </ScrollControls>
      </Canvas>
    </div>
  );
};

// We create a helper component to render the Scroll html since Scroll needs to be inside ScrollControls
import { Scroll } from "@react-three/drei";
const GridOverlay = ({ children }: { children?: React.ReactNode }) => {
  return (
    <Scroll html style={{ width: '100vw', height: '100vh' }}>
      {children}
    </Scroll>
  );
};

export default ContourMap;
