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
        if (!username.trim()) {
          setError('El nombre de usuario es obligatorio')
          setLoading(false)
          return
        }
        if (username.length < 3) {
          setError('El nombre de usuario debe tener al menos 3 caracteres')
          setLoading(false)
          return
        }
        await signUp(email, password, username.trim())
        setSuccessMsg('Cuenta creada. Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.')
      } else {
        await signIn(email, password)
      }
    } catch (err) {
      const msg = err.message || 'Ha ocurrido un error'
      if (msg.includes('Invalid login credentials')) {
        setError('Correo o contraseña incorrectos')
      } else if (msg.includes('Email not confirmed')) {
        setError('Debes confirmar tu correo antes de iniciar sesión')
      } else if (msg.includes('User already registered')) {
        setError('Ya existe una cuenta con este correo')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-dark-400 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-dark-200 border border-amber-800 rounded-xl p-8 text-center shadow-2xl">
          <div className="text-5xl mb-4">📚</div>
          <h1 className="text-3xl font-serif text-amber-400 mb-2">Librería 3D</h1>
          <p className="text-amber-200 mb-6">Tu estantería virtual con amigos</p>
          <div className="bg-amber-900 bg-opacity-30 border border-amber-700 rounded-lg p-4 text-left">
            <h2 className="text-amber-400 font-semibold mb-2">Configuración necesaria</h2>
            <p className="text-amber-200 text-sm mb-3">
              Para usar la app, crea un archivo <code className="bg-dark-300 px-1 rounded text-amber-300">.env</code> en la raíz del proyecto con:
            </p>
            <pre className="bg-dark-300 rounded p-3 text-amber-300 text-xs overflow-x-auto">
{`VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima`}
            </pre>
            <p className="text-amber-200 text-sm mt-3">
              Consulta el archivo <code className="bg-dark-300 px-1 rounded text-amber-300">SETUP.md</code> para instrucciones detalladas.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-400 flex items-center justify-center p-4"
      style={{
        backgroundImage: `
          radial-gradient(ellipse at 20% 50%, rgba(139, 105, 20, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, rgba(92, 74, 30, 0.15) 0%, transparent 50%)
        `
      }}
    >
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">📚</div>
          <h1 className="text-4xl font-serif text-amber-400 mb-1">Librería 3D</h1>
          <p className="text-amber-600 text-sm italic">Tu estantería virtual con amigos</p>
        </div>

        <div className="bg-dark-200 border border-amber-900 rounded-2xl p-8 shadow-2xl"
          style={{ boxShadow: '0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(139,105,20,0.2)' }}
        >
          <div className="flex mb-6 bg-dark-300 rounded-lg p-1">
            <button
              onClick={() => { setIsRegister(false); setError(''); setSuccessMsg('') }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                !isRegister
                  ? 'bg-amber-700 text-amber-100 shadow'
                  : 'text-amber-500 hover:text-amber-300'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => { setIsRegister(true); setError(''); setSuccessMsg('') }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                isRegister
                  ? 'bg-amber-700 text-amber-100 shadow'
                  : 'text-amber-500 hover:text-amber-300'
              }`}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-amber-400 text-sm mb-1">Nombre de usuario</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ej: lector_curioso"
                  required={isRegister}
                  className="w-full bg-dark-300 border border-amber-900 rounded-lg px-4 py-3 text-amber-100 placeholder-amber-800 focus:outline-none focus:border-amber-600 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-amber-400 text-sm mb-1">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                className="w-full bg-dark-300 border border-amber-900 rounded-lg px-4 py-3 text-amber-100 placeholder-amber-800 focus:outline-none focus:border-amber-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-amber-400 text-sm mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-dark-300 border border-amber-900 rounded-lg px-4 py-3 text-amber-100 placeholder-amber-800 focus:outline-none focus:border-amber-600 transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-900 bg-opacity-40 border border-red-700 rounded-lg px-4 py-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="bg-green-900 bg-opacity-40 border border-green-700 rounded-lg px-4 py-3 text-green-300 text-sm">
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-700 hover:bg-amber-600 disabled:bg-amber-900 disabled:cursor-not-allowed text-amber-100 font-semibold py-3 px-6 rounded-lg transition-colors mt-2 shadow-lg"
            >
              {loading
                ? 'Cargando...'
                : isRegister
                  ? 'Crear cuenta'
                  : 'Entrar a la biblioteca'
              }
            </button>
          </form>
        </div>

        <p className="text-center text-amber-900 text-xs mt-6">
          {isRegister
            ? '¿Ya tienes cuenta? '
            : '¿No tienes cuenta? '
          }
          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); setSuccessMsg('') }}
            className="text-amber-600 hover:text-amber-400 underline"
          >
            {isRegister ? 'Inicia sesión' : 'Regístrate gratis'}
          </button>
        </p>
      </div>
    </div>
  )
}
