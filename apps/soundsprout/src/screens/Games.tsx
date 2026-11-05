import { go } from '../app/router'
import type { Profile } from '../app/store'
import { Card, Header, Screen } from '../ui/kit'
import * as S from '../games/sprout'
import * as E from '../games/explorer'

export const GAMES = {
  'sound-pop': { title: 'Sound Pop', emoji: '🫧', band: 'sprout', about: 'Hear a sound, pop its letters.', C: S.SoundPop },
  'word-builder': { title: 'Word Builder', emoji: '🧱', band: 'sprout', about: 'Build the word you hear from sound tiles.', C: S.WordBuilder },
  'real-or-alien': { title: 'Real or Alien?', emoji: '👽', band: 'sprout', about: 'Sound it out: real word or alien word?', C: S.RealOrAlien },
  'syllable-chop': { title: 'Syllable Chop', emoji: '🔪', band: 'sprout', about: 'Chop long words into syllables.', C: S.SyllableChop },
  'silly-sentences': { title: 'Silly Sentences', emoji: '🎰', band: 'sprout', about: 'Adjective + noun + verb = silly!', C: S.SillySentences },
  'word-sort': { title: 'Word Sort', emoji: '🧺', band: 'sprout', about: 'Nouns, verbs and adjectives into baskets.', C: S.WordSort },
  'word-lab': { title: 'Word Lab', emoji: '🧪', band: 'explorer', about: 'Prefix + base + suffix: make real words.', C: E.WordLab },
  'root-detective': { title: 'Root Detective', emoji: '🔎', band: 'explorer', about: 'Crack what a word root means.', C: E.RootDetective },
  'context-clue': { title: 'Context Clue Case', emoji: '🕵️', band: 'explorer', about: 'Work out a word from its sentence.', C: E.ContextClue },
  'shades': { title: 'Shades of Meaning', emoji: '🌡️', band: 'explorer', about: 'Order words from weak to strong.', C: E.ShadesOfMeaning },
  'homophones': { title: 'Homophone Hero', emoji: '🦸', band: 'explorer', about: 'their / there / they’re and friends.', C: E.HomophoneHero },
  'upgrade': { title: 'Sentence Upgrade', emoji: '⬆️', band: 'explorer', about: 'Make a plain sentence shine.', C: E.SentenceUpgrade },
  'spelling-bee': { title: 'Spelling Bee', emoji: '🐝', band: 'explorer', about: 'Hear it, spell it, see what to fix.', C: E.SpellingBee },
} as const

export function GamesMenu({ profile }: { profile: Profile }) {
  const explorer = profile.band === 'explorer'
  const list = Object.entries(GAMES).sort(([, a], [, b]) => (a.band === profile.band ? -1 : 0) - (b.band === profile.band ? -1 : 0))
  return (
    <div>
      <Header title="Games" />
      <Screen>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {list.filter(([, g]) => explorer || g.band === 'sprout').map(([id, g]) => (
            <Card key={id} onClick={() => go(`game/${id}`)}>
              <div className="text-5xl">{g.emoji}</div>
              <div className="mt-2 font-extrabold">{g.title}</div>
              <div className="muted text-sm">{g.about}</div>
            </Card>
          ))}
        </div>
      </Screen>
    </div>
  )
}

export function Game({ profile, id }: { profile: Profile; id: string }) {
  const g = GAMES[id as keyof typeof GAMES]
  if (!g) return <Screen><Header title="Game not found" back="games" /></Screen>
  const C = g.C
  return <C profile={profile} />
}
