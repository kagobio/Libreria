import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { supabase, isConfigured } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const resolvedRef = useRef(false)

  // Resolves loading exactly once
  const resolve = useCallback(() => {
    if (!resolvedRef.current) {
      resolvedRef.current = true
      setLoading(false)
    }
  }, [])

  const fetchProfile = useCallback(async (userId) => {
    if (!supabase || !userId) return null
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
      return data ?? null
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    if (!isConfigured || !supabase) {
      resolve()
      return
    }

    // Safety net: never stay loading more than 5 seconds
    const timeout = setTimeout(resolve, 5000)

    // onAuthStateChange fires immediately with current session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          resolve() // unblock UI immediately
          fetchProfile(session.user.id).then(setProfile)
        } else {
          setProfile(null)
          resolve()
        }
      }
    )

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [fetchProfile, resolve])

  const signIn = useCallback(async (email, password) => {
    if (!supabase) throw new Error('Supabase no está configurado')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }, [])

  const signUp = useCallback(async (email, password, username) => {
    if (!supabase) throw new Error('Supabase no está configurado')
    const { data: existing } = await supabase.from('profiles').select('username').eq('username', username).single()
    if (existing) throw new Error('El nombre de usuario ya está en uso')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    if (data.user) {
      await supabase.from('profiles').upsert({ id: data.user.id, username })
    }
    return data
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, isConfigured }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
