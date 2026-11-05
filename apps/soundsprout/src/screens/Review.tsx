import { useMemo, useState } from 'react'
import { GRAPHEME_BY_ID } from '../engine/graphemes'
import { playPhones, speak } from '../app/audio'
import { useDecoder } from '../app/engine'
import { decodableWords, sample, shuffle } from '../app/pick'
import { dueItems, inventoryOf, useStore, type Profile } from '../app/store'
import { Empty, Header, Screen } from '../ui/kit'
import { Tiles } from '../ui/Tiles'

/** Spaced review: weak sounds and tapped words come back (1, 3, 7, 14, 30 days). */
export function Review({ profile }: { profile: Profile }) {
  const decoder = useDecoder()
  const practise = useStore((s) => s.practise)
  const due = useMemo(() => dueItems(profile).slice(0, 8), []) // eslint-disable-line react-hooks/exhaustive-deps
  const [k, setK] = useState(0)
  const item = due[k]
  const inv = inventoryOf(profile)

  const round = useMemo(() => {
    if (!item || !decoder) return null
    if (GRAPHEME_BY_ID.has(item)) {
      const words = decodableWords(decoder, inv, { containing: [item] })
      const others = decodableWords(decoder, inv).filter((w) => !words.includes(w))
      if (!words.length || others.length < 2) return { kind: 'sound' as const, g: item }
      const right = sample(words, 1)[0]
      return { kind: 'pick' as const, g: item, right, options: shuffle([right, ...sample(others, 2)]) }
    }
    const word = item.replace(/^(tap|word|spell):/, '')
    if (/^(tap|word|spell):/.test(item)) return { kind: 'word' as const, word }
    return { kind: 'skip' as const }
  }, [item, decoder]) // eslint-disable-line react-hooks/exhaustive-deps

  const next = (ok: boolean) => {
    practise(profile.id, item, ok)
    setK(k + 1)
  }

  return (
    <div>
      <Header title="Review" />
      <Screen>
        {!item ? <Empty>Nothing to review right now. Great job! 🌟</Empty> : !round ? <Empty>Loading…</Empty> : (
          <div>
            <p className="muted mb-4">{k + 1} of {due.length}</p>
            {round.kind === 'pick' && (
              <>
                <p className="text-lg">Which word has <b className="read">{GRAPHEME_BY_ID.get(round.g)!.letters.replace('_', '-')}</b>?</p>
                <div className="read mt-4 flex flex-wrap gap-3 text-3xl font-extrabold">
                  {round.options.map((o) => <button key={o} className="btn-ghost !text-3xl" onClick={() => next(o === round.right)}>{o}</button>)}
                </div>
              </>
            )}
            {round.kind === 'sound' && (
              <div className="text-center">
                <div className="read text-7xl font-extrabold">{GRAPHEME_BY_ID.get(round.g)!.letters.replace('_', '-')}</div>
                <p className="mt-2">Say its sound. Then check.</p>
                <button className="btn-ghost mt-4" onClick={() => playPhones(GRAPHEME_BY_ID.get(round.g)!.sounds[0], profile.settings.computerVoiceForSounds)}>🔊 Check</button>
                <div className="mt-4 flex justify-center gap-3"><button className="btn" onClick={() => next(true)}>I knew it</button><button className="btn-ghost" onClick={() => next(false)}>Not yet</button></div>
              </div>
            )}
            {round.kind === 'word' && decoder && (
              <div className="text-center">
                <p className="mb-3">Read this word.</p>
                <Tiles tiles={decoder.decode(round.word, inv).tiles} onTap={(i) => playPhones(decoder.decode(round.word, inv).tiles[i].phones, profile.settings.computerVoiceForSounds)} />
                <button className="btn-ghost" onClick={() => speak(round.word)}>🔊 Check</button>
                <div className="mt-4 flex justify-center gap-3"><button className="btn" onClick={() => next(true)}>I read it</button><button className="btn-ghost" onClick={() => next(false)}>Not yet</button></div>
              </div>
            )}
            {round.kind === 'skip' && <div className="text-center"><button className="btn" onClick={() => next(true)}>Next</button></div>}
          </div>
        )}
      </Screen>
    </div>
  )
}
