

const nounSuffixes = function (terms) {
  terms.forEach(term => {
    // 'たち' is the plural suffix
    if (term.text.endsWith('たち')) {
      term.tags.add('Plural')
    }
  })
}
export default nounSuffixes