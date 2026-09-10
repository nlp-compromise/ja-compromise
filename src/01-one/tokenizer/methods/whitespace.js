import toTerms from './terms.js'
const before = /^[\s「『（(〽【〔《〈]+/
const after = /[\s、。，．：；・」』）)…〜~】〕》〉\.?!？！]+$/

const getPunct = function (str) {
  let pre = ''
  let post = ''
  let inside = str
  // strip-off leading punctuation
  inside = inside.replace(before, m => {
    pre = m || ''
    return ''
  })
  // strip-off ending punctuation
  inside = inside.replace(after, m => {
    post = m || ''
    return ''
  })
  return { pre, inside, post }
}

const tokenize = function (txt, isChunk) {
  let terms = []
  toTerms(txt, isChunk).forEach(str => {
    let { pre, post, inside } = getPunct(str)
    if (inside === '') {
      // punctuation-only - fold it into the term before it
      if (terms.length > 0) {
        terms[terms.length - 1].post += pre + post
        return
      }
      return
    }
    terms.push({
      text: inside,
      normal: inside.toLowerCase(),
      pre,
      post,
      tags: new Set(),
    })
  })
  return terms
}
export default tokenize
