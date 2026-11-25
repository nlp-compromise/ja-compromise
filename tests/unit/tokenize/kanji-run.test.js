import test from 'tape'
import nlp from '../../_lib.js'
const here = '[kanji-run] '

const terms = (str) => nlp(str).json()[0].terms.map(t => t.text)

test('an unknown compound stays whole:', function (t) {
  // every one of these kanji is a word on its own, but none of these are
  // sentences about 'outside, country, person..'
  const arr = [
    ['京都', ['京都']],
    ['本当ですか', ['本当', 'です', 'か']],
    ['光合成反応', ['光合成反応']],
    ['量子力学', ['量子力学']],
    ['大学生', ['大学生']],
    ['米国', ['米国']],
    ['国際宇宙基地は', ['国際宇宙基地', 'は']],
    ['東京から大阪まで行く', ['東京', 'から', '大阪', 'まで', '行く']],
    ['大学生じゃない', ['大学生', 'じゃない']],
  ]
  arr.forEach(([str, want]) => {
    t.deepEqual(terms(str), want, here + str)
  })
  t.end()
})

test('known words still split a run:', function (t) {
  const arr = [
    ['日本銀行', ['日本', '銀行']],
    ['毎日学校に行きます', ['毎日', '学校', 'に', '行きます']],
    // a time-word, or a pronoun, stands alone
    ['今日本を読む', ['今日', '本', 'を', '読む']],
    ['昨日彼は来た', ['昨日', '彼', 'は', '来た']],
    // a known word is never cut in half to make a verb - 生じる
    ['学生じゃない', ['学生', 'じゃない']],
  ]
  arr.forEach(([str, want]) => {
    t.deepEqual(terms(str), want, here + str)
  })
  t.end()
})

test('numbers and counters come apart:', function (t) {
  const arr = [
    ['二十三人', ['二十三', '人']],
    ['令和六年', ['令和', '六', '年']],
    ['午後三時十五分', ['午後', '三', '時', '十五', '分']],
    ['第三回', ['第', '三', '回']],
    ['三匹目', ['三', '匹', '目']],
    ['3時間半', ['3', '時間', '半']],
    ['100円玉', ['100', '円', '玉']],
    ['何人', ['何', '人']],
    // …but a word with a numeral in it is still a word
    ['一緒に行く', ['一緒', 'に', '行く']],
  ]
  arr.forEach(([str, want]) => {
    t.deepEqual(terms(str), want, here + str)
  })
  t.end()
})

test('a verb at the end of a run keeps its stem:', function (t) {
  const arr = [
    ['京都行きます', ['京都', '行きます']],
    ['雨降ってきた', ['雨', '降って', 'きた']],
    ['全部食べた', ['全部', '食べた']],
    // 届く isn't in the lexicon
    ['手紙届きました', ['手紙', '届きました']],
    ['新型含まれている', ['新型', '含まれて', 'いる']],
  ]
  arr.forEach(([str, want]) => {
    t.deepEqual(terms(str), want, here + str)
  })
  t.end()
})

test('a user-given word splits a run:', function (t) {
  t.deepEqual(terms('量子力学'), ['量子力学'], here + 'before')
  nlp.addWords({ 量子: 'Noun', 力学: 'Noun' })
  t.deepEqual(terms('量子力学'), ['量子', '力学'], here + 'after')
  t.end()
})
