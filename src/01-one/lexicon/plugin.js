import lexicon, { roots } from './lexicon.js'
import conjugate from '../conjugate/index.js'
import api from './api.js'

// multi-word names, like 'new york', are only matched when given as words
const phrases = {}
Object.keys(lexicon).forEach(w => {
  if (w.includes(' ')) {
    phrases[w] = lexicon[w]
  }
})

export default {
  words: phrases,
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
