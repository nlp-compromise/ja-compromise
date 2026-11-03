import list from './list.js'
const obj = {}
list.forEach(k => {
  if (obj[k]) {
    console.log(k)
  }
  obj[k] = true
})