export default {
  Verb: {
    not: ['Noun', 'Adjective', 'Adverb', 'Value', 'Expression'],
  },
  ConditionalVerb: {
    is: 'Verb',
  },
  Passive: {
    is: 'Verb',
  },
  Causative: {
    is: 'Verb',
  },
  // tense is a facet, not a class: japanese adjectives carry it too
  // (高かった is a past-tense *adjective*), so these must not imply #Verb
  PresentTense: {
    not: ['PastTense'],
  },
  Infinitive: {
    is: 'Verb',
    not: ['Gerund'],
  },
  Imperative: {
    is: 'Verb',
  },
  // the て-form takes its tense from the helper verb that follows it
  // (読んで いました), so it must not fight with #PastTense
  Gerund: {},
  PastTense: {
    not: ['PresentTense'],
  },
  Copula: {
    is: 'Verb',
  },
  Modal: {
    is: 'Verb',
    not: ['Infinitive'],
  },
  PerfectTense: {
    is: 'Verb',
    not: ['Gerund'],
  },
  Pluperfect: {
    is: 'Verb',
  },
  Participle: {
    is: 'PastTense',
  },
  PhrasalVerb: {
    is: 'Verb',
  },
  Particle: {
    is: 'PhrasalVerb',
    not: ['PastTense', 'PresentTense', 'Copula', 'Gerund'],
  },
  Auxiliary: {
    is: 'Verb',
    not: ['Conjunction'],
  },
  // japanese stacks these onto a single word, so they're facets, not classes
  Negative: {
    not: ['Noun', 'Value'],
  },
  Polite: {},
  Volitional: {
    is: 'Verb',
  },
  Potential: {
    is: 'Verb',
  },
  Progressive: {
    is: 'Verb',
  },
  Desire: {
    is: 'Verb',
  },
  Representative: {
    is: 'Verb',
  },
  Presumptive: {},
  Continuative: {
    is: 'Verb',
  },
  // 連用形 - the 'masu-stem'.  it heads a verb-phrase (泳ぎます) but stands
  // alone as a noun too - 泳ぎ is 'a swim'
  VerbStem: {
    is: 'Noun',
  },
  // 勉強, which is a noun until it meets する
  SuruVerb: {
    is: 'Noun',
  },
}
