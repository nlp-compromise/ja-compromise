// which tags each generated verb-form should carry.
// a form is 'PastTense' *and* 'Polite' *and* 'Negative' all at once - japanese
// stacks these on one word, so the tag-list has to as well.
const verbForms = {
  Infinitive: ['Verb', 'Infinitive', 'PresentTense'],
  PresentTense: ['Verb', 'PresentTense'],
  PastTense: ['Verb', 'PastTense'],
  Negative: ['Verb', 'PresentTense', 'Negative'],
  PastNegative: ['Verb', 'PastTense', 'Negative'],
  Gerund: ['Verb', 'Gerund'],
  NegativeGerund: ['Verb', 'Gerund', 'Negative'],
  Polite: ['Verb', 'PresentTense', 'Polite'],
  PolitePast: ['Verb', 'PastTense', 'Polite'],
  PoliteNegative: ['Verb', 'PresentTense', 'Polite', 'Negative'],
  PolitePastNegative: ['Verb', 'PastTense', 'Polite', 'Negative'],
  PoliteVolitional: ['Verb', 'Volitional', 'Polite'],
  Imperative: ['Verb', 'Imperative'],
  NegativeImperative: ['Verb', 'Imperative', 'Negative'],
  Volitional: ['Verb', 'Volitional'],
  Potential: ['Verb', 'Potential', 'PresentTense'],
  Passive: ['Verb', 'Passive', 'PresentTense'],
  Causative: ['Verb', 'Causative', 'PresentTense'],
  CausativePassive: ['Verb', 'Causative', 'Passive', 'PresentTense'],
  Conditional: ['Verb', 'ConditionalVerb'],
  Provisional: ['Verb', 'ConditionalVerb'],
  Progressive: ['Verb', 'Progressive', 'PresentTense'],
  ProgressivePolite: ['Verb', 'Progressive', 'PresentTense', 'Polite'],
  PastProgressive: ['Verb', 'Progressive', 'PastTense'],
  Desire: ['Verb', 'Desire'],
  Representative: ['Verb', 'Representative'],
  Presumptive: ['Verb', 'Presumptive'],
  Continuative: ['Verb', 'Continuative'],
  Stem: ['Verb', 'VerbStem'],
}

const adjForms = {
  Infinitive: ['Adjective', 'IAdjective', 'PresentTense'],
  PresentTense: ['Adjective', 'IAdjective', 'PresentTense'],
  Negative: ['Adjective', 'IAdjective', 'PresentTense', 'Negative'],
  PastTense: ['Adjective', 'IAdjective', 'PastTense'],
  PastNegative: ['Adjective', 'IAdjective', 'PastTense', 'Negative'],
  Gerund: ['Adjective', 'IAdjective', 'Gerund'],
  Adverb: ['Adverb'],
  Provisional: ['Adjective', 'IAdjective', 'ConditionalVerb'],
  Presumptive: ['Adjective', 'IAdjective', 'Presumptive'],
  Superlative: ['Verb', 'PresentTense'],
  Impression: ['Adjective', 'Presumptive'],
  Nominal: ['Noun'],
}

// 食べたい inflects like an い-adjective - 食べたくない, 食べたかった
const desireForms = {
  Infinitive: ['Verb', 'Desire', 'PresentTense'],
  PresentTense: ['Verb', 'Desire', 'PresentTense'],
  Negative: ['Verb', 'Desire', 'PresentTense', 'Negative'],
  PastTense: ['Verb', 'Desire', 'PastTense'],
  PastNegative: ['Verb', 'Desire', 'PastTense', 'Negative'],
  Gerund: ['Verb', 'Desire', 'Gerund'],
  Provisional: ['Verb', 'Desire', 'ConditionalVerb'],
}

// the passive/potential/causative stems are themselves ichidan verbs, so
// 褒められる has a past (褒められた) and a polite past (褒められました) of its own
const derivedForms = {
  PastTense: ['PastTense'],
  Negative: ['PresentTense', 'Negative'],
  PastNegative: ['PastTense', 'Negative'],
  Gerund: ['Gerund'],
  Polite: ['PresentTense', 'Polite'],
  PolitePast: ['PastTense', 'Polite'],
  PoliteNegative: ['PresentTense', 'Polite', 'Negative'],
  PolitePastNegative: ['PastTense', 'Polite', 'Negative'],
  Progressive: ['Progressive', 'PresentTense'],
  Conditional: ['ConditionalVerb'],
  Provisional: ['ConditionalVerb'],
}

// な-adjectives inflect *with the copula* - 静か + でした - and the copula is
// its own token.  only 静かに is a word in its own right.
const naAdjForms = {
  Infinitive: ['Adjective', 'NaAdjective'],
  Adverb: ['Adverb'],
}

export { verbForms, adjForms, naAdjForms, desireForms, derivedForms }
