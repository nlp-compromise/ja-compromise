// a number → 漢数字.
//
// japanese numerals are fully compositional - 23 is 二十三, literally
// 'two-ten-three' - so this is arithmetic rather than a lookup table.
// the one wrinkle is that japanese groups by 10,000 (万) and not by 1,000.

const digit = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九']
// powers that stack inside a group of four digits
const small = [['千', 1000], ['百', 100], ['十', 10]]
// powers that close a group off
const large = [['京', 1e16], ['兆', 1e12], ['億', 1e8], ['万', 1e4]]

// one group of four digits: 千百十 plus the remaining digit
const toGroup = function (n) {
  let out = ''
  for (let i = 0; i < small.length; i += 1) {
    let [kanji, power] = small[i]
    let d = Math.floor(n / power)
    if (d === 0) {
      continue
    }
    // 一十 and 一百 aren't written - 10 is 十, not 一十
    out += (d === 1 ? '' : digit[d]) + kanji
    n -= d * power
  }
  return out + digit[n]
}

/** 23 → 二十三 */
const toKanji = function (num) {
  if (typeof num !== 'number' || !Number.isFinite(num)) {
    return null
  }
  if (num < 0) {
    return 'マイナス' + toKanji(Math.abs(num))
  }
  num = Math.round(num)
  if (num === 0) {
    return '〇'
  }
  let out = ''
  for (let i = 0; i < large.length; i += 1) {
    let [kanji, power] = large[i]
    let chunk = Math.floor(num / power)
    if (chunk === 0) {
      continue
    }
    // 万 and up keep their 一 - 10,000 is 一万, never just 万
    out += toGroup(chunk) + kanji
    num -= chunk * power
  }
  return out + toGroup(num)
}

// 23 → '23',  using the same width of digit the source used
const fullWidth = '０１２３４５６７８９'
const toDigits = function (num, wide) {
  let str = String(num)
  if (!wide) {
    return str
  }
  return str.replace(/[0-9]/g, d => fullWidth[Number(d)])
}

export default toKanji
export { toDigits }
