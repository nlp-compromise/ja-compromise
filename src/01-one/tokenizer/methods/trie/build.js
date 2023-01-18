import { makeTrie, findMatch, addWord } from './trie.js'
import lexicon from '../../../lexicon/lexicon.js'


let words = Object.keys(lexicon)
// let words = ['abcd', 'abc', 'zz', 'gh']

let trie = makeTrie(words)

const getGreedy = function (chars, i, node) {
  let best = []
  let n = i
  while (node.more[chars[n]]) {
    // console.log('✅', chars[n])
    if (node.more[chars[n]].end) {
      best = chars.slice(i, n + 1)
    }
    node = node.more[chars[n]]
    n += 1
  }
  if (best.length === 0) {
    // console.log('❌', chars[i])
    return chars[i]
  }
  return best.join('')
}


const splitUp = function (txt, root) {
  let chars = txt.split('')
  let out = []
  for (let i = 0; i < chars.length; i += 1) {
    let run = getGreedy(chars, i, root)
    out.push(run)
    i += run.length - 1
  }
  return out
}
export default trie

console.log(splitUp('O4ことごとくと0', trie))
// console.log(splitUp('abcdefgg', trie))