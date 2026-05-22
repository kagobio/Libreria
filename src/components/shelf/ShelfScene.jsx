import React, { useCallback, useMemo, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei'
import Bookshelf from './Bookshelf'
import Book3D from './Book3D'

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.4} color="#fff4e0" />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        color="#fff8f0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={20}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />
      <pointLight position={[-4, 2, 3]} intensity={0.5} color="#fbbf24" />
      <pointLight position={[4, 2, 3]} intensity={0.3} color="#fde68a" />
      <spotLight
        position={[0, 4, 4]}
        angle={0.4}
        penumbra={0.6}
        intensity={0.6}
        color="#fff4d6"
        castShadow={false}
      />
    </>
  )
}

function BooksOnShelf({ books, selectedBook, onBookClick }) {
  const booksRow1 = useMemo(() => books.slice(0, 8), [books])
  const booksRow2 = useMemo(() => books.slice(8, 16), [books])

  const getBookPositions = useCallback((bookList, yPos) => {
    const spacing = 0.35
    const totalWidth = (bookList.length - 1) * spacing
    const startX = -totalWidth / 2

    return bookList.map((book, i) => ({
      book,
      position: [startX + i * spacing, yPos, 0.04],
    }))
  }, [])

  const row1Positions = useMemo(
    () => getBookPositions(booksRow1, 0.575),
    [booksRow1, getBookPositions]
  )
  const row2Positions = useMemo(
    () => getBookPositions(booksRow2, -0.625),
    [booksRow2, getBookPositions]
  )

  const allPositions = useMemo(
    () => [...row1Positions, ...row2Positions],
    [row1Positions, row2Positions]
  )

  return (
    <>
      {allPositions.map(({ book, position }) => (
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

function EmptyShelfHint({ hasBooks }) {
  if (hasBooks) return null
  return null // Handled in the UI layer
}

export default function ShelfScene({ books, selectedBook, onBookClick }) {
  return (
    <Canvas
      camera={{ position: [0, 1.2, 6.5], fov: 50 }}
      shadows
      dpr={[1, 2]}
      style={{ background: '#1a0f0a' }}
    >
      <color attach="background" args={['#1a0f0a']} />
      <fog attach="fog" args={['#1a0f0a', 15, 30]} />

      <SceneLighting />

      <Suspense fallback={null}>
        <group position={[0, 0, 0]}>
          <Bookshelf />
          <BooksOnShelf
            books={books}
            selectedBook={selectedBook}
            onBookClick={onBookClick}
          />
        </group>

        <ContactShadows
          position={[0, -1.42, 0]}
          opacity={0.6}
          scale={12}
          blur={2}
          far={3}
          color="#000000"
        />
      </Suspense>

      <OrbitControls
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.8}
        minDistance={3}
        maxDistance={10}
        enablePan={false}
        dampingFactor={0.05}
        enableDamping
      />
    </Canvas>
  )
}
