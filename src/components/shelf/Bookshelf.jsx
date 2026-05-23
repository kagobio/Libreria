import React, { useMemo } from 'react'
import * as THREE from 'three'

const WOOD      = '#c8a050'
const WOOD_DARK = '#a07832'
const WOOD_BACK = '#7a5c28'

function Plank({ position, args, color = WOOD, roughness = 0.75, rotation }) {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.02 }), [color, roughness])
  return (
    <mesh position={position} material={mat} castShadow receiveShadow rotation={rotation}>
      <boxGeometry args={args} />
    </mesh>
  )
}

export default function Bookshelf() {
  const W  = 6.0   // total interior width
  const D  = 0.38  // depth
  const PT = 0.07  // plank thickness
  const ST = 0.07  // side/divider thickness
  const cols = 4
  const dividerPositions = [-W / 2 + ST / 2, -W / 6 - ST / 2, -W / 6 + ST / 2, W / 6 - ST / 2, W / 6 + ST / 2, W / 2 - ST / 2]

  // Shelf Y positions (bottom of each row's shelf plank)
  const midY = 0.0
  const topY = 1.22

  return (
    <group>
      {/* Back panel */}
      <Plank position={[0, 0, -D / 2 - 0.01]} args={[W + ST * 2 + 0.02, 2.7, 0.03]} color={WOOD_BACK} roughness={0.88} />

      {/* Horizontal shelves: bottom, middle, top */}
      <Plank position={[0, -1.22, 0]} args={[W + ST * 2, PT, D]} color={WOOD_DARK} />
      <Plank position={[0,  midY, 0]} args={[W, PT, D]} color={WOOD} />
      <Plank position={[0,  topY, 0]} args={[W, PT, D]} color={WOOD} />

      {/* Top cap */}
      <Plank position={[0, topY + 0.22, 0]} args={[W + ST * 2 + 0.02, PT, D + 0.05]} color={WOOD_DARK} roughness={0.65} />
      {/* Bottom base */}
      <Plank position={[0, -1.44, 0]} args={[W + ST * 2 + 0.02, PT, D + 0.05]} color={WOOD_DARK} roughness={0.65} />

      {/* Side panels */}
      <Plank position={[-(W / 2 + ST / 2), 0, 0]} args={[ST, 2.7, D]} color={WOOD_DARK} />
      <Plank position={[ (W / 2 + ST / 2), 0, 0]} args={[ST, 2.7, D]} color={WOOD_DARK} />

      {/* Vertical dividers — 3 dividers create 4 columns */}
      {[-W / 3, 0, W / 3].map((x, i) => (
        <Plank key={i} position={[x, 0, 0]} args={[ST, 2.7 - PT, D]} color={WOOD_DARK} roughness={0.72} />
      ))}
    </group>
  )
}
