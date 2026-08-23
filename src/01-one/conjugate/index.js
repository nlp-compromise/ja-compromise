import conjugateVerb from './conjugate-verb.js'
import conjugateAdjective, { conjugateNaAdjective } from './conjugate-adj.js'
import verbClass from './verb-class.js'
import deconjugate from './deconjugate.js'

export default {
  verb: conjugateVerb,
  adjective: conjugateAdjective,
  naAdjective: conjugateNaAdjective,
  verbClass,
  deconjugate,
}
export { conjugateVerb, conjugateAdjective, conjugateNaAdjective, verbClass, deconjugate }
