import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { STEPS, type Step } from '../engine/curriculum'
import { GRAPHEME_BY_ID } from '../engine/graphemes'
import { MORPHEMES } from '../engine/morphology'
import { tokenize } from '../engine/decode'
import { playPhones, speak } from '../app/audio'
import { useDecoder } from '../app/engine'
import { decodableSentences, decodableWords, sample, shuffle } from '../app/pick'
import { go } from '../app/router'
import { inventoryOf, useStore, type Profile } from '../app/store'
import { Card, Header, Screen } from '../ui/kit'
import { Tiles } from '../ui/Tiles'
import { WordCard } from '../ui/WordCard'

export function LessonMap({ profile }: { profile: Profile }) {
  const explorer = profile.band === 'explorer'
  const steps = STEPS.filter((s) => (explorer ? true : s.band === 'sprout'))
  return (
    <div>
      <Header title={explorer ? 'Missions' : 'Learning trail'} />
      <Screen>
        <ol className="relative space-y-4 border-l-4 border-dashed pl-6" style={{ borderColor: 'var(--line)' }}>
          {steps.map((s, i) => {
            const done = profile.lessonsDone.includes(s.id)
            const known = s.graphemes.every((g) => profile.graphemes.includes(g))
            const prevDone = i === 0 || profile.lessonsDone.includes(steps[i - 1].id) || steps[i - 1].graphemes.every((g) => profile.graphemes.includes(g))
            const open = done || known || prevDone
            return (
              <li key={s.id} className="relative">
                <span className="absolute -left-[2.35rem] top-4 flex h-8 w-8 items-center justify-center rounded-full text-sm font-extrabold" style={{ background: done ? 'var(--accent)' : 'var(--panel)', color: done ? 'var(--accent-ink)' : 'var(--ink)', border: '3px solid var(--line)' }}>
                  {done ? '✓' : i + 1}
                </span>
                <Card onClick={open ? () => go(`lesson/${s.id}`) : undefined} className={open ? '' : 'opacity-50'}>
                  <div className="text-lg font-extrabold">{s.mission}</div>
                  <div className="read muted text-sm">{s.graphemes.slice(0, 10).map((g) => GRAPHEME_BY_ID.get(g)?.letters.replace('_', '-') ?? g).join('  ')}{s.graphemes.length > 10 ? ' …' : ''}</div>
                  {s.heart && <div className="mt-1 text-xs">♥ {s.heart.join(', ')}</div>}
                  {!open && <div className="muted mt-1 text-xs">🔒 Finish the one before first</div>}
                </Card>
              </li>
            )
          })}
        </ol>
      </Screen>
    </div>
  )
}

type Phase = 'listen' | 'practice' | 'play' | 'read' | 'check' | 'done'
const PHASES: Phase[] = ['listen', 'practice', 'play', 'read', 'check']

export function Lesson({ profile, stepId }: { profile: Profile; stepId: string }) {
  const step = STEPS.find((s) => s.id === stepId)!
  const decoder = useDecoder()
  const update = useStore((s) => s.update)
  const practise = useStore((s) => s.practise)
  const [phase, setPhase] = useState<Phase>('listen')
  // The lesson's inventory: what the child knows plus this step.
  const inv = useMemo(() => {
    const base = inventoryOf(profile)
    step.graphemes.forEach((g) => base.graphemes.add(g))
    step.skills?.forEach((g) => base.skills.add(g))
    step.heart?.forEach((h) => base.heart.add(h.toLowerCase()))
    return base
  }, [profile, step])
  const words = useMemo(() => (decoder ? shuffle(decodableWords(decoder, inv, { containing: step.graphemes })) : []), [decoder, inv, step])
  const sentences = useMemo(() => (decoder ? sample(decodableSentences(decoder, inv, step.graphemes), 3) : []), [decoder, inv, step])
  const nextPhase = () => setPhase(PHASES[PHASES.indexOf(phase as Phase) + 1] ?? 'done')

  const finish = () => {
    update(profile.id, (p) => {
      if (!p.lessonsDone.includes(step.id)) p.lessonsDone.push(step.id)
      for (const g of step.graphemes) if (!p.graphemes.includes(g)) p.graphemes.push(g)
      for (const g of step.skills ?? []) if (!p.skills.includes(g)) p.skills.push(g)
      for (const h of step.heart ?? []) if (!p.heart.includes(h.toLowerCase())) p.heart.push(h.toLowerCase())
      p.step = step.id
      if (step.band === 'explorer') p.band = 'explorer'
    })
    go('lessons')
  }

  return (
    <div>
      <Header title={step.mission} back="lessons" right={<span className="chip">{phase === 'done' ? '✓' : `${PHASES.indexOf(phase) + 1}/5`}</span>} />
      <Screen>
        <div className="mb-5 flex gap-1" aria-hidden>
          {PHASES.map((ph) => (
            <div key={ph} className="h-2 flex-1 rounded-full" style={{ background: PHASES.indexOf(ph) <= PHASES.indexOf(phase as Phase) || phase === 'done' ? 'var(--accent)' : 'var(--line)' }} />
          ))}
        </div>
        {!decoder ? <p className="muted">Loading…</p> : (
          <>
            {phase === 'listen' && <ListenPhase step={step} profile={profile} onNext={nextPhase} />}
            {phase === 'practice' && <PracticePhase words={words.slice(0, 5)} profile={profile} inv={inv} onNext={nextPhase} />}
            {phase === 'play' && <PlayPhase step={step} words={words} profile={profile} onNext={nextPhase} />}
            {phase === 'read' && <ReadPhase sentences={sentences} words={words.slice(5, 11)} profile={profile} onNext={nextPhase} />}
            {phase === 'check' && <CheckPhase step={step} words={words} profile={profile} onDone={(score) => { practise(profile.id, `lesson:${step.id}`, score >= 2); setPhase('done') }} />}
            {phase === 'done' && (
              <div className="py-8 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-8xl">{profile.band === 'explorer' ? '🏅' : '🌱'}</motion.div>
                <p className="mt-3 text-2xl font-extrabold">Mission complete!</p>
                <p className="muted">New {profile.band === 'explorer' ? 'codes' : 'sounds'}: {step.graphemes.map((g) => GRAPHEME_BY_ID.get(g)?.letters.replace('_', '-')).join(', ')}</p>
                <button className="btn mt-6" onClick={finish}>Finish</button>
              </div>
            )}
          </>
        )}
      </Screen>
    </div>
  )
}

function ListenPhase({ step, profile, onNext }: { step: Step; profile: Profile; onNext: () => void }) {
  const explorer = step.band === 'explorer'
  const suffixes = MORPHEMES.filter((m) => step.graphemes.includes(m.form))
  return (
    <div>
      <h2 className="text-2xl font-extrabold">{explorer ? 'Explore the code' : 'Listen'}</h2>
      <p className="muted">Tap each card to hear its sound and a word that uses it.</p>
      {step.syllablePattern && <p className="panel mt-3 rounded-2xl p-3"><b>Syllable pattern:</b> {step.syllablePattern}</p>}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {step.graphemes.map((id) => {
          const g = GRAPHEME_BY_ID.get(id)!
          return (
            <button key={id} className="panel rounded-3xl p-4 text-center" onClick={async () => {
              const ok = await playPhones(g.sounds[0], profile.settings.computerVoiceForSounds)
              if (!ok) await speak(g.letters)
              await speak(g.example, { rate: profile.settings.speechRate })
            }}>
              <div className={`read text-5xl font-extrabold t-${g.type}`}>{g.letters.replace('_', '-')}</div>
              <div className="muted mt-1 text-sm">as in <b>{g.example}</b></div>
            </button>
          )
        })}
      </div>
      {suffixes.length > 0 && <p className="mt-4 text-sm">{suffixes.map((m) => `-${m.form} means “${m.meaning}”`).join(' · ')}</p>}
      {step.heart && (
        <div className="mt-6">
          <h3 className="font-extrabold">♥ Heart words</h3>
          <p className="muted text-sm">Say it, tap the sounds, spot the tricky part, then read it in a sentence.</p>
          <div className="read mt-2 flex flex-wrap gap-2 text-2xl font-bold">
            {step.heart.map((h) => <button key={h} className="btn-ghost" onClick={() => speak(h)}>{h}</button>)}
          </div>
        </div>
      )}
      <div className="mt-8 text-right"><button className="btn" onClick={onNext}>Next: Practice →</button></div>
    </div>
  )
}

function PracticePhase({ words, profile, inv, onNext }: { words: string[]; profile: Profile; inv: ReturnType<typeof inventoryOf>; onNext: () => void }) {
  const decoder = useDecoder()!
  const [i, setI] = useState(0)
  const word = words[i]
  if (!word) return <div><p className="muted">No practice words for this step yet.</p><button className="btn mt-4" onClick={onNext}>Next →</button></div>
  const d = decoder.decode(word, inv)
  return (
    <div>
      <h2 className="text-2xl font-extrabold">Practice: blend it</h2>
      <p className="muted">Tap each sound, then blend them together. Read the word out loud, then check.</p>
      <div className="mt-6"><Tiles tiles={d.tiles} onTap={(k) => playPhones(d.tiles[k].phones, profile.settings.computerVoiceForSounds)} /></div>
      <div className="flex justify-center gap-2">
        <button className="btn-ghost" onClick={() => speak(word, { rate: profile.settings.speechRate })}>✔ Check: hear it</button>
        <button className="btn" onClick={() => (i + 1 < words.length ? setI(i + 1) : onNext())}>{i + 1 < words.length ? 'Next word →' : 'Next: Play →'}</button>
      </div>
      <p className="muted mt-4 text-center text-sm">Word {i + 1} of {words.length}</p>
    </div>
  )
}

function PlayPhase({ step, words, profile, onNext }: { step: Step; words: string[]; profile: Profile; onNext: () => void }) {
  // Quick "find the sound" game with this step's graphemes
  const rounds = useMemo(() => sample(words, 4).map((w) => ({ w, opts: shuffle([w, ...sample(words.filter((x) => x !== w), 2)]) })), [words])
  const [k, setK] = useState(0)
  const [msg, setMsg] = useState('')
  const r = rounds[k]
  if (!r || rounds.length < 2) return <div><p className="muted">Game time is next lesson!</p><button className="btn mt-4" onClick={onNext}>Next →</button></div>
  return (
    <div>
      <h2 className="text-2xl font-extrabold">Play: which word did you hear?</h2>
      <div className="mt-4 text-center"><button className="btn" onClick={() => speak(r.w, { rate: profile.settings.speechRate })}>🔊 Hear it</button></div>
      <div className="read mt-6 flex flex-wrap justify-center gap-3 text-3xl font-extrabold">
        {r.opts.map((o) => (
          <button key={o} className="btn-ghost !text-3xl" onClick={() => {
            if (o === r.w) {
              setMsg('Yes!')
              setTimeout(() => {
                setMsg('')
                k + 1 < rounds.length ? setK(k + 1) : onNext()
              }, 700)
            } else setMsg(`That says “${o}”. Listen again!`)
          }}>{o}</button>
        ))}
      </div>
      <p className="mt-4 text-center font-bold">{msg}</p>
      <p className="muted text-center text-sm">{step.mission} · {k + 1}/{rounds.length}</p>
    </div>
  )
}

function ReadPhase({ sentences, words, profile, onNext }: { sentences: string[]; words: string[]; profile: Profile; onNext: () => void }) {
  const [card, setCard] = useState<string | null>(null)
  const lines = sentences.length ? sentences : words.length ? [words.join(' · ')] : []
  return (
    <div>
      <h2 className="text-2xl font-extrabold">Read it yourself</h2>
      <p className="muted">Tap any word if you get stuck.</p>
      <div className="read mt-4 space-y-4 text-3xl font-semibold">
        {lines.map((s, i) => (
          <p key={i} className="panel rounded-3xl p-4">
            {tokenize(s).map((t, j) => (t.word ? <span key={j} className="word" role="button" tabIndex={0} onClick={() => setCard(t.text)}>{t.text}</span> : <span key={j}>{t.text}</span>))}
          </p>
        ))}
      </div>
      <div className="mt-8 text-right"><button className="btn" onClick={onNext}>Next: Check →</button></div>
      {card && <WordCard word={card} profile={profile} onClose={() => setCard(null)} />}
    </div>
  )
}

function CheckPhase({ step, words, profile, onDone }: { step: Step; words: string[]; profile: Profile; onDone: (score: number) => void }) {
  const practise = useStore((s) => s.practise)
  const decoder = useDecoder()!
  const items = useMemo(() => {
    const out: { g: string; right: string; options: string[] }[] = []
    for (const g of sample(step.graphemes, 3)) {
      const has = words.filter((w) => decoder.explain(w).tiles.some((t) => t.graphemeId === g))
      const not = words.filter((w) => !decoder.explain(w).tiles.some((t) => t.graphemeId === g))
      if (!has.length || not.length < 2) continue
      const right = sample(has, 1)[0]
      out.push({ g, right, options: shuffle([right, ...sample(not, 2)]) })
    }
    return out
  }, [step, words, decoder])
  const [k, setK] = useState(0)
  const [score, setScore] = useState(0)
  const item = items[k]
  if (!item) return <div><p className="muted">All checked!</p><button className="btn mt-4" onClick={() => onDone(3)}>Finish →</button></div>
  const g = GRAPHEME_BY_ID.get(item.g)!
  return (
    <div>
      <h2 className="text-2xl font-extrabold">Quick check</h2>
      <p className="mt-2 text-lg">Which word has <b className={`read t-${g.type}`}>{g.letters.replace('_', '-')}</b> (as in {g.example})?</p>
      <div className="read mt-4 flex flex-wrap gap-3 text-3xl font-extrabold">
        {item.options.map((o) => (
          <button key={o} className="btn-ghost !text-3xl" onClick={() => {
            const ok = o === item.right
            practise(profile.id, item.g, ok)
            const s = score + (ok ? 1 : 0)
            setScore(s)
            k + 1 < items.length ? setK(k + 1) : onDone(s)
          }}>{o}</button>
        ))}
      </div>
      <p className="muted mt-4 text-sm">Grown-ups see these results. There is no score for you here, just practice.</p>
    </div>
  )
}
