import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import ShelfPage from './pages/ShelfPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark-400">
        <div className="text-amber-400 text-xl font-serif animate-pulse">
          Cargando biblioteca...
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark-400">
        <div className="text-amber-400 text-xl font-serif animate-pulse">
          Cargando biblioteca...
        </div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/shelf" replace />
  }

  return children
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/shelf" replace />}
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/shelf"
        element={
          <ProtectedRoute>
            <ShelfPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
