import dict from './dict.ignore.js'

const toUtf8 = function (s) {
  return decodeURIComponent(s)
}



Object.keys(dict.words).forEach(m => {
  Object.keys(dict.words[m]).forEach(k => {

    let obj = dict.words[m][k]
    // console.log(obj)
    if (!obj) {
      return
    }
    let kanji = toUtf8(obj.variants[0].written)
    if (kanji.includes('火')) {
      let en = obj.meanings[0]
      console.log(kanji)
      console.log(en.glosses)

    }

  })
})
// console.log(JSON.stringify(dict, null, 2))