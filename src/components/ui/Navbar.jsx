import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export default function Navbar() {
  const { profile, user, signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)
  const displayName = profile?.username || user?.email?.split('@')[0] || 'Lector'

  const handleSignOut = async () => {
    setSigningOut(true)
    try { await signOut() } catch { setSigningOut(false) }
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6"
      style={{
        height: '60px',
        background: 'rgba(7,11,23,0.9)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(99,102,241,0.15)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.5)',
      }}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-xl">📖</span>
        <span className="font-serif text-lg font-bold" style={{ color: '#a5b4fc', letterSpacing: '0.02em' }}>
          ThirstyBooks
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4338ca)' }}
          >
            {displayName[0]?.toUpperCase() || '?'}
          </div>
          <span className="text-slate-300 text-sm hidden sm:block">{displayName}</span>
        </div>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="text-slate-500 hover:text-slate-300 text-sm transition-colors px-3 py-1.5 rounded-lg disabled:opacity-50"
          style={{ border: '1px solid rgba(99,102,241,0.2)' }}
        >
          {signingOut ? 'Saliendo...' : 'Salir'}
        </button>
      </div>
    </nav>
  )
}
