// How to make each sound: mouth, tongue and voice cues (original wording).
// kind: 'stretchy' sounds can be held (mmm); 'bouncy' sounds are short pops (b, not "buh").

export type SoundKind = 'vowel' | 'stretchy' | 'bouncy'

export interface Articulation {
  phone: string        // ARPAbet
  spellings: string[]  // common spellings
  example: string
  emoji: string
  kind: SoundKind
  voice: boolean       // voice on (throat buzzes) or just air
  mouth: string        // what to do with lips / tongue / teeth
  tip?: string
}

const a = (phone: string, spellings: string, example: string, emoji: string, kind: SoundKind, voice: boolean, mouth: string, tip?: string): Articulation => ({
  phone, spellings: spellings.split(' '), example, emoji, kind, voice, mouth, tip,
})

export const ARTICULATION: Articulation[] = [
  // short vowels
  a('AE', 'a', 'apple', '🍎', 'vowel', true, 'Open your mouth wide and smile a little.', 'Short and quick: a, a, apple.'),
  a('EH', 'e ea', 'egg', '🥚', 'vowel', true, 'Open your mouth a little, like a small smile.', 'e, e, egg.'),
  a('IH', 'i', 'itch', '🦟', 'vowel', true, 'Small smile, mouth nearly closed.', 'i, i, itch.'),
  a('AA', 'o a', 'octopus', '🐙', 'vowel', true, 'Open wide, like the doctor is checking your throat.', 'o, o, octopus.'),
  a('AH', 'u o', 'up', '⬆️', 'vowel', true, 'Relax your mouth, open it a little.', 'u, u, up. This is also the lazy "uh" (schwa) in long words.'),
  a('UH', 'oo u', 'book', '📕', 'vowel', true, 'Lips a little round, short sound.', 'oo, book, look.'),
  // long vowels
  a('EY', 'a_e ai ay', 'cake', '🍰', 'vowel', true, 'Say the letter name A: start open, end in a smile.', 'It says its name.'),
  a('IY', 'ee ea e_e y', 'tree', '🌳', 'vowel', true, 'Big wide smile, teeth close.', 'ee, like you are smiling for a photo.'),
  a('AY', 'i_e igh ie y', 'kite', '🪁', 'vowel', true, 'Slide from "ah" to "ee".', 'It says its name: I.'),
  a('OW', 'o_e oa ow', 'boat', '⛵', 'vowel', true, 'Round your lips into an O.', 'It says its name: O.'),
  a('UW', 'oo u_e ew ue', 'moon', '🌙', 'vowel', true, 'Small round lips, like blowing a kiss.', 'oo, moon, zoo.'),
  a('AW', 'ow ou', 'cow', '🐮', 'vowel', true, 'Open wide, then close into round lips.', 'Like saying "ow!" when you bump your toe.'),
  a('OY', 'oi oy', 'boy', '👦', 'vowel', true, 'Round lips for "oh", then slide to "ee".', 'oy, boy, toy.'),
  a('AO', 'aw au or', 'saw', '🪚', 'vowel', true, 'Open your mouth, lips a little round.', 'aw, like seeing a cute puppy.'),
  a('ER', 'er ir ur', 'her', '👩', 'vowel', true, 'Pull your tongue back and up, lips a little round.', 'One sound, not "e-r".'),
  // stretchy consonants
  a('M', 'm mm', 'map', '🗺️', 'stretchy', true, 'Close your lips and hum.', 'mmm, like something tastes yummy.'),
  a('N', 'n nn kn', 'net', '🥅', 'stretchy', true, 'Tongue up behind your top teeth, hum through your nose.', 'nnn.'),
  a('S', 's ss c ce', 'sun', '☀️', 'stretchy', false, 'Teeth close together, let the air hiss out.', 'sss, like a snake.'),
  a('Z', 'z zz s', 'zip', '🤐', 'stretchy', true, 'Same as s, but turn your voice on.', 'zzz, like a buzzing bee.'),
  a('F', 'f ff ph', 'fish', '🐟', 'stretchy', false, 'Top teeth on your bottom lip, then blow.', 'fff, no voice.'),
  a('V', 'v ve', 'van', '🚐', 'stretchy', true, 'Top teeth on your bottom lip, blow with your voice on.', 'vvv, feel your lip tickle.'),
  a('L', 'l ll le', 'leg', '🦵', 'stretchy', true, 'Tip of your tongue up behind your top teeth.', 'lll.'),
  a('R', 'r rr wr', 'red', '🔴', 'stretchy', true, 'Curl your tongue back, lips a little round.', 'rrr, like a growling puppy, not "er".'),
  a('SH', 'sh ti ch', 'ship', '🚢', 'stretchy', false, 'Push your lips out round and blow.', 'shh, be quiet!'),
  a('ZH', 's si', 'treasure', '💰', 'stretchy', true, 'Like shh, but with your voice on.', 'The middle of treasure and measure.'),
  a('TH', 'th', 'thumb', '👍', 'stretchy', false, 'Let your tongue peek out between your teeth and blow.', 'th, quiet, like thin.'),
  a('DH', 'th', 'this', '👉', 'stretchy', true, 'Tongue between your teeth, voice on.', 'th, buzzy, like this and that.'),
  a('NG', 'ng n', 'ring', '💍', 'stretchy', true, 'Back of your tongue up, hum through your nose.', 'ng, at the end of sing.'),
  a('HH', 'h wh', 'hat', '🎩', 'stretchy', false, 'Open mouth, push out a puff of air.', 'Like fogging up a window: h.'),
  a('W', 'w wh', 'web', '🕸️', 'stretchy', true, 'Small round lips, then open them.', 'w, not "wuh".'),
  a('Y', 'y', 'yes', '✅', 'stretchy', true, 'Tongue high in your mouth, then slide open.', 'y, as in yes, yellow.'),
  // bouncy consonants
  a('P', 'p pp', 'pig', '🐷', 'bouncy', false, 'Press your lips together, then pop them open.', 'A tiny puff of air, no "uh": p, not "puh".'),
  a('B', 'b bb', 'bat', '🦇', 'bouncy', true, 'Lips together, pop them open with your voice on.', 'b, not "buh".'),
  a('T', 't tt', 'top', '🔝', 'bouncy', false, 'Tap your tongue behind your top teeth.', 't, a quiet tap.'),
  a('D', 'd dd ed', 'dog', '🐶', 'bouncy', true, 'Tap your tongue behind your top teeth, voice on.', 'd, not "duh".'),
  a('K', 'c k ck ch', 'kite', '🪁', 'bouncy', false, 'Lift the back of your tongue and let it click.', 'k, a quiet click.'),
  a('G', 'g gg', 'goat', '🐐', 'bouncy', true, 'Back of your tongue clicks, voice on.', 'g, not "guh".'),
  a('CH', 'ch tch', 'chip', '🍟', 'bouncy', false, 'Lips push forward, a quick sneeze sound.', 'ch, like a little train: ch ch.'),
  a('JH', 'j g dge ge', 'jam', '🍓', 'bouncy', true, 'Like ch, but with your voice on.', 'j, not "juh".'),
]

export const ARTIC_BY_PHONE = new Map(ARTICULATION.map((x) => [x.phone, x]))
