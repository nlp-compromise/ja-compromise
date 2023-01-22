import tagScript from './01-script.js'
import tagMarker from './02-marker.js'
import tagEndVerb from './03-end-verb.js'
import tagAdjSuffix from './04-adj-suffixes.js'
import tagNounSuffix from './05-noun-suffixes.js'


const reason = 'noun-fallback'
const fallback = function (terms, setTag, world) {
  terms.forEach(term => {
    let tags = term.tags
    if (tags.size === 0) {
      setTag([term], 'Noun', world, null, reason)
    } else if (tags.size === 1 && (tags.has('Kanji') || tags.has('Hiragana') || tags.has('Katagana'))) {
      setTag([term], 'Noun', world, null, reason)
    }
  })
}

const preTagger = function (view) {
  const setTag = view.methods.one.setTag || function () { }
  const world = view.world
  view.document.forEach(terms => {
    // hirigana, katakana, kani, or ascii
    tagScript(terms, setTag, world)
    // case marker
    tagMarker(terms, setTag, world)
    // tag end verb
    tagEndVerb(terms, setTag, world)
    // 
    tagAdjSuffix(terms, setTag, world)
    // 
    tagNounSuffix(terms, setTag, world)
    // noun fallback
    fallback(terms, setTag, world)
  })
  return view
}
export default preTagger