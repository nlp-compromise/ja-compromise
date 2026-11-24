import test from 'tape'
import nlp from '../../_lib.js'
const here = '[verbs] '

test('.verbs() finds each verb:', function (t) {
  const doc = nlp('猫が魚を食べた。犬は走る。')
  t.equal(doc.verbs().viewType, 'Verbs', here + 'is a Verbs view')
  t.equal(doc.verbs().length, 2, here + 'two verbs')
  t.equal(doc.verbs(1).termList()[0].text, '走る', here + '.verbs(1)')
  t.equal(doc.verbs(9).found, false, here + '.verbs(9)')
  t.equal(doc.verbs().eq(0).viewType, 'Verbs', here + 'stays a Verbs view')
  t.equal(nlp('').verbs().found, false, here + 'empty document')
  t.end()
})

test('.verbs() keeps a helper-verb with its verb:', function (t) {
  const terms = (str) => nlp(str).verbs().map(m => m.termList().map(o => o.text).join(''), [])
  t.deepEqual(terms('本を読んでいました'), ['読んでいました'], here + 'て + いる')
  t.deepEqual(terms('読んでしまった'), ['読んでしまった'], here + 'て + しまう')
  t.deepEqual(terms('ゆっくり食べてください'), ['食べてください'], here + 'て + ください')
  // ..but two verbs in a row are still two verbs
  t.deepEqual(terms('見て食べた'), ['見て', '食べた'], here + 'て + another verb')
  t.end()
})

test('.verbs().toInfinitive():', function (t) {
  t.deepEqual(nlp('寿司を食べました').verbs().toInfinitive(), ['食べる'], here + 'one verb')
  t.deepEqual(nlp('本を読んでいました').verbs().toInfinitive(), ['読む'], here + 'not the helper-verb')
  t.deepEqual(nlp('猫が魚を食べた。犬は走る。').verbs().toInfinitive(1), ['走る'], here + 'nth')
  t.end()
})

test('.verbs().parse() and .json():', function (t) {
  let res = nlp('本を読んでいました').verbs().parse()[0]
  t.equal(res.root, '読む', here + 'root')
  t.equal(res.class, 'godan', here + 'class')
  t.equal(res.tense, 'PastTense', here + 'tense')
  t.equal(res.polite, true, here + 'polite')
  t.equal(res.negative, false, here + 'negative')
  t.equal(res.main.text(), '読んで', here + 'main')
  t.equal(res.auxiliary.text(), 'いました', here + 'auxiliary')

  res = nlp('魚を食べない').verbs().parse()[0]
  t.equal(res.negative, true, here + 'negative')
  t.equal(res.tense, 'PresentTense', here + 'present')
  t.equal(res.auxiliary.found, false, here + 'no auxiliary')

  const json = nlp('彼は来なかった。学生です。').verbs().json()
  t.equal(json.length, 2, here + 'json for each verb')
  t.equal(json[0].verb.root, '来る', here + 'json root')
  t.equal(json[0].verb.class, 'kuru', here + 'json class')
  t.equal(json[0].verb.negative, true, here + 'json negative')
  t.equal(json[1].verb.copula, true, here + 'json copula')
  t.equal(json[1].verb.root, 'だ', here + 'copula root')
  t.equal(nlp('彼は来なかった。学生です。').verbs().json(1).length, 1, here + '.json(n)')
  t.end()
})

test('.verbs().conjugate():', function (t) {
  const res = nlp('手紙を書きました').verbs().conjugate()
  t.equal(res.length, 1, here + 'one paradigm')
  t.deepEqual(res[0], nlp.conjugate('書く'), here + 'same as nlp.conjugate()')
  t.equal(nlp('学生でした').verbs().conjugate()[0].PastTense, 'だった', here + 'copula')
  t.end()
})

test('verb transformations:', function (t) {
  const arr = [
    // [text, past, present, negative, positive, polite, plain]
    ['寿司を食べる。', '寿司を食べた。', '寿司を食べる。', '寿司を食べない。', '寿司を食べる。', '寿司を食べます。', '寿司を食べる。'],
    ['本を書いた', '本を書いた', '本を書く', '本を書かなかった', '本を書いた', '本を書きました', '本を書いた'],
    ['行きませんでした', '行きませんでした', '行きません', '行きませんでした', '行きました', '行きませんでした', '行かなかった'],
    ['彼は来なかった', '彼は来なかった', '彼は来ない', '彼は来なかった', '彼は来た', '彼は来ませんでした', '彼は来なかった'],
    ['勉強しました', '勉強しました', '勉強します', '勉強しませんでした', '勉強しました', '勉強しました', '勉強した'],
    // the helper-verb is the one that changes
    ['本を読んでいました。', '本を読んでいました。', '本を読んでいます。', '本を読んでいませんでした。', '本を読んでいました。', '本を読んでいました。', '本を読んでいた。'],
    ['走っている', '走っていた', '走っている', '走っていない', '走っている', '走っています', '走っている'],
    // these are verbs in their own right
    ['食べられる', '食べられた', '食べられる', '食べられない', '食べられる', '食べられます', '食べられる'],
    ['食べたい', '食べたかった', '食べたい', '食べたくない', '食べたい', '食べたいです', '食べたい'],
    // copula
    ['学生です', '学生でした', '学生です', '学生じゃありません', '学生です', '学生です', '学生だ'],
    ['学生じゃない', '学生じゃなかった', '学生じゃない', '学生じゃない', '学生だ', '学生じゃありません', '学生じゃない'],
    ['学生ではありません', '学生ではありませんでした', '学生ではありません', '学生ではありません', '学生です', '学生ではありません', '学生ではない'],
    // no tense to change
    ['食べよう', '食べよう', '食べよう', '食べよう', '食べよう', '食べよう', '食べよう'],
    ['早く走れ', '早く走れ', '早く走れ', '早く走れ', '早く走れ', '早く走れ', '早く走れ'],
  ]
  const fns = ['toPastTense', 'toPresentTense', 'toNegative', 'toPositive', 'toPolite', 'toPlain']
  arr.forEach(a => {
    fns.forEach((fn, i) => {
      const doc = nlp(a[0])
      doc.verbs()[fn]()
      t.equal(doc.text(), a[i + 1], here + `${a[0]} .${fn}()`)
    })
  })
  t.end()
})

test('transformations keep the tags right:', function (t) {
  let doc = nlp('寿司を食べる')
  doc.verbs().toPastTense()
  t.equal(doc.has('#PastTense'), true, here + 'now past')
  t.equal(doc.has('#PresentTense'), false, here + 'not present')
  t.equal(doc.has('#Infinitive'), false, here + 'not infinitive')
  t.equal(doc.compute('root').text('root'), '寿司を食べる', here + 'root is kept')
  doc.verbs().toNegative().toPolite()
  t.equal(doc.text(), '寿司を食べませんでした', here + 'chained')
  t.equal(doc.verbs().isNegative().found, true, here + 'now negative')
  t.equal(doc.verbs().isPolite().found, true, here + 'now polite')

  doc = nlp('本を読んでいました')
  doc.verbs().toPresentTense()
  t.equal(doc.has('#PastTense'), false, here + 'て-form loses its tense, too')
  t.end()
})

test('only the nth verb is changed:', function (t) {
  const doc = nlp('猫が魚を食べる。犬は走る。')
  doc.verbs().toPastTense(1)
  t.equal(doc.text(), '猫が魚を食べる。犬は走った。', here + 'toPastTense(1)')
  t.end()
})

test('verb filters:', function (t) {
  const doc = nlp('魚を食べない。水を飲みます。早く走れ。')
  const txt = (m) => m.termList().map(o => o.text)
  t.deepEqual(txt(doc.verbs().isNegative()), ['食べない'], here + 'isNegative')
  t.deepEqual(txt(doc.verbs().isPositive()), ['飲みます', '走れ'], here + 'isPositive')
  t.deepEqual(txt(doc.verbs().isPolite()), ['飲みます'], here + 'isPolite')
  t.deepEqual(txt(doc.verbs().isPlain()), ['食べない', '走れ'], here + 'isPlain')
  t.deepEqual(txt(doc.verbs().isImperative()), ['走れ'], here + 'isImperative')
  t.end()
})
