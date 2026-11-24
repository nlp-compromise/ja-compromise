import test from 'tape'
import nlp from '../../_lib.js'
const here = '[selections] '

test('part-of-speech selections return views:', function (t) {
  const doc = nlp('私は東京で寿司を食べた。静かな部屋は高い。')
  const methods = ['nouns', 'verbs', 'adjectives', 'particles', 'counters', 'dates', 'money', 'percentages', 'numbers', 'values']
  methods.forEach(fn => {
    const m = doc[fn]()
    t.equal(m.isView, true, here + '.' + fn + '() is a view')
    // a selection is always a part of the document it came from
    m.out('array').forEach(str => {
      t.ok(doc.text().includes(str), here + '.' + fn + '() result is in the text - ' + str)
    })
  })
  // ..and none of them throw, or find anything, on an empty document
  methods.forEach(fn => {
    t.equal(nlp('')[fn]().found, false, here + '.' + fn + '() on an empty document')
  })
  t.end()
})

test('.particles():', function (t) {
  t.deepEqual(nlp('私は東京で寿司を食べた').particles().out('array'), ['は', 'で', 'を'], here + 'は で を')
  t.equal(nlp('東京').particles().found, false, here + 'none to find')
  t.end()
})

test('selections can be chained:', function (t) {
  const doc = nlp('猫が魚を食べた。犬は走る。')
  t.equal(doc.eq(1).verbs().termList()[0].text, '走る', here + 'second sentence only')
  t.equal(doc.verbs().eq(0).termList()[0].text, '食べた', here + 'first verb')
  t.equal(doc.verbs().length, 2, here + 'two verbs')
  t.equal(doc.verbs().particles().found, false, here + 'no particles inside the verbs')
  t.end()
})

test('number selections take an index:', function (t) {
  const doc = nlp('五冊と3枚')
  t.deepEqual(doc.numbers(0).out('array'), ['五'], here + '.numbers(0)')
  t.deepEqual(doc.numbers(1).out('array'), ['3'], here + '.numbers(1)')
  t.equal(doc.numbers(9).found, false, here + '.numbers(9)')
  t.deepEqual(doc.counters(1).out('array'), ['枚'], here + '.counters(1)')
  t.deepEqual(nlp('千円と5ドル').money(1).out('array'), ['5ドル'], here + '.money(1)')
  t.deepEqual(nlp('三パーセントと5%').percentages(1).out('array'), ['5%'], here + '.percentages(1)')
  t.end()
})

test('.numbers().parse() and .json():', function (t) {
  let found = nlp('本を五冊買った').numbers().parse()
  t.equal(found.length, 1, here + 'one number')
  t.equal(found[0].num, 5, here + 'parse num')
  t.equal(found[0].kanji, true, here + 'written in kanji')
  t.equal(found[0].wide, false, here + 'not full-width')

  found = nlp('２３冊').numbers().parse()
  t.equal(found[0].num, 23, here + 'full-width num')
  t.equal(found[0].kanji, false, here + 'not kanji')
  t.equal(found[0].wide, true, here + 'full-width')

  const json = nlp('本を五冊買って、2回読んだ').numbers().json()
  t.equal(json.length, 2, here + 'two json results')
  t.deepEqual(json.map(o => o.number), [{ num: 5, counter: '冊' }, { num: 2, counter: '回' }], here + 'json number')
  t.deepEqual(json.map(o => o.text), ['五', '2'], here + 'json text')
  // a number with no counter
  t.deepEqual(nlp('五と').numbers().json()[0].number, { num: 5, counter: null }, here + 'no counter')
  t.end()
})

test('.numbers().set():', function (t) {
  const doc = nlp('五冊と3枚と２個')
  doc.numbers().set(12)
  t.equal(doc.text(), '十二冊と12枚と１２個', here + 'each number keeps its script')
  // anything but a number is ignored
  const d2 = nlp('五冊')
  d2.numbers().set('七')
  d2.numbers().add('1')
  t.equal(d2.text(), '五冊', here + 'a string is not a number')
  t.end()
})

test('.isOrdinal() and .isCardinal():', function (t) {
  const doc = nlp('三番目の人が五冊買った')
  t.deepEqual(doc.numbers().isOrdinal().out('array'), ['三番目'], here + '.isOrdinal()')
  t.ok(doc.numbers().isCardinal().has('五'), here + '.isCardinal()')
  t.equal(nlp('五冊').numbers().isOrdinal().found, false, here + 'no ordinal')
  t.end()
})

test('number methods keep returning Numbers:', function (t) {
  const doc = nlp('五冊と十枚')
  const m = doc.numbers().greaterThan(1).lessThan(100).between(1, 100)
  t.deepEqual(m.get(), [5, 10], here + 'filters chain')
  t.deepEqual(doc.numbers().increment().increment().get(), [7, 12], here + 'arithmetic chains')
  t.deepEqual(doc.numbers().toNumber().toText().get(), [7, 12], here + 'rewriting keeps the value')
  t.equal(doc.text(), '七冊と十二枚', here + 'final text')
  t.end()
})

test('constructor helpers reject what they cannot use:', function (t) {
  t.equal(nlp.deconjugate('猫'), null, here + 'deconjugate a noun')
  t.equal(nlp.deconjugate(''), null, here + 'deconjugate nothing')
  t.equal(nlp.verbClass('猫'), null, here + 'verbClass of a noun')
  t.equal(nlp.conjugate('猫'), null, here + 'conjugate a noun')
  t.equal(nlp.toNumber('猫'), null, here + 'toNumber of a noun')
  t.equal(nlp.toNumber(null), null, here + 'toNumber of null')
  t.equal(nlp.toNumber(undefined), null, here + 'toNumber of undefined')
  t.equal(nlp.toKanji('五'), null, here + 'toKanji of a string')
  t.equal(nlp.toKanji(NaN), null, here + 'toKanji of NaN')
  t.equal(nlp.toKanji(Infinity), null, here + 'toKanji of Infinity')
  t.end()
})

test('nlp.deconjugate() shape:', function (t) {
  const found = nlp.deconjugate('食べました')
  t.equal(found.root, '食べる', here + 'root')
  t.ok(Array.isArray(found.tags) && found.tags.includes('PastTense'), here + 'tags')
  t.ok(Array.isArray(found.candidates) && found.candidates.includes('食べる'), here + 'candidates')
  // conjugate and deconjugate are inverses
  const forms = nlp.conjugate('書く')
  ;['PastTense', 'Negative', 'PastNegative', 'Polite', 'PolitePast', 'PoliteNegative'].forEach(k => {
    t.equal(nlp.deconjugate(forms[k]).root, '書く', here + forms[k] + ' → 書く')
  })
  t.end()
})

test('nlp.version:', function (t) {
  t.equal(typeof nlp.version, 'string', here + 'is a string')
  t.ok(/^\d+\.\d+\.\d+/.test(nlp.version), here + 'is a semver')
  t.end()
})

test(`.compute('readings'):`, function (t) {
  const terms = nlp('私は学生です').compute('readings').json()[0].terms
  t.equal(terms.find(o => o.text === '私').reading, 'わたし', here + '私')
  t.equal(terms.find(o => o.text === '学生').reading, 'がくせい', here + '学生')
  // only a word with kanji in it needs a reading
  t.equal(terms.find(o => o.text === 'は').reading, undefined, here + 'kana has none')
  t.end()
})
