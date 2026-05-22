import React, { useCallback, useMemo, useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import * as THREE from 'three'
import Bookshelf from './Bookshelf'
import Book3D from './Book3D'

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.12} color="#1a2440" />
      <pointLight position={[0, 8, 4]}   intensity={4}   color="#ffffff" />
      <pointLight position={[-5, 3, 5]}  intensity={1.8} color="#4400ff" />
      <pointLight position={[5, 3, 5]}   intensity={1.2} color="#00aaff" />
      <pointLight position={[0, -1, 4]}  intensity={0.6} color="#00d4ff" />
      <spotLight
        position={[0, 6, 8]}
        angle={0.38}
        penumbra={0.9}
        intensity={2.5}
        color="#a0c8ff"
        castShadow={false}
      />
    </>
  )
}

function Starfield() {
  const count = 300
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 120
      arr[i * 3 + 1] = (Math.random() - 0.5) * 80
      arr[i * 3 + 2] = -20 - Math.random() * 60
    }
    return arr
  }, [])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#aabbff" transparent opacity={0.6} sizeAttenuation depthWrite={false} />
    </points>
  )
}

function ScanLine() {
  const ref = useRef()
  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#00d4ff', transparent: true, opacity: 0.06,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }), [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime
    ref.current.position.y = -1.5 + ((t * 0.4) % 3.2)
    ref.current.material.opacity = 0.04 + Math.sin(t * 2) * 0.02
  })

  return (
    <mesh ref={ref} material={mat} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[10, 0.04]} />
    </mesh>
  )
}

function BooksOnShelf({ books, selectedBook, onBookClick }) {
  const row1 = useMemo(() => books.slice(0, 8),  [books])
  const row2 = useMemo(() => books.slice(8, 16), [books])

  const getPositions = useCallback((list, y) => {
    const spacing = 0.34
    const startX  = -((list.length - 1) * spacing) / 2
    return list.map((book, i) => ({ book, position: [startX + i * spacing, y, 0.04] }))
  }, [])

  const positions = useMemo(
    () => [...getPositions(row1, 0.58), ...getPositions(row2, -0.62)],
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

export default function ShelfScene({ books, selectedBook, onBookClick }) {
  return (
    <Canvas camera={{ position: [0, 0.5, 7], fov: 52 }} dpr={[1, 2]} style={{ background: '#000814' }}>
      <color attach="background" args={['#000814']} />

      <SceneLighting />

      <Suspense fallback={null}>
        <Starfield />

        <group>
          <Bookshelf />
          <BooksOnShelf books={books} selectedBook={selectedBook} onBookClick={onBookClick} />
        </group>

        <ScanLine />

        <Grid
          position={[0, -1.48, 0]}
          cellSize={0.5}
          cellThickness={0.4}
          cellColor="#0a1a35"
          sectionSize={2.5}
          sectionThickness={0.8}
          sectionColor="#003366"
          fadeDistance={22}
          fadeStrength={1.8}
          followCamera={false}
          infiniteGrid
        />
      </Suspense>

      <OrbitControls
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={3}
        maxDistance={12}
        enablePan={false}
        dampingFactor={0.04}
        enableDamping
        rotateSpeed={0.5}
      />
    </Canvas>
  )
}
