import test from 'tape'
import { conjugateVerb, conjugateAdjective, conjugateNaAdjective, verbClass } from '../src/01-one/conjugate/index.js'
const here = '[conjugate] '

test('verb-class:', function (t) {
  let arr = [
    ['書く', 'godan'], ['話す', 'godan'], ['待つ', 'godan'], ['読む', 'godan'],
    ['遊ぶ', 'godan'], ['死ぬ', 'godan'], ['泳ぐ', 'godan'], ['買う', 'godan'],
    ['走る', 'godan'], ['帰る', 'godan'], ['切る', 'godan'], ['知る', 'godan'],
    ['食べる', 'ichidan'], ['見る', 'ichidan'], ['起きる', 'ichidan'], ['考える', 'ichidan'],
    ['寝る', 'ichidan'], ['出る', 'ichidan'], ['借りる', 'ichidan'],
    ['する', 'suru'], ['勉強する', 'suru'], ['来る', 'kuru'],
    ['行く', 'iku'], ['ある', 'aru'], ['問う', 'ou'], ['くださる', 'aru5'],
  ]
  arr.forEach(([dict, want]) => {
    t.equal(verbClass(dict), want, here + dict)
  })
  t.end()
})

test('godan-conjugation:', function (t) {
  // 書く - the textbook godan verb
  let o = conjugateVerb('書く')
  let want = {
    Stem: '書き', PastTense: '書いた', Negative: '書かない', PastNegative: '書かなかった',
    Gerund: '書いて', Polite: '書きます', PolitePast: '書きました', PoliteNegative: '書きません',
    PolitePastNegative: '書きませんでした', Imperative: '書け', NegativeImperative: '書くな',
    Volitional: '書こう', Potential: '書ける', Passive: '書かれる', Causative: '書かせる',
    Conditional: '書いたら', Provisional: '書けば', Progressive: '書いている',
    Desire: '書きたい', Representative: '書いたり', Continuative: '書きながら',
  }
  Object.keys(want).forEach(k => t.equal(o[k], want[k], here + '書く.' + k))
  t.end()
})

test('sound-change (音便):', function (t) {
  // the て-form is where godan verbs differ from each other
  let arr = [
    ['買う', '買って'], ['待つ', '待って'], ['走る', '走って'],
    ['死ぬ', '死んで'], ['遊ぶ', '遊んで'], ['読む', '読んで'],
    ['書く', '書いて'], ['泳ぐ', '泳いで'], ['話す', '話して'],
    ['行く', '行って'], // the famous exception - not 行いて
    ['食べる', '食べて'], ['見る', '見て'],
    ['する', 'して'], ['来る', '来て'],
  ]
  arr.forEach(([dict, want]) => {
    t.equal(conjugateVerb(dict).Gerund, want, here + dict + ' → ' + want)
    t.equal(conjugateVerb(dict).PastTense, want.replace(/て$/, 'た').replace(/で$/, 'だ'), here + dict + ' past')
  })
  t.end()
})

test('ichidan-conjugation:', function (t) {
  let o = conjugateVerb('食べる')
  let want = {
    Stem: '食べ', PastTense: '食べた', Negative: '食べない', Gerund: '食べて',
    Polite: '食べます', PolitePast: '食べました', Imperative: '食べろ',
    Volitional: '食べよう', Potential: '食べられる', Passive: '食べられる',
    Causative: '食べさせる', Provisional: '食べれば', Conditional: '食べたら',
  }
  Object.keys(want).forEach(k => t.equal(o[k], want[k], here + '食べる.' + k))
  t.end()
})

test('irregular-conjugation:', function (t) {
  let suru = conjugateVerb('する')
  t.equal(suru.Negative, 'しない', here + 'する negative')
  t.equal(suru.Polite, 'します', here + 'する polite')
  t.equal(suru.Gerund, 'して', here + 'する te-form')
  t.equal(suru.Potential, 'できる', here + 'する potential')
  t.equal(suru.Passive, 'される', here + 'する passive')
  t.equal(suru.Volitional, 'しよう', here + 'する volitional')
  t.equal(suru.Provisional, 'すれば', here + 'する ba-form')

  let kuru = conjugateVerb('来る')
  t.equal(kuru.Negative, '来ない', here + '来る negative')
  t.equal(kuru.Polite, '来ます', here + '来る polite')
  t.equal(kuru.Imperative, '来い', here + '来る imperative')
  t.equal(kuru.Volitional, '来よう', here + '来る volitional')

  // ある is the one verb whose negative isn't built on a 未然形
  t.equal(conjugateVerb('ある').Negative, 'ない', here + 'ある negative')
  t.equal(conjugateVerb('ある').PastTense, 'あった', here + 'ある past')

  // 勉強する keeps its noun
  t.equal(conjugateVerb('勉強する').PolitePast, '勉強しました', here + '勉強する')
  t.end()
})

test('i-adjective-conjugation:', function (t) {
  let o = conjugateAdjective('高い')
  t.equal(o.Negative, '高くない', here + '高くない')
  t.equal(o.PastTense, '高かった', here + '高かった')
  t.equal(o.PastNegative, '高くなかった', here + '高くなかった')
  t.equal(o.Gerund, '高くて', here + '高くて')
  t.equal(o.Adverb, '高く', here + '高く')
  t.equal(o.Provisional, '高ければ', here + '高ければ')
  // いい is irregular - it inflects as よい
  let ii = conjugateAdjective('いい')
  t.equal(ii.PastTense, 'よかった', here + 'いい → よかった')
  t.equal(ii.Negative, 'よくない', here + 'いい → よくない')
  t.end()
})

test('na-adjective-conjugation:', function (t) {
  let o = conjugateNaAdjective('静か')
  t.equal(o.Adnominal, '静かな', here + '静かな')
  t.equal(o.PastTense, '静かだった', here + '静かだった')
  t.equal(o.Negative, '静かじゃない', here + '静かじゃない')
  t.equal(o.Adverb, '静かに', here + '静かに')
  t.equal(o.Polite, '静かです', here + '静かです')
  t.end()
})
