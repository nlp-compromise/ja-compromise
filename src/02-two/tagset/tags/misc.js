// only our own tags, and what differs from the shared tagset - see ../plugin.js
export default {
  Hiragana: {
    aliases: [null, 'ひらがな'],
    not: ['Katakana', 'Kanji', 'Ascii'],
  },
  Kanji: {
    aliases: [null, '漢字'],
    not: ['Hiragana', 'Katakana', 'Ascii'],
  },
  Katakana: {
    aliases: [null, 'カタカナ'],
    not: ['Hiragana', 'Kanji', 'Ascii'],
  },
  Ascii: {
    not: ['Hiragana', 'Kanji', 'Katakana'],
  },
  Adjective: {
    aliases: [null, '形容詞'],
  },
  IAdjective: {
    aliases: [null, 'イ形容詞'],
    is: 'Adjective',
  },
  NaAdjective: {
    aliases: [null, 'ナ形容詞', '形容動詞'],
    is: 'Adjective',
  },
  Adnominal: {
    aliases: [null, '連体詞'],
  },
  Comparable: {
  },
  Comparative: {
    aliases: [null, '比較級'],
  },
  Superlative: {
    aliases: [null, '最上級'],
  },
  NumberRange: {
    aliases: [null, '数値範囲'],
  },
  Adverb: {
    aliases: [null, '副詞'],
  },
  Determiner: {
    aliases: [null, '限定詞'],
  },
  Conjunction: {
    aliases: [null, '接続詞'],
    is: undefined,
    not: ['Noun', 'Verb', 'Adjective', 'Adverb', 'Value', 'QuestionWord'],
  },
  Preposition: {
    is: undefined,
    not: ['Noun', 'Verb', 'Adjective', 'Adverb', 'QuestionWord'],
  },
  QuestionWord: {
    aliases: [null, '疑問詞'],
  },
  Currency: {
    aliases: [null, '通貨'],
  },
  Expression: {
    aliases: [null, '感動詞'],
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
    is: undefined,
  },
}
