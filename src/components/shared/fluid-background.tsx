'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { MeshDistortMaterial } from '@react-three/drei'
import type * as THREE from 'three'

// ---------------------------------------------------------------------------
// FluidBackground — Three.js animated blob canvas
//
// Three overlapping distorted spheres with deep blue, purple, and emerald
// lighting create an abstract fluid atmosphere behind the marketing hero.
// Positioned fixed, pointer-events-none so it never interferes with UI.
// ---------------------------------------------------------------------------

interface BlobProps {
  color: string
  position: [number, number, number]
  scale: number
  speed: number
  distort: number
  rotationFactor?: number
}

function Blob({ color, position, scale, speed, distort, rotationFactor = 1 }: BlobProps) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.rotation.x = t * 0.055 * speed * rotationFactor
    ref.current.rotation.y = t * 0.085 * speed * rotationFactor
    ref.current.rotation.z = t * 0.032 * speed * rotationFactor
    // Subtle sinusoidal drift
    ref.current.position.y = position[1] + Math.sin(t * 0.28 * speed) * 0.35
    ref.current.position.x = position[0] + Math.cos(t * 0.22 * speed) * 0.2
  })

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <sphereGeometry args={[1, 64, 64]} />
      <MeshDistortMaterial
        color={color}
        distort={distort}
        speed={speed * 1.2}
        roughness={0.05}
        metalness={0.15}
        transparent
        opacity={0.55}
      />
    </mesh>
  )
}

function Scene() {
  return (
    <>
      {/* Fog for depth — matches bg-root color */}
      <fog attach="fog" args={['#020409', 10, 22]} />

      {/* Lights */}
      <ambientLight intensity={0.12} />
      {/* Key blue light — top-left */}
      <pointLight position={[-5, 4, 4]} color="#3B82F6" intensity={8} />
      {/* Fill purple light — right */}
      <pointLight position={[5, -2, 3]} color="#8B5CF6" intensity={6} />
      {/* Rim emerald light — top */}
      <pointLight position={[1, 5, 1]} color="#10B981" intensity={4} />
      {/* Deep back purple */}
      <pointLight position={[0, -4, -5]} color="#7C3AED" intensity={5} />

      {/* Main blue blob — large, left */}
      <Blob
        color="#1D4ED8"
        position={[-3.2, 0.5, -2.5]}
        scale={2.9}
        speed={0.55}
        distort={0.38}
        rotationFactor={1}
      />

      {/* Purple blob — right */}
      <Blob
        color="#6D28D9"
        position={[3.0, -1.2, -3.5]}
        scale={2.4}
        speed={0.42}
        distort={0.44}
        rotationFactor={-1}
      />

      {/* Emerald blob — center-back, smaller */}
      <Blob
        color="#064E3B"
        position={[0.8, 2.8, -4.5]}
        scale={1.9}
        speed={0.72}
        distort={0.36}
        rotationFactor={0.8}
      />
    </>
  )
}

export function FluidBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 6], fov: 55, near: 0.1, far: 30 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
