import { conjugateVerb } from '../../01-one/conjugate/index.js'
import { isAspect, isHelper } from '../../02-two/preTagger/compute/03-verbs.js'

// 食べて + ください is one request, too
const isRequest = new Set(['ください', '下さい'])
const kudasaru = conjugateVerb('くださる') || {}
Object.keys(kudasaru).forEach(k => typeof kudasaru[k] === 'string' && isRequest.add(kudasaru[k]))

// does this verb only finish the て-form in front of it?
// 読んで + いました is one verb, but 見て + 食べた is two
const isAuxiliary = function (term, prev) {
  if (!prev || !prev.tags.has('Gerund')) {
    return false
  }
  return isAspect.has(term.text) || isHelper.has(term.text) || isRequest.has(term.text)
}

// each verb, along with any helper-verbs that hang off of it
const find = function (view) {
  const pointers = []
  view.match('#Verb+').fullPointer.forEach(ptr => {
    const [n, start, end] = ptr
    const terms = view.document[n]
    let from = start
    for (let i = start + 1; i < end; i += 1) {
      if (!isAuxiliary(terms[i], terms[i - 1])) {
        pointers.push([n, from, i])
        from = i
      }
    }
    pointers.push([n, from, end])
  })
  return pointers
}
export default find
