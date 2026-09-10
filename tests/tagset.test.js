import test from 'tape'
import nlp from './_lib.js'
import lexicon from '../src/01-one/lexicon/lexicon.js'
import counters from '../lexicon/counters.js'
import dateWords from '../lexicon/dates.js'
import particles from '../lexicon/misc/particles.js'
import { verbForms, adjForms, naAdjForms, desireForms, derivedForms } from '../src/01-one/conjugate/tags.js'
import { suffixes } from '../src/01-one/conjugate/deconjugate.js'
const here = '[tagset] '

// a tag the tagset doesn't declare still *applies* - it just sits there
// inheriting nothing.  the lexicon spent a while tagging 水曜日 'Weekday' while
// the tagset declared 'WeekDay', so 水曜日 was neither a #Noun nor a #Date.
// nothing catches that at runtime, so catch it here.
const declared = new Set(Object.keys(nlp.model().one.tagSet))

const check = function (t, label, tags) {
  let missing = [...new Set(tags)].filter(tag => !declared.has(tag)).sort()
  t.deepEqual(missing, [], here + label + ' (' + new Set(tags).size + ' tags)')
}

test('every tag in the built lexicon is declared:', function (t) {
  let tags = []
  Object.keys(lexicon).forEach(w => {
    let v = lexicon[w]
    tags = tags.concat(typeof v === 'string' ? [v] : v)
  })
  check(t, 'lexicon', tags)
  t.end()
})

test('every tag in the data-tables is declared:', function (t) {
  // these reach setTag() as variables, so a typo in them is invisible
  check(t, 'counters.js', Object.values(counters))
  check(t, 'dates.js', Object.values(dateWords))
  check(t, 'particles.js', Object.values(particles))
  t.end()
})

test('every tag the conjugator emits is declared:', function (t) {
  let tables = { verbForms, adjForms, naAdjForms, desireForms }
  Object.keys(tables).forEach(name => {
    let tags = Object.values(tables[name]).flat()
    check(t, name, tags)
  })
  // derivedForms are combined with a voice tag before they're applied
  check(t, 'derivedForms', Object.values(derivedForms).flat())
  // the deconjugator reads its tags straight off the suffix it matched
  check(t, 'deconjugate suffixes', suffixes.flatMap(row => row[1]))
  t.end()
})

test('every tag a real document produces is declared:', function (t) {
  let corpus = [
    '1995年3月10日の午後3時に生まれました。',
    '本を五冊買って、2時間読んだ。',
    '田中さんは日本語がとても上手です。',
    '子供たちは公園で楽しそうに遊んでいる。',
    '先生に褒められて、とても嬉しかった。',
    '雨が降っているので、傘を持って行ってください。',
    '来年の春、水曜日に京都へ行こう。',
    '三ヶ月かかると言っていました。',
    'これは何ですか。分からないなら聞いてね。',
  ]
  let seen = []
  corpus.forEach(str => {
    nlp(str).json()[0].terms.forEach(term => {
      seen = seen.concat(term.tags)
    })
  })
  check(t, 'live document tags', seen)
  t.ok(new Set(seen).size > 40, here + 'saw ' + new Set(seen).size + ' distinct tags')
  t.end()
})

test('the weekday tag resolves through the tagset:', function (t) {
  let tags = nlp('水曜日です').json()[0].terms[0].tags
  t.ok(tags.includes('WeekDay'), here + '水曜日 is a #WeekDay')
  t.ok(tags.includes('Date'), here + '..and inherits #Date')
  t.ok(tags.includes('Noun'), here + '..and inherits #Noun')
  t.end()
})
