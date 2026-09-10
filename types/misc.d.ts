// shared types.
// compromise ships its own copies of these, but its `./one` subpath has no
// `types` condition in its exports map, so they can't be imported from here.
// they're restated rather than re-exported - keep them in sync with
// compromise/types/misc.ts when bumping the dependency.

export type Document = Term[][]

export type Pointer = [n?: number, start?: number, end?: number, startId?: string, endId?: string]

export type outMethods = 'text' | 'normal' | 'offset' | 'terms' | 'topk' | 'json' | 'tags' | 'array' | 'debug'

export type Groups = object

export interface Term {
  text: string
  pre: string
  post: string
  normal: string
  tags?: Set<string>
  index?: [n?: number, start?: number]
  id?: string
  chunk?: string
  dirty?: boolean
  /** the dictionary-form, after `.compute('root')` - 食べました → 食べる */
  root?: string
  /** latin-alphabet spelling, after `.compute('romanji')` */
  romanji?: string
  /** kana spelling of the word's kanji, after `.compute('readings')` */
  reading?: string
  /** the parsed value of a numeral - 「二十三」 gives 23 */
  number?: number
}

/** options for `.json()` */
export interface JsonProps {
  text?: boolean
  normal?: boolean
  reduced?: boolean
  trim?: boolean
  offset?: boolean
  count?: boolean
  unique?: boolean
  index?: boolean
  terms?: {
    text?: boolean
    normal?: boolean
    clean?: boolean
    implicit?: boolean
    tags?: boolean
    whitespace?: boolean
    id?: boolean
    offset?: boolean
    bestTag?: boolean
  }
}

/** a key-value object of words and their tags */
export interface Lexicon {
  [key: string]: string
}

export interface Plugin {
  methods?: object
  model?: object
  compute?: object
  hooks?: string[]
  tags?: object
  words?: object
  lib?: () => object
  api?: (fn: (view: any) => {}) => void
  mutate?: (fn: (world: object) => {}) => void
}

export interface matchOptions {
  fuzzy?: number
  caseSensitive?: boolean
}

export interface Match {
  match: string
  tag?: string | string[]
  unTag?: string | string[]
  group?: string | number
  reason?: string
}

export interface Net {
  hooks: object
  always?: any
  isNet: boolean
}
