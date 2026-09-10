const anything = ['Noun', 'Verb', 'Adjective', 'Adverb', 'Value', 'QuestionWord']

export default {
  // japanese scripts as tags
  Hiragana: {
    not: ['Katakana', 'Kanji', 'Ascii']
  },
  Kanji: {
    not: ['Hiragana', 'Katakana', 'Ascii']
  },
  Katakana: {
    not: ['Hiragana', 'Kanji', 'Ascii']
  },
  Ascii: {
    not: ['Hiragana', 'Kanji', 'Katakana']
  },

  Adjective: {
    not: ['Noun', 'Verb', 'Adverb', 'Value'],
  },
  // 形容詞 - conjugates by itself: 高い → 高くない → 高かった
  IAdjective: {
    is: 'Adjective',
  },
  // 形容動詞 - needs the copula: 静か → 静かだ → 静かな
  NaAdjective: {
    is: 'Adjective',
  },
  // 連体詞 - only ever modifies a noun: 大きな, この
  Adnominal: {},
  Comparable: {
    is: 'Adjective',
  },
  Comparative: {
    is: 'Adjective',
  },
  Superlative: {
    is: 'Adjective',
    not: ['Comparative'],
  },
  NumberRange: {},
  Adverb: {
    not: ['Noun', 'Verb', 'Adjective', 'Value'],
  },

  Determiner: {
    not: ['Noun', 'Verb', 'Adjective', 'Adverb', 'QuestionWord', 'Conjunction'], //allow 'a' to be a Determiner/Value
  },
  Conjunction: {
    not: anything,
  },
  Preposition: {
    not: ['Noun', 'Verb', 'Adjective', 'Adverb', 'QuestionWord'],
  },
  QuestionWord: {
    not: ['Determiner'],
  },
  Currency: {
    is: 'Noun',
  },
  Expression: {
    not: ['Noun', 'Adjective', 'Verb', 'Adverb'],
  },
  Abbreviation: {},
  Url: {
    not: ['HashTag', 'PhoneNumber', 'Verb', 'Adjective', 'Value', 'AtMention', 'Email'],
  },
  PhoneNumber: {
    not: ['HashTag', 'Verb', 'Adjective', 'Value', 'AtMention', 'Email'],
  },
  HashTag: {},
  AtMention: {
    is: 'Noun',
    not: ['HashTag', 'Email'],
  },
  Emoji: {
    not: ['HashTag', 'Verb', 'Adjective', 'Value', 'AtMention'],
  },
  Emoticon: {
    not: ['HashTag', 'Verb', 'Adjective', 'Value', 'AtMention'],
  },
  Email: {
    not: ['HashTag', 'Verb', 'Adjective', 'Value', 'AtMention'],
  },
  Acronym: {
    not: ['Plural', 'RomanNumeral'],
  },
  Condition: {
    not: ['Verb', 'Adjective', 'Noun', 'Value'],
  },
}
