import React, { useMemo } from 'react'
import * as THREE from 'three'

// ── reusable plank component ───────────────────────────────────────────────────

function Plank({ position, args, color, roughness = 0.65, metalness = 0.12, emissive, emissiveIntensity = 0, rotation }) {
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        roughness,
        metalness,
        emissive: emissive ? new THREE.Color(emissive) : undefined,
        emissiveIntensity,
      }),
    [color, roughness, metalness, emissive, emissiveIntensity]
  )

  return (
    <mesh position={position} material={material} castShadow receiveShadow rotation={rotation}>
      <boxGeometry args={args} />
    </mesh>
  )
}

// ── decorative bookend (L-shape made of two thin boxes) ────────────────────────

function Bookend({ position }) {
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1a1a2a',
        metalness: 0.8,
        roughness: 0.3,
      }),
    []
  )
  return (
    <group position={position}>
      {/* vertical piece */}
      <mesh material={mat} castShadow>
        <boxGeometry args={[0.03, 0.22, 0.28]} />
        <primitive object={mat} attach="material" />
      </mesh>
      {/* horizontal foot */}
      <mesh material={mat} position={[0.05, -0.1, 0]} castShadow>
        <boxGeometry args={[0.13, 0.03, 0.28]} />
      </mesh>
    </group>
  )
}

// ── decorative globe with ring ─────────────────────────────────────────────────

function Globe({ position }) {
  const globeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1a4a5c',
        roughness: 0.4,
        metalness: 0.3,
        emissive: new THREE.Color('#0a2030'),
        emissiveIntensity: 0.3,
      }),
    []
  )
  const ringMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#b0b8c8',
        roughness: 0.25,
        metalness: 0.75,
      }),
    []
  )

  return (
    <group position={position}>
      <mesh material={globeMat} castShadow>
        <sphereGeometry args={[0.12, 24, 24]} />
      </mesh>
      {/* ring tilted 30° so it's visible from front */}
      <mesh material={ringMat} rotation={[Math.PI / 6, 0, 0]} castShadow>
        <torusGeometry args={[0.17, 0.008, 12, 48]} />
      </mesh>
    </group>
  )
}

// ── shelf edge strip (front lip) ──────────────────────────────────────────────

function EdgeStrip({ position, width }) {
  return (
    <Plank
      position={position}
      args={[width, 0.015, 0.012]}
      color="#7d5030"
      roughness={0.5}
      metalness={0.15}
    />
  )
}

// ── main bookshelf ─────────────────────────────────────────────────────────────

export default function Bookshelf() {
  const shelfWidth      = 6.2
  const shelfDepth      = 0.32
  const plankThickness  = 0.07
  const sideThickness   = 0.08
  const shelfHeight     = 2.7

  // Colours
  const mahogany  = '#6B4226'   // main planks
  const darkSide  = '#4A2C17'   // side panels
  const backPanel = '#3D2210'   // recessed back
  const emissive  = '#1a0800'   // warm inner glow

  // Y positions of the three shelf surfaces books sit on
  const topShelfY    =  1.15
  const midShelfY    =  0.0
  const bottomShelfY = -1.15

  // Total interior width for bookend placement
  const innerHalfW = shelfWidth / 2

  return (
    <group>
      {/* ── Back panel ──────────────────────────────────────────────────────── */}
      <Plank
        position={[0, 0, -shelfDepth / 2 - 0.01]}
        args={[shelfWidth + sideThickness * 2, shelfHeight, 0.04]}
        color={backPanel}
        roughness={0.9}
        metalness={0.06}
        emissive={emissive}
        emissiveIntensity={0.05}
      />

      {/* ── Shelf planks ────────────────────────────────────────────────────── */}
      {/* Bottom */}
      <Plank
        position={[0, bottomShelfY, 0]}
        args={[shelfWidth, plankThickness, shelfDepth]}
        color={mahogany}
        emissive={emissive}
        emissiveIntensity={0.05}
      />
      {/* Middle */}
      <Plank
        position={[0, midShelfY, 0]}
        args={[shelfWidth, plankThickness, shelfDepth]}
        color={mahogany}
        emissive={emissive}
        emissiveIntensity={0.05}
      />
      {/* Top */}
      <Plank
        position={[0, topShelfY, 0]}
        args={[shelfWidth, plankThickness, shelfDepth]}
        color={mahogany}
        emissive={emissive}
        emissiveIntensity={0.05}
      />

      {/* ── Top cap ─────────────────────────────────────────────────────────── */}
      <Plank
        position={[0, topShelfY + 0.2, 0]}
        args={[shelfWidth + sideThickness * 2 + 0.02, plankThickness * 0.8, shelfDepth + 0.06]}
        color={darkSide}
        roughness={0.6}
      />

      {/* ── Bottom base ─────────────────────────────────────────────────────── */}
      <Plank
        position={[0, bottomShelfY - 0.2, 0]}
        args={[shelfWidth + sideThickness * 2 + 0.02, plankThickness * 0.8, shelfDepth + 0.06]}
        color={darkSide}
        roughness={0.6}
      />

      {/* ── Side panels ─────────────────────────────────────────────────────── */}
      <Plank
        position={[-innerHalfW - sideThickness / 2, 0, 0]}
        args={[sideThickness, shelfHeight, shelfDepth]}
        color={darkSide}
        roughness={0.7}
      />
      <Plank
        position={[innerHalfW + sideThickness / 2, 0, 0]}
        args={[sideThickness, shelfHeight, shelfDepth]}
        color={darkSide}
        roughness={0.7}
      />

      {/* ── Front edge strips (lip on every shelf) ───────────────────────────── */}
      <EdgeStrip position={[0, topShelfY    + plankThickness / 2 + 0.008, shelfDepth / 2]} width={shelfWidth} />
      <EdgeStrip position={[0, midShelfY    + plankThickness / 2 + 0.008, shelfDepth / 2]} width={shelfWidth} />
      <EdgeStrip position={[0, bottomShelfY + plankThickness / 2 + 0.008, shelfDepth / 2]} width={shelfWidth} />

      {/* ── Globe decorative on top-left of top shelf ────────────────────────── */}
      <Globe position={[-innerHalfW + 0.28, topShelfY + plankThickness / 2 + 0.12 + 0.02, 0.02]} />

      {/* ── Bookends: right end of top and bottom shelves ────────────────────── */}
      <Bookend position={[innerHalfW - 0.12, topShelfY    + plankThickness / 2 + 0.11, 0.02]} />
      <Bookend position={[innerHalfW - 0.12, midShelfY    + plankThickness / 2 + 0.11, 0.02]} />
      <Bookend position={[innerHalfW - 0.12, bottomShelfY + plankThickness / 2 + 0.11, 0.02]} />
    </group>
  )
}
