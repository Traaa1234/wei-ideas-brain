// Sound School: a phonics tutorial that teaches how to SAY sounds and blend them,
// so children decode words instead of memorising them.
import { useMemo, useState, type ReactNode } from 'react'
import { ARTICULATION, type Articulation, type SoundKind } from '../data/articulation'
import { syllabify } from '../engine/syllables'
import { playPhones, speak } from '../app/audio'
import { COMMON, useDecoder } from '../app/engine'
import { go } from '../app/router'
import { useStore, type Profile } from '../app/store'
import { BlendCoach } from '../ui/BlendCoach'
import { Card, Header, Screen } from '../ui/kit'
import { Tiles } from '../ui/Tiles'

interface Chapter {
  id: string
  emoji: string
  title: string
  body: (p: { profile: Profile }) => ReactNode
}

const CHAPTERS: Chapter[] = [
  { id: 'names', emoji: '🔤', title: 'Letters make sounds', body: (p) => <NamesVsSounds {...p} /> },
  { id: 'kinds', emoji: '〰️', title: 'Stretchy and bouncy sounds', body: (p) => <StretchyBouncy {...p} /> },
  { id: 'mouth', emoji: '👄', title: 'How to make every sound', body: (p) => <MouthGuide {...p} /> },
  { id: 'blend', emoji: '🛝', title: 'Blend it: sound it out', body: (p) => <BlendLesson {...p} words={['sat', 'map', 'sun', 'fish', 'frog', 'jump']} /> },
  { id: 'teams', emoji: '🤝', title: 'Two letters, one sound', body: (p) => <Teams {...p} /> },
  { id: 'magic-e', emoji: '✨', title: 'Magic e', body: (p) => <MagicE {...p} /> },
  { id: 'chunks', emoji: '🔪', title: 'Long words: chop them up', body: (p) => <Chunks {...p} /> },
  { id: 'heart', emoji: '♥', title: 'Heart words', body: (p) => <HeartWords {...p} /> },
  { id: 'no-guess', emoji: '🔎', title: 'Say it, don’t guess it', body: () => <NoGuessing /> },
]

export function SoundSchool({ profile, chapter }: { profile: Profile; chapter?: string }) {
  const update = useStore((s) => s.update)
  const idx = CHAPTERS.findIndex((c) => c.id === chapter)
  if (idx < 0) {
    return (
      <div>
        <Header title="🎓 Sound School" />
        <Screen>
          <p className="muted">Learn how to <b>say</b> each sound and how to <b>blend</b> sounds into words. Then you can read words you have never seen, without memorising them.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {CHAPTERS.map((c, i) => {
              const done = profile.lessonsDone.includes(`school:${c.id}`)
              return (
                <Card key={c.id} onClick={() => go(`school/${c.id}`)} className="flex items-center gap-3">
                  <span className="text-4xl" aria-hidden>{c.emoji}</span>
                  <div className="flex-1">
                    <div className="muted text-xs font-bold">Lesson {i + 1}</div>
                    <div className="font-extrabold">{c.title}</div>
                  </div>
                  {done && <span aria-label="done">✅</span>}
                </Card>
              )
            })}
          </div>
        </Screen>
      </div>
    )
  }
  const c = CHAPTERS[idx]
  const next = CHAPTERS[idx + 1]
  const finish = () => {
    update(profile.id, (p) => {
      if (!p.lessonsDone.includes(`school:${c.id}`)) p.lessonsDone.push(`school:${c.id}`)
    })
    go(next ? `school/${next.id}` : 'school')
  }
  return (
    <div>
      <Header title={`${c.emoji} ${c.title}`} back="school" right={<span className="chip">{idx + 1}/{CHAPTERS.length}</span>} />
      <Screen>
        {c.body({ profile })}
        <div className="mt-8 flex justify-between gap-2">
          <button className="btn-ghost" onClick={() => go(idx > 0 ? `school/${CHAPTERS[idx - 1].id}` : 'school')}>← Back</button>
          <button className="btn" onClick={finish}>{next ? `Next: ${next.title} →` : 'Finish ✓'}</button>
        </div>
      </Screen>
    </div>
  )
}

const sayPhone = (profile: Profile, phones: string[], slow = false) => playPhones(phones, profile.settings.computerVoiceForSounds, slow ? 0.5 : profile.settings.speechRate)

function Quiz({ question, options, answer, explain }: { question: string; options: string[]; answer: number; explain: string }) {
  const [picked, setPicked] = useState<number | null>(null)
  return (
    <div className="panel mt-6 rounded-3xl p-4">
      <p className="font-extrabold">🧠 Try it: {question}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o, i) => (
          <button key={o} className={picked === i ? 'btn' : 'btn-ghost'} onClick={() => setPicked(i)}>{o}</button>
        ))}
      </div>
      {picked !== null && <p className="mt-2 font-bold">{picked === answer ? '✅ Yes! ' : '🤔 Not quite. '}{explain}</p>}
    </div>
  )
}

function NamesVsSounds({ profile }: { profile: Profile }) {
  const letters: [string, string, string[]][] = [['b', 'bee', ['B']], ['m', 'em', ['M']], ['s', 'ess', ['S']], ['t', 'tee', ['T']], ['a', 'ay', ['AE']], ['f', 'eff', ['F']]]
  return (
    <div>
      <p className="text-lg">Every letter has a <b>name</b> and a <b>sound</b>. When we read, we use the <b>sound</b>.</p>
      <p className="muted mt-1">The letter b is <i>called</i> “bee”, but in <b>bat</b> it says /b/. If you said the names, “bee-ay-tee” wouldn’t sound like bat at all!</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {letters.map(([l, name, ph]) => (
          <div key={l} className="panel rounded-3xl p-3 text-center">
            <div className="read text-5xl font-extrabold">{l}</div>
            <div className="mt-2 flex justify-center gap-2">
              <button className="btn-ghost !min-h-0 !py-1.5 text-sm" onClick={() => speak(name)}>Name</button>
              <button className="btn !min-h-0 !py-1.5 text-sm" onClick={() => sayPhone(profile, ph)}>Sound</button>
            </div>
          </div>
        ))}
      </div>
      <Quiz question="Which is the SOUND that m makes?" options={['“em”', '“mmm”']} answer={1} explain="m says mmm. “Em” is its name." />
    </div>
  )
}

function SoundGrid({ list, profile }: { list: Articulation[]; profile: Profile }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {list.map((x) => (
        <button key={x.phone} className="panel rounded-2xl p-3 text-left" onClick={async () => { await sayPhone(profile, [x.phone], x.kind === 'stretchy'); await speak(x.example, { rate: profile.settings.speechRate }) }}>
          <div className="read text-2xl font-extrabold">{x.spellings[0]} <span className="text-xl">{x.emoji}</span></div>
          <div className="muted text-xs">as in {x.example}</div>
        </button>
      ))}
    </div>
  )
}

function StretchyBouncy({ profile }: { profile: Profile }) {
  const stretchy = ARTICULATION.filter((a) => a.kind === 'stretchy').slice(0, 8)
  const bouncy = ARTICULATION.filter((a) => a.kind === 'bouncy')
  return (
    <div>
      <p className="text-lg">Some sounds are <b>stretchy</b>: you can hold them for a long time, like <b>mmmm</b> or <b>sssss</b>.</p>
      <p className="text-lg">Some sounds are <b>bouncy</b>: they pop out quickly, like <b>p</b> or <b>t</b>. Keep them short. Say <b>b</b>, not “buh”!</p>
      <h3 className="mt-4 font-extrabold">〰️ Stretchy</h3>
      <SoundGrid list={stretchy} profile={profile} />
      <h3 className="mt-4 font-extrabold">⚡ Bouncy</h3>
      <SoundGrid list={bouncy} profile={profile} />
      <Quiz question="Is s stretchy or bouncy?" options={['〰️ Stretchy', '⚡ Bouncy']} answer={0} explain="You can hold sssss like a snake." />
      <Quiz question="How should you say the sound of b?" options={['“buh”', 'a quick “b”']} answer={1} explain="Keep bouncy sounds short. Adding “uh” makes blending hard: “buh-a-tuh” isn’t bat." />
    </div>
  )
}

function MouthGuide({ profile }: { profile: Profile }) {
  const [kind, setKind] = useState<SoundKind>('vowel')
  const list = ARTICULATION.filter((a) => a.kind === kind)
  return (
    <div>
      <p className="text-lg">Your lips, tongue, teeth and voice make every sound. Use a mirror! Put your hand on your throat: if it buzzes, your voice is on.</p>
      <div className="mt-3 flex flex-wrap gap-2" role="group">
        {([['vowel', '🅰️ Vowels'], ['stretchy', '〰️ Stretchy'], ['bouncy', '⚡ Bouncy']] as const).map(([k, l]) => (
          <button key={k} className={kind === k ? 'btn !min-h-0 !py-2' : 'btn-ghost !min-h-0 !py-2'} onClick={() => setKind(k)}>{l}</button>
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {list.map((x) => (
          <div key={x.phone} className="panel rounded-3xl p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="read text-3xl font-extrabold">{x.spellings.join(' · ')}</div>
              <span className="text-3xl" aria-hidden>{x.emoji}</span>
            </div>
            <p className="mt-1">👄 {x.mouth}</p>
            <p className="muted text-sm">{x.voice ? '🎤 Voice on (throat buzzes)' : '🌬️ Just air (no buzz)'}{x.tip ? ` · ${x.tip}` : ''}</p>
            <div className="mt-2 flex gap-2">
              <button className="btn !min-h-0 !py-1.5 text-sm" onClick={() => sayPhone(profile, [x.phone], x.kind !== 'bouncy')}>🔊 Sound</button>
              <button className="btn-ghost !min-h-0 !py-1.5 text-sm" onClick={() => speak(x.example, { rate: profile.settings.speechRate })}>{x.example}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BlendLesson({ profile, words }: { profile: Profile; words: string[] }) {
  const decoder = useDecoder()
  const [i, setI] = useState(0)
  if (!decoder) return <p className="muted">Loading…</p>
  const w = words[i % words.length]
  return (
    <div>
      <p className="text-lg"><b>Blending</b> is how you read a new word: say each sound, slide them together, then say it fast.</p>
      <ol className="mt-2 list-decimal pl-6">
        <li>Point to each sound and say it.</li>
        <li>Stretch the sounds together like a slide: no stops in between (mmmaaat).</li>
        <li>Say it fast. Does it sound like a word you know?</li>
      </ol>
      <div className="mt-4">
        <BlendCoach key={w} word={w} tiles={decoder.explain(w).tiles} profile={profile} />
      </div>
      <div className="mt-3 text-center">
        <button className="btn-ghost" onClick={() => setI(i + 1)}>Try another word ({(i % words.length) + 1}/{words.length}) →</button>
      </div>
    </div>
  )
}

function Teams({ profile }: { profile: Profile }) {
  const decoder = useDecoder()
  const groups: [string, string[]][] = [
    ['Consonant teams', ['ship', 'chip', 'thin', 'ring', 'duck']],
    ['Vowel teams', ['rain', 'feet', 'boat', 'night', 'moon']],
    ['Bossy r', ['car', 'fork', 'bird', 'her', 'fur']],
  ]
  if (!decoder) return <p className="muted">Loading…</p>
  return (
    <div>
      <p className="text-lg">Sometimes two or three letters team up to make <b>one</b> sound. <b>s</b> + <b>h</b> doesn’t say “s-h”. It says <b>shh</b>!</p>
      <p className="muted">The bar under a tile means the letters work together. Tap a tile to hear its one sound.</p>
      {groups.map(([title, words]) => (
        <section key={title} className="mt-4">
          <h3 className="font-extrabold">{title}</h3>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {words.map((w) => {
              const tiles = decoder.explain(w).tiles
              return (
                <div key={w} className="panel rounded-2xl p-2">
                  <Tiles tiles={tiles} size={1.8} onTap={(k) => sayPhone(profile, tiles[k].phones)} />
                  <div className="text-center"><button className="btn-ghost !min-h-0 !py-1 text-sm" onClick={() => speak(w)}>🔊 {w}</button></div>
                </div>
              )
            })}
          </div>
        </section>
      ))}
      <Quiz question="How many sounds are in “ship”?" options={['3', '4']} answer={0} explain="sh-i-p: sh is one sound, so ship has 3 sounds and 4 letters." />
    </div>
  )
}

function MagicE({ profile }: { profile: Profile }) {
  const pairs = [['cap', 'cape'], ['kit', 'kite'], ['hop', 'hope'], ['cub', 'cube'], ['pin', 'pine'], ['tap', 'tape']]
  const decoder = useDecoder()
  const [withE, setWithE] = useState<Record<string, boolean>>({})
  if (!decoder) return <p className="muted">Loading…</p>
  return (
    <div>
      <p className="text-lg">An <b>e</b> at the end of a word is usually silent, but it has magic: it reaches back over one letter and makes the vowel <b>say its name</b>.</p>
      <p className="muted">cap → cape: the a stops saying “a” (apple) and says “ay”. The arc joins the vowel and its magic e.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {pairs.map(([a, b]) => {
          const on = withE[a]
          const w = on ? b : a
          return (
            <div key={a} className="panel rounded-3xl p-3 text-center">
              <Tiles tiles={decoder.explain(w).tiles} size={2} onTap={(k) => sayPhone(profile, decoder.explain(w).tiles[k].phones)} />
              <div className="flex justify-center gap-2">
                <button className="btn !min-h-0 !py-1.5 text-sm" onClick={() => { setWithE({ ...withE, [a]: !on }); speak(on ? a : b) }}>{on ? '− take e away' : '＋ add magic e'}</button>
                <button className="btn-ghost !min-h-0 !py-1.5 text-sm" onClick={() => speak(w)}>🔊 {w}</button>
              </div>
            </div>
          )
        })}
      </div>
      <Quiz question="What does “hope” say?" options={['hop', 'hope (the o says its name)']} answer={1} explain="The magic e makes o say “oh”." />
    </div>
  )
}

function Chunks({ profile }: { profile: Profile }) {
  const decoder = useDecoder()
  const words = ['rabbit', 'sunset', 'tiger', 'dragon', 'table', 'fantastic', 'butterfly']
  const [i, setI] = useState(0)
  const w = words[i % words.length]
  const syl = useMemo(() => {
    if (!decoder) return []
    const d = decoder.explain(w)
    return syllabify(d.word, d.tiles, (x) => COMMON.has(x))
  }, [decoder, w])
  return (
    <div>
      <p className="text-lg">Long words are just short chunks stuck together. Each chunk (syllable) has <b>one vowel sound</b>.</p>
      <ol className="mt-2 list-decimal pl-6">
        <li>Find the vowels.</li>
        <li>Chop between them.</li>
        <li>Read each chunk.</li>
        <li>Put the chunks together, then say it fast.</li>
      </ol>
      <div className="read mt-4 flex flex-wrap justify-center gap-2 text-4xl font-extrabold">
        {syl.map((s, k) => (
          <button key={k} className="panel rounded-2xl px-3 py-1" onClick={() => speak(s.text, { rate: 0.7 })}>{s.text}</button>
        ))}
      </div>
      <div className="mt-3 flex justify-center gap-2">
        <button className="btn" onClick={async () => { for (const s of syl) await speak(s.text, { rate: 0.7 }); await speak(w, { rate: profile.settings.speechRate }) }}>🔊 Chunk by chunk</button>
        <button className="btn-ghost" onClick={() => setI(i + 1)}>Next word →</button>
      </div>
      <p className="muted mt-3 text-center text-sm">Clap it! Each clap is one chunk: {syl.map(() => '👏').join(' ')}</p>
    </div>
  )
}

function HeartWords({ profile }: { profile: Profile }) {
  const decoder = useDecoder()
  const words = ['said', 'was', 'the', 'one', 'you', 'they', 'come', 'do']
  const inv = { graphemes: new Set(['s', 'a', 't', 'p', 'i', 'n', 'm', 'd', 'g', 'o', 'c', 'k', 'e', 'u', 'r', 'h', 'b', 'f', 'l', 'w', 'th', 'y', 'ch', 'sh']), skills: new Set<string>(), heart: new Set(words) }
  if (!decoder) return <p className="muted">Loading…</p>
  return (
    <div>
      <p className="text-lg">A few words have one <b>tricky part</b> that doesn’t follow the usual sounds. We call them <b>heart words</b>.</p>
      <p className="text-lg">Don’t memorise the whole word! Sound out the parts you know, and learn only the ♥ part by heart.</p>
      <p className="muted">said: s and d sound normal. Only the <b>ai</b> is tricky (it says “e”).</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {words.map((w) => {
          const d = decoder.decode(w, inv)
          return (
            <div key={w} className="panel rounded-2xl p-2">
              <Tiles tiles={d.tiles} size={1.8} onTap={(k) => sayPhone(profile, d.tiles[k].phones)} />
              <div className="text-center"><button className="btn-ghost !min-h-0 !py-1 text-sm" onClick={() => speak(w)}>🔊 {w}</button></div>
            </div>
          )
        })}
      </div>
      <Quiz question="In “was”, which part is tricky?" options={['w', 'a (it says “u”)', 's']} answer={1} explain="w and s are regular. The a is the heart part." />
    </div>
  )
}

function NoGuessing() {
  return (
    <div className="space-y-3 text-lg">
      <p>Good readers <b>look at every letter</b>. They don’t guess from the picture or the first letter.</p>
      <div className="panel rounded-3xl p-4">
        <p className="font-extrabold">When you get stuck:</p>
        <ol className="mt-1 list-decimal pl-6">
          <li>Look at the letters. Find the teams (sh, ee, ai…).</li>
          <li>Say each sound.</li>
          <li>Blend: slide the sounds together.</li>
          <li>Long word? Chop it into chunks.</li>
          <li>Check: does it sound like a real word, and does it make sense?</li>
          <li>Still stuck? Tap the word for help.</li>
        </ol>
      </div>
      <p>Every word you sound out makes the next one easier. Soon your brain does it so fast it feels like magic!</p>
    </div>
  )
}
