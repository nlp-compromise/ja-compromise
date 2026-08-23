import test from 'tape'
import { conjugateVerb } from '../src/01-one/conjugate/index.js'
import verbs from '../learn/verbs/verbs.js'
const here = '[conjugate-corpus] '

// the scraped table in ./learn is column-shifted for a lot of verbs - only
// these four fields are trustworthy across the whole set.
const fields = [
  ['te_form', 'Gerund'],
  ['infinitive', 'Stem'],
  ['present_indicative_plain_negative', 'Negative'],
  ['present_indicative_polite_positive', 'Polite'],
]
// rows where the *source* has the conjugation-class wrong
const badRows = new Set(['言い換える', '滅びる', '隠れる', '臥せる', '蹴る', 'ふけ'])

test('conjugate against the whole verb-table:', function (t) {
  let checked = 0
  let wrong = []
  Object.keys(verbs).forEach(key => {
    let dict = key.trim()
    if (!dict || badRows.has(dict)) {
      return
    }
    let got = conjugateVerb(dict)
    if (!got) {
      wrong.push(dict + ' (no conjugation)')
      return
    }
    fields.forEach(([from, to]) => {
      let want = (verbs[key][from] || '').replace(/\s/g, '')
      if (!want) {
        return
      }
      checked += 1
      if (got[to] !== want) {
        wrong.push(`${dict}.${to} got '${got[to]}' want '${want}'`)
      }
    })
  })
  t.ok(checked > 1500, here + `checked ${checked} forms`)
  t.deepEqual(wrong, [], here + 'every form matches the reference table')
  t.end()
})
