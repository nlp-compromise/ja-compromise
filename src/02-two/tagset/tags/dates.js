export default {
  Date: {
    aliases: [null, '日付'],
    not: ['Verb', 'Adverb', 'Adjective'],
  },
  // 3月 - the number keeps its #Value, so Month can't inherit from #Singular
  // the way the english tagset does (#Noun and #Value are exclusive)
  Month: {
    aliases: [null, '月'],
    is: 'Date',
    not: ['Year', 'WeekDay', 'Time'],
  },
  WeekDay: {
    aliases: [null, '曜日'],
    is: 'Noun',
    also: ['Date'],
  },
  Year: {
    aliases: [null, '年'],
    is: 'Date',
    not: ['RomanNumeral'],
  },
  FinancialQuarter: {
    aliases: [null, '四半期'],
    is: 'Date',
    not: 'Fraction',
  },
  // 'easter'
  Holiday: {
    aliases: [null, '祝日'],
    is: 'Date',
    also: ['Noun'],
  },
  // 'summer'
  Season: {
    aliases: [null, '季節'],
    is: 'Date',
  },
  Timezone: {
    aliases: [null, 'タイムゾーン'],
    is: 'Noun',
    also: ['Date'],
    not: ['ProperNoun'],
  },
  Time: {
    aliases: [null, '時刻'],
    is: 'Date',
    not: ['AtMention'],
  },
  // 'months'
  Duration: {
    aliases: [null, '期間'],
    is: 'Noun',
    also: ['Date'],
  },
  // 十日 - the day-of-the-month
  Day: {
    aliases: [null, '日'],
    is: 'Date',
  },
  // 令和, 平成, 昭和 - the japanese regnal eras
  Era: {
    aliases: [null, '元号'],
    is: 'Date',
  },
  // 午前 / 午後
  AmPm: {
    aliases: [null, '午前午後'],
    is: 'Time',
  },
}
