const adjSuffixes = function (terms) {
  terms.forEach(term => {
    // i-adjectives always end in the Hiragana character: 「い」
    if (term.text.endsWith('い')) {
      term.tags.add('Adjective')
    }
  })
}
export default adjSuffixes