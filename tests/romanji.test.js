import test from 'tape'
import nlp from './_lib.js'
import toRomanji from '../src/01-one/romanji/compute/toRomanji/index.js'
const here = '[romanji] '

test('kana romanization:', function (t) {
  let arr = [
    ['ひらがな', 'hiragana'],
    ['カタカナ', 'katakana'],   // katakana must romanize too, not pass through
    ['コーヒー', 'koohii'],     // the 長音符 lengthens the vowel
    ['ニュージーランド', 'nyuujiirando'],
    ['がっこう', 'gakkou'],     // っ doubles the next consonant
    ['きって', 'kitte'],
    ['しんぶん', 'shinbun'],
  ]
  arr.forEach(([str, want]) => {
    t.equal(toRomanji(str), want, here + str + ' → ' + want)
  })
  t.end()
})

test('romanization through the tokenizer:', function (t) {
  t.equal(nlp('ひらがなとカタカナ').romanji().trim(), 'hiragana to katakana', here + 'mixed scripts')
  t.equal(nlp('コーヒーを飲む').romanji().trim(), 'koohii o nomu', here + 'コーヒーを飲む')
  t.end()
})

test('particles sound different from how they are spelled:', function (t) {
  // は is 'ha' as a syllable but 'wa' as the topic particle
  t.equal(nlp('私は学生です').romanji().trim(), 'watashi wa gakusei desu', here + 'は → wa')
  t.equal(nlp('東京へ行く').romanji().trim(), 'toukyou e iku', here + 'へ → e')
  t.equal(nlp('本を読む').romanji().trim(), 'hon o yomu', here + 'を → o')
  t.end()
})

test('a conjugated verb keeps its root reading:', function (t) {
  // 食べました isn't in the reading-table, but 食べる is - and 食 spells た there
  let arr = [
    ['食べました', 'tabemashita'],
    ['食べなかった', 'tabenakatta'],
    ['来ました', 'kimashita'],
  ]
  arr.forEach(([str, want]) => {
    t.equal(nlp(str).romanji().trim(), want, here + str + ' → ' + want)
  })
  t.end()
})

test('okurigana picks the kun-reading:', function (t) {
  // 行きました is ikimashita - the on-reading (kou) belongs to compounds
  let arr = [
    ['行きました', 'ikimashita'],
    ['読む', 'yomu'],
    ['書いて', 'kaite'],
    ['勉強', 'benkyou'],
  ]
  arr.forEach(([str, want]) => {
    t.equal(nlp(str).romanji().trim(), want, here + str + ' → ' + want)
  })
  t.end()
})
