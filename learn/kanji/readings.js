import dict from './dict.ignore.js'

const toUtf8 = function (s) {
  return decodeURIComponent(s)
}


let obj = {}
Object.keys(dict.kanjis).forEach(k => {
  let o = dict.kanjis[k]
  if (o.kun_readings[0] && o.on_readings[0]) {
    obj[k] = [o.kun_readings[0], o.on_readings[0]]
  }
})
console.log(JSON.stringify(obj, null, 2))