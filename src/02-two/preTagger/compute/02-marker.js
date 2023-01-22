
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
    // possessive marker
    if (t.text === 'の') {
      terms[i].tags.add('Preposition')
      terms[i - 1].tags.add('Possessive')
    }
  }
}
export default tagMarker