import React, { useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const PRESET_COLORS = [
  { value: '#8B2020', label: 'Rojo' },
  { value: '#1E3A8A', label: 'Azul' },
  { value: '#1A5C2A', label: 'Verde' },
  { value: '#4A1A6B', label: 'Morado' },
  { value: '#8B4A1A', label: 'Naranja' },
  { value: '#5C3A1A', label: 'Marrón' },
  { value: '#0F2040', label: 'Marino' },
  { value: '#1A3A1A', label: 'Bosque' },
]

const GENRES = [
  { value: '', label: 'Seleccionar género (opcional)' },
  { value: 'fiction', label: 'Ficción' },
  { value: 'nonfiction', label: 'No ficción' },
  { value: 'scifi', label: 'Ciencia ficción' },
  { value: 'fantasy', label: 'Fantasía' },
  { value: 'history', label: 'Historia' },
  { value: 'biography', label: 'Biografía' },
  { value: 'other', label: 'Otro' },
]

export default function AddBookModal({ onClose, onBookAdded }) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [genre, setGenre] = useState('')
  const [description, setDescription] = useState('')
  const [spineColor, setSpineColor] = useState('#8B2020')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!title.trim() || !author.trim()) {
      setError('El título y el autor son obligatorios')
      return
    }
    if (!user || !supabase) return

    setLoading(true)
    setError('')

    try {
      const { data, error: insertError } = await supabase
        .from('books')
        .insert({
          title: title.trim(),
          author: author.trim(),
          genre: genre || null,
          description: description.trim() || null,
          spine_color: spineColor,
          added_by: user.id,
        })
        .select()
        .single()

      if (insertError) throw insertError

      onBookAdded?.(data)
      onClose()
    } catch (err) {
      setError(err.message || 'Error al añadir el libro')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [title, author, genre, description, spineColor, user, onClose, onBookAdded])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: '#1f1509',
          border: '1px solid rgba(139, 105, 20, 0.3)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(139, 105, 20, 0.2)' }}
        >
          <h2 className="text-amber-300 font-serif text-xl font-semibold">
            Añadir libro
          </h2>
          <button
            onClick={onClose}
            className="text-amber-700 hover:text-amber-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto panel-scroll">
          {/* Title */}
          <div>
            <label className="block text-amber-400 text-sm mb-1">
              Título <span className="text-amber-600">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Cien años de soledad"
              required
              maxLength={200}
              className="w-full bg-dark-300 border border-amber-900 rounded-lg px-4 py-2.5 text-amber-100 placeholder-amber-800 text-sm focus:outline-none focus:border-amber-600 transition-colors"
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-amber-400 text-sm mb-1">
              Autor <span className="text-amber-600">*</span>
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Ej: Gabriel García Márquez"
              required
              maxLength={200}
              className="w-full bg-dark-300 border border-amber-900 rounded-lg px-4 py-2.5 text-amber-100 placeholder-amber-800 text-sm focus:outline-none focus:border-amber-600 transition-colors"
            />
          </div>

          {/* Genre */}
          <div>
            <label className="block text-amber-400 text-sm mb-1">Género</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-dark-300 border border-amber-900 rounded-lg px-4 py-2.5 text-amber-100 text-sm focus:outline-none focus:border-amber-600 transition-colors appearance-none"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23d97706' viewBox='0 0 20 20'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px', paddingRight: '36px' }}
            >
              {GENRES.map((g) => (
                <option key={g.value} value={g.value} style={{ background: '#1f1509' }}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-amber-400 text-sm mb-1">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Una breve descripción del libro (opcional)..."
              rows={3}
              maxLength={1000}
              className="w-full bg-dark-300 border border-amber-900 rounded-lg px-4 py-2.5 text-amber-100 placeholder-amber-800 text-sm focus:outline-none focus:border-amber-600 transition-colors resize-none"
            />
          </div>

          {/* Spine Color */}
          <div>
            <label className="block text-amber-400 text-sm mb-2">Color del lomo</label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSpineColor(color.value)}
                  title={color.label}
                  className="rounded-full transition-transform hover:scale-110 focus:outline-none"
                  style={{
                    width: '32px',
                    height: '32px',
                    background: color.value,
                    border: spineColor === color.value
                      ? '2px solid #fbbf24'
                      : '2px solid transparent',
                    boxShadow: spineColor === color.value
                      ? '0 0 0 2px rgba(251,191,36,0.4), 0 2px 8px rgba(0,0,0,0.4)'
                      : '0 2px 6px rgba(0,0,0,0.3)',
                  }}
                />
              ))}
            </div>

            {/* Preview */}
            <div className="mt-3 flex items-center gap-3">
              <div
                className="rounded flex items-center justify-center text-white text-xs font-bold"
                style={{
                  width: '30px',
                  height: '46px',
                  background: spineColor,
                  boxShadow: '2px 2px 8px rgba(0,0,0,0.4)',
                }}
              >
                📖
              </div>
              <span className="text-amber-700 text-xs">Vista previa del lomo</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-900 bg-opacity-30 border border-red-700 rounded-lg px-4 py-2.5 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-amber-800 text-amber-500 hover:text-amber-300 hover:border-amber-600 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim() || !author.trim()}
              className="flex-1 bg-amber-700 hover:bg-amber-600 disabled:bg-amber-900 disabled:cursor-not-allowed text-amber-100 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-lg"
            >
              {loading ? 'Añadiendo...' : 'Añadir libro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
