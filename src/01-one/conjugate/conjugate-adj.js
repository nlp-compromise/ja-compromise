// い-adjectives inflect for tense and polarity - they are not 'just adjectives'.
// 高い → 高くない → 高かった → 高くなかった.  the copula does not carry that tense.

// いい/良い is the one truly irregular い-adjective - it inflects as よい
const irregularStem = { 'いい': 'よ', '良い': '良', 'よい': 'よ' }

const conjugateAdjective = function (word) {
  if (!word || !word.endsWith('い') || word.length < 2) {
    return null
  }
  let stem = irregularStem[word] !== undefined ? irregularStem[word] : word.slice(0, -1)
  return {
    Infinitive: word,               // 高い
    PresentTense: word,
    Negative: stem + 'くない',       // 高くない
    PastTense: stem + 'かった',      // 高かった
    PastNegative: stem + 'くなかった', // 高くなかった
    Gerund: stem + 'くて',           // 高くて
    Adverb: stem + 'く',             // 高く
    Provisional: stem + 'ければ',     // 高ければ
    Presumptive: stem + 'かろう',
    Polite: word + 'です',
    PolitePast: stem + 'かったです',
    PoliteNegative: stem + 'くないです',
    Superlative: stem + 'すぎる',     // 高すぎる
    Impression: stem + 'そう',        // 高そう
    Nominal: stem + 'さ',             // 高さ
  }
}

// な-adjectives (形容動詞) are stored bare - 静か - and inflect with the copula
const conjugateNaAdjective = function (word) {
  if (!word) {
    return null
  }
  return {
    Infinitive: word,
    Adnominal: word + 'な',           // 静かな
    PresentTense: word + 'だ',        // 静かだ
    Negative: word + 'じゃない',       // 静かじゃない
    PastTense: word + 'だった',        // 静かだった
    PastNegative: word + 'じゃなかった',
    Gerund: word + 'で',              // 静かで
    Adverb: word + 'に',              // 静かに
    Polite: word + 'です',
    PolitePast: word + 'でした',
    PoliteNegative: word + 'じゃありません',
    Provisional: word + 'なら',
  }
}

export default conjugateAdjective
export { conjugateNaAdjective }
