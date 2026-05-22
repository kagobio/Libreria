import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function GlassPlatform({ y, width = 6.8 }) {
  const bodyMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#040810', roughness: 0.02, metalness: 0.98,
  }), [])

  const edgesGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(width, 0.04, 0.38)), [width])
  const edgeMat  = useMemo(() => new THREE.LineBasicMaterial({ color: '#00d4ff' }), [])
  const lines    = useMemo(() => new THREE.LineSegments(edgesGeo, edgeMat), [edgesGeo, edgeMat])

  return (
    <group position={[0, y, 0]}>
      <mesh material={bodyMat} receiveShadow>
        <boxGeometry args={[width, 0.04, 0.38]} />
      </mesh>
      <primitive object={lines} />
    </group>
  )
}

function Pillar({ x }) {
  const mat  = useMemo(() => new THREE.MeshStandardMaterial({ color: '#040810', roughness: 0.02, metalness: 0.98 }), [])
  const eGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(0.04, 2.8, 0.38)), [])
  const eMat = useMemo(() => new THREE.LineBasicMaterial({ color: '#003a66' }), [])
  const segs = useMemo(() => new THREE.LineSegments(eGeo, eMat), [eGeo, eMat])

  return (
    <group position={[x, 0, 0]}>
      <mesh material={mat}><boxGeometry args={[0.04, 2.8, 0.38]} /></mesh>
      <primitive object={segs} />
    </group>
  )
}

function FloatingOrb({ position }) {
  const ref = useRef()
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#001428', roughness: 0.0, metalness: 1.0,
    emissive: new THREE.Color('#00d4ff'), emissiveIntensity: 0.8,
  }), [])
  const ringMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#00aaff', roughness: 0.1, metalness: 0.9,
    emissive: new THREE.Color('#0066ff'), emissiveIntensity: 0.3,
  }), [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime
    ref.current.rotation.y = t * 0.6
    ref.current.rotation.x = t * 0.3
    ref.current.position.y = position[1] + Math.sin(t * 0.9) * 0.06
  })

  return (
    <group ref={ref} position={position}>
      <mesh material={mat}><octahedronGeometry args={[0.1, 0]} /></mesh>
      <mesh material={ringMat} rotation={[Math.PI / 5, 0, 0]}>
        <torusGeometry args={[0.18, 0.006, 8, 40]} />
      </mesh>
      <mesh material={ringMat} rotation={[Math.PI / 2, Math.PI / 4, 0]}>
        <torusGeometry args={[0.18, 0.004, 8, 40]} />
      </mesh>
    </group>
  )
}

export default function Bookshelf() {
  return (
    <group>
      <GlassPlatform y={ 1.2} />
      <GlassPlatform y={ 0.0} />
      <GlassPlatform y={-1.2} />
      <Pillar x={-3.45} />
      <Pillar x={ 3.45} />
      <FloatingOrb position={[-3.1, 1.42, 0.05]} />
    </group>
  )
}
