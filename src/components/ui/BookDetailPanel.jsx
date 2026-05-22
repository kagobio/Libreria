import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import StarRating from './StarRating'
import CommentSection from './CommentSection'

const GENRE_LABELS = {
  fiction: 'Ficción',
  nonfiction: 'No ficción',
  scifi: 'Ciencia ficción',
  fantasy: 'Fantasía',
  history: 'Historia',
  biography: 'Biografía',
  other: 'Otro',
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
      const [ratingsResult, profileResult] = await Promise.all([
        supabase.from('ratings').select('*').eq('book_id', book.id),
        book.added_by
          ? supabase.from('profiles').select('username').eq('id', book.added_by).single()
          : Promise.resolve({ data: null }),
      ])

      if (ratingsResult.data) setRatings(ratingsResult.data)
      if (profileResult.data) setAddedByUsername(profileResult.data.username)
    } catch (err) {
      console.error('Error fetching book data:', err)
    } finally {
      setLoadingData(false)
    }
  }, [book])

  useEffect(() => {
    fetchData()

    if (!supabase || !book) return

    const subscription = supabase
      .channel(`ratings:book_id=eq.${book.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ratings', filter: `book_id=eq.${book.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setRatings((prev) => [...prev, payload.new])
          } else if (payload.eventType === 'UPDATE') {
            setRatings((prev) =>
              prev.map((r) => (r.id === payload.new.id ? payload.new : r))
            )
          } else if (payload.eventType === 'DELETE') {
            setRatings((prev) => prev.filter((r) => r.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [book, fetchData])

  if (!book) return null

  const spineColor = book.spine_color || '#8B4513'
  const genreLabel = GENRE_LABELS[book.genre] || book.genre || 'Sin género'

  return (
    <div
      className="fixed right-0 top-0 bottom-0 z-40 flex flex-col"
      style={{
        width: '380px',
        background: 'rgba(20, 12, 7, 0.97)',
        borderLeft: '1px solid rgba(139, 105, 20, 0.3)',
        boxShadow: '-10px 0 40px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Book cover header */}
      <div
        className="relative flex-shrink-0 p-6 pb-4"
        style={{
          background: `linear-gradient(135deg, ${spineColor}22 0%, ${spineColor}11 100%)`,
          borderBottom: '1px solid rgba(139, 105, 20, 0.2)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-amber-600 hover:text-amber-300 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-amber-900 hover:bg-opacity-40"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>

        <div className="flex gap-4 items-start">
          {/* Mini book cover */}
          <div
            className="flex-shrink-0 rounded shadow-lg flex items-center justify-center"
            style={{
              width: '60px',
              height: '88px',
              background: `linear-gradient(135deg, ${spineColor}, ${spineColor}bb)`,
              boxShadow: `3px 3px 12px rgba(0,0,0,0.5), inset -2px 0 6px rgba(0,0,0,0.2)`,
            }}
          >
            <span className="text-white text-opacity-60 text-2xl">📖</span>
          </div>

          <div className="flex-1 min-w-0 pr-8">
            <h2 className="text-amber-200 font-serif text-lg font-bold leading-tight mb-1 break-words">
              {book.title}
            </h2>
            <p className="text-amber-500 text-sm mb-2">{book.author}</p>
            {book.genre && (
              <span
                className="inline-block text-xs px-2 py-0.5 rounded-full border"
                style={{
                  borderColor: `${spineColor}66`,
                  color: spineColor,
                  background: `${spineColor}22`,
                }}
              >
                {genreLabel}
              </span>
            )}
          </div>
        </div>

        {addedByUsername && (
          <p className="text-amber-800 text-xs mt-3">
            Añadido por <span className="text-amber-600">{addedByUsername}</span>
          </p>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto panel-scroll p-5 space-y-5">
        {/* Description */}
        {book.description && (
          <div>
            <p className="text-amber-500 text-xs uppercase tracking-wider mb-2 font-medium">
              Descripción
            </p>
            <p className="text-amber-200 text-sm leading-relaxed">
              {book.description}
            </p>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-amber-900 border-opacity-30" />

        {/* Star Rating */}
        {loadingData ? (
          <div className="animate-pulse">
            <div className="h-4 bg-amber-900 rounded w-24 mb-2" />
            <div className="h-7 bg-amber-900 rounded w-40" />
          </div>
        ) : (
          <StarRating
            bookId={book.id}
            initialRating={userRating}
            allRatings={ratings}
          />
        )}

        {/* Divider */}
        <div className="border-t border-amber-900 border-opacity-30" />

        {/* Comments */}
        <CommentSection bookId={book.id} />
      </div>
    </div>
  )
}
