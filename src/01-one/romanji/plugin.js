import toRomanji from './convert.js'
import api from './api.js'

const romanji = function (view) {
  view.document.forEach(terms => {
    terms.forEach(term => {
      term.romanji = toRomanji(term.normal)
    })
  })
  return view
}



export default {
  compute: { romanji },
  api
}