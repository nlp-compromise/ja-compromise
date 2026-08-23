import test from 'tape'
import nlp from './_lib.js'
const here = '[tag] '

// assert an exact per-token tag, rather than 'the sentence matched somehow'
const check = function (t, str, pairs) {
  let doc = nlp(str)
  let terms = doc.json()[0].terms
  pairs.forEach(([word, tag]) => {
    let term = terms.find(o => o.text === word)
    if (!term) {
      t.fail(here + `'${word}' not a term of '${str}' (got ${terms.map(o => o.text).join('/')})`)
      return
    }
    t.ok(term.tags.includes(tag), here + `${str}   ${word} → #${tag}`)
  })
}

test('particles are particles:', function (t) {
  check(t, '私は本を読む', [['は', 'TopicParticle'], ['を', 'CaseParticle'], ['私', 'Topic'], ['本', 'Object']])
  check(t, '駅から学校まで歩く', [['から', 'CaseParticle'], ['まで', 'CaseParticle']])
  check(t, '彼の車', [['の', 'AdnominalParticle'], ['彼', 'Possessive']])
  // sentence-final particles are mood, not verbs
  check(t, '今日は暑いね', [['ね', 'SentenceParticle']])
  check(t, 'これは何ですか', [['か', 'SentenceParticle']])
  check(t, '早く行くよ', [['よ', 'SentenceParticle']])
  // と joins nouns, but quotes verbs
  check(t, '犬と猫', [['と', 'Conjunction']])
  check(t, '行くと言った', [['と', 'QuotativeParticle']])
  t.end()
})

test('tense and politeness:', function (t) {
  check(t, '映画を見ました', [['見ました', 'PastTense'], ['見ました', 'Polite'], ['見ました', 'Verb']])
  check(t, '映画を見た', [['見た', 'PastTense'], ['見た', 'Verb']])
  check(t, '映画を見ない', [['見ない', 'Negative'], ['見ない', 'PresentTense']])
  check(t, '映画を見ませんでした', [['見ませんでした', 'PastTense'], ['見ませんでした', 'Negative'], ['見ませんでした', 'Polite']])
  check(t, '本を読んでいる', [['読んでいる', 'Progressive']])
  check(t, '手紙を書きたい', [['書きたい', 'Desire']])
  check(t, '早く走れ', [['走れ', 'Imperative']])
  check(t, '一緒に行こう', [['行こう', 'Volitional']])
  t.end()
})

test('voice:', function (t) {
  check(t, '先生に褒められました', [['褒められました', 'Passive'], ['褒められました', 'PastTense']])
  check(t, '子供に野菜を食べさせる', [['食べさせる', 'Causative']])
  check(t, '日本語が話せます', [['話せます', 'Potential'], ['話せます', 'Polite']])
  t.end()
})

test('adjectives keep their own tense:', function (t) {
  // 高かった is a past-tense *adjective* - it must not become a verb
  check(t, 'この本は高かった', [['高かった', 'Adjective'], ['高かった', 'PastTense']])
  check(t, 'この本は高くない', [['高くない', 'Adjective'], ['高くない', 'Negative']])
  check(t, '天気がいい', [['いい', 'Adjective']])
  check(t, 'ベッドはよかった', [['よかった', 'Adjective'], ['よかった', 'PastTense']])
  // な-adjectives are a different class
  check(t, '静かな人', [['静か', 'NaAdjective'], ['な', 'AdnominalParticle']])
  check(t, '部屋はきれいでした', [['きれい', 'NaAdjective']])
  t.end()
})

test('negatives are not adjectives:', function (t) {
  // 'ends in い' used to tag every negative verb as an adjective
  check(t, '分からない', [['分からない', 'Verb'], ['分からない', 'Negative']])
  check(t, '行かない', [['行かない', 'Verb'], ['行かない', 'Negative']])
  check(t, '食べたくない', [['食べたくない', 'Verb'], ['食べたくない', 'Negative']])
  t.end()
})

test('the copula:', function (t) {
  check(t, '私は学生です', [['です', 'Copula'], ['です', 'PresentTense'], ['です', 'Polite']])
  check(t, '私は学生でした', [['でした', 'Copula'], ['でした', 'PastTense']])
  check(t, '私は学生だ', [['だ', 'Copula'], ['だ', 'PresentTense']])
  check(t, '私は学生ではありません', [['ではありません', 'Copula'], ['ではありません', 'Negative']])
  t.end()
})

test('nouns:', function (t) {
  check(t, '田中さんが来ました', [['田中', 'Person'], ['さん', 'Honorific']])
  check(t, '子供たちが遊ぶ', [['子供たち', 'Plural']])
  check(t, 'これは何ですか', [['これ', 'Demonstrative'], ['何', 'QuestionWord']])
  check(t, '行ったことがある', [['こと', 'FormalNoun']])
  check(t, 'コーヒーを飲む', [['コーヒー', 'Noun'], ['コーヒー', 'Katakana']])
  t.end()
})

test('suru-verbs:', function (t) {
  check(t, '日本語を勉強します', [['勉強します', 'Verb'], ['勉強します', 'Polite']])
  check(t, '毎日運動している', [['運動している', 'Progressive']])
  t.end()
})

test('no term is left untagged:', function (t) {
  let arr = [
    '私は毎朝コーヒーを飲みます。',
    '昨日、友達と映画を見に行った。',
    'この問題はとても難しいですね。',
    '雨が降っているので、傘を持って行ってください。',
    '彼女は日本語がとても上手です。',
  ]
  arr.forEach(str => {
    nlp(str).json()[0].terms.forEach(term => {
      t.ok(term.tags.length > 0, here + `'${term.text}' in '${str}' has a tag`)
    })
  })
  t.end()
})
