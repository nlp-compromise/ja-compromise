import type View from 'compromise/view/one'
import type { Lexicon, Plugin, matchOptions, Match, Net, Term } from 'compromise/misc'

/** which paradigm a verb follows */
export type VerbClass =
  | 'godan'    // 五段 - 書く, 話す, 帰る
  | 'ichidan'  // 一段 - 食べる, 見る
  | 'suru'     // する, and every 〜する compound
  | 'kuru'     // 来る, and て-form + 来る
  | 'aru'      // ある - its negative is ない, not あらない
  | 'iku'      // 行く - its て-form is 行って, not 行いて
  | 'ou'       // 問う, 請う - 問うて, not 問って
  | 'aru5'     // くださる, なさる, いらっしゃる - masu-stem drops the り

/** every form of a verb, built from its dictionary-form */
export interface VerbConjugation {
  /** which paradigm produced these */
  class: VerbClass
  /** 辞書形 - 書く */
  Infinitive: string
  /** 連用形, the 'masu-stem' - 書き */
  Stem: string
  /** 書く */
  PresentTense: string
  /** 書いた */
  PastTense: string
  /** 書かない */
  Negative: string
  /** 書かなかった */
  PastNegative: string
  /** て形 - 書いて */
  Gerund: string
  /** 書かなくて */
  NegativeGerund: string
  /** 書きます */
  Polite: string
  /** 書きました */
  PolitePast: string
  /** 書きません */
  PoliteNegative: string
  /** 書きませんでした */
  PolitePastNegative: string
  /** 書きましょう */
  PoliteVolitional: string
  /** 命令形 - 書け */
  Imperative: string
  /** 書くな */
  NegativeImperative: string
  /** 書いてください */
  PoliteImperative: string
  /** 書こう */
  Volitional: string
  /** 可能形 - 書ける */
  Potential: string
  /** 受身形 - 書かれる */
  Passive: string
  /** 使役形 - 書かせる */
  Causative: string
  /** 書かせられる */
  CausativePassive: string
  /** 〜たら - 書いたら */
  Conditional: string
  /** 〜ば - 書けば */
  Provisional: string
  /** 書いている */
  Progressive: string
  /** 書いています */
  ProgressivePolite: string
  /** 書いていた */
  PastProgressive: string
  /** 書きたい */
  Desire: string
  /** 〜たり - 書いたり */
  Representative: string
  /** 書くだろう */
  Presumptive: string
  /** 書きながら */
  Continuative: string
}

/** every form of an い-adjective */
export interface IAdjectiveConjugation {
  /** 高い */
  Infinitive: string
  PresentTense: string
  /** 高くない */
  Negative: string
  /** 高かった */
  PastTense: string
  /** 高くなかった */
  PastNegative: string
  /** 高くて */
  Gerund: string
  /** 高く */
  Adverb: string
  /** 高ければ */
  Provisional: string
  /** 高かろう */
  Presumptive: string
  /** 高いです */
  Polite: string
  /** 高かったです */
  PolitePast: string
  /** 高くないです */
  PoliteNegative: string
  /** 高すぎる */
  Superlative: string
  /** 高そう */
  Impression: string
  /** 高さ */
  Nominal: string
}

/** every form of a な-adjective. it inflects with the copula */
export interface NaAdjectiveConjugation {
  /** 静か */
  Infinitive: string
  /** 静かな */
  Adnominal: string
  /** 静かだ */
  PresentTense: string
  /** 静かじゃない */
  Negative: string
  /** 静かだった */
  PastTense: string
  /** 静かじゃなかった */
  PastNegative: string
  /** 静かで */
  Gerund: string
  /** 静かに */
  Adverb: string
  /** 静かです */
  Polite: string
  /** 静かでした */
  PolitePast: string
  /** 静かじゃありません */
  PoliteNegative: string
  /** 静かなら */
  Provisional: string
}

/** the result of walking a conjugated verb back to its dictionary-form */
export interface Deconjugation {
  /** the dictionary-form - 書きました → 書く */
  root: string
  /** what the ending told us - ['Verb', 'PastTense', 'Polite'] */
  tags: string[]
  /** every dictionary-form the ending could have come from */
  candidates: string[]
  /** true when no candidate could be confirmed, and `root` is a guess */
  guess?: boolean
}

/** what `.numbers().parse()` reports about a number */
export interface NumberParse {
  /** the value, or null if it couldn't be read */
  num: number | null
  /** the term the number was read from, if there was one */
  term?: JaTerm
  /** written in kanji (二十三) rather than digits */
  kanji: boolean
  /** written in full-width digits (２３) */
  wide: boolean
}

/** a compromise term, with the properties ja-compromise adds to it */
export interface JaTerm extends Term {
  /** the dictionary-form, after `.compute('root')` - 食べました → 食べる */
  root?: string
  /** latin-alphabet spelling, after `.compute('romanji')` */
  romanji?: string
  /** kana spelling of the word's kanji, after `.compute('readings')` */
  reading?: string
  /** an english gloss of the word, after `.compute('english')` */
  english?: string
  /** the parsed value of a numeral - 「二十三」 gives 23 */
  number?: number
}

/** options for nlp.fromSpec() */
export interface SpecOptions {
  tags?: 'ignore' | 'use'
  failures?: 'ignore' | 'throw' | 'retain' | 'log'
  verbose?: boolean
}

/** a failed line in a tagging spec */
export interface SpecFailure {
  code: 'length' | 'tags' | 'syntax' | 'match'
  line: number
  text: string
  message: string
  term?: number
  word?: string
  expected?: string[] | number
  actual?: string[] | number
}

/** a compromise document, with japanese-specific methods */
export interface JaView extends View {
  /** the term objects in this view */
  docs: JaTerm[][]
  /** the whole parsed document */
  document: JaTerm[][]
  /** .docs [alias] */
  termList: () => JaTerm[]
  /** run a named analysis - 'root', 'romanji', 'readings', 'english' */
  compute: (method: string | string[], options?: any) => JaView
  /** the document as text. `'root'` gives dictionary-forms */
  text: (options?: string | object) => string

  /** every 動詞 in the document, along with its helper-verbs */
  verbs: (n?: number) => Verbs
  /** every 名詞 in the document */
  nouns: (n?: number) => Nouns
  /** every 形容詞 and 形容動詞 in the document */
  adjectives: () => JaView
  /** every 助詞 in the document */
  particles: () => JaView
  /** every number in the document */
  numbers: (n?: number) => Numbers
  /** .numbers() alias */
  values: (n?: number) => Numbers
  /** every 助数詞 in the document */
  counters: (n?: number) => JaView
  /** every 円/ドル amount */
  money: (n?: number) => JaView
  /** every percentage */
  percentages: (n?: number) => JaView
  /** every date, time and duration */
  dates: () => JaView
  /** the document sounded-out in the latin alphabet */
  romanji: () => string
  /** the dictionary-form of each match - 食べました → 食べる */
  toInfinitive: () => string[]
}

/** what `.verbs().parse()` reports about a verb */
export interface VerbParse {
  /** the dictionary-form - 読んでいました gives 読む. the copula is だ */
  root: string
  /** which paradigm the verb follows. null for the copula, or an unknown shape */
  class: VerbClass | null
  /** null when the form has no tense - 食べよう, 食べて */
  tense: 'PastTense' | 'PresentTense' | null
  /** 食べない */
  negative: boolean
  /** です/ます - 食べます */
  polite: boolean
  /** だ, です, じゃない */
  copula: boolean
  /** the word with the meaning - 読んで */
  main: JaView
  /** any helper-verbs after it - いました */
  auxiliary: JaView
}

/** the `verb` property of `.verbs().json()` */
export interface VerbJson extends Omit<VerbParse, 'main' | 'auxiliary'> {
  /** the text of any helper-verbs */
  auxiliary: string
}

/** a view of the verbs in a document */
export interface Verbs extends JaView {
  /** the pieces of each verb - its root, class, tense, polarity and politeness */
  parse: (n?: number) => VerbParse[]
  /** json for each verb, with its grammar under `verb` */
  json: (options?: number | string | object, n?: number) => any
  /** every form of each verb - 食べた gives the paradigm of 食べる */
  conjugate: (n?: number) => (VerbConjugation | Record<string, string>)[]
  /** the dictionary-form of each verb - 読んでいました gives 読む */
  toInfinitive: (n?: number) => string[]
  /** 食べる becomes 食べた */
  toPastTense: (n?: number) => Verbs
  /** .toPastTense() alias */
  toPast: (n?: number) => Verbs
  /** 食べた becomes 食べる. japanese has no separate future tense */
  toPresentTense: (n?: number) => Verbs
  /** .toPresentTense() alias */
  toPresent: (n?: number) => Verbs
  /** 食べる becomes 食べない */
  toNegative: (n?: number) => Verbs
  /** 食べない becomes 食べる */
  toPositive: (n?: number) => Verbs
  /** 丁寧語 - 食べる becomes 食べます */
  toPolite: (n?: number) => Verbs
  /** 普通体 - 食べます becomes 食べる */
  toPlain: (n?: number) => Verbs
  /** only the negated verbs */
  isNegative: () => Verbs
  /** only the verbs that aren't negated */
  isPositive: () => Verbs
  /** only the です/ます verbs */
  isPolite: () => Verbs
  /** only the plain-form verbs */
  isPlain: () => Verbs
  /** only the commands - 走れ, 食べてください */
  isImperative: () => Verbs
}

/** what `.nouns().parse()` reports about a noun */
export interface NounParse {
  /** the noun without any plural suffix - 子供たち gives 子供 */
  root: string
  /** marked as plural - 子供たち, 人々 */
  plural: boolean
  /** the 助詞 that follows the noun, if there is one */
  particle: string | null
}

/** both forms of a noun. most japanese nouns have only the one */
export interface NounConjugation {
  singular: string
  plural: string
}

/** a view of the nouns in a document */
export interface Nouns extends JaView {
  /** each noun's bare form, its number, and the particle after it */
  parse: (n?: number) => NounParse[]
  /** json for each noun, with its grammar under `noun` */
  json: (options?: number | string | object, n?: number) => any
  /** both forms of each noun */
  conjugate: (n?: number) => NounConjugation[]
  /** only the nouns marked as plural - 子供たち */
  isPlural: (n?: number) => Nouns
  /** only the nouns without a plural marker */
  isSingular: (n?: number) => Nouns
  /** 子供 becomes 子供たち. only people take a plural - 本 is left alone */
  toPlural: (n?: number) => Nouns
  /** 子供たち becomes 子供 */
  toSingular: (n?: number) => Nouns
}

/** a view of the numbers in a document */
export interface Numbers extends JaView {
  /** the parsed number, and how it was written */
  parse: (n?: number) => NumberParse[]
  /** the value of each number - 「二十三」 gives 23 */
  get: (n?: number) => (number | null)[]
  /** json for each number, with its value and 助数詞 under `number` */
  json: (options?: number | string | object) => any
  /** the 助数詞 attached to each number - 五冊 gives 冊 */
  units: () => JaView
  /** only the ordinals */
  isOrdinal: () => Numbers
  /** only the cardinals */
  isCardinal: () => Numbers
  /** rewrite each number in digits - 二十三 becomes 23 */
  toNumber: () => Numbers
  /** rewrite each number in kanji - 23 becomes 二十三 */
  toText: () => Numbers
  /** add thousands-separators - 1234 becomes 1,234 */
  toLocaleString: () => Numbers
  /** replace each number, keeping the script it was written in */
  set: (n: number) => Numbers
  /** add n to each number */
  add: (n: number) => Numbers
  /** subtract n from each number */
  subtract: (n: number) => Numbers
  /** add 1 to each number */
  increment: () => Numbers
  /** subtract 1 from each number */
  decrement: () => Numbers
  /** only the numbers with this value */
  isEqual: (n: number) => Numbers
  /** only the numbers larger than n */
  greaterThan: (n: number) => Numbers
  /** only the numbers smaller than n */
  lessThan: (n: number) => Numbers
  /** only the numbers between min and max, exclusive */
  between: (min: number, max: number) => Numbers
}

/** parse some japanese text */
declare function nlp(text?: string, lexicon?: Lexicon): JaView

declare namespace nlp {
  // ---- constructor ----
  /** interpret text without tagging */
  export function tokenize(text: string, lexicon?: Lexicon): JaView
  /** mix-in a compromise plugin */
  export function plugin(plugin: Plugin): any
  /** mix-in a compromise plugin */
  export function extend(plugin: Plugin): any
  /** turn a match-string into json */
  export function parseMatch(match: string, opts?: matchOptions): object[]
  /** grab library internals */
  export function world(): object
  /** grab all current linguistic data */
  export function model(): object
  /** grab exposed library methods */
  export function methods(): object
  /** which compute methods run automatically */
  export function hooks(): string[]
  /** log the tagger's decision-making to the console */
  export function verbose(mode?: boolean | 'tagger' | 'match' | 'chunker'): any
  /** current semver version of the library */
  export const version: string
  /** connect new tags to the tagset graph */
  export function addTags(tags: object): any
  /** add new words to the lexicon */
  export function addWords(words: Lexicon, isFrozen?: boolean): any
  /** turn a list of words into a searchable graph */
  export function buildTrie(words: string[]): object
  /** alias for nlp.buildTrie() */
  export function compile(words: string[]): object
  /** compile a set of match objects into a faster form */
  export function buildNet(matches: Match[]): Net
  /** add words to the autoFill dictionary */
  export function typeahead(words: Lexicon): any
  /** parse spec text, optionally applying tags or validating its constraints */
  export function fromSpec(spec: string, options?: SpecOptions): JaView & { failures: SpecFailure[] }
  /** returns untagged sentences and failing tagged lines, with validation failures */
  export function testSpec(spec: string, verbose?: boolean, throwError?: boolean): JaView & { failures: SpecFailure[] }

  // ---- japanese ----
  /**
   * the full paradigm of a dictionary-form verb.
   * returns null if the word isn't a shape we can conjugate.
   */
  export function conjugate(dictionaryForm: string): VerbConjugation | null
  /**
   * the paradigm of an adjective. a word ending in い is treated as an
   * い-adjective, anything else as a な-adjective.
   */
  export function conjugateAdjective(word: string): IAdjectiveConjugation | NaAdjectiveConjugation | null
  /** walk a conjugated verb back to its dictionary-form */
  export function deconjugate(word: string): Deconjugation | null
  /** which paradigm a dictionary-form verb follows */
  export function verbClass(dictionaryForm: string): VerbClass | null
  /**
   * parse a japanese numeral - `nlp.toNumber('二十三')` is 23.
   * handles kanji, half-width and full-width digits.
   * a decimal may be written 1.5, １．５, 一・五 or 一点五.  null if it isn't one.
   */
  export function toNumber(numeral: string): number | null
  /** write a number in kanji - `nlp.toKanji(23)` is 二十三 */
  export function toKanji(num: number): string | null
}

export default nlp
