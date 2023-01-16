import nlp from './src/index.js'
// nlp.verbose('tagger')


let txt = ''
txt = '小さな子供は食料品店に歩いた'

// '小さな | 子 | 供は | 食料品店 | に | 歩いた'

let doc = nlp(txt).debug()
// 小さな - small
// 子 - child
// 供は - []
// 食料品店 - grocery store
// に - to
// 歩いた - walked
