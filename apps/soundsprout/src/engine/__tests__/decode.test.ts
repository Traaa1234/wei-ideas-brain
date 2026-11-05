import { describe, expect, it } from 'vitest'
import { loadLexicon } from '../node-lexicon'
import { Decoder } from '../decode'
import { inventoryUpTo } from '../curriculum'
import { wordInfo } from '../wordinfo'

const lex = loadLexicon()
const dec = new Decoder(lex)
const all = inventoryUpTo('e3')
const common = new Set(['happy', 'run', 'make', 'like', 'live', 'break', 'port', 'report', 'construct', 'sun', 'set', 'cup', 'cake', 'photograph'])
const tiles = (w: string, step = 'e3') => dec.decode(w, inventoryUpTo(step)).tiles.map((t) => t.text).join('·')
const status = (w: string, step: string) => dec.decode(w, inventoryUpTo(step)).status
const syl = (w: string) => wordInfo(dec, w, all, { common }).syllables.map((s) => s.text).join('|')
const parts = (w: string) => wordInfo(dec, w, all, { common }).parts.map((p) => p.base ?? p.text).join('+')

describe('decoding by pronunciation', () => {
  it('cake needs the split digraph a_e', () => {
    expect(status('cake', 's10')).toBe('new')
    expect(dec.decode('cake', inventoryUpTo('s10')).needs).toContain('a_e')
    expect(status('cake', 's11')).toBe('decodable')
    const t = dec.decode('cake', inventoryUpTo('s11')).tiles
    expect(t[1].type).toBe('split')
    expect(t[3].type).toBe('silent')
    expect(t[1].partner).toBe(3)
  })
  it('make uses a_e with a silent e', () => expect(tiles('make')).toBe('m·a·k·e'))
  it('dragon allows schwa on the o once schwa and two syllables are taught', () => {
    expect(status('dragon', 's12')).toBe('new')
    expect(status('dragon', 's13')).toBe('decodable')
    expect(dec.decode('dragon', all).tiles.find((t) => t.text === 'o')?.schwa).toBe(true)
  })
  it('into is a heart word in Sprout', () => expect(status('into', 's3')).toBe('heart'))
  it('-ed endings make three sounds', () => {
    const id = (w: string) => dec.decode(w, all).tiles.at(-1)?.graphemeId
    expect(id('jumped')).toBe('ed (jumped)')
    expect(id('lived')).toBe('ed (lived)')
    expect(id('wanted')).toBe('ed (wanted)')
    expect(id('liked')).toBe('d (liked)')
    expect(status('jumped', 's11')).toBe('new')
    expect(status('jumped', 's12')).toBe('decodable')
  })
  it('cats sounds out with s', () => expect(status('cats', 's1')).toBe('new') /* c not yet */)
  it('cats is decodable once c is known', () => expect(status('cats', 's3')).toBe('decodable'))
  it('they and said are heart words with a marked tricky part', () => {
    const said = dec.decode('said', inventoryUpTo('s7'))
    expect(said.status).toBe('heart')
    expect(said.tiles.find((t) => t.irregular)?.text).toBe('ai')
    expect(status('they', 's6')).toBe('heart')
  })
  it('from is a heart word in American English until o (son)', () => {
    expect(status('from', 's13')).toBe('heart')
    expect(status('from', 'e3')).toBe('decodable')
  })
  it('unknown words are not readable', () => expect(status('elephant', 's5')).toBe('new'))
  it('school uses ch (school), chef uses ch (chef), knight uses kn and igh', () => {
    expect(dec.decode('school', all).tiles[1].graphemeId).toBe('ch (school)')
    expect(dec.decode('chef', all).tiles[0].graphemeId).toBe('ch (chef)')
    expect(tiles('knight')).toBe('kn·igh·t')
  })
  it('suffix sounds: famous, nature, station', () => {
    expect(tiles('famous')).toBe('f·a·m·ous')
    expect(tiles('nature')).toBe('n·a·ture')
    expect(status('nature', 'e1')).toBe('new')
    expect(status('nature', 'e2')).toBe('decodable')
  })
})

describe('syllables', () => {
  it.each([
    ['rabbit', 'rab|bit'], ['tiger', 'ti|ger'], ['camel', 'cam|el'], ['table', 'ta|ble'],
    ['about', 'a|bout'], ['running', 'run|ning'], ['hundred', 'hun|dred'], ['sunset', 'sun|set'],
    ['transportation', 'trans|port|a|tion'], ['nature', 'na|ture'], ['dragon', 'drag|on'],
  ])('%s → %s', (w, expected) => expect(syl(w)).toBe(expected))
  it('marks the stressed syllable of photography', () => {
    const s = wordInfo(dec, 'photography', all, { common }).syllables
    expect(s.length).toBe(4)
    expect(s[1].stressed).toBe(true)
  })
})

describe('word parts', () => {
  it.each([
    ['unhappy', 'un+happy'], ['running', 'run+ing'], ['liked', 'like+ed'], ['breakable', 'break+able'],
    ['transportation', 'trans+port+ation'], ['construction', 'con+struct+ion'], ['happier', 'happy+er'],
  ])('%s → %s', (w, expected) => expect(parts(w)).toBe(expected))
})
