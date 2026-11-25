// longest-match segmentation.
//
// this used to build a character-trie over the whole lexicon, which cost
// ~40mb of nodes.  a lookup in the lexicon plus a bounded backwards scan is the
// same answer for a fraction of the memory.

import kanjiRun from './kanji-run.js'

const isWord = Object.prototype.hasOwnProperty

const splitUp = function (txt, lexicon, maxLen) {
  const out = []
  let i = 0
  while (i < txt.length) {
    // two or more kanji in a row are handled as a unit
    const run = kanjiRun(txt, i, lexicon, maxLen)
    if (run !== null) {
      run.pieces.forEach(str => out.push(str))
      i = run.end
      continue
    }
    const max = Math.min(maxLen, txt.length - i)
    let found = ''
    for (let len = max; len > 1; len -= 1) {
      const str = txt.substr(i, len)
      if (isWord.call(lexicon, str)) {
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
