// The grapheme catalog: every spelling the app can teach, with the sounds it makes.
// Sounds are ARPAbet phones without stress digits (CMU dictionary style).
// `id` is what the curriculum, inventory and mastery model refer to.

export type SoundType =
  | 'consonant'   // single consonant sound
  | 'digraph'     // two+ letters, one consonant sound (sh, ck, kn)
  | 'short'       // short vowel
  | 'long'        // long vowel (vowel team, open vowel)
  | 'diphthong'   // oi, ow (cow), ou
  | 'r'           // r-controlled vowel
  | 'split'       // split digraph a_e ... (the vowel part)
  | 'ending'      // -ed, -tion, -ture, -le ...

export interface Grapheme {
  id: string
  letters: string          // letters as written; split digraphs use "a_e"
  sounds: string[][]       // accepted pronunciations, e.g. [['K','W']]
  type: SoundType
  example: string          // a word that shows the sound (used in UI and voice fallback)
  at?: 'start' | 'end'     // only valid at the start / end of a word (or before a suffix for 'end')
  beforeEIY?: boolean      // soft c / g: only before e, i, y
  split?: boolean          // split digraph: vowel + consonant + silent e
}

const g = (
  id: string,
  sounds: string | string[],
  type: SoundType,
  example: string,
  extra: Partial<Grapheme> = {},
): Grapheme => {
  const letters = extra.letters ?? id.split(' (')[0]
  const list = (Array.isArray(sounds) ? sounds : [sounds]).map((s) => s.split(' '))
  return { id, letters, sounds: list, type, example, ...extra }
}

export const GRAPHEMES: Grapheme[] = [
  // --- single letters
  g('s', ['S', 'Z'], 'consonant', 'sun'),
  g('a', 'AE', 'short', 'ant'),
  g('t', 'T', 'consonant', 'top'),
  g('p', 'P', 'consonant', 'pig'),
  g('i', 'IH', 'short', 'ink'),
  g('n', 'N', 'consonant', 'net'),
  g('m', 'M', 'consonant', 'map'),
  g('d', 'D', 'consonant', 'dog'),
  g('g', 'G', 'consonant', 'gap'),
  g('o', ['AA', 'AO'], 'short', 'on'),
  g('c', 'K', 'consonant', 'cat'),
  g('k', 'K', 'consonant', 'kit'),
  g('ck', 'K', 'digraph', 'duck'),
  g('e', 'EH', 'short', 'egg'),
  g('u', 'AH', 'short', 'up'),
  g('r', 'R', 'consonant', 'red'),
  g('h', 'HH', 'consonant', 'hat'),
  g('b', 'B', 'consonant', 'bat'),
  g('f', 'F', 'consonant', 'fan'),
  g('ff', 'F', 'digraph', 'off'),
  g('l', 'L', 'consonant', 'leg'),
  g('ll', 'L', 'digraph', 'bell'),
  g('ss', 'S', 'digraph', 'kiss'),
  g('j', 'JH', 'consonant', 'jam'),
  g('v', 'V', 'consonant', 'van'),
  g('w', 'W', 'consonant', 'wet'),
  g('x', 'K S', 'consonant', 'box'),
  g('y', 'Y', 'consonant', 'yes'),
  g('z', 'Z', 'consonant', 'zip'),
  g('zz', 'Z', 'digraph', 'buzz'),
  g('qu', 'K W', 'digraph', 'quiz'),
  // --- consonant digraphs
  g('ch', 'CH', 'digraph', 'chip'),
  g('sh', 'SH', 'digraph', 'ship'),
  g('th', ['TH', 'DH'], 'digraph', 'thin'),
  g('ng', 'NG', 'digraph', 'ring'),
  g('nk', 'NG K', 'digraph', 'pink'),
  // --- vowel teams
  g('ai', 'EY', 'long', 'rain'),
  g('ee', 'IY', 'long', 'feet'),
  g('igh', 'AY', 'long', 'night'),
  g('oa', 'OW', 'long', 'boat'),
  g('oo', ['UW', 'UH'], 'long', 'moon'),
  g('ar', 'AA R', 'r', 'car'),
  g('or', 'AO R', 'r', 'fork'),
  g('ur', 'ER', 'r', 'fur'),
  g('er', 'ER', 'r', 'her'),
  g('ow', 'AW', 'diphthong', 'cow'),
  g('oi', 'OY', 'diphthong', 'coin'),
  g('ear', ['IH R', 'IY R'], 'r', 'ear'),
  g('air', 'EH R', 'r', 'fair'),
  g('ay', 'EY', 'long', 'day'),
  g('ou', 'AW', 'diphthong', 'out'),
  g('ie', 'AY', 'long', 'pie'),
  g('ea', 'IY', 'long', 'sea'),
  g('oy', 'OY', 'diphthong', 'boy'),
  g('ir', 'ER', 'r', 'bird'),
  g('ue', ['UW', 'Y UW'], 'long', 'blue'),
  g('aw', 'AO', 'long', 'saw'),
  g('wh', ['W', 'HH W'], 'digraph', 'when'),
  g('ph', 'F', 'digraph', 'phone'),
  g('ew', ['UW', 'Y UW'], 'long', 'new'),
  // --- split digraphs (silent e)
  g('a_e', 'EY', 'split', 'cake', { split: true }),
  g('e_e', 'IY', 'split', 'these', { split: true }),
  g('i_e', 'AY', 'split', 'kite', { split: true }),
  g('o_e', 'OW', 'split', 'home', { split: true }),
  g('u_e', ['UW', 'Y UW'], 'split', 'cube', { split: true }),
  // --- endings
  g('ed (jumped)', 'T', 'ending', 'jumped', { letters: 'ed', at: 'end' }),
  g('ed (lived)', 'D', 'ending', 'lived', { letters: 'ed', at: 'end' }),
  g('ed (wanted)', ['IH D', 'AH D'], 'ending', 'wanted', { letters: 'ed', at: 'end' }),
  g('d (liked)', 'T', 'ending', 'liked', { letters: 'd', at: 'end' }),
  // --- more Sprout spellings
  g('y (happy)', 'IY', 'long', 'happy', { letters: 'y', at: 'end' }),
  g('y (my)', 'AY', 'long', 'my', { letters: 'y', at: 'end' }),
  g('le (table)', 'AH L', 'ending', 'table', { letters: 'le', at: 'end' }),
  g('ow (snow)', 'OW', 'long', 'snow', { letters: 'ow' }),
  g('ea (head)', 'EH', 'short', 'head', { letters: 'ea' }),
  g('ve', 'V', 'digraph', 'have', { at: 'end' }),
  ...['bb:B:rabbit', 'dd:D:muddy', 'gg:G:foggy', 'mm:M:hammer', 'nn:N:dinner', 'pp:P:happy', 'rr:R:carrot', 'tt:T:kitten'].map(
    (s) => {
      const [l, ph, ex] = s.split(':')
      return g(l, ph, 'digraph', ex)
    },
  ),
  // --- Explorer: open syllables, soft c/g, trickier consonants
  g('a (open)', 'EY', 'long', 'baby', { letters: 'a' }),
  g('e (open)', 'IY', 'long', 'even', { letters: 'e' }),
  g('i (open)', 'AY', 'long', 'tiger', { letters: 'i' }),
  g('o (open)', 'OW', 'long', 'open', { letters: 'o' }),
  g('u (open)', ['UW', 'Y UW'], 'long', 'music', { letters: 'u' }),
  g('c (soft)', 'S', 'consonant', 'city', { letters: 'c', beforeEIY: true }),
  g('g (soft)', 'JH', 'consonant', 'gem', { letters: 'g', beforeEIY: true }),
  g('ce', 'S', 'digraph', 'prince', { at: 'end' }),
  g('ge', 'JH', 'digraph', 'large', { at: 'end' }),
  g('se', ['Z', 'S'], 'digraph', 'cheese', { at: 'end' }),
  g('dge', 'JH', 'digraph', 'bridge'),
  g('tch', 'CH', 'digraph', 'match'),
  g('kn', 'N', 'digraph', 'knot', { at: 'start' }),
  g('wr', 'R', 'digraph', 'write', { at: 'start' }),
  g('mb', 'M', 'digraph', 'lamb', { at: 'end' }),
  g('gn', 'N', 'digraph', 'sign'),
  // --- Explorer: suffix sounds
  g('tion', 'SH AH N', 'ending', 'station'),
  g('sion', ['ZH AH N', 'SH AH N'], 'ending', 'vision'),
  g('cian', 'SH AH N', 'ending', 'magician'),
  g('ture', 'CH ER', 'ending', 'nature'),
  g('ous', 'AH S', 'ending', 'famous'),
  g('al (final)', 'AH L', 'ending', 'animal', { letters: 'al', at: 'end' }),
  // --- Explorer: alternative spellings
  g('ch (school)', 'K', 'digraph', 'school', { letters: 'ch' }),
  g('ch (chef)', 'SH', 'digraph', 'chef', { letters: 'ch' }),
  g('ey', 'IY', 'long', 'key'),
  g('eigh', 'EY', 'long', 'eight'),
  g('ei', ['EY', 'IY'], 'long', 'vein'),
  g('au', 'AO', 'long', 'author'),
  g('augh', 'AO', 'long', 'caught'),
  g('ough', ['AO', 'OW', 'UW', 'AH F', 'AW'], 'long', 'thought'),
  g('our', ['AW ER', 'AW R', 'AO R'], 'r', 'sour'),
  g('are', 'EH R', 'r', 'care'),
  g('ore', 'AO R', 'r', 'more'),
  g('oor', ['AO R', 'UH R'], 'r', 'door'),
  g('ui', 'UW', 'long', 'fruit'),
  g('gh', 'F', 'digraph', 'laugh'),
  g('ie (field)', 'IY', 'long', 'field', { letters: 'ie' }),
  g('o (son)', 'AH', 'short', 'son', { letters: 'o' }),
  g('a (want)', ['AA', 'AO'], 'short', 'want', { letters: 'a' }),
  g('or (word)', 'ER', 'r', 'word', { letters: 'or' }),
  g('u (put)', 'UH', 'short', 'put', { letters: 'u' }),
  g('ear (learn)', 'ER', 'r', 'learn', { letters: 'ear' }),
  g('ea (break)', 'EY', 'long', 'break', { letters: 'ea' }),
  g('ey (they)', 'EY', 'long', 'they', { letters: 'ey' }),
  g('i (radio)', 'IY', 'long', 'radio', { letters: 'i' }),
  g('oe', 'OW', 'long', 'toe'),
  g('sc', 'S', 'digraph', 'science'),
  g('s (measure)', 'ZH', 'consonant', 'measure', { letters: 's' }),
  g('ss (pressure)', 'SH', 'digraph', 'pressure', { letters: 'ss' }),
  g('ure (measure)', 'ER', 'r', 'measure', { letters: 'ure' }),
  g('ar (dollar)', 'ER', 'r', 'dollar', { letters: 'ar' }),
  g('ai (mountain)', ['AH', 'IH'], 'short', 'mountain', { letters: 'ai' }),
]

export const GRAPHEME_BY_ID = new Map(GRAPHEMES.map((x) => [x.id, x]))

/** Graphemes grouped by their first letter, longest first, for fast matching. */
export const GRAPHEMES_BY_FIRST = (() => {
  const m = new Map<string, Grapheme[]>()
  for (const gr of GRAPHEMES) {
    if (gr.split) continue
    const k = gr.letters[0]
    if (!m.has(k)) m.set(k, [])
    m.get(k)!.push(gr)
  }
  for (const list of m.values()) list.sort((a, b) => b.letters.length - a.letters.length)
  return m
})()

export const SPLIT_GRAPHEMES = GRAPHEMES.filter((x) => x.split)

export const VOWEL_PHONES = new Set([
  'AA', 'AE', 'AH', 'AO', 'AW', 'AY', 'EH', 'ER', 'EY', 'IH', 'IY', 'OW', 'OY', 'UH', 'UW',
])

/** A short spoken stand-in for each phone, used only when no human recording exists. */
export const PHONE_SAY: Record<string, string> = {
  AA: 'ah', AE: 'a', AH: 'uh', AO: 'aw', AW: 'ow', AY: 'eye', EH: 'eh', ER: 'er', EY: 'ay',
  IH: 'ih', IY: 'ee', OW: 'oh', OY: 'oy', UH: 'oo', UW: 'oo', B: 'b', CH: 'ch', D: 'd',
  DH: 'th', F: 'fff', G: 'g', HH: 'h', JH: 'j', K: 'k', L: 'lll', M: 'mmm', N: 'nnn', NG: 'ng',
  P: 'p', R: 'rrr', S: 'sss', SH: 'shh', T: 't', TH: 'th', V: 'vvv', W: 'w', Y: 'y', Z: 'zzz',
  ZH: 'zh',
}

/** Every distinct phone, so the recording tool can list what to record. */
export const ALL_PHONES = Object.keys(PHONE_SAY)
