import toTerms from './whitespace.js'

const whitespace = /(\s+)/

/**
 * turn a string into compromise's document format - [[term, term], [term]]
 *
 * this replaces compromise's own `fromString`, so that everything which parses
 * text - nlp(), nlp.tokenize(), .append(), .insertAfter(), .replaceWith() -
 * gets japanese word-segmentation, and not just a split on whitespace.
 *
 * only compromise's sentence-splitter is used.  its word-splitter has
 * english rules for hyphens, slashes and apostrophes, and we have our own.
 */
const fromString = function (input, world) {
  const { methods, model } = world
  const { splitSentences } = methods.one.tokenize
  const lexicon = model.one.lexicon
  // user-given words can be longer than our own lookahead
  const maxWord = model.one.maxWord || 0
  input ||= ''
  return splitSentences(input, world).map(txt => {
    // [word, space, word, space, word]
    const parts = txt.split(whitespace)
    // if the sentence has spaces in it, they're real word-boundaries
    const spaced = parts.filter((str, i) => i % 2 === 0 && str !== '').length > 1
    const out = []
    // punctuation, or whitespace, with no word before it yet
    let carry = ''
    parts.forEach((str, i) => {
      if (str === '') {
        return
      }
      const last = out[out.length - 1]
      if (i % 2 === 1) {
        // whitespace
        if (last) {
          last.post += str
        } else {
          carry += str
        }
        return
      }
      // japanese mostly doesn't use whitespace, so every chunk still needs splitting
      const terms = toTerms(str, spaced, lexicon, maxWord)
      if (terms.length === 0) {
        // nothing but punctuation - ' - '
        if (last) {
          last.post += str
        } else {
          carry += str
        }
        return
      }
      terms[0].pre = carry + terms[0].pre
      carry = ''
      terms.forEach(term => out.push(term))
    })
    // a sentence with no words in it at all
    if (out.length === 0 && carry.trim() !== '') {
      const [, pre, text, post] = carry.match(/^(\s*)([\s\S]*?)(\s*)$/)
      out.push({ text, normal: text, pre, post, tags: new Set() })
    }
    return out
  })
}
export default fromString
