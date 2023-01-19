import { reverse, uncompress } from 'suffix-thumb'
import input from './_model.js'

let fwd = {}
let rev = {}
Object.keys(input).forEach(k => {
  fwd[k] = uncompress(input[k])
  rev[k] = reverse(fwd[k])
})
export { fwd, rev }