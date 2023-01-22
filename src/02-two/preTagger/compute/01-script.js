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

const tagScript = function (terms, setTag, world) {
  const reason = 'script'

  terms.forEach(term => {
    let str = term.text
    if (isHiragana(str)) {
      setTag([term], 'Hiragana', world, null, reason)
      return
    }
    if (isKatakana(str)) {
      setTag([term], 'Katakana', world, null, reason)
      setTag([term], 'Noun', world, null, reason)//pretty safe bet
      return
    }
    if (isKanji(str)) {
      setTag([term], 'Kanji', world, null, reason)
      return
    }
    if (isAscii(str)) {
      setTag([term], 'Ascii', world, null, reason)
      return
    }
  })
}
export default tagScript