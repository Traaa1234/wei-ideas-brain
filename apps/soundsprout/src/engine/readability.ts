// Text measures for books and passages: decodability for a child, plus open
// readability formulas (Flesch-Kincaid grade) and the share of unfamiliar words.

import type { Inventory } from './curriculum'
import { Decoder, tokenize, type Decoded } from './decode'

export interface WordReport {
  word: string
  count: number
  decoded: Decoded
}

export interface TextReport {
  words: number
  sentences: number
  syllables: number
  decodablePct: number          // share of running words the child can read
  fkGrade: number               // Flesch-Kincaid grade level
  unfamiliarPct: number         // share of running words outside the familiar list and not readable
  unreadable: WordReport[]      // distinct words the child can't read yet, most frequent first
  newWords: string[]
}

export function countSyllablesFallback(word: string) {
  const w = word.toLowerCase().replace(/e$/, '')
  const groups = w.match(/[aeiouy]+/g)
  return Math.max(1, groups ? groups.length : 1)
}

export function measureText(
  text: string,
  decoder: Decoder,
  inv: Inventory,
  opts: { names?: Set<string>; familiar?: Set<string> } = {},
): TextReport {
  const tokens = tokenize(text).filter((t) => t.word)
  const sentences = Math.max(1, (text.match(/[.!?]+(\s|$)/g) ?? []).length)
  const cache = new Map<string, Decoded>()
  let readable = 0
  let syllables = 0
  let unfamiliar = 0
  const counts = new Map<string, number>()
  for (const t of tokens) {
    const low = t.text.toLowerCase()
    let d = cache.get(low)
    if (!d) {
      d = decoder.decode(t.text, inv, { names: opts.names })
      cache.set(low, d)
    }
    syllables += d.syllables || countSyllablesFallback(t.text)
    const ok = decoder.readable(d)
    if (ok) readable++
    else counts.set(low, (counts.get(low) ?? 0) + 1)
    if (!ok && opts.familiar && !opts.familiar.has(low)) unfamiliar++
  }
  const words = Math.max(1, tokens.length)
  const unreadable = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([word, count]) => ({ word, count, decoded: cache.get(word)! }))
  return {
    words: tokens.length,
    sentences,
    syllables,
    decodablePct: Math.round((readable / words) * 1000) / 10,
    fkGrade: Math.round((0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59) * 10) / 10,
    unfamiliarPct: Math.round((unfamiliar / words) * 1000) / 10,
    unreadable,
    newWords: unreadable.map((u) => u.word),
  }
}
