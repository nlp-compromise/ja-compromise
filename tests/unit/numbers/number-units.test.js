import test from 'tape'
import nlp from '../../_lib.js'
const here = '[number-units] '

const terms = (str) => nlp(str).json()[0].terms.map(t => t.text)

test('decimals and commas beside 万 and 億:', function (t) {
  const arr = [
    ['1.5万', 15000],
    ['１．５万', 15000],
    ['一・五万', 15000],
    ['1.1万', 11000],
    ['3.5億', 350000000],
    ['0.5兆', 500000000000],
    ['2,000万', 20000000],
    ['1,234.5万', 12345000],
    ['1億2,000万', 120000000],
    ['3億5,000万', 350000000],
    // unchanged
    ['1.5', 1.5],
    ['2,000', 2000],
    ['5千万', 50000000],
  ]
  arr.forEach(([str, want]) => {
    t.equal(nlp.toNumber(str), want, here + 'toNumber ' + str)
    t.deepEqual(nlp(str).numbers().get(), [want], here + str)
  })
  t.end()
})

test('they are one term:', function (t) {
  t.deepEqual(terms('1.5万円'), ['1.5万', '円'], here + '1.5万円')
  t.deepEqual(terms('1億2,000万人'), ['1億2,000万', '人'], here + '1億2,000万人')
  t.deepEqual(terms('3億5,000万円払った'), ['3億5,000万', '円', '払った'], here + 'in a sentence')
  // a counter is not a multiplier
  t.deepEqual(terms('1.5人'), ['1.5', '人'], here + '1.5人')
  t.deepEqual(terms('1.5倍'), ['1.5', '倍'], here + '1.5倍')
  t.deepEqual(nlp('1.5万円').money().out('array'), ['1.5万円'], here + 'money')
  t.end()
})
