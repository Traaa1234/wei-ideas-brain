// Reading settings, open to everyone (no gate).
import { STEPS } from '../engine/curriculum'
import { inventoryUpTo } from '../engine/curriculum'
import { speak } from '../app/audio'
import { DEFAULT_SETTINGS, useStore, type Profile } from '../app/store'
import { Card, Header, Screen } from '../ui/kit'

export function Settings({ profile }: { profile: Profile }) {
  const update = useStore((s) => s.update)
  const s = profile.settings
  const set = (patch: Partial<Profile['settings']>) => update(profile.id, (p) => Object.assign(p.settings, patch))
  const Toggle = ({ k, label, help }: { k: keyof Profile['settings']; label: string; help?: string }) => (
    <label className="flex items-start gap-3 py-2">
      <input type="checkbox" className="mt-1 h-6 w-6" checked={!!s[k]} onChange={(e) => set({ [k]: e.target.checked } as Partial<Profile['settings']>)} />
      <span><b>{label}</b>{help && <span className="muted block text-sm">{help}</span>}</span>
    </label>
  )
  return (
    <div>
      <Header title="⚙️ Settings" />
      <Screen>
        <div className="grid gap-4">
          <Card>
            <h2 className="text-lg font-extrabold">Look</h2>
            <div className="mt-2 flex gap-2">
              {(['sprout', 'explorer'] as const).map((b) => (
                <button key={b} className={profile.band === b ? 'btn' : 'btn-ghost'} onClick={() => update(profile.id, (p) => (p.band = b))}>
                  {b === 'sprout' ? '🌱 Sprout (4–7)' : '🧭 Explorer (7–10)'}
                </button>
              ))}
            </div>
            <p className="muted mt-2 text-sm">Explorer has darker colours, missions, chapter books and word-part games.</p>
          </Card>
          <Card>
            <h2 className="text-lg font-extrabold">Reading</h2>
            <Toggle k="dyslexiaFont" label="Dyslexia-friendly font" />
            <Toggle k="spacing" label="Extra letter and line spacing" />
            <Toggle k="ruler" label="Reading ruler" help="A highlighted band follows your finger or mouse." />
            <Toggle k="posMode" label="Word Explorer underlines" help="Nouns, verbs and adjectives get different underlines." />
            <label className="block py-2"><b>Text size</b>
              <input type="range" min={0.8} max={1.6} step={0.1} value={s.textSize} onChange={(e) => set({ textSize: Number(e.target.value) })} className="w-full" />
            </label>
          </Card>
          <Card>
            <h2 className="text-lg font-extrabold">Voice</h2>
            <label className="block py-2"><b>Speech speed</b>
              <input type="range" min={0.5} max={1.1} step={0.05} value={s.speechRate} onChange={(e) => set({ speechRate: Number(e.target.value) })} className="w-full" />
            </label>
            <button className="btn-ghost" onClick={() => speak('The little dragon looked up at the moon.', { rate: s.speechRate })}>🔊 Test</button>
          </Card>
          <Card>
            <h2 className="text-lg font-extrabold">Start over</h2>
            <p className="muted text-sm">Clears books read, lessons, collected words and sounds learned on this device.</p>
            <button className="btn-ghost mt-2" onClick={() => {
              if (!confirm('Start over? All progress on this device will be cleared.')) return
              const inv = inventoryUpTo(STEPS[0].id)
              update(profile.id, (p) => {
                Object.assign(p, {
                  step: STEPS[0].id, graphemes: [...inv.graphemes], skills: [...inv.skills], heart: [...inv.heart],
                  mastery: {}, reading: {}, myWords: [], minutes: {}, lessonsDone: [], stickers: [], goals: [], toRead: [],
                  settings: { ...DEFAULT_SETTINGS },
                })
              })
            }}>Start over</button>
          </Card>
          <p className="muted text-center text-xs">Everything stays on this device. No account, no ads, no tracking.</p>
        </div>
      </Screen>
    </div>
  )
}
