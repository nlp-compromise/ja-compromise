import nlp from './src/index.js'
// nlp.verbose('tagger')


let txt = ''
txt = '小さな子供は食料品店に歩いた'
txt = '少年は店に向かった。 彼はパンを買った。'

// '小さな | 子 | 供は | 食料品店 | に | 歩いた'

let doc = nlp(txt).debug()
// 小さな - small
// 子 - child
// 供は - []
// 食料品店 - grocery store
// に - to
// 歩いた - walked



// Wooden structures catch fire easily
// `木造建築物は火がつきやすい`

// his name is john smith
// '彼の名前はジョン・スミスです'