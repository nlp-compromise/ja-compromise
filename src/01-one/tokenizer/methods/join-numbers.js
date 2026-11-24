import { isNumeral, isDigits } from '../../numbers/kanji-number.js'

const allNumeral = function (str) {
  for (let i = 0; i < str.length; i += 1) {
    if (!isNumeral(str[i])) {
      return false
    }
  }
  return str.length > 0
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
    // how far does this number|point|digits|point|digits chain go?
    let end = i
    while (isPoint(arr[end + 1] || '') && isDigits(arr[end + 2] || '')) {
      end += 2
    }
    if (end === i + 2) {
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
    if (!allNumeral(arr[i])) {
      out.push(arr[i])
      continue
    }
    let run = arr[i]
    while (arr[i + 1] !== undefined && allNumeral(arr[i + 1])) {
      run += arr[i + 1]
      i += 1
    }
    out.push(run)
  }
  return joinDecimals(out)
}
export default joinNumbers
