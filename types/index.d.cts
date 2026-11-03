// CommonJS exports the callable directly; share its API with the ESM declarations.
import type esm from './index.js' with { "resolution-mode": "import" }
import type * as api from './index.js' with { "resolution-mode": "import" }

declare const nlp: typeof esm
declare namespace nlp {
  export type View = api.View
  export type Numbers = api.Numbers
  export type VerbClass = api.VerbClass
  export type VerbConjugation = api.VerbConjugation
  export type IAdjectiveConjugation = api.IAdjectiveConjugation
  export type NaAdjectiveConjugation = api.NaAdjectiveConjugation
  export type Deconjugation = api.Deconjugation
  export type NumberParse = api.NumberParse
  export type Term = api.Term
  export type Lexicon = api.Lexicon
  export type Plugin = api.Plugin
}

export = nlp
