import React, { useState, useEffect, useCallback } from 'react'
import { supabase, isConfigured } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import ShelfScene from '../components/shelf/ShelfScene'
import Navbar from '../components/ui/Navbar'
import BookDetailPanel from '../components/ui/BookDetailPanel'
import AddBookModal from '../components/ui/AddBookModal'

export default function ShelfPage() {
  const { user } = useAuth()
  const [books, setBooks] = useState([])
  const [selectedBook, setSelectedBook] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchBooks = useCallback(async () => {
    if (!supabase) {
      setLoading(false)
      return
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: true })

      if (fetchError) throw fetchError
      setBooks(data || [])
    } catch (err) {
      setError('Error al cargar los libros')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBooks()

    if (!supabase) return

    const subscription = supabase
      .channel('books_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'books' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setBooks((prev) => [...prev, payload.new])
          } else if (payload.eventType === 'UPDATE') {
            setBooks((prev) =>
              prev.map((b) => (b.id === payload.new.id ? payload.new : b))
            )
          } else if (payload.eventType === 'DELETE') {
            setBooks((prev) => prev.filter((b) => b.id !== payload.old.id))
            setSelectedBook((prev) =>
              prev?.id === payload.old.id ? null : prev
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [fetchBooks])

  const handleBookClick = useCallback((book) => {
    setSelectedBook((prev) => (prev?.id === book.id ? null : book))
  }, [])

  const handleClosePanel = useCallback(() => {
    setSelectedBook(null)
  }, [])

  const handleBookAdded = useCallback((newBook) => {
    setBooks((prev) => [...prev, newBook])
  }, [])

  const handleCloseModal = useCallback(() => {
    setShowAddModal(false)
  }, [])

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col" style={{ background: '#070b17' }}>
      <Navbar />

      {/* Main content area */}
      <div className="flex-1 relative" style={{ marginTop: '60px' }}>
        {/* 3D Canvas */}
        <div
          className="absolute inset-0 transition-all duration-300"
          style={{ right: selectedBook ? '380px' : '0' }}
        >
          {loading ? (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className="text-5xl mb-4 animate-bounce">📚</div>
              <p className="text-amber-500 font-serif text-lg animate-pulse">
                Cargando tu biblioteca...
              </p>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <ShelfScene
                books={books}
                selectedBook={selectedBook}
                onBookClick={handleBookClick}
              />
              {/* CSS vignette overlay */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%)' }} />
            </div>
          )}
        </div>

        {/* Empty state overlay */}
        {!loading && books.length === 0 && isConfigured && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            style={{ right: selectedBook ? '380px' : '0' }}
          >
            <div
              className="text-center p-8 rounded-xl pointer-events-auto"
              style={{
                background: 'rgba(26, 15, 10, 0.8)',
                border: '1px solid rgba(139, 105, 20, 0.2)',
                backdropFilter: 'blur(4px)',
              }}
            >
              <p className="text-amber-600 text-4xl mb-3">📖</p>
              <p className="text-amber-400 font-serif text-lg mb-1">
                Tu estantería está vacía
              </p>
              <p className="text-amber-700 text-sm mb-4">
                ¡Añade tu primer libro para comenzar!
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-amber-700 hover:bg-amber-600 text-amber-100 px-5 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Añadir primer libro
              </button>
            </div>
          </div>
        )}

        {/* Not configured state */}
        {!isConfigured && !loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="text-center p-8 rounded-xl max-w-sm"
              style={{
                background: 'rgba(26, 15, 10, 0.9)',
                border: '1px solid rgba(139, 105, 20, 0.3)',
              }}
            >
              <p className="text-amber-400 text-4xl mb-3">⚙️</p>
              <p className="text-amber-300 font-serif text-lg mb-2">
                Configuración necesaria
              </p>
              <p className="text-amber-600 text-sm">
                Configura las variables de entorno de Supabase para usar la aplicación.
                Consulta el archivo SETUP.md.
              </p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
            <div className="bg-red-900 bg-opacity-90 border border-red-700 rounded-lg px-4 py-3 text-red-300 text-sm">
              {error}
            </div>
          </div>
        )}

        {/* Book count info */}
        {!loading && books.length > 0 && (
          <div
            className="absolute top-4 left-4 z-30"
            style={{
              background: 'rgba(26, 15, 10, 0.75)',
              border: '1px solid rgba(139, 105, 20, 0.25)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div className="px-3 py-2 rounded-lg">
              <p className="text-amber-600 text-xs">
                <span className="text-amber-400 font-semibold">{books.length}</span>
                {' '}{books.length === 1 ? 'libro' : 'libros'} en la estantería
              </p>
            </div>
          </div>
        )}

        {/* Hint text */}
        {!loading && books.length > 0 && !selectedBook && (
          <div
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30 text-center pointer-events-none"
          >
            <p className="text-amber-800 text-xs">
              Haz clic en un libro para ver detalles · Arrastra para rotar la vista
            </p>
          </div>
        )}
      </div>

      {/* Book detail panel */}
      {selectedBook && (
        <BookDetailPanel
          book={selectedBook}
          onClose={handleClosePanel}
        />
      )}

      {/* Add book floating button */}
      {isConfigured && (
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-sm transition-all hover:scale-105 active:scale-95 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #b45309, #d97706)',
            color: '#1a0f0a',
            boxShadow: '0 8px 24px rgba(180, 83, 9, 0.4)',
            right: selectedBook ? '396px' : '24px',
            transition: 'right 0.3s ease',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Añadir libro
        </button>
      )}

      {/* Add book modal */}
      {showAddModal && (
        <AddBookModal
          onClose={handleCloseModal}
          onBookAdded={handleBookAdded}
        />
      )}
    </div>
  )
}
