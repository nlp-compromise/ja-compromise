/* eslint-disable no-console */
// npm run audit  -  check ./verbs.js against the conjugator, both ways.
//
// the table arrived from a scrape with three kinds of damage, all of which
// this script re-checks:
//
//   1. 44 rows lost columns, and the scraper zipped the surviving values
//      against the wrong labels.  those rows are marked `trusted: false` and
//      keep only their identity fields - the paradigms aren't recoverable.
//   2. four rows were conjugated as the wrong verb-class (言い換える, 滅びる,
//      臥せる, 隠れる are ichidan).  fixed by hand - there's no structural tell,
//      since 混じる, 脂ぎる, 蹴る and ふける look identical and really are godan.
//   3. two systematic cell errors: a truncated volitional (喜ぼ for 喜ぼう) and
//      a causative-negative that was a copy of the plain negative.  the first
//      was repaired, the second dropped.
//
// what's left should agree with src/01-one/conjugate exactly.  a mismatch here
// means either the conjugator or the table is wrong - both are worth knowing.
import verbs from './verbs.js'
import expand from './columns.js'
import { conjugateVerb, verbClass } from '../../src/01-one/conjugate/index.js'

let trusted = 0
let untrusted = []
let checked = 0
let mismatch = []
let classMismatch = []

Object.keys(verbs).forEach(dict => {
  let row = verbs[dict]
  if (row.trusted !== true) {
    untrusted.push(dict)
    return
  }
  trusted += 1

  let got = conjugateVerb(dict)
  if (!got) {
    mismatch.push(`${dict}: the conjugator doesn't recognise this verb`)
    return
  }
  // does our verb-class agree with the table's?
  let ours = verbClass(dict)
  let theirs = (row.type || '').toLowerCase()
  let irregular = ['suru', 'kuru', 'iku', 'aru', 'ou', 'aru5'].includes(ours)
  if (!irregular && ours !== theirs) {
    classMismatch.push(`${dict}: we say ${ours}, the table says ${theirs}`)
  }

  let want = expand(got)
  Object.keys(row).forEach(col => {
    if (want[col] === undefined) {
      return
    }
    checked += 1
    let ok = Array.isArray(want[col]) ? want[col].includes(row[col]) : want[col] === row[col]
    if (!ok) {
      mismatch.push(`${dict}.${col}: table '${row[col]}'  conjugator '${want[col]}'`)
    }
  })
})

console.log('')
console.log(`  verbs           ${Object.keys(verbs).length}`)
console.log(`  trusted rows    ${trusted}`)
console.log(`  untrusted rows  ${untrusted.length}   (paradigm dropped - scrambled in the scrape)`)
console.log(`  forms checked   ${checked}`)
console.log(`  class conflicts ${classMismatch.length}`)
console.log(`  form conflicts  ${mismatch.length}`)
if (classMismatch.length) {
  console.log('\n  class conflicts:')
  classMismatch.forEach(s => console.log('    ' + s))
}
if (mismatch.length) {
  console.log('\n  form conflicts:')
  mismatch.slice(0, 40).forEach(s => console.log('    ' + s))
  if (mismatch.length > 40) {
    console.log(`    ..and ${mismatch.length - 40} more`)
  }
}
console.log('')
