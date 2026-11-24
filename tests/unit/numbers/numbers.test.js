import test from 'tape'
import nlp from '../../_lib.js'
const here = '[numbers] '

const tagsOf = (str, word) => {
  const term = nlp(str).json()[0].terms.find(t => t.text === word)
  return term ? term.tags : []
}
const terms = (str) => nlp(str).json()[0].terms.map(t => t.text)

test('parse japanese numerals:', function (t) {
  const arr = [
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

test('.get() reads the value:', function (t) {
  t.deepEqual(nlp('本を五冊買った').numbers().get(), [5], here + '五冊 → 5')
  t.deepEqual(nlp('二十三人来た').numbers().get(), [23], here + '二十三人 → 23')
  t.deepEqual(nlp('五冊と2時間').numbers().get(), [5, 2], here + 'two numbers')
  // .values() is the english-compromise alias
  t.deepEqual(nlp('五冊').values().get(), [5], here + '.values() alias')
  t.end()
})

test('.numbers(), .units() and .counters():', function (t) {
  const doc = nlp('本を五冊買って、2時間読んだ。')
  // like english, .numbers() is the number itself - the counter is .units()
  t.deepEqual(doc.numbers().out('array'), ['五', '2'], here + '.numbers()')
  t.deepEqual(doc.numbers().units().out('array'), ['冊', '時間'], here + '.units()')
  t.deepEqual(doc.counters().out('array'), ['冊', '時間'], here + '.counters()')
  t.deepEqual(nlp('千円と5ドル').money().out('array'), ['千円', '5ドル'], here + '.money()')
  t.deepEqual(nlp('三パーセント').percentages().out('array'), ['三パーセント'], here + '.percentages()')
  t.end()
})

test('.toNumber() and .toText() rewrite the text:', function (t) {
  // english compromise: .get() reads, .toNumber()/.toText() rewrite
  const arr = [
    ['本を二十三冊買った。', '本を23冊買った。'],
    ['五冊', '5冊'],
    ['千九百九十五年', '1995年'],
    ['三百二十一円', '321円'],
  ]
  arr.forEach(([from, want]) => {
    const doc = nlp(from)
    doc.numbers().toNumber()
    t.equal(doc.text(), want, here + from + ' → ' + want)
  })
  // ..and back the other way
  const back = [
    ['本を23冊買った。', '本を二十三冊買った。'],
    ['1995年', '千九百九十五年'],
    ['500000円', '五十万円'],
  ]
  back.forEach(([from, want]) => {
    const doc = nlp(from)
    doc.numbers().toText()
    t.equal(doc.text(), want, here + from + ' → ' + want)
  })
  t.end()
})

test('write a number in kanji:', function (t) {
  const arr = [
    [0, '〇'], [10, '十'], [23, '二十三'], [105, '百五'], [321, '三百二十一'],
    [1000, '千'], [1995, '千九百九十五'], [2024, '二千二十四'],
    // 10,000 keeps its 一, but 10 doesn't - it's 一万 and 十
    [10000, '一万'], [35000, '三万五千'], [500000, '五十万'],
    [100000000, '一億'], [123456789, '一億二千三百四十五万六千七百八十九'],
  ]
  arr.forEach(([num, want]) => {
    t.equal(nlp.toKanji(num), want, here + num + ' → ' + want)
  })
  t.end()
})

test('kanji and numerals round-trip:', function (t) {
  const fails = []
  for (let n = 0; n <= 20000; n += 1) {
    if (nlp.toNumber(nlp.toKanji(n)) !== n) {
      fails.push(n)
    }
  }
  ;[99999, 1234567, 98765432, 1e8, 5e11].forEach(n => {
    if (nlp.toNumber(nlp.toKanji(n)) !== n) {
      fails.push(n)
    }
  })
  t.deepEqual(fails.slice(0, 10), [], here + 'every number 0-20,000 survives the round-trip')
  t.end()
})

test('arithmetic keeps the script it found:', function (t) {
  const doc = nlp('本を五冊買った')
  doc.numbers().add(10)
  t.equal(doc.text(), '本を十五冊買った', here + 'kanji stays kanji')

  const d2 = nlp('23人')
  d2.numbers().subtract(2)
  t.equal(d2.text(), '21人', here + 'digits stay digits')

  const d3 = nlp('２３冊')
  d3.numbers().increment()
  t.equal(d3.text(), '２４冊', here + 'full-width stays full-width')

  const d4 = nlp('千二百三十四円')
  d4.numbers().toLocaleString()
  t.equal(d4.text(), '1,234円', here + '.toLocaleString()')
  t.end()
})

test('comparisons:', function (t) {
  t.deepEqual(nlp('三冊と二十五枚と百本').numbers().greaterThan(10).out('array'), ['二十五', '百'], here + '.greaterThan()')
  t.deepEqual(nlp('一と十と百').numbers().between(2, 30).out('array'), ['十'], here + '.between()')
  t.deepEqual(nlp('五冊と三冊').numbers().isEqual(5).out('array'), ['五'], here + '.isEqual()')
  t.deepEqual(nlp('三冊と二十五枚').numbers().lessThan(10).out('array'), ['三'], here + '.lessThan()')
  t.end()
})

test('toKanji decimals:', function (t) {
  t.equal(nlp.toKanji(1.5), '一・五', '1.5')
  t.equal(nlp.toKanji(0.25), '〇・二五', '0.25')
  t.equal(nlp.toKanji(23.05), '二十三・〇五', '23.05')
  t.equal(nlp.toKanji(-1.5), 'マイナス一・五', '-1.5')
  t.equal(nlp.toKanji(2), '二', 'integers are unchanged')
  t.end()
})

test('parse decimals:', function (t) {
  const arr = [
    ['1.5', 1.5], ['１．５', 1.5], ['一・五', 1.5], ['〇・二五', 0.25], ['零・五', 0.5],
    ['3.14', 3.14], ['0.1', 0.1], ['二十三・〇五', 23.05], ['十・五', 10.5],
    // 点 is how the point is read aloud - いってんご
    ['一点五', 1.5], ['零点二五', 0.25],
    // mixed scripts are unusual, but unambiguous
    ['1・5', 1.5],
  ]
  arr.forEach(([str, want]) => {
    t.equal(nlp.toNumber(str), want, here + str + ' → ' + want)
  })
  // the decimals are plain digits, and there's only one point
  const bad = ['一・十', '1.2.3', '一・二・三', '1.', '.5', '・', '点', '三点', '5.次']
  bad.forEach(str => {
    t.equal(nlp.toNumber(str), null, here + str + ' is not a number')
  })
  t.end()
})

test('decimals round-trip through kanji:', function (t) {
  ;[1.5, 0.25, 23.05, 3.14, 100.001, 0.1].forEach(n => {
    t.equal(nlp.toNumber(nlp.toKanji(n)), n, here + n + ' → ' + nlp.toKanji(n) + ' → ' + n)
  })
  t.end()
})

test('a decimal is one token:', function (t) {
  t.deepEqual(terms('りんごを1.5個'), ['りんご', 'を', '1.5', '個'], here + '1.5個')
  t.deepEqual(terms('りんごを１．５個'), ['りんご', 'を', '１．５', '個'], here + 'full-width')
  t.deepEqual(terms('一・五キロ'), ['一・五', 'キロ'], here + '一・五キロ')
  t.deepEqual(terms('0.5と1.5'), ['0.5', 'と', '1.5'], here + 'two decimals')
  // ・ is still a separator between words
  t.deepEqual(terms('ジョン・スミス'), ['ジョン', 'スミス'], here + 'ジョン・スミス')
  t.deepEqual(terms('東京・大阪'), ['東京', '大阪'], here + '東京・大阪')
  // ..and a second point means it's a list or a version, not a decimal
  t.deepEqual(terms('一・二・三'), ['一', '二', '三'], here + '一・二・三')
  t.deepEqual(terms('バージョン1.2.3'), ['バージョン', '1', '2', '3'], here + '1.2.3')
  // a full-stop after a number is still a full-stop
  t.deepEqual(terms('値は5.次の文'), ['値', 'は', '5', '次', 'の', '文'], here + '5. is not a decimal')
  t.deepEqual(terms('一点もない').slice(0, 2), ['一', '点'], here + '点 stays a counter')
  // the text itself is never changed
  const str = '彼は1.5倍速い。ジョン・スミスは２．５倍。'
  t.equal(nlp(str).text(), str, here + 'text round-trips')
  t.equal(nlp(str).length, 2, here + 'the point does not end the sentence')
  t.end()
})

test('decimals in a document:', function (t) {
  t.deepEqual(nlp('りんごを1.5個').numbers().get(), [1.5], here + '1.5個 → 1.5')
  t.deepEqual(nlp('りんごを１．５個').numbers().get(), [1.5], here + '１．５個 → 1.5')
  t.deepEqual(nlp('一・五キロ').numbers().get(), [1.5], here + '一・五キロ → 1.5')
  t.deepEqual(nlp('0.5と1.5').numbers().get(), [0.5, 1.5], here + 'two decimals')
  t.equal(nlp('ジョン・スミス').numbers().found, false, here + 'a name has no numbers')
  // the counter still belongs to the whole number
  t.deepEqual(nlp('りんごを1.5個').numbers().units().out('array'), ['個'], here + '.units()')
  t.ok(tagsOf('りんごを1.5個', '1.5').includes('Value'), here + '1.5 is a #Value')
  t.ok(tagsOf('りんごを1.5個', '個').includes('Counter'), here + '個 is its #Counter')
  t.deepEqual(nlp('3.5%上がった').percentages().out('array'), ['3.5%'], here + '.percentages()')
  t.deepEqual(nlp('1.5ドル').money().out('array'), ['1.5ドル'], here + '.money()')
  t.deepEqual(nlp('1.5個と3個').numbers().lessThan(2).out('array'), ['1.5'], here + '.lessThan()')

  const arr = [
    ['りんごを1.5個', 'toText', 'りんごを一・五個'],
    ['りんごを１．５個', 'toText', 'りんごを一・五個'],
    ['0.25倍', 'toText', '〇・二五倍'],
    ['一・五キロ走った', 'toNumber', '1.5キロ走った'],
    ['1.5個', 'increment', '2.5個'],
    ['１．５個', 'increment', '２．５個'],
    ['一・五個', 'increment', '二・五個'],
  ]
  arr.forEach(([from, method, want]) => {
    const doc = nlp(from)
    doc.numbers()[method]()
    t.equal(doc.text(), want, here + from + ' .' + method + '() → ' + want)
  })
  t.end()
})
