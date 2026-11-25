import { isHiragana, isKatakana, isKanji, isAscii, isNumber, isEmoji, isEmojiJoiner, charAt } from '../../../01-one/tokenizer/methods/lib.js'

const every = function (str, fn) {
  for (let i = 0; i < str.length; i += 1) {
    const c = charAt(str, i)
    if (!fn(c)) {
      return false
    }
    i += c.length - 1
  }
  return str.length > 0
}

const isUrl = /^(?:https?:\/\/|www\.)\S+$/i
const isEmail = /^[\w.+-]+@[\w-]+(?:\.[\w-]+)+$/
const isPhone = /^\d{2,5}-\d{1,4}-\d{3,4}$/

const tagScript = function (terms, setTag, world) {
  const reason = 'script'
  terms.forEach(term => {
    // the plain-width form - ｺﾝﾋﾟｭｰﾀ is katakana, and １２３ is a number
    const str = term.normal || term.text
    if (every(str, c => isEmoji(c) || isEmojiJoiner(c))) {
      setTag([term], 'Emoji', world, null, reason)
      return
    }
    if (isUrl.test(str)) {
      setTag([term], 'Url', world, null, reason)
      return
    }
    if (isEmail.test(str)) {
      setTag([term], 'Email', world, null, reason)
      return
    }
    if (isPhone.test(str)) {
      setTag([term], 'PhoneNumber', world, null, reason)
      return
    }
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
