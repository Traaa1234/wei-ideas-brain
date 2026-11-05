// Part-of-speech tagging with compromise (runs offline in the browser), loaded on demand.
import type { Pos } from '../data/words'
import { BANK_BY_WORD, VOCAB_BY_WORD } from '../data/words'

type Nlp = typeof import('compromise').default
let nlpP: Promise<Nlp> | null = null
export const loadNlp = () => (nlpP ??= import('compromise').then((m) => m.default))

const TAG_ORDER: [string, Pos][] = [
  ['Pronoun', 'pronoun'], ['Preposition', 'preposition'], ['Conjunction', 'conjunction'], ['Determiner', 'little'],
  ['Adverb', 'adverb'], ['Adjective', 'adjective'], ['Verb', 'verb'], ['Noun', 'noun'],
]

export function posFromTags(tags: string[]): Pos | undefined {
  for (const [t, p] of TAG_ORDER) if (tags.includes(t)) return p
  return undefined
}

/** Tag each word of a sentence in context (run is a noun or a verb). */
export async function tagText(text: string): Promise<Pos[]> {
  const nlp = await loadNlp()
  const json = nlp(text).json({ terms: { tags: true } }) as { terms: { tags: string[] }[] }[]
  return json.flatMap((s) => s.terms.map((t) => posFromTags(t.tags) ?? 'little'))
}

/** Best guess for a single word: curated lists first, then the tagger. */
export async function posOfWord(word: string): Promise<Pos | undefined> {
  const w = word.toLowerCase()
  const known = BANK_BY_WORD.get(w)?.pos ?? VOCAB_BY_WORD.get(w)?.pos
  if (known) return known
  const nlp = await loadNlp()
  const json = nlp(w).json({ terms: { tags: true } }) as { terms: { tags: string[] }[] }[]
  return posFromTags(json[0]?.terms[0]?.tags ?? [])
}

/** Related forms: jump → jumps, jumped, jumping; cat → cats; big → bigger, biggest. */
export async function relatedForms(word: string, pos?: Pos): Promise<string[]> {
  const nlp = await loadNlp()
  const w = word.toLowerCase()
  try {
    if (pos === 'verb') {
      const c = (nlp(w).verbs().conjugate() as Record<string, string>[])[0] ?? {}
      return [...new Set([c.Infinitive, c.PresentTense, c.PastTense, c.Gerund].filter(Boolean))].filter((x) => x !== w)
    }
    if (pos === 'noun') {
      const pl = nlp(w).nouns().toPlural().text()
      return pl && pl !== w ? [pl] : []
    }
    if (pos === 'adjective') {
      const doc = nlp(w).adjectives()
      const out = [doc.toComparative().text(), nlp(w).adjectives().toSuperlative().text()].filter((x) => x && x !== w)
      return [...new Set(out)]
    }
  } catch {
    /* the tagger can't inflect this one */
  }
  return []
}
