import test from 'tape'
import nlp from './_lib.js'
let here = '[ja-match] '

test('match:', function (t) {
  let arr = [
    // ['234', '#Value'],
    ['静かな人。', '#Adjective #Preposition #Noun'],//quiet person
    ['彼の名前はジョン・スミスです', '. #Preposition #Noun #Preposition #Katakana #Katakana .']// his name is john smith


    // ['永吉佑也', '#LastName #FirstName'],
    // ['伊井田 栄吉', '#LastName #FirstName'],
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
