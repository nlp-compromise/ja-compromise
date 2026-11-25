// compromise puts a space between the words it inserts and their neighbours -
// 'walks' + 'quickly' → 'walks quickly'.  japanese has no space there, so
// 東京 + や京都 must come out as 東京や京都, and not 「東京や京都 に」.

const japanese = /[\p{sc=Han}\p{sc=Hiragana}\p{sc=Katakana}ー、-〟＀-￯]/u
const endSpace = / $/

const isJapanese = (c) => c !== undefined && c !== '' && japanese.test(c)

// did the given words bring their own trailing space with them?
const ownSpace = function (input) {
  if (typeof input === 'string') {
    return /\s$/.test(input)
  }
  if (input && input.isView) {
    const terms = input.docs[0] || []
    const last = terms[terms.length - 1]
    return !last || /\s$/.test(last.post)
  }
  return true
}

// 「たろう は のりこ を…」 is written with spaces, on purpose
const isSpaced = function (terms) {
  return terms.slice(0, -1).some(t => /\s/.test(t.post))
}

const lastChar = (term) => {
  const str = term.text + term.post.replace(endSpace, '')
  return [...str].pop()
}
const firstChar = (term) => [...(term.pre + term.text)][0]

const wrapInsert = function (fn) {
  return function (input, opts) {
    const document = this.document
    // remember how things were, in the sentences we're about to change
    const before = new Map()
    const spaced = new Set()
    const touched = [...new Set(this.fullPointer.map(p => p[0]))]
    touched.forEach(n => {
      const terms = document[n] || []
      terms.forEach(t => before.set(t, t.post))
      if (isSpaced(terms)) {
        spaced.add(n)
      }
    })
    const keepNew = ownSpace(input)
    const res = fn.call(this, input, opts)
    touched.forEach(n => {
      if (spaced.has(n)) {
        return
      }
      const terms = document[n] || []
      terms.forEach((term, i) => {
        if (!endSpace.test(term.post)) {
          return
        }
        // was this space put here by the insert?
        const isOld = before.has(term)
        if (isOld && endSpace.test(before.get(term))) {
          return
        }
        if (!isOld && keepNew) {
          return
        }
        // latin words still want their space - 'Google Maps'
        const next = terms[i + 1]
        if (isJapanese(lastChar(term)) || (next && isJapanese(firstChar(next)))) {
          term.post = term.post.replace(endSpace, '')
        }
      })
    })
    return res
  }
}

const api = function (View) {
  const insertAfter = wrapInsert(View.prototype.insertAfter)
  const insertBefore = wrapInsert(View.prototype.insertBefore)
  View.prototype.insertAfter = insertAfter
  View.prototype.insertBefore = insertBefore
  View.prototype.append = insertAfter
  View.prototype.insert = insertAfter
  View.prototype.prepend = insertBefore
}
export default api
