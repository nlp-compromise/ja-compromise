import { isPlural, canPlural, toPlural, toSingular } from './plural.js'

// return the nth elem of a doc
const getNth = (doc, n) => (typeof n === 'number' ? doc.eq(n) : doc)

const getTerm = (m) => (m.docs[0] || [])[0]

// what the noun is doing in its sentence is said by the particle after it
const getParticle = function (m) {
  const ptr = m.fullPointer[0]
  if (!ptr) {
    return null
  }
  const next = (m.document[ptr[0]] || [])[ptr[2]]
  return next && next.tags.has('Particle') ? next.text : null
}

const parse = function (m) {
  const term = getTerm(m)
  const plural = isPlural(term)
  return {
    root: plural ? toSingular(term.text) : term.text,
    plural,
    particle: getParticle(m),
  }
}

// swap a word's text in place - .replaceWith() would re-tokenize it
const setText = function (term, str, plural) {
  term.text = str
  term.normal = str
  term.dirty = true
  delete term.root
  if (plural) {
    term.tags.add('Plural')
    term.tags.delete('Singular')
  } else {
    term.tags.delete('Plural')
  }
}

const api = function (View) {
  class Nouns extends View {
    constructor(document, pointer, groups) {
      super(document, pointer, groups)
      this.viewType = 'Nouns'
    }
    /** each noun's bare form, its number, and the particle that follows it */
    parse(n) {
      return getNth(this, n).map(parse, [])
    }
    json(opts, n) {
      // .json(0) is fine, too
      if (typeof opts === 'number') {
        n = opts
        opts = {}
      }
      return getNth(this, n).map(m => {
        const json = m.toView().json(opts)[0] || {}
        json.noun = parse(m)
        return json
      }, [])
    }
    /** both forms of each noun - most have only the one */
    conjugate(n) {
      return getNth(this, n).map(m => {
        const term = getTerm(m)
        if (isPlural(term)) {
          return { singular: toSingular(term.text), plural: term.text }
        }
        return { singular: term.text, plural: canPlural(term) ? toPlural(term.text) : term.text }
      }, [])
    }
    /** only the nouns marked as plural - 子供たち, 人々 */
    isPlural(n) {
      return getNth(this, n).filter(m => isPlural(getTerm(m)))
    }
    /** only the nouns without a plural marker */
    isSingular(n) {
      return getNth(this, n).filter(m => !isPlural(getTerm(m)))
    }
    /** 子供 → 子供たち - only for people, the rest are already both */
    toPlural(n) {
      getNth(this, n).forEach(m => {
        const term = getTerm(m)
        if (canPlural(term)) {
          setText(term, toPlural(term.text), true)
        }
      })
      return this
    }
    /** 子供たち → 子供 */
    toSingular(n) {
      getNth(this, n).forEach(m => {
        const term = getTerm(m)
        if (isPlural(term)) {
          setText(term, toSingular(term.text), false)
        }
      })
      return this
    }
    // overloaded - keep Noun class
    update(pointer) {
      const m = new Nouns(this.document, pointer)
      m._cache = this._cache // share this full thing
      return m
    }
  }

  /** every 名詞 in the document */
  View.prototype.nouns = function (n) {
    const m = this.match('#Noun')
    return getNth(new Nouns(this.document, m.pointer), n)
  }
}
export default api
