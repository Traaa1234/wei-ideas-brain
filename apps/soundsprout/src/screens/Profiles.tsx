import { useStore } from '../app/store'
import { go } from '../app/router'
import { Card, Screen } from '../ui/kit'

export function Profiles() {
  const profiles = useStore((s) => s.profiles)
  const setActive = useStore((s) => s.setActive)
  return (
    <Screen>
      <div className="py-10 text-center">
        <div className="text-6xl" aria-hidden>🌱</div>
        <h1 className="mt-2 text-4xl font-extrabold">SoundSprout</h1>
        <p className="muted mt-1">Sound it out. Read it yourself.</p>
      </div>
      <h2 className="mb-3 text-xl font-extrabold">Who is reading?</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {profiles.map((p) => (
          <Card key={p.id} onClick={() => { setActive(p.id); go('') }} className="text-center">
            <div className="text-6xl">{p.avatar}</div>
            <div className="mt-2 text-xl font-extrabold">{p.name}</div>
            <div className="muted text-sm">{p.band === 'explorer' ? 'Explorer' : 'Sprout'}</div>
          </Card>
        ))}
        <Card onClick={() => go('grownups/new')} className="flex flex-col items-center justify-center text-center">
          <div className="text-5xl">＋</div>
          <div className="mt-2 font-bold">Add a reader</div>
          <div className="muted text-xs">(grown-up)</div>
        </Card>
      </div>
      <p className="muted mt-10 text-center text-xs">Everything stays on this device. No account, no ads, no tracking.</p>
    </Screen>
  )
}
