import React, { useRef, useState, useCallback, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
  } : { r: 0.5, g: 0.3, b: 0.1 }
}

function darkenColor(hex, factor = 0.7) {
  const { r, g, b } = hexToRgb(hex)
  return new THREE.Color(r * factor, g * factor, b * factor)
}

export default function Book3D({ book, position, isSelected, onClick }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)

  const spineColor = book.spine_color || '#8B4513'

  const materials = useMemo(() => {
    const spine = new THREE.MeshStandardMaterial({
      color: spineColor,
      roughness: 0.7,
      metalness: 0.05,
    })
    const side = new THREE.MeshStandardMaterial({
      color: darkenColor(spineColor, 0.75),
      roughness: 0.8,
      metalness: 0.05,
    })
    const topBottom = new THREE.MeshStandardMaterial({
      color: darkenColor(spineColor, 0.6),
      roughness: 0.85,
      metalness: 0.05,
    })
    const back = new THREE.MeshStandardMaterial({
      color: darkenColor(spineColor, 0.65),
      roughness: 0.8,
      metalness: 0.05,
    })

    if (isSelected) {
      spine.emissive = new THREE.Color('#fbbf24')
      spine.emissiveIntensity = 0.25
    }

    // Order: right, left, top, bottom, front (spine), back
    return [side, side, topBottom, topBottom, spine, back]
  }, [spineColor, isSelected])

  const targetScale = hovered || isSelected ? 1.08 : 1.0
  const targetZ = hovered ? 0.08 : 0.0

  useFrame((_, delta) => {
    if (!meshRef.current) return
    const s = meshRef.current.scale
    const lerpFactor = 1 - Math.pow(0.01, delta)
    s.x += (targetScale - s.x) * lerpFactor
    s.y += (targetScale - s.y) * lerpFactor
    s.z += (targetScale - s.z) * lerpFactor
    meshRef.current.position.z += (position[2] + targetZ - meshRef.current.position.z) * lerpFactor
  })

  const handleClick = useCallback((e) => {
    e.stopPropagation()
    onClick(book)
  }, [book, onClick])

  const handlePointerOver = useCallback((e) => {
    e.stopPropagation()
    setHovered(true)
    document.body.style.cursor = 'pointer'
  }, [])

  const handlePointerOut = useCallback(() => {
    setHovered(false)
    document.body.style.cursor = 'default'
  }, [])

  const truncatedTitle = book.title.length > 22
    ? book.title.substring(0, 22) + '…'
    : book.title

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        material={materials}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.28, 0.9, 0.22]} />
      </mesh>

      {/* Spine text */}
      <Text
        position={[0, 0, 0.12]}
        rotation={[0, 0, Math.PI / 2]}
        fontSize={0.042}
        color="#f5e6d3"
        maxWidth={0.78}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        lineHeight={1.2}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        {truncatedTitle}
      </Text>
    </group>
  )
}
