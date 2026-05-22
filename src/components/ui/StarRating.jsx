import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

export default function StarRating({ bookId, initialRating = 0, allRatings = [] }) {
  const { user } = useAuth()
  const [hovered, setHovered] = useState(0)
  const [userRating, setUserRating] = useState(initialRating)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { setUserRating(initialRating) }, [initialRating])

  const average = allRatings.length > 0
    ? (allRatings.reduce((sum, r) => sum + r.score, 0) / allRatings.length).toFixed(1)
    : null

  const handleRate = useCallback(async (score) => {
    if (!user || !supabase) return
    setSaving(true)
    setError('')
    try {
      const { error: err } = await supabase
        .from('ratings')
        .upsert({ book_id: bookId, user_id: user.id, score }, { onConflict: 'book_id,user_id' })
      if (err) throw err
      setUserRating(score)
    } catch {
      setError('Error al guardar puntuación')
    } finally {
      setSaving(false)
    }
  }, [user, bookId])

  const display = hovered || userRating

  return (
    <div>
      <p className="text-xs uppercase tracking-wider mb-2 font-medium" style={{ color: '#6366f1' }}>Tu puntuación</p>
      <div className="flex items-center gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => !saving && handleRate(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            disabled={saving}
            className="transition-transform hover:scale-110 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={star <= display ? '#f59e0b' : 'none'} stroke={star <= display ? '#f59e0b' : '#2d3748'} strokeWidth="1.5" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </button>
        ))}
        {saving && <span className="text-indigo-400 text-xs ml-2 animate-pulse">Guardando...</span>}
      </div>
      {userRating > 0 && !hovered && <p className="text-slate-500 text-xs">Tu valoración: <span className="text-gold-400">{userRating}/5</span></p>}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      {average !== null && (
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(99,102,241,0.1)' }}>
          <p className="text-slate-500 text-xs">
            <span className="text-slate-200 font-semibold text-sm">{average}</span>
            <span className="ml-1 text-gold-500">⭐</span>
            <span className="text-slate-600 ml-1">promedio ({allRatings.length} {allRatings.length === 1 ? 'voto' : 'votos'})</span>
          </p>
        </div>
      )}
    </div>
  )
}
