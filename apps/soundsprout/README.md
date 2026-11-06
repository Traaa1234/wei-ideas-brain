# SoundSprout

A phonics-first reading app for children aged 4–10. It's an installable PWA that works offline, and everything stays on the device.

Two reading bands share one engine:

- **Sprout** (about 4–7, learning to read): letter sounds → CVC words → digraphs → long vowels → two-syllable words, plus heart words and decodable stories.
- **Explorer** (about 7–10, reading to learn): open syllables, soft c/g, suffix sounds (-tion, -ture, -ous), alternative spellings, word parts (prefixes, suffixes, Latin and Greek roots), vocabulary, comprehension, chapter books and non-fiction.

Everyone gets the same app: no sign-in, no profiles, no grown-ups gate. It opens straight into reading. The look (Sprout or Explorer) is chosen in ⚙️ Settings, separately from the phonics level, so a 9-year-old working on early sounds gets books and games that don't feel babyish. All lessons and all 13 games are open from the start; until enough sounds are learned, the games draw on every sound and word in the app.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # decoder, syllable and word-part tests
npm run check      # every book must be readable at its step
npm run build      # static site in dist/ (deploy anywhere; it works from a subfolder)
```

## Teaching choices

1. **Systematic synthetic phonics.** One editable file (`src/engine/curriculum.ts`) holds the teaching order. Steps are cumulative: graphemes, then syllable types, then syllable division, then morphology.
2. **Decodability is enforced by pronunciation, not spelling.** `src/engine/decode.ts` aligns each word's pronunciation from the CMU dictionary with its letters, one grapheme at a time:
   - "cake" fails until the child knows *a_e*.
   - "dragon" passes once the schwa skill is taught (the *o* says "uh").
   - "said" is a heart word, and the *ai* is marked as the tricky part.
   - "from" is a heart word in American English until *o (son)* is taught.
   - A word that needs a sound the child hasn't learned is never counted as readable.
3. **No guessing cues.** Nothing prompts the child to guess a word from the picture. The pictures are emoji scenes.
4. **The child does the reading.** In "Read myself" mode, help comes one word at a time: tap a word and the word card opens. "Listen & follow" reads harder books aloud with word highlighting. It is labelled clearly and counted separately in progress.
5. **Encouraging, never punitive.** No lives, no red crosses, no timers and no leaderboards. Spelling Bee scores are private.

### The word card (tap any word)

- **Sounds:** one tile per sound. A dot marks single letters, a bar marks letter teams, and an arc links split digraphs (a_e). Colour shows the sound type, backed up by shape: dotted border means a new sound, double border means schwa, ♥ marks a heart part.
- **Syllables:** scoop arcs, the syllable type of each chunk, and a dot on the stressed syllable. "Put it together" plays each syllable, then the whole word.
- **Parts (Explorer):** prefix + root + suffix with their meanings and spelling rules (run**n**ing: double the n), plus other words with the same part.
- **Meaning:** part of speech (by icon, not colour), a kid-friendly definition, an example sentence, other forms (jump → jumped, jumping), and for Explorer: synonyms, antonyms and homophones.

### Sounds are human recordings

Computer voices are poor at single phonics sounds. The audio layer (`src/app/audio.ts`) plays a human recording for each sound when one exists; the in-app recorder was removed with the grown-ups area, so for now a computer-voice stand-in is used. Whole words and sentences use the device's speech synthesis.

### Word banks

- **Top 300:** the public-domain Dolch lists (220 service words + 95 nouns, in Dolch order, cut at 300). Each word is shown as decodable or as a heart word, and counts as mastered after 8 meetings in books. `npm run rank -- <folder>` re-ranks the list by frequency across any corpus you are licensed to use (it writes `content/top-words.json`).
- **Parts of speech:** a curated bank of nouns, verbs, adjectives and adverbs in sub-categories (animals, moving verbs, colour adjectives...). Running text is tagged in context with [compromise](https://github.com/spencermountain/compromise), offline. "Word Explorer" mode underlines words by part of speech with different line styles, never colours, so the phonics colours stay clear.
- **Vocabulary:** a starter set of Tier 2 and subject words with original definitions, examples, synonyms and antonyms.
- **Collecting words:** readers tap a word while reading and choose "Collect this word"; it goes straight into their Word Collector.

### Adaptive practice

- **Mastery:** tracked per grapheme, word, comprehension question type, root and so on, using lesson checks, games and help-taps (a word tapped often counts as weak).
- **Spaced review:** at 1, 3, 7, 14 and 30 days.
- **Teach next:** ranks the next sound by how many new words it would unlock for this child.

## What's here

| Area | Built |
|---|---|
| Engine | Grapheme catalog (about 150 spellings), curriculum (13 Sprout + 3 Explorer steps), pronunciation-based decoder, syllable division (compound, VC/CV, V/CV, VC/V, VCCCV, -le, suffix syllables), word-part splitter with spelling rules, Flesch-Kincaid readability, 35 unit tests |
| Library | 5 original books: 3 Sprout (steps s3, s7, s13), an Explorer chapter book (3 chapters) and an Explorer non-fiction book with headings, captions, fact boxes and a glossary. Each book is shown as ready (≥ 95% readable), stretch (85–95%) or Listen & follow |
| Reader | Read myself / Listen & follow, word card, new-sound underlines, Word Explorer underlines, chapters, resume, "read N times", reading ruler, text size and spacing, dyslexia-friendly font option |
| After a book | Questions (recall, vocabulary, inference, opinion), "words I collected" by part of speech, retell prompt (Sprout), written response, rating and review, story map / main-idea organiser (Explorer) |
| Lessons | Listen → Practice → Play → Read → Check for every step, with practice words and sentences picked to be decodable for the child |
| Games | Sprout: Sound Pop, Word Builder (grapheme tiles), Real or Alien?, Syllable Chop, Silly Sentences, Word Sort. Explorer: Word Lab, Root Detective, Context Clue Case, Shades of Meaning, Homophone Hero, Sentence Upgrade, Spelling Bee |
| Settings | Sprout/Explorer look, dyslexia-friendly font, spacing, reading ruler, Word Explorer underlines, text size, speech speed, start over. No gate, no profiles |
| Offline | Service worker caches the app and the dictionary |

### Not built yet

- **Speech:** read-aloud feedback (speech recognition at word/sentence level), the fluency check (words correct per minute), and the repeated-reading "smoothness" meter.
- **Content:** poetry, reader's theatre scripts and comic stories; more books (the chapter book is about 400 words, where the spec aims for 2,000+); the full ~500-word Tier 2 list (about 55 so far).
- **Accounts and services:** accounts and sync, AI-drafted definitions through a server proxy, the MCP server for parents' agents, and teacher mode.
- **Smaller features:** mouth-shape animations, letter tracing, typing practice, the Heart Word Hunt and Fact Hunt games, and the UK English locale.
- **The Top 300 order** is Dolch order. The network policy here blocked downloading public-domain children's books to rank by frequency; use `npm run rank` with your own corpus.

## Privacy

There's no account, no tracking SDK, no ads and no network calls beyond loading the app itself. Progress and collected words live in IndexedDB on the device. Settings → Start over clears them.

## Credits and licences

- The pronouncing dictionary is the [CMU Pronouncing Dictionary](https://github.com/cmusphinx/cmudict) (BSD-style licence, `public/dict/CMUDICT-LICENSE.txt`).
- The Dolch word lists are public domain.
- All stories, definitions and sentences are original to this project.
