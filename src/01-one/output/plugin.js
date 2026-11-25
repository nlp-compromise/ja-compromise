import debug from './debug/index.js'
import english from './compute/english.js'
import root from './compute/root.js'
import { isAuxiliary } from '../../03-three/verbs/find.js'
import { isPunctuation, isLowSurrogate } from '../tokenizer/methods/lib.js'

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

// take the punctuation, and space, off the end of some text
const trimEnd = function (str) {
  let end = str.length
  while (end > 0) {
    let c = str[end - 1]
    if (isLowSurrogate(c) && end > 1) {
      c = str.slice(end - 2, end)
    }
    if (!isPunctuation(c) && !/\s/.test(c)) {
      break
    }
    end -= c.length
  }
  return str.slice(0, end)
}
const trimStart = function (str) {
  let start = 0
  while (start < str.length && (isPunctuation(str[start]) || /\s/.test(str[start]))) {
    start += 1
  }
  return str.slice(start)
}

// compromise drops the full-stop from a match that isn't a whole sentence -
// 'he [walked].' is 'walked'.  it only knows latin punctuation, so do the
// same for 。 and friends - 猫が魚を[食べた。] is 食べた
const partialText = function (text) {
  return function (fmt) {
    const str = text.call(this, fmt)
    const ptr = this.pointer && this.pointer[0]
    if (typeof fmt === 'object' || !ptr || !ptr[1]) {
      return str
    }
    return trimEnd(str)
  }
}

// …and in .out('array'), where each match is a string of its own
const partialArray = function (out) {
  return function (fmt) {
    if (fmt !== 'array') {
      return out.call(this, fmt)
    }
    const document = this.document
    const res = []
    this.fullPointer.forEach(ptr => {
      const [n, start, end] = ptr
      const terms = document[n].slice(start, end)
      let str = terms.reduce((txt, t) => txt + t.pre + t.text + t.post, '').trim()
      // a whole sentence keeps its punctuation
      if (start > 0 || end < document[n].length) {
        str = trimStart(trimEnd(str))
      }
      if (str) {
        res.push(str)
      }
    })
    return res
  }
}

const api = function (View) {
  Object.assign(View.prototype, methods)
  View.prototype.text = partialText(rootText(View.prototype.text))
  View.prototype.out = partialArray(View.prototype.out)
}
export default {
  compute: { english, root },
  api
}