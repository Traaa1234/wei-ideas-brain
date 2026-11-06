import { useMemo } from 'react'
import { STEPS } from '../engine/curriculum'
import { BOOKS } from '../data/library'
import { go } from '../app/router'
import { dueItems, type Profile } from '../app/store'
import { Card, Screen } from '../ui/kit'

export function Home({ profile }: { profile: Profile }) {
  const explorer = profile.band === 'explorer'
  const due = dueItems(profile).length
  const nextStep = STEPS.find((s) => !profile.lessonsDone.includes(s.id) && s.graphemes.some((g) => !profile.graphemes.includes(g))) ?? STEPS.find((s) => !profile.lessonsDone.includes(s.id))
  const resume = useMemo(() => Object.values(profile.reading).filter((r) => r.spot > 0).sort((a, b) => b.lastRead - a.lastRead)[0], [profile.reading])
  const resumeBook = resume && BOOKS.find((b) => b.id === resume.bookId)

  return (
    <Screen>
      <header className="flex items-center gap-3 py-5">
        <span className="text-5xl" aria-hidden>{explorer ? '🧭' : '🌱'}</span>
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold">SoundSprout</h1>
          <p className="muted text-sm">{explorer ? 'Explorer' : 'Sprout'} · {profile.stickers.length} {profile.stickers.length === 1 ? 'book' : 'books'} finished</p>
        </div>
        <button className="btn-ghost text-sm" onClick={() => go('settings')} aria-label="Settings">⚙️ Settings</button>
      </header>

      {resumeBook && (
        <Card onClick={() => go(`read/${resumeBook.id}/${resume!.spot}`)} className="mb-4 flex w-full items-center gap-4">
          <span className="text-5xl">{resumeBook.cover}</span>
          <div className="flex-1">
            <div className="muted text-sm font-bold">📖 Pick up where you left off</div>
            <div className="text-xl font-extrabold">{resumeBook.title}</div>
            <div className="muted text-sm">
              You stopped on page {resume!.spot + 1} of {resumeBook.pages.length}. Tap to keep reading.
            </div>
          </div>
          <span className="text-2xl" aria-hidden>→</span>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Tile emoji="📚" title="Read" sub="Your library" onClick={() => go('library')} />
        <Tile emoji={explorer ? '🧭' : '🗺️'} title={explorer ? 'Missions' : 'Learn'} sub={nextStep ? (explorer ? nextStep.mission : `Next: ${nextStep.mission}`) : 'All done!'} onClick={() => go('lessons')} />
        <Tile emoji="🎮" title="Play" sub={explorer ? 'Word games' : 'Sound games'} onClick={() => go('games')} />
        <Tile emoji="🔁" title="Review" sub={due ? `${due} to practise` : 'All fresh'} onClick={() => go('review')} />
        <Tile emoji={explorer ? '🗃️' : '🌻'} title={explorer ? 'Word Collector' : 'My garden'} sub={explorer ? `${profile.myWords.length} words` : `${profile.stickers.length + profile.lessonsDone.length} plants`} onClick={() => go('words')} />
        <Tile emoji="💯" title="Top 300" sub="High-frequency words" onClick={() => go('top300')} />
      </div>

      {explorer && profile.goals.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-lg font-extrabold">My goals</h2>
          {profile.goals.map((g, i) => (
            <div key={i} className="panel mb-2 rounded-2xl p-3">
              <div className="flex justify-between font-bold"><span>{g.text}</span><span>{Math.min(g.done, g.target)}/{g.target}</span></div>
              <div className="mt-2 h-3 rounded-full" style={{ background: 'var(--line)' }}>
                <div className="h-3 rounded-full" style={{ width: `${Math.min(100, (g.done / g.target) * 100)}%`, background: 'var(--accent)' }} />
              </div>
            </div>
          ))}
        </section>
      )}
    </Screen>
  )
}

function Tile({ emoji, title, sub, onClick }: { emoji: string; title: string; sub: string; onClick: () => void }) {
  return (
    <Card onClick={onClick} className="min-h-[9rem]">
      <div className="text-5xl" aria-hidden>{emoji}</div>
      <div className="mt-2 text-xl font-extrabold">{title}</div>
      <div className="muted truncate text-sm">{sub}</div>
    </Card>
  )
}
