import nlp from './_lib.js'
import toTerms from './01-one/tokenizer/methods/tokenize.js'
import tagset from './01-one/tagset/plugin.js'
import romanji from './01-one/romanji/plugin.js'
import tokenizer from './01-one/tokenizer/plugin.js'
import version from './_version.js'

nlp.plugin(tokenizer)
nlp.plugin(tagset)
nlp.plugin(romanji)

const ja = function (txt, lex) {
  // split sentences
  let doc = nlp.tokenize(txt, lex)
  // tokenize terms ourselves
  doc.document = doc.document.map(a => {
    if (a.length > 1) {
      return a
    }
    return toTerms(a[0].text)
  })
  // doc.compute('pre-tagger')
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

ja.version = version

export default ja