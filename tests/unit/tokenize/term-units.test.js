import test from 'tape'
import nlp from '../../_lib.js'
const here = '[term-units] '

const terms = (str) => nlp(str).json()[0].terms.map(t => t.text)

// one term is a word and its bound endings.
// a て-form and the helper verb after it are two terms, whichever helper it is.

test('a て-form and its helper are two terms:', function (t) {
  const arr = [
    ['本を読んでいる人', ['本', 'を', '読んで', 'いる', '人']],
    ['東京に住んでいます', ['東京', 'に', '住んで', 'います']],
    ['勉強しています', ['勉強して', 'います']],
    ['食べていた', ['食べて', 'いた']],
    ['読んでしまいました', ['読んで', 'しまいました']],
    ['書いてあります', ['書いて', 'あります']],
    ['食べてください', ['食べて', 'ください']],
    // a verb the lexicon doesn't have
    ['含まれている', ['含まれて', 'いる']],
  ]
  arr.forEach(([str, want]) => {
    t.deepEqual(terms(str), want, here + str)
  })
  t.end()
})

test('…but still one verb:', function (t) {
  const arr = [
    ['本を読んでいる人', '読んでいる', '本を読む人'],
    ['東京に住んでいます', '住んでいます', '東京に住む'],
    ['読んでしまいました', '読んでしまいました', '読む'],
    ['含まれている', '含まれている', '含む'],
  ]
  arr.forEach(([str, verb, root]) => {
    const doc = nlp(str)
    t.deepEqual(doc.verbs().out('array'), [verb], here + 'verbs() ' + str)
    t.equal(doc.match('#Progressive+').text(), verb.endsWith('しまいました') ? '' : verb, here + '#Progressive ' + str)
    t.equal(doc.text('root'), root, here + 'root ' + str)
    t.equal(doc.text(), str, here + 'roundtrip ' + str)
  })
  t.end()
})

test('bound endings stay on the verb:', function (t) {
  const arr = [
    // [text, terms, root-of-first]
    ['行かなければならない', ['行かなければ', 'ならない'], '行く'],
    ['勉強しなければなりません', ['勉強しなければ', 'なりません'], '勉強する'],
    ['食べさせられたくなかった', ['食べさせられたくなかった'], '食べる'],
    ['行きたくない', ['行きたくない'], '行く'],
    ['高くなりました', ['高く', 'なりました'], '高い'],
    // spoken contractions
    ['食べなきゃ', ['食べなきゃ'], '食べる'],
    ['食べちゃった', ['食べちゃった'], '食べる'],
    ['読んじゃった', ['読んじゃった'], '読む'],
    ['食べてる', ['食べてる'], '食べる'],
    ['知ってる', ['知ってる'], '知る'],
    ['見てた', ['見てた'], '見る'],
  ]
  arr.forEach(([str, want, root]) => {
    const doc = nlp(str).compute('root')
    t.deepEqual(terms(str), want, here + str)
    t.equal(doc.docs[0][0].root, root, here + 'root ' + str)
    t.ok(doc.has('#Verb'), here + 'tagged ' + str)
  })
  t.end()
})

test('the ending has to be one the verb takes:', function (t) {
  // 産む is 産んで, never 産んて
  t.equal(nlp.deconjugate('産んて'), null, here + 'unvoiced after ん')
  t.notEqual((nlp.deconjugate('書いで') || {}).root, '書く', here + 'voiced after く')
  t.equal(nlp.deconjugate('泳いで').root, '泳ぐ', here + 'voiced after ぐ')
  t.equal(nlp.deconjugate('書いて').root, '書く', here + 'unvoiced after く')
  t.deepEqual(terms('くるまをうんてんする'), ['くるま', 'を', 'うんてん', 'する'], here + 'not 産んて')
  t.end()
})
