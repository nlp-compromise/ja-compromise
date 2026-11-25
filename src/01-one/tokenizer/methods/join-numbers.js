import { isNumeral, isDigits, large } from '../../numbers/kanji-number.js'

const allNumeral = function (str) {
  for (let i = 0; i < str.length; i += 1) {
    if (!isNumeral(str[i])) {
      return false
    }
  }
  return str.length > 0
}

// 2,000 and １，２３４．５ - the tokenizer has already made these one word
const hasCommas = /^[0-9０-９]{1,3}(?:[,，][0-9０-９]{3})+(?:[.．][0-9０-９]+)?$/
// anything that can sit in a run of numerals - 1億|2,000|万
const isPart = (str) => allNumeral(str) || hasCommas.test(str)

// the decimals of 1.5万 - plain digits, and then the 万 that multiplies them
const isDecimals = function (str) {
  let i = 0
  while (i < str.length && isDigits(str[i])) {
    i += 1
  }
  if (i === 0) {
    return false
  }
  for (let k = i; k < str.length; k += 1) {
    if (large[str[k]] === undefined) {
      return false
    }
  }
  return true
}

// 1.5, １．５ and 一・五.  「一点五」 is left alone here, because 点 is far more
// often a counter - 一点二点 is 'one point, two points'
const isPoint = (str) => str === '.' || str === '．' || str === '・'

/**
 * 1.5 arrives as 1|.|5, and the full-stop would otherwise be read as
 * punctuation hanging off the 1.  a number, one point, and a run of plain
 * digits is one decimal number.
 * anything with a second point in it is something else - a version (1.2.3),
 * or a list (一・二・三) - and is left as it was.
 */
const joinDecimals = function (arr) {
  const out = []
  for (let i = 0; i < arr.length; i += 1) {
    if (!allNumeral(arr[i])) {
      out.push(arr[i])
      continue
    }
    // 一点五倍 is 1.5 times - but 点 is a counter far more often than a
    // decimal point, so only when there's no second one - 一点二点 is
    // 'one point, two points'
    if (arr[i + 1] === '点' && isDecimals(arr[i + 2] || '') && arr[i + 3] !== '点' && out[out.length - 1] !== '点') {
      out.push(arr[i] + arr[i + 1] + arr[i + 2])
      i += 2
      continue
    }
    // how far does this number|point|digits|point|digits chain go?
    let end = i
    while (isPoint(arr[end + 1] || '') && isDecimals(arr[end + 2] || '')) {
      end += 2
    }
    // 二・二六事件 is the incident of february 26th - a date, not 2.26
    const isDateName = arr[i + 1] === '・' && (arr[end + 1] || '').startsWith('事件')
    if (end === i + 2 && !isDateName) {
      out.push(arr[i] + arr[i + 1] + arr[i + 2])
    } else {
      for (let k = i; k <= end; k += 1) {
        out.push(arr[k])
      }
    }
    i = end
  }
  return out
}

/**
 * 二十三 arrives as 二|十|三, because each of them is a lexicon entry on its own.
 * a run of numerals is one number.
 */
const joinNumbers = function (arr) {
  const out = []
  for (let i = 0; i < arr.length; i += 1) {
    if (!isPart(arr[i])) {
      out.push(arr[i])
      continue
    }
    let run = arr[i]
    while (arr[i + 1] !== undefined && isPart(arr[i + 1])) {
      run += arr[i + 1]
      i += 1
    }
    out.push(run)
  }
  return joinDecimals(out)
}
export default joinNumbers
