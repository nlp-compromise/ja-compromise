import lexicon from '../../lexicon/lexicon.js'
import { getType, isKanji } from './lib.js'

// suffixes that belong to the word in front of them
const suffixes = new Set(['たち', '達'])
// honorific prefixes that belong to the word behind them
const prefixes = new Set(['お', 'ご', '御'])

// two unknown characters may only merge if they're the same script.
// 'kanji then hiragana' used to merge too, which glued particles onto nouns.
const mergeTypes = function (a, b) {
  return a === b && a !== 'punctuation' && a !== 'other'
}

// an unknown kanji run longer than this is almost certainly two words.
// katakana has no such limit - ニュージーランド is one word.
const MAX_RUN = 4
const runLimit = (type) => (type === 'kanji' || type === 'hiragana' ? MAX_RUN : Infinity)

/** glue neighbouring unknown characters into plausible words */
const joinUp = function (arr) {
  let out = []
  for (let i = 0; i < arr.length; i += 1) {
    let c = arr[i]
    if (c === null || c === '') {
      continue
    }
    let last = out[out.length - 1]
    // 私 + たち,  田中 + さん
    if (suffixes.has(c) && last && !lexicon[last + c]) {
      out[out.length - 1] = last + c
      continue
    }
    // お + 金,  ご + 飯
    if (prefixes.has(c) && arr[i + 1] && isKanji(arr[i + 1][0]) && !lexicon[c]) {
      out.push(c + arr[i + 1])
      i += 1
      continue
    }
    if (c.length === 1 && !lexicon[c]) {
      let type = getType(c)
      let run = c
      // race ahead, joining same-script characters.
      // a *known* single kanji may join an already-started run (日+本+人),
      // but never starts one - so 「読んでいる人」 keeps 人 on its own.
      let limit = runLimit(type)
      while (run.length < limit && arr[i + 1] !== undefined) {
        let next = arr[i + 1]
        if (next.length !== 1 || !mergeTypes(type, getType(next))) {
          break
        }
        if (lexicon[next] && type !== 'kanji') {
          break
        }
        run += next
        i += 1
      }
      out.push(run)
      continue
    }
    out.push(c)
  }
  return out
}

export default joinUp
