import lexicon, { roots } from '../../lexicon/lexicon.js'
import { deconjugate } from '../../conjugate/index.js'

const isKnown = (w) => lexicon.hasOwnProperty(w)

// the dictionary-form of each word - 食べました → 食べる, 高かった → 高い
const addRoot = function (view) {
  view.docs.forEach(terms => {
    terms.forEach(term => {
      if (term.root) {
        return
      }
      // a dictionary-form is its own root - 入れる is a verb, and not only 'can enter'
      if (term.tags.has('Infinitive')) {
        term.root = term.text
        return
      }
      if (roots[term.text] !== undefined) {
        term.root = roots[term.text]
        return
      }
      // a word only the tagger knows is the copula - 静か [で] - is still だ
      if (term.tags.has('Copula')) {
        term.root = 'だ'
        return
      }
      // an unknown verb can still be walked back to its dictionary-form
      if (term.tags.has('Verb')) {
        const found = deconjugate(term.text, isKnown)
        if (found) {
          // 食べさせられたくなかった → 食べさせられる → 食べる
          term.root = roots[found.root] || found.root
          return
        }
      }
      term.root = term.text
    })
  })
  return view
}
export default addRoot
