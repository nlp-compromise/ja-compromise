// only our own tags, and what differs from the shared tagset - see ../plugin.js
export default {
  Verb: {
    aliases: [null, '動詞'],
  },
  ConditionalVerb: {
    aliases: [null, '条件形'],
    is: 'Verb',
  },
  Passive: {
    aliases: [null, '受身'],
  },
  Causative: {
    aliases: [null, '使役'],
    is: 'Verb',
  },
  PresentTense: {
    aliases: [null, '現在形'],
    is: undefined,
    not: ['PastTense'],
  },
  Infinitive: {
    aliases: [null, '辞書形'],
    is: 'Verb',
  },
  Imperative: {
    aliases: [null, '命令形'],
    not: undefined,
  },
  Gerund: {
    aliases: [null, 'て形'],
    is: undefined,
    not: undefined,
  },
  PastTense: {
    aliases: [null, '過去形'],
    is: undefined,
    not: ['PresentTense'],
  },
  Copula: {
    aliases: [null, 'コピュラ'],
  },
  Modal: {
  },
  PerfectTense: {
    is: 'Verb',
    not: ['Gerund'],
  },
  Pluperfect: {
    is: 'Verb',
  },
  Participle: {
  },
  PhrasalVerb: {
  },
  Particle: {
  },
  Auxiliary: {
    aliases: [null, '助動詞'],
    not: ['Conjunction'],
  },
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
  VerbStem: {
    aliases: [null, '連用形'],
    is: 'Noun',
  },
  SuruVerb: {
    aliases: [null, 'サ変名詞'],
    is: 'Noun',
  },
}
