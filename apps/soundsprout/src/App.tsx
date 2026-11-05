import { useEffect, useState } from 'react'
import { useRoute, go } from './app/router'
import { loadDecoder, addPronunciation } from './app/engine'
import { useActive, useStore } from './app/store'
import { Profiles } from './screens/Profiles'
import { Home } from './screens/Home'
import { Library } from './screens/Library'
import { Reader } from './screens/Reader'
import { Lesson, LessonMap } from './screens/Lessons'
import { Game, GamesMenu } from './screens/Games'
import { Review } from './screens/Review'
import { Top300, Words } from './screens/Words'
import { Grownups } from './screens/Grownups'
import { Placement } from './screens/Placement'

export function App() {
  const [hydrated, setHydrated] = useState(useStore.persist.hasHydrated())
  const route = useRoute()
  const profile = useActive()
  const profiles = useStore((s) => s.profiles)

  useEffect(() => useStore.persist.onFinishHydration(() => setHydrated(true)), [])
  useEffect(() => {
    // family words with a grown-up's pronunciation go into the live dictionary
    loadDecoder().then(() => profiles.forEach((p) => p.myWords.forEach((w) => w.pron && addPronunciation(w.word, w.pron))))
  }, [profiles])
  useEffect(() => {
    const el = document.documentElement
    el.dataset.band = profile?.band ?? 'sprout'
    el.dataset.font = profile?.settings.dyslexiaFont ? 'dyslexia' : 'default'
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', profile?.band === 'explorer' ? '#0f172a' : '#16a34a')
  }, [profile?.band, profile?.settings.dyslexiaFont])

  if (!hydrated) return null
  const [top, a, b] = route

  if (top === 'grownups') return <Grownups section={a} />
  if (!profile) {
    if (top) go('')
    return <Profiles />
  }
  switch (top) {
    case 'library': return <Library profile={profile} />
    case 'read': return <Reader key={a} profile={profile} bookId={a} pageArg={b} />
    case 'lessons': return <LessonMap profile={profile} />
    case 'lesson': return <Lesson key={a} profile={profile} stepId={a} />
    case 'games': return <GamesMenu profile={profile} />
    case 'game': return <Game key={a} profile={profile} id={a} />
    case 'review': return <Review profile={profile} />
    case 'words': return <Words profile={profile} />
    case 'top300': return <Top300 profile={profile} />
    case 'placement': return <Placement profile={profile} />
    default: return <Home profile={profile} />
  }
}
