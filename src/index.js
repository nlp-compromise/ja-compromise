import nlp from './_lib.js'
import lexicon from './01-one/lexicon/plugin.js'
import romanji from './01-one/romanji/plugin.js'
import tokenizer from './01-one/tokenizer/plugin.js'
import output from './01-one/output/plugin.js'
import tagset from './02-two/tagset/plugin.js'
import preTagger from './02-two/preTagger/plugin.js'
import version from './_version.js'
import { methods as lexMethods } from './01-one/lexicon/api.js'
import toNumber from './01-one/numbers/kanji-number.js'
import toKanji from './01-one/numbers/to-kanji.js'
import numbers from './01-one/numbers/api.js'
import nouns from './03-three/nouns/plugin.js'
import verbs from './03-three/verbs/plugin.js'

nlp.plugin(tokenizer)
nlp.plugin(tagset)
nlp.plugin(lexicon)
nlp.plugin(output)
nlp.plugin(romanji)
nlp.plugin(preTagger)
nlp.plugin(numbers)
nlp.plugin(nouns)
nlp.plugin(verbs)

// word-segmentation happens in the tokenizer plugin, so this is all there is
const ja = function (txt, lex) {
  return nlp(txt, lex)
}

// copy constructor methods over
Object.keys(nlp).forEach(k => {
  if (nlp.hasOwnProperty(k)) {
    ja[k] = nlp[k]
  }
})

// this one is hidden
Object.defineProperty(ja, '_world', {
  value: nlp._world,
  writable: true,
})
/** log the decision-making to console */
ja.verbose = function (set) {
  const env = typeof process === 'undefined' ? self.env || {} : process.env //use window, in browser
  env.DEBUG_TAGS = set === 'tagger' || set === true ? true : ''
  env.DEBUG_MATCH = set === 'match' || set === true ? true : ''
  env.DEBUG_CHUNKS = set === 'chunker' || set === true ? true : ''
  return this
}

// conjugation helpers, usable without a document
Object.assign(ja, lexMethods)

/** parse a japanese numeral - nlp.toNumber('二十三') === 23 */
ja.toNumber = toNumber

/** write a number in kanji - nlp.toKanji(23) === '二十三' */
ja.toKanji = toKanji

ja.version = version

export default ja