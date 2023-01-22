
const reason = 'nounSuffix'

const nounSuffixes = function (terms, setTag, world) {
  terms.forEach(term => {
    // 'たち' is the plural suffix
    if (term.text.endsWith('たち')) {
      setTag([term], 'Plural', world, null, reason)
    }
  })
}
export default nounSuffixes