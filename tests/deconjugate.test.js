import test from 'tape'
import nlp from './_lib.js'
const here = '[deconjugate] '

test('surface-form back to dictionary-form:', function (t) {
  let arr = [
    ['書きました', '書く'], ['書いた', '書く'], ['書かない', '書く'], ['書いて', '書く'],
    ['読んでいる', '読む'], ['読ませる', '読む'], ['読まれた', '読む'],
    ['走って', '走る'], ['走らなかった', '走る'], ['走りながら', '走る'],
    ['食べました', '食べる'], ['食べたい', '食べる'], ['食べさせる', '食べる'],
    ['行った', '行く'], ['行きませんでした', '行く'],
    ['しました', 'する'], ['して', 'する'], ['勉強しました', '勉強する'],
    ['来ました', '来る'], ['来なかった', '来る'],
    // 話した is 話す, not 話する - a one-kanji head means a godan verb
    ['話した', '話す'], ['出した', '出す'], ['貸します', '貸す'],
  ]
  arr.forEach(([str, want]) => {
    let got = nlp.deconjugate(str)
    t.equal(got && got.root, want, here + str + ' → ' + want)
  })
  t.end()
})

test('.compute("root") reports dictionary-forms:', function (t) {
  let arr = [
    ['映画を見ました。', '映画を見る。'],
    ['この本は高かった。', 'この本は高い。'],
    ['彼は走っている。', '彼は走る。'],
  ]
  arr.forEach(([str, want]) => {
    t.equal(nlp(str).compute('root').text('root'), want, here + str)
  })
  t.end()
})

test('a plain noun is its own root:', function (t) {
  let doc = nlp('東京の天気').compute('root')
  t.deepEqual(doc.docs[0].map(o => o.root), ['東京', 'の', '天気'], here + 'nouns unchanged')
  t.end()
})
