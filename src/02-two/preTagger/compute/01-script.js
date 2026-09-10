import { isHiragana, isKatakana, isKanji, isAscii, isNumber } from '../../../01-one/tokenizer/methods/lib.js'

const every = function (str, fn) {
  for (let i = 0; i < str.length; i += 1) {
    if (!fn(str[i])) {
      return false
    }
  }
  return str.length > 0
}

const tagScript = function (terms, setTag, world) {
  const reason = 'script'
  terms.forEach(term => {
    let str = term.text
    if (every(str, isHiragana)) {
      setTag([term], 'Hiragana', world, null, reason)
      return
    }
    if (every(str, c => isKatakana(c) || c === 'ー')) {
      setTag([term], 'Katakana', world, null, reason)
      // a katakana word is nearly always a loanword noun
      if (term.tags.size <= 1) {
        setTag([term], 'Noun', world, null, reason)
      }
      return
    }
    if (every(str, isKanji)) {
      setTag([term], 'Kanji', world, null, reason)
      return
    }
    if (every(str, isNumber)) {
      setTag([term], 'Value', world, null, reason)
      setTag([term], 'Cardinal', world, null, reason)
      return
    }
    if (every(str, isAscii)) {
      setTag([term], 'Ascii', world, null, reason)
      return
    }
    // a mixed kanji+hiragana word (書いた, 食べる) - no single script tag
  })
}
export default tagScript
