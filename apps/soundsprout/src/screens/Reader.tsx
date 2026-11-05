import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Book, Page } from '../data/books'
import { BOOKS } from '../data/library'
import { POS_LABEL, type Pos } from '../data/words'
import { tokenize } from '../engine/decode'
import { speak, stopSpeaking } from '../app/audio'
import { useDecoder } from '../app/engine'
import { go } from '../app/router'
import { tagText } from '../app/pos'
import { inventoryOf, useStore, type Profile } from '../app/store'
import { Header, Screen } from '../ui/kit'
import { WordCard } from '../ui/WordCard'

export function Reader({ profile, bookId, pageArg }: { profile: Profile; bookId: string; pageArg?: string }) {
  const book = BOOKS.find((b) => b.id === bookId)
  const update = useStore((s) => s.update)
  const addMinutes = useStore((s) => s.addMinutes)
  const expose = useStore((s) => s.expose)
  const entry = profile.reading[bookId]
  const [mode, setMode] = useState<'myself' | 'listen'>(entry?.mode ?? 'myself')
  const page = pageArg === 'end' ? -1 : Math.max(0, Number(pageArg ?? entry?.spot ?? 0) || 0)
  const started = useRef(Date.now())

  useEffect(() => {
    started.current = Date.now()
    return () => {
      stopSpeaking()
      addMinutes(profile.id, (Date.now() - started.current) / 60000)
    }
  }, [profile.id, addMinutes])

  useEffect(() => {
    if (!book || page < 0) return
    update(profile.id, (p) => {
      const e = (p.reading[book.id] ??= { bookId: book.id, times: 0, spot: 0, mode, lastRead: Date.now() })
      e.spot = page
      e.mode = mode
      e.lastRead = Date.now()
    })
    expose(profile.id, tokenize(book.pages[page]?.text ?? '').filter((t) => t.word).map((t) => t.text))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book?.id, page])

  if (!book) return <Screen><Header title="Book not found" /></Screen>
  if (page < 0 || page >= book.pages.length) return <EndOfBook book={book} profile={profile} />

  const chapters = book.pages.map((p, i) => (p.chapter ? i : -1)).filter((i) => i >= 0)
  const chapterIdx = chapters.filter((i) => i <= page).length - 1
  const chapterStart = chapters[chapterIdx] ?? 0
  const chapterEnd = chapters[chapterIdx + 1] ?? book.pages.length
  const next = () => {
    stopSpeaking()
    if (page + 1 >= book.pages.length) {
      update(profile.id, (p) => {
        const e = p.reading[book.id]
        e.times++
        e.spot = 0
        if (!p.stickers.includes(book.id)) p.stickers.push(book.id)
        for (const g of p.goals) g.done++
      })
      go(`read/${book.id}/end`)
    } else go(`read/${book.id}/${page + 1}`)
  }

  return (
    <div className="min-h-screen">
      <Header
        title={book.title}
        back="library"
        right={
          <div className="flex gap-1 rounded-full p-1 panel" role="group" aria-label="Reading mode">
            <button className={`rounded-full px-3 py-2 text-sm font-bold ${mode === 'myself' ? 'btn !min-h-0' : ''}`} onClick={() => { stopSpeaking(); setMode('myself') }}>
              📖 Read myself
            </button>
            <button className={`rounded-full px-3 py-2 text-sm font-bold ${mode === 'listen' ? 'btn !min-h-0' : ''}`} onClick={() => setMode('listen')}>
              🎧 Listen & follow
            </button>
          </div>
        }
      />
      <Screen>
        {chapters.length > 0 && (
          <p className="muted mb-2 text-sm font-bold">Chapter {chapterIdx + 1} · page {page - chapterStart + 1} of {chapterEnd - chapterStart}</p>
        )}
        <AnimatePresence mode="wait">
          <motion.div key={page} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <PageView page={book.pages[page]} book={book} profile={profile} mode={mode} chapterNo={chapterIdx + 1} />
          </motion.div>
        </AnimatePresence>
        <nav className="mt-8 flex items-center justify-between gap-2">
          <button className="btn-ghost" disabled={page === 0} onClick={() => go(`read/${book.id}/${page - 1}`)} aria-label="Previous page">← Back</button>
          <Dots count={chapterEnd - chapterStart} at={page - chapterStart} />
          <button className="btn" onClick={next}>{page + 1 >= book.pages.length ? 'The end ✓' : 'Next →'}</button>
        </nav>
      </Screen>
      {profile.settings.ruler && <Ruler />}
    </div>
  )
}

function Dots({ count, at }: { count: number; at: number }) {
  return (
    <div className="flex flex-wrap justify-center gap-1" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="h-2.5 w-2.5 rounded-full" style={{ background: i <= at ? 'var(--accent)' : 'var(--line)' }} />
      ))}
    </div>
  )
}

function Ruler() {
  const [y, setY] = useState(window.innerHeight / 2)
  useEffect(() => {
    const on = (e: PointerEvent) => setY(e.clientY)
    window.addEventListener('pointermove', on)
    window.addEventListener('pointerdown', on)
    return () => {
      window.removeEventListener('pointermove', on)
      window.removeEventListener('pointerdown', on)
    }
  }, [])
  return <div className="ruler" style={{ top: y - 26 }} aria-hidden />
}

function PageView({ page, book, profile, mode, chapterNo }: { page: Page; book: Book; profile: Profile; mode: 'myself' | 'listen'; chapterNo: number }) {
  const decoder = useDecoder()
  const inv = useMemo(() => inventoryOf(profile), [profile])
  const names = useMemo(() => new Set(book.names.map((n) => n.toLowerCase())), [book])
  const [card, setCard] = useState<{ word: string; sentence: string } | null>(null)
  const [speaking, setSpeaking] = useState<number>(-1)
  const [pos, setPos] = useState<Pos[]>([])
  const s = profile.settings
  const tokens = useMemo(() => tokenize(page.text), [page.text])

  // word index → char offset, for Listen & follow highlighting
  const offsets = useMemo(() => {
    const out: number[] = []
    let at = 0
    for (const t of tokens) {
      if (t.word) out.push(at)
      at += t.text.length
    }
    return out
  }, [tokens])

  useEffect(() => {
    if (!s.posMode) return setPos([])
    tagText(page.text).then(setPos)
  }, [page.text, s.posMode])

  useEffect(() => {
    if (mode !== 'listen') return
    let live = true
    speak(page.text, {
      rate: s.speechRate,
      onWord: (ci) => {
        if (!live) return
        let idx = 0
        for (let i = 0; i < offsets.length; i++) if (offsets[i] <= ci) idx = i
        setSpeaking(idx)
      },
    }).then(() => live && setSpeaking(-1))
    return () => {
      live = false
      stopSpeaking()
      setSpeaking(-1)
    }
  }, [mode, page.text, offsets, s.speechRate])

  const sentenceOf = (charAt: number) => {
    const parts = page.text.split(/(?<=[.!?]["”]?)\s+/)
    let acc = 0
    for (const p of parts) {
      if (charAt <= acc + p.length) return p
      acc += p.length + 1
    }
    return page.text
  }

  let wordNo = -1
  let charAt = 0
  const size = 1.6 * s.textSize * (profile.band === 'explorer' ? 0.85 : 1)
  return (
    <article>
      {page.chapter && <h2 className="read mb-3 text-2xl font-extrabold">Chapter {chapterNo}: {page.chapter}</h2>}
      {page.heading && <h2 className="read mb-3 text-2xl font-extrabold">{page.heading}</h2>}
      {page.art && (
        <div className="panel mb-5 flex min-h-[9rem] items-center justify-center rounded-3xl text-6xl" role="img" aria-label="picture">
          {page.art}
        </div>
      )}
      {page.caption && <p className="muted -mt-3 mb-4 text-center text-sm italic">{page.caption}</p>}
      <p className={`read font-semibold ${s.spacing ? 'spaced' : ''}`} style={{ fontSize: `${size}rem`, lineHeight: 1.7 }}>
        {tokens.map((t, i) => {
          const start = charAt
          charAt += t.text.length
          if (!t.word) return <span key={i}>{t.text}</span>
          wordNo++
          const n = wordNo
          const d = decoder?.decode(t.text, inv, { names })
          const isNew = d && !decoder!.readable(d)
          const p = pos[n]
          const posClass = p && s.posMode ? POS_LABEL[p].underline : ''
          return (
            <span
              key={i}
              role="button"
              tabIndex={0}
              className={`word ${isNew ? 'new' : ''} ${speaking === n ? 'speaking' : ''} ${posClass}`}
              onClick={() => setCard({ word: t.text, sentence: sentenceOf(start) })}
              onKeyDown={(e) => e.key === 'Enter' && setCard({ word: t.text, sentence: sentenceOf(start) })}
            >
              {t.text}
            </span>
          )
        })}
      </p>
      {page.fact && (
        <aside className="mt-6 rounded-3xl border-4 border-dashed p-4" style={{ borderColor: 'var(--accent)' }}>
          <b>⚡ Fact box:</b> <span className="read">{page.fact}</span>
        </aside>
      )}
      {s.posMode && (
        <p className="muted mt-6 text-sm">
          Word Explorer: <span className="pos-noun">noun</span> · <span className="pos-verb">verb</span> · <span className="pos-adj">adjective</span> · <span className="pos-adv">adverb</span>
        </p>
      )}
      {card && <WordCard word={card.word} sentence={card.sentence} book={book} profile={profile} onClose={() => setCard(null)} />}
    </article>
  )
}

function EndOfBook({ book, profile }: { book: Book; profile: Profile }) {
  const update = useStore((s) => s.update)
  const entry = profile.reading[book.id]
  const explorer = profile.band === 'explorer'
  const questions = (book.questions ?? []).slice(0, explorer ? 5 : 2)
  const [answers, setAnswers] = useState<Record<number, number | string>>(entry?.answers ?? {})
  const [collected, setCollected] = useState<Record<string, string[]>>({})
  const save = (fn: (e: NonNullable<Profile['reading'][string]>) => void) =>
    update(profile.id, (p) => {
      const e = (p.reading[book.id] ??= { bookId: book.id, times: 1, spot: 0, mode: 'myself', lastRead: Date.now() })
      fn(e)
    })

  useEffect(() => {
    // "Words I collected": the story's nouns, verbs and adjectives
    const text = book.pages.map((p) => p.text).join(' ')
    tagText(text).then((tags) => {
      const words = tokenize(text).filter((t) => t.word).map((t) => t.text.toLowerCase())
      const out: Record<string, string[]> = { noun: [], verb: [], adjective: [] }
      const names = new Set(book.names.map((n) => n.toLowerCase()))
      words.forEach((w, i) => {
        const p = tags[i]
        if (p && out[p] && !out[p].includes(w) && !names.has(w) && w.length > 2) out[p].push(w)
      })
      setCollected(out)
    })
  }, [book])

  return (
    <div>
      <Header title="The end!" back="library" />
      <Screen>
        <div className="py-4 text-center">
          <div className="text-7xl">{book.cover}</div>
          <p className="mt-2 text-2xl font-extrabold">You read {book.title}!</p>
          <p className="muted">Read {entry?.times ?? 1} {entry?.times === 1 ? 'time' : 'times'}{entry?.mode === 'listen' ? ' (listened along)' : ''}</p>
        </div>

        {questions.length > 0 && (
          <section className="mt-4 space-y-4">
            <h2 className="text-xl font-extrabold">Think about it</h2>
            {questions.map((q, i) => (
              <div key={i} className="panel rounded-3xl p-4">
                <p className="read text-lg font-bold">{q.q}</p>
                {q.options ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {q.options.map((o, k) => {
                      const picked = answers[i] === k
                      const right = picked && k === q.answer
                      return (
                        <button key={k} className={picked ? 'btn' : 'btn-ghost'} style={picked && !right ? { background: '#fde68a', color: '#713f12' } : undefined}
                          onClick={() => {
                            const a = { ...answers, [i]: k }
                            setAnswers(a)
                            save((e) => (e.answers = a))
                            useStore.getState().practise(profile.id, `comp:${q.type}`, k === q.answer)
                          }}>
                          {o} {right ? '✓' : picked ? '— look back and try again' : ''}
                        </button>
                      )
                    })}
                  </div>
                ) : explorer ? (
                  <textarea className="panel mt-3 w-full rounded-2xl p-3" rows={2} placeholder="Write 1–3 sentences (or tell a grown-up)"
                    defaultValue={(answers[i] as string) ?? ''}
                    onBlur={(ev) => {
                      const a = { ...answers, [i]: ev.target.value }
                      setAnswers(a)
                      save((e) => (e.answers = a))
                    }} />
                ) : (
                  <p className="muted mt-2 text-sm">Talk about it with a grown-up.</p>
                )}
              </div>
            ))}
          </section>
        )}

        {Object.values(collected).some((x) => x.length) && (
          <section className="mt-6">
            <h2 className="text-xl font-extrabold">Words I collected</h2>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              {(['noun', 'verb', 'adjective'] as Pos[]).map((p) => (
                <div key={p} className="panel rounded-3xl p-3">
                  <b>{POS_LABEL[p].icon} {POS_LABEL[p].label}s</b>
                  <p className="read mt-1">{(collected[p] ?? []).slice(0, 12).join(', ') || '—'}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {!explorer && book.retell && (
          <section className="panel mt-6 rounded-3xl p-4">
            <b>For a grown-up:</b> {book.retell}
          </section>
        )}

        {explorer && book.organiser && <Organiser book={book} profile={profile} />}

        {explorer && (
          <section className="panel mt-6 rounded-3xl p-4">
            <h2 className="text-xl font-extrabold">My review</h2>
            <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} className="text-4xl" aria-label={`${n} stars`} onClick={() => save((e) => (e.rating = n))}>
                  {(entry?.rating ?? 0) >= n ? '★' : '☆'}
                </button>
              ))}
            </div>
            <input className="panel mt-3 w-full rounded-2xl p-3" placeholder="One line about this book" defaultValue={entry?.review ?? ''}
              onBlur={(ev) => save((e) => (e.review = ev.target.value))} />
          </section>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button className="btn" onClick={() => go(`read/${book.id}/0`)}>Read it again</button>
          <button className="btn-ghost" onClick={() => go('library')}>Back to the library</button>
        </div>
      </Screen>
    </div>
  )
}

const ORGANISERS = {
  'story-map': ['Characters', 'Setting (where and when)', 'Problem', 'Main events', 'Solution'],
  'main-idea': ['Main idea', 'Detail 1', 'Detail 2', 'Detail 3', 'Something I want to find out'],
}

function Organiser({ book, profile }: { book: Book; profile: Profile }) {
  const update = useStore((s) => s.update)
  const fields = ORGANISERS[book.organiser!]
  const saved = profile.reading[book.id]?.organiser ?? {}
  return (
    <section className="panel mt-6 rounded-3xl p-4">
      <h2 className="text-xl font-extrabold">{book.organiser === 'story-map' ? '🗺️ Story map' : '🧩 Main idea and details'}</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {fields.map((f) => (
          <label key={f} className="block">
            <span className="text-sm font-bold">{f}</span>
            <textarea className="panel mt-1 w-full rounded-2xl p-2" rows={2} defaultValue={saved[f] ?? ''}
              onBlur={(ev) => update(profile.id, (p) => {
                const e = (p.reading[book.id] ??= { bookId: book.id, times: 1, spot: 0, mode: 'myself', lastRead: Date.now() })
                e.organiser = { ...(e.organiser ?? {}), [f]: ev.target.value }
              })} />
          </label>
        ))}
      </div>
    </section>
  )
}
