export default {
  Value: {
    aliases: [null, '数'],
    not: ['Verb', 'Adjective', 'Adverb'],
  },
  Ordinal: {
    aliases: [null, '序数'],
    is: 'Value',
    not: ['Cardinal'],
  },
  Cardinal: {
    aliases: [null, '基数'],
    is: 'Value',
    not: ['Ordinal'],
  },
  Fraction: {
    aliases: [null, '分数'],
    is: 'Value',
    not: ['Noun'],
  },
  Multiple: {
    aliases: [null, '倍数'],
    is: 'Value',
  },
  RomanNumeral: {
    aliases: [null, 'ローマ数字'],
    is: 'Cardinal',
    not: ['TextValue'],
  },
  TextValue: {
    aliases: [null, '数詞'],
    is: 'Value',
    not: ['NumericValue'],
  },
  TextOrdinal: {
    is: 'TextValue',
    also: ['Ordinal']
  },
  TextCardinal: {
    is: 'TextValue',
    also: ['Cardinal']
  },

  NumericValue: {
    aliases: [null, '数値'],
    is: 'Value',
    not: ['TextValue'],
  },
  Money: {
    aliases: [null, '金額'],
    is: 'Cardinal',
  },
  // 助数詞 - the counter after a number.  japanese can't count a noun
  // directly: it's 本を三冊, never 三本
  Counter: {
    aliases: [null, '助数詞'],
    is: 'Noun',
    not: ['Verb', 'Adjective', 'Adverb'],
  },
  // 時, 分, 秒 - a point on the clock
  TimeCounter: {
    aliases: [null, '時刻助数詞'],
    is: 'Counter',
  },
  // 時間, 週間, ヶ月 - a span of time
  DurationCounter: {
    aliases: [null, '期間助数詞'],
    is: 'Counter',
    also: ['Duration'],
  },
  // 年, 月, 日 - a date *or* a duration, depending on context
  DateCounter: {
    aliases: [null, '日付助数詞'],
    is: 'Counter',
  },
  // the number and its counter, together - 三冊, 2時間
  NumberPhrase: {
    aliases: [null, '数量表現'],
  },
  Percent: {
    aliases: [null, 'パーセント'],
    is: 'Value',
  },
}
