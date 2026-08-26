import test from 'tape'
import nlp from './_lib.js'
const here = '[numbers] '

const tagsOf = (str, word) => {
  let term = nlp(str).json()[0].terms.find(t => t.text === word)
  return term ? term.tags : []
}
const terms = (str) => nlp(str).json()[0].terms.map(t => t.text)

test('parse japanese numerals:', function (t) {
  let arr = [
    ['一', 1], ['十', 10], ['十一', 11], ['二十三', 23],
    ['百', 100], ['百五', 105], ['三百二十一', 321],
    ['千', 1000], ['千二百', 1200], ['二千二十四', 2024],
    ['一万', 10000], ['万', 10000], ['三万五千', 35000],
    // a bare 万 is 10,000, but 五十万 is 50×10,000 - not 51×10,000
    ['五十万', 500000], ['一億', 100000000], ['三億五千万', 350000000],
    // arabic, half-width and full-width
    ['1995', 1995], ['３', 3], ['１２３', 123],
    ['〇', 0],
  ]
  arr.forEach(([str, want]) => {
    t.equal(nlp.toNumber(str), want, here + str + ' → ' + want)
  })
  t.equal(nlp.toNumber('こんにちは'), null, here + 'not a numeral')
  t.equal(nlp.toNumber(''), null, here + 'empty')
  t.end()
})

test('a numeral run is one token:', function (t) {
  t.deepEqual(terms('二十三人'), ['二十三', '人'], here + '二十三人')
  t.deepEqual(terms('三百二十一円'), ['三百二十一', '円'], here + '三百二十一円')
  t.deepEqual(terms('三ヶ月かかる'), ['三', 'ヶ月', 'かかる'], here + 'ヶ月 is one counter')
  t.deepEqual(terms('一つください'), ['一つ', 'ください'], here + '一つ')
  t.deepEqual(terms('百点満点'), ['百', '点', '満点'], here + '百点満点')
  // 八百屋 is a greengrocer, not 800 of anything
  t.deepEqual(terms('八百屋で買った'), ['八百屋', 'で', '買った'], here + '八百屋')
  t.end()
})

test('counters:', function (t) {
  // 本 is a book far more often than it's a counter - only a number makes it one
  t.ok(tagsOf('本を五冊買った', '冊').includes('Counter'), here + '五冊')
  t.ok(tagsOf('本を五冊買った', '本').includes('Noun'), here + '本 stays a noun')
  t.ok(!tagsOf('本を五冊買った', '本').includes('Counter'), here + '本 is not a counter here')

  t.ok(tagsOf('三人が来た', '人').includes('Counter'), here + '三人')
  t.ok(tagsOf('犬が三匹いる', '匹').includes('Counter'), here + '三匹')
  t.ok(tagsOf('2時間待った', '時間').includes('DurationCounter'), here + '2時間')
  t.ok(tagsOf('千円です', '円').includes('Currency'), here + '千円')
  t.ok(tagsOf('三パーセント', 'パーセント').includes('Percent'), here + '三パーセント')
  t.ok(tagsOf('二番目', '番目').includes('Ordinal'), here + '二番目')
  // 何 asks 'how many', and takes a counter just like a number
  t.ok(tagsOf('何冊読んだ', '冊').includes('Counter'), here + '何冊')
  t.end()
})

test('the parsed value is on the term:', function (t) {
  t.deepEqual(nlp('本を五冊買った').numbers().toNumber(), [5], here + '五冊 → 5')
  t.deepEqual(nlp('二十三人来た').numbers().toNumber(), [23], here + '二十三人 → 23')
  t.deepEqual(nlp('五冊と2時間').numbers().toNumber(), [5, 2], here + 'two numbers')
  t.end()
})

test('.numbers() and .counters():', function (t) {
  let doc = nlp('本を五冊買って、2時間読んだ。')
  t.deepEqual(doc.numbers().out('array'), ['五冊', '2時間'], here + '.numbers()')
  t.deepEqual(doc.counters().out('array'), ['冊', '時間'], here + '.counters()')
  t.end()
})
