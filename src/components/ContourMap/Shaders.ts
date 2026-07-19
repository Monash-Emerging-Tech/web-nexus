export const vertexShader = `
  varying vec2 vUv;
  varying float vElevation;
  uniform float uTime;
  uniform float uScroll;
  
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
    
    // Calculate noise elevation
    float elevation = noise(pos * 0.15 + uTime * 0.1) * 2.5;
    elevation += noise(pos * 0.4 - uTime * 0.05) * 0.8;
    vElevation = elevation;
    
    // 0.5 pages out of 4 total pages = 0.125 uScroll range
    float bend = smoothstep(0.0, 0.125, uScroll);
    float baseRadius = 9.0;
    
    vec3 newPosition;
    if (bend < 0.0001) {
       newPosition = vec3(pos.x, pos.y, elevation);
    } else {
       // Bending radius goes from infinity (flat) to baseRadius (sphere)
       float R = baseRadius / bend;
       float r = length(pos);
       float angle = (r > 0.0001) ? atan(pos.y, pos.x) : 0.0;
       
       // Arc length is r. Angle on the curled surface is r / R.
       float phi = r / R;
       
       // Surface of the curled plane
       vec3 surfacePos = vec3(
         R * sin(phi) * cos(angle),
         R * sin(phi) * sin(angle),
         R * cos(phi) - R + baseRadius * bend
       );
       
       // Normal vector at this point on the curled plane
       vec3 normal = vec3(
         sin(phi) * cos(angle),
         sin(phi) * sin(angle),
         cos(phi)
       );
       
       // Flatten the surface as we reach 0.4 scroll pages (uScroll = 0.1)
       float surfaceEven = smoothstep(0.1, 0.05, uScroll);
       
       // Add elevation along the normal
       newPosition = surfacePos + normal * (elevation * surfaceEven);
    }
    
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
  uniform float uOpacity;

  void main() {
    float t = clamp(vElevation / 3.0, 0.0, 1.0);
    // Blue-Red Gradient matching memory flashback bubbles
    vec3 colorLow = vec3(3.0 / 255.0, 12.0 / 255.0, 171.0 / 255.0); // #030CAB
    vec3 colorHigh = vec3(220.0 / 255.0, 0.0 / 255.0, 59.0 / 255.0); // #DC003B
    vec3 lineColor = mix(colorLow, colorHigh, t);
    
    // --- THE FIX: DYNAMIC FREQUENCY ---
    // Track the scroll to see how far zoomed out we are.
    // As uScroll goes from 0.0 to 0.5 (halfway down the page), 
    // the line count drops from 100% (1.0) down to 20% (0.2).
    float zoomOutProgress = smoothstep(0.0, 0.5, uScroll);
    float currentFrequency = uContourFrequency * mix(1.0, 0.2, zoomOutProgress);
    
    // Use our new currentFrequency instead of the static uContourFrequency
    float val = vElevation * currentFrequency;
    
    float f = fract(val);
    float df = fwidth(val);
    float thickness = 1.0; 
    float lineMask = smoothstep(df * (thickness + 1.0), df * thickness, abs(f - 0.5));
    float glow = smoothstep(1.5, 0.0, abs(f - 0.5) / df) * 0.4;
    
    vec3 finalColor = lineColor * (lineMask + glow);
    
    // Spotlight effect (fades out as we morph into a ball)
    float spotlightFade = smoothstep(0.15, 0.05, uScroll);
    float spotlightDist = distance(vUv, uMouse);
    float spotlightSpread = 100.0;
    float spotlightGlow = exp(-spotlightDist * spotlightDist * spotlightSpread) * 0.6;
    finalColor += lineColor * spotlightGlow * spotlightFade;

    // Fade out edges only when it's a flat plane
    float edgeFade = 1.0 - smoothstep(0.3, 0.5, length(vUv - 0.5));
    
    // 0.5 pages out of 4 total pages = 0.125 uScroll range
    float warpProgress = smoothstep(0.0, 0.125, uScroll);
    float currentAlpha = mix(edgeFade, 1.0, warpProgress); // fully visible as a ball
    
    gl_FragColor = vec4(finalColor, currentAlpha * uOpacity);
  }
`;