import toNumber from './kanji-number.js'
import toKanji, { toDigits } from './to-kanji.js'
import counters from '../../../data/lexicon/counters.js'
import { signOf, minusSign } from './sign.js'

const isWide = /[０-９]/
const isKanjiNumeral = /[〇零一二三四五六七八九十百千万億兆壱弐参拾]/

// pull the number out of a match, along with how it was written
const parse = function (view) {
  const terms = view.docs[0] || []
  let term = terms.find(t => typeof t.number === 'number')
  if (!term) {
    // not computed yet - read it off the text
    term = terms[0]
    const num = term ? toNumber(term.text) : null
    return { num, term, kanji: term ? isKanjiNumeral.test(term.text) : false, wide: false }
  }
  return {
    num: term.number,
    term,
    kanji: isKanjiNumeral.test(term.text),
    wide: isWide.test(term.text),
    // 1,000 - thousands were grouped with a comma
    grouped: /[,，]/.test(term.text),
  }
}

// 1234 → 1,234 - or １，２３４, if that is how it was typed
const withCommas = function (num, wide) {
  const str = num.toLocaleString('en-US', { maximumFractionDigits: 20 })
  if (!wide) {
    return str
  }
  return str.replace(/[0-9]/g, d => String.fromCharCode(d.charCodeAt(0) + 0xfee0)).replace('.', '．').replace(/,/g, '，')
}

// the new text brings its own sign, so remove the old one - '-|5' → '-4'
// returns the number that is left to write
const clearSign = function (view, term, num) {
  const terms = view.document[view.fullPointer[0][0]]
  const i = terms.indexOf(term)
  const kind = signOf(terms, i)
  if (kind === 'pre') {
    term.pre = term.pre.replace(minusSign, '')
  } else if (kind === 'post') {
    terms[i - 1].post = terms[i - 1].post.replace(minusSign, '')
  } else if (kind === 'word') {
    // マイナス5 → マイナス4 - the word is already there
    if (num < 0) {
      return Math.abs(num)
    }
    // ... or has nothing left to say - マイナス5 → 3
    terms[i - 1].text = ''
    terms[i - 1].normal = ''
  }
  return num
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

// write a number back in the shape it was found in
const write = function (view, num, form) {
  const { term, kanji, wide, grouped } = parse(view)
  // there is no way to write 1.5 as 2分の1
  if (!term || typeof num !== 'number' || view.has('#Fraction')) {
    return view
  }
  const left = clearSign(view, term, num)
  let str
  if (form === 'kanji' || (form === undefined && kanji)) {
    str = toKanji(left)
  } else if (grouped && form === undefined) {
    str = withCommas(left, wide)
  } else {
    str = toDigits(left, form === undefined ? wide : false)
  }
  if (str === null) {
    return view
  }
  setText(term, str, num)
  return view
}


const addMethod = function (View) {
  class Numbers extends View {
    constructor(document, pointer, groups) {
      super(document, pointer, groups)
      this.viewType = 'Numbers'
    }
    /** the parsed number, plus how it was written */
    parse(n) {
      // an empty array when there's nothing - compromise's .map() would hand back a view
      return this.getNth(n).map(parse, [])
    }
    /** the value of each number - 「二十三」 gives 23 */
    get(n) {
      // the second .map is a plain Array.map - compromise's own .map() only
      // unwraps to an array when the callback returns strings or objects
      return this.getNth(n).map(parse, []).map(o => o.num)
    }
    json(n) {
      const opts = typeof n === 'object' ? n : {}
      return this.getNth(n).map(m => {
        const json = m.toView().json(opts)[0]
        const found = parse(m)
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
        const { num } = parse(m)
        if (num !== null) {
          write(m, num, 'digits')
        }
      })
      return this
    }
    /** write each number in kanji - 23 becomes 二十三 */
    toText() {
      this.forEach(m => {
        const { num } = parse(m)
        if (num !== null) {
          write(m, num, 'kanji')
        }
      })
      return this
    }
    /** add thousands-separators - 1234 becomes 1,234 */
    toLocaleString() {
      this.forEach(m => {
        const { num, term } = parse(m)
        if (num === null || !term) {
          return
        }
        // the default would round 1234.5678 off to three decimals
        setText(term, num.toLocaleString(undefined, { maximumFractionDigits: 20 }), num)
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
        const { num } = parse(m)
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
        const { num } = parse(m)
        return num > min && num < max
      })
    }
    update(pointer) {
      const m = new Numbers(this.document, pointer)
      m._cache = this._cache
      return m
    }
  }

  /** every number in the document */
  View.prototype.numbers = function (n) {
    // 2分の1 is one number
    const found = this.match('(#Fraction 分 の #Fraction|#Value+)')
    // punctuation between two numbers makes them two numbers - 1、2、3
    const pointers = []
    found.fullPointer.forEach(ptr => {
      const [sentence, start, end] = ptr
      const terms = this.document[sentence]
      let from = start
      for (let i = start; i < end - 1; i += 1) {
        if (terms[i].post !== '' || terms[i + 1].pre !== '') {
          pointers.push([sentence, from, i + 1])
          from = i + 1
        }
      }
      pointers.push([sentence, from, end])
    })
    const m = new Numbers(this.document, pointers)
    return typeof n === 'number' ? m.eq(n) : m
  }
  /** .numbers() alias, to match english compromise */
  View.prototype.values = View.prototype.numbers

  /** every 助数詞 in the document */
  View.prototype.counters = function (n) {
    const m = this.match('#Counter')
    return typeof n === 'number' ? m.eq(n) : m
  }
  /** every 円/ドル amount */
  View.prototype.money = function (n) {
    // 1,000円, or ¥1,000
    const m = this.match('(#Value+ #Currency|#Money)')
    return typeof n === 'number' ? m.eq(n) : m
  }
  /** every percentage */
  View.prototype.percentages = function (n) {
    const m = this.match('#Value+ #Percent')
    return typeof n === 'number' ? m.eq(n) : m
  }
}

export default { api: addMethod }
export { counters }
