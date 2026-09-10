import nouns from './tags/nouns.js'
import verbs from './tags/verbs.js'
import values from './tags/values.js'
import dates from './tags/dates.js'
import misc from './tags/misc.js'
import particles from './tags/particles.js'

let tags = Object.assign({}, nouns, verbs, values, dates, particles, misc)

export default {
  tags
}
