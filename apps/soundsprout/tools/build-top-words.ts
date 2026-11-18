// npm run top-words -- <path to en_50k.txt from github.com/hermitdave/FrequencyWords>
// Builds content/top-words.json: the 1,000 most frequent English words (OpenSubtitles 2018
// counts), filtered for children: words in the pronouncing dictionary, no adult or violent
// words, no interjections or sound effects, no names, no contraction fragments.
// Source data: FrequencyWords by Hermit Dave, content licensed CC BY-SA 4.0.
import { readFileSync, writeFileSync } from 'node:fs'

const BLOCK = new Set(`
kill killed killing killer kills dead die died dies dying death murder gun guns shoot shot shooting blood bloody
hell damn shit fuck fucking fuckin bitch ass asshole bastard sex sexy god jesus christ lord holy heaven devil evil
drunk drink drinking drinks beer wine drugs drug crap goddamn bullshit dick gay pregnant victim prison jail cops cop
police crime criminal attack weapon bomb army war battle enemy destroy steal stole suspect guilty witness court lawyer
judge detective agent sergeant lieutenant colonel captain commander officer chief president government military
security arrest evidence fight fighting fights dangerous kiss marry married marriage wife husband girlfriend boyfriend
relationship darling honey sweetheart dude guys guy yeah okay ok gonna wanna gotta yo ya ha hmm huh uh um er ah oh ooh
ow whoa wow eh mm hey hi bye shh yep em ma la de sighs laughs chuckles laughing laughter grunts grunting gasps groans
screaming applause cheering cheers ringing continues narrator sir madam mr mrs lady ladies gentlemen majesty idiot
stupid fool shut hate kidding cool awesome weird crazy tv smoke hurt involved deal dare upset
john jack sam michael george david frank joe charlie mike tom peter paul mary ben james harry bob henry max danny nick
alex jim jimmy steve adam ray sarah richard billy lee jane johnny tommy tony paris london york america american
english french german christmas
don aren haven isn doesn didn couldn wasn shouldn wouldn won ll ve re
`.trim().split(/\s+/))

const [freqPath, countArg] = process.argv.slice(2)
if (!freqPath) {
  console.error('usage: npm run top-words -- <en_50k.txt> [count=1000]')
  process.exit(1)
}
const count = Number(countArg ?? 1000)
const dir = new URL('../', import.meta.url)
const cmu = new Set(readFileSync(new URL('public/dict/cmudict.dict', dir), 'utf8').split('\n').map((l) => l.split(' ')[0].replace(/\(\d+\)$/, '')))
const words: { word: string; rank: number; count: number }[] = []
for (const line of readFileSync(freqPath, 'utf8').split('\n')) {
  const [w, c] = line.trim().split(/\s+/)
  if (!w || !/^[a-z]+$/.test(w) || !cmu.has(w) || BLOCK.has(w)) continue
  if (w.length === 1 && w !== 'a' && w !== 'i') continue
  words.push({ word: w === 'i' ? 'I' : w, rank: words.length + 1, count: Number(c) })
  if (words.length >= count) break
}
writeFileSync(new URL('content/top-words.json', dir), JSON.stringify({
  source: 'FrequencyWords (Hermit Dave), OpenSubtitles 2018 English counts, CC BY-SA 4.0; filtered for children by SoundSprout',
  url: 'https://github.com/hermitdave/FrequencyWords',
  license: 'CC BY-SA 4.0',
  words,
}))
console.log(`Wrote ${words.length} words → content/top-words.json`)
