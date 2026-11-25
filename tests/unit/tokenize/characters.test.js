import test from 'tape'
import nlp from '../../_lib.js'
const here = '[characters] '

const terms = (str) => nlp(str).json()[0].terms.map(t => t.text)
const triples = (str) => nlp(str).docs[0].map(t => [t.pre, t.text, t.post])

test('a character can be two units long:', function (t) {
  const arr = [
    // kanji outside the first 65k characters
    ['𠮷野家で𩸽を食べる', ['𠮷野家', 'で', '𩸽', 'を', '食べる']],
    ['彼女の猫はかわいい😀です', ['彼女', 'の', '猫', 'は', 'かわいい', '😀', 'です']],
    // a skin-tone, and a family, are each one emoji
    ['👍🏽', ['👍🏽']],
    ['やった👨‍👩‍👧！', ['やった', '👨‍👩‍👧']],
  ]
  arr.forEach(([str, want]) => {
    t.deepEqual(terms(str), want, here + str)
    t.equal(nlp(str).text(), str, here + 'roundtrip ' + str)
  })
  t.equal(nlp('かわいい😀です').match('#Emoji').text(), '😀', here + '#Emoji')
  t.end()
})

test('width does not change the words:', function (t) {
  const arr = [
    // [text, terms, normal-of-first]
    ['ｺﾝﾋﾟｭｰﾀを使う', ['ｺﾝﾋﾟｭｰﾀ', 'を', '使う'], 'コンピュータ'],
    ['Ｇｏｏｇｌｅで検索する', ['Ｇｏｏｇｌｅ', 'で', '検索する'], 'google'],
    ['３０歳です', ['３０', '歳', 'です'], '30'],
    ['ｶﾞｷﾞｸﾞ', ['ｶﾞｷﾞｸﾞ'], 'ガギグ'],
  ]
  arr.forEach(([str, want, normal]) => {
    const doc = nlp(str)
    t.deepEqual(terms(str), want, here + str)
    t.equal(doc.docs[0][0].normal, normal, here + 'normal ' + str)
    t.equal(doc.text(), str, here + 'roundtrip ' + str)
  })
  t.ok(nlp('ｺﾝﾋﾟｭｰﾀを使う').has('コンピュータ'), here + 'match by plain form')
  t.ok(nlp('ｺﾝﾋﾟｭｰﾀを使う').has('#Katakana'), here + 'half-width is katakana')
  t.ok(nlp('Ｇｏｏｇｌｅで検索').has('google'), here + 'match full-width latin')
  t.end()
})

test('punctuation is never a term:', function (t) {
  const arr = [
    ['“引用”と"quote"', [['“', '引用', '”'], ['', 'と', '"'], ['', 'quote', '"']]],
    ['［注］｛a｝', [['［', '注', '］'], ['｛', 'a', '｝']]],
    ['彼は──そう、彼は', [['', '彼', ''], ['', 'は', '──'], ['', 'そう', '、'], ['', '彼', ''], ['', 'は', '']]],
    ['※注意：禁煙です', [['※', '注意', '：'], ['', '禁煙', ''], ['', 'です', '']]],
    ['A→B', [['', 'A', '→'], ['', 'B', '']]],
    ['10時～12時', [['', '10', ''], ['', '時', '～'], ['', '12', ''], ['', '時', '']]],
    // a sign written in front of a thing goes with that thing
    ['¥500と＄5', [['¥', '500', ''], ['', 'と', ''], ['＄', '5', '']]],
    ['#タグ @名前', [['#', 'タグ', ' '], ['@', '名前', '']]],
  ]
  arr.forEach(([str, want]) => {
    t.deepEqual(triples(str), want, here + str)
    t.equal(nlp(str).text(), str, here + 'roundtrip ' + str)
  })
  t.end()
})

test('…unless it is inside a word:', function (t) {
  const arr = [
    ['すご〜い', ['すご〜い']],
    ['Wi-Fiが遅い', ['Wi-Fi', 'が', '遅い']],
    ['COVID-19', ['COVID-19']],
    ['C++とC#', ['C++', 'と', 'C#']],
    ['U.S.A.の話', ['U.S.A', 'の', '話']],
    ['http://example.com を見て', ['http://example.com', 'を', '見て']],
    ['https://example.com/a?b=1。', ['https://example.com/a?b=1']],
    ['user@example.com に送る', ['user@example.com', 'に', '送る']],
    // 5% is read aloud
    ['3.5%上がった', ['3.5', '%', '上がった']],
  ]
  arr.forEach(([str, want]) => {
    t.deepEqual(terms(str), want, here + str)
    t.equal(nlp(str).text(), str, here + 'roundtrip ' + str)
  })
  t.ok(nlp('http://example.com を見て').has('#Url'), here + '#Url')
  t.ok(nlp('user@example.com に送る').has('#Email'), here + '#Email')
  t.end()
})

test('numbers with punctuation in them:', function (t) {
  const arr = [
    ['1,000円です', ['1,000', '円', 'です']],
    ['１，０００円です', ['１，０００', '円', 'です']],
    ['1,234,567円', ['1,234,567', '円']],
    ['１０：３０に', ['１０：３０', 'に']],
    ['2024/01/05に', ['2024/01/05', 'に']],
    ['03-1234-5678です', ['03-1234-5678', 'です']],
    ['〒100-0001', ['100-0001']],
    ['3.14です', ['3.14', 'です']],
    // a version is not a number
    ['1.2.3', ['1', '2', '3']],
  ]
  arr.forEach(([str, want]) => {
    t.deepEqual(terms(str), want, here + str)
    t.equal(nlp(str).text(), str, here + 'roundtrip ' + str)
  })
  t.equal(nlp('１，０００円').docs[0][0].number, 1000, here + 'value of １，０００')
  t.equal(nlp('1,234,567円').docs[0][0].number, 1234567, here + 'value of 1,234,567')
  t.equal(nlp.toNumber('1,000'), 1000, here + 'toNumber')
  t.ok(nlp('03-1234-5678です').has('#PhoneNumber'), here + '#PhoneNumber')
  t.end()
})

test('nothing is lost:', function (t) {
  const arr = [' - ', '…', '！？', 'あ　い', '（笑）それな', '㈱東京 ①番 ㍻', 'えっ！？本当に…？', '♪楽しい★', '「」', '東京-大阪間', '-5度']
  arr.forEach(str => {
    t.equal(nlp(str).text(), str, here + JSON.stringify(str))
  })
  t.end()
})
