import tagScript from './01-script.js'
import tagMarker from './02-marker.js'
import tagEndVerb from './03-end-verb.js'
import tagAdjSuffix from './04-adj-suffixes.js'
import tagNounSuffix from './05-noun-suffixes.js'

const fallback = function (terms) {
  terms.forEach(term => {
    if (term.tags.size === 0) {
      term.tags.add('Noun')
    } else if (term.tags.size === 1 && term.tags.has('Kanji') || term.tags.has('Hiragana')) {
      term.tags.add('Noun')
    }
  })
}

const preTagger = function (view) {
  view.document.forEach(terms => {
    // hirigana, katakana, kani, or ascii
    tagScript(terms)
    // case marker
    tagMarker(terms)
    // tag end verb
    tagEndVerb(terms)
    // 
    tagAdjSuffix(terms)
    // 
    tagNounSuffix(terms)
    // noun fallback
    fallback(terms)
  })
  return view
}
export default preTagger