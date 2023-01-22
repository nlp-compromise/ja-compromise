/* eslint-disable no-console */
import showTags from './tags.js'

function isClientSide() {
  return typeof window !== 'undefined' && window.document
}
//output some helpful stuff to the console
const debug = function (opts = {}) {
  let view = this
  if (typeof opts === 'string') {
    let tmp = {}
    tmp[opts] = true //allow string input
    opts = tmp
  }
  if (isClientSide()) {
    return view
  }
  if (opts.tags !== false) {
    showTags(view)
    console.log('\n')
  }
  return view
}
export default debug
