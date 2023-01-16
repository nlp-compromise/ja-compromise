const isAcronym = /[ .][A-Z]\.? *$/i
const hasEllipse = /(?:\u2026|\.{2,}) *$/
const hasLetter = /\p{L}/u
const isOrdinal = /[0-9]\. *$/

/** does this look like a sentence? */
const isSentence = function (str, abbrevs) {
  // must have a letter
  if (hasLetter.test(str) === false) {
    return false
  }
  // check for 'F.B.I.'
  if (isAcronym.test(str) === true) {
    return false
  }
  // german ordinals like '4.'
  if (isOrdinal.test(str) === true) {
    return false
  }
  //check for '...'
  if (hasEllipse.test(str) === true) {
    return false
  }
  let txt = str.replace(/[.!?\u203D\u2E18\u203C\u2047-\u2049] *$/, '')
  let words = txt.split(' ')
  let lastWord = words[words.length - 1].toLowerCase()
  // check for 'Mr.'
  if (abbrevs.hasOwnProperty(lastWord) === true) {
    return false
  }
  // //check for jeopardy!
  // if (blacklist.hasOwnProperty(lastWord)) {
  //   return false
  // }
  return true
}
export default isSentence
