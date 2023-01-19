import lexicon from './lexicon.js'
import verb from './methods/verb.js'

export default {
  model: {
    one: {
      lexicon
    }
  },
  methods: {
    two: {
      transform: {
        verb: verb
      }
    }
  },
}