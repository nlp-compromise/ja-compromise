import { isHiragana, isKatakana, isKanji, isNumber, isAscii } from './lib.js'

let markers = [
  // 'は',// - topic marker
  // 'が',// - subject
  // 'を',// - direct object
  // 'の',// - possessive (reverse "of"), question mark (plain)
  // 'な',// - marks an adjective
  //'も',// - "also" (substitutes for wa, ga, or w
  //'で',// - "by means of", "in"/"at" for actio
  //'に',// - indirect object, "in"/"at" for existen
  //'と',// - "and", object of "say" or "thin
  //'や',// - "and" for a li
  //'へ',// - destination "t
  //'か',// - question mark (polit

  '・', //word-splitter
  '、',//comma
  '：', //colon
  ' ',//space
  '\t',//tab
  '\n',//newline
]

let always = new Set(markers)

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
  if (isNumber(c)) {
    return 'number'
  }
  if (isAscii(c)) {
    return 'ascii'
  }
}

// naiive split by Hiragana/Katakana/Kanji segments
const tokenize = function (txt) {
  let chars = txt.split('')
  let arr = []
  let past = null
  let run = []
  // loop through every character
  for (let i = 0; i < chars.length; i += 1) {
    let c = chars[i]
    // clear split punctuation
    if (always.has(c)) {
      run.push(c)
      arr.push(run.join(''))
      run = []
      past = null
      continue
    }
    // which script is the character?
    let type = getType(c)

    if (past == null) {
      past = type
    }
    // keep it going
    if (type === past) {
      run.push(c)
      continue
    }
    // start of a new type
    if (run.length > 0) {
      arr.push(run.join(''))
    }
    run = [c]
    past = type
  }
  if (run.length > 0) {
    arr.push(run.join(''))
  }
  return arr//.filter(s => s.length > 1)
}
export default tokenize
// console.log(tokenize('小さな子供は食料品店に歩いた'))

