// 数詞 - numerals.
// 十 and 百 are powers, not digits: 三百二十一 is (3×100)+(2×10)+1.
// parsing lives in src/01-one/numbers/kanji-number.js
export default [
  // digits
  '〇', '零', '一', '二', '三', '四', '五', '六', '七', '八', '九',
  // powers
  '十', '百', '千', '万', '萬', '億', '兆', '京',
  // 大字 - the formal forms used on cheques and contracts
  '壱', '弐', '参', '肆', '伍', '陸', '漆', '捌', '玖', '拾', '佰', '仟',
  // native numerals, which fuse with the つ counter
  '一つ', '二つ', '三つ', '四つ', '五つ', '六つ', '七つ', '八つ', '九つ', '十',
  'ひとつ', 'ふたつ', 'みっつ', 'よっつ', 'いつつ', 'むっつ', 'ななつ', 'やっつ', 'ここのつ', 'とお',
  // 何 asks 'how many' - it behaves like a numeral
  '何',
]
