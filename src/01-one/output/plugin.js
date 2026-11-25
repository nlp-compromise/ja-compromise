import debug from './debug/index.js'
import english from './compute/english.js'
import root from './compute/root.js'
import { isAuxiliary } from '../../03-three/verbs/find.js'

const methods = { debug }

// 走って|いる is two terms, but its dictionary-form is one word - 走る.
// in .text('root'), a helper-verb has nothing of its own to add
const rootText = function (text) {
  return function (fmt) {
    if (fmt !== 'root') {
      return text.call(this, fmt)
    }
    this.compute('root')
    const hidden = []
    this.docs.forEach(terms => {
      terms.forEach((term, i) => {
        if (isAuxiliary(term, terms[i - 1])) {
          hidden.push({ term, was: term.root, normal: term.normal })
          term.root = ''
          term.normal = ''
        }
      })
    })
    const str = text.call(this, fmt)
    hidden.forEach(o => {
      o.term.root = o.was
      o.term.normal = o.normal
    })
    return str
  }
}

const api = function (View) {
  Object.assign(View.prototype, methods)
  View.prototype.text = rootText(View.prototype.text)
}
export default {
  compute: { english, root },
  api
}