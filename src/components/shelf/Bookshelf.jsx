import React, { useMemo } from 'react'
import * as THREE from 'three'

const BAMBOO      = '#d4b058'
const BAMBOO_DARK = '#b08c38'
const BAMBOO_SIDE = '#c4a048'
const BACK_DARK   = '#0d0d0d'

function Plank({ position, args, color, roughness = 0.72, metalness = 0.04 }) {
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color, roughness, metalness }),
    [color, roughness, metalness]
  )
  return (
    <mesh position={position} material={mat} castShadow receiveShadow>
      <boxGeometry args={args} />
    </mesh>
  )
}

// Dark back panel for each compartment (creates the dark interior look)
function CompartmentBack({ x, y, w, h, depth }) {
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: BACK_DARK, roughness: 0.95, metalness: 0 }),
    []
  )
  return (
    <mesh position={[x, y, -depth / 2 + 0.01]} material={mat}>
      <planeGeometry args={[w, h]} />
    </mesh>
  )
}

export default function Bookshelf() {
  const W    = 6.4   // total outer width
  const D    = 0.42  // shelf depth
  const PT   = 0.07  // plank thickness
  const ST   = 0.08  // side panel thickness
  const DT   = 0.07  // divider thickness
  const COLS = 4
  const ROWS = 3

  const innerW = W - ST * 2              // 6.24
  const colInW = (innerW - DT * (COLS - 1)) / COLS  // ~1.478

  // Y positions of horizontal planks (bottom of each shelf level)
  const planks = [-1.38, -0.45, 0.48, 1.41]  // 4 planks = 3 rows

  // Column X centers
  const colCenters = Array.from({ length: COLS }, (_, i) => {
    const startX = -(innerW / 2)
    return startX + colInW / 2 + i * (colInW + DT)
  })

  // Row Y centers (mid-point between consecutive planks)
  const rowCenters = Array.from({ length: ROWS }, (_, i) => {
    const yBot = planks[i] + PT
    const yTop = planks[i + 1]
    return (yBot + yTop) / 2
  })
  const rowInH = rowCenters.map((_, i) => planks[i + 1] - (planks[i] + PT))

  return (
    <group>
      {/* ── Horizontal shelf planks ── */}
      {planks.map((y, i) => (
        <Plank
          key={`h${i}`}
          position={[0, y + PT / 2, 0]}
          args={[innerW, PT, D]}
          color={i === 0 || i === ROWS ? BAMBOO_DARK : BAMBOO}
        />
      ))}

      {/* ── Top cap ── */}
      <Plank
        position={[0, planks[ROWS] + PT + 0.04, 0]}
        args={[W + 0.02, 0.08, D + 0.06]}
        color={BAMBOO_DARK}
        roughness={0.6}
      />

      {/* ── Bottom base ── */}
      <Plank
        position={[0, planks[0] - 0.04, 0]}
        args={[W + 0.02, 0.08, D + 0.06]}
        color={BAMBOO_DARK}
        roughness={0.6}
      />

      {/* ── Side panels ── */}
      <Plank position={[-(W / 2 - ST / 2), (planks[0] + planks[ROWS]) / 2 + PT, 0]} args={[ST, planks[ROWS] - planks[0] + PT * 2, D]} color={BAMBOO_SIDE} />
      <Plank position={[ (W / 2 - ST / 2), (planks[0] + planks[ROWS]) / 2 + PT, 0]} args={[ST, planks[ROWS] - planks[0] + PT * 2, D]} color={BAMBOO_SIDE} />

      {/* ── Vertical dividers ── */}
      {Array.from({ length: COLS - 1 }, (_, i) => {
        const x = -(innerW / 2) + (i + 1) * colInW + i * DT + DT / 2
        return (
          <Plank
            key={`v${i}`}
            position={[x, (planks[0] + planks[ROWS]) / 2 + PT, 0]}
            args={[DT, planks[ROWS] - planks[0] + PT * 2, D]}
            color={BAMBOO_DARK}
          />
        )
      })}

      {/* ── Dark back panels per compartment ── */}
      {rowCenters.map((ry, ri) =>
        colCenters.map((cx, ci) => (
          <CompartmentBack
            key={`back-${ri}-${ci}`}
            x={cx}
            y={ry}
            w={colInW - 0.01}
            h={rowInH[ri] - 0.01}
            depth={D}
          />
        ))
      )}
    </group>
  )
}
