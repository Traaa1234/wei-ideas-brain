// App state, kept on the device in IndexedDB. No account needed.
import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import { del, get, set } from 'idb-keyval'
import { inventoryUpTo, STEPS, type Band, type Inventory } from '../engine/curriculum'

const idbStorage: StateStorage = {
  getItem: async (name) => {
    try {
      return (await get(name)) ?? null
    } catch {
      return null
    }
  },
  setItem: async (name, value) => {
    try {
      await set(name, value)
    } catch {
      /* private mode: keep going in memory */
    }
  },
  removeItem: async (name) => {
    try {
      await del(name)
    } catch {
      /* ignore */
    }
  },
}

export interface MasteryItem {
  strength: number      // 0..5
  seen: number
  correct: number
  lastSeen: number      // ms
  nextReview: number    // ms
  exposures: number     // times met while reading
}

export interface MyWord {
  word: string
  pos?: string
  category?: string
  definition?: string
  example?: string
  emoji?: string
  status: 'approved' | 'pending'
  addedBy: 'grown-up' | 'child'
  addedAt: number
  introduceOn?: string  // yyyy-mm-dd
  pron?: string[]       // pronunciation chosen by a grown-up (words not in the dictionary)
}

export interface ReadingEntry {
  bookId: string
  times: number
  spot: number          // page to resume at
  mode: 'myself' | 'listen'
  lastRead: number
  rating?: number
  review?: string
  answers?: Record<number, number | string>
  organiser?: Record<string, string>
}

export interface Settings {
  dyslexiaFont: boolean
  textSize: number       // 1 = normal
  spacing: boolean
  ruler: boolean
  computerVoiceForSounds: boolean
  speechRate: number
  posMode: boolean       // Word Explorer: part-of-speech underlines
  homeLanguage?: string
}

export interface Profile {
  id: string
  name: string
  avatar: string
  band: Band
  step: string
  graphemes: string[]
  skills: string[]
  heart: string[]
  decodingStep?: string
  comprehensionBand?: Band
  placedAt?: number
  createdAt: number
  settings: Settings
  mastery: Record<string, MasteryItem>
  reading: Record<string, ReadingEntry>
  myWords: MyWord[]
  minutes: Record<string, number>   // yyyy-mm-dd → minutes
  lessonsDone: string[]
  stickers: string[]
  goals: { text: string; target: number; done: number }[]
  toRead?: string[]
}

export const DEFAULT_SETTINGS: Settings = {
  dyslexiaFont: false,
  textSize: 1,
  spacing: false,
  ruler: false,
  computerVoiceForSounds: true,
  speechRate: 0.85,
  posMode: false,
}

export function newProfile(name: string, avatar: string, step = 's1'): Profile {
  const inv = inventoryUpTo(step)
  const band = STEPS.find((s) => s.id === step)?.band ?? 'sprout'
  return {
    id: Math.random().toString(36).slice(2, 10),
    name, avatar, band, step,
    graphemes: [...inv.graphemes], skills: [...inv.skills], heart: [...inv.heart],
    createdAt: Date.now(), settings: { ...DEFAULT_SETTINGS },
    mastery: {}, reading: {}, myWords: [], minutes: {}, lessonsDone: [], stickers: [], goals: [],
  }
}

export function inventoryOf(p: Profile): Inventory {
  return { graphemes: new Set(p.graphemes), skills: new Set(p.skills), heart: new Set(p.heart.map((h) => h.toLowerCase())) }
}

export const today = () => new Date().toISOString().slice(0, 10)
const DAY = 86400000
const INTERVALS = [1, 3, 7, 14, 30]

interface State {
  profiles: Profile[]
  activeId: string | null
  adultUntil: number
  addProfile: (p: Profile) => void
  removeProfile: (id: string) => void
  setActive: (id: string | null) => void
  update: (id: string, fn: (p: Profile) => void) => void
  unlockAdult: () => void
  lockAdult: () => void
  practise: (id: string, item: string, correct: boolean) => void
  expose: (id: string, words: string[]) => void
  addMinutes: (id: string, mins: number) => void
}

export const useStore = create<State>()(
  persist(
    (setState, getState) => ({
      profiles: [],
      activeId: null,
      adultUntil: 0,
      addProfile: (p) => setState((s) => ({ profiles: [...s.profiles, p], activeId: p.id })),
      removeProfile: (id) => setState((s) => ({ profiles: s.profiles.filter((p) => p.id !== id), activeId: s.activeId === id ? null : s.activeId })),
      setActive: (id) => setState({ activeId: id }),
      update: (id, fn) =>
        setState((s) => ({
          profiles: s.profiles.map((p) => {
            if (p.id !== id) return p
            const copy: Profile = structuredClone(p)
            fn(copy)
            return copy
          }),
        })),
      unlockAdult: () => setState({ adultUntil: Date.now() + 10 * 60000 }),
      lockAdult: () => setState({ adultUntil: 0 }),
      practise: (id, item, correct) =>
        getState().update(id, (p) => {
          const now = Date.now()
          const m = p.mastery[item] ?? { strength: 0, seen: 0, correct: 0, lastSeen: 0, nextReview: 0, exposures: 0 }
          m.seen++
          if (correct) {
            m.correct++
            m.strength = Math.min(5, m.strength + 1)
          } else {
            m.strength = Math.max(0, m.strength - 2)
          }
          m.lastSeen = now
          m.nextReview = now + INTERVALS[Math.max(0, Math.min(INTERVALS.length - 1, m.strength - 1))] * DAY * (correct ? 1 : 0.0001)
          p.mastery[item] = m
        }),
      expose: (id, words) =>
        getState().update(id, (p) => {
          for (const w of words) {
            const key = `word:${w.toLowerCase()}`
            const m = p.mastery[key] ?? { strength: 0, seen: 0, correct: 0, lastSeen: 0, nextReview: 0, exposures: 0 }
            m.exposures++
            p.mastery[key] = m
          }
        }),
      addMinutes: (id, mins) =>
        getState().update(id, (p) => {
          p.minutes[today()] = Math.round(((p.minutes[today()] ?? 0) + mins) * 10) / 10
        }),
    }),
    { name: 'soundsprout', storage: createJSONStorage(() => idbStorage), version: 1 },
  ),
)

export function useActive(): Profile | null {
  return useStore((s) => s.profiles.find((p) => p.id === s.activeId) ?? null)
}

/** Items due for review now, weakest first. */
export function dueItems(p: Profile, now = Date.now()) {
  return Object.entries(p.mastery)
    .filter(([, m]) => m.seen > 0 && m.nextReview <= now)
    .sort((a, b) => a[1].strength - b[1].strength)
    .map(([k]) => k)
}

/** A word counts as mastered after 8 exposures in context and a strength of 3. */
export function wordMastered(p: Profile, word: string) {
  const m = p.mastery[`word:${word.toLowerCase()}`]
  return !!m && m.exposures >= 8 && (m.strength >= 3 || m.seen === 0)
}
