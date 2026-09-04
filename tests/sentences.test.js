import test from 'tape'
import nlp from './_lib.js'
const here = '[sentences] '

test('sentence-split:', function (t) {
  let arr = [
    ['私は学生です。', 1],
    ['少年は店に向かった。 彼はパンを買った。', 2],
    ['一行目です。\n二行目です。', 2],
    ['今日は良い天気です。　明日は雨です。', 2],
  ]
  arr.forEach(([str, want]) => {
    t.equal(nlp(str).length, want, here + str)
  })
  t.end()
})

// compromise 14.16 needs whitespace after 。to end a sentence.
// the next compromise release splits these - un-skip after bumping to it
test.skip('sentence-split without whitespace:', function (t) {
  let arr = [
    ['今日は良い天気です。明日は雨が降るでしょう。', 2],
    ['元気ですか？はい、元気です！', 2],
    ['彼は「行きません。」と言った。それで終わりだ。', 2],
    ['「はい。」「いいえ。」', 2],
    ['東京（日本の首都）は大きい。人口が多い。', 2],
  ]
  arr.forEach(([str, want]) => {
    t.equal(nlp(str).length, want, here + str)
  })
  t.end()
})

const triples = (str) => nlp(str).json({ terms: { pre: true, post: true } })[0].terms.map(t => [t.pre, t.text, t.post])

test('brackets stay out of the word:', function (t) {
  let arr = [
    ['彼は「行きません。」と言った。', [['', '彼', ''], ['', 'は', ''], ['「', '行きません', '。」'], ['', 'と', ''], ['', '言った', '。']]],
    ['東京（日本）は大きい。', [['', '東京', ''], ['（', '日本', '）'], ['', 'は', ''], ['', '大きい', '。']]],
    ['「はい」と言った。', [['「', 'はい', '」'], ['', 'と', ''], ['', '言った', '。']]],
    ['彼は、「はい」と言った。', [['', '彼', ''], ['', 'は', '、'], ['「', 'はい', '」'], ['', 'と', ''], ['', '言った', '。']]],
    ['彼は「はい」「いいえ」と言った。', [['', '彼', ''], ['', 'は', ''], ['「', 'はい', '」'], ['「', 'いいえ', '」'], ['', 'と', ''], ['', '言った', '。']]],
  ]
  arr.forEach(([str, want]) => {
    t.deepEqual(triples(str), want, here + str)
    t.equal(nlp(str).text(), str, here + 'roundtrip ' + str)
  })
  t.end()
})
