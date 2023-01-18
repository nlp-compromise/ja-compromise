import toTerms from './terms.js'
const before = /^[\s「『(〽【]+/
const after = /[\s、：・」』)…〜】\.?!]+$/

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

const tokenize = function (txt) {
  return toTerms(txt).map(str => {
    let { pre, post, inside } = getPunct(str)
    return {
      text: inside,
      normal: inside.toLowerCase(),
      pre,
      post,
      tags: new Set()
    }
  })
}
export default tokenize