// Practice words and sentences (original). Lessons and games filter these by what
// each child can decode, so one pool serves every step.

export const PRACTICE_WORDS = `
at as sat pat tap sap pit sit tip pip nap pan pin tin man mat map dip did mad dad sad
dig got pot top cot cat can cap kit kid dog god cod pop mop not dot pod tag nag gap gas
duck neck sock rock kick pick sack back deck rug run sun bun cup up mud red rip rat pet
ten net men bed get leg peg hen hat him hop hug bad bat big bus bin fan fin fog fun off
puff huff lip log lot lap lid bell doll fill hill sell less mess boss kiss fuss miss
jam jet jog van vet wet win wig box fox fix six yes yet yap zip zap buzz fizz quiz quit quick
chip chop chin rich much ship shop shed fish dish wish rush thin thick moth bath with then that this
ring king sing song long hang bang pink sink wink bank think thank
rain tail mail wait paid feet seed see tree bee keep need night light high might fight
boat coat goat road soap moon soon food zoo cool book look cook good foot wood
car farm park star jar dark fork corn horn sport fur turn hurt burn her term fern cow now how down town
coin oil boil join ear hear near dear fair hair pair chair
day play say may stay out shout loud cloud pie tie lie sea tea eat meat boy toy joy bird girl first
blue glue true saw paw claw jaw when which whip phone graph new few chew grew
cake make lake game name gate these theme bike kite time ride hide like home bone rope nose cube tune huge
jumped helped looked lived filled played wanted needed landed liked baked hoped
happy funny sunny my fly cry try sky table little apple bubble snow grow slow show head bread
rabbit kitten muffin dinner hammer carrot puppet sunset cupcake picnic basket dragon wagon lemon tiger robot
baby even open music city cell gem giant prince large cheese bridge match knot write lamb sign
station action nation vision magician nature picture famous animal
school chef key eight vein author caught thought sour care more door fruit laugh field son want word put learn
`.trim().split(/\s+/)

export const PRACTICE_SENTENCES = `
Pip sat.
Tap, tap, tap.
Sam is at the mat.
A cat can nap.
Dad got a pot.
The dog sat on a mop.
A duck is in the mud.
Get up, Ben! It is ten.
The red bus is fun.
Huff and puff on the hill.
The fox is in a box.
Jen has a big red jet.
A quick quiz is fun.
The fish is in the dish.
Chip and Chop sit on the ship.
I think the king can sing a long song.
Thank you for the pink ring.
Wait for the rain to stop.
The goat is on the road.
Look at the moon at night.
A bee is on the tree.
The cow is in the dark barn.
The girl had a fork and a spoon.
Turn left at the park.
Play with the boy and his toy.
We saw a cloud in the blue sky.
The cat hid in the cake box.
Ride the bike up the hill.
I like the kite on a rope.
She jumped and landed in the sand.
We played until it got dark.
The little rabbit hopped into the garden.
A sunny day is a happy day.
The tiger had a nap in the sun.
The giant ate a huge cake at the city gate.
The magician did a trick at the station.
The famous chef made a picture with fruit.
Our school has a key for each door.
`.trim().split('\n')

/** Sentences for Sentence Upgrade: [plain, slot, choices]. */
export const UPGRADES: { plain: string; slot: string; kind: 'adjective' | 'adverb' | 'conjunction'; choices: string[]; template: string }[] = [
  { plain: 'The dog ran.', slot: 'adverb', kind: 'adverb', choices: ['quickly', 'happily', 'slowly'], template: 'The dog ran {x}.' },
  { plain: 'A cat sat on the mat.', slot: 'adjective', kind: 'adjective', choices: ['fluffy', 'sleepy', 'grumpy'], template: 'A {x} cat sat on the mat.' },
  { plain: 'We went home. It was raining.', slot: 'conjunction', kind: 'conjunction', choices: ['because', 'and', 'so'], template: 'We went home {x} it was raining.' },
  { plain: 'The ship sailed.', slot: 'adjective', kind: 'adjective', choices: ['enormous', 'tiny', 'rusty'], template: 'The {x} ship sailed.' },
  { plain: 'She whispered.', slot: 'adverb', kind: 'adverb', choices: ['softly', 'nervously', 'gently'], template: 'She whispered {x}.' },
]
