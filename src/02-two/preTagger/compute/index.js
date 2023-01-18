import tagScript from './01-script.js'
import tagMarker from './02-marker.js'
import tagEndVerb from './03-end-verb.js'

const preTagger = function (view) {
  view.document.forEach(terms => {
    // hirigana, katakana, kani, or ascii
    tagScript(terms)
    // case marker
    tagMarker(terms)
    // tag end verb
    tagEndVerb(terms)
  })

  return view
}
export default preTagger