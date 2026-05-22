import React, { useRef, useState, useCallback, useMemo, Suspense } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

// ── helpers ────────────────────────────────────────────────────────────────────

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

/** Deterministic per-book idle phase from its id string */
function idlePhase(id = '') {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff
  return ((h & 0xff) / 255) * Math.PI * 2
}

// ── error boundary for texture loading ────────────────────────────────────────

class TextureErrorBoundary extends React.Component {
  state = { error: false }
  static getDerivedStateFromError() { return { error: true } }
  render() {
    if (this.state.error) return this.props.fallback
    return this.props.children
  }
}

// ── texture side-loader (uses useLoader inside Suspense) ───────────────────────

function TextureLoader({ url, onLoad }) {
  const texture = useLoader(THREE.TextureLoader, url.replace('http://', 'https://'))
  React.useEffect(() => { if (texture) onLoad(texture) }, [texture, onLoad])
  return null
}

// ── main book mesh ─────────────────────────────────────────────────────────────

function BookMesh({ book, isSelected, hovered, onHover, onClick, position }) {
  const meshRef  = useRef()
  const phase    = useMemo(() => idlePhase(book.id), [book.id])

  // animated state refs (avoid re-renders)
  const animY     = useRef(position[1])
  const animScale = useRef(1.0)
  const animRotX  = useRef(0)
  const animRotY  = useRef(0)
  const animEmit  = useRef(0)

  const spineColor = book.spine_color || '#8B4513'

  const [coverTexture, setCoverTexture] = useState(null)

  // Six-face material array: [+X, -X, +Y, -Y, +Z(spine/front), -Z(back)]
  const baseMats = useMemo(() => {
    const pageColor  = new THREE.Color('#f5f0e0')
    const topColor   = new THREE.Color('#e8e0c8')
    const spine      = new THREE.MeshStandardMaterial({
      color: new THREE.Color(spineColor),
      roughness: 0.55,
      metalness: 0.08,
    })
    const back = new THREE.MeshStandardMaterial({
      color: darkenColor(spineColor, 0.72),
      roughness: 0.7,
    })
    const pages = new THREE.MeshStandardMaterial({
      color: pageColor,
      roughness: 0.95,
    })
    const topBot = new THREE.MeshStandardMaterial({
      color: topColor,
      roughness: 0.9,
    })
    // order: right(+X), left(-X), top(+Y), bottom(-Y), front(+Z/spine), back(-Z)
    return [pages, pages, topBot, topBot, spine, back]
  }, [spineColor])

  const materials = useMemo(() => {
    if (!coverTexture) return baseMats
    const frontMat = new THREE.MeshStandardMaterial({
      map: coverTexture,
      roughness: 0.6,
      metalness: 0.04,
    })
    return [baseMats[0], baseMats[1], baseMats[2], baseMats[3], frontMat, baseMats[5]]
  }, [coverTexture, baseMats])

  // gold emissive for selected state
  const goldenColor = useMemo(() => new THREE.Color('#ffcc44'), [])

  useFrame((state, delta) => {
    if (!meshRef.current) return
    const t   = state.clock.elapsedTime
    const lf  = 1 - Math.pow(0.008, delta)

    // targets
    let targetY     = position[1]
    let targetScale = 1.0
    let targetRotX  = 0
    let targetRotY  = 0
    let targetEmit  = 0

    if (isSelected) {
      targetY     = position[1] + 0.22
      targetScale = 1.06
      targetRotY  = Math.sin(t * 0.6) * 0.12
      targetEmit  = 0.5
    } else if (hovered) {
      targetY     = position[1] + 0.1
      targetScale = 1.1
      targetRotX  = -0.18
      targetEmit  = 0.1
    } else {
      // idle bobbing — unique phase per book
      targetY = position[1] + Math.sin(t * 0.7 + phase) * 0.018
    }

    animY.current     += (targetY     - animY.current)     * lf
    animScale.current += (targetScale - animScale.current) * lf
    animRotX.current  += (targetRotX  - animRotX.current)  * lf
    animRotY.current  += (targetRotY  - animRotY.current)  * lf
    animEmit.current  += (targetEmit  - animEmit.current)  * lf

    meshRef.current.position.set(position[0], animY.current, position[2])
    meshRef.current.scale.setScalar(animScale.current)
    meshRef.current.rotation.x = animRotX.current
    meshRef.current.rotation.y = animRotY.current

    // update emissive on spine material (index 4)
    const mat = Array.isArray(meshRef.current.material)
      ? meshRef.current.material[4]
      : meshRef.current.material
    if (mat) {
      mat.emissive = isSelected ? goldenColor : new THREE.Color(spineColor)
      mat.emissiveIntensity = animEmit.current
    }
  })

  const handleClick = useCallback((e) => { e.stopPropagation(); onClick(book) }, [book, onClick])
  const handleOver  = useCallback((e) => { e.stopPropagation(); onHover(true);  document.body.style.cursor = 'pointer' }, [onHover])
  const handleOut   = useCallback(() => { onHover(false); document.body.style.cursor = 'default' }, [onHover])

  const truncated = book.title.length > 22 ? book.title.substring(0, 22) + '…' : book.title
  const showText  = !coverTexture

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
        position={position}
      >
        <boxGeometry args={[0.28, 0.9, 0.22]} />
      </mesh>

      {showText && (
        <Text
          position={[position[0], position[1], position[2] + 0.12]}
          rotation={[0, 0, Math.PI / 2]}
          fontSize={0.038}
          color="#ffffff"
          maxWidth={0.75}
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

// ── public export ──────────────────────────────────────────────────────────────

export default function Book3D({ book, position, isSelected, onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <BookMesh
      book={book}
      isSelected={isSelected}
      hovered={hovered}
      onHover={setHovered}
      onClick={onClick}
      position={position}
    />
  )
}
