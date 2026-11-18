import { useMemo, useState } from 'react'
import { BOOKS } from '../data/library'
import { POS_LABEL, TOP_WORDS, TOP_WORDS_SOURCE, WORD_BANK, type Pos } from '../data/words'
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
            <p className="muted text-sm">{explorer ? 'Tap a word while reading, then “Collect this word”.' : 'Finish books and lessons to grow your garden.'}</p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {mine.map((w) => (
                <button key={w.word} className="btn-ghost" onClick={() => setCard(w.word)}>
                  {w.emoji} {w.word} 
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

const TOP_TABS = [100, 300, 500, 1000]

export function Top300({ profile }: { profile: Profile }) {
  const decoder = useDecoder()
  const inv = inventoryOf(profile)
  const [card, setCard] = useState<string | null>(null)
  const [limit, setLimit] = useState(300)
  const [filter, setFilter] = useState<'all' | 'readable' | 'heart' | 'new'>('all')
  const list = TOP_WORDS.slice(0, limit)
  const status = (w: string) => {
    const d = decoder?.decode(w, inv)
    return !d ? 'new' : d.status === 'heart' ? 'heart' : decoder!.readable(d) ? 'readable' : 'new'
  }
  const shown = list.filter((w) => filter === 'all' || status(w.word) === filter)
  const readable = list.filter((w) => status(w.word) !== 'new').length
  const mastered = list.filter((w) => wordMastered(profile, w.word)).length
  const sets = Array.from({ length: Math.ceil(shown.length / 50) }, (_, i) => shown.slice(i * 50, i * 50 + 50))
  return (
    <div>
      <Header title={`Top ${limit} words`} />
      <Screen wide>
        <p className="muted">The words used most often in everyday English, ranked from most common (#1) down. Learning these unlocks most of what you read.</p>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="How many words">
          {TOP_TABS.map((n) => (
            <button key={n} className={limit === n ? 'btn !min-h-0 !py-2' : 'btn-ghost !min-h-0 !py-2'} onClick={() => setLimit(n)}>Top {n}</button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-sm" role="group" aria-label="Show">
          {([['all', 'All'], ['readable', '✓ I can read'], ['heart', '♥ Heart words'], ['new', '★ New for me']] as const).map(([k, l]) => (
            <button key={k} className={filter === k ? 'btn !min-h-0 !py-1.5 text-sm' : 'btn-ghost !min-h-0 !py-1.5 text-sm'} onClick={() => setFilter(k)}>{l}</button>
          ))}
        </div>
        <p className="mt-3 font-bold">You can read {readable} of {limit} · {mastered} mastered (met 8+ times in books)</p>
        <p className="muted text-sm">Green = you can sound it out. ♥ = heart word (one tricky part). Gold = mastered. Tap any word to hear it and sound it out.</p>
        <div className="mt-4 space-y-4">
          {sets.map((set, i) => (
            <div key={i}>
              <div className="muted text-xs font-bold">#{set[0].rank}–{set[set.length - 1].rank}</div>
              <div className="read mt-1 grid grid-cols-3 gap-1 sm:grid-cols-5 md:grid-cols-10">
                {set.map((w) => {
                  const st = status(w.word)
                  const gold = wordMastered(profile, w.word)
                  return (
                    <button key={w.word} onClick={() => setCard(w.word)} title={`Rank ${w.rank}${w.dolch ? ` · Dolch ${w.dolch}` : ''}`}
                      className="flex flex-col items-center rounded-lg px-1 py-1.5 text-sm font-bold"
                      style={{ background: gold ? '#fde68a' : st !== 'new' ? 'var(--soft)' : 'var(--panel)', color: gold ? '#713f12' : 'var(--ink)', border: '1px solid var(--line)' }}>
                      <span className="text-[10px] font-normal opacity-60">#{w.rank}</span>
                      <span>{st === 'heart' ? '♥' : ''}{w.word}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
          {!shown.length && <p className="muted">No words here yet.</p>}
        </div>
        <p className="muted mt-6 text-xs">Ranking: {TOP_WORDS_SOURCE}.</p>
        {card && <WordCard word={card} profile={profile} onClose={() => setCard(null)} />}
      </Screen>
    </div>
  )
}
