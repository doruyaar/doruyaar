"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { profile } from "@/content/mock";
import {
  COUNT,
  GRAPH_TILT,
  ambientShape,
  cloudShape,
  graphShape,
  networkShape,
  rng,
  textShape,
  warehouseShape,
} from "./shapes";
import { SHAPE_COUNT, particleState } from "./state";

const vertex = /* glsl */ `
  uniform float uShape;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uVelocity;

  attribute vec3 aPos0;
  attribute vec3 aPos1;
  attribute vec3 aPos2;
  attribute vec3 aPos3;
  attribute vec3 aPos4;
  attribute vec3 aPos5;
  attribute vec3 aPos6;
  attribute float aRand;

  varying float vTwinkle;
  varying float vBurst;
  varying float vGlow;

  vec3 pick(int i) {
    if (i == 0) return aPos0;
    if (i == 1) return aPos1;
    if (i == 2) return aPos2;
    if (i == 3) return aPos3;
    if (i == 4) return aPos4;
    if (i == 5) return aPos5;
    return aPos6;
  }

  void main() {
    float s = clamp(uShape, 0.0, float(${SHAPE_COUNT - 1}));
    int i = int(floor(s));
    float t = fract(s);
    if (i >= ${SHAPE_COUNT - 1}) { i = ${SHAPE_COUNT - 2}; t = 1.0; }

    vec3 a = pick(i);
    vec3 b = pick(i + 1);

    // Each particle leaves a little earlier or later → organic morph.
    float tt = clamp((t - aRand * 0.35) / 0.65, 0.0, 1.0);
    tt = tt * tt * (3.0 - 2.0 * tt);
    vec3 p = mix(a, b, tt);

    // Mid-morph burst: particles swell outward then settle.
    float burst = sin(tt * 3.14159);
    vec3 dir = normalize(p + vec3(0.001, 0.002, 0.003));
    p += dir * burst * (0.5 + aRand * 1.2);
    p.z += burst * (aRand - 0.5) * 2.0;

    // Idle drift so the cloud always breathes.
    float drift = 0.035 + uVelocity * 0.4;
    p += drift * vec3(
      sin(uTime * 0.7 + aRand * 31.0),
      cos(uTime * 0.6 + aRand * 17.0),
      sin(uTime * 0.5 + aRand * 11.0)
    );

    // Shape 4 is a 3D graph: sway it gently around its (tilted) vertical
    // axis so the depth reads, and run a scan line across the surface like
    // a live readout.
    float graph = max(0.0, 1.0 - abs(s - 4.0));
    vec3 axis = vec3(0.0, cos(${GRAPH_TILT.toFixed(3)}), sin(${GRAPH_TILT.toFixed(3)}));
    float ang = graph * 0.28 * sin(uTime * 0.45);
    float ca = cos(ang);
    float sa = sin(ang);
    p = p * ca + cross(axis, p) * sa + axis * dot(axis, p) * (1.0 - ca);
    float scan = pow(max(0.0, sin(p.x * 1.1 - uTime * 1.3)), 36.0);
    float glow = graph * scan;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (0.55 + aRand * 0.9) * (14.0 / -mv.z) * (1.0 + glow * 0.5);

    vTwinkle = 0.55 + 0.45 * sin(uTime * 1.8 + aRand * 60.0);
    vBurst = burst;
    vGlow = glow;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uAccent;
  uniform float uOpacity;
  varying float vTwinkle;
  varying float vBurst;
  varying float vGlow;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.15, d);
    vec3 c = mix(uColor, uAccent, clamp(vBurst * 0.9 + vGlow, 0.0, 1.0));
    gl_FragColor = vec4(c, a * uOpacity * (vTwinkle + vGlow * 0.6));
  }
`;

type Palette = { color: string; accent: string };

function Particles({ color, accent }: Palette) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const group = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const shapes = [
      textShape(profile.name, COUNT, { width: 13 }),
      cloudShape(),
      warehouseShape(),
      networkShape(),
      graphShape(),
      ambientShape(),
      textShape(
        profile.name
          .split(" ")
          .map((w) => w[0])
          .join(""),
        COUNT,
        { width: 7.5, weight: 700, depth: 0.6 },
      ),
    ];
    shapes.forEach((arr, i) =>
      g.setAttribute(`aPos${i}`, new THREE.BufferAttribute(arr, 3)),
    );
    // Three needs a `position` attribute for bounding/culling; reuse shape 0.
    g.setAttribute("position", new THREE.BufferAttribute(shapes[0], 3));
    const rand = new Float32Array(COUNT);
    const r = rng(101);
    for (let i = 0; i < COUNT; i++) rand[i] = r();
    g.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 30);
    return g;
  }, []);

  const uniforms = useMemo(
    () => ({
      uShape: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: 2.6 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uOpacity: { value: 1 },
      uVelocity: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uAccent: { value: new THREE.Color(accent) },
    }),
    [color, accent],
  );

  useFrame((state, dt) => {
    const m = mat.current;
    if (!m) return;
    const k = Math.min(1, dt * 5.5); // smoothing toward scroll-driven targets
    m.uniforms.uTime.value = state.clock.elapsedTime;
    m.uniforms.uShape.value = THREE.MathUtils.lerp(m.uniforms.uShape.value, particleState.shape, k);
    m.uniforms.uOpacity.value = THREE.MathUtils.lerp(m.uniforms.uOpacity.value, particleState.opacity, k);
    // decay velocity feed
    particleState.velocity = THREE.MathUtils.lerp(particleState.velocity, 0, Math.min(1, dt * 3));
    m.uniforms.uVelocity.value = particleState.velocity;

    if (group.current) {
      const mobile = viewport.aspect < 1;
      const targetX = mobile ? 0 : particleState.offsetX;
      const targetS = mobile ? 0.62 : Math.min(1, viewport.aspect / 1.6);
      group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, targetX, Math.min(1, dt * 2.5));
      const s = THREE.MathUtils.lerp(group.current.scale.x, targetS, Math.min(1, dt * 2.5));
      group.current.scale.setScalar(s);
      // Slow parallax tilt with the mouse.
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, state.pointer.x * 0.12, dt * 2);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -state.pointer.y * 0.08, dt * 2);
    }
  });

  return (
    <group ref={group}>
      <points geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          ref={mat}
          vertexShader={vertex}
          fragmentShader={fragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

export default function ParticleScene({
  color = "#e8e8e6",
  accent = "#6cf0c2",
}: Partial<Palette>) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 16], fov: 42, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        eventSource={document.body}
        eventPrefix="client"
      >
        <Particles color={color} accent={accent} />
      </Canvas>
    </div>
  );
}
