// The word card: tap any word to sound it out, see its syllables, its parts and its meaning.
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import type { Book } from '../data/books'
import { BANK_BY_WORD, HOMOPHONES, POS_LABEL, SIMPLE_DEFS, VOCAB_BY_WORD, type Pos } from '../data/words'
import { graphemeLabel } from '../engine/decode'
import { familyOf } from '../engine/morphology'
import { SYLLABLE_TYPE_HELP } from '../engine/syllables'
import { wordInfo } from '../engine/wordinfo'
import { playPhones, speak, wait } from '../app/audio'
import { COMMON, useDecoder } from '../app/engine'
import { posOfWord, relatedForms } from '../app/pos'
import { inventoryOf, useStore, type Profile } from '../app/store'
import { Tiles } from './Tiles'

type Tab = 'sounds' | 'syllables' | 'parts' | 'meaning'

export function WordCard({ word, sentence, book, profile, onClose }: { word: string; sentence?: string; book?: Book; profile: Profile; onClose: () => void }) {
  const decoder = useDecoder()
  const practise = useStore((s) => s.practise)
  const update = useStore((s) => s.update)
  const explorer = profile.band === 'explorer'
  const names = useMemo(() => new Set((book?.names ?? []).map((n) => n.toLowerCase())), [book])
  const info = useMemo(
    () => (decoder ? wordInfo(decoder, word, inventoryOf(profile), { names, common: COMMON }) : null),
    [decoder, word, profile, names],
  )
  const long = (info?.syllables.length ?? 1) >= 2
  const [tab, setTab] = useState<Tab>(long ? 'syllables' : 'sounds')
  const [lit, setLit] = useState<Set<number>>(new Set())
  const [busy, setBusy] = useState(false)
  const [silent, setSilent] = useState(false)
  const s = profile.settings

  useEffect(() => {
    practise(profile.id, `tap:${word.toLowerCase()}`, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word])

  if (!info) return <Overlay onClose={onClose}><p className="p-8 text-center">Loading words…</p></Overlay>
  const d = info.decoded
  const isHeart = d.status === 'heart'
  const isWhole = d.status === 'unknown'

  const playTile = async (i: number) => {
    const t = d.tiles[i]
    const group = new Set([i, ...(t.partner !== undefined ? [t.partner] : [])])
    setLit(group)
    const ok = await playPhones(t.phones, s.computerVoiceForSounds, s.speechRate)
    if (!ok && t.phones.length) setSilent(true)
    await wait(250)
    setLit(new Set())
  }

  const soundOut = async () => {
    if (busy) return
    setBusy(true)
    for (let i = 0; i < d.tiles.length; i++) {
      const t = d.tiles[i]
      if (t.type === 'silent' || t.type === 'mark') continue
      await playTile(i)
    }
    setLit(new Set(d.tiles.map((_, i) => i)))
    await speak(d.word, { rate: s.speechRate })
    setLit(new Set())
    setBusy(false)
  }

  const putTogether = async () => {
    if (busy) return
    setBusy(true)
    for (const syl of info.syllables) {
      setLit(new Set(syl.tiles))
      const phones = syl.tiles.flatMap((i) => d.tiles[i].phones)
      const ok = await playPhones(phones, s.computerVoiceForSounds, s.speechRate)
      if (!ok) await speak(syl.text, { rate: s.speechRate })
      await wait(200)
    }
    setLit(new Set())
    await speak(d.word, { rate: s.speechRate })
    setBusy(false)
  }

  const collect = () => {
    update(profile.id, (p) => {
      if (p.myWords.some((m) => m.word === d.word.toLowerCase())) return
      p.myWords.push({ word: d.word.toLowerCase(), status: 'pending', addedBy: 'child', addedAt: Date.now() })
    })
  }
  const collected = profile.myWords.some((m) => m.word === d.word.toLowerCase())

  const tabs: [Tab, string][] = [
    ['sounds', 'Sounds'],
    ...(long ? ([['syllables', 'Syllables']] as [Tab, string][]) : []),
    ...(info.parts.length > 1 ? ([['parts', 'Parts']] as [Tab, string][]) : []),
    ['meaning', 'Meaning'],
  ]

  return (
    <Overlay onClose={onClose}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="read text-4xl font-extrabold">{d.word}</div>
          <div className="mt-1 flex flex-wrap gap-2 text-sm">
            {isHeart && <span className="chip" style={{ color: 'var(--t-heart)' }}>♥ Heart word</span>}
            {d.status === 'name' && <span className="chip">Name</span>}
            {d.status === 'new' && <span className="chip" style={{ color: 'var(--t-new)' }}>Has a new sound</span>}
            {isWhole && <span className="chip">Say it whole</span>}
          </div>
        </div>
        <button className="btn-ghost" onClick={onClose} aria-label="Close">✕</button>
      </div>

      <div role="tablist" className="mt-3 flex gap-1 overflow-x-auto">
        {tabs.map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
            className={`rounded-full px-4 py-2 text-sm font-bold ${tab === id ? 'btn !min-h-0' : 'btn-ghost !min-h-0'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 min-h-[12rem]">
        {tab === 'sounds' && (
          <div>
            {isWhole ? (
              <p className="read py-6 text-center text-5xl font-extrabold">{d.word}</p>
            ) : (
              <Tiles tiles={d.tiles} lit={lit} onTap={playTile} size={d.tiles.length > 8 ? 1.6 : 2.4} />
            )}
            <div className="flex flex-wrap justify-center gap-2">
              <button className="btn" onClick={soundOut} disabled={busy}>🔊 Sound it out</button>
              <button className="btn-ghost" onClick={() => speak(d.word, { rate: s.speechRate })}>Say the word</button>
            </div>
            {isHeart && (
              <p className="muted mt-3 text-center text-sm">
                The ♥ part is tricky: learn it by heart. The rest sounds out as usual.
              </p>
            )}
            {d.status === 'new' && d.needs.length > 0 && (
              <p className="muted mt-3 text-center text-sm">
                New for you: {d.needs.filter((n) => !n.startsWith('heart:')).map(needLabel).join(', ') || 'a tricky part'}
              </p>
            )}
            {silent && (
              <p className="muted mt-3 text-center text-xs">Sounds are quiet until a grown-up records them (Grown-ups → Sounds).</p>
            )}
          </div>
        )}

        {tab === 'syllables' && (
          <div>
            <div className="read flex flex-wrap justify-center gap-2 text-4xl font-extrabold">
              {info.syllables.map((syl, i) => (
                <button key={i} className={`relative rounded-2xl border-4 px-3 pb-4 pt-1 ${syl.tiles.some((k) => lit.has(k)) ? 'bg-yellow-200 text-yellow-900' : ''}`}
                  style={{ borderColor: 'var(--line)' }}
                  onClick={async () => {
                    setLit(new Set(syl.tiles))
                    const ok = await playPhones(syl.tiles.flatMap((k) => d.tiles[k].phones), s.computerVoiceForSounds, s.speechRate)
                    if (!ok) await speak(syl.text)
                    setLit(new Set())
                  }}>
                  {syl.stressed && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-base" aria-label="stressed">●</span>}
                  {syl.text}
                  <svg className="absolute bottom-1 left-2 right-2 h-3 w-[calc(100%-1rem)]" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden>
                    <path d="M2 2 Q50 12 98 2" stroke="currentColor" strokeWidth="3" fill="none" />
                  </svg>
                </button>
              ))}
            </div>
            <div className="mt-4 flex justify-center">
              <button className="btn" onClick={putTogether} disabled={busy}>🔊 Put it together</button>
            </div>
            <ul className="mt-4 space-y-1 text-sm">
              {[...new Set(info.syllables.map((x) => x.type))].map((t) => (
                <li key={t} className="muted">{SYLLABLE_TYPE_HELP[t]}</li>
              ))}
              <li className="muted">● marks the loud (stressed) syllable.</li>
            </ul>
          </div>
        )}

        {tab === 'parts' && (
          <div>
            <div className="read flex flex-wrap items-center justify-center gap-2 text-3xl font-extrabold">
              {info.parts.map((p, i) => (
                <span key={i} className="flex items-center gap-2">
                  {i > 0 && <span className="muted">+</span>}
                  <span className={`rounded-xl px-3 py-1 ${p.kind === 'root' ? 'bg-amber-200 text-amber-900' : p.kind === 'prefix' ? 'bg-sky-200 text-sky-900' : p.kind === 'suffix' ? 'bg-rose-200 text-rose-900' : 'panel'}`}>
                    {p.base ?? p.text}
                  </span>
                </span>
              ))}
            </div>
            <ul className="mt-4 space-y-3">
              {info.parts.filter((p) => p.morpheme).map((p, i) => (
                <li key={i} className="panel rounded-2xl p-3">
                  <b>{p.morpheme!.form}</b> <span className="chip">{p.kind}</span> <span className="muted text-sm">({p.morpheme!.origin})</span>
                  <div>means “{p.morpheme!.meaning}”</div>
                  {p.rule && <div className="muted text-sm">Spelling rule: {p.rule}.</div>}
                  <div className="muted text-sm">Also in: {familyOf(p.morpheme!.form, COMMON).filter((x) => x !== d.word.toLowerCase()).join(', ')}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === 'meaning' && <Meaning word={d.word} sentence={sentence} book={book} profile={profile} explorer={explorer} />}
      </div>

      {explorer && (
        <div className="mt-4 border-t pt-3" style={{ borderColor: 'var(--line)' }}>
          <button className="btn-ghost w-full" onClick={collect} disabled={collected}>
            {collected ? '✓ In your Word Collector' : '＋ Collect this word'}
          </button>
        </div>
      )}
    </Overlay>
  )
}

function needLabel(id: string) {
  if (id === 'schwa') return 'the lazy “uh” vowel'
  if (id === 'syl2') return 'two-syllable words'
  if (id === 'syl3') return 'long words'
  return graphemeLabel(id)
}

function Meaning({ word, sentence, book, profile, explorer }: { word: string; sentence?: string; book?: Book; profile: Profile; explorer: boolean }) {
  const w = word.toLowerCase()
  const [pos, setPos] = useState<Pos | undefined>()
  const [forms, setForms] = useState<string[]>([])
  const vocab = VOCAB_BY_WORD.get(w)
  const mine = profile.myWords.find((m) => m.word === w && m.status === 'approved')
  const bank = BANK_BY_WORD.get(w)
  const def = mine?.definition ?? book?.glossary?.find((g) => g.word === w)?.def ?? (vocab ? (!explorer && vocab.sprout) || vocab.def : undefined) ?? SIMPLE_DEFS[w]
  const example = mine?.example ?? vocab?.examples[0] ?? sentence
  const emoji = mine?.emoji ?? bank?.emoji
  const homophones = HOMOPHONES.find((h) => h.words.includes(w))?.words.filter((x) => x !== w)

  useEffect(() => {
    let live = true
    posOfWord(w).then((p) => {
      if (!live) return
      setPos((mine?.pos as Pos) ?? p)
      relatedForms(w, (mine?.pos as Pos) ?? p).then((f) => live && setForms(f))
    })
    return () => {
      live = false
    }
  }, [w, mine])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {emoji && <span className="text-5xl" aria-hidden>{emoji}</span>}
        {pos && (
          <span className="chip text-base">
            {POS_LABEL[pos].icon} {POS_LABEL[pos].label}
          </span>
        )}
      </div>
      {pos && <p className="muted text-sm">{POS_LABEL[pos].help}</p>}
      {def ? <p className="text-lg"><b>Means:</b> {def}</p> : <p className="muted">No meaning saved yet. A grown-up can add one in Grown-ups → Words.</p>}
      {example && <p className="read text-lg italic">“{example}”</p>}
      {forms.length > 0 && <p><b>Other forms:</b> {forms.join(', ')}</p>}
      {explorer && vocab?.synonyms && <p><b>Similar:</b> {vocab.synonyms.join(', ')}</p>}
      {explorer && vocab?.antonyms && <p><b>Opposite:</b> {vocab.antonyms.join(', ')}</p>}
      {explorer && homophones && <p><b>Sounds the same:</b> {homophones.join(', ')} (different spelling and meaning)</p>}
      {explorer && vocab?.subject && <span className="chip">{vocab.subject} word</span>}
    </div>
  )
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <motion.div
        role="dialog"
        aria-modal="true"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="panel max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl p-5 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </div>
  )
}
