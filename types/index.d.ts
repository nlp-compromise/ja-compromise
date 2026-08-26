import type {
  Document, Pointer, Groups, JsonProps, outMethods, Term, Net,
  Lexicon, Plugin, matchOptions, Match,
} from './misc'
import type {
  VerbClass, VerbConjugation, IAdjectiveConjugation, NaAdjectiveConjugation, Deconjugation,
} from './japanese'

/** a view onto some part of a parsed document */
declare class View {
  // ---- utils ----
  /** is this document empty? */
  found: boolean
  /** the term objects in this view */
  docs: Document
  /** the whole parsed document */
  document: Document
  /** the indexes for the current view */
  pointer: Pointer[] | null
  /** explicit indexes for the current view */
  fullPointer: Pointer[]
  /** internal library methods */
  methods: object
  /** internal library data */
  model: object
  /** which compute methods run by default */
  hooks: string[]
  /** helper for detecting a compromise object */
  isView: boolean
  /** the number of characters in each match */
  length: number

  update: (pointer: Pointer | null) => View
  toView: (pointer: Pointer | null) => View
  fromText: (text: string) => View
  /** .docs [alias] */
  termList: () => Term[]
  /** run a named analysis - 'root', 'romanji', 'readings', 'english' */
  compute: (method: string | string[]) => View
  /** deep-copy the document, so no references remain */
  clone: (shallow?: boolean) => View

  // ---- loops ----
  forEach: (fn: (m: View) => void) => View
  map: (fn: (m: View) => any, emptyResult?: any) => View | []
  filter: (fn: (m: View) => boolean) => View
  find: (fn: (m: View) => boolean) => View | undefined
  some: (fn: (m: View) => boolean) => View
  random: (n?: number) => View

  // ---- accessors ----
  terms: (n?: number) => View
  groups: (name?: string) => View | Groups
  eq: (n: number) => View
  first: (n?: number) => View
  last: (n?: number) => View
  firstTerms: () => View
  lastTerms: () => View
  slice: (start: number, end?: number) => View
  all: () => View
  fullSentences: () => View
  none: () => View
  isDoc: (view?: View) => boolean
  wordCount: () => number

  // ---- match ----
  match: (match: string | View | Net, group?: string | number, options?: matchOptions) => View
  matchOne: (match: string | View | Net, group?: string | number, options?: matchOptions) => View
  has: (match: string | View | Net, group?: string | number, options?: matchOptions) => boolean
  if: (match: string | View | Net, group?: string | number, options?: matchOptions) => View
  ifNo: (match: string | View | Net, group?: string | number, options?: matchOptions) => View
  before: (match: string | View, group?: string | number, options?: matchOptions) => View
  after: (match: string | View, group?: string | number, options?: matchOptions) => View
  growLeft: (match: string | View, group?: string | number, options?: matchOptions) => View
  growRight: (match: string | View, group?: string | number, options?: matchOptions) => View
  grow: (match: string | View, group?: string | number, options?: matchOptions) => View
  sweep: (match: Net, opts?: object) => { view: View; found: object[] }
  splitOn: (match?: string, group?: string | number) => View
  splitBefore: (match?: string, group?: string | number) => View
  splitAfter: (match?: string, group?: string | number) => View
  split: (match?: string, group?: string | number) => View

  // ---- case ----
  toLowerCase: () => View
  toUpperCase: () => View
  toTitleCase: () => View
  toCamelCase: () => View

  // ---- insert ----
  concat: (input: string | View) => View
  insertBefore: (input: string | View) => View
  prepend: (input: string | View) => View
  insertAfter: (text: string | View) => View
  append: (text: string | View) => View
  insert: (text: string | View) => View
  remove: (match?: string | View) => View
  delete: (match?: string | View) => View
  replace: (from: string | View, to?: string | Function, keep?: object) => View
  replaceWith: (to: string | Function, keep?: object) => View
  unique: () => View
  reverse: () => View
  sort: (method?: string | Function) => View

  // ---- whitespace ----
  pre: (str?: string, concat?: boolean) => View
  post: (str?: string, concat?: boolean) => View
  trim: () => View
  hyphenate: () => View
  dehyphenate: () => View
  deHyphenate: () => View
  toQuotations: (start?: string, end?: string) => View
  toQuotation: (start?: string, end?: string) => View
  toParentheses: (start?: string, end?: string) => View

  // ---- output ----
  /** the document as text. `'root'` gives dictionary-forms */
  text: (options?: string | object) => string
  json: (options?: JsonProps | string) => any
  /** pretty-print the document and its tags to the console */
  debug: () => View
  out: (format?: outMethods) => any
  html: (toHighlight: object) => string
  wrap: (matches: object) => string

  // ---- pointers ----
  union: (match: string | View) => View
  and: (match: string | View) => View
  intersection: (match: string | View) => View
  not: (match: string | View, options?: any) => View
  difference: (match: string | View, options?: any) => View
  complement: (match: string | View) => View
  settle: (match: string | View) => View

  // ---- tags ----
  tag: (tag: string, reason?: string) => View
  tagSafe: (tag: string, reason?: string) => View
  unTag: (tag: string, reason?: string) => View
  canBe: (tag: string) => View

  // ---- cache ----
  cache: (options?: object) => View
  uncache: (options?: object) => View
  lookup: (trie: object | string[], opts?: object) => View
  autoFill: () => View

  // ---- japanese ----
  /** every 動詞 in the document */
  verbs: () => View
  /** every 名詞 in the document */
  nouns: () => View
  /** every 形容詞 and 形容動詞 in the document */
  adjectives: () => View
  /** every 助詞 in the document */
  particles: () => View
  /** every number, with its counter if it has one - 三冊, 2時間 */
  numbers: () => View
  /** the parsed value of each match, or null where there isn't one */
  toNumber: () => (number | null)[]
  /** every 助数詞 in the document */
  counters: () => View
  /** every date, time and duration */
  dates: () => View
  /** the document sounded-out in the latin alphabet */
  romanji: () => string
  /** the dictionary-form of each match - 食べました → 食べる */
  toInfinitive: () => string[]
}

/** parse some japanese text */
declare function nlp(text: string, lexicon?: Lexicon): View

declare namespace nlp {
  // ---- constructor ----
  /** interpret text without tagging */
  export function tokenize(text: string, lexicon?: Lexicon): View
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
  export function addWords(words: Lexicon): any
  /** turn a list of words into a searchable graph */
  export function buildTrie(words: string[]): object
  /** compile a set of match objects into a faster form */
  export function buildNet(matches: Match[]): Net
  /** add words to the autoFill dictionary */
  export function typeahead(words: Lexicon): any

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
   * handles kanji, half-width and full-width digits.  null if it isn't one.
   */
  export function toNumber(numeral: string): number | null
}

export default nlp
export type {
  View, VerbClass, VerbConjugation, IAdjectiveConjugation,
  NaAdjectiveConjugation, Deconjugation, Term, Lexicon, Plugin,
}
