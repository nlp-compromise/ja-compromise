import { roots } from '../../lexicon/lexicon.js'
import { deconjugate } from '../../conjugate/index.js'
import lexicon from '../../lexicon/lexicon.js'

const isKnown = (w) => lexicon.hasOwnProperty(w)

// the dictionary-form of each word - 食べました → 食べる, 高かった → 高い
const addRoot = function (view) {
  view.docs.forEach(terms => {
    terms.forEach(term => {
      if (term.root) {
        return
      }
      if (roots[term.text] !== undefined) {
        term.root = roots[term.text]
        return
      }
      // an unknown verb can still be walked back to its dictionary-form
      if (term.tags.has('Verb')) {
        let found = deconjugate(term.text, isKnown)
        if (found) {
          term.root = found.root
          return
        }
      }
      term.root = term.text
    })
  })
  return view
}
export default addRoot
