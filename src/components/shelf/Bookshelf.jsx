import React, { useMemo } from 'react'
import * as THREE from 'three'

const W_MAIN = '#4a2a14'
const W_DARK = '#261408'
const W_SIDE = '#38200e'
const W_BACK = '#0b0806'

function Plank({ position, args, color, roughness = 0.42, clearcoat = 0.55 }) {
  const mat = useMemo(
    () => new THREE.MeshPhysicalMaterial({
      color, roughness, metalness: 0.01,
      clearcoat, clearcoatRoughness: 0.18,
    }),
    [color, roughness, clearcoat]
  )
  return (
    <mesh position={position} material={mat} castShadow receiveShadow>
      <boxGeometry args={args} />
    </mesh>
  )
}

function CompartmentBack({ x, y, w, h, depth }) {
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: W_BACK, roughness: 1, metalness: 0 }),
    []
  )
  return (
    <mesh position={[x, y, -depth / 2 + 0.012]} material={mat} receiveShadow>
      <planeGeometry args={[w, h]} />
    </mesh>
  )
}

export default function Bookshelf() {
  const W    = 6.4
  const D    = 0.44
  const PT   = 0.08
  const ST   = 0.09
  const DT   = 0.08
  const COLS = 4
  const ROWS = 3

  const innerW = W - ST * 2
  const colInW = (innerW - DT * (COLS - 1)) / COLS

  const planks = [-1.40, -0.47, 0.47, 1.40]

  const colCenters = Array.from({ length: COLS }, (_, i) =>
    -(innerW / 2) + colInW / 2 + i * (colInW + DT)
  )

  const rowCenters = Array.from({ length: ROWS }, (_, i) => {
    const yBot = planks[i] + PT
    const yTop = planks[i + 1]
    return (yBot + yTop) / 2
  })
  const rowInH = rowCenters.map((_, i) => planks[i + 1] - (planks[i] + PT))

  const midY  = (planks[0] + planks[ROWS]) / 2 + PT
  const fullH = planks[ROWS] - planks[0] + PT * 2

  return (
    <group>
      {/* Horizontal shelf planks */}
      {planks.map((y, i) => (
        <Plank
          key={`h${i}`}
          position={[0, y + PT / 2, 0]}
          args={[innerW, PT, D]}
          color={i === 0 || i === ROWS ? W_DARK : W_MAIN}
          roughness={i === 0 || i === ROWS ? 0.50 : 0.38}
          clearcoat={i === 0 || i === ROWS ? 0.45 : 0.62}
        />
      ))}

      {/* Shelf lips — thin front edge for realism */}
      {planks.map((y, i) => (
        <Plank
          key={`lip${i}`}
          position={[0, y + 0.018, D / 2 + 0.013]}
          args={[W + 0.01, 0.036, 0.026]}
          color={W_DARK}
          roughness={0.30}
          clearcoat={0.78}
        />
      ))}

      {/* Top cap */}
      <Plank position={[0, planks[ROWS] + PT + 0.05, 0]} args={[W + 0.04, 0.10, D + 0.10]} color={W_DARK} roughness={0.32} clearcoat={0.75} />

      {/* Bottom base */}
      <Plank position={[0, planks[0] - 0.05, 0]} args={[W + 0.04, 0.10, D + 0.10]} color={W_DARK} roughness={0.32} clearcoat={0.75} />

      {/* Side panels */}
      <Plank position={[-(W / 2 - ST / 2), midY, 0]} args={[ST, fullH, D]} color={W_SIDE} clearcoat={0.62} />
      <Plank position={[ (W / 2 - ST / 2), midY, 0]} args={[ST, fullH, D]} color={W_SIDE} clearcoat={0.62} />

      {/* Vertical dividers */}
      {Array.from({ length: COLS - 1 }, (_, i) => {
        const x = -(innerW / 2) + (i + 1) * colInW + i * DT + DT / 2
        return (
          <Plank key={`v${i}`} position={[x, midY, 0]} args={[DT, fullH, D]} color={W_DARK} clearcoat={0.45} />
        )
      })}

      {/* Dark back panels per compartment */}
      {rowCenters.map((ry, ri) =>
        colCenters.map((cx, ci) => (
          <CompartmentBack
            key={`back-${ri}-${ci}`}
            x={cx} y={ry}
            w={colInW - 0.025}
            h={rowInH[ri] - 0.025}
            depth={D}
          />
        ))
      )}
    </group>
  )
}
