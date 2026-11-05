// The decoder: aligns a word's pronunciation with its spelling, grapheme by grapheme,
// and decides whether a child with a given inventory can sound it out.

import { GRAPHEMES_BY_FIRST, GRAPHEME_BY_ID, SPLIT_GRAPHEMES, VOWEL_PHONES, type Grapheme, type SoundType } from './graphemes'
import type { Inventory } from './curriculum'
import { Lexicon, stressOf, stripStress, type Pron } from './lexicon'

export type TileType = SoundType | 'silent' | 'irregular' | 'mark'

export interface Tile {
  text: string            // letters shown on the tile
  start: number           // index of first letter in the word
  graphemeId: string | null
  phones: string[]        // without stress
  type: TileType
  stress: number          // 1 primary, 2 secondary, 0 unstressed, -1 no vowel
  schwa?: boolean
  isNew?: boolean         // grapheme (or skill) not yet taught to this child
  newSkill?: string       // the skill missing for this tile, e.g. 'schwa'
  irregular?: boolean     // part of the word phonics can't explain (the "heart" part)
  partner?: number        // split digraph: index of the linked tile
}

export type Status = 'decodable' | 'heart' | 'name' | 'new' | 'unknown'

export interface Decoded {
  word: string
  tiles: Tile[]
  pron: Pron | null
  status: Status
  needs: string[]          // grapheme ids / skills / 'heart:<word>' the child still needs
  syllables: number
}

export interface DecodeOptions {
  names?: Set<string>      // lowercase character names known in this book
}

const VOWEL_LETTERS = new Set(['a', 'e', 'i', 'o', 'u'])
const SPLIT_TAILS = new Set(['', 's', 'd', 'r', 'st', 'ly', 'ful', 'less', 'ness', 'ment'])
const END_PLUS_S = new Set(['le (table)', 'y (happy)', 've', 'ce', 'ge', 'se', 'al (final)', 'ture', 'tion', 'sion', 'cian', 'mb', 'nk', 'ng', 'ck', 'ff', 'll', 'ss', 'zz', 'tch', 'dge'])
const CONSONANT_CHUNKS = new Set(['th', 'ch', 'sh', 'ng', 'ck'])
const COST_TILE = 1
const COST_NEW = 100
const COST_IRREGULAR = 1000
const INF = Number.POSITIVE_INFINITY

interface Best {
  cost: number
  tiles: Tile[]
}

function alignOne(word: string, pron: Pron, inv: Inventory | null, allowIrregular: boolean): Best {
  const letters = word.toLowerCase()
  const n = letters.length
  const phones = pron.map(stripStress)
  const stresses = pron.map(stressOf)
  const m = phones.length
  const vowelCount = phones.filter((p) => VOWEL_PHONES.has(p)).length
  const known = (id: string) => !inv || inv.graphemes.has(id)
  const hasSkill = (id: string) => !inv || inv.skills.has(id)
  const memo = new Map<string, Best>()

  const vowelStress = (j: number, len: number) => {
    let s = -1
    for (let k = j; k < j + len; k++) if (VOWEL_PHONES.has(phones[k])) s = Math.max(s, stresses[k])
    return s
  }
  const matches = (j: number, sound: string[]) => {
    if (j + sound.length > m) return false
    for (let k = 0; k < sound.length; k++) if (phones[j + k] !== sound[k]) return false
    return true
  }
  const endOk = (gr: Grapheme, i: number) => {
    const rest = letters.slice(i + gr.letters.length)
    if (rest === '') return true
    return rest === 's' && END_PLUS_S.has(gr.id)
  }

  const solve = (i: number, j: number, pend: number): Best => {
    if (i === n) return j === m && pend === -1 ? { cost: 0, tiles: [] } : { cost: INF, tiles: [] }
    const key = `${i},${j},${pend}`
    const hit = memo.get(key)
    if (hit) return hit
    let best: Best = { cost: INF, tiles: [] }
    const consider = (tile: Tile, cost: number, ni: number, nj: number, np: number) => {
      if (cost >= best.cost) return
      const rest = solve(ni, nj, np)
      if (rest.cost === INF) return
      const total = cost + rest.cost
      if (total < best.cost) best = { cost: total, tiles: [tile, ...rest.tiles] }
    }
    const ch = letters[i]

    // the silent e of a split digraph
    if (pend === i) {
      if (ch === 'e') {
        consider({ text: 'e', start: i, graphemeId: null, phones: [], type: 'silent', stress: -1 }, 0, i + 1, j, -1)
      }
      memo.set(key, best)
      return best
    }

    if (ch === "'") {
      consider({ text: "'", start: i, graphemeId: null, phones: [], type: 'mark', stress: -1 }, 0, i + 1, j, pend)
    }

    for (const gr of GRAPHEMES_BY_FIRST.get(ch) ?? []) {
      const len = gr.letters.length
      if (!letters.startsWith(gr.letters, i)) continue
      if (pend !== -1 && pend >= i && pend < i + len) continue
      if (gr.at === 'start' && i !== 0) continue
      if (gr.at === 'end' && !endOk(gr, i)) continue
      if (gr.beforeEIY && !'eiy'.includes(letters[i + len] ?? '')) continue
      const extra = known(gr.id) ? 0 : COST_NEW
      // alternative spellings (ids like "i (open)") cost a little more, so core spellings win ties
      const alt = gr.id.includes('(') && gr.type !== 'ending' ? 0.5 : 0
      for (const sound of gr.sounds) {
        if (!matches(j, sound)) continue
        consider(
          { text: gr.letters, start: i, graphemeId: gr.id, phones: sound, type: gr.type, stress: vowelStress(j, sound.length), isNew: extra > 0 },
          COST_TILE + extra + alt, i + len, j + sound.length, pend,
        )
      }
      // schwa: a single vowel letter in an unstressed syllable of a longer word
      if (len === 1 && VOWEL_LETTERS.has(ch) && vowelCount >= 2 && j < m && (phones[j] === 'AH' || phones[j] === 'IH') && stresses[j] === 0 && gr.id === ch) {
        const needSkill = hasSkill('schwa') ? 0 : COST_NEW
        consider(
          { text: ch, start: i, graphemeId: gr.id, phones: [phones[j]], type: 'short', stress: 0, schwa: true, isNew: extra + needSkill > 0, newSkill: needSkill ? 'schwa' : undefined },
          COST_TILE + extra + needSkill, i + 1, j + 1, pend,
        )
      }
    }

    // split digraphs: vowel + one consonant (or a consonant digraph) + silent e
    if (VOWEL_LETTERS.has(ch) && pend === -1) {
      for (const clen of [1, 2]) {
        const chunk = letters.slice(i + 1, i + 1 + clen)
        const k = i + 1 + clen
        if (chunk.length !== clen || letters[k] !== 'e') continue
        if (clen === 1 && (VOWEL_LETTERS.has(chunk) || 'wxy'.includes(chunk))) continue
        if (clen === 2 && !CONSONANT_CHUNKS.has(chunk)) continue
        if (!SPLIT_TAILS.has(letters.slice(k + 1))) continue
        const gr = SPLIT_GRAPHEMES.find((x) => x.letters[0] === ch)
        if (!gr) continue
        const extra = known(gr.id) ? 0 : COST_NEW
        for (const sound of gr.sounds) {
          if (!matches(j, sound)) continue
          consider(
            { text: ch, start: i, graphemeId: gr.id, phones: sound, type: 'split', stress: vowelStress(j, sound.length), isNew: extra > 0 },
            COST_TILE + extra, i + 1, j + sound.length, k,
          )
        }
      }
    }

    // the heart part: letters phonics can't explain
    if (allowIrregular) {
      for (let a = 1; a <= 3 && i + a <= n; a++) {
        if (pend !== -1 && pend >= i && pend < i + a) continue
        for (let b = 0; b <= 3 && j + b <= m; b++) {
          if (a === 0 && b === 0) continue
          const ph = phones.slice(j, j + b)
          consider(
            { text: letters.slice(i, i + a), start: i, graphemeId: null, phones: ph, type: 'irregular', stress: vowelStress(j, b), irregular: true },
            COST_IRREGULAR + 10 * a, i + a, j + b, pend,
          )
        }
      }
    }

    memo.set(key, best)
    return best
  }

  const result = solve(0, 0, -1)
  // link split digraph partners
  const tiles = result.tiles
  tiles.forEach((t, idx) => {
    if (t.type === 'split') {
      const e = tiles.findIndex((x, k) => k > idx && x.type === 'silent' && x.partner === undefined)
      if (e >= 0) {
        t.partner = e
        tiles[e].partner = idx
        tiles[e].graphemeId = t.graphemeId
        tiles[e].isNew = t.isNew
      }
    }
  })
  return { cost: result.cost, tiles }
}

/** Restore the word's original capitalisation on the tiles. */
function caseTiles(word: string, tiles: Tile[]) {
  for (const t of tiles) t.text = word.slice(t.start, t.start + t.text.length)
}

export class Decoder {
  constructor(public lexicon: Lexicon) {}

  /** Align a word with no inventory constraint: how it is spelled, sound by sound. */
  explain(word: string): Decoded {
    return this.decode(word, null)
  }

  decode(word: string, inv: Inventory | null, opts: DecodeOptions = {}): Decoded {
    const clean = word.replace(/[^A-Za-z']/g, '')
    const low = clean.toLowerCase()
    const prons = this.lexicon.lookup(low)
    const isName = opts.names?.has(low) ?? false
    if (!prons.length) {
      return {
        word: clean, tiles: [{ text: clean, start: 0, graphemeId: null, phones: [], type: 'irregular', stress: -1, irregular: true }],
        pron: null, status: isName ? 'name' : inv?.heart.has(low) ? 'heart' : 'unknown', needs: [], syllables: 0,
      }
    }

    let best: Best & { pron: Pron | null } = { cost: INF, tiles: [], pron: null }
    for (const allowIrregular of [false, true]) {
      for (const p of prons) {
        const syl = p.filter((x) => VOWEL_PHONES.has(stripStress(x))).length
        let r = alignOne(low, p, inv, allowIrregular)
        if (r.cost === INF) continue
        let cost = r.cost
        if (inv && syl >= 2 && !inv.skills.has('syl2')) cost += COST_NEW
        if (inv && syl >= 3 && !inv.skills.has('syl3')) cost += COST_NEW
        if (cost < best.cost) best = { ...r, cost, pron: p }
      }
      if (best.cost < INF) break
    }

    const tiles = best.tiles
    caseTiles(clean, tiles)
    const syllables = best.pron ? best.pron.filter((x) => VOWEL_PHONES.has(stripStress(x))).length : 0
    const needs = new Set<string>()
    for (const t of tiles) {
      if (t.isNew && t.graphemeId && !(inv?.graphemes.has(t.graphemeId))) needs.add(t.graphemeId)
      if (t.newSkill) needs.add(t.newSkill)
    }
    if (inv && syllables >= 2 && !inv.skills.has('syl2')) needs.add('syl2')
    if (inv && syllables >= 3 && !inv.skills.has('syl3')) needs.add('syl3')
    const irregular = tiles.some((t) => t.irregular)

    let status: Status
    if (isName) status = 'name'
    else if (!inv) status = irregular ? 'heart' : 'decodable'
    else if (!irregular && needs.size === 0) status = 'decodable'
    else if (inv.heart.has(low)) status = 'heart'
    else {
      status = 'new'
      if (irregular) needs.add(`heart:${low}`)
    }
    // A heart word shows its tricky part: tiles that are new or irregular for this child.
    if (status === 'heart') for (const t of tiles) if (t.isNew) t.irregular = true
    return { word: clean, tiles, pron: best.pron, status, needs: [...needs], syllables }
  }

  readable(d: Decoded) {
    return d.status === 'decodable' || d.status === 'heart' || d.status === 'name'
  }
}

/** Split text into word tokens and the spaces/punctuation between them. */
export function tokenize(text: string): { text: string; word: boolean }[] {
  const out: { text: string; word: boolean }[] = []
  const re = /[A-Za-z]+(?:'[A-Za-z]+)?/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ text: text.slice(last, m.index), word: false })
    out.push({ text: m[0], word: true })
    last = m.index + m[0].length
  }
  if (last < text.length) out.push({ text: text.slice(last), word: false })
  return out
}

export function graphemeLabel(id: string | null) {
  if (!id) return ''
  const gr = GRAPHEME_BY_ID.get(id)
  return gr ? `${gr.letters} as in ${gr.example}` : id
}
