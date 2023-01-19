// https://github.com/darren-lester/nihongo/blob/master/src/analysers.js
// there are 46 of these
const isHiragana = function (ch) {
  return ch >= "\u3040" && ch <= "\u309f";
}

// there are 46 of these
const isKatakana = function (ch) {
  return ch >= "\u30a0" && ch <= "\u30ff";
}

// there are thousands of these
const isKanji = function (ch) {
  return (ch >= "\u4e00" && ch <= "\u9faf") ||
    (ch >= "\u3400" && ch <= "\u4dbf") ||
    ch === "𠮟";
}

const isNumber = function (c) {
  return c >= '0' && c <= '9';
}

const isAscii = function (c) {
  return /[a-zA-Z0-9]/.test(c)
}


const getType = function (c) {
  if (isHiragana(c)) {
    return 'hiragana'
  }
  if (isKatakana(c)) {
    return 'katakana'
  }
  if (isKanji(c)) {
    return 'kanji'
  }
  // if (isNumber(c)) {
  //   return 'number'
  // }
  if (isAscii(c)) {
    return 'ascii'
  }
}

export { isHiragana, isKatakana, isKanji, isNumber, isAscii, getType }