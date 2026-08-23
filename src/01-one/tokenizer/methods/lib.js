// https://github.com/darren-lester/nihongo/blob/master/src/analysers.js

const isHiragana = function (ch) {
  return ch >= '぀' && ch <= 'ゟ'
}

const isKatakana = function (ch) {
  // ・ (U+30FB) sits inside the katakana block but is punctuation - it
  // separates the parts of a foreign name, ジョン・スミス
  if (ch === '・' || ch === '゠') {
    return false
  }
  return (ch >= '゠' && ch <= 'ヿ') || (ch >= 'ㇰ' && ch <= 'ㇿ')
}

const isKanji = function (ch) {
  return (
    (ch >= '一' && ch <= '龯') ||
    (ch >= '㐀' && ch <= '䶿') ||
    ch === '々' || // 々 - the repeat-mark, as in 人々
    ch === '〆' ||
    ch === 'ヶ' ||
    ch === '𠮟'
  )
}

const isNumber = function (c) {
  return (c >= '0' && c <= '9') || (c >= '０' && c <= '９') // half & full-width
}

const isAscii = function (c) {
  return /[a-zA-Z]/.test(c) || (c >= 'Ａ' && c <= 'ｚ')
}

// 、。！？ and friends
const isPunctuation = function (c) {
  return /[、。，．！？!?,.:：;；・…〜~「」『』（）()【】〔〕《》〈〉\s]/.test(c)
}

const getType = function (c) {
  // ー is the 長音符 - it continues whatever script it follows
  if (c === 'ー' || c === 'ｰ') {
    return 'katakana'
  }
  if (isHiragana(c)) {
    return 'hiragana'
  }
  if (isKatakana(c)) {
    return 'katakana'
  }
  if (isKanji(c)) {
    return 'kanji'
  }
  if (isNumber(c)) {
    return 'number'
  }
  if (isAscii(c)) {
    return 'ascii'
  }
  if (isPunctuation(c)) {
    return 'punctuation'
  }
  return 'other'
}

export { isHiragana, isKatakana, isKanji, isNumber, isAscii, isPunctuation, getType }
