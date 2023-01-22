const reason = 'marker'

const tagMarker = function (terms, setTag, world) {
  for (let i = 1; i < terms.length; i += 1) {
    let t = terms[i]
    // topic marker
    if (t.text === 'は') {
      setTag([t], 'Preposition', world, null, reason)
      setTag([terms[i - 1]], 'Topic', world, null, reason)
    }
    // subject marker
    if (t.text === 'が') {
      setTag([t], 'Preposition', world, null, reason)
      setTag([terms[i - 1]], 'Noun', world, null, reason)
    }
    // object marker
    if (t.text === 'を') {
      setTag([t], 'Preposition', world, null, reason)
      setTag([terms[i - 1]], 'Object', world, null, reason)
    }
    // 'at' marker
    if (t.text === 'で') {
      setTag([t], 'Preposition', world, null, reason)
      setTag([terms[i - 1]], 'Noun', world, null, reason)
    }
    // 'from' marker
    if (t.text === 'から') {
      setTag([t], 'Preposition', world, null, reason)
      setTag([terms[i - 1]], 'Noun', world, null, reason)
    }
    // possessive marker
    if (t.text === 'の') {
      setTag([t], 'Preposition', world, null, reason)
      setTag([terms[i - 1]], 'Possessive', world, null, reason)
    }
  }
}
export default tagMarker