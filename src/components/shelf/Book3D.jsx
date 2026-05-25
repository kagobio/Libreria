import React, { useRef, useState, useCallback, useMemo, Suspense } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

const SPINE_PALETTE = [
  '#7a1c1c', '#1c3a7a', '#1a5e2a', '#5a1a48',
  '#7a4a18', '#1a485e', '#48185e', '#5e3818',
  '#7a2c18', '#185e48', '#38187a', '#5e5218',
]

function hash(id = '', seed = 1) {
  let h = seed * 5381
  for (const c of id) h = ((h << 5) + h + c.charCodeAt(0)) & 0xffffffff
  return Math.abs(h)
}

// Per-book deterministic physical properties
function getBookProps(id) {
  const h1 = hash(id, 7)
  const h2 = hash(id, 13)
  const h3 = hash(id, 19)
  const leanRoll = (h2 & 0xff) / 255
  return {
    height:    0.66 + ((h1 & 0xff)        / 255) * 0.17,
    thickness: 0.16 + (((h1 >> 8) & 0x3f) / 63)  * 0.09,
    lean:      leanRoll < 0.55 ? 0 : (((h2 >> 8) & 0xff) / 255 - 0.5) * 0.26,
    pullout:   ((h3 & 0xff) / 255) < 0.82 ? 0 : ((h3 >> 8) & 0xff) / 255 * 0.07,
    colorIdx:  hash(id, 3) % SPINE_PALETTE.length,
  }
}

function getPhase(id = '') {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff
  return ((h & 0xff) / 255) * Math.PI * 2
}

function hexDarken(hex, f = 0.62) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!r) return new THREE.Color(0.2, 0.1, 0.04)
  return new THREE.Color(
    parseInt(r[1], 16) / 255 * f,
    parseInt(r[2], 16) / 255 * f,
    parseInt(r[3], 16) / 255 * f
  )
}

class CoverErrorBoundary extends React.Component {
  state = { err: false }
  static getDerivedStateFromError() { return { err: true } }
  render() { return this.state.err ? this.props.fallback : this.props.children }
}

function CoverLoader({ url, onLoad }) {
  const tex = useLoader(THREE.TextureLoader, url.replace('http://', 'https://'))
  React.useEffect(() => { if (tex) onLoad(tex) }, [tex, onLoad])
  return null
}

function BookMesh({ book, isSelected, hovered, onHover, onClick, position }) {
  const meshRef  = useRef()
  const phase    = useMemo(() => getPhase(book.id), [book.id])
  const props    = useMemo(() => getBookProps(book.id), [book.id])
  const animY    = useRef(position[1])
  const animS    = useRef(1.0)
  const animRotX = useRef(0)

  const spineHex = book.spine_color || SPINE_PALETTE[props.colorIdx]
  const [coverTex, setCoverTex] = useState(null)

  const mats = useMemo(() => {
    const page  = new THREE.MeshStandardMaterial({ color: '#eee4ce', roughness: 0.95, metalness: 0 })
    const top   = new THREE.MeshStandardMaterial({ color: '#e4d8c0', roughness: 0.95, metalness: 0 })
    const front = new THREE.MeshPhysicalMaterial({
      color: spineHex, roughness: 0.48, metalness: 0.02,
      clearcoat: 0.45, clearcoatRoughness: 0.32,
    })
    const back = new THREE.MeshStandardMaterial({ color: hexDarken(spineHex), roughness: 0.7 })
    // [+x, -x, +y, -y, +z front/cover, -z back]
    return [page, page, top, top, front, back]
  }, [spineHex])

  const coverMats = useMemo(() => {
    if (!coverTex) return mats
    const cover = new THREE.MeshStandardMaterial({ map: coverTex, roughness: 0.42 })
    return [mats[0], mats[1], mats[2], mats[3], cover, mats[5]]
  }, [coverTex, mats])

  useMemo(() => {
    const m = mats[4]
    m.emissive          = new THREE.Color(isSelected ? '#ff8820' : '#000000')
    m.emissiveIntensity = isSelected ? 0.45 : 0
  }, [isSelected, mats])

  useFrame(({ clock }, delta) => {
    if (!meshRef.current) return
    const lf = 1 - Math.pow(0.008, delta)
    const ty = isSelected ? position[1] + 0.24
             : hovered    ? position[1] + 0.14
             :              position[1] + Math.sin(clock.elapsedTime * 0.44 + phase) * 0.007
    animY.current    += (ty                          - animY.current)    * lf
    animS.current    += ((hovered || isSelected ? 1.08 : 1.0) - animS.current)    * lf
    animRotX.current += ((hovered ? -0.12 : 0)      - animRotX.current) * lf

    meshRef.current.position.y  = animY.current
    meshRef.current.scale.setScalar(animS.current)
    meshRef.current.rotation.x  = animRotX.current
  })

  const click = useCallback((e) => { e.stopPropagation(); onClick(book) }, [book, onClick])
  const over  = useCallback((e) => { e.stopPropagation(); onHover(true);  document.body.style.cursor = 'pointer' }, [onHover])
  const out   = useCallback(()  => { onHover(false); document.body.style.cursor = 'default' }, [onHover])
  const label = book.title.length > 18 ? book.title.slice(0, 18) + '…' : book.title

  const { height, thickness, lean, pullout } = props

  return (
    <>
      {book.cover_url && (
        <CoverErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <CoverLoader url={book.cover_url} onLoad={setCoverTex} />
          </Suspense>
        </CoverErrorBoundary>
      )}
      <mesh
        ref={meshRef}
        position={[position[0], position[1], position[2] + pullout]}
        rotation={[0, 0, lean]}
        material={coverMats}
        onClick={click} onPointerOver={over} onPointerOut={out}
        castShadow receiveShadow
      >
        <boxGeometry args={[0.24, height, thickness]} />
      </mesh>
      {!coverTex && (
        <Text
          position={[position[0], position[1], position[2] + pullout + thickness / 2 + 0.005]}
          rotation={[0, 0, Math.PI / 2]}
          fontSize={0.032}
          color="#f0ddb0"
          maxWidth={height * 0.82}
          textAlign="center"
          anchorX="center" anchorY="middle"
          lineHeight={1.2}
          onClick={click} onPointerOver={over} onPointerOut={out}
        >
          {label}
        </Text>
      )}
    </>
  )
}

export default function Book3D({ book, position, isSelected, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <BookMesh
      book={book} position={position} isSelected={isSelected}
      hovered={hovered} onHover={setHovered} onClick={onClick}
    />
  )
}
