// import unicode from './unicode.js'
// import contractions from './contractions.js'
import { wrap, wrapIsSentence } from './sentences.js'
import fromString from './methods/from-string.js'
import noSpaces from './methods/no-spaces.js'

// the longest word in a user-given lexicon, so the segmenter can look that far ahead
const trackLength = function (nlp) {
  const addWords = nlp.addWords
  nlp.addWords = function (words, isFrozen) {
    const model = this.world().model
    Object.keys(words || {}).forEach(w => {
      if (w.length > (model.one.maxWord || 0)) {
        model.one.maxWord = w.length
      }
    })
    return addWords.call(this, words, isFrozen)
  }
}

export default {
  mutate: (world, nlp) => {
    //   world.model.one.unicode = unicode
    //   world.model.one.contractions = contractions
    // japanese sentence-boundary rules
    world.methods.one.tokenize.splitSentences = wrap(world.methods.one.tokenize.splitSentences)
    world.methods.one.tokenize.isSentence = wrapIsSentence(world.methods.one.tokenize.isSentence)
    // japanese word-segmentation, for anything that parses a string
    world.methods.one.tokenize.fromString = fromString
    trackLength(nlp)
  },
  api: noSpaces
}
