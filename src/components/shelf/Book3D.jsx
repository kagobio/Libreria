import React, { useRef, useState, useCallback, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

const NEON = ['#00d4ff','#a855f7','#00ff88','#ff3d7f','#ffd700','#ff6b35','#60a5fa','#f0abfc']

function bookHash(id = '') {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff
  return Math.abs(h)
}

function getNeon(id)  { return NEON[bookHash(id) % NEON.length] }
function getPhase(id) { return (bookHash(id) & 0xff) / 255 * Math.PI * 2 }

export default function Book3D({ book, position, isSelected, onClick }) {
  const [hovered, setHovered] = useState(false)
  const groupRef  = useRef()
  const glowRef   = useRef()
  const animY     = useRef(position[1])
  const animZ     = useRef(position[2])
  const animRotY  = useRef(0)
  const animGlow  = useRef(0.08)

  const neon  = useMemo(() => getNeon(book.id),  [book.id])
  const phase = useMemo(() => getPhase(book.id), [book.id])

  const bodyMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#060c1a', roughness: 0.05, metalness: 0.95,
  }), [])

  const edgesGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(0.285, 0.925, 0.058)), [])
  const edgeMat  = useMemo(() => new THREE.LineBasicMaterial({ color: neon }), [neon])
  const lineSegs = useMemo(() => new THREE.LineSegments(edgesGeo, edgeMat), [edgesGeo, edgeMat])

  const glowMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: neon, transparent: true, opacity: 0.08,
    side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
  }), [neon])

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return
    const t  = clock.elapsedTime
    const lf = 1 - Math.pow(0.01, delta)

    let ty = position[1] + Math.sin(t * 0.55 + phase) * 0.022
    let tz = position[2]
    let tr = 0
    let tg = 0.08

    if (isSelected) {
      ty = position[1] + 0.2
      tz = position[2] + 0.18
      tr = Math.sin(t * 0.45) * 0.18
      tg = 0.55
    } else if (hovered) {
      ty = position[1] + 0.1
      tz = position[2] + 0.14
      tg = 0.3
    }

    animY.current    += (ty - animY.current)    * lf
    animZ.current    += (tz - animZ.current)    * lf
    animRotY.current += (tr - animRotY.current) * lf
    animGlow.current += (tg - animGlow.current) * lf

    groupRef.current.position.set(position[0], animY.current, animZ.current)
    groupRef.current.rotation.y = animRotY.current
    if (glowRef.current) glowRef.current.material.opacity = animGlow.current
  })

  const click = useCallback((e) => { e.stopPropagation(); onClick(book) }, [book, onClick])
  const over  = useCallback((e) => { e.stopPropagation(); setHovered(true);  document.body.style.cursor = 'pointer' }, [])
  const out   = useCallback(()  => { setHovered(false); document.body.style.cursor = 'default' }, [])

  const label = book.title.length > 16 ? book.title.slice(0, 16) + '…' : book.title

  return (
    <group ref={groupRef} position={position}>
      <mesh material={bodyMat} onClick={click} onPointerOver={over} onPointerOut={out} castShadow>
        <boxGeometry args={[0.28, 0.9, 0.05]} />
      </mesh>

      <mesh ref={glowRef} material={glowMat} scale={[1.5, 1.12, 4]}>
        <boxGeometry args={[0.28, 0.9, 0.05]} />
      </mesh>

      <primitive object={lineSegs} onClick={click} onPointerOver={over} onPointerOut={out} />

      <Text
        position={[0, 0, 0.032]}
        rotation={[0, 0, Math.PI / 2]}
        fontSize={0.028}
        color={neon}
        maxWidth={0.72}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        lineHeight={1.15}
        onClick={click}
        onPointerOver={over}
        onPointerOut={out}
        renderOrder={1}
      >
        {label}
      </Text>
    </group>
  )
}
