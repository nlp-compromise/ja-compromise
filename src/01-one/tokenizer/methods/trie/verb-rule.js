import deconjugate from '../../../conjugate/deconjugate.js'
import { isHiragana, isKanji } from '../lib.js'

// the lexicon lists the common forms of every verb it knows, but a verb can
// stack endings well past any list - 食べさせられたくなかった.
// a known verb, and an ending that it really takes, is one word too.

const hasWord = Object.prototype.hasOwnProperty
const MAX = 14
const MIN = 3
// nothing ends just before one of these
const cantFollow = new Set('ぁぃぅぇぉっゃゅょゎー')
// a て-form and its helper are two terms - 読んで|いる - so the rules may
// not join them.  (the contractions are one word - 読んでる, 読んでた)
const twoTerms = /[てで]い(?:る|ます|た)$/

const isVerb = function (lexicon, str) {
  if (!hasWord.call(lexicon, str)) {
    return false
  }
  const tags = lexicon[str]
  return tags === 'Verb' || (Array.isArray(tags) && tags.includes('Verb'))
}

/**
 * the longest inflected verb that begins at i - or null.
 * it has to be longer than `past`, and not already in the lexicon.
 */
const verbRule = function (txt, i, lexicon, past = i) {
  // a verb is some kanji (or none), and then kana
  let stop = i
  while (stop < txt.length && stop - i < MAX && isKanji(txt[stop])) {
    stop += 1
  }
  const kana = stop
  while (stop < txt.length && stop - i < MAX && isHiragana(txt[stop])) {
    stop += 1
  }
  const isKnown = (w) => isVerb(lexicon, w)
  for (let j = stop; j >= i + MIN && j > kana && j > past; j -= 1) {
    const str = txt.slice(i, j)
    if (hasWord.call(lexicon, str) || cantFollow.has(txt[j]) || twoTerms.test(str)) {
      continue
    }
    const found = deconjugate(str, isKnown)
    if (found && found.guess !== true && isKnown(found.root)) {
      return str
    }
  }
  return null
}
export default verbRule
