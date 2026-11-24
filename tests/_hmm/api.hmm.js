import test from 'tape'
import nlp from '../_lib.js'
const here = '[hmm/api] '

// nlp.tokenize() skips the japanese word-splitter - the sentence is one term
test('nlp.tokenize() splits words:', function (t) {
  const terms = nlp.tokenize('猫が魚を食べた').json()[0].terms.map(o => o.text)
  t.deepEqual(terms, ['猫', 'が', '魚', 'を', '食べた'], here + 'tokenize')
  t.end()
})

// the lexicon given to nlp(text, lexicon) isn't seen by the word-splitter
test('a custom lexicon:', function (t) {
  const doc = nlp('東京タワーに行った', { '東京タワー': 'Place' })
  t.deepEqual(doc.json()[0].terms.map(o => o.text), ['東京タワー', 'に', '行った'], here + 'one term')
  t.equal(doc.has('#Place'), true, here + 'tagged #Place')
  t.end()
})

// a match keeps the 。 that followed it - .text() on a selection isn't trimmed
test('selection text has no trailing punctuation:', function (t) {
  t.equal(nlp('猫が魚を食べた。').verbs().text(), '食べた', here + '.verbs().text()')
  t.deepEqual(nlp('猫が魚を食べた。犬は走る。').verbs().out('array'), ['食べた', '走る'], here + `.out('array')`)
  t.end()
})

// .romanji() leaves a space after the last word
test('.romanji() is trimmed:', function (t) {
  t.equal(nlp('猫が魚を食べた').romanji(), 'neko ga uo o tabeta', here + 'no trailing space')
  t.end()
})
