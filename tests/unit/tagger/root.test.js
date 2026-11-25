import test from 'tape'
import nlp from '../../_lib.js'
const here = '[root] '

// the root of one word, inside a sentence
const rootOf = (str, word) => {
  const term = nlp(str).compute('root').docs[0].find(o => o.text === word)
  return term ? term.root : undefined
}

test('root-match:', function (t) {
  const arr = [
    ['昨日、寿司を食べました', '{食べる}', '食べました'],
    ['猫が魚を食べている', '{食べる}', '食べている'],
    ['寿司を食べたい', '{食べる}', '食べたい'],
    ['東京に行きませんでした', '{行く}', '行きませんでした'],
    ['手紙を書いた', '{書く}', '書いた'],
    ['本が読まれた', '{読む}', '読まれた'],
    ['彼は来なかった', '{来る}', '来なかった'],
    ['日本語を勉強しました', '{勉強する}', '勉強しました'],
    // adjectives
    ['この本は高かった', '{高い}', '高かった'],
    ['この本は高くない', '{高い}', '高くない'],
    ['今日は寒くて暗い', '{寒い}', '寒くて'],
    ['料理は美味しくなかった', '{美味しい}', '美味しくなかった'],
    // the dictionary-form matches itself
    ['寿司を食べる', '{食べる}', '食べる'],
    ['この本は高い', '{高い}', '高い'],
    // ..and so does a word that doesn't inflect
    ['東京に行きました', '{東京}', '東京'],
    // a root sits in a longer match like any other token
    ['猫が魚を食べました', '魚 を {食べる}', '魚を食べました'],
    ['猫が魚を食べました', '#Noun #Particle {食べる}', '魚を食べました'],
  ]
  arr.forEach(([str, match, want]) => {
    const m = nlp(str).compute('root').match(match)
    t.equal(m.text(), want, here + str + ' - ' + match)
  })
  t.end()
})

test('root does not over-match:', function (t) {
  t.equal(nlp('寿司を食べました').compute('root').has('{飲む}'), false, here + 'a different verb')
  t.equal(nlp('この本は高かった').compute('root').has('{安い}'), false, here + 'a different adjective')
  // nothing has a root until it's asked for
  t.equal(nlp('寿司を食べました').has('{食べる}'), false, here + 'not computed by default')
  t.end()
})

test('verb roots:', function (t) {
  const arr = [
    ['食べました', '食べる'], ['食べている', '食べる'], ['食べさせる', '食べる'],
    ['見ました', '見る'], ['見られる', '見る'],
    ['書いた', '書く'], ['書け', '書く'], ['泳ぎましょう', '泳ぐ'],
    ['飲んだ', '飲む'], ['飲みたい', '飲む'], ['買わなかった', '買う'],
    ['走っている', '走る'], ['行きませんでした', '行く'],
    ['勉強しました', '勉強する'], ['来なかった', '来る'],
    // a passive goes all the way back, not just to 読まれる
    ['読まれた', '読む'],
  ]
  arr.forEach(([str, want]) => {
    t.equal(rootOf(str, str), want, here + str + ' → ' + want)
  })
  t.end()
})

test('adjective roots:', function (t) {
  const arr = [
    ['高かった', '高い'], ['高くない', '高い'], ['新しかった', '新しい'],
    ['美味しくなかった', '美味しい'], ['寒くて', '寒い'], ['楽しかった', '楽しい'],
    ['嬉しくない', '嬉しい'], ['面白ければ', '面白い'],
  ]
  arr.forEach(([str, want]) => {
    t.equal(rootOf(str, str), want, here + str + ' → ' + want)
  })
  // a な-adjective's stem is already its dictionary-form
  t.equal(rootOf('静かな部屋', '静か'), '静か', here + '静か')
  t.end()
})

// the copula is a paradigm of its own - だった is not a godan だく
test('copula roots:', function (t) {
  t.equal(rootOf('部屋は静かだった', 'だった'), 'だ', here + 'だった → だ')
  t.equal(rootOf('彼は元気ではない', 'ではない'), 'だ', here + 'ではない → だ')
  t.equal(rootOf('学生でした', 'でした'), 'です', here + 'でした → です')
  const arr = [
    // plain
    ['学生だ', 'だ', 'だ'], ['学生だった', 'だった', 'だ'], ['明日は雨だろう', 'だろう', 'だ'],
    ['雨だったら', 'だったら', 'だ'], ['静かなら', 'なら', 'だ'],
    // the negative is one term, whichever way it's said
    ['学生ではない', 'ではない', 'だ'], ['学生じゃない', 'じゃない', 'だ'], ['学生でない', 'でない', 'だ'],
    ['学生ではなかった', 'ではなかった', 'だ'], ['学生じゃなかった', 'じゃなかった', 'だ'],
    // polite
    ['学生です', 'です', 'です'], ['明日は雨でしょう', 'でしょう', 'です'],
    ['学生ではありません', 'ではありません', 'です'], ['学生じゃありませんでした', 'じゃありませんでした', 'です'],
    // written
    ['吾輩は猫である', 'である', 'である'], ['彼は学生であった', 'であった', 'である'],
    ['猫であって', 'であって', 'である'], ['猫であれば', 'であれば', 'である'],
  ]
  arr.forEach(([str, word, want]) => {
    t.equal(rootOf(str, word), want, here + str + ' - ' + word + ' → ' + want)
  })
  t.equal(nlp('部屋は静かだった').compute('root').has('{だ}'), true, here + '{だ}')
  t.equal(nlp('部屋は静かだった').compute('root').text('root'), '部屋は静かだ', here + `.text('root')`)
  t.end()
})

test('nlp.deconjugate() knows the copula:', function (t) {
  const arr = [
    ['だった', 'だ'], ['だろう', 'だ'], ['ではない', 'だ'], ['じゃない', 'だ'], ['でない', 'だ'],
    ['でした', 'です'], ['でしょう', 'です'], ['である', 'である'], ['であった', 'である'],
    // ..and real verbs with the same endings are left alone
    ['抱いた', '抱く'], ['泳いだ', '泳ぐ'], ['読んだ', '読む'], ['死んだ', '死ぬ'], ['待った', '待つ'],
  ]
  arr.forEach(([str, want]) => {
    t.equal(nlp.deconjugate(str).root, want, here + str + ' → ' + want)
  })
  t.ok(nlp.deconjugate('だった').tags.includes('Copula'), here + 'tagged as a copula')
  t.equal(rootOf('子供を抱いた', '抱いた'), '抱く', here + '抱いた in a sentence')
  t.equal(rootOf('本を読んだ', '読んだ'), '読む', here + '読んだ in a sentence')
  t.end()
})

test('an unknown verb is walked back by its endings:', function (t) {
  // none of these are in the lexicon - the deconjugator works from the okurigana
  const arr = [
    ['囁いた', '囁く'], ['頷きます', '頷く'], ['呟きました', '呟く'], ['躓いた', '躓く'],
    ['捗らない', '捗る'], ['佇んでいた', '佇む'], ['弄っている', '弄る'], ['貪った', '貪る'],
  ]
  arr.forEach(([str, want]) => {
    t.equal(rootOf(str, str), want, here + str + ' → ' + want)
    t.equal(nlp(str).compute('root').has('{' + want + '}'), true, here + '{' + want + '}')
  })
  t.equal(rootOf('彼は静かに頷きました', '頷きました'), '頷く', here + 'inside a sentence')
  t.end()
})

test('some words are their own root:', function (t) {
  const arr = [
    ['東京の天気', ['東京', 'の', '天気']],
    ['猫が魚を', ['猫', 'が', '魚', 'を']],
    ['コーヒーとパン', ['コーヒー', 'と', 'パン']],
    ['ゆっくり歩く', ['ゆっくり', '歩く']],
    ['本を二十三冊', ['本', 'を', '二十三', '冊']],
    ['りんごを1.5個', ['りんご', 'を', '1.5', '個']],
    ['ありがとう', ['ありがとう']],
  ]
  arr.forEach(([str, want]) => {
    const doc = nlp(str).compute('root')
    t.deepEqual(doc.docs[0].map(o => o.root), want, here + str)
  })
  t.end()
})

test('root output:', function (t) {
  const str = '昨日、寿司を食べました。この本は高かった。'
  const doc = nlp(str).compute('root')
  t.equal(doc.text('root'), '昨日、寿司を食べる。この本は高い。', here + `.text('root')`)
  // computing a root never changes the text
  t.equal(doc.text(), str, here + '.text() is unchanged')
  t.deepEqual(doc.json()[0].terms.map(o => o.root), ['昨日', '寿司', 'を', '食べる'], here + 'root is in .json()')
  // every term gets one
  t.ok(doc.docs.every(terms => terms.every(o => typeof o.root === 'string' && o.root !== '')), here + 'no term is left without a root')
  // running it twice is harmless
  t.equal(doc.compute('root').text('root'), '昨日、寿司を食べる。この本は高い。', here + 'idempotent')
  t.end()
})

test('.toInfinitive():', function (t) {
  t.deepEqual(nlp('寿司を食べました。水を飲んだ').toInfinitive(), ['寿司を食べる', '水を飲む'], here + 'one string per sentence')
  t.deepEqual(nlp('寿司を食べました').verbs().toInfinitive(), ['食べる'], here + 'on a selection')
  t.deepEqual(nlp('この本は高かった').adjectives().toInfinitive(), ['高い'], here + 'adjectives')
  t.deepEqual(nlp('').toInfinitive(), [], here + 'empty document')
  const doc = nlp('寿司を食べました')
  doc.toInfinitive()
  t.equal(doc.text(), '寿司を食べました', here + 'the document is not changed')
  t.end()
})
