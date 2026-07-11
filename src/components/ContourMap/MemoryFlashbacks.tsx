"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import * as THREE from "three";
import { optimizeFlashbackUrl } from "@/lib/utils";

// Local JPG fallback images from public/img folder
const FALLBACK_IMAGES = [
  "/img/About-Focus-Temp.JPG",
  "/img/About-Meet-Team-Temp.jpg",
  "/img/About-Showcase-Temp.JPG",
  "/img/About-Team.JPG",
  "/img/Nav-About-Temp.JPG",
  "/img/Nav-Events.JPG",
  "/img/Nav-Team.JPG",
  "/img/Senior-Members-Temp.jpg",
  "/img/Team_Leads.jpg",
];

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uOpacity;
  uniform float uGlitch;
  uniform float uHover;
  uniform float uAspect;
  uniform float uPhase;
  varying vec2 vUv;

  float hash(float n) { return fract(sin(n) * 43758.5453123); }

  float hash2(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float noise2(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash2(i);
    float b = hash2(i + vec2(1.0, 0.0));
    float c = hash2(i + vec2(0.0, 1.0));
    float d = hash2(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    vec2 uv = vUv;

    // Glitch horizontal slicing lines
    if (uGlitch > 0.08) {
      float sliceY = floor(uv.y * 20.0 + sin(uTime * 15.0));
      float sliceOffset = sin(sliceY * 123.456 + uTime) * 0.03 * uGlitch;
      if (hash(sliceY) < 0.3 * uGlitch) {
        uv.x += sliceOffset;
      }
    }

    // Spherical crop and depth calculation
    vec2 centeredUv = uv - vec2(0.5);
    float radius = 0.44;
    float dist = length(centeredUv);
    float d = dist - radius;

    if (d > 0.0) {
      discard;
    }

    // Calculate hemisphere surface height Z (normal map z)
    float d_norm = dist / radius;
    float z = sqrt(max(0.0, 1.0 - d_norm * d_norm));

    // 3D Spherize / Lensing Coordinate Refraction Warp
    // Compresses the texture near the edges to create a 3D sphere projection look
    vec2 sphereUv;
    if (dist > 0.0001) {
      float sphereDist = asin(d_norm) / 1.5707963;
      sphereUv = vec2(0.5) + (centeredUv / dist) * radius * sphereDist;
    } else {
      sphereUv = vec2(0.5);
    }

    // Aspect Ratio Cover (object-fit: cover in GLSL) applied to the sphere UV
    float safeAspect = max(0.01, uAspect);
    vec2 textureUv = sphereUv;
    if (safeAspect > 1.0) {
      textureUv.x = (sphereUv.x - 0.5) / safeAspect + 0.5;
    } else {
      textureUv.y = (sphereUv.y - 0.5) * safeAspect + 0.5;
    }

    // Chromatic Aberration texture mapping (with extra lens distortion weight)
    float glitchAmt = uGlitch * (1.0 + (1.0 - z) * 0.5);
    vec2 uvRed = textureUv + vec2(0.012 * glitchAmt, 0.005 * sin(uTime * 5.0) * glitchAmt);
    vec2 uvGreen = textureUv;
    vec2 uvBlue = textureUv - vec2(0.012 * glitchAmt, 0.005 * cos(uTime * 5.0) * glitchAmt);

    float r = texture2D(uTexture, uvRed).r;
    float g = texture2D(uTexture, uvGreen).g;
    float b = texture2D(uTexture, uvBlue).b;
    vec4 texColor = vec4(r, g, b, 1.0);

    // Contour map matching colors: deep blue to neon red-pink
    vec3 colorLow = vec3(0.008, 0.051, 0.671);
    vec3 colorHigh = vec3(0.82, 0.008, 0.224);

    // Shared shifting gradient — drives both the border glow and the interior
    // tint so the orb colour always stays in step with the animated border
    vec3 borderGrad = mix(colorLow, colorHigh, sin(uTime * 1.2 + uv.x * 2.0) * 0.5 + 0.5);

    float gray = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));

    // Nostalgic duotone in the border's current hue: shadows sink into a deep
    // version of it, highlights lift to a pastel version — faded, never true black
    vec3 duoLow = borderGrad * 0.22;
    vec3 duoHigh = mix(borderGrad, vec3(1.0), 0.6);
    vec3 tinted = mix(duoLow, duoHigh, smoothstep(0.0, 1.0, gray));

    // Keep a hint of the original photo so faces stay readable
    vec3 faded = mix(tinted, texColor.rgb, 0.2);

    // Idle: image sits dimmed behind the contour overlay.
    // Hovering brings the memory forward in its true colors.
    vec3 gradedColor = mix(faded * 0.5, texColor.rgb * 1.1, uHover * 0.8);

    // Vignette darkens toward the duotone shadow so edges melt into the border glow
    float distFromCenter = length(centeredUv);
    float vignette = smoothstep(0.85, 0.45, distFromCenter);
    gradedColor = mix(duoLow, gradedColor, vignette);

    // Translucent contour map drifting over the memory, same line style and
    // drift speeds as the terrain shader; per-orb uPhase offsets the pattern.
    // Fades out on hover so the photo comes through clean when focused on.
    vec2 contourUv = sphereUv * 6.5 + vec2(uPhase * 3.7, uPhase * 1.3);
    float elevation = noise2(contourUv * 0.6 + uTime * 0.1) * 2.5;
    elevation += noise2(contourUv * 1.6 - uTime * 0.05) * 0.8;
    float cVal = elevation * 3.0;
    float cf = fract(cVal);
    float cdf = fwidth(cVal);
    float cLine = smoothstep(cdf * 1.4, 0.0, abs(cf - 0.5));
    float cGlow = smoothstep(2.2, 0.0, abs(cf - 0.5) / cdf) * 0.7;
    vec3 contourLineColor = mix(colorLow, colorHigh, clamp(elevation / 3.0, 0.0, 1.0));
    float contourStrength = 1.8 * (1.0 - uHover * 0.9) * vignette;
    gradedColor += contourLineColor * (cLine + cGlow) * contourStrength;

    // Scanlines (drawn on the sphere surface)
    float scanline = sin(sphereUv.y * 320.0 + uTime * 6.0) * 0.02 * (1.0 - uHover * 0.5);
    gradedColor -= vec3(scanline);

    // Border glowing edge
    float borderThickness = 0.02;
    float borderGlow = smoothstep(-borderThickness, 0.0, d);
    float softGlow = exp(d * 28.0) * 0.65;

    // Glowing border uses the same shared gradient, at full neon intensity
    vec3 contourColor = borderGrad * 1.5;
    vec3 finalBorderColor = mix(contourColor, vec3(1.0, 1.0, 1.0), uHover * 0.7);
    float totalGlow = (borderGlow + softGlow) * (1.0 + uHover * 1.8);

    // Combine image with border
    vec3 finalRGB = mix(gradedColor, finalBorderColor, totalGlow);

    // Movie projector flicker
    float flicker = 0.94 + 0.06 * sin(uTime * 28.0) * sin(uTime * 14.5);
    if (hash(floor(uTime * 2.5)) > 0.93) {
      flicker *= 1.2;
    }

    // Translucency control: Center is 0.72 opaque by default, rising to 0.88 on hover, edges are up to 0.95 opaque
    float centerOpacity = mix(0.72, 0.88, uHover);
    float finalAlpha = mix(centerOpacity, 0.95, clamp(totalGlow, 0.0, 1.0));
    float alpha = uOpacity * finalAlpha * flicker;

    gl_FragColor = vec4(finalRGB, alpha);
  }
`;

interface FlashbackOrbProps {
  url: string;
  index: number;
  count: number;
  cameraPathDist: number;
  offsetX: number;
  offsetPerp: number;
  isMobile: boolean;
}

const FlashbackOrb: React.FC<FlashbackOrbProps> = ({
  url,
  index,
  cameraPathDist,
  offsetX,
  offsetPerp,
  isMobile,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const scroll = useScroll();

  // Flat placeholder so the orb (and its contour-line shader) can render
  // immediately, before the real Notion image has loaded — a skeleton state.
  const placeholderTexture = useMemo(() => {
    const tex = new THREE.DataTexture(
      new Uint8Array([60, 60, 60, 255]),
      1,
      1,
      THREE.RGBAFormat
    );
    tex.needsUpdate = true;
    return tex;
  }, []);

  const [texture, setTexture] = useState<THREE.Texture>(placeholderTexture);
  const [aspect, setAspect] = useState(1);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (hovered) {
      window.dispatchEvent(new CustomEvent("mnet:cursor", { detail: "pointer" }));
      document.body.style.cursor = "pointer";
    } else {
      window.dispatchEvent(new CustomEvent("mnet:cursor", { detail: "default" }));
      document.body.style.cursor = "";
    }
    return () => {
      window.dispatchEvent(new CustomEvent("mnet:cursor", { detail: "default" }));
      document.body.style.cursor = "";
    };
  }, [hovered]);

  // Pre-allocated to avoid per-frame GC pressure
  const lerpPosTarget = useRef(new THREE.Vector3());
  const lerpScaleTarget = useRef(new THREE.Vector3());

  // Generate a random unique phase for floating/wobble offset
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);

  // Pre-calculate camera path variables
  const mapAngle = -Math.PI / 2.5;
  const ny = -Math.sin(mapAngle); // ~0.951
  const nz = Math.cos(mapAngle);  // ~0.309

  // Calculate base 3D coordinates based on distance along path
  const centerY = ny * cameraPathDist - 5;
  const centerZ = nz * cameraPathDist;

  // Offset coordinates perpendicularly
  const initialPos = useMemo(() => {
    return new THREE.Vector3(
      offsetX,
      centerY - nz * offsetPerp,
      centerZ + ny * offsetPerp
    );
  }, [offsetX, centerY, centerZ, offsetPerp, ny, nz]);

  // Load texture asynchronously with CORS support and fallback handling
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");

    const loadTexture = (textureUrl: string, isFallback: boolean = false) => {
      loader.load(
        isFallback ? textureUrl : optimizeFlashbackUrl(textureUrl, 800),
        (tex) => {
          tex.minFilter = THREE.LinearFilter;
          const img = tex.image;
          const w = img ? (img.naturalWidth || img.width || 0) : 0;
          const h = img ? (img.naturalHeight || img.height || 0) : 0;
          const aspectVal = w > 0 && h > 0 ? w / h : 1.0;
          setAspect(aspectVal);
          setTexture(tex);
        },
        undefined,
        (err) => {
          console.error("Error loading flashback texture:", textureUrl, err);
          if (!isFallback) {
            // Attempt to load a reliable CORS-compliant fallback image
            const fallbackUrl = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
            console.log("Attempting fallback texture for index", index, ":", fallbackUrl);
            loadTexture(fallbackUrl, true);
          }
        }
      );
    };

    loadTexture(url);
  }, [url, index]);

  const uniforms = useMemo(
    () => ({
      uTexture: { value: null as THREE.Texture | null },
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uGlitch: { value: 0 },
      uHover: { value: 0 },
      uAspect: { value: 1.0 },
      uPhase: { value: phase },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current || !texture) return;

    const time = state.clock.elapsedTime;
    const scrollOffset = scroll.offset;

    // Camera current distance along path
    const d_cam = 20 + scrollOffset * 100;
    const distInFront = d_cam - cameraPathDist;

    // Calculate proximity-based opacity (since camera looks backwards towards origin)
    let opacity = 0;
    if (distInFront >= -5 && distInFront < 5) {
      // Fade in as the camera backs past the item (smoothstep ease-in)
      const t = Math.max(0.0, Math.min(1.0, (distInFront - (-5)) / 10));
      opacity = t * t * (3.0 - 2.0 * t);
    } else if (distInFront >= 5 && distInFront < 45) {
      // Fully visible in camera's field of view
      opacity = 1.0;
    } else if (distInFront >= 45 && distInFront < 65) {
      // Fade out as it recedes into the distance (smoothstep ease-out)
      const t = Math.max(0.0, Math.min(1.0, (65 - distInFront) / 20));
      opacity = t * t * (3.0 - 2.0 * t);
    }

    // Hide at start (Hero overlay) and end (Cube navigation focus)
    if (scrollOffset < 0.1) {
      const heroFade = Math.max(0, (scrollOffset - 0.02) / 0.06);
      opacity *= heroFade;
    }
    // Scale out and disappear synchronously with the contour map (Terrain.tsx)
    const mapFade = (() => {
      const x = Math.max(0, Math.min(1, (scrollOffset - 0.8) / (0.2 - 0.8)));
      return x * x * (3 - 2 * x);
    })();
    opacity *= mapFade;

    // Face the camera
    meshRef.current.lookAt(state.camera.position);

    // Interactive mouse parallax based on depth (closer items move more)
    const parallaxFactor = Math.max(0.4, 2.0 - (distInFront / 35.0) * 1.5);
    const targetParallaxX = state.mouse.x * 0.9 * parallaxFactor;
    const targetParallaxY = state.mouse.y * 0.9 * parallaxFactor;

    // Calculate target position with drifts + hover height + parallax
    const targetX = initialPos.x + Math.sin(time * 0.7 + phase) * 0.25 + targetParallaxX;
    const targetY = (initialPos.y + Math.cos(time * 0.5 + phase) * 0.2) + (hovered ? 0.35 : 0.0) + targetParallaxY;
    const targetZ = initialPos.z + Math.sin(time * 0.4 + phase) * 0.15;

    // Smoothly lerp position for organic inertia fluid movement
    lerpPosTarget.current.set(targetX, targetY, targetZ);
    meshRef.current.position.lerp(lerpPosTarget.current, 0.1);

    // Smoothly scale up/down depending on opacity and hover states
    const targetBaseScale = isMobile
      ? (hovered ? 1.5 : 1.1)
      : (hovered ? 3.8 : 3.0);
    const finalTargetScale = targetBaseScale * opacity;
    lerpScaleTarget.current.setScalar(finalTargetScale);
    meshRef.current.scale.lerp(lerpScaleTarget.current, 0.12);

    // Toggle visibility to save draw calls when mesh is invisible
    meshRef.current.visible = opacity > 0.001;

    // Local rotation wobble — assign (not accumulate) to prevent unbounded float growth
    meshRef.current.rotation.z = Math.sin(time * 0.3 + phase) * 0.08;

    // Uniform updates with smooth lerps
    materialRef.current.uniforms.uTexture.value = texture;
    materialRef.current.uniforms.uTime.value = time;
    materialRef.current.uniforms.uAspect.value = aspect;
    materialRef.current.uniforms.uHover.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uHover.value,
      hovered ? 1.0 : 0.0,
      0.15
    );
    materialRef.current.uniforms.uOpacity.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uOpacity.value,
      opacity,
      0.15
    );

    const scrollSpeed = Math.abs(scroll.delta);
    materialRef.current.uniforms.uGlitch.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uGlitch.value,
      hovered ? 0.0 : (scrollSpeed * 5.0 + 0.05),
      0.06
    );
  });

  return (
    <mesh
      ref={meshRef}
      position={initialPos.toArray()}
      scale={[0, 0, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => {
        setHovered(false);
      }}
    >
      <planeGeometry args={[1.5, 1.5]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
};

interface MemoryFlashbacksProps {
  flashbackUrls?: string[];
}

const MemoryFlashbacks: React.FC<MemoryFlashbacksProps> = ({ flashbackUrls = [] }) => {
  const [urls, setUrls] = useState<string[]>(flashbackUrls);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (urls.length > 0) return;

    const parseCache = (): boolean => {
      if (typeof window === "undefined") return false;
      const raw = sessionStorage.getItem("mnet_notion_cache");
      if (!raw) return false;
      try {
        const data = JSON.parse(raw);
        const list: string[] = [];
        data.portfolios?.forEach((p: { imageUrl?: string }) => {
          if (p.imageUrl) list.push(p.imageUrl);
        });
        const groups = [data.leads, data.seniorMembers, data.activeMembers];
        groups.forEach((g) => {
          g?.forEach((m: { icon?: string }) => {
            if (m.icon && (m.icon.startsWith("http") || m.icon.startsWith("/"))) {
              list.push(m.icon);
            }
          });
        });

        // Filter out placeholders
        const filtered = Array.from(new Set(list)).filter(
          (u) => !u.includes("placehold.co") && !u.includes("placeholder")
        );

        if (filtered.length > 0) {
          setUrls(filtered);
          return true;
        }
      } catch (e) {
        console.error("Error parsing notion cache inside flashbacks:", e);
      }
      return false;
    };

    const loaded = parseCache();
    if (!loaded) {
      // Poll storage briefly
      const interval = setInterval(() => {
        if (parseCache()) clearInterval(interval);
      }, 500);

      const timeout = setTimeout(() => {
        clearInterval(interval);
        // If still empty after 4.5 seconds, use fallback images
        setUrls(FALLBACK_IMAGES);
      }, 4500);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [urls.length]);

  const activeUrls = useMemo(() => {
    const finalUrls = [...urls];
    while (finalUrls.length < 12) {
      const extra = FALLBACK_IMAGES[finalUrls.length % FALLBACK_IMAGES.length];
      finalUrls.push(extra);
    }
    return finalUrls.slice(0, 16); // Maximum 16 meshes
  }, [urls]);

  // Pre-calculate positions to keep render runs deterministic
  const layouts = useMemo(() => {
    return activeUrls.map((url, i) => {
      const count = activeUrls.length;
      // Distance values spread along active camera path range (22 to 75)
      const pathDist = 22 + (i / (count - 1)) * 53;

      // Lay out in alternating lanes further away from the center line / contour map
      const isEven = i % 2 === 0;
      const baseOffset = isMobile ? (isEven ? 4.5 : -4.5) : (isEven ? 14.5 : -14.5);
      const offsetX = baseOffset + (Math.sin(i * 1.5) * (isMobile ? 1.0 : 2.5));

      // Normal perpendicular offset spread wider on mobile (vertical spread)
      const perpMultiplier = isMobile ? 18.0 : 9.0;
      const offsetPerp = (Math.cos(i * 2.2) * perpMultiplier) + (Math.sin(i) * (isMobile ? 4.0 : 2.0));

      return {
        url,
        index: i,
        count,
        pathDist,
        offsetX,
        offsetPerp,
      };
    });
  }, [activeUrls, isMobile]);

  return (
    <group>
      {layouts.map((cfg, idx) => (
        <FlashbackOrb
          key={`${cfg.url}-${idx}`}
          url={cfg.url}
          index={cfg.index}
          count={cfg.count}
          cameraPathDist={cfg.pathDist}
          offsetX={cfg.offsetX}
          offsetPerp={cfg.offsetPerp}
          isMobile={isMobile}
        />
      ))}
    </group>
  );
};

export default MemoryFlashbacks;
