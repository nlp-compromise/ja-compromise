import test from 'tape'
import nlp from '../_lib.js'
const here = '[hmm/numbers] '

// a thousands-separator splits the number - 1,234円 is read as 「1,」 and 234
test('thousands-separators:', function (t) {
  t.deepEqual(nlp('1,234円').numbers().get(), [1234], here + '1,234円 → 1234')
  t.deepEqual(nlp('１，２３４円').numbers().get(), [1234], here + 'full-width')
  t.equal(nlp.toNumber('1,234'), 1234, here + `nlp.toNumber('1,234')`)
  // ..so the output of .toLocaleString() can't be read back in
  const doc = nlp('千二百三十四円')
  doc.numbers().toLocaleString()
  t.deepEqual(nlp(doc.text()).numbers().get(), [1234], here + '.toLocaleString() round-trips')
  t.end()
})

// compromise's .map() only unwraps to an array when there's something in it,
// so .get() hands back an empty view rather than []
test('.get() with no numbers:', function (t) {
  t.ok(Array.isArray(nlp('ジョン・スミス').numbers().get()), here + '.get() is always an array')
  t.ok(Array.isArray(nlp('ジョン・スミス').numbers().parse()), here + '.parse() is always an array')
  t.end()
})

// 一点五 parses with nlp.toNumber(), but the tokenizer leaves it as 一|点|五,
// because 点 is usually a counter - 一点二点
test('点 as a decimal point:', function (t) {
  t.deepEqual(nlp('一点五倍').numbers().get(), [1.5], here + '一点五倍 → 1.5')
  t.end()
})

// 二・二六事件 is the february-26th incident, not 2.26
test('・ in a date-name:', function (t) {
  t.deepEqual(nlp('二・二六事件').numbers().get(), [2, 26], here + '二・二六事件')
  t.end()
})
