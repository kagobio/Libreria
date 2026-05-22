import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export default function Navbar() {
  const { profile, user, signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)

  const displayName = profile?.username || user?.email?.split('@')[0] || 'Lector'

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
    } catch (err) {
      console.error('Error signing out:', err)
      setSigningOut(false)
    }
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6"
      style={{
        height: '60px',
        background: 'rgba(26, 15, 10, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(139, 105, 20, 0.3)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.4)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">📚</span>
        <span className="text-amber-400 font-serif text-xl font-semibold tracking-wide">
          Librería 3D
        </span>
      </div>

      {/* User info & logout */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-dark-400"
            style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}
          >
            {displayName[0]?.toUpperCase() || '?'}
          </div>
          <span className="text-amber-300 text-sm hidden sm:block font-medium">
            {displayName}
          </span>
        </div>

        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="text-amber-600 hover:text-amber-400 text-sm transition-colors border border-amber-800 hover:border-amber-600 px-3 py-1.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {signingOut ? 'Saliendo...' : 'Cerrar sesión'}
        </button>
      </div>
    </nav>
  )
}
