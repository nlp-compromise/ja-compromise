import test from 'tape'
import nlp from '../../_lib.js'
const here = '[fractions] '

const terms = (str) => nlp(str).json()[0].terms.map(t => t.text)

test('a fraction written with a slash:', function (t) {
  const arr = [
    // [text, terms, numbers]
    ['1/2', ['1/2'], [0.5]],
    ['１／２', ['１／２'], [0.5]],
    ['3/4カップの水', ['3/4', 'カップ', 'の', '水'], [0.75]],
    ['-1/2', ['1/2'], [-0.5]],
    ['マイナス1/4', ['マイナス', '1/4'], [-0.25]],
    ['½', ['½'], [0.5]],
    ['2½', ['2', '½'], [2.5]],
  ]
  arr.forEach(([str, want, nums]) => {
    const doc = nlp(str)
    t.deepEqual(terms(str), want, here + str)
    t.deepEqual(doc.numbers().get(), nums, here + 'value of ' + str)
    t.ok(doc.has('#Fraction'), here + '#Fraction ' + str)
    t.equal(doc.text(), str, here + 'roundtrip ' + str)
  })
  t.end()
})

test('…and things that only look like one:', function (t) {
  // a date
  t.equal(nlp('1/5(金)に会う').has('#Fraction'), false, here + '1/5(金)')
  t.equal(nlp('1/5日').has('#Fraction'), false, here + '1/5日')
  t.deepEqual(terms('2024/1/5に'), ['2024/1/5', 'に'], here + 'three parts is a date')
  t.equal(nlp('2024/1/5').has('#Fraction'), false, here + '2024/1/5')
  // nothing can be divided by zero
  t.equal(nlp('10/0').has('#Fraction'), false, here + '10/0')
  // a fraction has no neighbour to step to
  const doc = nlp('1/2です')
  doc.numbers().add(1)
  t.equal(doc.text(), '1/2です', here + 'is not re-written')
  t.end()
})
