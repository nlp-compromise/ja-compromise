// japanese sentence-boundaries that the english parser misses.
// this runs after the english sentence-splitter, on its results
const MAX_QUOTE = 500
const MAX_MERGE = 8
const quotes = [['「', '」'], ['『', '』'], ['（', '）']]
const kana = '\\p{sc=Han}\\p{sc=Hiragana}\\p{sc=Katakana}ー'
const endsNewline = /\n\s*$/
const hasLetter = /\p{L}/u

// a sentence can end without any whitespace -
const boundary = new RegExp(
  [
    // 'うそ!信じられない' - ascii punctuation
    `(?<=[${kana}])[!?]+(?=[${kana}「『])`,
    // 'そうですか．わかりました' - a fullwidth period (but not '３．１４')
    `(?<=[${kana}])[．.](?=[${kana}「『])`,
  ].join('|'),
  'gu'
)

const count = (str, char) => str.split(char).length - 1

// are we inside a quotation, or some brackets?
const isOpen = function (str) {
  return quotes.some(([open, close]) => count(str, open) > count(str, close))
}

// put a quotation back together, when it has many sentences in it
const quoteMerge = function (arr) {
  const out = []
  for (let i = 0; i < arr.length; i += 1) {
    let str = arr[i]
    if (isOpen(str)) {
      let merged = str
      for (let n = i + 1; n < arr.length && n - i < MAX_MERGE; n += 1) {
        if (endsNewline.test(merged)) {
          break
        }
        merged += arr[n]
        if (merged.length > MAX_QUOTE) {
          break
        }
        if (!isOpen(merged)) {
          // the quotation closes here
          str = merged
          i = n
          break
        }
      }
    }
    out.push(str)
  }
  return out
}

const resplit = function (str) {
  const out = []
  let start = 0
  for (const m of str.matchAll(boundary)) {
    const end = m.index + m[0].length
    const before = str.slice(start, end)
    // don't split inside a quotation, or leave a piece with no words in it
    if (!hasLetter.test(before) || isOpen(before)) {
      continue
    }
    out.push(before)
    start = end
  }
  out.push(str.slice(start))
  return out
}

// 'Mr.' is not the end of a sentence, even with no space before it - '彼はMr. Smithです'
const beforeLatin = new RegExp(`^.*[${kana}、。](?=[A-Za-z]+\\. *$)`, 'u')
const wrapIsSentence = function (isSentence) {
  return function (str, abbrevs, foundLetter) {
    return isSentence(str.replace(beforeLatin, ' '), abbrevs, foundLetter)
  }
}

// a closing quote after the stop is not a new sentence - '「行く！」「だめ！」'
// (but a new line is)
const endsQuote = /[。！？｡!?．.][」』）】〕》〉”]+[^\S\n]*$/
const closeMerge = function (arr) {
  const out = []
  arr.forEach(str => {
    const last = out[out.length - 1]
    if (last !== undefined && endsQuote.test(last)) {
      out[out.length - 1] += str
      return
    }
    out.push(str)
  })
  return out
}

/** add our own passes to the end of the english sentence-splitter */
const wrap = function (splitSentences) {
  return function (text, world) {
    let arr = splitSentences(text, world)
    arr = quoteMerge(arr)
    arr = arr.flatMap(resplit)
    arr = closeMerge(arr)
    return arr
  }
}

export { wrap, wrapIsSentence }
