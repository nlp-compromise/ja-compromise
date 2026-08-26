import nlp from './_lib.js'
import lexicon from './01-one/lexicon/plugin.js'
import toTerms from './01-one/tokenizer/methods/whitespace.js'
import romanji from './01-one/romanji/plugin.js'
import tokenizer from './01-one/tokenizer/plugin.js'
import output from './01-one/output/plugin.js'
import tagset from './02-two/tagset/plugin.js'
import preTagger from './02-two/preTagger/plugin.js'
import version from './_version.js'
import { methods as lexMethods } from './01-one/lexicon/api.js'
import toNumber from './01-one/numbers/kanji-number.js'

nlp.plugin(tokenizer)
nlp.plugin(tagset)
nlp.plugin(lexicon)
nlp.plugin(output)
nlp.plugin(romanji)
nlp.plugin(preTagger)

const ja = function (txt, lex) {
  // split sentences
  let doc = nlp.tokenize(txt, lex)
  // tokenize terms ourselves - compromise splits on whitespace, which japanese
  // mostly doesn't use.  every whitespace-chunk still needs splitting, so run
  // the tokenizer over each of them and keep their surrounding punctuation.
  doc.document = doc.document.map(a => {
    let out = []
    // if the sentence has spaces in it, they're real word-boundaries
    let spaced = a.length > 1
    a.forEach(term => {
      let terms = toTerms(term.text, spaced)
      if (terms.length === 0) {
        out.push(term)
        return
      }
      terms[0].pre = (term.pre || '') + terms[0].pre
      terms[terms.length - 1].post += term.post || ''
      out = out.concat(terms)
    })
    return out
  })
  const world = nlp.world()
  doc.compute(world.hooks)
  return doc
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
  let env = typeof process === 'undefined' ? self.env || {} : process.env //use window, in browser
  env.DEBUG_TAGS = set === 'tagger' || set === true ? true : ''
  env.DEBUG_MATCH = set === 'match' || set === true ? true : ''
  env.DEBUG_CHUNKS = set === 'chunker' || set === true ? true : ''
  return this
}

// conjugation helpers, usable without a document
Object.assign(ja, lexMethods)

/** parse a japanese numeral - nlp.toNumber('二十三') === 23 */
ja.toNumber = toNumber

ja.version = version

export default ja