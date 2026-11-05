# Contributing content

## Writing a decodable story (Sprout)

1. Copy `content/books/pip-and-the-pot.json` and give it a new `id`.
2. Set `step` to the curriculum step it must be readable at (see `src/engine/curriculum.ts`).
3. Write short pages: one to three sentences each, with an emoji scene in `art`. Put character names in `names`.
4. Run `npm run check`. It lists every word a child at that step can't read yet, with the sound or heart word each one needs.
5. **Rewrite the story; never loosen the inventory.** Swap the word ("pushed" → "tugged"), or move the book to a later step if the story really needs it.
6. Add 1–2 `questions` (one recall, one opinion) and a `retell` prompt for grown-ups.

Sprout books must be 100% readable at their step.

## Writing an Explorer passage or chapter book

- Explorer books need to be ≥ 95% readable at their step. `npm run check` also prints the Flesch-Kincaid grade.
- Chapter books: put `"chapter": "<title>"` on the page where each chapter starts.
- Non-fiction: use `heading`, `caption` and `fact` on pages, and add a `glossary`.
- Add 3–5 `questions` that mix `recall`, `vocabulary` (meaning in context), `inference` ("Why…?") and `opinion`.
- Set `organiser` to `story-map` (fiction) or `main-idea` (non-fiction).
- Write for 8–10-year-olds even when the phonics level is early (hi-lo books). Avoid babyish topics and art.

## Adding words

- **Words the dictionary lacks** (names, invented words) go in `public/dict/extra.dict` as `word PH1 PH2 ...` (ARPAbet, with stress digits on vowels). Family words can also be added in the app (Grown-ups → Words).
- **New spellings** go in `src/engine/graphemes.ts`, then into a step in `curriculum.ts`. Add a test in `src/engine/__tests__/decode.test.ts`.
- **Vocabulary** lives in `src/data/words.ts` (`VOCAB`). Keep definitions original and kid-friendly (≤ 12 words for Sprout, ≤ 20 for Explorer) and give two example sentences.
- **Part-of-speech word bank:** `WORD_BANK` in `src/data/words.ts`, written as `word:emoji` inside a category.

## Rules

All content must be original. Don't copy characters, art, audio or text from existing apps or books.
