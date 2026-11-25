import preTagger from './compute/index.js'

// the whole tagging process, for re-tagging text after a change
const tagger = view => view.compute(['freeze', 'lexicon', 'preTagger', 'unfreeze'])

export default {
  compute: {
    preTagger,
    tagger
  },

  hooks: ['preTagger'],
}