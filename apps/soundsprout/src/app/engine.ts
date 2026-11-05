// Loads the pronunciation dictionary once (cached offline by the service worker).
import { useEffect, useState } from 'react'
import { Decoder } from '../engine/decode'
import { Lexicon } from '../engine/lexicon'
import { DOLCH, VOCAB, WORD_BANK } from '../data/words'
import { MORPHEMES } from '../engine/morphology'
import { BOOKS } from '../data/library'
import { bookText } from '../data/books'

let decoder: Decoder | null = null
let loading: Promise<Decoder> | null = null

/** Words common enough to count as stems and compound parts. */
export const COMMON = new Set<string>([
  ...Object.values(DOLCH).flat().map((w) => w.toLowerCase()),
  ...WORD_BANK.map((w) => w.word),
  ...VOCAB.map((w) => w.word),
  ...MORPHEMES.flatMap((m) => m.examples),
  ...BOOKS.flatMap((b) => (bookText(b).toLowerCase().match(/[a-z]+/g) ?? [])),
])

export async function loadDecoder(): Promise<Decoder> {
  if (decoder) return decoder
  loading ??= (async () => {
    const [cmu, extra] = await Promise.all([
      fetch('./dict/cmudict.dict').then((r) => r.text()),
      fetch('./dict/extra.dict').then((r) => (r.ok ? r.text() : '')),
    ])
    decoder = new Decoder(new Lexicon(cmu, extra))
    return decoder
  })()
  return loading
}

export function useDecoder(): Decoder | null {
  const [d, setD] = useState<Decoder | null>(decoder)
  useEffect(() => {
    if (!d) loadDecoder().then(setD)
  }, [d])
  return d
}

/** Add a family word's pronunciation (from the add-a-word flow) to the live lexicon. */
export function addPronunciation(word: string, phones: string[]) {
  decoder?.lexicon.add(word, phones)
}
