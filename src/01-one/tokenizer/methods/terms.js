import ownLexicon from '../../lexicon/lexicon.js'
import splitUp from './trie/split-up.js'
import joinUp from './join-up.js'
import attachOkurigana from './okurigana.js'
import joinNumbers from './join-numbers.js'
import { isPunctuation } from './lib.js'

const maxLen = Object.keys(ownLexicon).reduce((max, w) => Math.max(max, w.length), 1)
// a very long 'word' is nearly always two words - cap the lookahead
const LOOKAHEAD = Math.min(maxLen, 12)

const allHiragana = /^[぀-ゟ]+$/

// 「『（(【〔《〈 at the end of a punctuation run
const trailingOpen = /[「『（(【〔《〈]+$/

// `lexicon` is the live one - ours, plus any words the user has added
const tokenize = function (txt, isChunk, lexicon = ownLexicon, maxWord = 0) {
  // when the writer used a space, that chunk is one word - beginner japanese
  // is often written 「たろう は のりこ を…」, and 「のりこ」 must not be
  // greedily read as the particle の plus りこ
  if (isChunk === true && txt.length <= 6 && allHiragana.test(txt) && !lexicon[txt]) {
    return [txt]
  }
  // find the cheapest way to cut it into words
  let arr = splitUp(txt, lexicon, Math.max(LOOKAHEAD, maxWord))
  // join-up neighbouring unknown characters
  arr = joinUp(arr, lexicon)
  // 二|十|三 is one number
  arr = joinNumbers(arr)
  // give an unknown kanji stem its inflectional tail - 含 + まれている
  arr = attachOkurigana(arr, lexicon)
  // punctuation is never its own term - it hangs off the word before it,
  // except an opening bracket, which hangs off the word after it - 彼は「はい」と
  const out = []
  let carry = ''
  arr.forEach(str => {
    if (str === '') {
      return
    }
    if (str.split('').every(isPunctuation)) {
      let open = ''
      str = str.replace(trailingOpen, m => {
        open = m
        return ''
      })
      if (str !== '' && out.length > 0) {
        out[out.length - 1] += str
      } else {
        carry += str
      }
      carry += open
      return
    }
    out.push(carry + str)
    carry = ''
  })
  // punctuation with no word after it
  if (carry !== '') {
    if (out.length > 0) {
      out[out.length - 1] += carry
    } else {
      out.push(carry)
    }
  }
  return out
}
export default tokenize
