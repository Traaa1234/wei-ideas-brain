// Explorer games: Word Lab, Root Detective, Context Clue Case, Shades of Meaning,
// Homophone Hero, Sentence Upgrade, Spelling Bee.
import { useEffect, useMemo, useState } from 'react'
import { CONTEXT_CLUES, HOMOPHONES, SHADES, VOCAB_BY_WORD } from '../data/words'
import { UPGRADES } from '../data/practice'
import { MORPHEMES } from '../engine/morphology'
import { speak } from '../app/audio'
import { COMMON, useDecoder } from '../app/engine'
import { decodableWords, playInventory, sample, shuffle } from '../app/pick'
import { useStore, type Profile } from '../app/store'
import { Tiles } from '../ui/Tiles'
import { GameShell, useRounds } from './shell'

const LAB = {
  prefix: ['un', 're', 'pre', 'dis', 'mis', 'over', 'sub', 'trans', 'super', 'tele', 'micro'],
  base: ['port', 'happy', 'kind', 'play', 'help', 'read', 'load', 'paint', 'build', 'phone', 'scope', 'marine', 'way', 'star', 'cook', 'spell', 'agree', 'view', 'heat', 'form', 'hero', 'market', 'like'],
  suffix: ['', 'er', 'ing', 'ed', 'ful', 'less', 'able', 'ness', 'ly', 's', 'ation'],
}
const SILLY = ['a word only a dragon would say', 'a snack for space robots', 'the sound a teapot makes when it is bored', 'a dance for jellyfish']

export function WordLab({ profile }: { profile: Profile }) {
  const decoder = useDecoder()
  const game = useRounds()
  const practise = useStore((s) => s.practise)
  const [pick, setPick] = useState({ prefix: '', base: 'play', suffix: '' })
  const [made, setMade] = useState<string[]>([])
  const word = pick.prefix + pick.base + pick.suffix
  const real = !!decoder && COMMON.has(word) || (!!decoder && decoder.lexicon.has(word) && word.length > 4)
  const meaning = () => {
    const parts = [pick.prefix, pick.suffix].filter(Boolean).map((f) => MORPHEMES.find((m) => m.form === f)).filter(Boolean)
    return parts.map((m) => `${m!.form} = ${m!.meaning}`).join('; ')
  }
  return (
    <GameShell title="Word Lab" help="Mix a prefix, a base and a suffix. Real words score; made-up ones get a silly meaning." game={game}>
      {(['prefix', 'base', 'suffix'] as const).map((k) => (
        <div key={k} className="mb-3">
          <div className="text-sm font-bold capitalize">{k}</div>
          <div className="mt-1 flex flex-wrap gap-2">
            {LAB[k].map((x) => (
              <button key={x || 'none'} className={pick[k] === x ? 'btn !min-h-0 !py-2' : 'btn-ghost !min-h-0 !py-2'} onClick={() => setPick({ ...pick, [k]: x })}>
                {x || '—'}
              </button>
            ))}
          </div>
        </div>
      ))}
      <div className="panel mt-4 rounded-3xl p-4 text-center">
        <div className="read text-4xl font-extrabold">{word}</div>
        <p className="muted mt-1 text-sm">{meaning()}</p>
        <button className="btn mt-3" disabled={!!game.feedback} onClick={() => {
          practise(profile.id, 'skill:morphology', real)
          if (real) setMade([...new Set([...made, word])])
          game.answer(real, real ? `${word} is a real word!` : `Not a real word… but it could mean ${sample(SILLY, 1)[0]}.`)
        }}>🧪 Test it</button>
      </div>
      {made.length > 0 && <p className="mt-4 text-sm"><b>Words you made:</b> {made.join(', ')}</p>}
    </GameShell>
  )
}

export function RootDetective({ profile }: { profile: Profile }) {
  const game = useRounds()
  const practise = useStore((s) => s.practise)
  const roots = MORPHEMES.filter((m) => m.kind === 'root' && m.examples.length >= 2)
  const round = useMemo(() => {
    const target = sample(roots, 1)[0]
    const options = shuffle([target.meaning, ...sample(roots.filter((r) => r.meaning !== target.meaning), 2).map((r) => r.meaning)])
    return { target, options }
  }, [game.round]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <GameShell title="Root Detective" help="These words share a secret root. What does the root mean?" game={game}>
      <div className="flex flex-wrap justify-center gap-2">
        {round.target.examples.map((w) => (
          <span key={w} className="read panel rounded-2xl px-3 py-2 text-2xl font-extrabold">
            {w.split(round.target.form).map((part, i, arr) => (
              <span key={i}>{part}{i < arr.length - 1 && <mark className="rounded bg-amber-200 px-0.5 text-amber-900">{round.target.form}</mark>}</span>
            ))}
          </span>
        ))}
      </div>
      <p className="mt-6 text-center text-lg">🔎 The root <b>{round.target.form}</b> means…</p>
      <div className="mt-3 flex flex-wrap justify-center gap-3">
        {round.options.map((o) => (
          <button key={o} className="btn-ghost" onClick={() => {
            const ok = o === round.target.meaning
            practise(profile.id, `root:${round.target.form}`, ok)
            game.answer(ok, `${round.target.form} means “${round.target.meaning}” (${round.target.origin}).`)
          }}>{o}</button>
        ))}
      </div>
    </GameShell>
  )
}

export function ContextClue({ profile }: { profile: Profile }) {
  const game = useRounds()
  const practise = useStore((s) => s.practise)
  const order = useMemo(() => shuffle(CONTEXT_CLUES), [])
  const item = order[game.round % order.length]
  const parts = item.sentence.split(item.word)
  return (
    <GameShell title="Context Clue Case" help="Read the sentence. Use the other words to work out what the bold word means." game={game}>
      <p className="read panel rounded-3xl p-4 text-2xl leading-relaxed">
        {parts[0]}<b className="underline">{item.word}</b>{parts.slice(1).join(item.word)}
      </p>
      <div className="mt-4 flex flex-col gap-2">
        {item.options.map((o, i) => (
          <button key={o} className="btn-ghost text-left" onClick={() => {
            const ok = i === item.answer
            practise(profile.id, `vocab:${item.word}`, ok)
            game.answer(ok, `${item.word} means “${item.options[item.answer]}”. The clue: “${item.clue}”.`)
          }}>{o}</button>
        ))}
      </div>
    </GameShell>
  )
}

export function ShadesOfMeaning({ profile }: { profile: Profile }) {
  const game = useRounds()
  const practise = useStore((s) => s.practise)
  const scale = SHADES[game.round % SHADES.length]
  const mixed = useMemo(() => shuffle(scale.words), [scale])
  const [order, setOrder] = useState<string[]>([])
  useEffect(() => setOrder([]), [scale])
  return (
    <GameShell title="Shades of Meaning" help="Tap the words from weakest to strongest." game={game}>
      <p className="text-center text-xl font-extrabold">{scale.label}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {mixed.map((w) => (
          <button key={w} className="btn-ghost" disabled={order.includes(w)} style={{ opacity: order.includes(w) ? 0.3 : 1 }}
            onClick={() => {
              const next = [...order, w]
              setOrder(next)
              if (next.length === scale.words.length) {
                const ok = next.join() === scale.words.join()
                practise(profile.id, `shades:${scale.label}`, ok)
                game.answer(ok, ok ? 'Perfect scale!' : `From weakest to strongest: ${scale.words.join(' → ')}`)
              }
            }}>{w}</button>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-2">
        <span className="muted text-sm">weak</span>
        <div className="flex flex-1 flex-wrap gap-2 rounded-3xl p-3" style={{ background: 'linear-gradient(90deg, var(--soft), var(--accent))' }}>
          {order.map((w) => <span key={w} className="panel rounded-xl px-2 py-1 font-bold">{w}</span>)}
        </div>
        <span className="muted text-sm">strong</span>
      </div>
      {order.length > 0 && !game.feedback && <button className="btn-ghost mt-3" onClick={() => setOrder([])}>Start again</button>}
    </GameShell>
  )
}

export function HomophoneHero({ profile }: { profile: Profile }) {
  const game = useRounds()
  const practise = useStore((s) => s.practise)
  const items = useMemo(() => shuffle(HOMOPHONES.flatMap((h) => h.sentences.map((s) => ({ ...s, words: h.words })))), [])
  const item = items[game.round % items.length]
  return (
    <GameShell title="Homophone Hero" help="These words sound the same but mean different things. Pick the one that fits." game={game}>
      <p className="read panel rounded-3xl p-4 text-center text-3xl">{item.text.replace('___', '_____')}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {item.words.map((w) => (
          <button key={w} className="btn-ghost text-2xl" onClick={() => {
            const ok = w === item.answer
            practise(profile.id, `homophone:${item.words.join('/')}`, ok)
            game.answer(ok, item.text.replace('___', item.answer))
          }}>{w}</button>
        ))}
      </div>
    </GameShell>
  )
}

export function SentenceUpgrade({ profile }: { profile: Profile }) {
  const game = useRounds()
  const item = UPGRADES[game.round % UPGRADES.length]
  const [choice, setChoice] = useState<string | null>(null)
  useEffect(() => setChoice(null), [item])
  const upgraded = choice ? item.template.replace('{x}', choice).replace(/^\w/, (c) => c.toUpperCase()) : null
  return (
    <GameShell title="Sentence Upgrade" help={`Make the sentence better with ${item.kind === 'adjective' ? 'an adjective (describing word)' : item.kind === 'adverb' ? 'an adverb (how it happened)' : 'a joining word'}.`} game={game}>
      <p className="read muted text-center text-2xl">{item.plain}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {item.choices.map((c) => <button key={c} className={choice === c ? 'btn' : 'btn-ghost'} onClick={() => setChoice(c)}>{c}</button>)}
      </div>
      {upgraded && (
        <div className="mt-6 text-center">
          <p className="read text-3xl font-extrabold">{upgraded}</p>
          <div className="mt-3 flex justify-center gap-2">
            <button className="btn-ghost" onClick={() => speak(upgraded, { rate: profile.settings.speechRate })}>🔊 Hear it</button>
            <button className="btn" onClick={() => game.answer(true, 'What a sentence!')}>Done</button>
          </div>
        </div>
      )}
    </GameShell>
  )
}

export function SpellingBee({ profile }: { profile: Profile }) {
  const decoder = useDecoder()
  const game = useRounds()
  const practise = useStore((s) => s.practise)
  const inv = playInventory(profile)
  const words = useMemo(() => (decoder ? decodableWords(decoder, inv, { minSyllables: profile.band === 'explorer' ? 2 : 1 }) : []), [decoder]) // eslint-disable-line react-hooks/exhaustive-deps
  const word = useMemo(() => sample(words, 1)[0], [words, game.round])
  const [typed, setTyped] = useState('')
  useEffect(() => {
    setTyped('')
    if (word) speak(word, { rate: profile.settings.speechRate })
  }, [word]) // eslint-disable-line react-hooks/exhaustive-deps
  if (!word || !decoder) return <GameShell title="Spelling Bee" help="" game={game}><p className="muted">Getting words…</p></GameShell>
  const d = decoder.explain(word)
  const check = () => {
    const ok = typed.trim().toLowerCase() === word
    practise(profile.id, `spell:${word}`, ok)
    // where did it go wrong? compare tile by tile
    let at = 0
    let wrongTile = -1
    d.tiles.forEach((t, i) => {
      if (wrongTile < 0 && typed.toLowerCase().slice(at, at + t.text.length) !== t.text.toLowerCase()) wrongTile = i
      at += t.text.length
    })
    game.answer(ok, ok ? `${word}: spelled perfectly!` : `It is spelled ${d.tiles.map((t) => t.text).join('-')}. Check the “${d.tiles[Math.max(0, wrongTile)].text}” part.`)
  }
  const def = VOCAB_BY_WORD.get(word)?.def
  return (
    <GameShell title="Spelling Bee" help="Listen, then type the word. Only you see your score." game={game}>
      <div className="flex justify-center gap-2">
        <button className="btn" onClick={() => speak(word)}>🔊 Say the word</button>
        <button className="btn-ghost" onClick={() => speak(word, { rate: 0.5 })}>🐢 Slowly</button>
      </div>
      {def && <p className="muted mt-3 text-center">Meaning: {def}</p>}
      <input autoFocus autoCapitalize="none" autoCorrect="off" spellCheck={false} value={typed} onChange={(e) => setTyped(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !game.feedback && check()}
        className="read panel mt-6 w-full rounded-3xl p-4 text-center text-4xl font-extrabold" aria-label="Type the word" />
      <div className="mt-4 text-center"><button className="btn" onClick={check} disabled={!typed || !!game.feedback}>Check</button></div>
      {game.feedback && !game.feedback.ok && <div className="mt-4"><Tiles tiles={d.tiles} size={1.8} /></div>}
    </GameShell>
  )
}
