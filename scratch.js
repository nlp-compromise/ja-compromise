import nlp from './src/index.js'
import spacey from '/Users/spencer/mountain/compromise-versus/spacy-ja/run.js'
import corpus from '/Users/spencer/mountain/ja-compromise/tests/corpus/index.js'
// nlp.verbose('tagger')

let a = corpus[5]
console.log(a[0])
console.log(a[1], '\n')
let txt = a[1]
txt = '靴と家'

let doc = nlp(txt).compute('romanji').compute('english').debug()
// console.log(doc.text())
// console.log(doc.json()[0])

console.log(spacey(txt))

// let lex = nlp.model().one.lexicon
// let ones = Object.keys(lex).filter(w => w.length === 1)
// ones.forEach(c => {
//   console.log(c, lex[c])
// })



