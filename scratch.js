import nlp from './src/index.js'
// nlp.verbose('tagger')


let txt = ''
// txt = '少年は店に向かった。 彼はパンを買った。'

// '小さな | 子 | 供は | 食料品店 | に | 歩いた'


// Wooden structures catch fire easily
txt = `木造建築物は火がつきやすい`

// the small child walked to the grocery store
// txt = '小さな子供は食料品店に歩いた'

// quiet person
// txt = '静かな人。'

// his name is john smith
// txt = '彼の名前はジョン・スミスです'
// pass conditional plain
// txt = '過ぎたら'
// the boy opens the door
// txt = '少年はドアを開ける'

// console.log('\'the boy opened the door\'')
// the boy opened the door
// txt = '少年はドアを開けた'

// txt = '少年はドアを開けていた'
// txt = '静かな人。'
// txt = '234'
// txt = '彼の名前はジョン・スミスです'

// txt = '圭吾'
// txt = '林'
// txt = '新聞'

txt = '真面目な'//, 'まじめな', //serious
txt = '強い'//, 'つよい',//	tsuyoi	Strong 

// There is a big bed and a small chair in the room.
// txt = '部屋に大きいベッドと小さい椅子があります。'

// This bag is heavy.
txt = 'このカバンは重いです。'
// the clothing is dirty
txt = '服が汚い'
// the clothing is very dirty
txt = '服がとても汚い'

// the clothing was dirty
// txt = '服が汚れていた'

// txt = '私は歩いた'//i walked
// txt = '彼女が歩いた'//she walked
// txt = '私たちは笑いました'//we laughed
// txt = '彼が笑いました'//he laughed
// txt = '彼は大声で笑った'//he laughed loudly
// txt = '私たちは勉強しました'//we studied

// txt = '美しいベッド'//the beautiful bed
txt = 'ベッドは美しくない'//the bed is not beatiful
// There are apples and oranges on the table.
// txt = 'テーブルの上にりんごやみかんがあります。'

let doc = nlp(txt).debug().compute('romanji')
console.log(doc.romanji())
// console.log(doc.json()[0])

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



// '古い', 'ふるい',//	furui	Old
//   '古い', 'ふるい', //old

//   '若い', 'わかい',//	wakai	Young
//   '若い', 'わかい', //young