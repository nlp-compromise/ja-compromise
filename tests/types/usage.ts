// compile-check the declarations against real usage.
// this file is never run - `npm run typecheck` just makes sure it compiles.
import nlp from '../../types/index'
import type { View, VerbConjugation, VerbClass } from '../../types/index'

const doc: View = nlp('私は毎日日本語を勉強します。')

// output
const text: string = doc.text()
const roots: string = doc.compute('root').text('root')
const arr: string[] = doc.match('#Noun').out('array')
const json: any = doc.json()
doc.debug()

// japanese view methods
const verbs: View = doc.verbs()
const nouns: View = doc.nouns()
const adjectives: View = doc.adjectives()
const particles: View = doc.particles()
const romanji: string = doc.romanji()
const infinitives: string[] = doc.verbs().toInfinitive()

// tags and matching
const isVerb: boolean = doc.has('#Verb')
const past: View = doc.match('#Verb').if('#PastTense')
doc.match('#Noun').tag('Topic', 'demo')

// terms carry the japanese extras
const term = doc.compute(['root', 'romanji']).docs[0][0]
const root: string | undefined = term.root
const spelled: string | undefined = term.romanji
const tags: Set<string> | undefined = term.tags

// conjugation
const forms: VerbConjugation | null = nlp.conjugate('書く')
if (forms !== null) {
  const cls: VerbClass = forms.class
  const polite: string = forms.PolitePast
  const te: string = forms.Gerund
}
const back = nlp.deconjugate('書きました')
if (back !== null) {
  const dict: string = back.root
  const why: string[] = back.tags
}
const klass: VerbClass | null = nlp.verbClass('食べる')
const adj = nlp.conjugateAdjective('高い')

// numbers, counters and dates
const nums: View = doc.numbers()
const values: (number | null)[] = doc.numbers().toNumber()
const units: View = doc.counters()
const when: View = doc.dates()
const parsed: number | null = nlp.toNumber('二十三')
const onTerm: number | undefined = doc.docs[0][0].number

// constructor bits
const version: string = nlp.version
nlp.verbose('tagger')
nlp.addWords({ '寿司': 'Noun' })

export { nums, values, units, when, parsed, onTerm, text, roots, arr, json, verbs, nouns, adjectives, particles, romanji, infinitives, isVerb, past, root, spelled, tags, klass, adj, version }
