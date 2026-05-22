import React, { useRef, useState, useCallback, useMemo, Suspense } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? { r: parseInt(result[1], 16) / 255, g: parseInt(result[2], 16) / 255, b: parseInt(result[3], 16) / 255 }
    : { r: 0.5, g: 0.3, b: 0.1 }
}

function darkenColor(hex, factor = 0.7) {
  const { r, g, b } = hexToRgb(hex)
  return new THREE.Color(r * factor, g * factor, b * factor)
}

class TextureErrorBoundary extends React.Component {
  state = { error: false }
  static getDerivedStateFromError() { return { error: true } }
  render() {
    if (this.state.error) return this.props.fallback
    return this.props.children
  }
}

function CoverTexture({ coverUrl }) {
  const texture = useLoader(THREE.TextureLoader, coverUrl)
  return texture
}

function BookMesh({ book, isSelected, hovered, onHover, onOut, onClick, position }) {
  const meshRef = useRef()
  const spineColor = book.spine_color || '#8B4513'

  const [coverTexture, setCoverTexture] = useState(null)

  const baseMats = useMemo(() => {
    const side = new THREE.MeshStandardMaterial({ color: darkenColor(spineColor, 0.72), roughness: 0.85 })
    const topBot = new THREE.MeshStandardMaterial({ color: darkenColor(spineColor, 0.58), roughness: 0.9 })
    const spine = new THREE.MeshStandardMaterial({
      color: spineColor,
      roughness: 0.65,
      metalness: 0.05,
      ...(isSelected ? { emissive: new THREE.Color('#6366f1'), emissiveIntensity: 0.3 } : {}),
    })
    const back = new THREE.MeshStandardMaterial({ color: darkenColor(spineColor, 0.62), roughness: 0.85 })
    return [side, side, topBot, topBot, spine, back]
  }, [spineColor, isSelected])

  const materials = useMemo(() => {
    if (!coverTexture) return baseMats
    const frontMat = new THREE.MeshStandardMaterial({ map: coverTexture, roughness: 0.7 })
    return [baseMats[0], baseMats[1], baseMats[2], baseMats[3], frontMat, baseMats[5]]
  }, [coverTexture, baseMats])

  const targetScale = hovered || isSelected ? 1.08 : 1.0
  const targetZ = hovered ? 0.08 : 0.0

  useFrame((_, delta) => {
    if (!meshRef.current) return
    const lf = 1 - Math.pow(0.01, delta)
    const s = meshRef.current.scale
    s.x += (targetScale - s.x) * lf
    s.y += (targetScale - s.y) * lf
    s.z += (targetScale - s.z) * lf
    meshRef.current.position.z += (position[2] + targetZ - meshRef.current.position.z) * lf
  })

  const handleClick = useCallback((e) => { e.stopPropagation(); onClick(book) }, [book, onClick])
  const handleOver  = useCallback((e) => { e.stopPropagation(); onHover(true);  document.body.style.cursor = 'pointer' }, [onHover])
  const handleOut   = useCallback(() => { onHover(false); document.body.style.cursor = 'default' }, [onHover])

  const truncated = book.title.length > 22 ? book.title.substring(0, 22) + '…' : book.title
  const showText = !coverTexture

  return (
    <>
      {book.cover_url && (
        <TextureErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <TextureLoader url={book.cover_url} onLoad={setCoverTexture} />
          </Suspense>
        </TextureErrorBoundary>
      )}
      <mesh
        ref={meshRef}
        material={materials}
        onClick={handleClick}
        onPointerOver={handleOver}
        onPointerOut={handleOut}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.28, 0.9, 0.22]} />
      </mesh>
      {showText && (
        <Text
          position={[0, 0, 0.12]}
          rotation={[0, 0, Math.PI / 2]}
          fontSize={0.042}
          color="#e2e8f0"
          maxWidth={0.78}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          lineHeight={1.2}
          onClick={handleClick}
          onPointerOver={handleOver}
          onPointerOut={handleOut}
        >
          {truncated}
        </Text>
      )}
    </>
  )
}

function TextureLoader({ url, onLoad }) {
  const texture = useLoader(THREE.TextureLoader, url.replace('http://', 'https://'))
  React.useEffect(() => { if (texture) onLoad(texture) }, [texture, onLoad])
  return null
}

export default function Book3D({ book, position, isSelected, onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <group position={position}>
      <BookMesh
        book={book}
        isSelected={isSelected}
        hovered={hovered}
        onHover={setHovered}
        onOut={() => setHovered(false)}
        onClick={onClick}
        position={position}
      />
    </group>
  )
}
