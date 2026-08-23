import tagScript from './01-script.js'
import tagParticles from './02-particles.js'
import verbs from './03-verbs.js'
import adjectives from './04-adjectives.js'
import tagPeople from './05-people.js'

// anything still unlabelled at the end is a noun - the safest guess in japanese
const reason = 'noun-fallback'
const scriptOnly = new Set(['Kanji', 'Hiragana', 'Katakana', 'Ascii'])

const fallback = function (terms, setTag, world) {
  terms.forEach(term => {
    let tags = [...term.tags]
    if (tags.length === 0 || tags.every(t => scriptOnly.has(t))) {
      setTag([term], 'Noun', world, null, reason)
    }
  })
}

const preTagger = function (view) {
  const setTag = view.methods.one.setTag || function () { }
  const world = view.world
  view.document.forEach(terms => {
    // 1. which script is each token written in?
    tagScript(terms, setTag, world)
    // 2. verbs we don't have in the lexicon, read off their conjugation
    verbs.tagUnknownVerbs(terms, setTag, world)
    // 3. い-adjectives by their shape
    adjectives.adjSuffixes(terms, setTag, world)
    // 4. particles, and what they imply about their neighbour
    tagParticles(terms, setTag, world)
    // 5. 勉強 + します
    verbs.tagSuruVerbs(terms, setTag, world)
    // 6. an auxiliary passes its tense back to its verb
    verbs.tagAuxiliary(terms, setTag, world)
    // 7. 読んで + いました is one progressive verb-phrase
    verbs.tagCompoundVerbs(terms, setTag, world)
    // 8. plural and honorific suffixes
    adjectives.nounSuffixes(terms, setTag, world)
    tagPeople(terms, setTag, world)
    // 9. whatever's left is a noun
    fallback(terms, setTag, world)
  })
  return view
}
export default preTagger
