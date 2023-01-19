import verbs from './verbs.ignore.js'
let out = {}


const isArray = function (arr) {
  return Object.prototype.toString.call(arr) === '[object Array]'
}

verbs.forEach(o => {
  let vb = o.verb[0]
  out[vb] = {}
  o.infinitive = o.infinitive.split(/\s+/)
  o.te_form = o.te_form.split(/\s+/)
  o.verb_class = o.verb_class.split(' ~ ')
  o.stem = o.stem.split('- ')
  o.stem = [o.stem[0], o.stem[o.stem.length - 1]]
  if (o.past_presumptive_plain_positive.length === 3) {
    o.past_presumptive_plain_positive.shift()
  }
  Object.keys(o).forEach(k => {
    if (isArray(o[k])) {
      out[vb][k] = o[k][1]
    } else {
      console.log(k)
    }
  })
  out[vb].english = o.english[0]
  // console.log(o.verb_class)
})

// console.log(verbs.length)
console.log(JSON.stringify(out, null, 2))
