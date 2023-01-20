import hMap from './hiragana-map.js'

let hasMulti = new Set(['き', 'ぎ', 'し', 'じ', 'ち', 'ぢ', 'っ', 'て', 'に', 'ひ', 'び', 'ぴ', 'み', 'り'])

// there are 46 of these
const isHiragana = function (ch) {
  return ch >= "\u3040" && ch <= "\u309f";
}

// sound-out japanese script in latin alphabet
const toRomanji = function (str) {
  let chars = str.split('')
  let out = ''

  for (let i = 0; i < chars.length; i += 1) {
    let c = chars[i]
    // pass non-hiragana right through
    if (!isHiragana(str)) {
      out += c
      continue
    }
    // look ahead at greedy multi-char sequences
    if (hasMulti.has(c)) {
      if (chars[i + 1]) {
        let two = c + chars[i + 1]
        if (hMap[2].hasOwnProperty(two)) {
          out += hMap[2][two]
          i += 1
          continue
        }
        if (chars[i + 2]) {
          let three = c + chars[i + 1] + chars[i + 2]
          if (hMap[3].hasOwnProperty(three)) {
            out += hMap[3][three]
            i += 1
            continue
          }
        }
      }
    }
    // single-char map
    out += hMap[1][c] || c
  }
  return out
}

export default toRomanji

// console.log(toRomanji('ひらがな　カタカナ'))
// console.log(toRomanji('あっきょっつああ'))