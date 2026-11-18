// The sound-it-out coach: say each sound (with a mouth tip), stretch them together, say it fast.
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ARTIC_BY_PHONE } from '../data/articulation'
import { BANK_BY_WORD } from '../data/words'
import type { Tile } from '../engine/decode'
import { playPhones, speak } from '../app/audio'
import type { Profile } from '../app/store'
import { tileClass } from './Tiles'

type Step = 'sounds' | 'stretch' | 'fast' | 'done'

export function BlendCoach({ word, tiles, profile, onDone }: { word: string; tiles: Tile[]; profile: Profile; onDone?: () => void }) {
  const sounding = tiles.map((t, i) => i).filter((i) => tiles[i].type !== 'silent' && tiles[i].type !== 'mark')
  const [step, setStep] = useState<Step>('sounds')
  const [at, setAt] = useState(0)          // index into `sounding`
  const [busy, setBusy] = useState(false)
  const s = profile.settings
  const current = sounding[at]
  const t = tiles[current]
  const tip = t ? ARTIC_BY_PHONE.get(t.phones[0]) : undefined
  const isStretchy = t?.phones.every((p) => ARTIC_BY_PHONE.get(p)?.kind !== 'bouncy')

  useEffect(() => {
    setStep('sounds')
    setAt(0)
  }, [word])

  const playCurrent = async () => {
    if (!t || busy) return
    setBusy(true)
    await playPhones(t.phones, s.computerVoiceForSounds, isStretchy ? 0.55 : s.speechRate)
    setBusy(false)
  }
  useEffect(() => {
    if (step === 'sounds') playCurrent()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [at, step])

  const gap = step === 'sounds' ? 18 : step === 'stretch' ? 6 : 0
  const lit = (i: number) => (step === 'sounds' ? i === current || tiles[i].partner === current : step !== 'done')

  return (
    <div className="panel rounded-3xl p-4">
      <div className="read flex flex-wrap items-end justify-center pb-2" style={{ gap: tiles.length > 4 ? gap * 0.6 : gap, fontSize: tiles.length > 6 ? '1.4rem' : tiles.length > 4 ? '1.8rem' : '2.25rem' }}>
        {tiles.map((tile, i) => (
          <motion.span key={i} layout className={`${tileClass(tile)} ${lit(i) ? 'lit' : ''}`} style={{ opacity: step === 'sounds' && i > current && tile.partner !== current ? 0.45 : 1 }}>
            {tile.text}
          </motion.span>
        ))}
      </div>

      {step === 'sounds' && t && (
        <div className="mt-3 text-center">
          <p className="text-lg font-extrabold">Step 1: say each sound</p>
          <p className="mt-1">This sound is <b className="read">{t.text}</b>{tip ? <> as in <b>{tip.example}</b> {tip.emoji}</> : null}.</p>
          {tip && (
            <p className="muted mt-1 text-sm">👄 {tip.mouth} {tip.voice ? '🎤 Voice on: your throat buzzes.' : '🌬️ Just air: no buzz.'}<br />{tip.tip}</p>
          )}
          <p className="mt-1 text-sm">{isStretchy ? '〰️ Stretchy sound: you can hold it.' : '⚡ Bouncy sound: keep it short, no "uh".'}</p>
          <div className="mt-3 flex justify-center gap-2">
            <button className="btn-ghost" onClick={playCurrent}>🔊 Again</button>
            <button className="btn" onClick={() => (at + 1 < sounding.length ? setAt(at + 1) : setStep('stretch'))}>
              {at + 1 < sounding.length ? 'Next sound →' : 'Now blend →'}
            </button>
          </div>
        </div>
      )}

      {step === 'stretch' && (
        <div className="mt-3 text-center">
          <p className="text-lg font-extrabold">Step 2: stretch them together</p>
          <p className="mt-1">Slide from one sound into the next without stopping, like a slow slide. Hold the stretchy sounds.</p>
          <div className="mt-3 flex justify-center gap-2">
            <button className="btn-ghost" disabled={busy} onClick={async () => { setBusy(true); await speak(word, { rate: 0.35 }); setBusy(false) }}>🐢 Hear it slow</button>
            <button className="btn" onClick={() => { setStep('fast'); speak(word, { rate: s.speechRate }) }}>Say it fast →</button>
          </div>
        </div>
      )}

      {step === 'fast' && (
        <div className="mt-3 text-center">
          <p className="text-lg font-extrabold">Step 3: say it fast!</p>
          <p className="read mt-2 text-4xl font-extrabold">{word} {BANK_BY_WORD.get(word.toLowerCase())?.emoji ?? ''}</p>
          <p className="mt-1">Does it sound like a real word you know? Then you read it!</p>
          <div className="mt-3 flex justify-center gap-2">
            <button className="btn-ghost" onClick={() => speak(word, { rate: s.speechRate })}>🔊 Hear it</button>
            <button className="btn-ghost" onClick={() => { setStep('sounds'); setAt(0) }}>↺ Again</button>
            <button className="btn" onClick={() => { setStep('done'); onDone?.() }}>I read it ✓</button>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="mt-3 text-center">
          <p className="text-2xl font-extrabold">🌟 You sounded it out!</p>
          <button className="btn-ghost mt-2" onClick={() => { setStep('sounds'); setAt(0) }}>↺ Do it again</button>
        </div>
      )}
    </div>
  )
}
