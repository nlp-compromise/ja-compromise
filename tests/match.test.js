import test from 'tape'
import nlp from './_lib.js'
let here = '[ja-match] '

test('match:', function (t) {
  let arr = [
    // ['234', '#Value'],
    ['静かな人。', '#Adjective #Preposition #Noun'],//quiet person
    ['静かな人。', '静か . 人'],//quiet person

    ['彼の名前はジョン・スミスです', '. #Preposition #Noun #Preposition #Katakana #Katakana #Copula'],// his name is john smith
    ['このカバンは重いです。', '#Determiner #Noun #Preposition #Adjective #Copula'],// This bag is heavy.
    ['服が汚い', '#Noun #Preposition #Adjective'],//the clothing is dirty
    ['服がとても汚い', '#Noun #Preposition #Adverb #Adjective'],//the clothing is very dirty


    ['私は歩いた', '#Pronoun #Preposition #PastTense'],//i walked
    ['彼女が歩いた', '#Pronoun #Preposition #PastTense'],//she walked
    ['私たちは笑いました', '(#Plural && #Pronoun) #Preposition #PastTense'],//we laughed

    ['ただいま', '#Expression'],//i'm back
    ['ジョンとジム', '#Noun #Conjunction #Noun'],//john and jim
    ['靴と家', '#Noun #Conjunction #Noun'],//shoes and houses

    ['美しいベッド', '#Adjective #Noun'],//the beautiful bed
    ['ベッドは美しいです', '#Noun #Preposition #Adjective #PresentTense'],//the bed is beautiful
    // ['ベッドは美しくない', '#Noun #Preposition #Adjective #PresentTense'],//the bed is not beautiful

    [`泳ぎはよかった`, `#Noun #Preposition #Adjective #Verb`],//the swim was nice
    [`ベッドはよかった`, `#Noun #Preposition #Adjective #Verb`],//the bed was nice
    [`家はきれいだった`, `#Noun #Preposition #Adjective #Verb`],//`the house was clean`
    [`キッチンは本当にきれいでした`, `#Noun #Preposition #Adverb #Adjective #Verb`],//`the kitchen was really clean`

    [`太郎は紀子を見ました`, `#Topic #Preposition #Object #Preposition #Verb+`],//
    [`たろう は のりこ を みました。`, `#Topic #Preposition #Object #Preposition #Verb+`],//

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
