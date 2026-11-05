// Syllable division on top of the decoder's tiles, following the patterns taught:
// compound, VC/CV (rab|bit), V/CV (ti|ger), VC/V (cam|el), VCCV, VCCCV (hun|dred),
// consonant-le (ta|ble), and suffix syllables (sta|tion, na|ture).

import type { Tile } from './decode'
import { VOWEL_PHONES } from './graphemes'

export type SyllableType =
  | 'closed' | 'open' | 'silent-e' | 'vowel team' | 'r-controlled' | 'consonant-le' | 'schwa' | 'suffix'

export interface Syllable {
  text: string
  start: number
  tiles: number[]          // indexes into the word's tiles
  type: SyllableType
  stressed: boolean
}

const BLENDS = new Set(['bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'sc', 'sk', 'sl', 'sm', 'sn', 'sp', 'st', 'sw', 'tr', 'tw', 'thr', 'shr', 'str', 'spr', 'scr', 'spl', 'squ', 'qu', 'wh', 'ph'])
const SUFFIX_SYLLABLES = new Set(['tion', 'sion', 'cian', 'ture', 'ous', 'ed (wanted)'])
const DOUBLES = new Set(['bb', 'dd', 'gg', 'mm', 'nn', 'pp', 'rr', 'tt', 'll', 'ss', 'ff', 'zz'])

const isNucleus = (t: Tile) => t.phones.some((p) => VOWEL_PHONES.has(p))

export function syllabify(word: string, tiles: Tile[], isWord?: (w: string) => boolean, morphCuts: number[] = []): Syllable[] {
  const nuclei = tiles.map((t, i) => (isNucleus(t) ? i : -1)).filter((i) => i >= 0)
  if (nuclei.length <= 1) return [makeSyllable(word, tiles, 0, word.length, tiles.map((_, i) => i))]

  // letter positions where a new syllable starts
  const cuts: number[] = []
  for (let s = 0; s < nuclei.length - 1; s++) {
    const a = nuclei[s]
    const b = nuclei[s + 1]
    // consonant tiles between the two vowels (a split digraph's silent e stays on the left)
    const between: number[] = []
    for (let k = a + 1; k < b; k++) if (tiles[k].type !== 'silent' && tiles[k].type !== 'mark') between.push(k)
    const tb = tiles[b]
    let cutTile: number // tile index the new syllable starts at
    let cutLetter: number | null = null

    // compound word: both halves are words
    const compound = isWord && findCompound(word, tiles, a, b, isWord)
    if (compound !== null) {
      cuts.push(compound)
      continue
    }
    // a prefix/root boundary between the vowels wins (trans|port, not tran|sport)
    const morph = morphCuts.find((pos) => pos > tiles[a].start && pos <= tiles[b].start && tiles.some((t, k) => k > a && k <= b && t.start === pos))
    if (morph !== undefined && between.length >= 1 && !between.some((k) => DOUBLES.has(tiles[k].graphemeId ?? ''))) {
      cuts.push(morph)
      continue
    }
    if (tb.graphemeId === 'le (table)') {
      cutTile = between.length ? between[between.length - 1] : b
    } else if (tb.graphemeId && SUFFIX_SYLLABLES.has(tb.graphemeId) && !tb.text.match(/^[aeiou]/)) {
      cutTile = b
    } else if (between.length === 0) {
      cutTile = b
    } else if (between.length === 1) {
      const c = tiles[between[0]]
      const first = tiles[a]
      if (c.graphemeId && DOUBLES.has(c.graphemeId)) {
        cutTile = between[0]
        cutLetter = c.start + 1 // rab|bit: split the double
      } else if (first.type === 'long' && first.text.length === 1) {
        cutTile = between[0] // open syllable: ti|ger
      } else if (first.schwa || first.type === 'long' || first.type === 'diphthong' || first.type === 'r') {
        cutTile = between[0]
      } else if (first.type === 'short' || first.type === 'split') {
        cutTile = b // closed syllable: cam|el
      } else {
        cutTile = between[0]
      }
    } else if (between.length === 2) {
      cutTile = between[1]
    } else {
      const lastTwo = tiles[between[between.length - 2]].text + tiles[between[between.length - 1]].text
      cutTile = BLENDS.has(lastTwo.toLowerCase()) ? between[between.length - 2] : between[between.length - 1]
    }
    cuts.push(cutLetter ?? tiles[cutTile].start)
  }

  const bounds = [0, ...cuts, word.length]
  const out: Syllable[] = []
  for (let s = 0; s < bounds.length - 1; s++) {
    const [from, to] = [bounds[s], bounds[s + 1]]
    const idx = tiles.map((t, i) => i).filter((i) => {
      const t = tiles[i]
      const end = t.start + t.text.length
      return t.start < to && end > from
    })
    out.push(makeSyllable(word, tiles, from, to, idx))
  }
  return out
}

function findCompound(word: string, tiles: Tile[], a: number, b: number, isWord: (w: string) => boolean): number | null {
  for (let k = a + 1; k <= b; k++) {
    const pos = tiles[k].start
    const left = word.slice(0, pos).toLowerCase()
    const right = word.slice(pos).toLowerCase()
    if (left.length >= 3 && right.length >= 3 && isWord(left) && isWord(right)) return pos
  }
  return null
}

function makeSyllable(word: string, tiles: Tile[], from: number, to: number, idx: number[]): Syllable {
  const ts = idx.map((i) => tiles[i])
  const nucleus = ts.find(isNucleus)
  let type: SyllableType = 'closed'
  if (!nucleus) type = 'closed'
  else if (ts.some((t) => t.graphemeId === 'le (table)')) type = 'consonant-le'
  else if (ts.some((t) => t.graphemeId && SUFFIX_SYLLABLES.has(t.graphemeId))) type = 'suffix'
  else if (nucleus.schwa) type = 'schwa'
  else if (nucleus.type === 'split') type = 'silent-e'
  else if (nucleus.type === 'r') type = 'r-controlled'
  else if (nucleus.text.length >= 2 && (nucleus.type === 'long' || nucleus.type === 'diphthong' || nucleus.type === 'short')) type = 'vowel team'
  else if (ts[ts.length - 1] === nucleus) type = 'open'
  return { text: word.slice(from, to), start: from, tiles: idx, type, stressed: (nucleus?.stress ?? 0) === 1 }
}

export const SYLLABLE_TYPE_HELP: Record<SyllableType, string> = {
  closed: 'Closed: the vowel is shut in by a consonant, so it is short (cat, rab).',
  open: 'Open: the syllable ends with the vowel, so it says its name (ti, ba).',
  'silent-e': 'Silent e: the e at the end makes the vowel say its name (cake).',
  'vowel team': 'Vowel team: two letters work together for one vowel sound (rain, boat).',
  'r-controlled': 'Bossy r: the r changes the vowel sound (car, her).',
  'consonant-le': 'Consonant + le: the last syllable says "ul" (ta-ble).',
  schwa: 'Schwa: a lazy vowel in a quiet syllable says "uh" (a-bout, wag-on).',
  suffix: 'Suffix syllable: a word ending with its own sound (sta-tion, na-ture).',
}
