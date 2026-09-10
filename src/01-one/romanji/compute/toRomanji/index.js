import hMap from './hiragana-map.js'

let hasMulti = new Set(['き', 'ぎ', 'し', 'じ', 'ち', 'ぢ', 'っ', 'て', 'に', 'ひ', 'び', 'ぴ', 'み', 'り'])

// katakana and hiragana are the same 46 sounds, 0x60 apart in unicode.
// fold katakana down so one map handles both scripts.
const toHiragana = function (str) {
  let out = ''
  for (let i = 0; i < str.length; i += 1) {
    let c = str[i]
    if (c >= 'ァ' && c <= 'ヶ') {
      out += String.fromCharCode(c.charCodeAt(0) - 0x60)
    } else {
      out += c
    }
  }
  return out
}

// there are 46 of these
const isHiragana = function (ch) {
  return ch >= "\u3040" && ch <= "\u309f";
}

const vowels = 'aiueo'

// sound-out japanese script in latin alphabet
const toRomanji = function (str) {
  let chars = toHiragana(str).split('')
  let out = ''

  for (let i = 0; i < chars.length; i += 1) {
    let c = chars[i]
    // ー is the 長音符 - it lengthens the vowel of the syllable before it
    if (c === 'ー' || c === 'ｰ') {
      let last = out[out.length - 1]
      if (last && vowels.includes(last)) {
        out += last
      }
      continue
    }
    // pass non-hiragana right through
    if (!isHiragana(c)) {
      out += c
      continue
    }
    // a lone っ doubles the consonant that follows it, and is silent at the
    // end of a word - it never spells anything by itself
    if (c === 'っ') {
      let next = chars[i + 1] ? hMap[1][chars[i + 1]] : ''
      if (next && !vowels.includes(next[0])) {
        out += next[0]
      }
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