import femaleNames from './people/femaleNames.js'
import maleNames from './people/maleNames.js'
import lastNames from './people/lastNames.js'
import cities from './places/cities.js'
import countries from './places/countries.js'
import adjectives from './adjectives.js'
import adverbs from './adverbs.js'
import numbers from './numbers.js'
import particles from './particles.js'
import weekdays from './weekdays.js'



//add-in the generic, flat word-lists
const data = [
  // [femaleNames, 'FemaleName'],
  // [maleNames, 'MaleName'],
  // [lastNames, 'LastName'],
  [cities, 'City'],
  [countries, 'Country'],
  [adjectives, 'Adjective'],
  [adverbs, 'Adverb'],
  [numbers, 'Value'],
  [particles, 'Preposition'],
  [weekdays, 'Weekday'],
]
let lex = {}
for (let i = 0; i < data.length; i++) {
  const list = data[i][0]
  for (let o = 0; o < list.length; o++) {
    // log duplicates
    // if (lex[list[o]]) {
    //   console.log(list[o] + '  ' + lex[list[o]] + ' ' + data[i][1])
    // }
    lex[list[o]] = data[i][1]
  }
}

// console.log(lex['圭吾'])
export default lex
