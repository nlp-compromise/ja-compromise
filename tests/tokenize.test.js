import test from 'tape'
import nlp from './_lib.js'
const here = '[tokenize] '

const terms = (str) => nlp(str).json()[0].terms.map(t => t.text)

test('word-segmentation:', function (t) {
  let arr = [
    ['私は学生です。', ['私', 'は', '学生', 'です']],
    ['これはペンです。', ['これ', 'は', 'ペン', 'です']],
    ['彼は毎日学校に行きます。', ['彼', 'は', '毎日', '学校', 'に', '行きます']],
    ['本を読んでいる人', ['本', 'を', '読んでいる', '人']],
    ['東京へ行ったことがあります。', ['東京', 'へ', '行った', 'こと', 'が', 'あります']],
    ['子供に野菜を食べさせる。', ['子供', 'に', '野菜', 'を', '食べさせる']],
    ['雨が降ったら、行きません。', ['雨', 'が', '降ったら', '行きません']],
    ['大きい犬と小さな猫', ['大きい', '犬', 'と', '小さな', '猫']],
    ['ご飯を食べたくない。', ['ご飯', 'を', '食べたくない']],
    ['田中さんは先生ではありません。', ['田中', 'さん', 'は', '先生', 'ではありません']],
    ['今日は天気がいいですね。', ['今日', 'は', '天気', 'が', 'いい', 'です', 'ね']],
  ]
  arr.forEach(([str, want]) => {
    t.deepEqual(terms(str), want, here + str)
  })
  t.end()
})

test('all-kana text still finds word boundaries:', function (t) {
  // が/な/は are particles, but they're also just kana - a run of them that
  // matched nothing is one unknown word, not four
  let arr = [
    ['ひらがな', ['ひらがな']],
    ['しんぶんをよむ', ['しんぶん', 'を', 'よむ']],
    ['ひらがなとカタカナ', ['ひらがな', 'と', 'カタカナ']],
    ['わたしはがくせいです', ['わたし', 'は', 'がくせい', 'です']],
    ['ひとりで行く', ['ひとり', 'で', '行く']],
    // …but two particles in a row stay two tokens
    ['地元のカフェでの授業', ['地元', 'の', 'カフェ', 'で', 'の', '授業']],
  ]
  arr.forEach(([str, want]) => {
    t.deepEqual(terms(str), want, here + str)
  })
  t.end()
})

test('an unknown verb keeps its okurigana:', function (t) {
  // 含む isn't in the lexicon, but 含まれている is still one verb
  let arr = [
    ['含まれている', ['含まれている']],
    ['木で作った', ['木', 'で', '作った']],
    ['本を読む', ['本', 'を', '読む']],
    ['手紙が届きました', ['手紙', 'が', '届きました']],
  ]
  arr.forEach(([str, want]) => {
    t.deepEqual(terms(str), want, here + str)
  })
  t.end()
})

test('loanwords stay whole:', function (t) {
  let arr = [
    ['ニュージーランド', ['ニュージーランド']],
    ['カフェでコーヒーを飲む', ['カフェ', 'で', 'コーヒー', 'を', '飲む']],
    ['ジョン・スミス', ['ジョン', 'スミス']],
  ]
  arr.forEach(([str, want]) => {
    t.deepEqual(terms(str), want, here + str)
  })
  t.end()
})

test('punctuation never becomes a term:', function (t) {
  let arr = ['昨日、映画を見ました。', '「こんにちは」と言った。', 'すごい！本当に？', '一、二、三']
  arr.forEach(str => {
    let doc = nlp(str)
    let list = doc.json()[0].terms
    t.ok(list.every(term => term.text !== ''), here + 'no empty term in ' + str)
    t.equal(doc.text(), str, here + 'round-trips: ' + str)
  })
  t.end()
})

test('text() round-trips the input:', function (t) {
  let arr = [
    '私は学生です。',
    '彼女は昨日、東京に行きました。',
    'これはとても難しい問題です。',
    'コーヒーを飲みながら本を読んだ。',
    'ジョン・スミスさんが来ました。',
    '1995年に生まれました。',
  ]
  arr.forEach(str => {
    t.equal(nlp(str).text(), str, here + str)
  })
  t.end()
})
