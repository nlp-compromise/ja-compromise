export default {
  Verb: {
    aliases: [null, '動詞'],
    not: ['Noun', 'Adjective', 'Adverb', 'Value', 'Expression'],
  },
  ConditionalVerb: {
    aliases: [null, '条件形'],
    is: 'Verb',
  },
  Passive: {
    aliases: [null, '受身'],
    is: 'Verb',
  },
  Causative: {
    aliases: [null, '使役'],
    is: 'Verb',
  },
  // tense is a facet, not a class: japanese adjectives carry it too
  // (高かった is a past-tense *adjective*), so these must not imply #Verb
  PresentTense: {
    aliases: [null, '現在形'],
    not: ['PastTense'],
  },
  Infinitive: {
    aliases: [null, '辞書形'],
    is: 'Verb',
    not: ['Gerund'],
  },
  Imperative: {
    aliases: [null, '命令形'],
    is: 'Verb',
  },
  // the て-form takes its tense from the helper verb that follows it
  // (読んで いました), so it must not fight with #PastTense
  Gerund: {
    aliases: [null, 'て形'],
  },
  PastTense: {
    aliases: [null, '過去形'],
    not: ['PresentTense'],
  },
  Copula: {
    aliases: [null, 'コピュラ'],
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
    aliases: [null, '助動詞'],
    is: 'Verb',
    not: ['Conjunction'],
  },
  // japanese stacks these onto a single word, so they're facets, not classes
  Negative: {
    aliases: [null, '否定'],
    not: ['Noun', 'Value'],
  },
  Polite: {
    aliases: [null, '丁寧'],
  },
  Volitional: {
    aliases: [null, '意向形'],
    is: 'Verb',
  },
  Potential: {
    aliases: [null, '可能形'],
    is: 'Verb',
  },
  Progressive: {
    aliases: [null, '進行形'],
    is: 'Verb',
  },
  Desire: {
    aliases: [null, '願望'],
    is: 'Verb',
  },
  Representative: {
    aliases: [null, 'たり形'],
    is: 'Verb',
  },
  Presumptive: {
    aliases: [null, '推量'],
  },
  Continuative: {
    aliases: [null, 'ながら形'],
    is: 'Verb',
  },
  // 連用形 - the 'masu-stem'.  it heads a verb-phrase (泳ぎます) but stands
  // alone as a noun too - 泳ぎ is 'a swim'
  VerbStem: {
    aliases: [null, '連用形'],
    is: 'Noun',
  },
  // 勉強, which is a noun until it meets する
  SuruVerb: {
    aliases: [null, 'サ変名詞'],
    is: 'Noun',
  },
}
