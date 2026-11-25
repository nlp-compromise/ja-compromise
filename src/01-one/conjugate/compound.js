// 複合動詞 - a verb's stem, and a second verb that finishes it off.
// 走り出す 'start running', 食べ始める 'begin to eat', 飲みすぎる 'drink too much'.
// the pair is one verb, and it conjugates on its second half.
//
// only a small set of verbs do this freely - these are them:
const second = new Set([
  '出す', '始める', '始まる', '続ける', '続く', '終わる', '終える', '過ぎる', 'すぎる',
  '込む', '合う', '合わせる', '直す', '切る', '切れる', '掛ける', 'かける', '上げる', '上がる',
  '入れる', '付ける', 'つける', '回る', '回す', '替える', '換える', '返す', '返る', '取る',
  '忘れる', '慣れる', '損なう', '尽くす', '抜く', '通す', '歩く', '飛ばす', '倒す',
])

const isSecondVerb = (dict) => second.has(dict)

export { isSecondVerb }
