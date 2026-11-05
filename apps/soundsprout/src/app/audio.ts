// Sounds: human recordings per phone (recorded in Grown-ups, kept in IndexedDB).
// Without a recording, a computer-voice stand-in is used only if the grown-up allows it.
// Whole words and sentences use the device's speech synthesis.
import { get, set, del, keys } from 'idb-keyval'
import { PHONE_SAY } from '../engine/graphemes'

const urlCache = new Map<string, string>()
const key = (phone: string) => `rec:${phone}`

export async function getRecording(phone: string): Promise<string | null> {
  if (urlCache.has(phone)) return urlCache.get(phone)!
  try {
    const blob = (await get(key(phone))) as Blob | undefined
    if (!blob) return null
    const url = URL.createObjectURL(blob)
    urlCache.set(phone, url)
    return url
  } catch {
    return null
  }
}

export async function saveRecording(phone: string, blob: Blob) {
  await set(key(phone), blob)
  urlCache.delete(phone)
}

export async function deleteRecording(phone: string) {
  await del(key(phone))
  urlCache.delete(phone)
}

export async function recordedPhones(): Promise<Set<string>> {
  try {
    return new Set((await keys()).map(String).filter((k) => k.startsWith('rec:')).map((k) => k.slice(4)))
  } catch {
    return new Set()
  }
}

function playUrl(url: string) {
  return new Promise<void>((resolve) => {
    const a = new Audio(url)
    a.onended = () => resolve()
    a.onerror = () => resolve()
    a.play().catch(() => resolve())
  })
}

let voice: SpeechSynthesisVoice | null = null
function pickVoice() {
  if (voice || typeof speechSynthesis === 'undefined') return voice
  const vs = speechSynthesis.getVoices()
  voice = vs.find((v) => v.lang === 'en-US' && /female|samantha|aria|jenny/i.test(v.name)) ?? vs.find((v) => v.lang.startsWith('en-US')) ?? vs.find((v) => v.lang.startsWith('en')) ?? null
  return voice
}

export function speak(text: string, opts: { rate?: number; onWord?: (charIndex: number) => void } = {}) {
  return new Promise<void>((resolve) => {
    if (typeof speechSynthesis === 'undefined') return resolve()
    speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'
    u.rate = opts.rate ?? 0.85
    const v = pickVoice()
    if (v) u.voice = v
    if (opts.onWord) u.onboundary = (e) => e.name === 'word' && opts.onWord!(e.charIndex)
    u.onend = () => resolve()
    u.onerror = () => resolve()
    speechSynthesis.speak(u)
  })
}

export function stopSpeaking() {
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel()
}

/** Play one tile's sound(s). Returns false if it stayed silent (no recording, fallback off). */
export async function playPhones(phones: string[], allowVoice: boolean, rate = 0.8): Promise<boolean> {
  let played = false
  for (const ph of phones) {
    const url = await getRecording(ph)
    if (url) {
      await playUrl(url)
      played = true
    } else if (allowVoice && PHONE_SAY[ph]) {
      await speak(PHONE_SAY[ph], { rate })
      played = true
    }
  }
  return played
}

export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
