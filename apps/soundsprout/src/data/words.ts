// Word lists. Dolch lists are public domain (E. W. Dolch, 1936/1948).
// The Top 300 is the Dolch service words (pre-primer → third grade) followed by the Dolch
// nouns, cut at 300. `npm run rank -- <folder of .txt>` re-ranks it by frequency in any
// corpus you are licensed to use.

const list = (s: string) => s.trim().split(/\s+/)

export const DOLCH = {
  preprimer: list(`a and away big blue can come down find for funny go help here I in is it jump little look make me my not one play red run said see the three to two up we where yellow you`),
  primer: list(`all am are at ate be black brown but came did do eat four get good have he into like must new no now on our out please pretty ran ride saw say she so soon that there they this too under want was well went what white who will with yes`),
  first: list(`after again an any as ask by could every fly from give going had has her him his how just know let live may of old once open over put round some stop take thank them then think walk were when`),
  second: list(`always around because been before best both buy call cold does don't fast first five found gave goes green its made many off or pull read right sing sit sleep tell their these those upon us use very wash which why wish work would write your`),
  third: list(`about better bring carry clean cut done draw drink eight fall far full got grow hold hot hurt if keep kind laugh light long much myself never only own pick seven shall show six small start ten today together try warm`),
  nouns: list(`apple baby back ball bear bed bell bird birthday boat box boy bread brother cake car cat chair chicken children coat corn cow day dog doll door duck egg eye farm farmer father feet fire fish floor flower game garden girl goodbye grass ground hand head hill home horse house kitty leg letter man men milk money morning mother name nest night paper party picture pig rabbit rain ring robin school seed sheep shoe sister snow song squirrel stick street sun table thing time top toy tree watch water way window wood`),
}

export const DOLCH_LEVEL: Record<string, string> = {}
for (const [level, words] of Object.entries(DOLCH)) for (const w of words) DOLCH_LEVEL[w.toLowerCase()] ??= level

/** The Top 300, in teaching order, with source and rank. */
export const TOP_300: { word: string; rank: number; source: string }[] = Object.entries(DOLCH)
  .flatMap(([level, words]) => words.map((w) => ({ word: w, source: `Dolch ${level}` })))
  .slice(0, 300)
  .map((x, i) => ({ ...x, rank: i + 1 }))

export type Pos = 'noun' | 'verb' | 'adjective' | 'adverb' | 'pronoun' | 'preposition' | 'conjunction' | 'little'

export interface BankWord {
  word: string
  pos: Pos
  category: string
  emoji?: string
}

const bank = (pos: Pos, category: string, s: string): BankWord[] =>
  list(s).map((x) => {
    const [word, emoji] = x.split(':')
    return { word, pos, category, emoji }
  })

/** A curated bank for games and the word explorer, grouped by part of speech and category. */
export const WORD_BANK: BankWord[] = [
  ...bank('noun', 'animals', 'cat:🐱 dog:🐶 pig:🐷 hen:🐔 fox:🦊 rat:🐀 bat:🦇 ant:🐜 duck:🦆 fish:🐟 frog:🐸 crab:🦀 moth:🦋 chick:🐤 bee:🐝 sheep:🐑 goat:🐐 cow:🐮 owl:🦉 bird:🐦 snake:🐍 shark:🦈 horse:🐴 rabbit:🐰 tiger:🐯 camel:🐫 dragon:🐉 squirrel:🐿️ spider:🕷️'),
  ...bank('noun', 'food', 'jam:🍓 egg:🥚 nut:🥜 bun:🍞 corn:🌽 cake:🍰 milk:🥛 cheese:🧀 apple:🍎 carrot:🥕 muffin:🧁 popcorn:🍿 peach:🍑'),
  ...bank('noun', 'things', 'cup:☕ hat:🎩 map:🗺️ pan:🍳 pot:🍲 bed:🛏️ bag:👜 box:📦 bell:🔔 sock:🧦 drum:🥁 tent:⛺ ring:💍 kite:🪁 bike:🚲 rope:🪢 cube:🧊 book:📕 coat:🧥 fork:🍴 coin:🪙 boat:⛵ ship:🚢 van:🚐 bus:🚌 car:🚗 train:🚂 rocket:🚀 robot:🤖 basket:🧺 candle:🕯️'),
  ...bank('noun', 'nature', 'sun:☀️ moon:🌙 star:⭐ rain:🌧️ tree:🌳 seed:🌱 rock:🪨 hill:⛰️ nest:🪺 web:🕸️ snow:❄️ leaf:🍃 sand:🏖️ storm:⛈️ river:🏞️ volcano:🌋'),
  ...bank('noun', 'people', 'man:👨 mom:👩 dad:👨 kid:🧒 king:🤴 queen:👸 farmer:🧑‍🌾 chef:🧑‍🍳 pilot:🧑‍✈️ sister:👧 brother:👦'),
  ...bank('noun', 'places', 'farm:🚜 shop:🏪 pond:🦆 park:🏞️ town:🏘️ school:🏫 cave:🕳️ castle:🏰 island:🏝️ garden:🌻'),
  ...bank('verb', 'moving', 'run hop jump skip swim dig spin zoom dash rush ride hike slide skate march crawl climb'),
  ...bank('verb', 'saying', 'yell shout chat sing quack hiss moan cheer whisper'),
  ...bank('verb', 'feeling and thinking', 'think wish hope dream like need want wonder'),
  ...bank('verb', 'doing with hands', 'tap clap hug mix fix zip chop pick pack cook bake paint grab drop hold'),
  ...bank('verb', 'everyday', 'sit nap sleep eat feed meet look see hide shine float sail smile'),
  ...bank('adjective', 'size', 'big tiny long short thick thin tall huge small'),
  ...bank('adjective', 'colour', 'red tan pink black green white brown'),
  ...bank('adjective', 'feelings', 'sad mad glad happy brave kind grumpy silly'),
  ...bank('adjective', 'senses', 'hot cold wet soft loud sweet sharp smooth fresh bright dark crunchy'),
  ...bank('adjective', 'how it is', 'quick slow rich sick deep fast strong funny'),
  ...bank('adverb', 'how', 'quickly slowly softly loudly gently sadly'),
  ...bank('little', 'little words', 'the a an and but in on at of to with for from up'),
]

export const BANK_BY_WORD = new Map(WORD_BANK.map((w) => [w.word, w]))

export const POS_LABEL: Record<Pos, { label: string; icon: string; underline: string; help: string }> = {
  noun: { label: 'Noun', icon: '◻', underline: 'pos-noun', help: 'A naming word: a person, animal, place or thing.' },
  verb: { label: 'Verb', icon: '➜', underline: 'pos-verb', help: 'A doing word: what someone or something does.' },
  adjective: { label: 'Adjective', icon: '★', underline: 'pos-adj', help: 'A describing word: what something is like.' },
  adverb: { label: 'Adverb', icon: '〜', underline: 'pos-adv', help: 'Tells how, when or where something is done.' },
  pronoun: { label: 'Pronoun', icon: '◐', underline: 'pos-pron', help: 'Stands in for a noun: he, she, it, they.' },
  preposition: { label: 'Preposition', icon: '⇲', underline: 'pos-prep', help: 'Tells where or when: in, on, under, after.' },
  conjunction: { label: 'Conjunction', icon: '⊕', underline: 'pos-conj', help: 'Joins words or ideas: and, but, because.' },
  little: { label: 'Little word', icon: '·', underline: 'pos-little', help: 'A small word that glues a sentence together.' },
}

export interface VocabWord {
  word: string
  pos: Pos
  tier: 2 | 3
  subject?: 'science' | 'history' | 'geography' | 'maths' | 'arts'
  sprout?: string       // definition for younger readers
  def: string           // Explorer definition (≤ 20 words)
  examples: string[]
  synonyms?: string[]
  antonyms?: string[]
}

const v = (word: string, pos: Pos, def: string, ex: string, extra: Partial<VocabWord> = {}): VocabWord => ({
  word, pos, tier: 2, def, examples: ex.split(' | '), ...extra,
})

/** A starter set of Tier 2 and subject words (original definitions). Grown-ups can add more. */
export const VOCAB: VocabWord[] = [
  v('enormous', 'adjective', 'very, very big', 'The whale was enormous. | An enormous wave hit the boat.', { synonyms: ['huge', 'gigantic'], antonyms: ['tiny'] }),
  v('gigantic', 'adjective', 'so big it is hard to believe', 'A gigantic tree blocked the path. | The giant had gigantic boots.', { synonyms: ['enormous', 'huge'], antonyms: ['tiny'] }),
  v('tiny', 'adjective', 'very small', 'A tiny ant sat on my thumb. | The seed was tiny.', { synonyms: ['small', 'little'], antonyms: ['huge'] }),
  v('gradually', 'adverb', 'slowly, a little at a time', 'The sky gradually got dark. | The ice gradually melted.', { antonyms: ['suddenly'] }),
  v('suddenly', 'adverb', 'all at once, when you did not expect it', 'Suddenly, the lights went out. | The dog suddenly barked.', { antonyms: ['gradually'] }),
  v('curious', 'adjective', 'wanting to know or find out about something', 'The curious cat sniffed the box. | I am curious about space.', { synonyms: ['interested', 'nosy'] }),
  v('reluctant', 'adjective', 'not wanting to do something', 'Sam was reluctant to jump in the cold pond. | She gave a reluctant smile.', { synonyms: ['unwilling'], antonyms: ['eager'] }),
  v('eager', 'adjective', 'really wanting to do something', 'The eager puppy ran to the door. | We were eager to start.', { synonyms: ['keen'], antonyms: ['reluctant'] }),
  v('observe', 'verb', 'to watch carefully so you notice things', 'We observe the ants in the jar. | Scientists observe the stars.', { synonyms: ['watch', 'notice'] }),
  v('compare', 'verb', 'to look at how things are the same and different', 'Compare the two leaves. | Let us compare our maps.'),
  v('ancient', 'adjective', 'very, very old; from long ago', 'We saw an ancient castle. | Ancient people made tools from stone.', { synonyms: ['old'], antonyms: ['modern'] }),
  v('brilliant', 'adjective', 'very bright, or very clever', 'The brilliant sun made us squint. | What a brilliant idea!', { synonyms: ['bright', 'clever'] }),
  v('cautious', 'adjective', 'careful to stay away from danger', 'Be cautious near the edge. | The cautious mouse peeked out.', { synonyms: ['careful'], antonyms: ['reckless'] }),
  v('delicate', 'adjective', 'easy to break or hurt; needs gentle hands', 'The eggshell was delicate. | A delicate butterfly landed on me.', { synonyms: ['fragile'], antonyms: ['sturdy'] }),
  v('fragile', 'adjective', 'easy to break', 'The glass vase is fragile. | Pack the fragile cups with care.', { synonyms: ['delicate'], antonyms: ['strong'] }),
  v('exhausted', 'adjective', 'so tired you can hardly move', 'After the race, we were exhausted. | The exhausted dog fell asleep.', { synonyms: ['tired', 'worn out'], antonyms: ['lively'] }),
  v('furious', 'adjective', 'very, very angry', 'The king was furious. | A furious storm shook the house.', { synonyms: ['angry', 'mad'], antonyms: ['calm'] }),
  v('glance', 'verb', 'to look at something quickly', 'Glance at the clock. | She glanced back at me.', { synonyms: ['peek'], antonyms: ['stare'] }),
  v('grumble', 'verb', 'to complain in a low, cross voice', 'Dad grumbled about the rain. | My tummy grumbled.', { synonyms: ['complain', 'moan'] }),
  v('hesitate', 'verb', 'to stop for a moment because you are not sure', 'He hesitated at the top of the slide. | Do not hesitate to ask.'),
  v('investigate', 'verb', 'to look closely to find out the truth', 'The detective will investigate the missing cake. | Let us investigate that noise.', { synonyms: ['explore', 'examine'] }),
  v('mysterious', 'adjective', 'strange and hard to explain', 'A mysterious note was under the door. | We heard a mysterious sound.', { synonyms: ['strange', 'puzzling'] }),
  v('nervous', 'adjective', 'a bit scared or worried about what will happen', 'I was nervous before the show. | The nervous kitten hid.', { synonyms: ['worried', 'jittery'], antonyms: ['calm'] }),
  v('peculiar', 'adjective', 'strange or unusual', 'The soup had a peculiar smell. | What a peculiar hat!', { synonyms: ['odd', 'strange'], antonyms: ['ordinary'] }),
  v('predict', 'verb', 'to say what you think will happen next', 'Can you predict the end of the story? | They predict rain today.', { synonyms: ['guess', 'forecast'] }),
  v('rapid', 'adjective', 'very fast', 'The river was rapid. | We heard rapid footsteps.', { synonyms: ['quick', 'fast'], antonyms: ['slow'] }),
  v('scurry', 'verb', 'to run with quick, small steps', 'The mice scurry under the floor. | Crabs scurry across the sand.', { synonyms: ['scamper', 'dash'] }),
  v('shimmer', 'verb', 'to shine with a soft light that seems to move', 'The lake shimmered in the moonlight. | Her dress shimmered.', { synonyms: ['sparkle', 'glimmer'] }),
  v('stubborn', 'adjective', 'not willing to change your mind', 'The stubborn goat would not move. | Do not be so stubborn!', { synonyms: ['headstrong'] }),
  v('swift', 'adjective', 'moving very fast', 'A swift fox ran past. | We sent a swift reply.', { synonyms: ['quick', 'rapid'], antonyms: ['slow'] }),
  v('timid', 'adjective', 'shy and easily scared', 'The timid deer ran into the woods. | He gave a timid wave.', { synonyms: ['shy'], antonyms: ['bold'] }),
  v('vanish', 'verb', 'to disappear suddenly', 'The magician made the coin vanish. | The sun vanished behind a cloud.', { synonyms: ['disappear'], antonyms: ['appear'] }),
  v('wander', 'verb', 'to walk around with no plan of where to go', 'We wandered through the market. | Do not wander off!', { synonyms: ['roam'] }),
  v('gather', 'verb', 'to bring things or people together', 'Gather the shells in a bucket. | We gathered around the fire.', { synonyms: ['collect'], antonyms: ['scatter'] }),
  v('protect', 'verb', 'to keep safe from harm', 'A helmet protects your head. | The hen protects her chicks.', { synonyms: ['guard', 'shield'] }),
  v('discover', 'verb', 'to find or learn something for the first time', 'We discovered a cave. | She discovered how magnets work.', { synonyms: ['find'] }),
  v('explore', 'verb', 'to travel around a place to learn about it', 'Let us explore the forest. | Astronauts explore space.', { synonyms: ['investigate'] }),
  v('survive', 'verb', 'to stay alive through something hard', 'Camels survive in the desert. | The plant survived the frost.'),
  v('habitat', 'noun', 'the natural home of a plant or animal', 'A pond is a habitat for frogs. | Polar bears need an icy habitat.', { tier: 3, subject: 'science' }),
  v('predator', 'noun', 'an animal that hunts other animals for food', 'The owl is a predator. | Sharks are ocean predators.', { tier: 3, subject: 'science', antonyms: ['prey'] }),
  v('prey', 'noun', 'an animal that is hunted for food', 'Mice are prey for owls. | The lion chased its prey.', { tier: 3, subject: 'science', antonyms: ['predator'] }),
  v('migrate', 'verb', 'to move to a new place when the seasons change', 'Geese migrate south in the fall. | Some whales migrate a long way.', { tier: 3, subject: 'science' }),
  v('nocturnal', 'adjective', 'awake and active at night', 'Bats are nocturnal. | Nocturnal animals sleep in the day.', { tier: 3, subject: 'science' }),
  v('camouflage', 'noun', 'colors or shapes that help an animal hide', 'The frog uses camouflage to hide on leaves. | Stripes are camouflage for a tiger.', { tier: 3, subject: 'science' }),
  v('erosion', 'noun', 'slow wearing away of rock or soil by wind or water', 'Erosion made the canyon. | Waves cause erosion on the beach.', { tier: 3, subject: 'geography' }),
  v('volcano', 'noun', 'a mountain that can push out hot melted rock', 'The volcano erupted. | Lava flowed down the volcano.', { tier: 3, subject: 'geography' }),
  v('lava', 'noun', 'hot, melted rock that comes out of a volcano', 'Red lava glowed in the dark. | The lava cooled into black rock.', { tier: 3, subject: 'geography' }),
  v('magma', 'noun', 'hot, melted rock deep under the ground', 'Magma rises up inside a volcano. | Magma is very, very hot.', { tier: 3, subject: 'geography' }),
  v('erupt', 'verb', 'to burst out suddenly', 'The volcano began to erupt. | The crowd erupted in cheers.', { tier: 3, subject: 'geography' }),
  v('fraction', 'noun', 'a part of a whole thing, like one half', 'One half is a fraction. | Cut the pizza into fractions.', { tier: 3, subject: 'maths' }),
  v('gravity', 'noun', 'the pull that makes things fall to the ground', 'Gravity pulls the ball down. | The moon has less gravity.', { tier: 3, subject: 'science' }),
  v('orbit', 'verb', 'to travel around something in space', 'The moon orbits Earth. | Satellites orbit the planet.', { tier: 3, subject: 'science' }),
  v('inventor', 'noun', 'a person who makes something new that did not exist before', 'The inventor built a flying bike. | Who was the inventor of the phone?', { tier: 2 }),
  v('clockwork', 'noun', 'gears and springs that make something move when you wind it up', 'The clockwork mouse ran across the floor. | Wind up the clockwork key.'),
]
export const VOCAB_BY_WORD = new Map(VOCAB.map((x) => [x.word, x]))

/** Short meanings for common story words (Sprout card). Grown-ups can add more. */
export const SIMPLE_DEFS: Record<string, string> = {
  nap: 'a short sleep', pan: 'a flat pot for cooking', pot: 'a deep pan for cooking', mat: 'a small rug on the floor',
  spot: 'to see or notice', tap: 'to hit gently', mud: 'wet, sticky dirt', duck: 'a bird that swims and quacks',
  quack: 'the sound a duck makes', splash: 'water flying up when something hits it', pond: 'a small lake',
  shed: 'a small hut for tools', moon: 'the bright ball we see in the sky at night', kite: 'a toy that flies on a string in the wind',
  glide: 'to move smoothly and easily', drift: 'to float slowly along', cliff: 'a high, steep wall of rock',
  float: 'to stay on top of water or air', gust: 'a sudden rush of wind', snatch: 'to grab quickly',
  rush: 'to hurry', chill: 'a cold feeling', shiver: 'to shake because you are cold', fetch: 'to go and get',
}

export const HOMOPHONES: { words: string[]; sentences: { text: string; answer: string }[] }[] = [
  { words: ['their', 'there', "they're"], sentences: [
    { text: 'The kids put ___ bags on the bus.', answer: 'their' },
    { text: 'Look over ___, by the tree!', answer: 'there' },
    { text: '___ going to the park today.', answer: "they're" },
  ] },
  { words: ['to', 'too', 'two'], sentences: [
    { text: 'I have ___ cats.', answer: 'two' },
    { text: 'We went ___ the beach.', answer: 'to' },
    { text: 'Can I come ___?', answer: 'too' },
  ] },
  { words: ['your', "you're"], sentences: [
    { text: 'Is this ___ hat?', answer: 'your' },
    { text: '___ my best friend.', answer: "you're" },
  ] },
  { words: ['hear', 'here'], sentences: [
    { text: 'Come ___ and sit down.', answer: 'here' },
    { text: 'Can you ___ the birds?', answer: 'hear' },
  ] },
  { words: ['see', 'sea'], sentences: [
    { text: 'Fish swim in the ___.', answer: 'sea' },
    { text: 'I can ___ the moon.', answer: 'see' },
  ] },
  { words: ['right', 'write'], sentences: [
    { text: 'Please ___ your name.', answer: 'write' },
    { text: 'Turn ___ at the shop.', answer: 'right' },
  ] },
  { words: ['knight', 'night'], sentences: [
    { text: 'The ___ rode a white horse.', answer: 'knight' },
    { text: 'Owls hunt at ___.', answer: 'night' },
  ] },
  { words: ['flour', 'flower'], sentences: [
    { text: 'We need ___ to bake bread.', answer: 'flour' },
    { text: 'A bee sat on the ___.', answer: 'flower' },
  ] },
  { words: ['which', 'witch'], sentences: [
    { text: '___ cup is yours?', answer: 'which' },
    { text: 'The ___ had a black cat.', answer: 'witch' },
  ] },
]

/** Shades of meaning: each list goes from weakest to strongest. */
export const SHADES: { label: string; words: string[] }[] = [
  { label: 'How big?', words: ['tiny', 'small', 'big', 'huge', 'gigantic'] },
  { label: 'How hot?', words: ['cool', 'warm', 'hot', 'scorching'] },
  { label: 'How loud?', words: ['whisper', 'talk', 'shout', 'scream'] },
  { label: 'How happy?', words: ['content', 'happy', 'joyful', 'thrilled'] },
  { label: 'How fast?', words: ['stroll', 'walk', 'jog', 'sprint'] },
  { label: 'How wet?', words: ['damp', 'wet', 'soaked', 'drenched'] },
  { label: 'How angry?', words: ['annoyed', 'cross', 'angry', 'furious'] },
]

export const CONTEXT_CLUES: { sentence: string; word: string; options: string[]; answer: number; clue: string }[] = [
  { sentence: 'The puppy was so timid that it hid behind the sofa when guests came.', word: 'timid', options: ['shy and easily scared', 'very loud', 'very hungry'], answer: 0, clue: 'hid behind the sofa' },
  { sentence: 'After running all day, the exhausted hikers fell asleep at once.', word: 'exhausted', options: ['excited', 'very tired', 'lost'], answer: 1, clue: 'fell asleep at once' },
  { sentence: 'The ancient map was torn and yellow, drawn hundreds of years ago.', word: 'ancient', options: ['brand new', 'very old', 'very big'], answer: 1, clue: 'hundreds of years ago' },
  { sentence: 'The rabbit was swift; it raced across the field faster than the dog.', word: 'swift', options: ['very fast', 'very fluffy', 'sleepy'], answer: 0, clue: 'faster than the dog' },
  { sentence: 'Handle the delicate glass bird gently, or it will break.', word: 'delicate', options: ['heavy', 'easy to break', 'shiny'], answer: 1, clue: 'or it will break' },
  { sentence: 'The stubborn mule would not move, no matter how much we pulled.', word: 'stubborn', options: ['not willing to change', 'very small', 'kind'], answer: 0, clue: 'would not move, no matter how much we pulled' },
  { sentence: 'Owls are nocturnal, so they sleep all day and hunt at night.', word: 'nocturnal', options: ['awake at night', 'able to swim', 'very large'], answer: 0, clue: 'sleep all day and hunt at night' },
  { sentence: 'The magician waved his hand and the coin seemed to vanish into thin air.', word: 'vanish', options: ['grow', 'disappear', 'shine'], answer: 1, clue: 'into thin air' },
]

/** Nonsense words for "Real or Alien?" are made from these spellings. */
export const ALIEN_PARTS = {
  onsets: list('b d f g h j k l m n p r s t v w z ch sh th st sp tr fl gr bl cr'),
  vowels: list('a e i o u'),
  codas: list('b d g m n p t x ck sh ng nd st mp'),
}
