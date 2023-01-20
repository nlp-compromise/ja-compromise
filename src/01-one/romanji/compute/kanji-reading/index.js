import readings from './readings.js'

const spellKanji = function (kanji, type) {
  let out = ''
  let chars = kanji.split('')
  if (!type) {
    type = kanji.length === 1 ? 'kun' : 'on'
  }
  chars.forEach(char => {
    let r = readings[char]
    if (!r) {
      out += char
      return
    }
    let [kun, on] = r.split('|')
    if (type === 'kun') {
      out += kun
    } else {
      out += on
    }
  })
  return out
}
export default spellKanji

// console.log(spellKanji('林'))