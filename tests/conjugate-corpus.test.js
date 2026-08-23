import test from 'tape'
import { conjugateVerb, verbClass } from '../src/01-one/conjugate/index.js'
import verbs from '../learn/verbs/verbs.js'
import expand from '../learn/verbs/columns.js'
const here = '[conjugate-corpus] '

// ./learn/verbs/verbs.js is an independent reference table - it was scraped
// from elsewhere, not generated from this conjugator.  the rows it marks
// `trusted` are the ones that survived the scrape intact;  see
// learn/verbs/audit.js for what was wrong with the rest.
const rows = Object.keys(verbs).filter(dict => verbs[dict].trusted === true)

test('the reference table still looks like itself:', function (t) {
  t.ok(Object.keys(verbs).length > 400, here + Object.keys(verbs).length + ' verbs')
  t.ok(rows.length > 350, here + rows.length + ' with a trusted paradigm')
  t.end()
})

test('verb-class agrees with the reference table:', function (t) {
  let wrong = []
  const irregular = new Set(['suru', 'kuru', 'iku', 'aru', 'ou', 'aru5'])
  rows.forEach(dict => {
    let ours = verbClass(dict)
    if (irregular.has(ours)) {
      return // the table has no category for these
    }
    if (ours !== (verbs[dict].type || '').toLowerCase()) {
      wrong.push(`${dict}: we say ${ours}, the table says ${verbs[dict].type}`)
    }
  })
  t.deepEqual(wrong, [], here + `all ${rows.length} verb-classes match`)
  t.end()
})

test('every conjugated form matches the reference table:', function (t) {
  let checked = 0
  let wrong = []
  rows.forEach(dict => {
    let got = conjugateVerb(dict)
    if (!got) {
      wrong.push(dict + ' (no conjugation)')
      return
    }
    let want = expand(got)
    Object.keys(verbs[dict]).forEach(col => {
      if (want[col] === undefined) {
        return
      }
      checked += 1
      let value = verbs[dict][col]
      // 〜たろう and 〜ただろう are both correct, and the table uses both
      let ok = Array.isArray(want[col]) ? want[col].includes(value) : want[col] === value
      if (!ok) {
        wrong.push(`${dict}.${col}: table '${value}', conjugator '${want[col]}'`)
      }
    })
  })
  t.ok(checked > 16000, here + `checked ${checked} forms`)
  t.deepEqual(wrong.slice(0, 20), [], here + 'no disagreements')
  t.end()
})
