// Sprout games: Sound Pop, Word Builder, Real or Alien?, Syllable Chop, Silly Sentences, Word Sort.
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ALIEN_PARTS, BANK_BY_WORD, POS_LABEL, WORD_BANK, type Pos } from '../data/words'
import { GRAPHEME_BY_ID } from '../engine/graphemes'
import { syllabify } from '../engine/syllables'
import { playPhones, speak } from '../app/audio'
import { COMMON, useDecoder } from '../app/engine'
import { decodableWords, playInventory, sample, shuffle } from '../app/pick'
import { useStore, type Profile } from '../app/store'
import { Empty } from '../ui/kit'
import { Tiles } from '../ui/Tiles'
import { GameShell, useRounds } from './shell'

const needMore = <Empty>Getting the words ready…</Empty>

export function SoundPop({ profile }: { profile: Profile }) {
  const game = useRounds()
  const practise = useStore((s) => s.practise)
  const known = [...playInventory(profile).graphemes].filter((g) => GRAPHEME_BY_ID.get(g) && !g.includes('('))
  const round = useMemo(() => {
    const target = sample(known, 1)[0]
    const options = shuffle([target, ...sample(known.filter((g) => g !== target && GRAPHEME_BY_ID.get(g)!.letters !== GRAPHEME_BY_ID.get(target)!.letters), 4)])
    return { target, options }
  }, [game.round]) // eslint-disable-line react-hooks/exhaustive-deps
  const say = () => {
    const g = GRAPHEME_BY_ID.get(round.target)!
    playPhones(g.sounds[0], profile.settings.computerVoiceForSounds).then((ok) => { if (!ok) speak(`${g.letters}, as in ${g.example}`) })
  }
  useEffect(() => {
    if (round.target && !game.done) say()
  }, [round]) // eslint-disable-line react-hooks/exhaustive-deps
  if (known.length < 4) return <GameShell title="Sound Pop" help="" game={game}>{needMore}</GameShell>
  return (
    <GameShell title="Sound Pop" help="Listen to the sound, then pop the bubble that makes it." game={game}>
      <div className="text-center"><button className="btn" onClick={say}>🔊 Hear the sound</button></div>
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        {round.options.map((g, i) => (
          <motion.button key={g + i} animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2 + i * 0.3 }}
            className="read flex h-24 w-24 items-center justify-center rounded-full text-4xl font-extrabold shadow-lg"
            style={{ background: 'radial-gradient(circle at 30% 30%, #fff, #bae6fd)', color: '#0c4a6e' }}
            onClick={() => {
              const ok = g === round.target
              practise(profile.id, round.target, ok)
              game.answer(ok, ok ? undefined : `That says ${GRAPHEME_BY_ID.get(g)!.letters} as in ${GRAPHEME_BY_ID.get(g)!.example}.`)
            }}>
            {GRAPHEME_BY_ID.get(g)!.letters.replace('_', '-')}
          </motion.button>
        ))}
      </div>
    </GameShell>
  )
}

export function WordBuilder({ profile }: { profile: Profile }) {
  const decoder = useDecoder()
  const game = useRounds()
  const practise = useStore((s) => s.practise)
  const words = useMemo(() => (decoder ? decodableWords(decoder, playInventory(profile), { maxSyllables: 1 }).filter((w) => w.length >= 3) : []), [decoder, profile])
  const round = useMemo(() => {
    if (!decoder || !words.length) return null
    const word = sample(words, 1)[0]
    const tiles = decoder.decode(word, playInventory(profile)).tiles.filter((t) => t.type !== 'silent')
    const pieces = tiles.map((t) => (t.type === 'split' ? `${t.text}_e` : t.text.toLowerCase()))
    const extras = sample([...playInventory(profile).graphemes].map((g) => GRAPHEME_BY_ID.get(g)?.letters).filter((l): l is string => !!l && !pieces.includes(l)), 3)
    return { word, pieces, bank: shuffle([...pieces, ...extras]) }
  }, [decoder, words, game.round]) // eslint-disable-line react-hooks/exhaustive-deps
  const [built, setBuilt] = useState<number[]>([])
  useEffect(() => setBuilt([]), [round])
  useEffect(() => {
    if (round) speak(round.word, { rate: profile.settings.speechRate })
  }, [round]) // eslint-disable-line react-hooks/exhaustive-deps
  if (!round) return <GameShell title="Word Builder" help="" game={game}>{needMore}</GameShell>
  const attempt = built.map((i) => round.bank[i])
  const check = () => {
    const ok = attempt.join('|') === round.pieces.join('|')
    practise(profile.id, `spell:${round.word}`, ok)
    game.answer(ok, ok ? `Yes! ${round.word}` : `It is ${round.pieces.join(' - ')}: ${round.word}.`)
  }
  return (
    <GameShell title="Word Builder" help="Listen to the word. Build it with sound tiles, one sound per tile." game={game}>
      <div className="text-center"><button className="btn" onClick={() => speak(round.word)}>🔊 Hear the word</button></div>
      <div className="read mt-6 flex min-h-[5rem] flex-wrap justify-center gap-2 rounded-3xl border-4 border-dashed p-3 text-4xl font-extrabold" style={{ borderColor: 'var(--line)' }}>
        {round.pieces.map((_, k) => (
          <button key={k} className="tile t-consonant min-w-[3rem]" onClick={() => setBuilt(built.filter((_, j) => j !== k))}>
            {attempt[k] ?? ' '}
          </button>
        ))}
      </div>
      <div className="read mt-6 flex flex-wrap justify-center gap-3 text-3xl font-extrabold">
        {round.bank.map((p, i) => (
          <button key={i} className="tile t-digraph" disabled={built.includes(i)} style={{ opacity: built.includes(i) ? 0.3 : 1 }}
            onClick={() => built.length < round.pieces.length && setBuilt([...built, i])}>{p}</button>
        ))}
      </div>
      <div className="mt-6 text-center">
        <button className="btn" disabled={built.length !== round.pieces.length || !!game.feedback} onClick={check}>Check</button>
      </div>
    </GameShell>
  )
}

export function RealOrAlien({ profile }: { profile: Profile }) {
  const decoder = useDecoder()
  const game = useRounds()
  const practise = useStore((s) => s.practise)
  const inv = playInventory(profile)
  const round = useMemo(() => {
    if (!decoder) return null
    const real = decodableWords(decoder, inv, { maxSyllables: 1 }).filter((w) => w.length >= 3)
    const can = (s: string) => [...playInventory(profile).graphemes].includes(s)
    const onsets = ALIEN_PARTS.onsets.filter((o) => [...o].every((c) => can(c)) || can(o))
    const vowels = ALIEN_PARTS.vowels.filter(can)
    const codas = ALIEN_PARTS.codas.filter((o) => can(o) || [...o].every((c) => can(c)))
    if (real.length < 3 || !onsets.length || !vowels.length || !codas.length) return null
    let alien = ''
    for (let i = 0; i < 40; i++) {
      const w = sample(onsets, 1)[0] + sample(vowels, 1)[0] + sample(codas, 1)[0]
      if (!decoder.lexicon.has(w) && !COMMON.has(w)) {
        alien = w
        break
      }
    }
    const isReal = Math.random() < 0.5 || !alien
    return { word: isReal ? sample(real, 1)[0] : alien, isReal }
  }, [decoder, game.round]) // eslint-disable-line react-hooks/exhaustive-deps
  if (!round || !decoder) return <GameShell title="Real or Alien?" help="" game={game}>{needMore}</GameShell>
  const d = decoder.explain(round.word)
  const choose = (real: boolean) => {
    const ok = real === round.isReal
    practise(profile.id, 'skill:nonsense', ok)
    game.answer(ok, round.isReal ? `${round.word} is a real word!` : `${round.word} is an alien word. Zorp!`)
  }
  return (
    <GameShell title="Real or Alien?" help="Sound out the word. Is it a real word, or an alien word?" game={game}>
      <Tiles tiles={d.tiles} onTap={(i) => playPhones(d.tiles[i].phones, profile.settings.computerVoiceForSounds)} />
      <div className="mt-6 flex justify-center gap-4">
        <button className="btn text-xl" onClick={() => choose(true)}>🌍 Real</button>
        <button className="btn-ghost text-xl" onClick={() => choose(false)}>👽 Alien</button>
      </div>
    </GameShell>
  )
}

export function SyllableChop({ profile }: { profile: Profile }) {
  const decoder = useDecoder()
  const game = useRounds()
  const practise = useStore((s) => s.practise)
  const all = { graphemes: new Set([...[...playInventory(profile).graphemes]]), skills: new Set(['syl2', 'syl3', 'schwa']), heart: new Set<string>() }
  const words = useMemo(() => (decoder ? decodableWords(decoder, all, { minSyllables: 2 }) : []), [decoder]) // eslint-disable-line react-hooks/exhaustive-deps
  const round = useMemo(() => {
    if (!decoder || !words.length) return null
    const word = sample(words, 1)[0]
    const d = decoder.explain(word)
    const syl = syllabify(d.word, d.tiles, (w) => COMMON.has(w))
    return { word, cuts: syl.slice(1).map((s) => s.start) }
  }, [decoder, words, game.round])
  const [cuts, setCuts] = useState<number[]>([])
  useEffect(() => setCuts([]), [round])
  if (!round) return <GameShell title="Syllable Chop" help="" game={game}>{needMore}</GameShell>
  const toggle = (i: number) => setCuts(cuts.includes(i) ? cuts.filter((x) => x !== i) : [...cuts, i].sort((a, b) => a - b))
  const check = () => {
    const ok = cuts.join() === round.cuts.join()
    practise(profile.id, 'skill:syllables', ok)
    const parts: string[] = []
    let last = 0
    for (const c of [...round.cuts, round.word.length]) {
      parts.push(round.word.slice(last, c))
      last = c
    }
    game.answer(ok, ok ? `Chop! ${parts.join(' | ')}` : `It chops into ${parts.join(' | ')}. Clap it: ${parts.map(() => '👏').join(' ')}`)
  }
  return (
    <GameShell title="Syllable Chop" help="Tap between letters to chop the word into syllables. Clap it out first!" game={game}>
      <div className="read flex justify-center text-5xl font-extrabold">
        {[...round.word].map((ch, i) => (
          <span key={i} className="flex items-center">
            {i > 0 && (
              <button aria-label={`chop before ${ch}`} className="mx-0.5 h-14 w-4 rounded" style={{ background: cuts.includes(i) ? 'var(--t-short)' : 'transparent', border: '1px dashed var(--line)' }} onClick={() => toggle(i)} />
            )}
            {ch}
          </span>
        ))}
      </div>
      <div className="mt-6 flex justify-center gap-3">
        <button className="btn-ghost" onClick={() => speak(round.word, { rate: 0.6 })}>🔊 Hear it slowly</button>
        <button className="btn" onClick={check} disabled={!!game.feedback}>🔪 Chop!</button>
      </div>
    </GameShell>
  )
}

export function SillySentences({ profile }: { profile: Profile }) {
  const decoder = useDecoder()
  const game = useRounds()
  const inv = playInventory(profile)
  const ok = (w: string) => !!decoder && decoder.readable(decoder.decode(w, inv))
  const lists = useMemo(() => {
    const byPos = (p: Pos) => WORD_BANK.filter((w) => w.pos === p && ok(w.word)).map((w) => w.word)
    return { adjective: byPos('adjective'), noun: byPos('noun'), verb: byPos('verb') }
  }, [decoder, profile]) // eslint-disable-line react-hooks/exhaustive-deps
  const [reel, setReel] = useState<{ adjective: string; noun: string; verb: string } | null>(null)
  const spin = () => setReel({ adjective: sample(lists.adjective, 1)[0], noun: sample(lists.noun, 1)[0], verb: sample(lists.verb, 1)[0] })
  useEffect(() => setReel(null), [game.round])
  if (!lists.adjective.length || !lists.noun.length || !lists.verb.length) return <GameShell title="Silly Sentences" help="" game={game}>{needMore}</GameShell>
  const verb3 = (v: string) => (/(s|sh|ch|x|z)$/.test(v) ? v + 'es' : v + 's')
  const sentence = reel && `The ${reel.adjective} ${reel.noun} ${verb3(reel.verb)}.`
  return (
    <GameShell title="Silly Sentences" help="Spin the reels: a describing word, a naming word and a doing word. Then read your silly sentence!" game={game}>
      <div className="grid grid-cols-3 gap-3 text-center">
        {(['adjective', 'noun', 'verb'] as const).map((p) => (
          <div key={p} className="panel rounded-3xl p-3">
            <div className="text-sm font-bold">{POS_LABEL[p].icon} {POS_LABEL[p].label}</div>
            <motion.div key={reel?.[p]} initial={{ rotateX: 90 }} animate={{ rotateX: 0 }} className="read mt-2 text-2xl font-extrabold">
              {reel?.[p] ?? '?'}
            </motion.div>
            {p === 'noun' && reel && <div className="text-4xl">{BANK_BY_WORD.get(reel.noun)?.emoji}</div>}
          </div>
        ))}
      </div>
      {sentence && <p className="read mt-6 text-center text-3xl font-extrabold">{sentence}</p>}
      <div className="mt-6 flex justify-center gap-3">
        <button className="btn" onClick={spin}>🎰 Spin</button>
        {sentence && <button className="btn-ghost" onClick={() => game.answer(true, 'Ha! What a silly sentence.')}>I read it!</button>}
      </div>
    </GameShell>
  )
}

export function WordSort({ profile }: { profile: Profile }) {
  const decoder = useDecoder()
  const game = useRounds()
  const practise = useStore((s) => s.practise)
  const inv = playInventory(profile)
  const explorer = profile.band === 'explorer'
  const pool = useMemo(
    () => WORD_BANK.filter((w) => ['noun', 'verb', 'adjective', ...(explorer ? ['adverb'] : [])].includes(w.pos) && (!decoder || decoder.readable(decoder.decode(w.word, inv)))),
    [decoder, profile], // eslint-disable-line react-hooks/exhaustive-deps
  )
  const word = useMemo(() => sample(pool, 1)[0], [pool, game.round])
  if (!word) return <GameShell title="Word Sort" help="" game={game}>{needMore}</GameShell>
  const baskets: Pos[] = explorer ? ['noun', 'verb', 'adjective', 'adverb'] : ['noun', 'verb', 'adjective']
  return (
    <GameShell title="Word Sort" help="Is it a naming word, a doing word or a describing word? Put it in the right basket." game={game}>
      <div className="read text-center text-5xl font-extrabold">{word.word} <span aria-hidden>{word.emoji}</span></div>
      <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {baskets.map((b) => (
          <button key={b} className="panel rounded-3xl p-4 text-center" onClick={() => {
            const ok = b === word.pos
            practise(profile.id, `pos:${word.pos}`, ok)
            game.answer(ok, ok ? `Yes, ${word.word} is a ${POS_LABEL[b].label.toLowerCase()}.` : `${word.word} is a ${POS_LABEL[word.pos].label.toLowerCase()}: ${POS_LABEL[word.pos].help}`)
          }}>
            <div className="text-4xl">🧺</div>
            <div className="font-extrabold">{POS_LABEL[b].icon} {POS_LABEL[b].label}</div>
            <div className="muted text-xs">{POS_LABEL[b].help}</div>
          </button>
        ))}
      </div>
    </GameShell>
  )
}
