import React, { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora mismo'
  if (mins < 60) return `hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `hace ${days}d`
  return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

export default function CommentSection({ bookId }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [profiles, setProfiles] = useState({})
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const endRef = useRef(null)

  const fetchProfiles = useCallback(async (ids) => {
    if (!supabase || !ids.length) return
    const { data } = await supabase.from('profiles').select('id, username').in('id', ids)
    if (data) setProfiles((p) => { const m = { ...p }; data.forEach((r) => { m[r.id] = r.username }); return m })
  }, [])

  const fetchComments = useCallback(async () => {
    if (!supabase) return
    setLoading(true)
    try {
      const { data } = await supabase.from('comments').select('*').eq('book_id', bookId).order('created_at', { ascending: true })
      setComments(data || [])
      await fetchProfiles([...new Set((data || []).map((c) => c.user_id))])
    } finally { setLoading(false) }
  }, [bookId, fetchProfiles])

  useEffect(() => {
    fetchComments()
    if (!supabase) return
    const sub = supabase
      .channel(`comments:${bookId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `book_id=eq.${bookId}` }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          setComments((p) => [...p, payload.new])
          if (!profiles[payload.new.user_id]) await fetchProfiles([payload.new.user_id])
        } else if (payload.eventType === 'DELETE') {
          setComments((p) => p.filter((c) => c.id !== payload.old.id))
        }
      })
      .subscribe()
    return () => supabase.removeChannel(sub)
  }, [bookId, fetchComments, fetchProfiles, profiles])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [comments])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !user || !supabase) return
    setSubmitting(true)
    setError('')
    try {
      const { error: err } = await supabase.from('comments').insert({ book_id: bookId, user_id: user.id, content: newComment.trim() })
      if (err) throw err
      setNewComment('')
    } catch { setError('Error al publicar comentario') }
    finally { setSubmitting(false) }
  }, [newComment, user, bookId])

  const handleDelete = useCallback(async (id) => {
    if (!supabase) return
    await supabase.from('comments').delete().eq('id', id).eq('user_id', user.id)
    setComments((p) => p.filter((c) => c.id !== id))
  }, [user])

  return (
    <div>
      <p className="text-xs uppercase tracking-wider mb-3 font-medium" style={{ color: '#6366f1' }}>
        Comentarios ({comments.length})
      </p>

      <div className="space-y-3 mb-4 max-h-56 overflow-y-auto panel-scroll pr-1">
        {loading ? (
          <p className="text-slate-600 text-sm animate-pulse">Cargando...</p>
        ) : comments.length === 0 ? (
          <p className="text-slate-600 text-sm italic">Sé el primero en comentar.</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="rounded-xl p-3" style={{ background: '#121929', border: '1px solid rgba(99,102,241,0.1)' }}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #4338ca)' }}>
                    {(profiles[c.user_id] || '?')[0]?.toUpperCase()}
                  </div>
                  <span className="text-indigo-400 text-xs font-medium">{profiles[c.user_id] || 'Usuario'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-600 text-xs">{timeAgo(c.created_at)}</span>
                  {c.user_id === user?.id && (
                    <button onClick={() => handleDelete(c.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                        <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{c.content}</p>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Escribe un comentario..."
          maxLength={500}
          className="flex-1 rounded-xl px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          style={{ background: '#121929', border: '1px solid rgba(99,102,241,0.2)' }}
        />
        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className="text-sm px-4 py-2 rounded-xl transition-all font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed text-white"
          style={{ background: '#4f46e5' }}
        >
          {submitting ? '...' : 'Enviar'}
        </button>
      </form>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}
