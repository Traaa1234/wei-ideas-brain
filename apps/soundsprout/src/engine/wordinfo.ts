// One call that gathers everything the word card shows: tiles, syllables, parts.
import type { Inventory } from './curriculum'
import type { Decoded, Decoder } from './decode'
import { splitParts, type Part } from './morphology'
import { syllabify, type Syllable } from './syllables'

export interface WordInfo {
  decoded: Decoded
  syllables: Syllable[]
  parts: Part[]
}

export function wordInfo(decoder: Decoder, word: string, inv: Inventory | null, opts: { names?: Set<string>; common?: Set<string> } = {}): WordInfo {
  const decoded = decoder.decode(word, inv, { names: opts.names })
  const lex = decoder.lexicon
  const parts = decoded.status === 'name' ? [{ text: decoded.word, kind: 'base' as const }] : splitParts(decoded.word, lex, opts.common)
  // positions where word parts meet, so syllables follow them (trans|port)
  const cuts: number[] = []
  let pos = 0
  for (const p of parts.slice(0, -1)) {
    pos += p.text.length
    cuts.push(pos)
  }
  const syllables = syllabify(decoded.word, decoded.tiles, (w) => lex.has(w) && (!opts.common || opts.common.has(w)), cuts)
  return { decoded, syllables, parts }
}
