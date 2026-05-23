import React, { useRef, useState, useCallback, useMemo, Suspense } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

function hexDarken(hex, f = 0.7) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!r) return new THREE.Color(0.3, 0.15, 0.05)
  return new THREE.Color(
    parseInt(r[1], 16) / 255 * f,
    parseInt(r[2], 16) / 255 * f,
    parseInt(r[3], 16) / 255 * f
  )
}

function getPhase(id = '') {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff
  return ((h & 0xff) / 255) * Math.PI * 2
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
  const animY    = useRef(position[1])
  const animS    = useRef(1.0)
  const animRotX = useRef(0)

  const spine = book.spine_color || '#8B4513'
  const [coverTex, setCoverTex] = useState(null)

  const mats = useMemo(() => {
    const page  = new THREE.MeshStandardMaterial({ color: '#f2ead8', roughness: 0.9, metalness: 0 })
    const top   = new THREE.MeshStandardMaterial({ color: '#e8dfc8', roughness: 0.9, metalness: 0 })
    const front = new THREE.MeshStandardMaterial({ color: spine,     roughness: 0.65, metalness: 0.02 })
    const back  = new THREE.MeshStandardMaterial({ color: hexDarken(spine, 0.75), roughness: 0.7 })
    // right, left, top, bottom, front(spine), back
    return [page, page, top, top, front, back]
  }, [spine])

  const coverMats = useMemo(() => {
    if (!coverTex) return mats
    const cover = new THREE.MeshStandardMaterial({ map: coverTex, roughness: 0.6 })
    return [mats[0], mats[1], mats[2], mats[3], cover, mats[5]]
  }, [coverTex, mats])

  // selected glow
  useMemo(() => {
    const spineMat = mats[4]
    spineMat.emissive = new THREE.Color(isSelected ? '#fbbf24' : '#000000')
    spineMat.emissiveIntensity = isSelected ? 0.3 : 0
  }, [isSelected, mats])

  useFrame(({ clock }, delta) => {
    if (!meshRef.current) return
    const t  = clock.elapsedTime
    const lf = 1 - Math.pow(0.01, delta)
    const ty = isSelected ? position[1] + 0.18
             : hovered    ? position[1] + 0.1
             :              position[1] + Math.sin(t * 0.5 + phase) * 0.012
    const ts = hovered || isSelected ? 1.06 : 1.0
    const tr = hovered ? -0.12 : 0

    animY.current    += (ty - animY.current)    * lf
    animS.current    += (ts - animS.current)    * lf
    animRotX.current += (tr - animRotX.current) * lf

    meshRef.current.position.y = animY.current
    meshRef.current.scale.setScalar(animS.current)
    meshRef.current.rotation.x = animRotX.current
  })

  const click = useCallback((e) => { e.stopPropagation(); onClick(book) }, [book, onClick])
  const over  = useCallback((e) => { e.stopPropagation(); onHover(true);  document.body.style.cursor = 'pointer' }, [onHover])
  const out   = useCallback(()  => { onHover(false); document.body.style.cursor = 'default' }, [onHover])
  const label = book.title.length > 20 ? book.title.slice(0, 20) + '…' : book.title

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
        position={position}
        material={coverMats}
        onClick={click} onPointerOver={over} onPointerOut={out}
        castShadow receiveShadow
      >
        <boxGeometry args={[0.26, 0.88, 0.2]} />
      </mesh>
      {!coverTex && (
        <Text
          position={[position[0], position[1], position[2] + 0.11]}
          rotation={[0, 0, Math.PI / 2]}
          fontSize={0.036}
          color="#f5ead0"
          maxWidth={0.72}
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
