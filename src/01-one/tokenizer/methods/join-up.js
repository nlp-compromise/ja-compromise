import ownLexicon from '../../lexicon/lexicon.js'
import { getType, isKanji, isKatakana } from './lib.js'

// suffixes that belong to the word in front of them
const suffixes = new Set(['たち', '達'])
// honorific prefixes that belong to the word behind them
const prefixes = new Set(['お', 'ご', '御'])

// アメリカ + 人, フランス + 語
const ofCountry = new Set(['人', '語', '製', '産'])
const isCountry = function (lexicon, str) {
  const tags = lexicon[str]
  return tags === 'Country' || (Array.isArray(tags) && tags.includes('Country'))
}
const allKatakana = (str) => str.length > 1 && str.split('').every(c => isKatakana(c) || c === 'ー')

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
const joinUp = function (arr, lexicon = ownLexicon) {
  const out = []
  for (let i = 0; i < arr.length; i += 1) {
    const c = arr[i]
    if (c === null || c === '') {
      continue
    }
    const last = out[out.length - 1]
    // 私 + たち,  田中 + さん
    if (suffixes.has(c) && last && !lexicon[last + c]) {
      out[out.length - 1] = last + c
      continue
    }
    // アメリカ + 人
    if (ofCountry.has(c) && last && isCountry(lexicon, last)) {
      out[out.length - 1] = last + c
      continue
    }
    // キャンプ + 用, テレビ + 局 - a lone kanji we don't know, after a loanword, is its suffix
    const after = arr[i + 1]
    if (c.length === 1 && isKanji(c) && !lexicon[c] && last && allKatakana(last) && !(after && isKanji(after[0]))) {
      out[out.length - 1] = last + c
      continue
    }
    // お + 金,  ご + 飯
    if (prefixes.has(c) && arr[i + 1] && isKanji(arr[i + 1][0]) && !lexicon[c]) {
      out.push(c + arr[i + 1])
      i += 1
      continue
    }
    // 第 is the ordinal prefix - 第|三|回 stays apart, so the number can be read
    if (c.length === 1 && !lexicon[c] && c !== '第') {
      const type = getType(c)
      let run = c
      // race ahead, joining same-script characters.
      // a *known* single kanji may join an already-started run (日+本+人),
      // but never starts one - so 「読んでいる人」 keeps 人 on its own.
      const limit = runLimit(type)
      while (run.length < limit && arr[i + 1] !== undefined) {
        const next = arr[i + 1]
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
