// Sound tiles: dot under single letters, bar under letter teams, an arc joining split digraphs.
import { useLayoutEffect, useRef, useState } from 'react'
import type { Tile } from '../engine/decode'

export function tileClass(t: Tile) {
  return [
    'tile',
    `t-${t.type}`,
    t.isNew && !t.irregular ? 'is-new' : '',
    t.schwa ? 'schwa' : '',
  ].join(' ')
}

export function Tiles({ tiles, lit, onTap, size = 2.4 }: { tiles: Tile[]; lit?: Set<number>; onTap?: (i: number) => void; size?: number }) {
  const box = useRef<HTMLDivElement>(null)
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const [arcs, setArcs] = useState<{ x1: number; x2: number; y: number }[]>([])

  useLayoutEffect(() => {
    const host = box.current
    if (!host) return
    const measure = () => {
      const base = host.getBoundingClientRect()
      const out: { x1: number; x2: number; y: number }[] = []
      tiles.forEach((t, i) => {
        if (t.type !== 'split' || t.partner === undefined) return
        const a = refs.current[i]?.getBoundingClientRect()
        const b = refs.current[t.partner]?.getBoundingClientRect()
        if (a && b) out.push({ x1: a.left + a.width / 2 - base.left, x2: b.left + b.width / 2 - base.left, y: a.bottom - base.top })
      })
      setArcs(out)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(host)
    return () => ro.disconnect()
  }, [tiles])

  return (
    <div ref={box} className="read relative flex flex-wrap items-end justify-center gap-2 pb-6" style={{ fontSize: `${size}rem` }}>
      {tiles.map((t, i) => (
        <button
          key={i}
          ref={(el) => (refs.current[i] = el)}
          className={`${tileClass(t)} ${lit?.has(i) ? 'lit' : ''}`}
          onClick={() => onTap?.(i)}
          aria-label={t.irregular ? `${t.text}, heart part` : `${t.text}`}
        >
          <span>{t.text}</span>
          {t.irregular && <span className="absolute -right-2 -top-3 text-base" aria-hidden>♥</span>}
          {t.type !== 'split' && t.type !== 'silent' && t.type !== 'mark' && (
            <span className={`mark ${t.text.length > 1 ? 'bar' : 'dot'}`} />
          )}
        </button>
      ))}
      <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        {arcs.map((a, i) => (
          <path key={i} d={`M ${a.x1} ${a.y + 2} Q ${(a.x1 + a.x2) / 2} ${a.y + 26} ${a.x2} ${a.y + 2}`} fill="none" stroke="var(--t-long)" strokeWidth="4" strokeLinecap="round" />
        ))}
      </svg>
    </div>
  )
}
