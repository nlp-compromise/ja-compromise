import test from 'tape'
import nlp from '../../_lib.js'
const here = '[kana] '

const terms = (str) => nlp(str).json()[0].terms.map(t => t.text)

test('the first match is not always the right one:', function (t) {
  const arr = [
    // not きょう|はい|いて|んき
    ['きょうはいいてんきです', ['きょう', 'は', 'いい', 'てんき', 'です']],
    // not 私|はた|また|ま|これ
    ['私はたまたまこれを見た', ['私', 'は', 'たまたま', 'これ', 'を', '見た']],
  ]
  arr.forEach(([str, want]) => {
    t.deepEqual(terms(str), want, here + str)
  })
  t.end()
})

test('unknown kana words:', function (t) {
  const arr = [
    ['わたしのなまえはたなかです', ['わたし', 'の', 'なまえ', 'は', 'たなか', 'です']],
    ['ともだちとあそびにいきました', ['ともだち', 'と', 'あそび', 'に', 'いきました']],
    ['くるまをうんてんする', ['くるま', 'を', 'うんてん', 'する']],
    ['でんしゃでがっこうにいく', ['でんしゃ', 'で', 'がっこう', 'に', 'いく']],
    ['私はぐでたまが好き', ['私', 'は', 'ぐでたま', 'が', '好き']],
    // …but they don't swallow the words beside them
    ['わたしはにほんじんです', ['わたし', 'は', 'にほんじん', 'です']],
    ['東京へ行ったことがあります', ['東京', 'へ', '行った', 'こと', 'が', 'あります']],
    ['彼だけが', ['彼', 'だけ', 'が']],
    ['静かな部屋', ['静か', 'な', '部屋']],
  ]
  arr.forEach(([str, want]) => {
    t.deepEqual(terms(str), want, here + str)
  })
  t.end()
})

test('a long vowel stays in its word:', function (t) {
  const arr = [
    ['らーめんを食べたい', ['らーめん', 'を', '食べたい']],
    ['すごーい', ['すごーい']],
    ['コンピューターを使う', ['コンピューター', 'を', '使う']],
  ]
  arr.forEach(([str, want]) => {
    t.deepEqual(terms(str), want, here + str)
  })
  t.end()
})

test('latin words are left alone:', function (t) {
  const arr = [
    ['decimalを使う', ['decimal', 'を', '使う']],
    ['Googleで検索する', ['Google', 'で', '検索', 'する']],
    ['iPhone15を買った', ['iPhone', '15', 'を', '買った']],
  ]
  arr.forEach(([str, want]) => {
    t.deepEqual(terms(str), want, here + str)
  })
  t.end()
})
