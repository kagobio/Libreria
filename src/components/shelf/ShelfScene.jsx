import React, { useCallback, useMemo, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import Bookshelf from './Bookshelf'
import Book3D from './Book3D'

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.5} color="#d0d8ff" />
      <directionalLight position={[4, 8, 6]} intensity={1.4} color="#ffffff" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-far={20} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={6} shadow-camera-bottom={-6} />
      <pointLight position={[-3, 3, 4]} intensity={0.6} color="#818cf8" />
      <pointLight position={[3, 3, 4]}  intensity={0.4} color="#a5b4fc" />
      <spotLight position={[0, 5, 5]} angle={0.35} penumbra={0.7} intensity={0.5} color="#e0e7ff" />
    </>
  )
}

function BooksOnShelf({ books, selectedBook, onBookClick }) {
  const row1 = useMemo(() => books.slice(0, 8),  [books])
  const row2 = useMemo(() => books.slice(8, 16), [books])

  const getPositions = useCallback((list, y) => {
    const spacing = 0.35
    const startX = -((list.length - 1) * spacing) / 2
    return list.map((book, i) => ({ book, position: [startX + i * spacing, y, 0.04] }))
  }, [])

  const positions = useMemo(
    () => [...getPositions(row1, 0.575), ...getPositions(row2, -0.625)],
    [row1, row2, getPositions]
  )

  return (
    <>
      {positions.map(({ book, position }) => (
        <Book3D key={book.id} book={book} position={position} isSelected={selectedBook?.id === book.id} onClick={onBookClick} />
      ))}
    </>
  )
}

export default function ShelfScene({ books, selectedBook, onBookClick }) {
  return (
    <Canvas camera={{ position: [0, 1.2, 6.5], fov: 50 }} shadows dpr={[1, 2]} style={{ background: '#070b17' }}>
      <color attach="background" args={['#070b17']} />
      <fog attach="fog" args={['#070b17', 18, 35]} />
      <SceneLighting />
      <Suspense fallback={null}>
        <group>
          <Bookshelf />
          <BooksOnShelf books={books} selectedBook={selectedBook} onBookClick={onBookClick} />
        </group>
        <ContactShadows position={[0, -1.42, 0]} opacity={0.5} scale={12} blur={2.5} far={3} color="#000020" />
      </Suspense>
      <OrbitControls minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 1.8} minDistance={3} maxDistance={10} enablePan={false} dampingFactor={0.05} enableDamping />
    </Canvas>
  )
}
