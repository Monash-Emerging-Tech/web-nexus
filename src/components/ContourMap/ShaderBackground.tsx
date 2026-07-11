"use client";

import { createElement, useEffect, useState } from "react";

interface ShaderScriptProps {
  type: string;
  source: string;
  name?: string;
  dataSize?: string;
}

function ShaderScript({ type, source, name, dataSize }: ShaderScriptProps) {
  return createElement("script", {
    ...(name ? { name } : {}),
    ...(dataSize ? { "data-size": dataSize } : {}),
    type,
    dangerouslySetInnerHTML: { __html: source },
  } as Record<string, unknown>);
}

// Registers the "shader-art" custom element. shader-art's class extends
// HTMLElement at module scope, so it must stay behind a dynamic import —
// importing it eagerly would crash during SSR.
//
// The <shader-art> element itself isn't mounted until SpeedLines.tsx
// confirms the warp streak effect has played through and faded out, so
// there's no plasma (not even a static first frame) competing for
// attention while the warp transition is still the focal animation.
export function ShaderBackground() {
  const [canPlay, setCanPlay] = useState(false);

  useEffect(() => {
    let active = true;

    void Promise.all([import("shader-art"), import("@shader-art/plugin-uniform")])
      .then(([shaderArtModule, uniformPluginModule]) => {
        if (!active) return;
        const { ShaderArt } = shaderArtModule;
        const { UniformPlugin } = uniformPluginModule;
        ShaderArt.register([() => new UniformPlugin()]);
      })
      .catch(() => {
        // Keep the section functional even if ShaderArt fails to load.
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleSpeedlinesGone = () => setCanPlay(true);
    window.addEventListener("mnet:speedlines-gone", handleSpeedlinesGone);
    return () => window.removeEventListener("mnet:speedlines-gone", handleSpeedlinesGone);
  }, []);

  if (!canPlay) {
    return <div className="absolute inset-0 z-0 bg-black pointer-events-none" />;
  }

  return (
    <div className="absolute inset-0 z-0 bg-black pointer-events-none">
      <shader-art autoPlay className="shader-bg">
        <uniform type="float" name="scale" value=".1" min="0.2" max="4" step="0.01" no-gui="true" />
        <uniform type="float" name="ax" value="5" min="1" max="15" step="0.01" no-gui="true" />
        <uniform type="float" name="ay" value="7" min="1" max="15" step="0.01" no-gui="true" />
        <uniform type="float" name="az" value="9" min="1" max="15" step="0.01" no-gui="true" />
        <uniform type="float" name="aw" value="13" min="1" max="15" step="0.01" no-gui="true" />
        <uniform type="float" name="bx" value="1" min="-1" max="1" step="0.01" no-gui="true" />
        <uniform type="float" name="by" value="1" min="-1" max="1" step="0.01" no-gui="true" />
        <uniform type="color" name="color1" value="#f20544" no-gui="true" />
        <uniform type="color" name="color2" value="#4F47E6" no-gui="true" />
        <uniform type="color" name="color3" value="#040FD9" no-gui="true" />
        <uniform type="color" name="color4" value="#040DBF" no-gui="true" />
        <ShaderScript
          type="buffer"
          name="position"
          dataSize="2"
          source="[-1, 1, -1,-1, 1,1, 1, 1, -1,-1, 1,-1]"
        />
        <ShaderScript type="buffer" name="uv" dataSize="2" source="[0, 0, 0, 1, 1,0, 1, 0, 0, 1, 1, 1]" />
        <ShaderScript
          type="vert"
          source={`precision highp float;
attribute vec4 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = position;
}`}
        />
        <ShaderScript
          type="frag"
          source={`precision highp float;
varying vec2 vUv;
uniform float time;
uniform float scale;
uniform vec2 resolution;
uniform vec3 color1, color2, color3, color4;
const float PI = 3.141592654;
uniform float ax, ay, az, aw;
uniform float bx, by;
float cheapNoise(vec3 stp) {
  vec3 p = vec3(stp.st, stp.p);
  vec4 a = vec4(ax, ay, az, aw);
  return mix(
    sin(p.z + p.x * a.x + cos(p.x * a.x - p.z)) * cos(p.z + p.y * a.y + cos(p.y * a.x + p.z)),
    sin(1. + p.x * a.z + p.z + cos(p.y * a.w - p.z)) * cos(1. + p.y * a.w + p.z + cos(p.x * a.x + p.z)),
    .436
  );
}
void main() {
  vec2 aR = vec2(resolution.x/resolution.y, 1.);
  vec2 st = vUv * aR * scale;
  float S = sin(time * .005);
  float C = cos(time * .005);
  vec2 v1 = vec2(cheapNoise(vec3(st, 2.)), cheapNoise(vec3(st, 1.)));
  vec2 v2 = vec2(
    cheapNoise(vec3(st + bx*v1 + vec2(C * 1.7, S * 9.2), 0.15 * time)),
    cheapNoise(vec3(st + by*v1 + vec2(S * 8.3, C * 2.8), 0.126 * time))
  );
  float n = .5 + .5 * cheapNoise(vec3(st + v2, 0.));
  vec3 color = mix(color1, color2, clamp((n*n)*8.,0.0,1.0));
  color = mix(color, color3, clamp(length(v1),0.0,1.0));
  color = mix(color, color4, clamp(length(v2.x),0.0,1.0));
  color /= n*n + n * 7.;
  gl_FragColor = vec4(color,1.);
}`}
        />
      </shader-art>
    </div>
  );
}
