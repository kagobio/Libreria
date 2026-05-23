import React, { useMemo, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import Bookshelf from './Bookshelf'
import Book3D from './Book3D'

// Mirror Bookshelf.jsx geometry constants so books sit perfectly in each compartment
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

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={1.1} color="#fff8ee" />
      <directionalLight
        position={[2, 7, 8]} intensity={2.4} color="#fffbf0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-9} shadow-camera-right={9}
        shadow-camera-top={6} shadow-camera-bottom={-6}
        shadow-camera-far={26}
      />
      <pointLight position={[-5, 3, 5]} intensity={0.9} color="#ffc050" />
      <pointLight position={[ 5, 3, 5]} intensity={0.9} color="#ffd070" />
      <pointLight position={[ 0, 5, 6]} intensity={0.7} color="#ffe8c0" />
    </>
  )
}

const BOOKS_PER_COL = 2
const SPACING       = 0.32

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
      camera={{ position: [0, 0.1, 7.8], fov: 46 }}
      shadows
      dpr={[1, 2]}
    >
      <color attach="background" args={['#1e0f08']} />
      <fog attach="fog" args={['#1e0f08', 20, 40]} />

      <SceneLighting />

      <Suspense fallback={null}>
        <group>
          <Bookshelf />
          <BooksOnShelf books={books} selectedBook={selectedBook} onBookClick={onBookClick} />
        </group>
        <ContactShadows
          position={[0, -1.55, 0]}
          opacity={0.5} scale={14} blur={3} far={3}
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
