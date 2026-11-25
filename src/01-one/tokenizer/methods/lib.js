// which script is a character written in?
// every function here takes one whole character - which may be two utf-16
// units long (𠮷, 😀).  use charAt() to read one out of a string.

const astralHan = /^\p{sc=Han}$/u

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
  if (ch === undefined) {
    return false
  }
  if (ch.length === 2) {
    // the rarer kanji live outside the first 65k characters - 𠮷, 𩸽
    return astralHan.test(ch)
  }
  return (
    (ch >= '一' && ch <= '龯') ||
    (ch >= '㐀' && ch <= '䶿') ||
    ch === '々' || // 々 - the repeat-mark, as in 人々
    ch === '〆' ||
    ch === 'ヶ'
  )
}

const isNumber = function (c) {
  return (c >= '0' && c <= '9') || (c >= '０' && c <= '９') // half & full-width
}

const isAscii = function (c) {
  return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= 'Ａ' && c <= 'Ｚ') || (c >= 'ａ' && c <= 'ｚ')
}

// 😀, and the invisible characters that join emoji together
const pictograph = /^[\p{Extended_Pictographic}\p{Regional_Indicator}\p{Emoji_Modifier}]$/u
const emojiJoiners = new Set(['\u200d', '\ufe0f', '\u20e3'])
const isEmoji = (c) => c !== undefined && pictograph.test(c) && !isNumber(c) && c !== '#' && c !== '*'
const isEmojiJoiner = (c) => emojiJoiners.has(c)

// ---- punctuation ----
// there is one rule, and this is it: anything that isn't a letter, a number,
// or a mark on a letter is punctuation.  punctuation is never a term, or part
// of one - it's kept in the `pre` and `post` of the words on either side.
// (a few things are words made of symbols - 5%, C++ - see ./whitespace.js)
const notWord = /^[\p{P}\p{S}\p{Z}\p{C}]$/u
// …except these, which are read aloud - 5% is 五パーセント
const symbolWords = new Set(['%', '％', '‰'])
const isPunctuation = function (c) {
  return c !== undefined && notWord.test(c) && !isEmoji(c) && !symbolWords.has(c)
}
// 「『（【 and “ - these belong to the word after them, not the one before.
// so do the signs that are written in front of things - ¥500, #タグ, @名前, 〒100
const opener = /^[\p{Ps}\p{Pi}\p{Sc}#@〒]$/u
const isOpener = (c) => c !== undefined && opener.test(c)

const isLowSurrogate = (c) => c >= '\udc00' && c <= '\udfff'
const isHighSurrogate = (c) => c >= '\ud800' && c <= '\udbff'

/** the whole character at i - both halves of it, if it has two */
const charAt = function (txt, i) {
  const c = txt[i]
  if (c !== undefined && isHighSurrogate(c) && i + 1 < txt.length && isLowSurrogate(txt[i + 1])) {
    return c + txt[i + 1]
  }
  return c
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

// ---- width ----
// ｺﾝﾋﾟｭｰﾀ, Ｇｏｏｇｌｅ and １２３ are コンピュータ, Google and 123, typed differently.
// the text is never changed, but words are looked-up by their plain form.

// ﾞ and ﾟ follow their kana, as does a combining ゛
const dakuten = '\u3099'
const handakuten = '\u309a'
const isVoicing = (c) => c === 'ﾞ' || c === 'ﾟ' || c === dakuten || c === handakuten
// full-width and half-width forms, and the other compatibility blocks
const wide = /[\uff00-\uffef\u2000-\u2fff\u3200-\u33ff\uf900-\ufaff]/

/**
 * the plain-width form of some text, and where each of its characters came from.
 * `map[i]` is the index, in the original, of the i'th character of `norm`,
 * so that `txt.slice(map[a], map[b])` is the original of `norm.slice(a, b)`.
 */
const normalize = function (txt) {
  // most text has nothing to change
  if (!wide.test(txt) && !txt.includes(dakuten) && !txt.includes(handakuten)) {
    return { norm: txt, map: null }
  }
  let norm = ''
  const map = []
  let i = 0
  while (i < txt.length) {
    let unit = charAt(txt, i)
    while (i + unit.length < txt.length && isVoicing(txt[i + unit.length])) {
      unit += txt[i + unit.length]
    }
    let plain = unit.normalize('NFKC')
    // ㈱ is '(株)', and ㍻ is '平成' - but one character can't become three
    // and still be found again.  those are left as they are
    if (plain.length !== 1) {
      plain = unit
    }
    for (let k = 0; k < plain.length; k += 1) {
      map.push(plain.length === unit.length ? i + k : i)
    }
    norm += plain
    i += unit.length
  }
  map.push(txt.length)
  return { norm, map }
}

export {
  isHiragana, isKatakana, isKanji, isNumber, isAscii, isPunctuation, isOpener,
  isEmoji, isEmojiJoiner, isLowSurrogate, charAt, getType, normalize
}
