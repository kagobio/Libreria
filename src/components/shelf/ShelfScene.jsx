import React, { useRef, useEffect, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import Bookshelf from './Bookshelf'
import Book3D from './Book3D'

// ─── Geometry constants — must mirror Bookshelf.jsx exactly ──────────────────
const W      = 6.4
const PT     = 0.08
const ST     = 0.09
const DT     = 0.08
const COLS   = 4
const ROWS   = 3
const PLANKS = [-1.40, -0.47, 0.47, 1.40]
const innerW = W - ST * 2
const colInW = (innerW - DT * (COLS - 1)) / COLS

const COL_CENTERS = Array.from({ length: COLS }, (_, i) =>
  -(innerW / 2) + colInW / 2 + i * (colInW + DT)
)
const ROW_CENTERS = Array.from({ length: ROWS }, (_, i) =>
  ((PLANKS[i] + PT) + PLANKS[i + 1]) / 2
)

// ─── Room backdrop ────────────────────────────────────────────────────────────
const wallMat  = new THREE.MeshStandardMaterial({ color: '#180c05', roughness: 0.94, metalness: 0 })
const floorMat = new THREE.MeshPhysicalMaterial({
  color: '#0f0806', roughness: 0.16, metalness: 0,
  reflectivity: 0.25, clearcoat: 0.12, clearcoatRoughness: 0.5,
})

function Room() {
  return (
    <>
      <mesh position={[0, 0.4, -0.26]} receiveShadow material={wallMat}>
        <planeGeometry args={[24, 11]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.58, 0]} receiveShadow material={floorMat}>
        <planeGeometry args={[24, 16]} />
      </mesh>
    </>
  )
}

// ─── Cinematic lighting ───────────────────────────────────────────────────────
function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.35} color="#ffeedd" />

      {/* Dramatic overhead key light */}
      <directionalLight
        position={[2, 10, 8]} intensity={3.8} color="#fff9ee"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-9} shadow-camera-right={9}
        shadow-camera-top={6}  shadow-camera-bottom={-6}
        shadow-camera-far={28}
        shadow-bias={-0.001}
      />

      {/* Warm amber per-row fills — simulates compartment spotlights */}
      <pointLight position={[-2.5, ROW_CENTERS[2] + 0.1, 0.0]} intensity={2.0} color="#ff7e18" distance={5.5} decay={2} />
      <pointLight position={[ 0.0, ROW_CENTERS[1] + 0.1, 0.0]} intensity={1.6} color="#ff8c22" distance={5.5} decay={2} />
      <pointLight position={[ 2.5, ROW_CENTERS[0] + 0.1, 0.0]} intensity={1.8} color="#ff7510" distance={5.5} decay={2} />

      {/* Wide warm fill from front */}
      <pointLight position={[0, 1.0, 7.5]} intensity={0.55} color="#ffe8c0" distance={16} decay={2} />

      {/* Side rim lights */}
      <pointLight position={[-7.5, 1.5, 3]} intensity={0.75} color="#ff9c30" distance={13} decay={2} />
      <pointLight position={[ 7.5, 1.5, 3]} intensity={0.65} color="#ffac40" distance={13} decay={2} />
    </>
  )
}

// ─── Floating dust particles ──────────────────────────────────────────────────
function DustParticles({ count = 200 }) {
  const ref = useRef()

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const vel = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 12
      pos[i * 3 + 1] = (Math.random() - 0.5) * 5
      pos[i * 3 + 2] = (Math.random() - 0.5) * 3
      vel[i * 3]     = (Math.random() - 0.5) * 0.0022
      vel[i * 3 + 1] = Math.random() * 0.0038 + 0.0008
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.0014
    }
    return [pos, vel]
  }, [count])

  useFrame(() => {
    if (!ref.current) return
    const attr = ref.current.geometry.attributes.position
    for (let i = 0; i < count; i++) {
      attr.array[i * 3]     += velocities[i * 3]
      attr.array[i * 3 + 1] += velocities[i * 3 + 1]
      attr.array[i * 3 + 2] += velocities[i * 3 + 2]
      if (attr.array[i * 3 + 1] > 3.0) {
        attr.array[i * 3]     = (Math.random() - 0.5) * 12
        attr.array[i * 3 + 1] = -3.0
        attr.array[i * 3 + 2] = (Math.random() - 0.5) * 3
      }
    }
    attr.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute args={[positions, 3]} attach="attributes-position" />
      </bufferGeometry>
      <pointsMaterial
        size={0.014} color="#ffbf50" transparent opacity={0.20}
        sizeAttenuation depthWrite={false}
      />
    </points>
  )
}

// ─── Subtle mouse parallax on the whole scene ─────────────────────────────────
function SceneParallax({ children }) {
  const ref    = useRef()
  const target = useRef({ rx: 0, ry: 0 })
  const curr   = useRef({ rx: 0, ry: 0 })

  useEffect(() => {
    const onMove = (e) => {
      target.current.ry =  (e.clientX / window.innerWidth  - 0.5) * 0.09
      target.current.rx = -(e.clientY / window.innerHeight - 0.5) * 0.045
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useFrame((_, delta) => {
    if (!ref.current) return
    const lf = 1 - Math.pow(0.01, delta * 1.6)
    curr.current.rx += (target.current.rx - curr.current.rx) * lf
    curr.current.ry += (target.current.ry - curr.current.ry) * lf
    ref.current.rotation.x = curr.current.rx
    ref.current.rotation.y = curr.current.ry
  })

  return <group ref={ref}>{children}</group>
}

// ─── Books on shelf ───────────────────────────────────────────────────────────
const BOOKS_PER_COL = 3
const SPACING       = 0.30

function BooksOnShelf({ books, selectedBook, onBookClick }) {
  const positions = useMemo(() => {
    const slotsPerRow = COLS * BOOKS_PER_COL
    return books.slice(0, ROWS * slotsPerRow).map((book, idx) => {
      const row  = Math.floor(idx / slotsPerRow)
      const slot = idx % slotsPerRow
      const col  = Math.floor(slot / BOOKS_PER_COL)
      const pos  = slot % BOOKS_PER_COL
      const x    = COL_CENTERS[col] + (pos - (BOOKS_PER_COL - 1) / 2) * SPACING
      const y    = ROW_CENTERS[row]
      return { book, position: [x, y, 0.04] }
    })
  }, [books])

  return (
    <>
      {positions.map(({ book, position }) => (
        <Book3D
          key={book.id}
          book={book}
          position={position}
          isSelected={selectedBook?.id === book.id}
          onClick={onBookClick}
        />
      ))}
    </>
  )
}

// ─── Scene ────────────────────────────────────────────────────────────────────
export default function ShelfScene({ books, selectedBook, onBookClick }) {
  return (
    <Canvas
      camera={{ position: [0, 0.2, 7.6], fov: 46 }}
      shadows
      dpr={[1, 2]}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.15,
      }}
    >
      <color attach="background" args={['#0d0704']} />
      <fog attach="fog" args={['#0d0704', 24, 48]} />

      <SceneLighting />

      <Suspense fallback={null}>
        <SceneParallax>
          <Room />
          <Bookshelf />
          <BooksOnShelf books={books} selectedBook={selectedBook} onBookClick={onBookClick} />
          <DustParticles />
        </SceneParallax>
        <ContactShadows
          position={[0, -1.57, 0]}
          opacity={0.75} scale={16} blur={2.5} far={3}
          color="#000000"
        />
      </Suspense>

      <EffectComposer>
        <Bloom
          intensity={1.6}
          luminanceThreshold={0.30}
          luminanceSmoothing={0.88}
          mipmapBlur
        />
        <Vignette offset={0.28} darkness={0.88} />
      </EffectComposer>

      <OrbitControls
        target={[0, 0.1, 0]}
        minPolarAngle={Math.PI / 5} maxPolarAngle={Math.PI / 1.9}
        minDistance={4} maxDistance={11}
        enablePan={false}
        dampingFactor={0.06} enableDamping
        rotateSpeed={0.42}
      />
    </Canvas>
  )
}
