import React, { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

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

const PRESET_COLORS = [
  '#8B2020', '#1E3A8A', '#1A5C2A', '#4A1A6B',
  '#8B4A1A', '#0F2040', '#1A3A1A', '#6B1A3A',
]

function mapGoogleGenre(categories) {
  if (!categories?.length) return ''
  const c = categories[0].toLowerCase()
  if (c.includes('fiction') && (c.includes('science') || c.includes('sci'))) return 'scifi'
  if (c.includes('fantasy')) return 'fantasy'
  if (c.includes('fiction')) return 'fiction'
  if (c.includes('history')) return 'history'
  if (c.includes('biograph')) return 'biography'
  if (c.includes('nonfiction') || c.includes('non-fiction')) return 'nonfiction'
  return 'other'
}

export default function AddBookModal({ onClose, onBookAdded }) {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [genre, setGenre] = useState('')
  const [description, setDescription] = useState('')
  const [spineColor, setSpineColor] = useState(PRESET_COLORS[0])
  const [coverUrl, setCoverUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const searchRef = useRef(null)

  const doSearch = useCallback(async () => {
    if (!search.trim() || search.length < 2) return
    setSearchLoading(true)
    setSearchError('')
    setSuggestions([])
    try {
      const res = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(search.trim())}&language=spa&limit=8&fields=key,title,author_name,subject,cover_i,first_sentence`
      )
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      if (!data.docs || data.docs.length === 0) {
        setSearchError('No se encontraron resultados. Prueba otro título.')
      } else {
        setSuggestions(data.docs)
      }
    } catch (e) {
      setSearchError(`Error al buscar: ${e.message}`)
    } finally {
      setSearchLoading(false)
    }
  }, [search])

  const selectSuggestion = useCallback((item) => {
    setTitle(item.title || '')
    setAuthor(item.author_name?.[0] || '')
    setGenre(mapGoogleGenre(item.subject))
    const desc = item.first_sentence?.value || item.first_sentence || ''
    setDescription(typeof desc === 'string' ? desc.slice(0, 600) : '')
    const thumb = item.cover_i
      ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg`
      : null
    setCoverUrl(thumb)
    setSearch('')
    setSuggestions([])
    setSearchError('')
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!title.trim() || !author.trim()) { setError('El título y el autor son obligatorios'); return }
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
          cover_url: coverUrl,
          added_by: user.id,
        })
        .select()
        .single()
      if (insertError) throw insertError
      onBookAdded?.(data)
      onClose()
    } catch (err) {
      setError(err.message || 'Error al añadir el libro')
    } finally {
      setLoading(false)
    }
  }, [title, author, genre, description, spineColor, coverUrl, user, onClose, onBookAdded])

  const panelStyle = { background: '#0d1221', border: '1px solid rgba(99,102,241,0.2)', boxShadow: '0 25px 60px rgba(0,0,0,0.7)' }
  const inputStyle = { background: '#121929', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }
  const inputClass = 'w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all'
  const labelClass = 'block text-slate-400 text-xs uppercase tracking-wider mb-1.5'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl overflow-hidden" style={panelStyle}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
          <h2 className="font-serif text-lg font-semibold" style={{ color: '#a5b4fc' }}>Añadir libro</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto panel-scroll">
          {/* Book search */}
          <div ref={searchRef}>
            <label className={labelClass}>Buscar libro</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), doSearch())}
                placeholder="Título, autor o ambos..."
                className={inputClass}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                type="button"
                onClick={doSearch}
                disabled={searchLoading || search.length < 2}
                className="px-4 rounded-xl text-sm font-medium text-white disabled:opacity-50 transition-all flex-shrink-0"
                style={{ background: '#4f46e5' }}
              >
                {searchLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : 'Buscar'}
              </button>
            </div>

            {searchError && (
              <p className="text-red-400 text-xs mt-2">{searchError}</p>
            )}
            {suggestions.length > 0 && (
              <div className="mt-2 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(99,102,241,0.3)' }}>
                {suggestions.map((item, i) => {
                  const thumb = item.cover_i
                    ? `https://covers.openlibrary.org/b/id/${item.cover_i}-S.jpg`
                    : null
                  return (
                    <button
                      key={item.key || i}
                      type="button"
                      onClick={() => selectSuggestion(item)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                      style={{ background: '#121929', borderBottom: '1px solid rgba(99,102,241,0.1)' }}
                    >
                      {thumb ? (
                        <img src={thumb} alt="" className="w-9 h-12 object-cover rounded flex-shrink-0" />
                      ) : (
                        <div className="w-9 h-12 rounded flex-shrink-0 flex items-center justify-center text-lg" style={{ background: '#1a2235' }}>📖</div>
                      )}
                      <div className="min-w-0">
                        <p className="text-slate-200 text-sm font-medium truncate">{item.title}</p>
                        <p className="text-slate-500 text-xs truncate">{item.author_name?.join(', ') || 'Autor desconocido'}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Cover preview if selected from search */}
          {coverUrl && (
            <div className="flex items-center gap-3 rounded-xl p-3" style={{ background: '#121929', border: '1px solid rgba(99,102,241,0.15)' }}>
              <img src={coverUrl} alt="Portada" className="w-12 h-16 object-cover rounded shadow-lg" />
              <div>
                <p className="text-slate-300 text-sm font-medium">{title}</p>
                <p className="text-slate-500 text-xs">{author}</p>
              </div>
              <button type="button" onClick={() => setCoverUrl(null)} className="ml-auto text-slate-600 hover:text-slate-400 text-xs">✕</button>
            </div>
          )}

          <div style={{ borderTop: '1px solid rgba(99,102,241,0.1)', paddingTop: '12px' }}>
            <p className="text-slate-500 text-xs mb-4">O rellena los datos manualmente:</p>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Título <span className="text-indigo-500">*</span></label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Cien años de soledad" required maxLength={200} className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className={labelClass}>Autor <span className="text-indigo-500">*</span></label>
                <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Ej: Gabriel García Márquez" required maxLength={200} className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className={labelClass}>Género</label>
                <select value={genre} onChange={(e) => setGenre(e.target.value)} className={inputClass} style={{ ...inputStyle, appearance: 'none' }}>
                  {GENRES.map((g) => <option key={g.value} value={g.value} style={{ background: '#121929' }}>{g.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Descripción</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Una breve descripción (opcional)..." rows={3} maxLength={1000} className={inputClass} style={{ ...inputStyle, resize: 'none' }} />
              </div>

              {/* Spine color */}
              <div>
                <label className={labelClass}>Color del lomo</label>
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSpineColor(color)}
                      className="rounded-full transition-transform hover:scale-110"
                      style={{
                        width: '30px', height: '30px',
                        background: color,
                        border: spineColor === color ? '2px solid #818cf8' : '2px solid transparent',
                        boxShadow: spineColor === color ? '0 0 0 2px rgba(99,102,241,0.4)' : '0 2px 4px rgba(0,0,0,0.4)',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl px-4 py-3 text-red-300 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors" style={{ border: '1px solid rgba(99,102,241,0.2)' }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading || !title.trim() || !author.trim()} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: '#4f46e5', boxShadow: '0 4px 15px rgba(79,70,229,0.3)' }}>
              {loading ? 'Añadiendo...' : 'Añadir libro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
