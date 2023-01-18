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

const isAscii = function (c) {
  return /[a-zA-Z]/.test(c)
}

const tagScript = function (terms) {
  terms.forEach(term => {
    let str = term.text
    if (isHiragana(str)) {
      term.tags.add('Hiragana')
      return
    }
    if (isKatakana(str)) {
      term.tags.add('Katakana')
      term.tags.add('Noun')//pretty safe
      return
    }
    if (isKanji(str)) {
      term.tags.add('Kanji')
      return
    }
    if (isAscii(str)) {
      term.tags.add('Ascii')
      return
    }
  })
}
export default tagScript