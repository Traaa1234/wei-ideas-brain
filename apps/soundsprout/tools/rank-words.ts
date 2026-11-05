// npm run rank -- <folder of .txt files> [count]
// Ranks words by frequency across a corpus you are licensed to use, and writes
// content/top-words.json. Use it to replace the Dolch-order Top 300 with a frequency order.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const [folder, countArg] = process.argv.slice(2)
if (!folder) {
  console.error('usage: npm run rank -- <folder of .txt files> [count=1000]')
  process.exit(1)
}
const count = Number(countArg ?? 1000)
const freq = new Map<string, number>()
const docs = new Map<string, Set<string>>()
const files = readdirSync(folder).filter((f) => f.endsWith('.txt'))
for (const f of files) {
  const text = readFileSync(join(folder, f), 'utf8').toLowerCase()
  for (const w of text.match(/[a-z]+(?:'[a-z]+)?/g) ?? []) {
    freq.set(w, (freq.get(w) ?? 0) + 1)
    if (!docs.has(w)) docs.set(w, new Set())
    docs.get(w)!.add(f)
  }
}
// keep words found in at least half the files, so character names drop out
const minDocs = Math.max(1, Math.ceil(files.length / 2))
const ranked = [...freq.entries()]
  .filter(([w]) => docs.get(w)!.size >= minDocs)
  .sort((a, b) => b[1] - a[1])
  .slice(0, count)
  .map(([word, n], i) => ({ word, rank: i + 1, count: n }))
const out = new URL('../content/top-words.json', import.meta.url)
writeFileSync(out, JSON.stringify({ source: `${files.length} files in ${folder}`, words: ranked }, null, 1))
console.log(`Ranked ${ranked.length} words from ${files.length} files → content/top-words.json`)
