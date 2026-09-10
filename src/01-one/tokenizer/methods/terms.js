import buildIndex from './trie/build.js'
import lexicon from '../../lexicon/lexicon.js'
import splitUp from './trie/split-up.js'
import joinUp from './join-up.js'
import attachOkurigana from './okurigana.js'
import joinNumbers from './join-numbers.js'
import { isPunctuation } from './lib.js'

const { words, maxLen } = buildIndex(Object.keys(lexicon))
// a very long 'word' is nearly always two words - cap the lookahead
const LOOKAHEAD = Math.min(maxLen, 12)

const allHiragana = /^[぀-ゟ]+$/

// a case-particle at either end of a kana run isn't part of the word
const edgeParticle = new Set(['は', 'が', 'を', 'に', 'へ', 'と', 'も', 'の', 'で', 'や', 'か'])
// beyond this, a string of loose kana really is several words
const MAX_KANA_RUN = 7

const isSingleKana = (str) => str.length === 1 && allHiragana.test(str)

// 「『（(【〔《〈 at the end of a punctuation run
const trailingOpen = /[「『（(【〔《〈]+$/

/**
 * ひらがな comes back from the matcher as ひ|ら|が|な, because が and な happen
 * to be particles.  a stretch of single kana that matched nothing is one
 * unknown word - a name, or a word the lexicon is missing.
 */
const rejoinKana = function (arr) {
  let out = []
  for (let i = 0; i < arr.length; i += 1) {
    if (!isSingleKana(arr[i])) {
      out.push(arr[i])
      continue
    }
    // how far does this stretch of loose kana go?
    let end = i
    while (end < arr.length && isSingleKana(arr[end])) {
      end += 1
    }
    let run = arr.slice(i, end)
    i = end - 1
    // を is only ever a particle, so it's a hard word-boundary
    let segments = [[]]
    run.forEach(c => {
      if (c === 'を') {
        segments.push(['を'], [])
      } else {
        segments[segments.length - 1].push(c)
      }
    })
    segments.forEach(seg => {
      if (seg.length === 0) {
        return
      }
      if (seg.length === 1 || seg[0] === 'を' || seg.length > MAX_KANA_RUN) {
        out = out.concat(seg)
        return
      }
      // 「での」 is two particles in a row, not a word
      if (seg.every(c => edgeParticle.has(c))) {
        out = out.concat(seg)
        return
      }
      // 「ひらがなと」 is ひらがな + と, 「経験につながる」 is 経験 | に | つながる.
      // a particle can't begin a clause, so only trim the head when something
      // real came before it
      let hasLeft = out.length > 0 && !edgeParticle.has(out[out.length - 1])
      let head = ''
      let tail = ''
      if (seg.length > 2 && hasLeft && edgeParticle.has(seg[0])) {
        head = seg.shift()
      }
      if (seg.length > 2 && edgeParticle.has(seg[seg.length - 1])) {
        tail = seg.pop()
      }
      if (head) {
        out.push(head)
      }
      out.push(seg.join(''))
      if (tail) {
        out.push(tail)
      }
    })
  }
  return out
}

const tokenize = function (txt, isChunk) {
  // when the writer used a space, that chunk is one word - beginner japanese
  // is often written 「たろう は のりこ を…」, and 「のりこ」 must not be
  // greedily read as the particle の plus りこ
  if (isChunk === true && txt.length <= 6 && allHiragana.test(txt) && !lexicon[txt]) {
    return [txt]
  }
  // split by known-word segments
  let arr = splitUp(txt, words, LOOKAHEAD)
  // a kana run that fell apart into loose characters is one unknown word
  arr = rejoinKana(arr)
  // join-up neighbouring unknown characters
  arr = joinUp(arr)
  // 二|十|三 is one number
  arr = joinNumbers(arr)
  // give an unknown kanji stem its inflectional tail - 含 + まれている
  arr = attachOkurigana(arr)
  // punctuation is never its own term - it hangs off the word before it,
  // except an opening bracket, which hangs off the word after it - 彼は「はい」と
  let out = []
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
export { words }
