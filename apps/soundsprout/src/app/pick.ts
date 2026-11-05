// Picking practice material each child can decode.
import { PRACTICE_SENTENCES, PRACTICE_WORDS } from '../data/practice'
import { WORD_BANK } from '../data/words'
import type { Inventory } from '../engine/curriculum'
import type { Decoder } from '../engine/decode'
import { tokenize } from '../engine/decode'

export const shuffle = <T,>(xs: T[]) => {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
export const sample = <T,>(xs: T[], n: number) => shuffle(xs).slice(0, n)

const POOL = [...new Set([...PRACTICE_WORDS, ...WORD_BANK.map((w) => w.word)])]

export function decodableWords(decoder: Decoder, inv: Inventory, opts: { containing?: string[]; minSyllables?: number; maxSyllables?: number; heartOk?: boolean } = {}) {
  const out: string[] = []
  for (const w of POOL) {
    const d = decoder.decode(w, inv)
    if (d.status !== 'decodable' && !(opts.heartOk && d.status === 'heart')) continue
    if (opts.minSyllables && d.syllables < opts.minSyllables) continue
    if (opts.maxSyllables && d.syllables > opts.maxSyllables) continue
    if (opts.containing && !d.tiles.some((t) => t.graphemeId && opts.containing!.includes(t.graphemeId))) continue
    out.push(w)
  }
  return out
}

export function decodableSentences(decoder: Decoder, inv: Inventory, containing?: string[]) {
  return PRACTICE_SENTENCES.filter((s) => {
    const words = tokenize(s).filter((t) => t.word)
    const ds = words.map((t) => decoder.decode(t.text, inv, { names: new Set(['pip', 'sam', 'ben', 'jen', 'chip', 'chop']) }))
    if (!ds.every((d) => decoder.readable(d))) return false
    return !containing || ds.some((d) => d.tiles.some((t) => t.graphemeId && containing.includes(t.graphemeId)))
  })
}
