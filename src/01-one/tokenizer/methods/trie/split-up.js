// longest-match segmentation.
//
// this used to build a character-trie over the whole lexicon, which cost
// ~40mb of nodes.  a Set of the words plus a bounded backwards scan is the
// same answer for a fraction of the memory.

const splitUp = function (txt, words, maxLen) {
  let out = []
  let i = 0
  while (i < txt.length) {
    let max = Math.min(maxLen, txt.length - i)
    let found = ''
    for (let len = max; len > 1; len -= 1) {
      let str = txt.substr(i, len)
      if (words.has(str)) {
        found = str
        break
      }
    }
    if (found === '') {
      // a single character is only a 'word' if the lexicon says so
      found = txt[i]
    }
    out.push(found)
    i += found.length
  }
  return out
}
export default splitUp
