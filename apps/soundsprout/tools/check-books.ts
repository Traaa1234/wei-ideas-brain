// npm run check: every book must be readable at its step.
// Sprout books: 100% of words decodable, heart words or names. Explorer: ≥ 95%.
import { readdirSync, readFileSync } from 'node:fs'
import { loadLexicon } from '../src/engine/node-lexicon'
import { Decoder } from '../src/engine/decode'
import { inventoryUpTo } from '../src/engine/curriculum'
import { measureText } from '../src/engine/readability'
import type { Book } from '../src/data/books'
import { bookText } from '../src/data/books'

const dir = new URL('../content/books/', import.meta.url)
const only = process.argv[2]
const decoder = new Decoder(loadLexicon())
let failed = 0
for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
  const book = JSON.parse(readFileSync(new URL(f, dir), 'utf8')) as Book
  if (only && book.id !== only) continue
  const inv = inventoryUpTo(book.step)
  const r = measureText(bookText(book), decoder, inv, { names: new Set(book.names.map((n) => n.toLowerCase())) })
  const target = book.band === 'sprout' ? 100 : 95
  const ok = r.decodablePct >= target
  if (!ok) failed++
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${book.id.padEnd(22)} step ${book.step.padEnd(4)} ${String(r.words).padStart(5)} words  ${r.decodablePct}% readable (need ${target}%)  FK grade ${r.fkGrade}`)
  for (const u of r.unreadable.slice(0, ok ? 0 : 40)) {
    const tiles = u.decoded.tiles.map((t) => t.text).join('·')
    console.log(`       ${u.word.padEnd(16)} x${u.count}  ${tiles.padEnd(20)} needs ${u.decoded.needs.join(', ') || '(not in dictionary: add to public/dict/extra.dict or the book names)'}`)
  }
}
if (failed) {
  console.log(`\n${failed} book(s) have words the child can't read yet. Rewrite the story; never loosen the inventory.`)
  process.exit(1)
}
