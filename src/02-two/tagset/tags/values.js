// only our own tags, and what differs from the shared tagset - see ../plugin.js
export default {
  Value: {
    aliases: [null, '数'],
  },
  Ordinal: {
    aliases: [null, '序数'],
  },
  Cardinal: {
    aliases: [null, '基数'],
  },
  Fraction: {
    aliases: [null, '分数'],
  },
  Multiple: {
    aliases: [null, '倍数'],
    is: 'Value',
  },
  RomanNumeral: {
    aliases: [null, 'ローマ数字'],
    not: ['TextValue'],
  },
  TextValue: {
    aliases: [null, '数詞'],
    not: ['NumericValue'],
  },
  TextOrdinal: {
    is: 'TextValue',
    also: ['Ordinal'],
  },
  TextCardinal: {
    is: 'TextValue',
    also: ['Cardinal'],
  },
  NumericValue: {
    aliases: [null, '数値'],
    not: ['TextValue'],
  },
  Money: {
    aliases: [null, '金額'],
  },
  Counter: {
    aliases: [null, '助数詞'],
    is: 'Noun',
    not: ['Verb', 'Adjective', 'Adverb'],
  },
  TimeCounter: {
    aliases: [null, '時刻助数詞'],
    is: 'Counter',
  },
  DurationCounter: {
    aliases: [null, '期間助数詞'],
    is: 'Counter',
    also: ['Duration'],
  },
  DateCounter: {
    aliases: [null, '日付助数詞'],
    is: 'Counter',
  },
  NumberPhrase: {
    aliases: [null, '数量表現'],
  },
  Percent: {
    aliases: [null, 'パーセント'],
  },
}
