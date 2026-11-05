// The teaching order. One editable file: steps are cumulative, and each step lists
// the grapheme ids (from graphemes.ts), skills and heart words it introduces.
// Skills: 'schwa' (unstressed vowels like the o in dragon), 'syl2' (two-syllable
// words), 'syl3' (three or more syllables).

export type Band = 'sprout' | 'explorer'

export interface Step {
  id: string
  band: Band
  title: string           // shown to adults
  mission: string         // shown to children (no "Level 1" labels)
  graphemes: string[]
  skills?: string[]
  heart?: string[]        // heart words introduced at this step (a set of up to 10)
  syllablePattern?: string // for Explorer syllable lessons
}

export const STEPS: Step[] = [
  { id: 's1', band: 'sprout', title: 's a t p', mission: 'Snake Trail', graphemes: ['s', 'a', 't', 'p'], heart: ['the', 'a', 'I'] },
  { id: 's2', band: 'sprout', title: 'i n m d', mission: 'Moon Hill', graphemes: ['i', 'n', 'm', 'd'], heart: ['to', 'is', 'as'] },
  { id: 's3', band: 'sprout', title: 'g o c k', mission: 'Cave Gate', graphemes: ['g', 'o', 'c', 'k'], heart: ['no', 'go', 'into'] },
  { id: 's4', band: 'sprout', title: 'ck e u r', mission: 'Duck Pond', graphemes: ['ck', 'e', 'u', 'r'], heart: ['he', 'she', 'we', 'me', 'be'] },
  { id: 's5', band: 'sprout', title: 'h b f ff l ll ss', mission: 'Bell Tower', graphemes: ['h', 'b', 'f', 'ff', 'l', 'll', 'ss'], heart: ['was', 'of', 'his', 'has'] },
  { id: 's6', band: 'sprout', title: 'j v w x y z zz qu', mission: 'Zigzag Bridge', graphemes: ['j', 'v', 'w', 'x', 'y', 'z', 'zz', 'qu'], heart: ['you', 'they', 'all', 'are'] },
  { id: 's7', band: 'sprout', title: 'ch sh th ng nk', mission: 'Ship Harbor', graphemes: ['ch', 'sh', 'th', 'ng', 'nk'], heart: ['my', 'by', 'her', 'said', 'have'] },
  { id: 's8', band: 'sprout', title: 'ai ee igh oa oo', mission: 'Rain Forest', graphemes: ['ai', 'ee', 'igh', 'oa', 'oo'], heart: ['like', 'so', 'do', 'some', 'come'] },
  { id: 's9', band: 'sprout', title: 'ar or ur er ow oi ear air', mission: 'Star Farm', graphemes: ['ar', 'or', 'ur', 'er', 'ow', 'oi', 'ear', 'air'], heart: ['were', 'there', 'little', 'one', 'what'] },
  { id: 's10', band: 'sprout', title: 'ay ou ie ea oy ir ue aw wh ph ew', mission: 'Cloud Castle', graphemes: ['ay', 'ou', 'ie', 'ea', 'oy', 'ir', 'ue', 'aw', 'wh', 'ph', 'ew'], heart: ['oh', 'their', 'people', 'Mr', 'Mrs', 'your', 'could', 'would', 'should'] },
  { id: 's11', band: 'sprout', title: 'Silent e: a_e e_e i_e o_e u_e', mission: 'Magic Gate', graphemes: ['a_e', 'e_e', 'i_e', 'o_e', 'u_e'], heart: ['once', 'any', 'many', 'again', 'who'] },
  { id: 's12', band: 'sprout', title: '-ed endings', mission: 'Echo Canyon', graphemes: ['ed (jumped)', 'ed (lived)', 'ed (wanted)', 'd (liked)'], heart: ['put', 'push', 'pull', 'full', 'want'] },
  { id: 's13', band: 'sprout', title: 'Two-syllable words, y, le, doubles, schwa', mission: 'Twin Peaks', graphemes: ['y (happy)', 'y (my)', 'le (table)', 'ow (snow)', 'ea (head)', 've', 'bb', 'dd', 'gg', 'mm', 'nn', 'pp', 'rr', 'tt'], skills: ['syl2', 'schwa'], heart: ['two', 'where', 'friend', 'because', 'does', 'water', 'very', 'every', 'eye', 'from'] },
  { id: 'e1', band: 'explorer', title: 'Open syllables, soft c and g, kn wr mb', mission: 'Code 1: Open Doors', graphemes: ['a (open)', 'e (open)', 'i (open)', 'o (open)', 'u (open)', 'c (soft)', 'g (soft)', 'ce', 'ge', 'se', 'dge', 'tch', 'kn', 'wr', 'mb', 'gn'], syllablePattern: 'V/CV (ti|ger) and VC/V (cam|el)', heart: ['mother', 'father', 'brother', 'other', 'love', 'move', 'whole', 'school', 'busy', 'only'] },
  { id: 'e2', band: 'explorer', title: 'Suffix sounds and long words', mission: 'Code 2: Long Words', graphemes: ['tion', 'sion', 'cian', 'ture', 'ous', 'al (final)'], skills: ['syl3'], syllablePattern: 'VCCCV (hun|dred) and suffix syllables (sta|tion)', heart: ['answer', 'beautiful', 'different', 'enough', 'through', 'thought', 'know', 'knew', 'listen', 'island'] },
  { id: 'e3', band: 'explorer', title: 'Alternative spellings', mission: 'Code 3: Shape-shifters', graphemes: ['ch (school)', 'ch (chef)', 'ey', 'eigh', 'ei', 'au', 'augh', 'ough', 'our', 'are', 'ore', 'oor', 'ui', 'gh', 'ie (field)', 'o (son)', 'a (want)', 'or (word)', 'u (put)', 'ear (learn)', 'ea (break)', 'ey (they)', 'i (radio)', 'oe', 'sc', 's (measure)', 'ss (pressure)', 'ure (measure)', 'ar (dollar)', 'ai (mountain)'], heart: ['ocean', 'special', 'women', 'machine', 'sugar', 'colonel', 'heart', 'cousin', 'country', 'young'] },
]

export const STEP_INDEX = new Map(STEPS.map((s, i) => [s.id, i]))

export interface Inventory {
  graphemes: Set<string>
  skills: Set<string>
  heart: Set<string>   // lowercase
}

/** Everything taught up to and including `stepId`. */
export function inventoryUpTo(stepId: string): Inventory {
  const end = STEP_INDEX.get(stepId)
  if (end === undefined) throw new Error(`Unknown step ${stepId}`)
  const inv: Inventory = { graphemes: new Set(), skills: new Set(), heart: new Set() }
  for (const s of STEPS.slice(0, end + 1)) {
    s.graphemes.forEach((x) => inv.graphemes.add(x))
    s.skills?.forEach((x) => inv.skills.add(x))
    s.heart?.forEach((x) => inv.heart.add(x.toLowerCase()))
  }
  return inv
}

export function emptyInventory(): Inventory {
  return { graphemes: new Set(), skills: new Set(), heart: new Set() }
}

/** The step that introduces a grapheme / skill / heart word. */
export function stepOf(item: string): Step | undefined {
  const low = item.toLowerCase()
  return STEPS.find(
    (s) => s.graphemes.includes(item) || s.skills?.includes(item) || s.heart?.some((h) => h.toLowerCase() === low),
  )
}
