export const vertexShader = `
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

export const fragmentShader = `
  varying vec2 vUv;
  varying float vElevation;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uScroll;
  uniform float uContourFrequency;

  void main() {
    float t = clamp(vElevation / 3.0, 0.0, 1.0);
    vec3 colorLow = vec3(0.008, 0.051, 0.671);
    vec3 colorHigh = vec3(0.82, 0.008, 0.224);
    vec3 lineColor = mix(colorLow, colorHigh, t);
    
    float frequency = uContourFrequency;
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
