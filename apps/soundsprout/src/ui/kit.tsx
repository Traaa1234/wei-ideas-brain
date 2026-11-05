import type { ReactNode } from 'react'
import { go } from '../app/router'

export function Header({ title, back = '', right }: { title: ReactNode; back?: string | null; right?: ReactNode }) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3" style={{ background: 'var(--bg)' }}>
      {back !== null && (
        <button className="btn-ghost !px-4" aria-label="Back" onClick={() => go(back)}>
          ←
        </button>
      )}
      <h1 className="flex-1 truncate text-xl font-extrabold">{title}</h1>
      {right}
    </header>
  )
}

export function Screen({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return <main className={`mx-auto w-full px-4 pb-24 ${wide ? 'max-w-5xl' : 'max-w-3xl'}`}>{children}</main>
}

export function Card({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  const C = onClick ? 'button' : 'div'
  return (
    <C onClick={onClick} className={`panel rounded-3xl p-4 text-left ${onClick ? 'transition active:scale-[0.98]' : ''} ${className}`}>
      {children}
    </C>
  )
}

export function Pill({ children }: { children: ReactNode }) {
  return <span className="chip">{children}</span>
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="muted py-8 text-center">{children}</p>
}
