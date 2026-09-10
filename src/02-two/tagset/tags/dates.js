export default {
  Date: {
    not: ['Verb', 'Adverb', 'Adjective'],
  },
  // 3月 - the number keeps its #Value, so Month can't inherit from #Singular
  // the way the english tagset does (#Noun and #Value are exclusive)
  Month: {
    is: 'Date',
    not: ['Year', 'WeekDay', 'Time'],
  },
  WeekDay: {
    is: 'Noun',
    also: ['Date'],
  },
  Year: {
    is: 'Date',
    not: ['RomanNumeral'],
  },
  FinancialQuarter: {
    is: 'Date',
    not: 'Fraction',
  },
  // 'easter'
  Holiday: {
    is: 'Date',
    also: ['Noun'],
  },
  // 'summer'
  Season: {
    is: 'Date',
  },
  Timezone: {
    is: 'Noun',
    also: ['Date'],
    not: ['ProperNoun'],
  },
  Time: {
    is: 'Date',
    not: ['AtMention'],
  },
  // 'months'
  Duration: {
    is: 'Noun',
    also: ['Date'],
  },
  // 十日 - the day-of-the-month
  Day: {
    is: 'Date',
  },
  // 令和, 平成, 昭和 - the japanese regnal eras
  Era: {
    is: 'Date',
  },
  // 午前 / 午後
  AmPm: {
    is: 'Time',
  },
}
