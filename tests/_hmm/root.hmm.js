import test from 'tape'
import nlp from '../_lib.js'
const here = '[hmm/root] '

// a verb built on a katakana stem is split apart, so it has no root - ググ|った
test('katakana verbs:', function (t) {
  t.equal(nlp('ググった').compute('root').text('root'), 'ググる', here + 'ググった → ググる')
  t.equal(nlp('バズっている').compute('root').text('root'), 'バズる', here + 'バズっている → バズる')
  t.end()
})
