const reason = 'honorific'

// 田中さん - an honorific proves the word before it is a person
const tagPeople = function (terms, setTag, world) {
  for (let i = 0; i < terms.length; i += 1) {
    let t = terms[i]
    if (!t.tags.has('Honorific')) {
      continue
    }
    let prev = terms[i - 1]
    if (prev && !prev.tags.has('Verb') && !prev.tags.has('Particle')) {
      setTag([prev], 'Person', world, null, reason)
    }
  }
  // 田中さん may have tokenized as one word - the suffix is still a signal
  terms.forEach(term => {
    if (term.text.length > 2 && /(さん|様|さま|ちゃん|くん|氏)$/.test(term.text) && term.tags.size <= 1) {
      setTag([term], 'Person', world, null, reason)
    }
  })
}
export default tagPeople
