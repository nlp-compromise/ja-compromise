/* eslint-disable no-console */
// npm run watch  -  a scratchpad for poking at the tagger
import nlp from './src/index.js'
// nlp.verbose('tagger')

let txt = '彼女は昨日、東京で美味しい料理を食べました。'

let doc = nlp(txt).compute('root')
doc.debug()
console.log('\n  root:    ', doc.text('root'))
console.log('  romanji: ', doc.romanji())
console.log('  verbs:   ', doc.verbs().out('array'))
console.log('  nouns:   ', doc.nouns().out('array'))
console.log('  round-trips:', doc.text() === txt, '\n')
