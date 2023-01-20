import buildTrie from './trie/build.js'
import lexicon from '../../lexicon/lexicon.js'
import splitUp from './trie/split-up.js'
import joinUp from './join-up.js'

let words = Object.keys(lexicon)
let trie = buildTrie(words)

const tokenize = function (txt) {
  // split by know-word segments
  let arr = splitUp(txt, trie)
  // join-up neighbouring chars 
  arr = joinUp(arr)

  return arr
}
export default tokenize
// console.log(tokenize('小さな子供は食料品店に歩いた'))

