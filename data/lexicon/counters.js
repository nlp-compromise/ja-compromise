// 助数詞 - counters.
// japanese can't count a noun directly: it's 本を三冊, never 三本.
// the counter says what *kind* of thing is being counted, so it's the closest
// thing japanese has to a unit.
//
// the value is the tag the counter gets, on top of #Counter.
export default {
  // ---- generic ----
  'つ': 'Counter',      // native numerals - 一つ, 二つ
  '個': 'Counter',
  'ヶ': 'Counter',
  '箇': 'Counter',
  '件': 'Counter',
  '点': 'Counter',
  '品': 'Counter',

  // ---- living things ----
  '人': 'Counter',      // people
  '名': 'Counter',      // people, formal
  '匹': 'Counter',      // small animals
  '頭': 'Counter',      // large animals
  '羽': 'Counter',      // birds, rabbits
  '尾': 'Counter',      // fish

  // ---- shapes ----
  '本': 'Counter',      // long thin things - pens, bottles, trees
  '枚': 'Counter',      // flat things - paper, plates, shirts
  '冊': 'Counter',      // bound things - books
  '台': 'Counter',      // machines, vehicles
  '軒': 'Counter',      // buildings
  '棟': 'Counter',
  '隻': 'Counter',      // ships
  '着': 'Counter',      // clothing
  '足': 'Counter',      // footwear, in pairs
  '杯': 'Counter',      // cupfuls
  '皿': 'Counter',
  '粒': 'Counter',
  '束': 'Counter',
  '組': 'Counter',
  '対': 'Counter',
  '通': 'Counter',      // letters
  '通り': 'Counter',
  '切れ': 'Counter',
  '面': 'Counter',
  '部': 'Counter',
  '室': 'Counter',
  '席': 'Counter',
  '発': 'Counter',
  '筆': 'Counter',

  // ---- time ----
  '秒': 'TimeCounter',
  '分': 'TimeCounter',
  '時': 'TimeCounter',
  '時間': 'DurationCounter',
  '分間': 'DurationCounter',
  '秒間': 'DurationCounter',
  '日間': 'DurationCounter',
  '週': 'DurationCounter',
  '週間': 'DurationCounter',
  'ヶ月': 'DurationCounter',
  'か月': 'DurationCounter',
  'カ月': 'DurationCounter',
  '箇月': 'DurationCounter',
  'ヵ月': 'DurationCounter',
  '年間': 'DurationCounter',
  '世紀': 'DurationCounter',
  '泊': 'DurationCounter',
  // 年/月/日 are dates *or* durations, decided by context in 07-dates.js
  '年': 'DateCounter',
  '月': 'DateCounter',
  '日': 'DateCounter',

  // ---- money ----
  '円': 'Currency',
  'ドル': 'Currency',
  'ユーロ': 'Currency',
  'ポンド': 'Currency',
  '元': 'Currency',
  'ウォン': 'Currency',
  '銭': 'Currency',

  // ---- measures ----
  '歳': 'Counter',      // years of age
  '才': 'Counter',
  '度': 'Counter',      // degrees, occurrences
  '回': 'Counter',      // times
  '倍': 'Counter',      // -fold
  '割': 'Counter',      // tenths
  '%': 'Percent',
  '％': 'Percent',
  'パーセント': 'Percent',
  'メートル': 'Counter',
  'キロ': 'Counter',
  'センチ': 'Counter',
  'ミリ': 'Counter',
  'グラム': 'Counter',
  'キロメートル': 'Counter',
  'キログラム': 'Counter',
  'リットル': 'Counter',
  'トン': 'Counter',
  'インチ': 'Counter',
  'ページ': 'Counter',
  '頁': 'Counter',
  '階': 'Counter',      // storeys
  '号': 'Counter',
  '章': 'Counter',
  '課': 'Counter',
  '番': 'Ordinal',      // 三番 - third
  '番目': 'Ordinal',
  '個目': 'Ordinal',
  '人目': 'Ordinal',
  '回目': 'Ordinal',
  '位': 'Ordinal',
}
