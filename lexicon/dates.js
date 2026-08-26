// 日付 - date words.
// numeric dates (1995年3月10日) are assembled by the tagger from
// number + counter;  these are the ones that are words in their own right.
export default {
  // 元号 - the regnal eras.  令和5年 is 2023
  '令和': 'Era',
  '平成': 'Era',
  '昭和': 'Era',
  '大正': 'Era',
  '明治': 'Era',
  '西暦': 'Era',
  '紀元前': 'Era',

  // relative days
  '今日': 'Date',
  'きょう': 'Date',
  '本日': 'Date',
  '明日': 'Date',
  'あした': 'Date',
  'あす': 'Date',
  '昨日': 'Date',
  'きのう': 'Date',
  '明後日': 'Date',
  'あさって': 'Date',
  '一昨日': 'Date',
  'おととい': 'Date',
  '今朝': 'Date',
  '今晩': 'Date',
  '今夜': 'Date',
  '昨夜': 'Date',
  '夕べ': 'Date',

  // relative weeks, months, years
  '今週': 'Date',
  '来週': 'Date',
  '先週': 'Date',
  '再来週': 'Date',
  '今月': 'Date',
  '来月': 'Date',
  '先月': 'Date',
  '再来月': 'Date',
  '今年': 'Date',
  'ことし': 'Date',
  '来年': 'Date',
  '去年': 'Date',
  '昨年': 'Date',
  '再来年': 'Date',
  '一昨年': 'Date',
  '週末': 'Date',
  '平日': 'Date',
  '当日': 'Date',
  '前日': 'Date',
  '翌日': 'Date',
  '翌年': 'Date',
  '初旬': 'Date',
  '中旬': 'Date',
  '下旬': 'Date',
  '正月': 'Date',

  // recurring
  '毎日': 'Date',
  '毎朝': 'Date',
  '毎晩': 'Date',
  '毎週': 'Date',
  '毎月': 'Date',
  '毎年': 'Date',

  // 季節 - seasons
  '春': 'Season',
  '夏': 'Season',
  '秋': 'Season',
  '冬': 'Season',

  // times of day
  '午前': 'AmPm',
  '午後': 'AmPm',
  '正午': 'Time',
  '朝': 'Time',
  '昼': 'Time',
  '夕方': 'Time',
  '夜': 'Time',
  '深夜': 'Time',
  '真夜中': 'Time',
}
