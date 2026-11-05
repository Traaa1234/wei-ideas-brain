// Grown-ups area (behind a simple adult gate): readers, dashboard, skills, words,
// sound recordings, settings and data.
import { useEffect, useMemo, useRef, useState } from 'react'
import { clear } from 'idb-keyval'
import { STEPS, inventoryUpTo, type Band } from '../engine/curriculum'
import { ALL_PHONES, GRAPHEME_BY_ID, PHONE_SAY } from '../engine/graphemes'
import { graphemeLabel } from '../engine/decode'
import { stripStress } from '../engine/lexicon'
import { BOOKS } from '../data/library'
import { BANK_BY_WORD, POS_LABEL, TOP_300, WORD_BANK, type Pos } from '../data/words'
import { deleteRecording, playPhones, recordedPhones, saveRecording, speak } from '../app/audio'
import { addPronunciation, useDecoder } from '../app/engine'
import { teachNext } from '../app/levels'
import { posOfWord } from '../app/pos'
import { decodableWords } from '../app/pick'
import { go } from '../app/router'
import { inventoryOf, newProfile, today, useActive, useStore, wordMastered, type MyWord, type Profile } from '../app/store'
import { Card, Header, Screen } from '../ui/kit'
import { Tiles } from '../ui/Tiles'

const AVATARS = ['🦊', '🐼', '🦁', '🐸', '🐙', '🦄', '🐢', '🦉', '🐝', '🐳', '🚀', '🦖']

export function Grownups({ section }: { section?: string }) {
  const adultUntil = useStore((s) => s.adultUntil)
  const active = useActive()
  if (adultUntil < Date.now()) return <Gate />
  if (section === 'new') return <NewReader />
  if (section === 'placement' && active) return null // handled by App route
  const tabs: [string, string][] = [
    ['', 'Dashboard'], ['readers', 'Readers'], ['skills', 'Sounds & skills'], ['words', 'Words'], ['sounds', 'Record sounds'], ['settings', 'Settings'], ['data', 'Privacy & data'],
  ]
  return (
    <div>
      <Header title="Grown-ups" back={active ? '' : ''} right={<button className="btn-ghost text-sm" onClick={() => { useStore.getState().lockAdult(); go('') }}>Lock</button>} />
      <Screen wide>
        <nav className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {tabs.map(([id, label]) => (
            <button key={id} className={(section ?? '') === id ? 'btn !min-h-0 !py-2 text-sm' : 'btn-ghost !min-h-0 !py-2 text-sm'} onClick={() => go(`grownups/${id}`)}>{label}</button>
          ))}
        </nav>
        {!active && section !== 'readers' && section !== 'data' ? (
          <Card><p>Choose or add a reader first.</p><button className="btn mt-3" onClick={() => go('grownups/readers')}>Readers</button></Card>
        ) : (
          <>
            {(section ?? '') === '' && active && <Dashboard profile={active} />}
            {section === 'readers' && <Readers />}
            {section === 'skills' && active && <Skills profile={active} />}
            {section === 'words' && active && <WordsAdmin profile={active} />}
            {section === 'sounds' && <Recorder />}
            {section === 'settings' && active && <SettingsPanel profile={active} />}
            {section === 'data' && <DataPanel />}
          </>
        )}
      </Screen>
    </div>
  )
}

function Gate() {
  const [year, setYear] = useState('')
  const [wrong, setWrong] = useState(false)
  const unlock = useStore((s) => s.unlockAdult)
  return (
    <div>
      <Header title="Grown-ups only" />
      <Screen>
        <Card>
          <p className="font-bold">Please type the year you were born.</p>
          <input inputMode="numeric" className="panel mt-3 w-full rounded-2xl p-3 text-2xl" value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, '').slice(0, 4))} aria-label="Birth year" />
          {wrong && <p className="mt-2 text-sm">That doesn’t look like a grown-up’s birth year.</p>}
          <button className="btn mt-4" onClick={() => {
            const age = new Date().getFullYear() - Number(year)
            if (year.length === 4 && age >= 18 && age < 110) unlock()
            else setWrong(true)
          }}>Continue</button>
        </Card>
      </Screen>
    </div>
  )
}

function NewReader() {
  const add = useStore((s) => s.addProfile)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState(AVATARS[0])
  const [start, setStart] = useState<'placement' | string>('placement')
  return (
    <div>
      <Header title="Add a reader" back="" />
      <Screen>
        <Card>
          <label className="block font-bold">First name or nickname
            <input className="panel mt-2 w-full rounded-2xl p-3 text-xl" value={name} onChange={(e) => setName(e.target.value.slice(0, 20))} />
          </label>
          <p className="muted mt-1 text-xs">Only stored on this device.</p>
          <div className="mt-4 font-bold">Picture</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {AVATARS.map((a) => <button key={a} className={`rounded-2xl p-2 text-4xl ${avatar === a ? 'ring-4' : ''}`} style={{ ['--tw-ring-color' as string]: 'var(--accent)' }} onClick={() => setAvatar(a)}>{a}</button>)}
          </div>
          <div className="mt-4 font-bold">Where to start</div>
          <select className="panel mt-2 w-full rounded-2xl p-3" value={start} onChange={(e) => setStart(e.target.value)}>
            <option value="placement">Run the 5-minute placement check (recommended)</option>
            {STEPS.map((s) => <option key={s.id} value={s.id}>{s.band === 'explorer' ? 'Explorer' : 'Sprout'}: {s.title}</option>)}
            <option value="none">At the very beginning (no sounds yet)</option>
          </select>
          <button className="btn mt-6" disabled={!name.trim()} onClick={() => {
            const p = newProfile(name.trim(), avatar, start === 'placement' || start === 'none' ? 's1' : start)
            if (start === 'none' || start === 'placement') {
              p.graphemes = []
              p.heart = []
              p.skills = []
            }
            add(p)
            go(start === 'placement' ? 'placement' : 'grownups')
          }}>Add {name || 'reader'}</button>
        </Card>
      </Screen>
    </div>
  )
}

function Readers() {
  const profiles = useStore((s) => s.profiles)
  const activeId = useStore((s) => s.activeId)
  const setActive = useStore((s) => s.setActive)
  const update = useStore((s) => s.update)
  const remove = useStore((s) => s.removeProfile)
  return (
    <div className="space-y-3">
      {profiles.map((p) => (
        <Card key={p.id} className="flex flex-wrap items-center gap-3">
          <span className="text-4xl">{p.avatar}</span>
          <div className="flex-1">
            <div className="text-lg font-extrabold">{p.name} {p.id === activeId && <span className="chip">selected</span>}</div>
            <div className="muted text-sm">{STEPS.find((s) => s.id === p.step)?.title ?? 'Not started'} · {p.placedAt ? 'placed ' + new Date(p.placedAt).toLocaleDateString() : 'not placed yet'}</div>
          </div>
          <label className="text-sm">Look&nbsp;
            <select className="panel rounded-xl p-2" value={p.band} onChange={(e) => update(p.id, (x) => (x.band = e.target.value as Band))}>
              <option value="sprout">Sprout (4–7)</option>
              <option value="explorer">Explorer (7–10)</option>
            </select>
          </label>
          <button className="btn-ghost text-sm" onClick={() => setActive(p.id)}>Select</button>
          <button className="btn-ghost text-sm" onClick={() => { setActive(p.id); go('placement') }}>Placement check</button>
          <button className="btn-ghost text-sm" onClick={() => confirm(`Delete ${p.name} and all their progress from this device?`) && remove(p.id)}>Delete</button>
        </Card>
      ))}
      <button className="btn" onClick={() => go('grownups/new')}>＋ Add a reader</button>
      <p className="muted text-sm">“Look” is separate from level: an older child working on early sounds can have the Explorer look, with books and games that don’t feel babyish.</p>
    </div>
  )
}

function Dashboard({ profile }: { profile: Profile }) {
  const decoder = useDecoder()
  const step = STEPS.find((s) => s.id === profile.step)
  const graphemeMastery = Object.entries(profile.mastery).filter(([k]) => GRAPHEME_BY_ID.has(k))
  const strong = graphemeMastery.filter(([, m]) => m.strength >= 3).map(([k]) => k)
  const weak = graphemeMastery.filter(([, m]) => m.strength < 2 && m.seen > 0).map(([k]) => k)
  const tapped = Object.entries(profile.mastery).filter(([k]) => k.startsWith('tap:')).sort((a, b) => b[1].seen - a[1].seen).slice(0, 10)
  const comp = Object.entries(profile.mastery).filter(([k]) => k.startsWith('comp:'))
  const top300 = TOP_300.filter((w) => wordMastered(profile, w.word)).length
  const inv = inventoryOf(profile)
  const readableTop = decoder ? TOP_300.filter((w) => decoder.readable(decoder.decode(w.word, inv))).length : 0
  const posCov = useMemo(() => {
    if (!decoder) return []
    return (['noun', 'verb', 'adjective'] as Pos[]).map((p) => [p, WORD_BANK.filter((w) => w.pos === p && decoder.readable(decoder.decode(w.word, inv))).length] as const)
  }, [decoder, profile]) // eslint-disable-line react-hooks/exhaustive-deps
  const next = useMemo(() => (decoder ? teachNext(decoder, profile) : []), [decoder, profile])
  const days = Array.from({ length: 7 }, (_, i) => new Date(Date.now() - (6 - i) * 86400000).toISOString().slice(0, 10))
  const byGenre = Object.values(profile.reading).filter((r) => r.times > 0).reduce<Record<string, number>>((acc, r) => {
    const g = BOOKS.find((b) => b.id === r.bookId)?.genre ?? 'other'
    acc[g] = (acc[g] ?? 0) + 1
    return acc
  }, {})
  const tip = TIPS[(new Date().getDate() + profile.name.length) % TIPS.length]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <h2 className="text-lg font-extrabold">{profile.avatar} {profile.name}</h2>
        <p className="mt-1"><b>Decoding:</b> {step ? `${step.title}` : 'just starting'} </p>
        <p><b>Comprehension:</b> {profile.comprehensionBand ? (profile.comprehensionBand === 'explorer' ? 'Explorer passages' : 'Sprout passages') : 'not checked yet'}</p>
        <p><b>Look:</b> {profile.band === 'explorer' ? 'Explorer' : 'Sprout'}</p>
        {!profile.placedAt && <button className="btn mt-3" onClick={() => go('placement')}>Run placement check</button>}
      </Card>
      <Card>
        <h2 className="text-lg font-extrabold">This week</h2>
        <div className="mt-2 flex h-24 items-end gap-2">
          {days.map((d) => {
            const m = profile.minutes[d] ?? 0
            return (
              <div key={d} className="flex flex-1 flex-col items-center gap-1">
                <div className="w-full rounded-t-lg" style={{ height: `${Math.min(80, m * 4)}px`, background: 'var(--accent)' }} title={`${m} min`} />
                <span className="muted text-[10px]">{new Date(d).toLocaleDateString(undefined, { weekday: 'narrow' })}</span>
              </div>
            )
          })}
        </div>
        <p className="muted mt-2 text-sm">{Math.round(days.reduce((n, d) => n + (profile.minutes[d] ?? 0), 0))} minutes reading this week · {profile.stickers.length} books finished</p>
      </Card>
      <Card>
        <h2 className="text-lg font-extrabold">Sounds</h2>
        <p className="mt-1 text-sm"><b>Strong:</b> {strong.map((g) => GRAPHEME_BY_ID.get(g)!.letters).join(', ') || '—'}</p>
        <p className="mt-1 text-sm"><b>Needs practice:</b> {weak.map((g) => GRAPHEME_BY_ID.get(g)!.letters).join(', ') || '—'}</p>
        <p className="mt-1 text-sm"><b>Words tapped most:</b> {tapped.map(([k, m]) => `${k.slice(4)} (${m.seen})`).join(', ') || '—'}</p>
      </Card>
      <Card>
        <h2 className="text-lg font-extrabold">Teach next</h2>
        <p className="muted text-sm">Ranked by how many new words each one unlocks for {profile.name}.</p>
        <ol className="mt-2 list-decimal pl-5">
          {next.map((n) => <li key={n.item}>{n.item.startsWith('syl') || n.item === 'schwa' ? n.item : graphemeLabel(n.item)}: unlocks {n.unlocks} words</li>)}
          {!next.length && <li className="muted list-none">Nothing to suggest yet.</li>}
        </ol>
      </Card>
      <Card>
        <h2 className="text-lg font-extrabold">Words</h2>
        <p className="text-sm">Top 300: can read {readableTop}, mastered {top300} (8+ meetings in books).</p>
        <p className="text-sm">Readable word bank: {posCov.map(([p, n]) => `${n} ${POS_LABEL[p].label.toLowerCase()}s`).join(', ')}</p>
        <p className="text-sm">My Words: {profile.myWords.filter((w) => w.status === 'approved').length} approved, {profile.myWords.filter((w) => w.status === 'pending').length} waiting for you</p>
      </Card>
      <Card>
        <h2 className="text-lg font-extrabold">Understanding</h2>
        {comp.length ? comp.map(([k, m]) => <p key={k} className="text-sm">{k.slice(5)} questions: {m.correct}/{m.seen} right</p>) : <p className="muted text-sm">Answers to after-book questions show here.</p>}
        <p className="text-sm">Books by genre: {Object.entries(byGenre).map(([g, n]) => `${g} ${n}`).join(', ') || '—'}</p>
      </Card>
      <Card className="md:col-span-2">
        <h2 className="text-lg font-extrabold">💡 Try this at home</h2>
        <p className="mt-1">{tip}</p>
        <button className="btn-ghost mt-3 text-sm" onClick={() => printSheet(profile, decoder)}>🖨️ Print a practice sheet</button>
      </Card>
      <Card className="md:col-span-2">
        <h2 className="text-lg font-extrabold">When to ask for help</h2>
        <p className="muted text-sm">This app doesn’t diagnose anything. If, after several months of steady practice, {profile.name} still finds it very hard to link letters and sounds, mixes up sounds a lot, or avoids reading, talk to their teacher about a reading assessment.</p>
      </Card>
    </div>
  )
}

const TIPS = [
  'I spy with sounds: “I spy something that starts with /m/.” Use the sound, not the letter name.',
  'In the car, say a word in sounds (c-a-t) and let your child blend it. Then swap roles.',
  'Ask your child to teach you one heart word from this week. Teaching is the best practice.',
  'After reading, ask “what was the problem in the story, and how was it fixed?”',
  'Hunt for this week’s sound on cereal boxes, signs and menus.',
  'Read a page to your child with lots of expression, then let them read it back to you.',
  'Play “Silly Sentences” at dinner: someone says an adjective, someone a noun, someone a verb.',
]

function printSheet(profile: Profile, decoder: ReturnType<typeof useDecoder>) {
  if (!decoder) return
  const words = decodableWords(decoder, inventoryOf(profile)).slice(0, 40)
  const w = window.open('', '_blank')
  if (!w) return
  w.document.write(`<html><head><title>Practice sheet</title><style>body{font-family:system-ui;padding:24px}h1{font-size:20px}div{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}span{font-size:28px;border:2px solid #ccc;border-radius:12px;padding:12px;text-align:center}</style></head><body><h1>${profile.name}'s words to read · ${today()}</h1><div>${words.map((x) => `<span>${x}</span>`).join('')}</div></body></html>`)
  w.document.close()
  w.print()
}

function Skills({ profile }: { profile: Profile }) {
  const update = useStore((s) => s.update)
  const toggle = (field: 'graphemes' | 'skills' | 'heart', id: string) =>
    update(profile.id, (p) => {
      const list = p[field]
      const i = list.indexOf(id)
      if (i >= 0) list.splice(i, 1)
      else list.push(id)
    })
  return (
    <div>
      <Card className="mb-4">
        <p className="text-sm">Switch sounds and heart words on or off. For books, these only change what is marked as new (dotted underline). Lessons, games and practice use them to pick words.</p>
        <label className="mt-3 block text-sm font-bold">Set level to everything up to:
          <select className="panel ml-2 rounded-xl p-2" value={profile.step} onChange={(e) => {
            const inv = inventoryUpTo(e.target.value)
            update(profile.id, (p) => {
              p.step = e.target.value
              p.graphemes = [...inv.graphemes]
              p.skills = [...inv.skills]
              p.heart = [...inv.heart]
            })
          }}>
            {STEPS.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </label>
      </Card>
      {STEPS.map((s) => (
        <section key={s.id} className="mb-4">
          <h3 className="font-extrabold">{s.band === 'explorer' ? '🧭' : '🌱'} {s.title}</h3>
          <div className="read mt-2 flex flex-wrap gap-2">
            {s.graphemes.map((g) => {
              const on = profile.graphemes.includes(g)
              const m = profile.mastery[g]
              return (
                <button key={g} onClick={() => toggle('graphemes', g)} className={on ? 'btn !min-h-0 !px-3 !py-1.5' : 'btn-ghost !min-h-0 !px-3 !py-1.5'} title={graphemeLabel(g)}>
                  {GRAPHEME_BY_ID.get(g)!.letters.replace('_', '-')}{g.includes('(') ? <span className="text-xs"> {g.split('(')[1].replace(')', '')}</span> : null}
                  {m && <span className="ml-1 text-xs">{'●'.repeat(Math.min(5, m.strength))}</span>}
                </button>
              )
            })}
            {(s.skills ?? []).map((k) => (
              <button key={k} onClick={() => toggle('skills', k)} className={profile.skills.includes(k) ? 'btn !min-h-0 !px-3 !py-1.5' : 'btn-ghost !min-h-0 !px-3 !py-1.5'}>
                {k === 'schwa' ? 'schwa (uh)' : k === 'syl2' ? '2 syllables' : '3+ syllables'}
              </button>
            ))}
          </div>
          {s.heart && (
            <div className="read mt-2 flex flex-wrap gap-2 text-sm">
              {s.heart.map((h) => (
                <button key={h} onClick={() => toggle('heart', h.toLowerCase())} className={profile.heart.includes(h.toLowerCase()) ? 'btn !min-h-0 !px-3 !py-1' : 'btn-ghost !min-h-0 !px-3 !py-1'}>♥ {h}</button>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}

const BLOCKED = /\b(damn|hell|shit|fuck|bitch|crap|stupid|idiot|hate|kill|sex)\b/i

interface Draft {
  word: string
  pos?: Pos
  category?: string
  definition: string
  example: string
  emoji: string
  soundsLike: string
  error?: string
}

function WordsAdmin({ profile }: { profile: Profile }) {
  const decoder = useDecoder()
  const update = useStore((s) => s.update)
  const [input, setInput] = useState('')
  const [drafts, setDrafts] = useState<Draft[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const inv = inventoryOf(profile)

  const prepare = async (text: string) => {
    const words = [...new Set(text.split(/[\s,;]+/).map((w) => w.trim().replace(/[^A-Za-z'-]/g, '')).filter(Boolean))].slice(0, 50)
    const out: Draft[] = []
    for (const w of words) {
      const err = BLOCKED.test(w) ? 'This word is not allowed.' : w.length > 24 ? 'Too long.' : undefined
      const pos = await posOfWord(w)
      out.push({ word: w.toLowerCase(), pos, category: BANK_BY_WORD.get(w.toLowerCase())?.category, definition: '', example: '', emoji: BANK_BY_WORD.get(w.toLowerCase())?.emoji ?? '', soundsLike: '', error: err })
    }
    setDrafts(out)
  }

  const pronFromSoundsLike = (s: string) => {
    if (!decoder || !s.trim()) return null
    const parts = s.trim().toLowerCase().split(/\s+/)
    const phones: string[] = []
    for (const p of parts) {
      const pr = decoder.lexicon.lookup(p)[0]
      if (!pr) return null
      phones.push(...pr)
    }
    return phones
  }

  const save = (d: Draft, introduceOn?: string) => {
    const pron = !decoder?.lexicon.lookup(d.word).length ? pronFromSoundsLike(d.soundsLike) ?? undefined : undefined
    if (pron) addPronunciation(d.word, pron)
    update(profile.id, (p) => {
      const existing = p.myWords.find((m) => m.word === d.word)
      const entry: MyWord = { word: d.word, pos: d.pos, category: d.category, definition: d.definition || undefined, example: d.example || undefined, emoji: d.emoji || undefined, status: 'approved', addedBy: existing?.addedBy ?? 'grown-up', addedAt: existing?.addedAt ?? Date.now(), introduceOn, pron }
      if (existing) Object.assign(existing, entry)
      else p.myWords.push(entry)
    })
    setDrafts((ds) => ds.filter((x) => x.word !== d.word))
  }

  const importFile = async (f: File) => {
    if (f.type.startsWith('image/')) {
      // On-device text detection where the browser supports it (no upload anywhere).
      const TD = (window as unknown as { TextDetector?: new () => { detect: (b: ImageBitmap) => Promise<{ rawValue: string }[]> } }).TextDetector
      if (!TD) return alert('This browser can’t read text from photos yet. Type or paste the list instead.')
      const found = await new TD().detect(await createImageBitmap(f))
      setInput(found.map((x) => x.rawValue).join('\n'))
      return
    }
    const text = await f.text()
    setInput(text.split('\n').map((l) => l.split(',')[0]).join('\n'))
  }

  const pending = profile.myWords.filter((w) => w.status === 'pending')
  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-extrabold">Add words</h2>
        <p className="muted text-sm">Type or paste words (school spelling lists, family names, pets, favourite things). One per line or separated by commas.</p>
        <textarea className="panel mt-2 w-full rounded-2xl p-3" rows={3} value={input} onChange={(e) => setInput(e.target.value)} placeholder="dinosaur, Grandma, Biscuit, volcano" />
        <div className="mt-2 flex flex-wrap gap-2">
          <button className="btn" disabled={!input.trim()} onClick={() => prepare(input)}>Check words</button>
          <button className="btn-ghost" onClick={() => fileRef.current?.click()}>Import CSV or photo</button>
          <input ref={fileRef} type="file" accept=".csv,.txt,image/*" hidden onChange={(e) => e.target.files?.[0] && importFile(e.target.files[0])} />
        </div>
      </Card>

      {drafts.map((d, i) => {
        const info = decoder?.decode(d.word, inv)
        const notInDict = decoder && !decoder.lexicon.lookup(d.word).length
        const set = (patch: Partial<Draft>) => setDrafts(drafts.map((x, k) => (k === i ? { ...x, ...patch } : x)))
        return (
          <Card key={d.word}>
            <div className="flex items-center justify-between gap-2">
              <span className="read text-2xl font-extrabold">{d.emoji} {d.word}</span>
              <span className="chip">{info?.status === 'decodable' ? '✓ decodable now' : info?.status === 'heart' ? '♥ heart word' : notInDict ? 'needs a pronunciation' : `needs ${info?.needs.filter((n) => !n.startsWith('heart:')).map(graphemeLabel).join(', ') || 'a heart part'}`}</span>
            </div>
            {d.error ? <p className="mt-2 text-sm font-bold">{d.error}</p> : (
              <>
                {info && !notInDict && <div className="mt-2"><Tiles tiles={info.tiles} size={1.6} /></div>}
                {notInDict && (
                  <label className="mt-2 block text-sm">Sounds like (real words, e.g. “mit too” for Mittu)
                    <input className="panel mt-1 w-full rounded-xl p-2" value={d.soundsLike} onChange={(e) => set({ soundsLike: e.target.value })} />
                  </label>
                )}
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <label className="text-sm">Part of speech
                    <select className="panel mt-1 w-full rounded-xl p-2" value={d.pos ?? ''} onChange={(e) => set({ pos: (e.target.value || undefined) as Pos })}>
                      <option value="">—</option>
                      {(Object.keys(POS_LABEL) as Pos[]).map((p) => <option key={p} value={p}>{POS_LABEL[p].label}</option>)}
                    </select>
                  </label>
                  <label className="text-sm">Category
                    <input className="panel mt-1 w-full rounded-xl p-2" value={d.category ?? ''} onChange={(e) => set({ category: e.target.value })} placeholder="animals, family, food…" />
                  </label>
                  <label className="text-sm">Kid-friendly meaning (≤ 20 words)
                    <input className="panel mt-1 w-full rounded-xl p-2" value={d.definition} onChange={(e) => set({ definition: e.target.value.split(' ').slice(0, 20).join(' ') })} />
                  </label>
                  <label className="text-sm">Example sentence
                    <input className="panel mt-1 w-full rounded-xl p-2" value={d.example} onChange={(e) => set({ example: e.target.value })} />
                  </label>
                  <label className="text-sm">Picture (emoji)
                    <input className="panel mt-1 w-full rounded-xl p-2" value={d.emoji} onChange={(e) => set({ emoji: [...e.target.value].slice(0, 2).join('') })} />
                  </label>
                  <label className="text-sm">Introduce on (optional)
                    <input type="date" className="panel mt-1 w-full rounded-xl p-2" id={`date-${i}`} />
                  </label>
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="btn" disabled={!!notInDict && !pronFromSoundsLike(d.soundsLike)} onClick={() => save(d, (document.getElementById(`date-${i}`) as HTMLInputElement)?.value || undefined)}>Save to My Words</button>
                  <button className="btn-ghost" onClick={() => speak(d.soundsLike || d.word)}>🔊 Hear it</button>
                  <button className="btn-ghost" onClick={() => setDrafts(drafts.filter((_, k) => k !== i))}>Skip</button>
                </div>
              </>
            )}
          </Card>
        )
      })}

      {pending.length > 0 && (
        <Card>
          <h2 className="text-lg font-extrabold">Waiting for you ({pending.length})</h2>
          <p className="muted text-sm">Words {profile.name} collected while reading.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {pending.map((w) => (
              <span key={w.word} className="panel flex items-center gap-1 rounded-full py-1 pl-3 pr-1">
                {w.word}
                <button className="btn !min-h-0 !px-3 !py-1 text-sm" onClick={() => prepare(w.word)}>Review</button>
                <button className="btn-ghost !min-h-0 !px-3 !py-1 text-sm" onClick={() => update(profile.id, (p) => (p.myWords = p.myWords.filter((x) => x.word !== w.word)))}>✕</button>
              </span>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <h2 className="text-lg font-extrabold">My Words ({profile.myWords.filter((w) => w.status === 'approved').length})</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {profile.myWords.filter((w) => w.status === 'approved').map((w) => (
            <span key={w.word} className="chip !text-sm">{w.emoji} {w.word}{w.pos ? ` · ${w.pos}` : ''}{w.introduceOn ? ` · from ${w.introduceOn}` : ''}</span>
          ))}
        </div>
      </Card>
    </div>
  )
}

function Recorder() {
  const [have, setHave] = useState<Set<string>>(new Set())
  const [rec, setRec] = useState<string | null>(null)
  const media = useRef<MediaRecorder | null>(null)
  useEffect(() => {
    recordedPhones().then(setHave)
  }, [])
  const examples = useMemo(() => {
    const m = new Map<string, string>()
    for (const g of GRAPHEME_BY_ID.values()) for (const s of g.sounds) if (s.length === 1 && !m.has(s[0])) m.set(s[0], `${g.letters} as in ${g.example}`)
    return m
  }, [])
  const start = async (ph: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const chunks: Blob[] = []
      const mr = new MediaRecorder(stream)
      mr.ondataavailable = (e) => chunks.push(e.data)
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        await saveRecording(ph, new Blob(chunks, { type: mr.mimeType }))
        setHave(await recordedPhones())
        setRec(null)
      }
      media.current = mr
      mr.start()
      setRec(ph)
      setTimeout(() => mr.state === 'recording' && mr.stop(), 1600)
    } catch {
      alert('The microphone is not available. Check the browser permission.')
    }
  }
  return (
    <div>
      <Card className="mb-4">
        <p className="text-sm"><b>Record the pure sounds</b> in your own voice: “mmm”, not “muh”. Computer voices are poor at single phonics sounds, so recordings make the biggest difference. Each takes 1.5 seconds. Recordings stay on this device.</p>
        <p className="muted mt-2 text-sm">{have.size} of {ALL_PHONES.length} recorded.</p>
      </Card>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ALL_PHONES.map((ph) => (
          <Card key={ph} className="flex flex-col gap-2">
            <div className="flex items-center justify-between"><b className="read text-xl">{PHONE_SAY[ph]}</b>{have.has(ph) && <span>✅</span>}</div>
            <div className="muted text-xs">{examples.get(stripStress(ph)) ?? ph}</div>
            <div className="flex flex-wrap gap-1">
              <button className="btn !min-h-0 !px-3 !py-1 text-sm" disabled={!!rec} onClick={() => start(ph)}>{rec === ph ? '● Recording' : '● Record'}</button>
              {have.has(ph) && <button className="btn-ghost !min-h-0 !px-3 !py-1 text-sm" onClick={() => playPhones([ph], false)}>▶</button>}
              {have.has(ph) && <button className="btn-ghost !min-h-0 !px-3 !py-1 text-sm" onClick={async () => { await deleteRecording(ph); setHave(await recordedPhones()) }}>✕</button>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function SettingsPanel({ profile }: { profile: Profile }) {
  const update = useStore((s) => s.update)
  const s = profile.settings
  const set = (patch: Partial<Profile['settings']>) => update(profile.id, (p) => Object.assign(p.settings, patch))
  const [goal, setGoal] = useState('')
  const Toggle = ({ k, label, help }: { k: keyof Profile['settings']; label: string; help?: string }) => (
    <label className="flex items-start gap-3 py-2">
      <input type="checkbox" className="mt-1 h-6 w-6" checked={!!s[k]} onChange={(e) => set({ [k]: e.target.checked } as Partial<Profile['settings']>)} />
      <span><b>{label}</b>{help && <span className="muted block text-sm">{help}</span>}</span>
    </label>
  )
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <h2 className="text-lg font-extrabold">Reading support for {profile.name}</h2>
        <Toggle k="dyslexiaFont" label="Dyslexia-friendly font" help="Uses Andika or Lexend if installed on this device, otherwise a rounded font." />
        <Toggle k="spacing" label="Extra letter and line spacing" />
        <Toggle k="ruler" label="Reading ruler" help="A highlighted band follows your finger or mouse." />
        <Toggle k="posMode" label="Word Explorer underlines" help="Nouns, verbs and adjectives get different underlines (shapes, not colours)." />
        <label className="block py-2"><b>Text size</b>
          <input type="range" min={0.8} max={1.6} step={0.1} value={s.textSize} onChange={(e) => set({ textSize: Number(e.target.value) })} className="w-full" />
        </label>
      </Card>
      <Card>
        <h2 className="text-lg font-extrabold">Voice</h2>
        <Toggle k="computerVoiceForSounds" label="Use the computer voice for sounds that aren’t recorded" help="Less accurate for single sounds. Turn off once you have recorded them." />
        <label className="block py-2"><b>Speech speed</b>
          <input type="range" min={0.5} max={1.1} step={0.05} value={s.speechRate} onChange={(e) => set({ speechRate: Number(e.target.value) })} className="w-full" />
        </label>
        <button className="btn-ghost" onClick={() => speak('The little dragon looked up at the moon.', { rate: s.speechRate })}>🔊 Test</button>
        <label className="mt-3 block"><b>Home language (for English learners)</b>
          <input className="panel mt-1 w-full rounded-xl p-2" value={s.homeLanguage ?? ''} onChange={(e) => set({ homeLanguage: e.target.value })} placeholder="e.g. Spanish" />
          <span className="muted text-xs">Add home-language meanings on the Words tab (meaning field).</span>
        </label>
      </Card>
      <Card className="md:col-span-2">
        <h2 className="text-lg font-extrabold">Reading goals (Explorer)</h2>
        <p className="muted text-sm">Let {profile.name} choose the goal. Each finished book counts.</p>
        <div className="mt-2 flex gap-2">
          <input className="panel flex-1 rounded-xl p-2" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Read 3 chapter books this month" />
          <button className="btn" disabled={!goal.trim()} onClick={() => { update(profile.id, (p) => p.goals.push({ text: goal.trim(), target: Number(goal.match(/\d+/)?.[0] ?? 3), done: 0 })); setGoal('') }}>Add</button>
        </div>
        {profile.goals.map((g, i) => (
          <div key={i} className="mt-2 flex items-center justify-between"><span>{g.text} ({g.done}/{g.target})</span><button className="btn-ghost !min-h-0 !py-1 text-sm" onClick={() => update(profile.id, (p) => p.goals.splice(i, 1))}>Remove</button></div>
        ))}
      </Card>
    </div>
  )
}

function DataPanel() {
  const profiles = useStore((s) => s.profiles)
  return (
    <Card>
      <h2 className="text-lg font-extrabold">Privacy & data</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
        <li>Everything is stored only on this device (IndexedDB). There is no account, no tracking and no ads.</li>
        <li>Nothing your child types, says or records is sent anywhere.</li>
        <li>Sound recordings stay on this device.</li>
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="btn" onClick={() => {
          const blob = new Blob([JSON.stringify({ exported: new Date().toISOString(), profiles }, null, 2)], { type: 'application/json' })
          const a = document.createElement('a')
          a.href = URL.createObjectURL(blob)
          a.download = `soundsprout-${today()}.json`
          a.click()
        }}>Export all data</button>
        <button className="btn-ghost" onClick={async () => {
          if (!confirm('Delete every reader, all progress and all recordings from this device?')) return
          await clear()
          location.hash = ''
          location.reload()
        }}>Delete everything</button>
      </div>
    </Card>
  )
}
