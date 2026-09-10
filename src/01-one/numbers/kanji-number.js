// 漢数字 → a javascript number.
// japanese numerals are positional-by-power rather than positional-by-digit:
// 三百二十一 is (3×100) + (2×10) + 1, and 三万 is 3×10,000.

const digits = {
  '〇': 0, '零': 0, '０': 0, '0': 0,
  '一': 1, '壱': 1, '１': 1, '1': 1,
  '二': 2, '弐': 2, '２': 2, '2': 2,
  '三': 3, '参': 3, '３': 3, '3': 3,
  '四': 4, '肆': 4, '４': 4, '4': 4,
  '五': 5, '伍': 5, '５': 5, '5': 5,
  '六': 6, '陸': 6, '６': 6, '6': 6,
  '七': 7, '漆': 7, '７': 7, '7': 7,
  '八': 8, '捌': 8, '８': 8, '8': 8,
  '九': 9, '玖': 9, '９': 9, '9': 9,
}
// powers that stack inside a group
const small = { '十': 10, '拾': 10, '百': 100, '佰': 100, '千': 1000, '仟': 1000 }
// powers that close a group off
const large = { '万': 1e4, '萬': 1e4, '億': 1e8, '兆': 1e12, '京': 1e16 }

const isNumeral = function (c) {
  return digits[c] !== undefined || small[c] !== undefined || large[c] !== undefined
}

/** parse a japanese numeral - returns null if the string isn't one */
const toNumber = function (str) {
  if (!str) {
    return null
  }
  let total = 0    // everything closed off by 万/億/兆
  let section = 0  // the current group, below 10,000
  let current = 0  // the digits seen since the last power
  let seen = false

  for (let i = 0; i < str.length; i += 1) {
    let c = str[i]
    if (digits[c] !== undefined) {
      // 15 and １５ are positional, so keep multiplying up
      current = Number(current * 10) + Number(digits[c])
      seen = true
      continue
    }
    if (small[c] !== undefined) {
      // 十 on its own is 10, not 0
      section += (current === 0 ? 1 : current) * small[c]
      current = 0
      seen = true
      continue
    }
    if (large[c] !== undefined) {
      // a bare 万 is 10,000 - but 五十万 is 50×10,000, not 51×10,000
      let group = section + current
      total += (group === 0 ? 1 : group) * large[c]
      section = 0
      current = 0
      seen = true
      continue
    }
    return null // not a numeral
  }
  if (!seen) {
    return null
  }
  return total + section + current
}

export default toNumber
export { isNumeral, digits, small, large }
