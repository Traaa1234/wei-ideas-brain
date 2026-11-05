// Per-child book levels and "teach next" ranking.
import { useMemo } from 'react'
import type { Book } from '../data/books'
import { bookText } from '../data/books'
import { BOOKS } from '../data/library'
import { STEPS } from '../engine/curriculum'
import type { Decoder } from '../engine/decode'
import { measureText } from '../engine/readability'
import { inventoryOf, type Profile } from './store'
import { COMMON } from './engine'

export type Fit = 'ready' | 'stretch' | 'listen'

export function bookFit(decoder: Decoder, book: Book, p: Profile) {
  const r = measureText(bookText(book), decoder, inventoryOf(p), { names: new Set(book.names.map((n) => n.toLowerCase())) })
  const fit: Fit = r.decodablePct >= 95 ? 'ready' : r.decodablePct >= 85 ? 'stretch' : 'listen'
  return { pct: r.decodablePct, fk: r.fkGrade, words: r.words, fit, newWords: r.newWords }
}

export function useBookFits(decoder: Decoder | null, p: Profile | null) {
  return useMemo(() => {
    if (!decoder || !p) return new Map<string, ReturnType<typeof bookFit>>()
    return new Map(BOOKS.map((b) => [b.id, bookFit(decoder, b, p)]))
  }, [decoder, p?.graphemes.join(), p?.heart.join(), p?.skills.join()]) // eslint-disable-line react-hooks/exhaustive-deps
}

/** Rank the next untaught steps' graphemes by how many new words they unlock. */
export function teachNext(decoder: Decoder, p: Profile, limit = 3) {
  const inv = inventoryOf(p)
  const pool = [...COMMON, ...p.myWords.map((m) => m.word)]
  const blocked = new Map<string, number>()
  for (const w of pool) {
    const d = decoder.decode(w, inv)
    if (decoder.readable(d)) continue
    const needs = d.needs.filter((n) => !n.startsWith('heart:'))
    if (needs.length === 1) blocked.set(needs[0], (blocked.get(needs[0]) ?? 0) + 1)
  }
  const upcoming = new Set(STEPS.flatMap((s) => [...s.graphemes, ...(s.skills ?? [])]).filter((g) => !inv.graphemes.has(g) && !inv.skills.has(g)))
  return [...blocked.entries()].filter(([g]) => upcoming.has(g)).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([item, unlocks]) => ({ item, unlocks }))
}
