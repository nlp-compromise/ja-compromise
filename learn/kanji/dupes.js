import list from './list.js'
let obj = {}
list.forEach(k => {
  if (obj[k]) {
    console.log(k)
  }
  obj[k] = true
})