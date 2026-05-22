import React, { useMemo } from 'react'
import * as THREE from 'three'

function Plank({ position, args, color, roughness = 0.8, metalness = 0.1 }) {
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        roughness,
        metalness,
      }),
    [color, roughness, metalness]
  )

  return (
    <mesh position={position} material={material} castShadow receiveShadow>
      <boxGeometry args={args} />
    </mesh>
  )
}

export default function Bookshelf() {
  // Shelf dimensions
  const shelfWidth = 6.2
  const shelfDepth = 0.32
  const plankThickness = 0.07
  const sideThickness = 0.08
  const shelfHeight = 2.7

  const woodColor = '#8B6914'
  const woodDark = '#5C4A1E'
  const woodBack = '#6B4F0F'

  return (
    <group>
      {/* Back panel */}
      <Plank
        position={[0, 0, -shelfDepth / 2 - 0.01]}
        args={[shelfWidth + sideThickness * 2, shelfHeight, 0.04]}
        color={woodBack}
        roughness={0.9}
        metalness={0.05}
      />

      {/* Bottom shelf plank */}
      <Plank
        position={[0, -1.15, 0]}
        args={[shelfWidth, plankThickness, shelfDepth]}
        color={woodDark}
        roughness={0.75}
      />

      {/* Middle shelf plank (row 2) */}
      <Plank
        position={[0, 0, 0]}
        args={[shelfWidth, plankThickness, shelfDepth]}
        color={woodColor}
        roughness={0.75}
      />

      {/* Upper shelf plank (row 1) */}
      <Plank
        position={[0, 1.15, 0]}
        args={[shelfWidth, plankThickness, shelfDepth]}
        color={woodColor}
        roughness={0.75}
      />

      {/* Top cap plank */}
      <Plank
        position={[0, 1.35, 0]}
        args={[shelfWidth + sideThickness * 2 + 0.02, plankThickness * 0.8, shelfDepth + 0.05]}
        color={woodDark}
        roughness={0.7}
      />

      {/* Bottom base plank */}
      <Plank
        position={[0, -1.35, 0]}
        args={[shelfWidth + sideThickness * 2 + 0.02, plankThickness * 0.8, shelfDepth + 0.05]}
        color={woodDark}
        roughness={0.7}
      />

      {/* Left side plank */}
      <Plank
        position={[-shelfWidth / 2 - sideThickness / 2, 0, 0]}
        args={[sideThickness, shelfHeight, shelfDepth]}
        color={woodDark}
        roughness={0.78}
      />

      {/* Right side plank */}
      <Plank
        position={[shelfWidth / 2 + sideThickness / 2, 0, 0]}
        args={[sideThickness, shelfHeight, shelfDepth]}
        color={woodDark}
        roughness={0.78}
      />

      {/* Decorative edge trim - left top */}
      <Plank
        position={[-shelfWidth / 2 - sideThickness / 2, 1.25, shelfDepth / 2 + 0.005]}
        args={[sideThickness + 0.02, 0.2, 0.015]}
        color={woodColor}
        roughness={0.6}
      />

      {/* Decorative edge trim - right top */}
      <Plank
        position={[shelfWidth / 2 + sideThickness / 2, 1.25, shelfDepth / 2 + 0.005]}
        args={[sideThickness + 0.02, 0.2, 0.015]}
        color={woodColor}
        roughness={0.6}
      />
    </group>
  )
}
