import React, { useCallback, useMemo, useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import Bookshelf from './Bookshelf'
import Book3D from './Book3D'

// ── Lighting ───────────────────────────────────────────────────────────────────

function SceneLighting() {
  return (
    <>
      {/* Soft cool ambient base */}
      <ambientLight intensity={0.3} color="#c8d0ff" />

      {/* Main key light — warm, from upper right */}
      <directionalLight
        position={[6, 10, 6]}
        intensity={1.6}
        color="#fff8f0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={24}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
      />

      {/* Fill light — cool blue from left */}
      <pointLight position={[-5, 4, 3]} intensity={0.8} color="#4466ff" />

      {/* Warm accent from below — fireplace / desk lamp glow */}
      <pointLight position={[0, -1, 3]} intensity={0.4} color="#ff8833" />

      {/* Spotlight on the bookshelf from front-top */}
      <spotLight
        position={[0, 6, 7]}
        angle={0.35}
        penumbra={0.8}
        intensity={1.0}
        color="#fff5e8"
        castShadow={false}
      />
    </>
  )
}

// ── Floating dust particles ────────────────────────────────────────────────────

function DustParticles() {
  const count = 50
  const pointsRef = useRef()

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 10   // x spread
      arr[i * 3 + 1] = (Math.random() - 0.5) * 4    // y spread
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4    // z spread
    }
    return arr
  }, [])

  // Store per-particle drift params so they're consistent across frames
  const driftParams = useMemo(() => {
    const arr = []
    for (let i = 0; i < count; i++) {
      arr.push({
        speedY:   0.04 + Math.random() * 0.06,
        phaseX:   Math.random() * Math.PI * 2,
        phaseZ:   Math.random() * Math.PI * 2,
        ampX:     0.002 + Math.random() * 0.003,
        ampZ:     0.001 + Math.random() * 0.002,
        freqX:    0.2  + Math.random() * 0.4,
        freqZ:    0.15 + Math.random() * 0.3,
      })
    }
    return arr
  }, [])

  useFrame((state, delta) => {
    if (!pointsRef.current) return
    const pos = pointsRef.current.geometry.attributes.position
    const t   = state.clock.elapsedTime

    for (let i = 0; i < count; i++) {
      const d  = driftParams[i]
      let y    = pos.getY(i)
      y       += d.speedY * delta

      // Reset to bottom when particle drifts above ceiling
      if (y > 2.5) y = -2.0 + Math.random() * 0.4

      pos.setY(i, y)
      pos.setX(i, pos.getX(i) + Math.sin(t * d.freqX + d.phaseX) * d.ampX)
      pos.setZ(i, pos.getZ(i) + Math.sin(t * d.freqZ + d.phaseZ) * d.ampZ)
    }
    pos.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.012}
        color="#8899ff"
        transparent
        opacity={0.35}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

// ── Reflective floor ───────────────────────────────────────────────────────────

function ReflectiveFloor() {
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#050810',
        roughness: 0.1,
        metalness: 0.8,
      }),
    []
  )

  return (
    <mesh
      position={[0, -1.42, -0.5]}
      rotation={[-Math.PI / 2, 0, 0]}
      material={mat}
      receiveShadow
    >
      <planeGeometry args={[12, 6]} />
    </mesh>
  )
}

// ── Books laid out on the shelf ────────────────────────────────────────────────

function BooksOnShelf({ books, selectedBook, onBookClick }) {
  const row1 = useMemo(() => books.slice(0, 8),  [books])
  const row2 = useMemo(() => books.slice(8, 16), [books])

  const getPositions = useCallback((list, y) => {
    const spacing = 0.34
    const startX  = -((list.length - 1) * spacing) / 2
    return list.map((book, i) => ({ book, position: [startX + i * spacing, y, 0.04] }))
  }, [])

  const positions = useMemo(
    () => [...getPositions(row1, 0.575), ...getPositions(row2, -0.625)],
    [row1, row2, getPositions]
  )

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

// ── Scene root ─────────────────────────────────────────────────────────────────

export default function ShelfScene({ books, selectedBook, onBookClick }) {
  return (
    <Canvas
      camera={{ position: [0, 1.0, 6.2], fov: 48 }}
      shadows
      dpr={[1, 2]}
      style={{ background: '#050810' }}
    >
      <color attach="background" args={['#050810']} />
      <fog attach="fog" args={['#050810', 12, 28]} />

      <SceneLighting />

      <Suspense fallback={null}>
        <group>
          <Bookshelf />
          <BooksOnShelf books={books} selectedBook={selectedBook} onBookClick={onBookClick} />
        </group>

        <ReflectiveFloor />

        <ContactShadows
          position={[0, -1.42, 0]}
          opacity={0.65}
          scale={14}
          blur={3.0}
          far={3.5}
          color="#000030"
        />

        <DustParticles />
      </Suspense>

      <OrbitControls
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.8}
        minDistance={3}
        maxDistance={10}
        enablePan={false}
        dampingFactor={0.05}
        enableDamping
        autoRotate={false}
        rotateSpeed={0.6}
      />
    </Canvas>
  )
}
