import { isNumeral } from '../../numbers/kanji-number.js'

const allNumeral = function (str) {
  for (let i = 0; i < str.length; i += 1) {
    if (!isNumeral(str[i])) {
      return false
    }
  }
  return str.length > 0
}

/**
 * 二十三 arrives as 二|十|三, because each of them is a lexicon entry on its own.
 * a run of numerals is one number.
 */
const joinNumbers = function (arr) {
  let out = []
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
  return out
}
export default joinNumbers
