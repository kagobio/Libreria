import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const { signIn, signUp, isConfigured } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setLoading(true)
    try {
      if (isRegister) {
        if (!username.trim()) { setError('El nombre de usuario es obligatorio'); setLoading(false); return }
        if (username.length < 3) { setError('El nombre de usuario debe tener al menos 3 caracteres'); setLoading(false); return }
        await signUp(email, password, username.trim())
        setSuccessMsg('Cuenta creada. Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.')
      } else {
        await signIn(email, password)
      }
    } catch (err) {
      const msg = err.message || 'Ha ocurrido un error'
      if (msg.includes('Invalid login credentials')) setError('Correo o contraseña incorrectos')
      else if (msg.includes('Email not confirmed')) setError('Debes confirmar tu correo antes de iniciar sesión')
      else if (msg.includes('User already registered')) setError('Ya existe una cuenta con este correo')
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all'
  const inputStyle = { background: '#121929', border: '1px solid rgba(99,102,241,0.2)' }

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#070b17' }}>
        <div className="max-w-md w-full rounded-2xl p-8 text-center" style={{ background: '#0d1221', border: '1px solid rgba(99,102,241,0.2)' }}>
          <div className="text-5xl mb-4">📖</div>
          <h1 className="text-3xl font-serif text-indigo-300 mb-6">ThirstyBooks</h1>
          <div className="rounded-xl p-4 text-left" style={{ background: '#121929', border: '1px solid rgba(99,102,241,0.2)' }}>
            <h2 className="text-indigo-400 font-semibold mb-2">Configuración necesaria</h2>
            <p className="text-slate-400 text-sm mb-3">Añade las variables de entorno de Supabase para continuar.</p>
            <pre className="rounded-lg p-3 text-indigo-300 text-xs overflow-x-auto" style={{ background: '#070b17' }}>
{`VITE_SUPABASE_URL=tu_url
VITE_SUPABASE_ANON_KEY=tu_clave`}
            </pre>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: '#070b17',
        backgroundImage: 'radial-gradient(ellipse at 30% 40%, rgba(99,102,241,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(79,70,229,0.06) 0%, transparent 60%)',
      }}
    >
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
            <span className="text-3xl">📖</span>
          </div>
          <h1 className="text-4xl font-serif font-bold mb-1" style={{ color: '#a5b4fc' }}>ThirstyBooks</h1>
          <p className="text-slate-500 text-sm">Tu estantería virtual con amigos</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 shadow-2xl" style={{ background: '#0d1221', border: '1px solid rgba(99,102,241,0.15)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
          {/* Tabs */}
          <div className="flex mb-6 rounded-xl p-1" style={{ background: '#070b17' }}>
            <button
              onClick={() => { setIsRegister(false); setError(''); setSuccessMsg('') }}
              className="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all"
              style={!isRegister ? { background: '#4f46e5', color: '#fff' } : { color: '#6366f1' }}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => { setIsRegister(true); setError(''); setSuccessMsg('') }}
              className="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all"
              style={isRegister ? { background: '#4f46e5', color: '#fff' } : { color: '#6366f1' }}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-slate-400 text-xs mb-1.5 uppercase tracking-wider">Nombre de usuario</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Ej: lector_curioso" required={isRegister} className={inputClass} style={inputStyle} />
              </div>
            )}
            <div>
              <label className="block text-slate-400 text-xs mb-1.5 uppercase tracking-wider">Correo electrónico</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" required className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1.5 uppercase tracking-wider">Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className={inputClass} style={inputStyle} />
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3 text-red-300 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                {error}
              </div>
            )}
            {successMsg && (
              <div className="rounded-xl px-4 py-3 text-emerald-300 text-sm" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-semibold py-3 px-6 rounded-xl transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: loading ? '#3730a3' : '#4f46e5', color: '#fff', boxShadow: '0 4px 20px rgba(79,70,229,0.4)' }}
            >
              {loading ? 'Cargando...' : isRegister ? 'Crear cuenta' : 'Entrar a la biblioteca'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          {isRegister ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}
          <button onClick={() => { setIsRegister(!isRegister); setError(''); setSuccessMsg('') }} className="text-indigo-500 hover:text-indigo-400 underline">
            {isRegister ? 'Inicia sesión' : 'Regístrate gratis'}
          </button>
        </p>
      </div>
    </div>
  )
}
