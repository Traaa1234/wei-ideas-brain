import { useMemo, useState } from 'react'
import { BOOKS } from '../data/library'
import { POS_LABEL, TOP_300, WORD_BANK, type Pos } from '../data/words'
import { useDecoder } from '../app/engine'
import { inventoryOf, wordMastered, type Profile } from '../app/store'
import { Header, Screen } from '../ui/kit'
import { WordCard } from '../ui/WordCard'

/** Sprout: My garden. Explorer: Word Collector + Word Explorer bank. */
export function Words({ profile }: { profile: Profile }) {
  const explorer = profile.band === 'explorer'
  const [card, setCard] = useState<string | null>(null)
  const [cat, setCat] = useState<Pos>('noun')
  const decoder = useDecoder()
  const inv = inventoryOf(profile)
  const bank = useMemo(() => WORD_BANK.filter((w) => w.pos === cat), [cat])
  const categories = [...new Set(bank.map((w) => w.category))]
  const mine = profile.myWords

  return (
    <div>
      <Header title={explorer ? 'Word Collector' : 'My garden'} />
      <Screen>
        {!explorer && (
          <section>
            <p className="muted">Every book you finish and every sound you learn grows a plant.</p>
            <div className="mt-4 grid grid-cols-5 gap-2 text-4xl sm:grid-cols-8">
              {profile.lessonsDone.map((id) => <span key={id} title={`Lesson ${id}`}>🌱</span>)}
              {profile.stickers.map((id) => <span key={id} title={BOOKS.find((b) => b.id === id)?.title}>{BOOKS.find((b) => b.id === id)?.cover ?? '🌼'}</span>)}
              {profile.lessonsDone.length + profile.stickers.length === 0 && <span className="muted col-span-5 text-base">Your garden is waiting for its first seed!</span>}
            </div>
          </section>
        )}

        <section className="mt-6">
          <h2 className="text-xl font-extrabold">{explorer ? 'Words I collected' : 'My words'}</h2>
          {mine.length === 0 ? (
            <p className="muted text-sm">{explorer ? 'Tap a word while reading, then “Collect this word”.' : 'A grown-up can add your own words (family names, pets, favourite things).'}</p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {mine.map((w) => (
                <button key={w.word} className="btn-ghost" onClick={() => setCard(w.word)}>
                  {w.emoji} {w.word} {w.status === 'pending' && <span className="muted text-xs">(waiting for a grown-up)</span>}
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-extrabold">Word Explorer</h2>
          <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Part of speech">
            {(['noun', 'verb', 'adjective', ...(explorer ? ['adverb'] : [])] as Pos[]).map((p) => (
              <button key={p} className={cat === p ? 'btn !min-h-0 !py-2' : 'btn-ghost !min-h-0 !py-2'} onClick={() => setCat(p)}>{POS_LABEL[p].icon} {POS_LABEL[p].label}s</button>
            ))}
          </div>
          <p className="muted mt-2 text-sm">{POS_LABEL[cat].help}</p>
          {categories.map((c) => (
            <div key={c} className="mt-4">
              <h3 className="font-bold capitalize">{c}</h3>
              <div className="read mt-1 flex flex-wrap gap-2">
                {bank.filter((w) => w.category === c).map((w) => {
                  const ok = decoder ? decoder.readable(decoder.decode(w.word, inv)) : true
                  return (
                    <button key={w.word} className="btn-ghost !min-h-0 !py-1.5" style={{ opacity: ok ? 1 : 0.55 }} onClick={() => setCard(w.word)}>
                      {w.emoji} {w.word}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </section>
        {card && <WordCard word={card} profile={profile} onClose={() => setCard(null)} />}
      </Screen>
    </div>
  )
}

export function Top300({ profile }: { profile: Profile }) {
  const decoder = useDecoder()
  const inv = inventoryOf(profile)
  const [card, setCard] = useState<string | null>(null)
  const sets = Array.from({ length: Math.ceil(TOP_300.length / 10) }, (_, i) => TOP_300.slice(i * 10, i * 10 + 10))
  const mastered = TOP_300.filter((w) => wordMastered(profile, w.word)).length
  return (
    <div>
      <Header title="Top 300 words" />
      <Screen wide>
        <p className="muted">The most useful words in early reading (Dolch lists). Green = you can read it. Gold = mastered (met 8+ times). ♥ = heart word.</p>
        <p className="mt-1 font-bold">{mastered} of 300 mastered</p>
        <div className="mt-4 space-y-3">
          {sets.map((set, i) => (
            <div key={i}>
              <div className="muted text-xs font-bold">Set {i + 1}</div>
              <div className="read mt-1 grid grid-cols-5 gap-1 sm:grid-cols-10">
                {set.map((w) => {
                  const d = decoder?.decode(w.word, inv)
                  const ok = d && decoder!.readable(d)
                  const gold = wordMastered(profile, w.word)
                  return (
                    <button key={w.word} onClick={() => setCard(w.word)} title={w.source}
                      className="rounded-lg px-1 py-2 text-sm font-bold"
                      style={{ background: gold ? '#fde68a' : ok ? 'var(--soft)' : 'var(--panel)', color: gold ? '#713f12' : 'var(--ink)', border: '1px solid var(--line)' }}>
                      {d?.status === 'heart' ? '♥' : ''}{w.word}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        {card && <WordCard word={card} profile={profile} onClose={() => setCard(null)} />}
      </Screen>
    </div>
  )
}
