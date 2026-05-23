import React, { useCallback, useMemo, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import Bookshelf from './Bookshelf'
import Book3D from './Book3D'

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.5} color="#fff4e0" />
      <directionalLight
        position={[4, 8, 6]} intensity={1.4} color="#fff8f0"
        castShadow shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-8} shadow-camera-right={8}
        shadow-camera-top={6} shadow-camera-bottom={-6}
        shadow-camera-far={20}
      />
      <pointLight position={[-4, 3, 4]} intensity={0.6} color="#ffd070" />
      <pointLight position={[ 4, 3, 4]} intensity={0.4} color="#ffe0a0" />
      <spotLight position={[0, 5, 6]} angle={0.4} penumbra={0.7} intensity={0.8} color="#fff4d0" />
    </>
  )
}

function BooksOnShelf({ books, selectedBook, onBookClick }) {
  // Layout: 4 compartments per row, 4 books per compartment, 2 rows
  const row1 = useMemo(() => books.slice(0, 8),  [books])
  const row2 = useMemo(() => books.slice(8, 16), [books])

  const getPositions = useCallback((list, y) => {
    const spacing = 0.31
    const colW    = 6.0 / 4  // 4 compartments
    // Center books within each compartment (2 books per compartment)
    return list.map((book, i) => {
      const col     = Math.floor(i / 2)          // which compartment (0-3)
      const slot    = i % 2                       // slot within compartment (0-1)
      const colCenterX = -6.0 / 2 + colW * (col + 0.5) + (6.0 / 4 / 3) * 0.07 // inside dividers
      const x = colCenterX + (slot - 0.5) * spacing
      return { book, position: [x, y, 0.04] }
    })
  }, [])

  const positions = useMemo(
    () => [...getPositions(row1, 0.56), ...getPositions(row2, -0.64)],
    [row1, row2, getPositions]
  )

  return (
    <>
      {positions.map(({ book, position }) => (
        <Book3D
          key={book.id} book={book} position={position}
          isSelected={selectedBook?.id === book.id}
          onClick={onBookClick}
        />
      ))}
    </>
  )
}

export default function ShelfScene({ books, selectedBook, onBookClick }) {
  return (
    <Canvas camera={{ position: [0, 0.8, 6.5], fov: 50 }} shadows dpr={[1, 2]} style={{ background: '#1a0d06' }}>
      <color attach="background" args={['#1a0d06']} />
      <fog attach="fog" args={['#1a0d06', 14, 30]} />

      <SceneLighting />

      <Suspense fallback={null}>
        <group>
          <Bookshelf />
          <BooksOnShelf books={books} selectedBook={selectedBook} onBookClick={onBookClick} />
        </group>
        <ContactShadows position={[0, -1.5, 0]} opacity={0.55} scale={12} blur={2.5} far={3} color="#000000" />
      </Suspense>

      <OrbitControls
        minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 1.8}
        minDistance={3} maxDistance={10}
        enablePan={false} dampingFactor={0.05} enableDamping rotateSpeed={0.6}
      />
    </Canvas>
  )
}
