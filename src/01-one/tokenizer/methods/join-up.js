import lexicon from '../../lexicon/lexicon.js'
import { getType } from './lib.js'

let punctuation = new Set([
  '・', //word-splitter
  '、',//comma
  '：', //colon
  ' ',//space
  '\t',//tab
  '\n',//newline
])

let suffixes = {
  'たち': true //plural suffix
}

// join-up unknown chars by kanji/hiragana/kanji
const joinUp = function (arr) {
  for (let i = 0; i < arr.length; i += 1) {
    let c = arr[i]
    if (suffixes[c] && arr[i - 1]) {
      arr[i - 1] += c
      arr[i] = null
    }
    if (c !== null && c.length === 1) { //add ! lexicon[c]
      let type = getType(c)
      // race-ahead and join forward
      for (let o = i + 1; o < arr.length; o += 1) {
        let k = arr[o]
        if (k.length === 1 && getType(k) === type && !lexicon[k]) {
          arr[i] += k
          arr[o] = null
          // stop at any punctuation mark
          if (punctuation.has(k)) {
            i = o - 1
            break
          }
        } else {
          i = o - 1
          break
        }
      }
    }
  }
  arr = arr.filter(c => c)
  return arr
}

export default joinUp
