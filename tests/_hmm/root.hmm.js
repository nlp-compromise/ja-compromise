import test from 'tape'
import nlp from '../_lib.js'
const here = '[hmm/root] '

const rootOf = (str, word) => {
  const term = nlp(str).compute('root').docs[0].find(o => o.text === word)
  return term ? term.root : undefined
}

// the copula is deconjugated as if it were a godan verb - だった → だく
test('copula roots:', function (t) {
  t.equal(rootOf('部屋は静かだった', 'だった'), 'だ', here + 'だった → だ')
  t.equal(rootOf('彼は元気ではない', 'ではない'), 'だ', here + 'ではない → だ')
  t.equal(rootOf('学生でした', 'でした'), 'です', here + 'でした → です')
  t.end()
})

// a verb built on a katakana stem is split apart, so it has no root - ググ|った
test('katakana verbs:', function (t) {
  t.equal(nlp('ググった').compute('root').text('root'), 'ググる', here + 'ググった → ググる')
  t.equal(nlp('バズっている').compute('root').text('root'), 'バズる', here + 'バズっている → バズる')
  t.end()
})
