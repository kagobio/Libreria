import React, { useMemo, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import Bookshelf from './Bookshelf'
import Book3D from './Book3D'

const W      = 6.4
const PT     = 0.07
const ST     = 0.08
const DT     = 0.07
const COLS   = 4
const ROWS   = 3
const innerW = W - ST * 2
const colInW = (innerW - DT * (COLS - 1)) / COLS
const PLANKS = [-1.38, -0.45, 0.48, 1.41]

const COL_CENTERS = Array.from({ length: COLS }, (_, i) =>
  -(innerW / 2) + colInW / 2 + i * (colInW + DT)
)
const ROW_CENTERS = Array.from({ length: ROWS }, (_, i) =>
  ((PLANKS[i] + PT) + PLANKS[i + 1]) / 2
)

const wallMat  = new THREE.MeshStandardMaterial({ color: '#3a2010', roughness: 0.95, metalness: 0 })
const floorMat = new THREE.MeshStandardMaterial({ color: '#1a0c06', roughness: 0.9,  metalness: 0 })

function Room() {
  return (
    <>
      {/* Back wall */}
      <mesh position={[0, 0.5, -0.28]} receiveShadow material={wallMat}>
        <planeGeometry args={[18, 8]} />
      </mesh>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.55, 0]} receiveShadow material={floorMat}>
        <planeGeometry args={[18, 12]} />
      </mesh>
    </>
  )
}

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.9} color="#fff4e0" />
      {/* Main overhead warm light */}
      <directionalLight
        position={[1, 9, 7]} intensity={2.8} color="#fffbf0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-9} shadow-camera-right={9}
        shadow-camera-top={6} shadow-camera-bottom={-6}
        shadow-camera-far={26}
        shadow-bias={-0.001}
      />
      {/* Warm fill from left */}
      <pointLight position={[-6, 4, 5]} intensity={1.2} color="#ffb840" />
      {/* Warm fill from right */}
      <pointLight position={[ 6, 4, 5]} intensity={1.0} color="#ffc850" />
      {/* Soft top fill */}
      <pointLight position={[ 0, 6, 3]} intensity={0.8} color="#ffe8b0" />
      {/* Subtle front bounce */}
      <pointLight position={[ 0, -0.5, 8]} intensity={0.4} color="#fff0d0" />
    </>
  )
}

const BOOKS_PER_COL = 2
const SPACING       = 0.33

function BooksOnShelf({ books, selectedBook, onBookClick }) {
  const positions = useMemo(() => {
    const slotsPerRow = COLS * BOOKS_PER_COL
    return books.slice(0, ROWS * slotsPerRow).map((book, idx) => {
      const row = Math.floor(idx / slotsPerRow)
      const slot = idx % slotsPerRow
      const col  = Math.floor(slot / BOOKS_PER_COL)
      const pos  = slot % BOOKS_PER_COL
      const x    = COL_CENTERS[col] + (pos - (BOOKS_PER_COL - 1) / 2) * SPACING
      const y    = ROW_CENTERS[row]
      return { book, position: [x, y, 0.05] }
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

export default function ShelfScene({ books, selectedBook, onBookClick }) {
  return (
    <Canvas
      camera={{ position: [0, 0.2, 7.6], fov: 46 }}
      shadows
      dpr={[1, 2]}
    >
      <color attach="background" args={['#1a0c06']} />
      <fog attach="fog" args={['#1a0c06', 22, 42]} />

      <SceneLighting />

      <Suspense fallback={null}>
        <Room />
        <group>
          <Bookshelf />
          <BooksOnShelf books={books} selectedBook={selectedBook} onBookClick={onBookClick} />
        </group>
        <ContactShadows
          position={[0, -1.54, 0]}
          opacity={0.6} scale={14} blur={2.5} far={3}
          color="#000000"
        />
      </Suspense>

      <OrbitControls
        target={[0, 0.1, 0]}
        minPolarAngle={Math.PI / 5} maxPolarAngle={Math.PI / 1.9}
        minDistance={4} maxDistance={11}
        enablePan={false}
        dampingFactor={0.05} enableDamping
        rotateSpeed={0.5}
      />
    </Canvas>
  )
}
