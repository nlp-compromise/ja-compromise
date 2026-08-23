import lexicon, { roots } from './lexicon.js'
import conjugate from '../conjugate/index.js'
import api from './api.js'

export default {
  model: {
    one: {
      lexicon,
      roots,
    },
  },
  api,
  methods: {
    two: {
      transform: {
        verb: conjugate,
      },
    },
  },
}
