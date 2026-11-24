import find from './find.js'
import { findForms, toKey, fromKey, copulaForms } from './forms.js'

// return the nth elem of a doc
const getNth = (doc, n) => (typeof n === 'number' ? doc.eq(n) : doc)

// pull-apart a verb-phrase - 読んで + いました
const parse = function (vb) {
  vb.compute('root')
  const terms = vb.docs[0] || []
  // the first word has the meaning, and the last one has the tense
  const main = terms[0]
  const last = terms[terms.length - 1]
  const has = (tag) => terms.some(t => t.tags.has(tag))
  const isCopula = Boolean(main) && main.tags.has('Copula')
  // the copula has no dictionary-form to walk back to - it's だ
  let root = main ? main.root || main.text : ''
  if (isCopula) {
    root = 'だ'
  }
  let tense = null
  if (last && last.tags.has('PastTense')) {
    tense = 'PastTense'
  } else if (last && last.tags.has('PresentTense')) {
    tense = 'PresentTense'
  }
  return {
    root,
    class: isCopula ? null : vb.methods.two.transform.verb.verbClass(root),
    tense,
    negative: has('Negative'),
    polite: has('Polite'),
    copula: isCopula,
    main: vb.terms(0),
    auxiliary: terms.length > 1 ? vb.terms().slice(1) : vb.none(),
  }
}

// swap a word's text in place - .replaceWith() would re-tokenize it
const setText = function (term, str) {
  term.text = str
  term.normal = str
  term.dirty = true
}

const setTag = function (term, tag, bool) {
  if (bool) {
    term.tags.add(tag)
  } else {
    term.tags.delete(tag)
  }
}

// move a verb to another of its forms, changing only what we're asked to
const inflect = function (vb, change) {
  vb.compute('root')
  const terms = vb.docs[0] || []
  // the last word carries the inflection - 読んで [いました]
  const term = terms[terms.length - 1]
  if (!term) {
    return
  }
  const found = findForms(term.text, term.root, term.tags.has('Copula'))
  if (!found) {
    return
  }
  const want = Object.assign(fromKey(found.key), change)
  const str = found.paradigm[toKey(want)]
  if (!str || str === term.text) {
    return
  }
  setText(term, str)
  // keep the tags honest
  setTag(term, 'PastTense', want.past)
  setTag(term, 'PresentTense', !want.past)
  setTag(term, 'Infinitive', str === term.root)
  terms.forEach(t => {
    setTag(t, 'Negative', want.negative)
    setTag(t, 'Polite', want.polite)
    // the tagger hands a helper's past-tense back to its て-form
    if (t !== term) {
      setTag(t, 'PastTense', want.past)
    }
  })
}

const api = function (View) {
  class Verbs extends View {
    constructor(document, pointer, groups) {
      super(document, pointer, groups)
      this.viewType = 'Verbs'
    }
    /** the pieces of each verb - its root, class, tense, polarity and politeness */
    parse(n) {
      return getNth(this, n).map(parse, [])
    }
    json(opts, n) {
      // .json(0) is fine, too
      if (typeof opts === 'number') {
        n = opts
        opts = {}
      }
      return getNth(this, n).map(vb => {
        const json = vb.toView().json(opts)[0] || {}
        const res = parse(vb)
        json.verb = {
          root: res.root,
          class: res.class,
          tense: res.tense,
          negative: res.negative,
          polite: res.polite,
          copula: res.copula,
          auxiliary: res.auxiliary.termList().map(t => t.text).join(''),
        }
        return json
      }, [])
    }
    /** every form of each verb - 食べた gives the paradigm of 食べる */
    conjugate(n) {
      const { verb } = this.methods.two.transform
      return getNth(this, n).map(vb => {
        const res = parse(vb)
        if (res.copula) {
          return Object.assign({}, copulaForms)
        }
        return verb.verb(res.root) || { Infinitive: res.root }
      }, [])
    }
    /** the dictionary-form of each verb - 読んでいました gives 読む */
    toInfinitive(n) {
      const arr = []
      getNth(this, n).forEach(vb => arr.push(parse(vb).root))
      return arr
    }
    /** 食べる → 食べた,  食べません → 食べませんでした */
    toPastTense(n) {
      getNth(this, n).forEach(vb => inflect(vb, { past: true }))
      return this
    }
    /** 食べた → 食べる - japanese has no future tense, so this is that, too */
    toPresentTense(n) {
      getNth(this, n).forEach(vb => inflect(vb, { past: false }))
      return this
    }
    /** 食べる → 食べない,  食べました → 食べませんでした */
    toNegative(n) {
      getNth(this, n).forEach(vb => inflect(vb, { negative: true }))
      return this
    }
    /** 食べない → 食べる */
    toPositive(n) {
      getNth(this, n).forEach(vb => inflect(vb, { negative: false }))
      return this
    }
    /** 丁寧語 - 食べる → 食べます */
    toPolite(n) {
      getNth(this, n).forEach(vb => inflect(vb, { polite: true }))
      return this
    }
    /** 普通体 - 食べます → 食べる */
    toPlain(n) {
      getNth(this, n).forEach(vb => inflect(vb, { polite: false }))
      return this
    }
    /** only the negated verbs - 食べない */
    isNegative() {
      return this.if('#Negative')
    }
    /** only the verbs that aren't negated */
    isPositive() {
      return this.ifNo('#Negative')
    }
    /** only the です/ます verbs */
    isPolite() {
      return this.if('#Polite')
    }
    /** only the plain-form verbs */
    isPlain() {
      return this.ifNo('#Polite')
    }
    /** only the commands - 走れ, 食べてください */
    isImperative() {
      return this.if('#Imperative')
    }
    // overloaded - keep Verb class
    update(pointer) {
      const m = new Verbs(this.document, pointer)
      m._cache = this._cache // share this full thing
      return m
    }
  }
  Verbs.prototype.toPast = Verbs.prototype.toPastTense
  Verbs.prototype.toPresent = Verbs.prototype.toPresentTense

  /** every 動詞 in the document, with its helper-verbs */
  View.prototype.verbs = function (n) {
    const m = new Verbs(this.document, find(this))
    return getNth(m, n)
  }
}
export default api
