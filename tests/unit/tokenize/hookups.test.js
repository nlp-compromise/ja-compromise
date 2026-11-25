import test from 'tape'
import nlp from '../../_lib.js'
const here = '[hookups] '

const terms = (doc) => doc.json()[0].terms.map(t => t.text)

test('nlp.tokenize() segments words:', function (t) {
  const str = '彼女は昨日、東京で美味しい料理を食べました。 明日は　雨です。'
  const doc = nlp.tokenize(str)
  t.deepEqual(terms(doc), ['彼女', 'は', '昨日', '東京', 'で', '美味しい', '料理', 'を', '食べました'], here + 'tokenize')
  t.equal(doc.length, 2, here + 'two sentences')
  t.equal(doc.text(), str, here + 'tokenize roundtrip')
  t.equal(doc.has('#Verb'), false, here + 'tokenize does not tag')
  t.equal(nlp(str).text(), str, here + 'nlp roundtrip')
  t.end()
})

test('a given lexicon changes the segmentation:', function (t) {
  // a name in two scripts
  const str = '私はくまモンが好き'
  t.notOk(terms(nlp(str)).includes('くまモン'), here + 'unknown beforehand')
  const doc = nlp(str, { くまモン: 'Person' })
  t.deepEqual(terms(doc), ['私', 'は', 'くまモン', 'が', '好き'], here + 'nlp(txt, lex)')
  t.equal(doc.match('#Person').text(), 'くまモン', here + 'lexicon tag')
  // longer than the built-in lookahead
  nlp.addWords({ ながいながいなまえのキャラクター: 'Person' })
  t.deepEqual(terms(nlp('ながいながいなまえのキャラクターが好き')), ['ながいながいなまえのキャラクター', 'が', '好き'], here + 'addWords')
  t.deepEqual(terms(nlp.tokenize('くまモンが好き')), ['くまモン', 'が', '好き'], here + 'tokenize sees it too')
  t.end()
})

test('inserted text is segmented, without a space:', function (t) {
  let doc = nlp('私は東京に行きます')
  doc.match('東京').insertAfter('や大阪')
  t.deepEqual(terms(doc), ['私', 'は', '東京', 'や', '大阪', 'に', '行きます'], here + 'insertAfter terms')
  t.equal(doc.text(), '私は東京や大阪に行きます', here + 'insertAfter text')

  doc = nlp('私は東京に行きます')
  doc.match('東京').replaceWith('大阪や奈良')
  t.equal(doc.text(), '私は大阪や奈良に行きます', here + 'replaceWith text')
  t.deepEqual(doc.match('#Particle').out('array'), ['は', 'や', 'に'], here + 'replaceWith is tagged')

  doc = nlp('私は東京に行きます。')
  doc.match('私').insertBefore('明日')
  t.equal(doc.text(), '明日私は東京に行きます。', here + 'insertBefore')

  doc = nlp('私は東京に行きます。彼も行きます。')
  doc.first().append('たぶん')
  t.equal(doc.text(), '私は東京に行きますたぶん。彼も行きます。', here + 'append')

  doc = nlp('私は東京に行きます。')
  doc.concat('彼は学生です。')
  t.deepEqual(doc.json()[1].terms.map(o => o.text), ['彼', 'は', '学生', 'です'], here + 'concat')
  t.end()
})

test('spaces that were asked for are kept:', function (t) {
  let doc = nlp('たろう は のりこ を みた')
  doc.match('のりこ').insertAfter('さん')
  t.equal(doc.text(), 'たろう は のりこ さん を みた', here + 'spaced japanese')

  doc = nlp('I use Google')
  doc.match('Google').insertAfter('Maps')
  t.equal(doc.text(), 'I use Google Maps', here + 'latin')

  doc = nlp('私は東京に行きます')
  doc.match('東京').insertAfter('や大阪 ')
  t.equal(doc.text(), '私は東京や大阪 に行きます', here + 'given space')
  t.end()
})
