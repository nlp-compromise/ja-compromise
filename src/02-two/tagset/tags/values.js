export default {
  Value: {
    not: ['Verb', 'Adjective', 'Adverb'],
  },
  Ordinal: {
    is: 'Value',
    not: ['Cardinal'],
  },
  Cardinal: {
    is: 'Value',
    not: ['Ordinal'],
  },
  Fraction: {
    is: 'Value',
    not: ['Noun'],
  },
  Multiple: {
    is: 'Value',
  },
  RomanNumeral: {
    is: 'Cardinal',
    not: ['TextValue'],
  },
  TextValue: {
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
    is: 'Value',
    not: ['TextValue'],
  },
  Money: {
    is: 'Cardinal',
  },
  // 助数詞 - the counter after a number.  japanese can't count a noun
  // directly: it's 本を三冊, never 三本
  Counter: {
    is: 'Noun',
    not: ['Verb', 'Adjective', 'Adverb'],
  },
  // 時, 分, 秒 - a point on the clock
  TimeCounter: {
    is: 'Counter',
  },
  // 時間, 週間, ヶ月 - a span of time
  DurationCounter: {
    is: 'Counter',
    also: ['Duration'],
  },
  // 年, 月, 日 - a date *or* a duration, depending on context
  DateCounter: {
    is: 'Counter',
  },
  // the number and its counter, together - 三冊, 2時間
  NumberPhrase: {},
  Percent: {
    is: 'Value',
  },
}
