// compile-check the declarations against real usage.
// this file is never run - `pnpm run test:types` just makes sure it compiles.
import nlp from 'ja-compromise'
import type {
  JaView, JaTerm, Numbers, NumberParse, VerbConjugation, VerbClass,
  IAdjectiveConjugation, NaAdjectiveConjugation, Deconjugation,
  Verbs, VerbParse, Nouns, NounParse, NounConjugation,
} from 'ja-compromise'
import type View from 'compromise/view/one'

const doc: JaView = nlp('私は毎日日本語を勉強します。')

// output
const text: string = doc.text()
const roots: string = doc.compute('root').text('root')
const arr: string[] = doc.match('#Noun').out('array')
const json: any = doc.json()
doc.debug()

// japanese view methods
const verbs: JaView = doc.verbs()
const nouns: JaView = doc.nouns()
const adjectives: JaView = doc.adjectives()
const particles: JaView = doc.particles()
const romanji: string = doc.romanji()
const infinitives: string[] = doc.verbs().toInfinitive()

// core compromise/one methods are inherited, and return compromise's own View
const isVerb: boolean = doc.has('#Verb')
const past: View = doc.match('#Verb').if('#PastTense')
const asView: View = doc
doc.match('#Noun').tag('Topic', 'demo')

// terms carry the japanese extras
const term: JaTerm = doc.compute(['root', 'romanji']).docs[0][0]
const root: string | undefined = term.root
const spelled: string | undefined = term.romanji
const tags: Set<string> | undefined = term.tags
const reading: string | undefined = doc.termList()[0].reading
const english: string | undefined = doc.document[0][0].english

// conjugation
const forms: VerbConjugation | null = nlp.conjugate('書く')
if (forms !== null) {
  const cls: VerbClass = forms.class
  const polite: string = forms.PolitePast
  const te: string = forms.Gerund
  const please: string = forms.PoliteImperative
  void [cls, polite, te, please]
}
const back: Deconjugation | null = nlp.deconjugate('書きました')
if (back !== null) {
  const dict: string = back.root
  const why: string[] = back.tags
  void [dict, why]
}
const klass: VerbClass | null = nlp.verbClass('食べる')
const adj: IAdjectiveConjugation | NaAdjectiveConjugation | null = nlp.conjugateAdjective('高い')

// numbers, counters and dates
const nums: Numbers = doc.numbers()
const values: (number | null)[] = doc.numbers().get()
const parses: NumberParse[] = nums.parse()
const numJson: any = nums.json(0)
const money: JaView = doc.money(0)
const percents: JaView = doc.percentages()
nums.toLocaleString().isCardinal().isOrdinal().between(1, 5).set(3).subtract(1).increment().decrement().isEqual(2).lessThan(9)
const alias: (number | null)[] = doc.values().get()
const units: JaView = doc.numbers().units()
const rewritten: string = nlp('二十三冊').numbers().toNumber().all().text()
const asText: string = nlp('23冊').numbers().toText().all().text()
const bigger: Numbers = doc.numbers().add(1).greaterThan(2)
const counters: JaView = doc.counters()
const when: JaView = doc.dates()
const parsed: number | null = nlp.toNumber('二十三')
const written: string | null = nlp.toKanji(23)
const onTerm: number | undefined = doc.docs[0][0].number

// verbs and nouns
const vbs: Verbs = doc.verbs(0)
const vbParse: VerbParse[] = vbs.parse()
const vbRoot: string = vbParse[0].root
const vbAux: JaView = vbParse[0].auxiliary
const paradigms = vbs.conjugate()
const pastForm: string = paradigms[0].PastTense
vbs.toPastTense().toPresentTense().toNegative().toPositive().toPolite().toPlain().isNegative().isPositive().isPolite().isPlain().isImperative()
const nns: Nouns = doc.nouns(0)
const nnParse: NounParse[] = nns.parse()
const particle: string | null = nnParse[0].particle
const bothForms: NounConjugation[] = nns.conjugate()
nns.toPlural().toSingular().isPlural().isSingular()

// constructor bits
const version: string = nlp.version
nlp.verbose('tagger')
nlp.addWords({ '寿司': 'Noun' })
const tokens: JaView = nlp.tokenize('寿司を食べる')
nlp.addTags({ Checked: { is: 'Noun' } })
nlp.buildTrie(['a', 'b'])
nlp.parseMatch('#Noun')

// @ts-expect-error input text must be a string
nlp(25)

// silence noUnusedLocals

export { vbRoot, vbAux, pastForm, particle, bothForms, asView, reading, english, parses, numJson, money, percents, tokens, nums, values, alias, units, rewritten, asText, bigger, counters, when, parsed, written, onTerm, text, roots, arr, json, verbs, nouns, adjectives, particles, romanji, infinitives, isVerb, past, root, spelled, tags, klass, adj, version }

// spec helpers
const specFailures: import('ja-compromise').SpecFailure[] = nlp.fromSpec('a b', { tags: 'use', failures: 'retain' }).failures
const specDoc: import('ja-compromise').JaView = nlp.testSpec('a b')
nlp.compile(['a', 'b'])
export { specFailures, specDoc }
