import test from 'tape'
import nlp from '../../_lib.js'
const here = '[nouns] '

test('.nouns() finds each noun:', function (t) {
  const doc = nlp('小さな子供が食料品を買いました。')
  t.equal(doc.nouns().viewType, 'Nouns', here + 'is a Nouns view')
  t.deepEqual(doc.nouns().out('array'), ['子供', '食料品'], here + 'both nouns')
  t.equal(doc.nouns(1).text(), '食料品', here + '.nouns(1)')
  t.equal(doc.nouns(9).found, false, here + '.nouns(9)')
  t.equal(doc.nouns().eq(0).viewType, 'Nouns', here + 'stays a Nouns view')
  t.equal(nlp('').nouns().found, false, here + 'empty document')
  t.end()
})

test('.nouns().parse() and .json():', function (t) {
  const doc = nlp('子供たちは本を読んだ')
  t.deepEqual(doc.nouns().parse(), [
    { root: '子供', plural: true, particle: 'は' },
    { root: '本', plural: false, particle: 'を' },
  ], here + 'parse')
  t.deepEqual(doc.nouns().parse(1), [{ root: '本', plural: false, particle: 'を' }], here + 'parse(n)')
  const json = doc.nouns().json()
  t.equal(json.length, 2, here + 'json for each noun')
  t.equal(json[0].text, '子供たち', here + 'json text')
  t.deepEqual(json[0].noun, { root: '子供', plural: true, particle: 'は' }, here + 'json noun')
  t.equal(doc.nouns().json(1)[0].noun.root, '本', here + '.json(n)')
  // nothing after it
  t.equal(nlp('東京').nouns().parse()[0].particle, null, here + 'no particle')
  t.end()
})

test('.nouns().isPlural():', function (t) {
  const doc = nlp('子供たちと人々は私の本を読んだ')
  t.deepEqual(doc.nouns().isPlural().out('array'), ['子供たち', '人々'], here + 'isPlural')
  t.deepEqual(doc.nouns().isSingular().out('array'), ['私', '本'], here + 'isSingular')
  t.end()
})

test('.nouns().toPlural() and .toSingular():', function (t) {
  const arr = [
    // [text, plural, singular]
    ['子供が走る', '子供たちが走る', '子供が走る'],
    ['私は学生です', '私たちは学生たちです', '私は学生です'],
    ['猫たちが走っている', '猫たちが走っている', '猫が走っている'],
    ['子供達と遊ぶ', '子供達と遊ぶ', '子供と遊ぶ'],
    ['人が来た。', '人々が来た。', '人が来た。'],
    ['人々が来た。', '人々が来た。', '人が来た。'],
    // things don't take a plural - 本 is already 'books'
    ['本を読む', '本を読む', '本を読む'],
    ['東京で寿司を食べた', '東京で寿司を食べた', '東京で寿司を食べた'],
    // 誰たち
    ['誰が来た', '誰が来た', '誰が来た'],
  ]
  arr.forEach(a => {
    let doc = nlp(a[0])
    doc.nouns().toPlural()
    t.equal(doc.text(), a[1], here + a[0] + ' .toPlural()')
    doc = nlp(a[0])
    doc.nouns().toSingular()
    t.equal(doc.text(), a[2], here + a[0] + ' .toSingular()')
  })
  t.end()
})

test('number changes keep the tags right:', function (t) {
  const doc = nlp('子供が走る')
  doc.nouns().toPlural()
  t.equal(doc.has('#Plural'), true, here + 'now plural')
  t.equal(doc.nouns().isPlural().found, true, here + 'isPlural agrees')
  doc.nouns().toSingular()
  t.equal(doc.has('#Plural'), false, here + 'singular again')
  t.equal(doc.text(), '子供が走る', here + 'round-trip')
  // only the nth
  const both = nlp('子供と学生')
  both.nouns().toPlural(1)
  t.equal(both.text(), '子供と学生たち', here + 'toPlural(1)')
  t.end()
})

test('.nouns().conjugate():', function (t) {
  t.deepEqual(nlp('子供たちは本を読んだ').nouns().conjugate(), [
    { singular: '子供', plural: '子供たち' },
    { singular: '本', plural: '本' },
  ], here + 'conjugate')
  t.deepEqual(nlp('人').nouns().conjugate(), [{ singular: '人', plural: '人々' }], here + 'irregular')
  t.end()
})
