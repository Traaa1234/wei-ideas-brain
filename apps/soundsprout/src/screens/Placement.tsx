// Placement check (5–10 min, grown-up assisted): the child reads words aloud, the grown-up
// taps ✓ or ✗. Stops when a stage is too hard. Then a short passage with 3 questions.
// Decoding and comprehension are placed separately.
import { useMemo, useState } from 'react'
import { STEPS, inventoryUpTo, type Band } from '../engine/curriculum'
import { PRACTICE_WORDS } from '../data/practice'
import { useDecoder } from '../app/engine'
import { sample } from '../app/pick'
import { go } from '../app/router'
import { useStore, type Profile } from '../app/store'
import { Header, Screen } from '../ui/kit'

const PASSAGES: { band: Band; text: string; questions: { q: string; options: string[]; answer: number }[] }[] = [
  {
    band: 'sprout',
    text: 'Ben has a red cap. The wind is strong. Ben\'s cap is up in a tree! Ben gets a long stick and pokes it. Down it falls.',
    questions: [
      { q: 'What color is the cap?', options: ['red', 'blue', 'green'], answer: 0 },
      { q: 'Where did the cap go?', options: ['in a tree', 'in the pond', 'under the bed'], answer: 0 },
      { q: 'Why did the cap go up?', options: ['the wind blew it', 'a bird took it', 'Ben threw it'], answer: 0 },
    ],
  },
  {
    band: 'explorer',
    text: 'Every autumn, millions of monarch butterflies travel thousands of miles to warmer places. Nobody teaches them the way, because none of them has made the trip before. Scientists think the butterflies use the position of the sun, like a compass, to find their route.',
    questions: [
      { q: 'Why do monarchs travel?', options: ['to reach warmer places', 'to find water', 'to escape birds'], answer: 0 },
      { q: 'What does "route" mean here?', options: ['the way they travel', 'a kind of flower', 'a group of butterflies'], answer: 0 },
      { q: 'What surprises scientists most?', options: ['no butterfly has made the trip before, yet they find the way', 'butterflies are orange', 'it is autumn'], answer: 0 },
    ],
  },
]

export function Placement({ profile }: { profile: Profile }) {
  const decoder = useDecoder()
  const update = useStore((s) => s.update)
  const stages = useMemo(() => {
    if (!decoder) return []
    return STEPS.map((s, i) => {
      const inv = inventoryUpTo(s.id)
      const before = i > 0 ? inventoryUpTo(STEPS[i - 1].id) : null
      const fresh = PRACTICE_WORDS.filter((w) => {
        const d = decoder.decode(w, inv)
        return d.status === 'decodable' && (!before || !decoder.readable(decoder.decode(w, before)))
      })
      const heart = (s.heart ?? []).slice(0, 1)
      return { step: s, words: [...sample(fresh, 3), ...heart].slice(0, 4) }
    }).filter((x) => x.words.length >= 2)
  }, [decoder])
  const [stage, setStage] = useState(0)
  const [pos, setPos] = useState(0)
  const [right, setRight] = useState<number[]>([])
  const [decodingStep, setDecodingStep] = useState<string | null>(null)
  const [comp, setComp] = useState<{ band: number; q: number; score: number[] } | null>(null)

  if (!decoder || !stages.length) return <Screen><Header title="Placement check" back="grownups" /><p className="muted">Loading…</p></Screen>

  const finishDecoding = (lastPassed: number) => {
    setDecodingStep(lastPassed >= 0 ? stages[lastPassed].step.id : '')
    setComp({ band: 0, q: 0, score: [0, 0] })
  }

  const mark = (ok: boolean) => {
    const r = [...right]
    r[stage] = (r[stage] ?? 0) + (ok ? 1 : 0)
    setRight(r)
    const words = stages[stage].words
    if (pos + 1 < words.length) return setPos(pos + 1)
    const passed = (r[stage] ?? 0) / words.length >= 0.66
    if (passed && stage + 1 < stages.length) {
      setStage(stage + 1)
      setPos(0)
    } else finishDecoding(passed ? stage : stage - 1)
  }

  const apply = (compBand: Band) => {
    const stepId = decodingStep || 's1'
    const inv = inventoryUpTo(stepId)
    update(profile.id, (p) => {
      p.step = stepId
      p.decodingStep = stepId
      p.comprehensionBand = compBand
      p.graphemes = [...inv.graphemes]
      p.skills = [...inv.skills]
      p.heart = [...inv.heart]
      p.placedAt = Date.now()
      const stepBand = STEPS.find((s) => s.id === stepId)?.band ?? 'sprout'
      // Older readers who understand Explorer texts get the Explorer look, even with early phonics.
      p.band = stepBand === 'explorer' || compBand === 'explorer' ? 'explorer' : 'sprout'
      p.lessonsDone = STEPS.slice(0, STEPS.findIndex((s) => s.id === stepId) + 1).map((s) => s.id)
    })
    go('grownups')
  }

  if (comp) {
    const passage = PASSAGES[comp.band]
    if (comp.q >= passage.questions.length) {
      const compBand: Band = comp.score[1] >= 2 ? 'explorer' : 'sprout'
      const step = STEPS.find((s) => s.id === decodingStep)
      return (
        <div>
          <Header title="Placement result" back="grownups" />
          <Screen>
            <div className="panel rounded-3xl p-5">
              <p><b>Decoding:</b> {step ? `${step.title} (${step.mission})` : 'Starting at the very beginning'}</p>
              <p><b>Comprehension:</b> {compBand === 'explorer' ? 'Explorer passages (reading to learn)' : 'Sprout passages'}</p>
              {compBand === 'explorer' && step?.band === 'sprout' && (
                <p className="muted mt-2 text-sm">Understands more than they can decode yet: they’ll get the Explorer look and books to listen to, with phonics practice at their decoding step.</p>
              )}
            </div>
            <button className="btn mt-6" onClick={() => apply(compBand)}>Use these results</button>
          </Screen>
        </div>
      )
    }
    const q = passage.questions[comp.q]
    return (
      <div>
        <Header title="Placement: understanding" back="grownups" />
        <Screen>
          <p className="muted text-sm">Read the passage with your child (they can read it or listen). Then let them answer.</p>
          <p className="read panel mt-3 rounded-3xl p-4 text-xl">{passage.text}</p>
          <p className="mt-4 text-lg font-bold">{q.q}</p>
          <div className="mt-2 flex flex-col gap-2">
            {q.options.map((o, i) => (
              <button key={o} className="btn-ghost text-left" onClick={() => {
                const score = [...comp.score]
                if (i === q.answer) score[comp.band]++
                const nq = comp.q + 1
                // passed this passage: try the harder one
                if (nq >= passage.questions.length && score[comp.band] >= 2 && comp.band + 1 < PASSAGES.length) setComp({ band: comp.band + 1, q: 0, score })
                else setComp({ ...comp, q: nq, score })
              }}>{o}</button>
            ))}
          </div>
        </Screen>
      </div>
    )
  }

  const st = stages[stage]
  return (
    <div>
      <Header title="Placement: sounding out" back="grownups" />
      <Screen>
        <p className="muted text-sm">Ask {profile.name} to read each word aloud. Tap ✓ if they read it correctly (sounding out is fine), ✗ if not. We stop when it gets too hard.</p>
        <p className="mt-4 text-sm font-bold">Stage {stage + 1} of {stages.length}: {st.step.title}</p>
        <div className="read panel mt-4 rounded-3xl py-12 text-center text-7xl font-extrabold">{st.words[pos]}</div>
        <div className="mt-6 flex justify-center gap-4">
          <button className="btn text-2xl" onClick={() => mark(true)}>✓ Read it</button>
          <button className="btn-ghost text-2xl" onClick={() => mark(false)}>✗ Not yet</button>
        </div>
        <button className="muted mt-8 text-sm underline" onClick={() => finishDecoding(stage - 1)}>Stop here</button>
      </Screen>
    </div>
  )
}
