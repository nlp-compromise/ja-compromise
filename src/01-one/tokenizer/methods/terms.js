import buildTrie from './trie/build.js'
import lexicon from '../../lexicon/lexicon.js'
import splitUp from './trie/split-up.js'
import { getType } from './lib.js'

let words = Object.keys(lexicon)

let trie = buildTrie(words)



let punctuation = new Set([
  '・', //word-splitter
  '、',//comma
  '：', //colon
  ' ',//space
  '\t',//tab
  '\n',//newline
])

// join-up unknown chars by kanji/hiragana/kanji
const joinUp = function (arr) {
  for (let i = 0; i < arr.length; i += 1) {
    let c = arr[i]
    if (c !== null && c.length === 1) { //add ! lexicon[c]
      let type = getType(c)
      // race-ahead and join forward
      for (let o = i + 1; o < arr.length; o += 1) {
        let k = arr[o]
        if (k.length === 1 && getType(k) === type) {
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

const tokenize = function (txt) {
  // split by know-word segments
  let arr = splitUp(txt, trie)
  // join-up neighbouring chars 
  arr = joinUp(arr)

  return arr
}
export default tokenize
// console.log(tokenize('小さな子供は食料品店に歩いた'))

