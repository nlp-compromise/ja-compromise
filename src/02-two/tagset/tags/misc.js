const anything = ['Noun', 'Verb', 'Adjective', 'Adverb', 'Value', 'QuestionWord']

export default {
  // japanese scripts as tags
  Hiragana: {
    aliases: [null, 'ひらがな'],
    not: ['Katakana', 'Kanji', 'Ascii']
  },
  Kanji: {
    aliases: [null, '漢字'],
    not: ['Hiragana', 'Katakana', 'Ascii']
  },
  Katakana: {
    aliases: [null, 'カタカナ'],
    not: ['Hiragana', 'Kanji', 'Ascii']
  },
  Ascii: {
    not: ['Hiragana', 'Kanji', 'Katakana']
  },

  Adjective: {
    aliases: [null, '形容詞'],
    not: ['Noun', 'Verb', 'Adverb', 'Value'],
  },
  // 形容詞 - conjugates by itself: 高い → 高くない → 高かった
  IAdjective: {
    aliases: [null, 'イ形容詞'],
    is: 'Adjective',
  },
  // 形容動詞 - needs the copula: 静か → 静かだ → 静かな
  NaAdjective: {
    aliases: [null, 'ナ形容詞', '形容動詞'],
    is: 'Adjective',
  },
  // 連体詞 - only ever modifies a noun: 大きな, この
  Adnominal: {
    aliases: [null, '連体詞'],
  },
  Comparable: {
    is: 'Adjective',
  },
  Comparative: {
    aliases: [null, '比較級'],
    is: 'Adjective',
  },
  Superlative: {
    aliases: [null, '最上級'],
    is: 'Adjective',
    not: ['Comparative'],
  },
  NumberRange: {
    aliases: [null, '数値範囲'],
  },
  Adverb: {
    aliases: [null, '副詞'],
    not: ['Noun', 'Verb', 'Adjective', 'Value'],
  },

  Determiner: {
    aliases: [null, '限定詞'],
    not: ['Noun', 'Verb', 'Adjective', 'Adverb', 'QuestionWord', 'Conjunction'], //allow 'a' to be a Determiner/Value
  },
  Conjunction: {
    aliases: [null, '接続詞'],
    not: anything,
  },
  Preposition: {
    not: ['Noun', 'Verb', 'Adjective', 'Adverb', 'QuestionWord'],
  },
  QuestionWord: {
    aliases: [null, '疑問詞'],
    not: ['Determiner'],
  },
  Currency: {
    aliases: [null, '通貨'],
    is: 'Noun',
  },
  Expression: {
    aliases: [null, '感動詞'],
    not: ['Noun', 'Adjective', 'Verb', 'Adverb'],
  },
  Abbreviation: {
    aliases: [null, '略語'],
  },
  Url: {
    not: ['HashTag', 'PhoneNumber', 'Verb', 'Adjective', 'Value', 'AtMention', 'Email'],
  },
  PhoneNumber: {
    aliases: [null, '電話番号'],
    not: ['HashTag', 'Verb', 'Adjective', 'Value', 'AtMention', 'Email'],
  },
  HashTag: {
    aliases: [null, 'ハッシュタグ'],
  },
  AtMention: {
    aliases: [null, 'メンション'],
    is: 'Noun',
    not: ['HashTag', 'Email'],
  },
  Emoji: {
    aliases: [null, '絵文字'],
    not: ['HashTag', 'Verb', 'Adjective', 'Value', 'AtMention'],
  },
  Emoticon: {
    aliases: [null, '顔文字'],
    not: ['HashTag', 'Verb', 'Adjective', 'Value', 'AtMention'],
  },
  Email: {
    aliases: [null, 'メール'],
    not: ['HashTag', 'Verb', 'Adjective', 'Value', 'AtMention'],
  },
  Acronym: {
    aliases: [null, '頭字語'],
    not: ['Plural', 'RomanNumeral'],
  },
  Condition: {
    aliases: [null, '条件'],
    not: ['Verb', 'Adjective', 'Noun', 'Value'],
  },
}
