"use client";

import { useRef, useMemo, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useGLTF,
  Environment,
  Lightformer,
  ContactShadows,
  AdaptiveDpr,
  PerformanceMonitor,
} from "@react-three/drei";
import * as THREE from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";

const MODEL = "/models/hemc-bottle.glb";
useGLTF.preload(MODEL);

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type ProgressRef = MutableRefObject<number>;

function Bottle({ progress, compact }: { progress: ProgressRef; compact: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { scene: source, animations } = useGLTF(MODEL);
  // Clone per mount (skinning-safe) so client-side nav back/forward always gets a
  // fresh, correctly-normalised model — the cached GLTF scene must not be reused/mutated.
  const scene = useMemo(() => cloneSkinned(source), [source]);
  // own mixer so nothing competes with our scroll scrubbing
  const mixer = useMemo(() => new THREE.AnimationMixer(scene), [scene]);
  const clipHalf = useRef(1.6);

  // start the (single) action; we scrub mixer time by scroll; normalise size/origin
  const started = useRef(false);
  if (!started.current && animations.length) {
    started.current = true;
    const a = mixer.clipAction(animations[0]);
    a.play();
    clipHalf.current = animations[0].duration * 0.5; // lid fully open at 50%
    scene.traverse((o) => {
      o.frustumCulled = false;
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = false;
      // upgrade to premium clear-coated plastic for a realistic studio look
      const src = mesh.material as THREE.MeshStandardMaterial;
      const phys = new THREE.MeshPhysicalMaterial({
        map: src.map ?? null,
        aoMap: src.aoMap ?? null,
        aoMapIntensity: 0.9,
        color: new THREE.Color("#ffffff"),
        metalness: 0,
        // matte HDPE base with a soft clear top-coat → real supplement-bottle finish
        roughness: 0.46,
        clearcoat: 0.7,
        clearcoatRoughness: 0.3,
        sheen: 0.28,
        sheenColor: new THREE.Color("#eafff4"),
        sheenRoughness: 0.6,
        envMapIntensity: 1.1,
      });
      if (phys.map) {
        phys.map.anisotropy = 16;
        phys.map.colorSpace = THREE.SRGBColorSpace;
      }
      mesh.material = phys;
    });
    // centre on origin + scale so max dimension ≈ 1 unit.
    // Measure the ORIGINAL (its world matrices are valid); a freshly-cloned
    // scene's matrices aren't updated yet, which gave a wrong fit on nav-back.
    source.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(source);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = 1 / Math.max(size.x, size.y, size.z);
    scene.scale.setScalar(s);
    scene.position.set(-center.x * s, -center.y * s, -center.z * s);
  }

  // right-of-center start, drifting to centre. Compact (mobile) starts centred.
  const startX = compact ? 0 : 1.95;
  const s0 = compact ? 1.42 : 1.72;
  const s1 = compact ? 1.6 : 1.82;
  const y0 = compact ? -1.05 : -0.2; // mobile: sit low, below the copy
  const y1 = compact ? -0.8 : -0.55; // settle as a centred backdrop (mobile stays lower)

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const p = clamp(progress.current);
    // p is the OPENING progress (0→1). Bottle opens + settles to centre, then holds
    // centred as a fixed backdrop while the page content scrolls over it.
    const drift = easeOut(p);
    const openT = easeInOut(p);
    mixer.setTime(openT * clipHalf.current);

    g.position.x = lerp(startX, 0, drift);
    g.position.y = lerp(y0, y1, drift);
    g.scale.setScalar(lerp(s0, s1, drift));
    // face the HEMC label (~232deg) with a gentle settle toward front
    g.rotation.y = THREE.MathUtils.degToRad(232) + (1 - drift) * 0.28;
    g.rotation.z = (1 - drift) * -0.05;
  });

  return (
    <group ref={group} position={[0, 0, 0]}>
      <primitive object={scene} />
    </group>
  );
}

function Rig() {
  const { camera } = useThree();
  const ref = useRef(false);
  if (!ref.current) {
    ref.current = true;
    camera.position.set(0, 0.1, 7.6);
    camera.lookAt(0, 0, 0);
  }
  return null;
}

export default function BottleScene({
  progress,
  compact,
  active,
}: {
  progress: ProgressRef;
  compact: boolean;
  active: boolean;
}) {
  const dpr = useRef<[number, number]>([1, compact ? 1.7 : 2]);
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={dpr.current}
      camera={{ fov: 30, position: [0, 0.1, 7.6] }}
      style={{ width: "100%", height: "100%" }}
    >
      <Rig />
      <PerformanceMonitor
        onDecline={() => (dpr.current = [1, 1.25])}
        onIncline={() => (dpr.current = [1, compact ? 1.7 : 2])}
      />
      <AdaptiveDpr pixelated={false} />

      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 6, 5]} intensity={2.1} />
      <directionalLight position={[-5, 2, 1]} intensity={0.55} color="#bfe3cf" />
      {/* crisp rim for a real product-shot edge highlight */}
      <spotLight position={[-3, 5, -4]} angle={0.6} penumbra={1} intensity={2.2} color="#ffffff" />

      <Bottle progress={progress} compact={compact} />

      <ContactShadows
        position={[0, compact ? -1.7 : -1.85, 0]}
        opacity={0.38}
        scale={9}
        blur={2.8}
        far={4}
        resolution={512}
        color="#0a3d29"
      />

      {/* studio soft-box rig → realistic reflections on the curved plastic */}
      <Environment resolution={512}>
        {/* key soft-box overhead */}
        <Lightformer form="rect" intensity={3.2} position={[0, 5, 3]} scale={[9, 4, 1]} color="#ffffff" />
        {/* tall side strips → elongated highlights that read as real bottle plastic */}
        <Lightformer form="rect" intensity={2.4} position={[-4, 1, 3.5]} rotation-y={Math.PI / 4} scale={[1.6, 7, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={1.8} position={[4, 1, 3.5]} rotation-y={-Math.PI / 4} scale={[1.6, 7, 1]} color="#f4fff9" />
        <Lightformer form="rect" intensity={1.2} position={[-2.4, 0, 4]} scale={[0.6, 6, 1]} color="#eafff4" />
        <Lightformer form="rect" intensity={1.2} position={[2.4, 0, 4]} scale={[0.6, 6, 1]} color="#eafff4" />
        {/* warm-ish bottom bounce + fill */}
        <Lightformer form="rect" intensity={2.2} position={[0, -3, 2]} scale={[9, 3, 1]} color="#ffffff" />
        <Lightformer form="ring" intensity={1.2} position={[3, 3, -3]} scale={3} color="#d7f0e2" />
      </Environment>
    </Canvas>
  );
}
