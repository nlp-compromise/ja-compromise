import test from 'tape'
import nlp from '../../_lib.js'
const here = '[number-signs] '

const add = (str, n) => {
  const doc = nlp(str)
  doc.numbers().add(n)
  return doc.text()
}

test('negative numbers:', function (t) {
  const arr = [
    ['-5度', [-5]],
    ['−5', [-5]],
    ['(-5)', [-5]],
    ['気温は-5度です', [-5]],
    ['マイナス5', [-5]],
    ['氷点下5度', [-5]],
    // a dash between two numbers is not a sign
    ['03-1234-5678', []],
    // ... and neither is the dash of a list
    ['- 5個', [5]],
  ]
  arr.forEach(([str, want]) => {
    t.deepEqual(nlp(str).numbers().get(), want, here + str)
  })
  t.equal(nlp('3-5人').numbers().get()[0], 3, here + 'a range is not negative')
  t.end()
})

test('negative numbers are written once:', function (t) {
  t.equal(add('-5度', 1), '-4度', here + 'sign in front')
  t.equal(add('-5度', 9), '4度', here + 'sign is dropped')
  t.equal(add('気温は-5度です', 1), '気温は-4度です', here + 'sign after a word')
  t.equal(add('マイナス5', 1), 'マイナス4', here + 'the word is kept')
  t.equal(add('マイナス5', 9), '4', here + 'the word is dropped')
  t.equal(add('5度', -9), '-4度', here + 'a new sign')
  const doc = nlp('-5度')
  doc.numbers().toText()
  t.equal(doc.text(), 'マイナス五度', here + 'to kanji')
  t.end()
})

test('money with a symbol:', function (t) {
  const arr = [
    ['¥1,000', ['¥1,000']],
    ['￥1000', ['￥1000']],
    ['$5.30', ['$5.30']],
    ['1,000円', ['1,000円']],
    ['100ドル', ['100ドル']],
    ['5人', []],
  ]
  arr.forEach(([str, want]) => {
    t.deepEqual(nlp(str).money().out('array'), want, here + str)
  })
  t.ok(nlp('¥1,000').has('#Money'), here + 'Money tag')
  t.equal(add('¥1,000', 1), '¥1,001', here + 'keeps its commas')
  t.equal(add('１，０００円', 1), '１，００１円', here + 'keeps its width')
  t.equal(add('1000円', 1), '1001円', here + 'adds no commas')
  t.end()
})

test('fractions:', function (t) {
  t.deepEqual(nlp('2分の1').numbers().get(), [0.5], here + '2分の1')
  t.deepEqual(nlp('4分の3です').numbers().get(), [0.75], here + '4分の3')
  t.ok(nlp('2分の1').has('#Fraction'), here + 'Fraction tag')
  // 分 is still minutes
  t.deepEqual(nlp('5分の間').numbers().get(), [5], here + '5分の間')
  t.deepEqual(nlp('5分').numbers().get(), [5], here + '5分')
  t.equal(add('2分の1', 1), '2分の1', here + 'a fraction is not re-written')
  t.end()
})
