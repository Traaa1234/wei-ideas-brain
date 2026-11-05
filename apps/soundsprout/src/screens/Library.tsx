import { useMemo, useState } from 'react'
import { BOOKS } from '../data/library'
import type { Book } from '../data/books'
import { useDecoder } from '../app/engine'
import { useBookFits, type Fit } from '../app/levels'
import { go } from '../app/router'
import { useStore, type Profile } from '../app/store'
import { Card, Empty, Header, Screen } from '../ui/kit'

export function Library({ profile }: { profile: Profile }) {
  const decoder = useDecoder()
  const fits = useBookFits(decoder, profile)
  const update = useStore((s) => s.update)
  const explorer = profile.band === 'explorer'
  const [genre, setGenre] = useState<string>('all')
  const toRead = profile.toRead ?? []
  const genres = useMemo(() => ['all', ...new Set(BOOKS.map((b) => b.genre))], [])

  const shown = BOOKS.filter((b) => genre === 'all' || b.genre === genre)
  const group = (f: Fit) => shown.filter((b) => fits.get(b.id)?.fit === f)
  // Older readers see Explorer-style books first; little ones see Sprout books first.
  const order = (list: Book[]) => [...list].sort((a, b) => (a.band === profile.band ? -1 : 0) - (b.band === profile.band ? -1 : 0))

  const shelf = (title: string, help: string, list: Book[], fit: Fit) =>
    list.length > 0 && (
      <section className="mt-6">
        <h2 className="text-xl font-extrabold">{title}</h2>
        <p className="muted mb-3 text-sm">{help}</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {order(list).map((b) => {
            const f = fits.get(b.id)
            const entry = profile.reading[b.id]
            const saved = toRead.includes(b.id)
            return (
              <Card key={b.id} onClick={() => go(`read/${b.id}/${entry?.spot ?? 0}`)} className="flex flex-col">
                <div className="flex h-28 items-center justify-center rounded-2xl text-6xl" style={{ background: b.color }}>{b.cover}</div>
                <div className="mt-2 font-extrabold leading-tight">{b.title}</div>
                {b.series && <div className="muted text-xs">{b.series} {b.number ? `#${b.number}` : ''}</div>}
                <div className="mt-auto flex flex-wrap gap-1 pt-2 text-xs">
                  <span className="chip">{b.kind === 'nonfiction' ? 'non-fiction' : b.kind === 'chapter' ? 'chapter book' : b.genre}</span>
                  {entry?.times ? <span className="chip">Read {entry.times}×</span> : null}
                  {entry?.spot ? <span className="chip">Page {entry.spot + 1}</span> : null}
                  {fit === 'stretch' && <span className="chip" style={{ color: 'var(--t-new)' }}>stretch</span>}
                  {f && <span className="chip">{f.pct}%</span>}
                </div>
                {explorer && (
                  <span role="button" tabIndex={0} className="muted mt-2 text-xs underline" onClick={(e) => {
                    e.stopPropagation()
                    update(profile.id, (p) => {
                      const q = (p.toRead ??= [])
                      const i = q.indexOf(b.id)
                      if (i >= 0) q.splice(i, 1)
                      else q.push(b.id)
                    })
                  }}>{saved ? '✓ On my To-read shelf' : '＋ To-read shelf'}</span>
                )}
              </Card>
            )
          })}
        </div>
      </section>
    )

  return (
    <div>
      <Header title="Library" />
      <Screen>
        {explorer && (
          <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Genre">
            {genres.map((g) => (
              <button key={g} className={genre === g ? 'btn !min-h-0 !py-2 text-sm' : 'btn-ghost !min-h-0 !py-2 text-sm'} onClick={() => setGenre(g)}>{g}</button>
            ))}
          </div>
        )}
        {!decoder && <Empty>Getting the books ready…</Empty>}
        {explorer && toRead.length > 0 && shelf('My To-read shelf', 'Books you saved for later.', shown.filter((b) => toRead.includes(b.id)), 'ready')}
        {shelf('Ready to read', 'Every word uses sounds you know.', group('ready'), 'ready')}
        {shelf('Stretch books', 'A few words have a new sound (dotted underline). Tap them for help.', group('stretch'), 'stretch')}
        {shelf('Listen & follow', 'These are harder. Use 🎧 Listen & follow and read along.', group('listen'), 'listen')}
      </Screen>
    </div>
  )
}
