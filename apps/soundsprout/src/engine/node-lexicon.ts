// Node-only helper: load the dictionary files from disk (for tests and the CLI).
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { Lexicon } from './lexicon'

export function loadLexicon(): Lexicon {
  const dir = fileURLToPath(new URL('../../public/dict/', import.meta.url))
  return new Lexicon(readFileSync(dir + 'cmudict.dict', 'utf8'), readFileSync(dir + 'extra.dict', 'utf8'))
}
