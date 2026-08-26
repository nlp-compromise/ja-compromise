import femaleNames from './people/femaleNames.js'
import maleNames from './people/maleNames.js'
import lastNames from './people/lastNames.js'
import cities from './places/cities.js'
import countries from './places/countries.js'
import adjectivesI from './adjectives-i.js'
import adjectivesNa from './adjectives-na.js'
import adverbs from './adverbs.js'
import numbers from './numbers.js'
import weekdays from './weekdays.js'

import godan from './verbs/godan.js'
import ichidan from './verbs/ichidan.js'
import irregular from './verbs/irregular.js'
import suruNouns from './verbs/suru-nouns.js'

import nouns from './nouns.js'
import particles from './misc/particles.js'
import counters from './counters.js'
import dates from './dates.js'
import determiners from './misc/determiners.js'
import conjunctions from './misc/conjunctions.js'
import interjections from './misc/interjections.js'
import pronouns from './pronouns.js'

// counters go in as plain nouns, which is what most of them are - 本 is a
// book far more often than it's the counter for long objects.  the #Counter
// tag itself is applied by the tagger, and only after a number.  they need to
// be here at all so the tokenizer can find them: without 点, 「百点満点」 comes
// out as 百 + 点満点.
const counterWords = Object.keys(counters).filter(w => !/^[%％]$/.test(w))

// flat word-lists, each with the tag they all get
const data = [
  // [femaleNames, 'FemaleName'],
  // [maleNames, 'MaleName'],
  // [lastNames, 'LastName'],
  [cities, 'City'],
  [countries, 'Country'],
  [nouns, 'Noun'],
  [suruNouns, 'SuruVerb'],
  [adjectivesI, 'Adjective'],
  [adjectivesNa, 'NaAdjective'],
  [adverbs, 'Adverb'],
  [numbers, 'Value'],
  [weekdays, 'WeekDay'],

  // verbs are stored in their dictionary-form, tagged by conjugation-class.
  // the runtime lexicon expands each one into its full paradigm.
  [godan, 'Godan'],
  [ichidan, 'Ichidan'],
  [irregular, 'IrregularVerb'],

  [counterWords, 'Noun'],
  [determiners, 'Determiner'],
  [conjunctions, 'Conjunction'],
  [pronouns, 'Pronoun'],
  [interjections, 'Expression'],
]

let lex = {}
for (let i = 0; i < data.length; i++) {
  const list = data[i][0]
  for (let o = 0; o < list.length; o++) {
    lex[list[o]] = data[i][1]
  }
}
// date words carry their own per-word tag.  they're nouns too - 今日は, 来年の -
// so they keep that, since #Date alone doesn't imply it
Object.keys(dates).forEach(w => {
  lex[w] = [dates[w], 'Noun']
})
// particles carry their own per-word tag
Object.keys(particles).forEach(w => {
  lex[w] = particles[w]
})

export default lex
