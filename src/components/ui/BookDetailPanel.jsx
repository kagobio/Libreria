import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import StarRating from './StarRating'
import CommentSection from './CommentSection'

const GENRE_LABELS = {
  fiction: 'Ficción', nonfiction: 'No ficción', scifi: 'Ciencia ficción',
  fantasy: 'Fantasía', history: 'Historia', biography: 'Biografía', other: 'Otro',
}

export default function BookDetailPanel({ book, onClose }) {
  const { user } = useAuth()
  const [ratings, setRatings] = useState([])
  const [addedByUsername, setAddedByUsername] = useState('')
  const [loadingData, setLoadingData] = useState(true)

  const userRating = ratings.find((r) => r.user_id === user?.id)?.score || 0

  const fetchData = useCallback(async () => {
    if (!supabase || !book) return
    setLoadingData(true)
    try {
      const [ratingsRes, profileRes] = await Promise.all([
        supabase.from('ratings').select('*').eq('book_id', book.id),
        book.added_by
          ? supabase.from('profiles').select('username').eq('id', book.added_by).single()
          : Promise.resolve({ data: null }),
      ])
      if (ratingsRes.data) setRatings(ratingsRes.data)
      if (profileRes.data) setAddedByUsername(profileRes.data.username)
    } finally {
      setLoadingData(false)
    }
  }, [book])

  useEffect(() => {
    fetchData()
    if (!supabase || !book) return
    const sub = supabase
      .channel(`ratings:${book.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ratings', filter: `book_id=eq.${book.id}` }, (payload) => {
        if (payload.eventType === 'INSERT') setRatings((p) => [...p, payload.new])
        else if (payload.eventType === 'UPDATE') setRatings((p) => p.map((r) => r.id === payload.new.id ? payload.new : r))
        else if (payload.eventType === 'DELETE') setRatings((p) => p.filter((r) => r.id !== payload.old.id))
      })
      .subscribe()
    return () => supabase.removeChannel(sub)
  }, [book, fetchData])

  if (!book) return null

  const spineColor = book.spine_color || '#4338ca'
  const genreLabel = GENRE_LABELS[book.genre] || book.genre || null

  return (
    <div
      className="fixed right-0 top-0 bottom-0 z-40 flex flex-col"
      style={{ width: '380px', background: 'rgba(10,5,2,0.92)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', borderLeft: '1px solid rgba(200,140,40,0.22)', boxShadow: '-12px 0 50px rgba(0,0,0,0.85)' }}
    >
      {/* Header */}
      <div className="relative flex-shrink-0 p-6 pb-4" style={{ borderBottom: '1px solid rgba(200,140,40,0.18)' }}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors w-8 h-8 flex items-center justify-center rounded-full"
          style={{ background: 'rgba(200,140,40,0.12)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>

        <div className="flex gap-4 items-start pr-8">
          {/* Book cover */}
          <div className="flex-shrink-0 rounded-lg overflow-hidden shadow-xl" style={{ width: '64px', height: '92px' }}>
            {book.cover_url ? (
              <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl" style={{ background: `linear-gradient(135deg, ${spineColor}, ${spineColor}99)` }}>
                📖
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-slate-100 font-serif text-lg font-bold leading-tight mb-1 break-words">{book.title}</h2>
            <p className="text-slate-400 text-sm mb-2">{book.author}</p>
            {genreLabel && (
              <span className="inline-block text-xs px-2.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(200,140,40,0.18)', color: '#d4a050', border: '1px solid rgba(200,140,40,0.35)' }}>
                {genreLabel}
              </span>
            )}
          </div>
        </div>

        {addedByUsername && (
          <p className="text-slate-600 text-xs mt-3">
            Añadido por <span style={{ color: '#d4a050' }}>{addedByUsername}</span>
          </p>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto panel-scroll p-5 space-y-5">
        {book.description && (
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Descripción</p>
            <p className="text-slate-300 text-sm leading-relaxed">{book.description}</p>
          </div>
        )}

        <div style={{ borderTop: '1px solid rgba(200,140,40,0.12)' }} />

        {loadingData ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 rounded w-24" style={{ background: '#1a2235' }} />
            <div className="h-7 rounded w-40" style={{ background: '#1a2235' }} />
          </div>
        ) : (
          <StarRating bookId={book.id} initialRating={userRating} allRatings={ratings} />
        )}

        <div style={{ borderTop: '1px solid rgba(200,140,40,0.12)' }} />

        <CommentSection bookId={book.id} />
      </div>
    </div>
  )
}
