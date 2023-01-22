const reason = 'adjSuffix'

const adjSuffixes = function (terms, setTag, world) {
  terms.forEach(term => {
    // i-adjectives always end in the Hiragana character: 「い」
    if (term.text.endsWith('い')) {
      setTag([term], 'Adjective', world, null, reason)
    }
  })
}
export default adjSuffixes