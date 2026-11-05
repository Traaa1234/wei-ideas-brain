// Book format and the bundled library (content/books/*.json).
export interface Page {
  text: string
  art?: string           // emoji scene (original, no third-party art)
  chapter?: string       // a chapter starts on this page
  heading?: string       // non-fiction heading
  caption?: string       // non-fiction picture caption
  fact?: string          // non-fiction fact box
}

export interface Question {
  q: string
  options?: string[]
  answer?: number
  type: 'recall' | 'vocabulary' | 'inference' | 'opinion'
}

export interface Book {
  id: string
  title: string
  band: 'sprout' | 'explorer'
  step: string             // the curriculum step the book is decodable at
  kind: 'story' | 'chapter' | 'nonfiction' | 'poem' | 'script' | 'comic'
  genre: string
  topics: string[]
  series?: string
  number?: number
  cover: string            // emoji
  color: string            // cover colour (hex)
  names: string[]          // character names readable as names
  pages: Page[]
  glossary?: { word: string; def: string }[]
  questions?: Question[]
  organiser?: 'story-map' | 'main-idea'
  retell?: string
}

export function bookText(b: Book) {
  return b.pages.map((p) => [p.chapter, p.heading, p.text, p.caption, p.fact].filter(Boolean).join('. ')).join('\n')
}

