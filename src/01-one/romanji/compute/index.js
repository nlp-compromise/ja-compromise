import toRomanji from './toRomanji/index.js'
import toReading from './kanji-reading/index.js'

const romanji = function (view) {
  view.document.forEach(terms => {
    terms.forEach(term => {
      let word = term.normal
      if (term.tags.has('Kanji')) {
        word = toReading(word)
      }
      term.romanji = toRomanji(word)
    })
  })
  return view
}

const readings = function (view) {
  view.document.forEach(terms => {
    terms.forEach(term => {
      if (term.tags.has('Kanji')) {
        term.reading = toReading(term.normal)
      }
    })
  })
  return view
}
export default { romanji, readings }