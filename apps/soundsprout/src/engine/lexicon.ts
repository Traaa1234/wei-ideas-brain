// Pronunciation dictionary: CMU-style lines "word PH1 PH2 ..." with "word(2)" for variants.
// Words not in the dictionary are built from a stem (jumped = jump + T, running = run + IH NG).

export type Pron = string[] // phones with stress digits, e.g. ['K','EY1','K']

export class Lexicon {
  private map = new Map<string, Pron[]>()

  constructor(...texts: string[]) {
    for (const t of texts) this.addText(t)
  }

  addText(text: string) {
    for (const raw of text.split('\n')) {
      const line = raw.trim()
      if (!line || line.startsWith(';;;') || line.startsWith('#')) continue
      const [head, ...phones] = line.split(/\s+/)
      const word = head.replace(/\(\d+\)$/, '').toLowerCase()
      this.add(word, phones)
    }
  }

  add(word: string, phones: Pron) {
    const w = word.toLowerCase()
    const list = this.map.get(w) ?? []
    if (!list.some((p) => p.join(' ') === phones.join(' '))) list.push(phones)
    this.map.set(w, list)
  }

  has(word: string): boolean {
    return this.map.has(word.toLowerCase())
  }

  get size() {
    return this.map.size
  }

  words(): IterableIterator<string> {
    return this.map.keys()
  }

  /** Pronunciations for a word, from the dictionary or built from its stem. */
  lookup(word: string): Pron[] {
    const w = word.toLowerCase()
    const direct = this.map.get(w)
    if (direct) return direct
    return this.fromStem(w)
  }

  private fromStem(w: string): Pron[] {
    const out: Pron[] = []
    const tryStem = (stem: string, add: (p: Pron) => Pron | null) => {
      for (const p of this.map.get(stem) ?? []) {
        const r = add(p)
        if (r) out.push(r)
      }
    }
    const last = (p: Pron) => p[p.length - 1].replace(/\d/g, '')
    const voiceless = new Set(['P', 'T', 'K', 'F', 'TH', 'S', 'SH', 'CH'])
    const sibilant = new Set(['S', 'Z', 'SH', 'ZH', 'CH', 'JH'])
    if (w.endsWith('s')) {
      tryStem(w.slice(0, -1), (p) => (sibilant.has(last(p)) ? null : [...p, voiceless.has(last(p)) ? 'S' : 'Z']))
      if (w.endsWith('es')) tryStem(w.slice(0, -2), (p) => (sibilant.has(last(p)) ? [...p, 'IH0', 'Z'] : null))
    }
    if (w.endsWith('ed')) {
      const ed = (p: Pron): Pron => {
        const l = last(p)
        if (l === 'T' || l === 'D') return [...p, 'IH0', 'D']
        return [...p, voiceless.has(l) ? 'T' : 'D']
      }
      tryStem(w.slice(0, -2), ed)
      tryStem(w.slice(0, -1), ed) // liked = like + d
      if (w.length > 4 && w[w.length - 3] === w[w.length - 4]) tryStem(w.slice(0, -3), ed) // hopped
    }
    if (w.endsWith('ing')) {
      const ing = (p: Pron): Pron => [...p, 'IH0', 'NG']
      tryStem(w.slice(0, -3), ing)
      tryStem(w.slice(0, -3) + 'e', ing) // making
      if (w.length > 5 && w[w.length - 4] === w[w.length - 5]) tryStem(w.slice(0, -4), ing) // running
    }
    for (const [suf, phones] of [
      ['er', ['ER0']], ['est', ['AH0', 'S', 'T']], ['ly', ['L', 'IY0']], ['ful', ['F', 'AH0', 'L']],
      ['less', ['L', 'AH0', 'S']], ['ness', ['N', 'AH0', 'S']], ['y', ['IY0']],
    ] as [string, string[]][]) {
      if (w.endsWith(suf) && w.length > suf.length + 2) {
        tryStem(w.slice(0, -suf.length), (p) => [...p, ...phones])
      }
    }
    return out
  }
}

export const stripStress = (ph: string) => ph.replace(/\d/g, '')
export const stressOf = (ph: string) => {
  const m = ph.match(/\d/)
  return m ? Number(m[0]) : -1
}
