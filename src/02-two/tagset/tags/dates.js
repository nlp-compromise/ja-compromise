// only our own tags, and what differs from the shared tagset - see ../plugin.js
export default {
  Date: {
    aliases: [null, '日付'],
  },
  Month: {
    aliases: [null, '月'],
    also: undefined,
    not: ['Year', 'WeekDay', 'Time'],
  },
  WeekDay: {
    aliases: [null, '曜日'],
    is: 'Noun',
    also: ['Date'],
    not: undefined,
  },
  Year: {
    aliases: [null, '年'],
    not: ['RomanNumeral'],
  },
  FinancialQuarter: {
    aliases: [null, '四半期'],
    not: 'Fraction',
  },
  Holiday: {
    aliases: [null, '祝日'],
  },
  Season: {
    aliases: [null, '季節'],
    not: undefined,
  },
  Timezone: {
    aliases: [null, 'タイムゾーン'],
    is: 'Noun',
    also: ['Date'],
  },
  Time: {
    aliases: [null, '時刻'],
    not: ['AtMention'],
  },
  Duration: {
    aliases: [null, '期間'],
    is: 'Noun',
    also: ['Date'],
  },
  Day: {
    aliases: [null, '日'],
    is: 'Date',
  },
  Era: {
    aliases: [null, '元号'],
    is: 'Date',
  },
  AmPm: {
    aliases: [null, '午前午後'],
    is: 'Time',
  },
}
