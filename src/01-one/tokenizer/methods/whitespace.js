import toTerms from './terms.js'
import { isPunctuation, isLowSurrogate, charAt, normalize } from './lib.js'

// a few words end in a symbol
const symbolWord = /^[a-z](?:\+\+|#)$/i

// peel the punctuation off both ends of a word
const getPunct = function (str) {
  if (symbolWord.test(str)) {
    return { pre: 0, post: 0 }
  }
  let pre = 0
  while (pre < str.length) {
    const c = charAt(str, pre)
    if (!isPunctuation(c)) {
      break
    }
    pre += c.length
  }
  let end = str.length
  while (end > pre) {
    // step back a whole character
    let c = str[end - 1]
    if (isLowSurrogate(c) && end > 1) {
      c = str.slice(end - 2, end)
    }
    // C++ keeps its symbol
    if (!isPunctuation(c) || symbolWord.test(str.slice(pre, end))) {
      break
    }
    end -= c.length
  }
  return { pre, post: str.length - end }
}

/**
 * split some text into terms - { pre, text, post, normal }
 * the segmenting is done on a plain-width copy of the text, and then every
 * piece is cut from the original - so `text` is always what was written
 */
const tokenize = function (txt, isChunk, lexicon, maxWord) {
  const { norm, map } = normalize(txt)
  const original = (a, b) => (map === null ? txt.slice(a, b) : txt.slice(map[a], map[b]))
  const terms = []
  let at = 0
  toTerms(norm, isChunk, lexicon, maxWord).forEach(str => {
    const start = at
    const end = at + str.length
    at = end
    const { pre, post } = getPunct(str)
    if (pre === str.length) {
      // punctuation-only - fold it into the term before it
      if (terms.length > 0) {
        terms[terms.length - 1].post += original(start, end)
      }
      return
    }
    terms.push({
      text: original(start + pre, end - post),
      normal: norm.slice(start + pre, end - post).toLowerCase(),
      pre: original(start, start + pre),
      post: original(end - post, end),
      tags: new Set(),
    })
  })
  return terms
}
export default tokenize
