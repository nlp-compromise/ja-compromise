import lexData from './_data.js'
import { unpack } from 'efrt'
import conjugate from './methods/verb.js'

let lexicon = {}
Object.keys(lexData).forEach(tag => {
  let wordsObj = unpack(lexData[tag])
  Object.keys(wordsObj).forEach(w => {
    lexicon[w] = tag

    // add conjugations for our verbs
    if (tag === 'Infinitive') {
      // add present tense
      let str = conjugate.toPresent(w)
      if (str && str !== w) {
        lexicon[str] = 'PresentTense'
      }
      // add past tense
      str = conjugate.toPast(w)
      if (str && str !== w) {
        lexicon[str] = 'PastTense'
      }
      // add imparative
      str = conjugate.toImperative(w)
      if (str && str !== w) {
        lexicon[str] = 'Imperative'
      }
      // add passive
      str = conjugate.toPassive(w)
      if (str && str !== w) {
        lexicon[str] = 'Passive'
      }
      // add Conditional
      str = conjugate.toConditional(w)
      if (str && str !== w) {
        lexicon[str] = 'ConditionalVerb'
      }
      // add Causative
      str = conjugate.toCausative(w)
      if (str && str !== w) {
        lexicon[str] = 'Causative'
      }
    }
  })
})
export default lexicon

// console.log(lexicon['圭吾'])