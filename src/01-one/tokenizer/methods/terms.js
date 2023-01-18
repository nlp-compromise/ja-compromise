import buildTrie from './trie/build.js'
import lexicon from '../../lexicon/lexicon.js'
import splitUp from './trie/split-up.js'

let words = Object.keys(lexicon)

let trie = buildTrie(words)
// naiive split by Hiragana/Katakana/Kanji segments
const tokenize = function (txt) {
  let chars = txt.split('')
  return splitUp(txt, trie)
}
export default tokenize
// console.log(tokenize('小さな子供は食料品店に歩いた'))

