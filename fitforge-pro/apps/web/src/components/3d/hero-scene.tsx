// @ts-nocheck
"use client";

import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Float,
  MeshDistortMaterial,
  Sphere,
  Torus,
  Box,
  Cylinder,
  Environment,
  Sparkles,
  Stars,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";

// Animated Dumbbell (Barbell)
function Barbell() {
  const group = useRef<THREE.Group>(null!);
  const innerRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = Math.sin(t * 0.3) * 0.4;
    group.current.rotation.x = Math.sin(t * 0.2) * 0.15;
    group.current.position.y = Math.sin(t * 0.5) * 0.1;
    innerRef.current.rotation.x = t * 0.4;
  });

  const goldMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#F5A623",
        metalness: 0.9,
        roughness: 0.1,
        emissive: "#D4881A",
        emissiveIntensity: 0.2,
      }),
    []
  );

  const darkMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#1A1A24",
        metalness: 0.8,
        roughness: 0.2,
      }),
    []
  );

  return (
    <group ref={group} position={[0, 0, 0]}>
      {/* Bar */}
      <mesh material={darkMaterial} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 3.5, 16]} />
      </mesh>

      {/* Left Plates */}
      <group position={[-1.4, 0, 0]} ref={innerRef}>
        <mesh material={goldMaterial} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.55, 0.55, 0.15, 32]} />
        </mesh>
        <mesh material={darkMaterial} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.45, 0.45, 0.12, 32]} />
        </mesh>
        <mesh material={goldMaterial} rotation={[0, 0, Math.PI / 2]} position={[-0.18, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.1, 32]} />
        </mesh>
      </group>

      {/* Right Plates */}
      <group position={[1.4, 0, 0]}>
        <mesh material={goldMaterial} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.55, 0.55, 0.15, 32]} />
        </mesh>
        <mesh material={darkMaterial} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.45, 0.45, 0.12, 32]} />
        </mesh>
        <mesh material={goldMaterial} rotation={[0, 0, Math.PI / 2]} position={[0.18, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.1, 32]} />
        </mesh>
      </group>

      {/* Collar Clamps */}
      <mesh material={goldMaterial} position={[-0.85, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.09, 0.09, 0.12, 16]} />
      </mesh>
      <mesh material={goldMaterial} position={[0.85, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.09, 0.09, 0.12, 16]} />
      </mesh>
    </group>
  );
}

// Floating Kettlebell
function Kettlebell({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    ref.current.rotation.z = Math.sin(t * 0.7) * 0.3;
    ref.current.rotation.x = Math.cos(t * 0.5) * 0.2;
  });

  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#2A2A3A",
        metalness: 0.9,
        roughness: 0.15,
        emissive: "#F5A623",
        emissiveIntensity: 0.05,
      }),
    []
  );

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1} position={position}>
      <group ref={ref} scale={0.6}>
        {/* Body */}
        <mesh material={mat}>
          <sphereGeometry args={[0.4, 32, 32]} />
        </mesh>
        {/* Handle */}
        <mesh material={mat} position={[0, 0.5, 0]}>
          <torusGeometry args={[0.25, 0.06, 16, 32, Math.PI]} />
        </mesh>
        {/* Bottom flat */}
        <mesh material={mat} position={[0, -0.38, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.05, 32]} />
        </mesh>
      </group>
    </Float>
  );
}

// Floating Rings / Plates
function FloatingPlate({ position, color = "#F5A623", scale = 1 }: {
  position: [number, number, number];
  color?: string;
  scale?: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    ref.current.rotation.x = state.clock.getElapsedTime() * 0.3;
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.5;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.8} floatIntensity={1.5} position={position}>
      <mesh ref={ref} scale={scale}>
        <torusGeometry args={[0.35, 0.08, 16, 64]} />
        <meshStandardMaterial
          color={color}
          metalness={0.9}
          roughness={0.1}
          emissive={color}
          emissiveIntensity={0.15}
        />
      </mesh>
    </Float>
  );
}

// Abstract energy sphere
function EnergySphere() {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    ref.current.rotation.x = state.clock.getElapsedTime() * 0.1;
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.15;
  });

  return (
    <Float speed={1} rotationIntensity={0.3} floatIntensity={0.5} position={[0, 0, -2]}>
      <mesh ref={ref} scale={2.5}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color="#F5A623"
          roughness={0.2}
          metalness={0.5}
          distort={0.3}
          speed={2}
          opacity={0.08}
          transparent
          wireframe={false}
        />
      </mesh>
    </Float>
  );
}

// Particle Field
function ParticleField() {
  return (
    <Sparkles
      count={120}
      scale={10}
      size={1.2}
      speed={0.3}
      opacity={0.6}
      color="#F5A623"
      noise={1}
    />
  );
}

// Camera mouse follow
function CameraRig() {
  useFrame((state) => {
    const { mouse } = state;
    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      mouse.x * 0.5,
      0.02
    );
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      mouse.y * 0.3 + 0.5,
      0.02
    );
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

export function HeroScene() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0.5, 5], fov: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={1.5}
            color="#FFD166"
            castShadow
          />
          <directionalLight
            position={[-5, -5, -5]}
            intensity={0.5}
            color="#FF6B35"
          />
          <pointLight position={[0, 2, 2]} intensity={2} color="#F5A623" />
          <pointLight position={[-3, -2, -3]} intensity={0.8} color="#4a9eff" />

          {/* Environment */}
          <Stars
            radius={100}
            depth={50}
            count={3000}
            factor={3}
            saturation={0}
            fade
            speed={0.5}
          />

          {/* Main Barbell */}
          <Barbell />

          {/* Floating gym equipment */}
          <Kettlebell position={[-3, 1, -1]} />
          <Kettlebell position={[3.5, -1, -0.5]} />

          {/* Floating Plates */}
          <FloatingPlate position={[-2.5, -1.5, 1]} color="#F5A623" scale={1.2} />
          <FloatingPlate position={[2.8, 1.5, 0.5]} color="#FFD166" scale={0.8} />
          <FloatingPlate position={[-1.5, 2.5, -1]} color="#FF6B35" scale={0.6} />
          <FloatingPlate position={[1.8, -2, 1.5]} color="#F5A623" scale={1} />

          {/* Energy Sphere background */}
          <EnergySphere />

          {/* Particles */}
          <ParticleField />

          {/* Ground shadow */}
          <ContactShadows
            position={[0, -2, 0]}
            opacity={0.4}
            scale={10}
            blur={2}
            color="#F5A623"
          />

          {/* Camera Follow */}
          <CameraRig />
        </Suspense>
      </Canvas>
    </div>
  );
}
