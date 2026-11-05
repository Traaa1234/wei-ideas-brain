import { useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { go } from '../app/router'
import { Header, Screen } from '../ui/kit'

export const ROUNDS = 5

/** Frame for every game: rounds, gentle feedback, no lives, no timers. */
export function useRounds() {
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState<null | { ok: boolean; text: string }>(null)
  return {
    round, score, feedback, done: round >= ROUNDS,
    answer(ok: boolean, text?: string) {
      if (feedback) return
      if (ok) setScore((s) => s + 1)
      setFeedback({ ok, text: text ?? (ok ? pick(['Yes!', 'Great sounding out!', 'You got it!', 'Super!']) : 'Nice try! Let us look together.') })
    },
    next() {
      setFeedback(null)
      setRound((r) => r + 1)
    },
    restart() {
      setRound(0)
      setScore(0)
      setFeedback(null)
    },
  }
}
const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)]

export function GameShell({ title, help, game, children }: { title: string; help: string; game: ReturnType<typeof useRounds>; children: ReactNode }) {
  return (
    <div>
      <Header title={title} back="games" right={<span className="chip">{Math.min(game.round + 1, ROUNDS)} / {ROUNDS}</span>} />
      <Screen>
        {game.done ? (
          <div className="py-10 text-center">
            <div className="text-7xl">🌟</div>
            <p className="mt-3 text-2xl font-extrabold">You finished! {game.score} out of {ROUNDS}.</p>
            <div className="mt-6 flex justify-center gap-3">
              <button className="btn" onClick={game.restart}>Play again</button>
              <button className="btn-ghost" onClick={() => go('games')}>More games</button>
            </div>
          </div>
        ) : (
          <>
            <p className="muted mb-4">{help}</p>
            {children}
            {game.feedback && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="panel mt-6 flex items-center justify-between gap-3 rounded-3xl p-4">
                <span className="text-lg font-bold">{game.feedback.ok ? '✅' : '🤔'} {game.feedback.text}</span>
                <button className="btn" onClick={game.next}>Next →</button>
              </motion.div>
            )}
          </>
        )}
      </Screen>
    </div>
  )
}
