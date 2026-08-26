import { conjugateVerb, conjugateAdjective, conjugateNaAdjective, deconjugate, verbClass } from '../conjugate/index.js'
import lexicon, { roots } from './lexicon.js'

const isKnown = (w) => lexicon.hasOwnProperty(w)

export default function (View) {
  /** every verb in the document */
  View.prototype.verbs = function () {
    return this.match('#Verb')
  }
  /** every noun in the document */
  View.prototype.nouns = function () {
    return this.match('#Noun')
  }
  /** every adjective - both い and な */
  View.prototype.adjectives = function () {
    return this.match('#Adjective')
  }
  /** every 助詞 */
  View.prototype.particles = function () {
    return this.match('#Particle')
  }
  /** every number, with its counter if it has one - 三冊, 2時間 */
  View.prototype.numbers = function () {
    return this.match('#Value+ #Counter?')
  }
  /** the parsed value of each number - 「二十三」 → 23 */
  View.prototype.toNumber = function () {
    return this.docs.map(terms => {
      let found = terms.find(t => typeof t.number === 'number')
      return found ? found.number : null
    })
  }
  /** every date, time and duration */
  View.prototype.dates = function () {
    return this.match('#Date+')
  }
  /** every 助数詞 */
  View.prototype.counters = function () {
    return this.match('#Counter')
  }
  /** the dictionary-form of each matched word */
  View.prototype.toInfinitive = function () {
    this.compute('root')
    return this.docs.map(terms => terms.map(t => t.root || t.text).join(''))
  }
}

// constructor-level helpers, so you can conjugate without a document
const methods = {
  /** the full paradigm of a dictionary-form verb - nlp.conjugate('書く') */
  conjugate: function (str) {
    return conjugateVerb(str)
  },
  /** the paradigm of an い- or な-adjective */
  conjugateAdjective: function (str) {
    return str.endsWith('い') ? conjugateAdjective(str) : conjugateNaAdjective(str)
  },
  /** walk a conjugated verb back to its dictionary-form */
  deconjugate: function (str) {
    let found = deconjugate(str, isKnown)
    if (!found) {
      return null
    }
    // 読まれた deconjugates to 読まれる - keep going, back to 読む
    if (roots[str] !== undefined && roots[str] !== str) {
      found.root = roots[str]
    }
    return found
  },
  /** 'godan' | 'ichidan' | 'suru' | 'kuru' | .. */
  verbClass: function (str) {
    return verbClass(str)
  },
}
export { methods }
