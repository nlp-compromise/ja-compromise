import debug from './debug/index.js'
import english from './compute/english.js'

const methods = { debug }

const api = function (View) {
  Object.assign(View.prototype, methods)
}
export default {
  compute: { english },
  api
}