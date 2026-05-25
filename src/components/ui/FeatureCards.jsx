import React from 'react'

const FEATURES = [
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{width:24,height:24}}><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>,
    title: 'Estantería 3D Interactiva',
    desc: 'Los libros en 3D se pueden mover, tomar y organizar a tu manera.',
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{width:24,height:24}}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>,
    title: 'Valora tus libros',
    desc: 'Califica tus lecturas y lleva un registro de tus favoritas.',
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{width:24,height:24}}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>,
    title: 'Comenta y comparte',
    desc: 'Deja comentarios, opiniones y recomienda libros a tus amigos.',
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{width:24,height:24}}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>,
    title: 'Conecta con amigos',
    desc: 'Sigue a tus amigos, descubre sus lecturas y comparte recomendaciones.',
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{width:24,height:24}}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>,
    title: 'Explora y descubre',
    desc: 'Encuentra nuevos libros basados en tus gustos y los de tu comunidad.',
  },
]

export default function FeatureCards({ visible }) {
  if (!visible) return null
  return (
    <div
      className="fixed right-6 top-1/2 z-30 flex flex-col gap-3"
      style={{ transform: 'translateY(-50%)', pointerEvents: 'none' }}
    >
      {FEATURES.map((f) => (
        <div
          key={f.title}
          className="flex items-start gap-3"
          style={{ maxWidth: '240px' }}
        >
          <div
            className="flex-shrink-0 flex items-center justify-center rounded-xl"
            style={{ width: 44, height: 44, background: 'rgba(20,12,4,0.80)', backdropFilter: 'blur(12px)', border: '1px solid rgba(200,150,40,0.25)', color: '#c8941a' }}
          >
            {f.icon}
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight" style={{ color: '#f0d898' }}>{f.title}</p>
            <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#a08050' }}>{f.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
