import toNumber from './kanji-number.js'
import toKanji, { toDigits } from './to-kanji.js'
import counters from '../../../lexicon/counters.js'

const isWide = /[０-９]/
const isKanjiNumeral = /[〇零一二三四五六七八九十百千万億兆壱弐参拾]/

// pull the number out of a match, along with how it was written
const parse = function (view) {
  let terms = view.docs[0] || []
  let term = terms.find(t => typeof t.number === 'number')
  if (!term) {
    // not computed yet - read it off the text
    term = terms[0]
    let num = term ? toNumber(term.text) : null
    return { num, term, kanji: term ? isKanjiNumeral.test(term.text) : false, wide: false }
  }
  return {
    num: term.number,
    term,
    kanji: isKanjiNumeral.test(term.text),
    wide: isWide.test(term.text),
  }
}

// write a number back in the shape it was found in
const write = function (view, num, form) {
  let { term, kanji, wide } = parse(view)
  if (!term || typeof num !== 'number') {
    return view
  }
  let str
  if (form === 'kanji' || (form === undefined && kanji)) {
    str = toKanji(num)
  } else {
    str = toDigits(num, form === undefined ? wide : false)
  }
  if (str === null) {
    return view
  }
  setText(term, str, num)
  return view
}

// swap a term's text in place.  .replaceWith() would put a space between the
// number and its counter, and japanese doesn't use one - 五冊, never 五 冊
const setText = function (term, str, num) {
  term.text = str
  term.normal = str.toLowerCase()
  if (typeof num === 'number') {
    term.number = num
  }
}

const addMethod = function (View) {
  class Numbers extends View {
    constructor(document, pointer, groups) {
      super(document, pointer, groups)
      this.viewType = 'Numbers'
    }
    /** the parsed number, plus how it was written */
    parse(n) {
      return this.getNth(n).map(parse)
    }
    /** the value of each number - 「二十三」 gives 23 */
    get(n) {
      // the second .map is a plain Array.map - compromise's own .map() only
      // unwraps to an array when the callback returns strings or objects
      return this.getNth(n).map(parse).map(o => o.num)
    }
    json(n) {
      let opts = typeof n === 'object' ? n : {}
      return this.getNth(n).map(m => {
        let json = m.toView().json(opts)[0]
        let found = parse(m)
        json.number = { num: found.num, counter: m.units().text() || null }
        return json
      }, [])
    }
    /** the 助数詞 attached to each number - 五冊 gives 冊 */
    units() {
      return this.growRight('#Counter').match('#Counter$')
    }
    /** only the ordinals - 三番目 */
    isOrdinal() {
      return this.if('#Ordinal')
    }
    /** only the cardinals */
    isCardinal() {
      return this.if('#Cardinal')
    }
    /** write each number in digits - 二十三 becomes 23 */
    toNumber() {
      this.forEach(m => {
        let { num } = parse(m)
        if (num !== null) {
          write(m, num, 'digits')
        }
      })
      return this
    }
    /** write each number in kanji - 23 becomes 二十三 */
    toText() {
      this.forEach(m => {
        let { num } = parse(m)
        if (num !== null) {
          write(m, num, 'kanji')
        }
      })
      return this
    }
    /** add thousands-separators - 1234 becomes 1,234 */
    toLocaleString() {
      this.forEach(m => {
        let { num, term } = parse(m)
        if (num === null || !term) {
          return
        }
        setText(term, num.toLocaleString(), num)
      })
      return this
    }
    /** replace each number with this one, keeping its script */
    set(n) {
      if (typeof n !== 'number') {
        return this
      }
      this.forEach(m => write(m, n))
      return this
    }
    add(n) {
      if (typeof n !== 'number') {
        return this
      }
      this.forEach(m => {
        let { num } = parse(m)
        if (num !== null) {
          write(m, num + n)
        }
      })
      return this
    }
    subtract(n) {
      return this.add(-1 * n)
    }
    increment() {
      return this.add(1)
    }
    decrement() {
      return this.add(-1)
    }
    isEqual(n) {
      return this.filter(m => parse(m).num === n)
    }
    greaterThan(n) {
      return this.filter(m => parse(m).num > n)
    }
    lessThan(n) {
      return this.filter(m => parse(m).num < n)
    }
    between(min, max) {
      return this.filter(m => {
        let { num } = parse(m)
        return num > min && num < max
      })
    }
    update(pointer) {
      let m = new Numbers(this.document, pointer)
      m._cache = this._cache
      return m
    }
  }

  /** every number in the document */
  View.prototype.numbers = function (n) {
    let m = this.match('#Value+')
    m = new Numbers(this.document, m.pointer)
    return typeof n === 'number' ? m.eq(n) : m
  }
  /** .numbers() alias, to match english compromise */
  View.prototype.values = View.prototype.numbers

  /** every 助数詞 in the document */
  View.prototype.counters = function (n) {
    let m = this.match('#Counter')
    return typeof n === 'number' ? m.eq(n) : m
  }
  /** every 円/ドル amount */
  View.prototype.money = function (n) {
    let m = this.match('#Value+ #Currency')
    return typeof n === 'number' ? m.eq(n) : m
  }
  /** every percentage */
  View.prototype.percentages = function (n) {
    let m = this.match('#Value+ #Percent')
    return typeof n === 'number' ? m.eq(n) : m
  }
}

export default { api: addMethod }
export { counters }
