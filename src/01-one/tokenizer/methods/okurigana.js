import ownLexicon from '../../lexicon/lexicon.js'
import deconjugate from '../../conjugate/deconjugate.js'
import { isKanji, isHiragana } from './lib.js'

// a particle can't be the first kana of a verb's okurigana - 「木で作った」
// is 木 + で + 作った, not 木で + 作った
const particleStart = new Set(['は', 'が', 'を', 'に', 'へ', 'と', 'も', 'の', 'か', 'ね', 'よ', 'や', 'で', 'ば'])
const MAX_TAIL = 6
// …nor can the copula, or まで - 嘘じゃない and 大阪まで are not verbs
const notOkurigana = /^(?:じゃ|だ|です|まで)/

/** could this kana be the start of a verb's ending? */
const canBeOkurigana = (str) => str !== '' && !particleStart.has(str[0]) && !notOkurigana.test(str)

const isHiraganaWord = (str) => str.split('').every(isHiragana)

/**
 * 含まれている is a verb even though 含む isn't in the lexicon.
 * glue an unknown kanji stem onto the inflectional tail that follows it.
 */
const attachOkurigana = function (arr, lexicon = ownLexicon) {
  const out = []
  for (let i = 0; i < arr.length; i += 1) {
    const head = arr[i]
    // only an unknown kanji can pick up okurigana.  a verb's stem is one
    // kanji - a longer chunk is a compound noun, and 大学生じゃない or
    // 大阪まで are not verbs
    if (lexicon[head] || head.length !== 1 || !isKanji(head)) {
      out.push(head)
      continue
    }
    // collect the hiragana tokens that follow it
    let tail = ''
    let end = i
    for (let o = i + 1; o < arr.length; o += 1) {
      if (!isHiraganaWord(arr[o]) || tail.length + arr[o].length > MAX_TAIL) {
        break
      }
      tail += arr[o]
      end = o
    }
    if (!canBeOkurigana(tail)) {
      out.push(head)
      continue
    }
    // try the longest tail first, shrinking a token at a time
    let joined = head
    let taken = i
    for (let o = end; o > i; o -= 1) {
      const candidate = head + arr.slice(i + 1, o + 1).join('')
      if (candidate.length - head.length < 2) {
        continue
      }
      if (lexicon[candidate] || deconjugate(candidate)) {
        joined = candidate
        taken = o
        break
      }
    }
    out.push(joined)
    i = taken
  }
  return out
}
export default attachOkurigana
export { canBeOkurigana }
