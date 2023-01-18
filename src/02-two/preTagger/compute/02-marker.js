let markers = new Set([
  'は',// - topic marker
  'が',// - subject
  'を',// - direct object
])

const tagMarker = function (terms) {
  for (let i = 1; i < terms.length; i += 1) {
    let t = terms[i]
    // topic marker
    if (t.text === 'は') {
      terms[i].tags.add('Preposition')
      terms[i - 1].tags.add('Noun')
    }
    // subject marker
    if (t.text === 'が') {
      terms[i].tags.add('Preposition')
      terms[i - 1].tags.add('Noun')
    }
  }
}
export default tagMarker