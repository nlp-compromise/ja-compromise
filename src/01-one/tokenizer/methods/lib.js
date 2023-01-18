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
  return /[a-zA-Z]/.test(c)
}

export { isHiragana, isKatakana, isKanji, isNumber, isAscii }