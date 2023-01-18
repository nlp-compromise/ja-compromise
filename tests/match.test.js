import test from 'tape'
import nlp from './_lib.js'
let here = '[de-match] '

test('match:', function (t) {
  let arr = [
    ['234', '#Value'],
    ['永吉佑也', '#LastName #FirstName'],
    ['伊井田 栄吉', '#LastName #FirstName'],
    ['静かな人。', '#Adjective #Noun'],//quiet person
    // ['chicago', '#City'],
    // ['Jamaika', '#Country'],
    // ['colorado', '#Place'],
    // ['tony', '#MaleName'],
    // ['', ''],
  ]
  arr.forEach(function (a) {
    let [str, match] = a
    let doc = nlp(str)//.compute('tagRank')
    let tags = doc.json()[0].terms.map(term => term.tags[0])
    let msg = `'${(str + "' ").padEnd(20, ' ')}  - '${tags.join(', ')}'`
    let m = doc.match(match)
    t.equal(m.text(), doc.text(), here + msg)
  })
  t.end()
})
