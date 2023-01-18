import nlp from './src/index.js'
// nlp.verbose('tagger')


let txt = ''
txt = '少年は店に向かった。 彼はパンを買った。'

// '小さな | 子 | 供は | 食料品店 | に | 歩いた'
// his name is john smith
txt = '彼の名前はジョン・スミスです'

let doc = nlp(txt).debug().compute('romanji')
console.log(doc.romanji())

txt = '小さな子供は食料品店に歩いた'
// 小さな - small
// 子 - child
// 供は - []
// 食料品店 - grocery store
// に - to
// 歩いた - walked



// Wooden structures catch fire easily
// `木造建築物は火がつきやすい`


// criticized as a pawn of the country
// '同国の手先として批判にさらされた'
// 同国 - country
//   の - particle
// 手先 - pawn
//   として - particle 'as'
// 批判 - criticism

// 'spencer walked
// スペンサーが歩いた