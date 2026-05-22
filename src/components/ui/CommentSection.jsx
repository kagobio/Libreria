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
  const commentsEndRef = useRef(null)

  const fetchProfiles = useCallback(async (userIds) => {
    if (!supabase || !userIds.length) return
    const { data } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', userIds)
    if (data) {
      const map = {}
      data.forEach((p) => { map[p.id] = p.username })
      setProfiles((prev) => ({ ...prev, ...map }))
    }
  }, [])

  const fetchComments = useCallback(async () => {
    if (!supabase) return
    setLoading(true)
    try {
      const { data, error: fetchError } = await supabase
        .from('comments')
        .select('*')
        .eq('book_id', bookId)
        .order('created_at', { ascending: true })

      if (fetchError) throw fetchError
      setComments(data || [])

      const userIds = [...new Set((data || []).map((c) => c.user_id))]
      await fetchProfiles(userIds)
    } catch (err) {
      console.error('Error fetching comments:', err)
    } finally {
      setLoading(false)
    }
  }, [bookId, fetchProfiles])

  useEffect(() => {
    fetchComments()

    if (!supabase) return

    const subscription = supabase
      .channel(`comments:book_id=eq.${bookId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comments', filter: `book_id=eq.${bookId}` },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const newCom = payload.new
            setComments((prev) => [...prev, newCom])
            if (!profiles[newCom.user_id]) {
              await fetchProfiles([newCom.user_id])
            }
          } else if (payload.eventType === 'DELETE') {
            setComments((prev) => prev.filter((c) => c.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [bookId, fetchComments, fetchProfiles, profiles])

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !user || !supabase) return
    setSubmitting(true)
    setError('')

    try {
      const { error: insertError } = await supabase
        .from('comments')
        .insert({ book_id: bookId, user_id: user.id, content: newComment.trim() })

      if (insertError) throw insertError
      setNewComment('')
    } catch (err) {
      setError('Error al publicar comentario')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }, [newComment, user, bookId])

  const handleDelete = useCallback(async (commentId) => {
    if (!supabase) return
    try {
      const { error: deleteError } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id)

      if (deleteError) throw deleteError
      setComments((prev) => prev.filter((c) => c.id !== commentId))
    } catch (err) {
      console.error('Error deleting comment:', err)
    }
  }, [user])

  return (
    <div>
      <p className="text-amber-500 text-xs uppercase tracking-wider mb-3 font-medium">
        Comentarios ({comments.length})
      </p>

      {/* Comments list */}
      <div className="space-y-3 mb-4 max-h-56 overflow-y-auto panel-scroll pr-1">
        {loading ? (
          <p className="text-amber-700 text-sm animate-pulse">Cargando comentarios...</p>
        ) : comments.length === 0 ? (
          <p className="text-amber-800 text-sm italic">
            Sé el primero en comentar este libro.
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-dark-300 rounded-lg p-3 border border-amber-900 border-opacity-30"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-dark-400 flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #d97706, #92400e)' }}
                  >
                    {(profiles[comment.user_id] || '?')[0]?.toUpperCase()}
                  </div>
                  <span className="text-amber-400 text-xs font-medium">
                    {profiles[comment.user_id] || 'Usuario'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-800 text-xs">
                    {timeAgo(comment.created_at)}
                  </span>
                  {comment.user_id === user?.id && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-amber-800 hover:text-red-400 transition-colors"
                      title="Eliminar comentario"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                        <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <p className="text-amber-100 text-sm leading-relaxed">{comment.content}</p>
            </div>
          ))
        )}
        <div ref={commentsEndRef} />
      </div>

      {/* New comment form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Escribe un comentario..."
          maxLength={500}
          className="flex-1 bg-dark-300 border border-amber-900 rounded-lg px-3 py-2 text-amber-100 placeholder-amber-800 text-sm focus:outline-none focus:border-amber-600 transition-colors"
        />
        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className="bg-amber-700 hover:bg-amber-600 disabled:bg-amber-900 disabled:cursor-not-allowed text-amber-100 text-sm px-3 py-2 rounded-lg transition-colors font-medium whitespace-nowrap"
        >
          {submitting ? '...' : 'Comentar'}
        </button>
      </form>

      {error && (
        <p className="text-red-400 text-xs mt-1">{error}</p>
      )}
    </div>
  )
}
