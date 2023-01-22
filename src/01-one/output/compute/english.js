import dict from './dict.js'

const addEnglish = function (view) {
  view.docs.forEach(terms => {
    terms.forEach(term => {
      if (dict[term.normal]) {
        term.english = dict[term.normal]
      }
    })
  })
  return view
}
export default addEnglish