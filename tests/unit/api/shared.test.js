import test from 'tape'
import nlp from '../../_lib.js'
const here = '[ja-shared] '

// plugins that come from compromise/shared
const txt = '田中さんは東京に住んでいます。彼は本を読みます。'

test('shared lazy:', function (t) {
  const want = nlp(txt).match('東京').out('array')
  t.equal(want.length, 1, here + 'has a match')
  t.deepEqual(nlp.lazy(txt, '東京').out('array'), want, here + 'same result as a full parse')
  t.equal(nlp.lazy(txt, 'zzzz').found, false, here + 'no match')
  t.end()
})
