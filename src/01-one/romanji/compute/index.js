import toRomanji from './toRomanji/index.js'
import toReading from './kanji-reading/index.js'
import { roots } from '../../lexicon/lexicon.js'

// は, へ and を are pronounced wa, e and o when they're particles
const particleSound = { 'は': 'wa', 'へ': 'e', 'を': 'o' }

const romanji = function (view) {
  view.document.forEach(terms => {
    terms.forEach(term => {
      if (particleSound[term.text] && term.tags.has('Particle')) {
        term.romanji = particleSound[term.text]
        return
      }
      let word = term.normal
      // any kanji in the word needs sounding-out first
      if (/[一-龯]/.test(word)) {
        word = toReading(word, null, term.root || roots[word])
      }
      term.romanji = toRomanji(word)
    })
  })
  return view
}

const readings = function (view) {
  view.document.forEach(terms => {
    terms.forEach(term => {
      if (/[一-龯]/.test(term.text)) {
        term.reading = toReading(term.normal, null, term.root || roots[term.normal])
      }
    })
  })
  return view
}
export default { romanji, readings }