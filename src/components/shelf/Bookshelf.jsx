import React, { useMemo } from 'react'
import * as THREE from 'three'

const BAMBOO      = '#c8982a'
const BAMBOO_DARK = '#a07420'
const BAMBOO_SIDE = '#b88828'
const BACK_DARK   = '#090705'

function Plank({ position, args, color, roughness = 0.55, metalness = 0.04, clearcoat = 0.4 }) {
  const mat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color, roughness, metalness, clearcoat, clearcoatRoughness: 0.3 }),
    [color, roughness, metalness, clearcoat]
  )
  return (
    <mesh position={position} material={mat} castShadow receiveShadow>
      <boxGeometry args={args} />
    </mesh>
  )
}

function CompartmentBack({ x, y, w, h, depth }) {
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: BACK_DARK, roughness: 1, metalness: 0 }),
    []
  )
  return (
    <mesh position={[x, y, -depth / 2 + 0.01]} material={mat} receiveShadow>
      <planeGeometry args={[w, h]} />
    </mesh>
  )
}

export default function Bookshelf() {
  const W    = 6.4
  const D    = 0.42
  const PT   = 0.07
  const ST   = 0.08
  const DT   = 0.07
  const COLS = 4
  const ROWS = 3

  const innerW = W - ST * 2
  const colInW = (innerW - DT * (COLS - 1)) / COLS

  const planks = [-1.38, -0.45, 0.48, 1.41]

  const colCenters = Array.from({ length: COLS }, (_, i) => {
    const startX = -(innerW / 2)
    return startX + colInW / 2 + i * (colInW + DT)
  })

  const rowCenters = Array.from({ length: ROWS }, (_, i) => {
    const yBot = planks[i] + PT
    const yTop = planks[i + 1]
    return (yBot + yTop) / 2
  })
  const rowInH = rowCenters.map((_, i) => planks[i + 1] - (planks[i] + PT))

  return (
    <group>
      {/* Horizontal shelf planks */}
      {planks.map((y, i) => (
        <Plank
          key={`h${i}`}
          position={[0, y + PT / 2, 0]}
          args={[innerW, PT, D]}
          color={i === 0 || i === ROWS ? BAMBOO_DARK : BAMBOO}
        />
      ))}

      {/* Top cap */}
      <Plank
        position={[0, planks[ROWS] + PT + 0.045, 0]}
        args={[W + 0.03, 0.09, D + 0.08]}
        color={BAMBOO_DARK}
        roughness={0.42}
        clearcoat={0.7}
      />

      {/* Bottom base */}
      <Plank
        position={[0, planks[0] - 0.045, 0]}
        args={[W + 0.03, 0.09, D + 0.08]}
        color={BAMBOO_DARK}
        roughness={0.42}
        clearcoat={0.7}
      />

      {/* Side panels */}
      <Plank
        position={[-(W / 2 - ST / 2), (planks[0] + planks[ROWS]) / 2 + PT, 0]}
        args={[ST, planks[ROWS] - planks[0] + PT * 2, D]}
        color={BAMBOO_SIDE}
        clearcoat={0.5}
      />
      <Plank
        position={[ (W / 2 - ST / 2), (planks[0] + planks[ROWS]) / 2 + PT, 0]}
        args={[ST, planks[ROWS] - planks[0] + PT * 2, D]}
        color={BAMBOO_SIDE}
        clearcoat={0.5}
      />

      {/* Vertical dividers */}
      {Array.from({ length: COLS - 1 }, (_, i) => {
        const x = -(innerW / 2) + (i + 1) * colInW + i * DT + DT / 2
        return (
          <Plank
            key={`v${i}`}
            position={[x, (planks[0] + planks[ROWS]) / 2 + PT, 0]}
            args={[DT, planks[ROWS] - planks[0] + PT * 2, D]}
            color={BAMBOO_DARK}
            clearcoat={0.3}
          />
        )
      })}

      {/* Dark back panels per compartment */}
      {rowCenters.map((ry, ri) =>
        colCenters.map((cx, ci) => (
          <CompartmentBack
            key={`back-${ri}-${ci}`}
            x={cx} y={ry}
            w={colInW - 0.02}
            h={rowInH[ri] - 0.02}
            depth={D}
          />
        ))
      )}
    </group>
  )
}
