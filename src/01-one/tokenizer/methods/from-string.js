import toTerms from './whitespace.js'

/**
 * turn a string into compromise's document format - [[term, term], [term]]
 *
 * this replaces compromise's own `fromString`, so that everything which parses
 * text - nlp(), nlp.tokenize(), .append(), .insertAfter(), .replaceWith() -
 * gets japanese word-segmentation, and not just a split on whitespace.
 */
const fromString = function (input, world) {
  const { methods, model } = world
  const { splitSentences, splitTerms, splitWhitespace } = methods.one.tokenize
  const lexicon = model.one.lexicon
  // user-given words can be longer than our own lookahead
  const maxWord = model.one.maxWord || 0
  input ||= ''
  return splitSentences(input, world).map(txt => {
    // compromise splits on whitespace, and peels the punctuation off each chunk
    const chunks = splitTerms(txt, model).map(str => splitWhitespace(str, model))
    // if the sentence has spaces in it, they're real word-boundaries
    const spaced = chunks.length > 1
    let out = []
    chunks.forEach(chunk => {
      // japanese mostly doesn't use whitespace, so every chunk still needs splitting
      const terms = toTerms(chunk.text, spaced, lexicon, maxWord)
      if (terms.length === 0) {
        // nothing but punctuation
        out.push({
          text: chunk.text,
          normal: chunk.text.toLowerCase(),
          pre: chunk.pre || '',
          post: chunk.post || '',
          tags: new Set()
        })
        return
      }
      // keep the chunk's surrounding punctuation and whitespace
      terms[0].pre = (chunk.pre || '') + terms[0].pre
      terms[terms.length - 1].post += chunk.post || ''
      out = out.concat(terms)
    })
    return out
  })
}
export default fromString
