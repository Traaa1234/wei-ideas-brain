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

import TOP_WORDS_JSON from '../../content/top-words.json'

/**
 * The Top 1,000: most frequent everyday English words, ranked by how often they are used
 * (FrequencyWords, OpenSubtitles 2018 counts, CC BY-SA 4.0), filtered for children.
 * Rebuild with `npm run top-words -- <en_50k.txt>`.
 */
export const TOP_WORDS: { word: string; rank: number; count: number; dolch?: string }[] = (TOP_WORDS_JSON as { words: { word: string; rank: number; count: number }[] }).words.map((w) => ({
  ...w,
  dolch: DOLCH_LEVEL[w.word.toLowerCase()],
}))
export const TOP_WORDS_SOURCE = (TOP_WORDS_JSON as { source: string }).source

/** The first 300 of the ranked list. */
export const TOP_300 = TOP_WORDS.slice(0, 300).map((w) => ({ ...w, source: `rank ${w.rank}` }))

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
  ...bank('noun', 'animals', 'lion:🦁 bear:🐻 wolf:🐺 deer:🦌 zebra:🦓 monkey:🐒 panda:🐼 koala:🐨 whale:🐋 dolphin:🐬 octopus:🐙 turtle:🐢 lizard:🦎 snail:🐌 worm:🪱 parrot:🦜 penguin:🐧 duckling:🐥 puppy:🐶 kitten:🐱 mouse:🐭 hamster:🐹 elephant:🐘 giraffe:🦒 hippo:🦛 kangaroo:🦘 crocodile:🐊 seal:🦭 owl:🦉 eagle:🦅 swan:🦢 bat:🦇'),
  ...bank('noun', 'bugs and small creatures', 'ant:🐜 beetle:🪲 ladybug:🐞 butterfly:🦋 caterpillar:🐛 cricket:🦗 fly:🪰 snail:🐌 slug:🐌 jellyfish:🪼 shrimp:🦐 lobster:🦞'),
  ...bank('noun', 'food', 'bread:🍞 soup:🍲 rice:🍚 pasta:🍝 pizza:🍕 salad:🥗 sandwich:🥪 taco:🌮 noodle:🍜 cookie:🍪 pie:🥧 candy:🍬 honey:🍯 butter:🧈 lemon:🍋 banana:🍌 grape:🍇 melon:🍈 cherry:🍒 plum:🍑 pear:🍐 orange:🍊 tomato:🍅 potato:🥔 onion:🧅 pepper:🫑 bean:🫘 pea:🫛 corn:🌽 waffle:🧇 pancake:🥞 juice:🧃 tea:🍵'),
  ...bank('noun', 'body', 'head:🙂 hand:✋ arm:💪 leg:🦵 foot:🦶 toe:🦶 knee:🦵 nose:👃 ear:👂 eye:👁️ mouth:👄 lip:👄 tooth:🦷 tongue:👅 hair:💇 neck:🧣 chin:🙂 thumb:👍 finger:☝️ heart:❤️ brain:🧠 bone:🦴 skin:✋ chest:👕 back:🔙'),
  ...bank('noun', 'clothes', 'shirt:👕 dress:👗 skirt:👗 pants:👖 shorts:🩳 socks:🧦 shoes:👟 boots:🥾 coat:🧥 jacket:🧥 scarf:🧣 gloves:🧤 cap:🧢 belt:👖 pocket:👖 button:🔘 zipper:🤐 pajamas:👕'),
  ...bank('noun', 'home', 'house:🏠 room:🚪 door:🚪 window:🪟 wall:🧱 floor:🟫 roof:🏠 bed:🛏️ chair:🪑 table:🍽️ sofa:🛋️ lamp:💡 clock:⏰ sink:🚰 bath:🛁 towel:🧻 soap:🧼 brush:🪥 comb:🪮 cup:☕ plate:🍽️ bowl:🥣 spoon:🥄 fork:🍴 knife:🔪 oven:♨️ fridge:🧊 stairs:🪜 garden:🌻 fence:🚧'),
  ...bank('noun', 'school', 'pen:🖊️ pencil:✏️ crayon:🖍️ paper:📄 book:📕 bag:🎒 desk:🪑 ruler:📏 glue:🧴 paint:🎨 brush:🖌️ chalk:🧑‍🏫 map:🗺️ globe:🌍 class:🏫 teacher:🧑‍🏫 lesson:📚 test:📝 lunch:🥪 bell:🔔'),
  ...bank('noun', 'toys and play', 'ball:⚽ doll:🪆 kite:🪁 drum:🥁 game:🎲 puzzle:🧩 block:🧱 swing:🛝 slide:🛝 robot:🤖 teddy:🧸 balloon:🎈 bubble:🫧 crayon:🖍️ card:🃏 sled:🛷 skates:⛸️'),
  ...bank('noun', 'vehicles', 'car:🚗 bus:🚌 van:🚐 truck:🚚 train:🚂 tram:🚋 plane:✈️ jet:🛩️ ship:🚢 boat:⛵ raft:🛶 bike:🚲 scooter:🛴 rocket:🚀 taxi:🚕 tractor:🚜 helicopter:🚁 sub:🚢'),
  ...bank('noun', 'weather and sky', 'sun:☀️ moon:🌙 star:⭐ cloud:☁️ rain:🌧️ snow:❄️ wind:💨 storm:⛈️ rainbow:🌈 fog:🌫️ ice:🧊 frost:❄️ thunder:⛈️ sky:🌌 planet:🪐 comet:☄️'),
  ...bank('noun', 'nature', 'flower:🌸 rose:🌹 grass:🌱 bush:🌳 log:🪵 stick:🪵 stone:🪨 pond:🦆 lake:🏞️ sea:🌊 shell:🐚 beach:🏖️ hill:⛰️ forest:🌲 cave:🕳️ mud:🟫 dirt:🟫 seed:🌱 root:🌱 nut:🌰 acorn:🌰 pine:🌲 mushroom:🍄 wave:🌊'),
  ...bank('noun', 'people', 'mom:👩 dad:👨 baby:👶 sister:👧 brother:👦 aunt:👩 uncle:👨 grandma:👵 grandpa:👴 friend:🧒 doctor:🧑‍⚕️ nurse:🧑‍⚕️ farmer:🧑‍🌾 baker:🧑‍🍳 pilot:🧑‍✈️ artist:🧑‍🎨 singer:🧑‍🎤 driver:🧑 vet:🧑‍⚕️ firefighter:🧑‍🚒 astronaut:🧑‍🚀 scientist:🧑‍🔬'),
  ...bank('noun', 'shapes and numbers', 'circle:⭕ square:🟥 triangle:🔺 star:⭐ heart:❤️ line:➖ dot:⚫ one:1️⃣ two:2️⃣ three:3️⃣ four:4️⃣ five:5️⃣ six:6️⃣ seven:7️⃣ eight:8️⃣ nine:9️⃣ ten:🔟'),
  ...bank('noun', 'music and art', 'song:🎵 drum:🥁 bell:🔔 horn:📯 harp:🎼 flute:🪈 piano:🎹 guitar:🎸 band:🎺 paint:🎨 picture:🖼️ clay:🏺 dance:💃'),
  ...bank('verb', 'moving', 'walk jog skip leap twirl bend stretch kick throw catch roll bounce float sink fly crawl tiptoe stomp wiggle wobble'),
  ...bank('verb', 'sports and play', 'play kick throw catch swing slide build win race score dribble bat pitch splash'),
  ...bank('verb', 'saying', 'say tell ask call sing hum laugh giggle cry scream roar bark meow buzz chirp quack honk growl'),
  ...bank('verb', 'senses', 'see look watch hear listen smell sniff taste feel touch'),
  ...bank('verb', 'cooking', 'cook bake mix stir pour cut chop peel boil fry melt toast'),
  ...bank('verb', 'school and thinking', 'read write draw spell count add learn know think remember forget guess plan solve find'),
  ...bank('verb', 'everyday', 'wake wash brush dress eat drink rest nap sleep dream clean sweep help share give take open close shut fill empty carry lift push pull'),
  ...bank('adjective', 'size', 'little large giant wide narrow deep shallow fat skinny'),
  ...bank('adjective', 'colour', 'blue yellow orange purple gray gold silver'),
  ...bank('adjective', 'shape and texture', 'round flat square pointy bumpy fluffy fuzzy sticky slimy rough soft hard smooth shiny'),
  ...bank('adjective', 'weather', 'sunny rainy windy snowy cloudy foggy stormy chilly warm hot cold'),
  ...bank('adjective', 'feelings', 'proud shy scared brave calm cross cheerful lonely excited tired bored curious'),
  ...bank('adjective', 'taste and smell', 'sweet sour salty bitter spicy yummy stinky fresh'),
  ...bank('adjective', 'how many', 'one two three few many lots some all every each both no'),
  ...bank('adjective', 'how it is', 'new old clean dirty full empty open shut wet dry loud quiet easy hard right wrong'),
  ...bank('adverb', 'how', 'gently carefully kindly bravely happily quietly neatly'),
  ...bank('adverb', 'when', 'now then soon later today tomorrow yesterday always never often sometimes'),
  ...bank('adverb', 'where', 'here there up down inside outside away home'),
  ...bank('little', 'little words', 'the a an and but in on at of to with for from up'),
].filter((w, i, all) => all.findIndex((x) => x.word === w.word && x.pos === w.pos && x.category === w.category) === i)

export const BANK_BY_WORD = new Map<string, BankWord>()
for (const w of WORD_BANK) if (!BANK_BY_WORD.has(w.word)) BANK_BY_WORD.set(w.word, w)

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
  v('adapt', 'verb', 'to change to fit a new place or problem', 'Animals adapt to the cold. | We adapted our plan when it rained.'),
  v('hibernation', 'noun', 'a deep winter rest that saves energy', 'Bears go into hibernation. | Hibernation lasts all winter.', { tier: 3, subject: 'science' }),
  v('migration', 'noun', 'a long trip animals make when the seasons change', 'The migration of geese is amazing. | Whales make a long migration.', { tier: 3, subject: 'science' }),
  v('energy', 'noun', 'the power needed to move, grow or work', 'Food gives us energy. | The sun sends energy to Earth.', { tier: 3, subject: 'science' }),
  v('lantern', 'noun', 'a lamp you can carry', 'We hung a lantern in the tent. | The lantern glowed orange.'),
  v('detective', 'noun', 'a person who looks for clues to solve a mystery', 'The detective found a footprint. | Be a word detective!'),
  v('relief', 'noun', 'the good feeling when a worry is over', 'What a relief to find my shoe! | She sighed with relief.'),
  v('cozy', 'adjective', 'warm, soft and comfortable', 'The cat curled up in a cozy bed. | It is cozy by the fire.', { synonyms: ['snug', 'comfy'] }),
  v('gloomy', 'adjective', 'dark and a bit sad', 'It was a gloomy, rainy day. | The cave was gloomy.', { synonyms: ['dull', 'dim'], antonyms: ['bright', 'cheerful'] }),
  v('cheerful', 'adjective', 'happy and full of good feeling', 'She gave a cheerful wave. | The room was bright and cheerful.', { synonyms: ['happy', 'jolly'], antonyms: ['gloomy'] }),
  v('clumsy', 'adjective', 'often bumping into or dropping things', 'The clumsy puppy tripped over its paws. | I felt clumsy on skates.', { antonyms: ['graceful'] }),
  v('graceful', 'adjective', 'moving in a smooth and beautiful way', 'The swan is graceful. | She did a graceful spin.', { antonyms: ['clumsy'] }),
  v('generous', 'adjective', 'happy to give and share', 'It was generous to share your snack. | Grandpa is very generous.', { synonyms: ['kind', 'giving'], antonyms: ['selfish'] }),
  v('patient', 'adjective', 'able to wait calmly', 'Be patient while the cake bakes. | A patient fisher waits all day.', { antonyms: ['impatient'] }),
  v('honest', 'adjective', 'telling the truth', 'An honest friend tells you the truth. | Please give an honest answer.', { synonyms: ['truthful'] }),
  v('determined', 'adjective', 'not giving up, even when it is hard', 'She was determined to finish the race. | The determined ant carried the crumb.', { synonyms: ['stubborn', 'keen'] }),
  v('anxious', 'adjective', 'worried about what might happen', 'I felt anxious before my test. | The anxious dog paced up and down.', { synonyms: ['nervous', 'worried'], antonyms: ['calm'] }),
  v('astonished', 'adjective', 'very, very surprised', 'We were astonished by the magic trick. | He looked astonished.', { synonyms: ['amazed', 'surprised'] }),
  v('dash', 'verb', 'to run very quickly for a short way', 'Dash to the door! | The mouse dashed under the bed.', { synonyms: ['rush', 'sprint'] }),
  v('tumble', 'verb', 'to fall over and roll', 'The puppies tumble in the grass. | The apples tumbled out of the bag.'),
  v('peer', 'verb', 'to look closely because it is hard to see', 'We peered into the dark cave. | She peered through the fog.', { synonyms: ['peek', 'squint'] }),
  v('gaze', 'verb', 'to look at something for a long time', 'We gazed at the stars. | The cat gazed at the fish tank.', { synonyms: ['stare'] }),
  v('whisper', 'verb', 'to speak very softly', 'Whisper the secret to me. | The leaves whispered in the wind.', { antonyms: ['shout'] }),
  v('mutter', 'verb', 'to speak quietly and unclearly, often when cross', 'He muttered under his breath. | Stop muttering and speak up!', { synonyms: ['mumble'] }),
  v('soar', 'verb', 'to fly high in the air', 'Eagles soar over the mountains. | Our kite soared up.', { synonyms: ['glide', 'fly'] }),
  v('crumble', 'verb', 'to break into small pieces', 'The cookie crumbled in my hand. | Old walls crumble.'),
  v('vast', 'adjective', 'very, very wide or big', 'The ocean is vast. | A vast desert stretched ahead.', { synonyms: ['huge', 'enormous'], antonyms: ['tiny'] }),
  v('ordinary', 'adjective', 'normal, nothing special', 'It was an ordinary Tuesday. | An ordinary rock turned out to be a fossil.', { antonyms: ['unusual', 'peculiar'] }),
  v('fossil', 'noun', 'the shape of a very old plant or animal kept in rock', 'We found a fossil of a shell. | Dinosaur fossils are millions of years old.', { tier: 3, subject: 'science' }),
  v('desert', 'noun', 'a very dry place with little rain', 'Camels live in the desert. | The desert is hot by day and cold at night.', { tier: 3, subject: 'geography' }),
  v('continent', 'noun', 'one of the seven very large areas of land on Earth', 'Africa is a continent. | We live on the continent of North America.', { tier: 3, subject: 'geography' }),
  v('equal', 'adjective', 'the same in size, number or amount', 'Cut the cake into equal pieces. | Two plus two is equal to four.', { tier: 3, subject: 'maths' }),
  v('measure', 'verb', 'to find out the size or amount of something', 'Measure the table with a ruler. | We measure rain in a jar.', { tier: 3, subject: 'maths' }),
  v('pattern', 'noun', 'something that repeats in a regular way', 'Red, blue, red, blue is a pattern. | Zebras have a striped pattern.', { tier: 3, subject: 'maths' }),
  v('rhythm', 'noun', 'a regular beat in music or words', 'Clap the rhythm of the song. | Poems have rhythm.', { tier: 3, subject: 'arts' }),
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
  { words: ['for', 'four'], sentences: [
    { text: 'A dog has ___ legs.', answer: 'four' },
    { text: 'This gift is ___ you.', answer: 'for' },
  ] },
  { words: ['one', 'won'], sentences: [
    { text: 'I have ___ brother.', answer: 'one' },
    { text: 'Our team ___ the game!', answer: 'won' },
  ] },
  { words: ['blue', 'blew'], sentences: [
    { text: 'The sky is ___.', answer: 'blue' },
    { text: 'The wind ___ my hat away.', answer: 'blew' },
  ] },
  { words: ['sun', 'son'], sentences: [
    { text: 'The ___ is hot today.', answer: 'sun' },
    { text: 'The king had a ___ and a daughter.', answer: 'son' },
  ] },
  { words: ['ate', 'eight'], sentences: [
    { text: 'A spider has ___ legs.', answer: 'eight' },
    { text: 'I ___ all my peas.', answer: 'ate' },
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
  { label: 'How cold?', words: ['cool', 'chilly', 'cold', 'freezing'] },
  { label: 'How tired?', words: ['sleepy', 'tired', 'weary', 'exhausted'] },
  { label: 'How good?', words: ['okay', 'good', 'great', 'amazing'] },
  { label: 'How surprised?', words: ['surprised', 'amazed', 'astonished'] },
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
  { sentence: 'The clumsy puppy tripped over its own paws and knocked over the bowl.', word: 'clumsy', options: ['often tripping or dropping things', 'very fast', 'very quiet'], answer: 0, clue: 'tripped over its own paws' },
  { sentence: 'The desert was so vast that we walked all day and still could not see the end.', word: 'vast', options: ['very small', 'very wide and big', 'very wet'], answer: 1, clue: 'walked all day and still could not see the end' },
  { sentence: 'Grandpa is generous; he always shares his snacks and gives gifts.', word: 'generous', options: ['happy to give and share', 'grumpy', 'very old'], answer: 0, clue: 'shares his snacks and gives gifts' },
  { sentence: 'We were astonished when the tiny seed grew into a giant sunflower overnight.', word: 'astonished', options: ['bored', 'very surprised', 'sleepy'], answer: 1, clue: 'tiny seed grew into a giant sunflower overnight' },
  { sentence: 'Be patient: the cookies need ten more minutes, so please wait calmly.', word: 'patient', options: ['able to wait calmly', 'very hungry', 'in a hurry'], answer: 0, clue: 'please wait calmly' },
  { sentence: 'We peered into the dark cave, trying hard to see what was inside.', word: 'peered', options: ['looked closely', 'ran away', 'shouted'], answer: 0, clue: 'trying hard to see' },
]

/** Nonsense words for "Real or Alien?" are made from these spellings. */
export const ALIEN_PARTS = {
  onsets: list('b d f g h j k l m n p r s t v w z ch sh th st sp tr fl gr bl cr'),
  vowels: list('a e i o u'),
  codas: list('b d g m n p t x ck sh ng nd st mp'),
}
