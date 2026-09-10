/* eslint-disable no-console */
// npm run score  -  segmentation + tagging accuracy against ./gold.js
import nlp from '../../src/index.js'
import gold from './gold.js'

const parse = function (line) {
  let words = []
  let tags = {}
  line.split('|').forEach(chunk => {
    let [word, tag] = chunk.split('/')
    words.push(word)
    if (tag) {
      tags[word] = tag
    }
  })
  return { words, tags, text: words.join('') }
}

let segRight = 0
let segTotal = 0
let tagRight = 0
let tagTotal = 0
let misses = []

gold.forEach(line => {
  let { words, tags, text } = parse(line)
  let got = nlp(text).json()[0].terms
  let gotWords = got.map(t => t.text)
  // segmentation - how many gold tokens came out as their own term?
  words.forEach(w => {
    segTotal += 1
    if (gotWords.includes(w)) {
      segRight += 1
    } else {
      misses.push(`  seg  ${text}\n       want '${w}'  got  ${gotWords.join(' | ')}`)
    }
  })
  // tagging - only for tokens we actually segmented right
  Object.keys(tags).forEach(w => {
    let term = got.find(o => o.text === w)
    if (!term) {
      return
    }
    tagTotal += 1
    if (term.tags.includes(tags[w])) {
      tagRight += 1
    } else {
      misses.push(`  tag  ${text}\n       '${w}' want #${tags[w]}  got  ${term.tags.join(', ')}`)
    }
  })
})

const pct = (a, b) => ((a / b) * 100).toFixed(1) + '%'
console.log('')
console.log(`  segmentation  ${segRight}/${segTotal}   ${pct(segRight, segTotal)}`)
console.log(`  tagging       ${tagRight}/${tagTotal}   ${pct(tagRight, tagTotal)}`)
if (misses.length > 0) {
  console.log('\n  misses:')
  misses.forEach(m => console.log(m))
}
console.log('')
