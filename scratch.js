import nlp from './src/index.js'
import spacey from '/Users/spencer/mountain/compromise-versus/spacy-ja/run.js'
import corpus from '/Users/spencer/mountain/ja-compromise/tests/corpus/index.js'
// nlp.verbose('tagger')

let [en, ja] = corpus[corpus.length - 1]

ja = 'たろう は のりこ と くるま で えき から としょかん に いきました。'
console.log(en, '\n', ja, '\n')


let doc = nlp(ja).compute('romanji').compute('english').debug()
// console.log(doc.text())
// console.log(doc.json()[0])
// console.log(doc.docs[0])
console.log(spacey(ja))
console.log(doc.text() === ja)

// let lex = nlp.model().one.lexicon
// let ones = Object.keys(lex).filter(w => w.length === 1)
// ones.forEach(c => {
//   console.log(c, lex[c])
// })
