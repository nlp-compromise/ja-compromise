import readings from './readings.js'
import kanji from '/Users/spencer/mountain/ja-compromise/lexicon/kanji.js'

let all = {}
Object.keys(kanji).forEach(grade => {
  kanji[grade].forEach(c => {
    if (readings[c]) {
      all[c] = readings[c].join('|')
    }
  })
})
console.log(all)