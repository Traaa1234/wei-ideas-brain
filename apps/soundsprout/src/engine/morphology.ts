// Word parts: prefixes, suffixes and roots, with meanings, and a simple splitter
// that undoes the spelling rules (running = run + n + ing, making = make - e + ing).

export type MorphemeKind = 'prefix' | 'suffix' | 'root'

export interface Morpheme {
  form: string
  kind: MorphemeKind
  meaning: string
  origin: 'English' | 'Latin' | 'Greek'
  examples: string[]
  band: 'sprout' | 'explorer'
}

const m = (form: string, kind: MorphemeKind, meaning: string, origin: Morpheme['origin'], examples: string, band: Morpheme['band'] = 'explorer'): Morpheme => ({
  form, kind, meaning, origin, examples: examples.split(' '), band,
})

export const MORPHEMES: Morpheme[] = [
  // prefixes
  m('un', 'prefix', 'not, or undo', 'English', 'unhappy undo unlock unfair', 'sprout'),
  m('re', 'prefix', 'again, or back', 'Latin', 'redo replay return rebuild', 'sprout'),
  m('pre', 'prefix', 'before', 'Latin', 'preview preheat prepay', 'sprout'),
  m('dis', 'prefix', 'not, or the opposite of', 'Latin', 'dislike disagree disappear', 'sprout'),
  m('mis', 'prefix', 'wrongly', 'English', 'misspell mistake misread'),
  m('non', 'prefix', 'not', 'Latin', 'nonstop nonsense nonfiction'),
  m('over', 'prefix', 'too much, or above', 'English', 'overflow overcook overhead'),
  m('sub', 'prefix', 'under', 'Latin', 'subway submarine subtract'),
  m('inter', 'prefix', 'between', 'Latin', 'internet interview interrupt'),
  m('trans', 'prefix', 'across', 'Latin', 'transport transform translate'),
  m('super', 'prefix', 'above, or more than', 'Latin', 'superhero supermarket superstar'),
  m('anti', 'prefix', 'against', 'Greek', 'antifreeze antibiotic antisocial'),
  m('tele', 'prefix', 'far away', 'Greek', 'telephone telescope television'),
  m('micro', 'prefix', 'very small', 'Greek', 'microscope microphone microwave'),
  m('bi', 'prefix', 'two', 'Latin', 'bicycle biweekly binoculars'),
  m('tri', 'prefix', 'three', 'Greek', 'tricycle triangle trio'),
  m('con', 'prefix', 'with, or together', 'Latin', 'construct connect contain'),
  m('ex', 'prefix', 'out of', 'Latin', 'export exit explode'),
  m('in', 'prefix', 'in, into, or not', 'Latin', 'inspect import invisible'),
  // suffixes
  m('s', 'suffix', 'more than one, or he/she does it', 'English', 'cats runs', 'sprout'),
  m('es', 'suffix', 'more than one', 'English', 'boxes wishes', 'sprout'),
  m('ed', 'suffix', 'it already happened', 'English', 'jumped lived wanted', 'sprout'),
  m('ing', 'suffix', 'happening now', 'English', 'jumping running making', 'sprout'),
  m('er', 'suffix', 'more, or a person who', 'English', 'bigger farmer teacher', 'sprout'),
  m('est', 'suffix', 'the most', 'English', 'biggest fastest', 'sprout'),
  m('ful', 'suffix', 'full of', 'English', 'helpful careful playful', 'sprout'),
  m('less', 'suffix', 'without', 'English', 'helpless careless endless', 'sprout'),
  m('ly', 'suffix', 'in a way that is', 'English', 'quickly sadly kindly', 'sprout'),
  m('y', 'suffix', 'full of, or like', 'English', 'windy sandy muddy', 'sprout'),
  m('ness', 'suffix', 'being', 'English', 'kindness sadness darkness'),
  m('ment', 'suffix', 'the act or result of', 'Latin', 'movement payment enjoyment'),
  m('able', 'suffix', 'can be', 'Latin', 'washable breakable readable'),
  m('ible', 'suffix', 'can be', 'Latin', 'visible flexible possible'),
  m('ation', 'suffix', 'the act or result of', 'Latin', 'transportation invitation creation'),
  m('tion', 'suffix', 'the act of', 'Latin', 'action station invention'),
  m('ion', 'suffix', 'the act or result of', 'Latin', 'construction eruption inspection'),
  m('sion', 'suffix', 'the act of', 'Latin', 'vision television explosion'),
  m('ous', 'suffix', 'full of', 'Latin', 'famous dangerous joyous'),
  m('ive', 'suffix', 'tending to', 'Latin', 'active creative explosive'),
  m('al', 'suffix', 'to do with', 'Latin', 'magical musical natural'),
  m('ture', 'suffix', 'the act or result of', 'Latin', 'picture mixture creature'),
  m('ist', 'suffix', 'a person who does', 'Greek', 'artist scientist cyclist'),
  m('ology', 'suffix', 'the study of', 'Greek', 'biology geology zoology'),
  // roots
  m('port', 'root', 'carry', 'Latin', 'transport export portable report import'),
  m('struct', 'root', 'build', 'Latin', 'construct structure instruct destruction'),
  m('rupt', 'root', 'break', 'Latin', 'erupt interrupt disrupt rupture'),
  m('tract', 'root', 'pull', 'Latin', 'tractor attract subtract distract'),
  m('spect', 'root', 'look', 'Latin', 'inspect respect spectator'),
  m('dict', 'root', 'say', 'Latin', 'dictionary predict dictate'),
  m('form', 'root', 'shape', 'Latin', 'transform uniform format'),
  m('ject', 'root', 'throw', 'Latin', 'eject project reject inject'),
  m('vis', 'root', 'see', 'Latin', 'vision visible visit invisible'),
  m('aud', 'root', 'hear', 'Latin', 'audio audience audible'),
  m('graph', 'root', 'write, or draw', 'Greek', 'autograph paragraph photograph'),
  m('phon', 'root', 'sound', 'Greek', 'phone phonics microphone symphony'),
  m('photo', 'root', 'light', 'Greek', 'photograph photosynthesis'),
  m('scope', 'root', 'look at', 'Greek', 'telescope microscope periscope'),
  m('bio', 'root', 'life', 'Greek', 'biology biography'),
  m('geo', 'root', 'earth', 'Greek', 'geography geology'),
  m('aqua', 'root', 'water', 'Latin', 'aquarium aquatic'),
  m('terra', 'root', 'land', 'Latin', 'terrain territory'),
  m('meter', 'root', 'measure', 'Greek', 'thermometer kilometer'),
  m('therm', 'root', 'heat', 'Greek', 'thermometer thermos'),
]

const PREFIXES = MORPHEMES.filter((x) => x.kind === 'prefix').sort((a, b) => b.form.length - a.form.length)
const SUFFIXES = MORPHEMES.filter((x) => x.kind === 'suffix').sort((a, b) => b.form.length - a.form.length)
const ROOTS = MORPHEMES.filter((x) => x.kind === 'root').sort((a, b) => b.form.length - a.form.length)

export interface Part {
  text: string             // as it appears in the word
  base?: string            // the dictionary form, when a spelling rule changed it (make for mak)
  morpheme?: Morpheme
  kind: MorphemeKind | 'base'
  rule?: string            // e.g. 'double the n', 'drop the e', 'y to i'
}

export interface WordSource {
  has(w: string): boolean
  lookup(w: string): string[][]
}

const strip = (p: string[]) => p.map((x) => x.replace(/\d/g, '')).join(' ')
/** Suffixes that only split off a common stem (avoid happy = happ + y). */
const STRICT = new Set(['y', 'er', 'est', 's', 'es', 'al', 'ive', 'ist', 'ly'])

/**
 * Split a word into prefix + base/root + suffixes. A stem must be a dictionary word whose
 * pronunciation starts the word's pronunciation (liked = like + ed, not lik + ed).
 */
export function splitParts(word: string, lex: WordSource, common?: Set<string>): Part[] {
  const w = word.toLowerCase()
  const wordPron = lex.lookup(w).map(strip)
  const pronOk = (stem: string) => {
    if (!lex.has(stem)) return false
    if (!wordPron.length) return true
    return lex.lookup(stem).some((sp) => wordPron.some((wp) => wp.startsWith(strip(sp))))
  }
  const rootIn = (x: string) => ROOTS.some((r) => x.includes(r.form))
  const suffixes: Part[] = []
  let core = w
  let written = w

  for (let round = 0; round < 2; round++) {
    let found = false
    for (const s of SUFFIXES) {
      if (!core.endsWith(s.form) || core.length - s.form.length < 3) continue
      const stem = core.slice(0, -s.form.length)
      const cands: { stem: string; rule?: string }[] = [{ stem }]
      cands.push({ stem: stem + 'e', rule: 'drop the e' })
      if (stem.length > 2 && stem.at(-1) === stem.at(-2)) cands.push({ stem: stem.slice(0, -1), rule: `double the ${stem.at(-1)}` })
      if (stem.endsWith('i')) cands.push({ stem: stem.slice(0, -1) + 'y', rule: 'change y to i' })
      // prefer +e when both work (lived = live + ed)
      const ok =
        cands.filter((c) => pronOk(c.stem) && (!STRICT.has(s.form) || !common || common.has(c.stem)))
          .sort((a, b) => (a.rule === 'drop the e' ? -1 : 0) - (b.rule === 'drop the e' ? -1 : 0))[0] ??
        (round === 0 && rootIn(stem) && s.form.length >= 3 ? { stem } : undefined)
      if (!ok) continue
      suffixes.unshift({ text: s.form, morpheme: s, kind: 'suffix', rule: ok.rule })
      written = written.slice(0, -s.form.length)
      core = ok.stem
      found = true
      break
    }
    if (!found) break
  }

  const parts: Part[] = []
  for (const p of PREFIXES) {
    if (!core.startsWith(p.form) || core.length - p.form.length < 3) continue
    const rest = core.slice(p.form.length)
    if (lex.has(rest) || ROOTS.some((r) => rest.startsWith(r.form))) {
      parts.push({ text: p.form, morpheme: p, kind: 'prefix' })
      core = rest
      written = written.slice(p.form.length)
      break
    }
  }

  const root = ROOTS.find((r) => core.startsWith(r.form) || core.endsWith(r.form))
  if (root && core !== root.form && core.startsWith(root.form) && !lex.has(core)) {
    parts.push({ text: root.form, morpheme: root, kind: 'root' })
    parts.push({ text: written.slice(root.form.length), kind: 'base' })
  } else if (root && core !== root.form && core.endsWith(root.form) && !lex.has(core)) {
    parts.push({ text: written.slice(0, written.length - root.form.length), kind: 'base' })
    parts.push({ text: root.form, morpheme: root, kind: 'root' })
  } else {
    const isRoot = root && core === root.form
    parts.push({ text: written, base: written !== core ? core : undefined, kind: isRoot ? 'root' : 'base', morpheme: isRoot ? root : undefined })
  }
  return [...parts.filter((p) => p.text), ...suffixes]
}

/** Other words in a list that share a root or affix. */
export function familyOf(form: string, words: Iterable<string>, limit = 3): string[] {
  const m = MORPHEMES.find((x) => x.form === form)
  const out: string[] = m ? m.examples.slice(0, limit) : []
  if (out.length >= limit) return out
  for (const w of words) {
    if (out.length >= limit) break
    if (w.includes(form) && !out.includes(w)) out.push(w)
  }
  return out
}
