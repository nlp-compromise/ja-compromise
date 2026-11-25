// where a negative number keeps its sign.
// punctuation is never part of a term, so '-5' is a 5 with a '-' in front of it

// マイナス5, and 氷点下5度 - five degrees below freezing
const minusWords = new Set(['マイナス', '氷点下', '零下'])
// right up against the number - not the dash of a list
const minusSign = /[-−－]$/

/**
 * 'pre' for -5, 'post' for 気温は-5度, 'word' for マイナス5 - or null.
 * the number after another number is not negative - 3-5人 is a range
 */
const signOf = function (terms, i) {
  const prev = terms[i - 1]
  if (prev && minusWords.has(prev.text)) {
    return 'word'
  }
  if (minusSign.test(terms[i].pre)) {
    return 'pre'
  }
  if (prev && minusSign.test(prev.post) && typeof prev.number !== 'number') {
    return 'post'
  }
  return null
}

export { signOf, minusSign }
