import test from 'tape'
import nlp from '../_lib.js'
import gold from './gold/segmentation.js'
import score from './gold/score.js'
const here = '[hmm/gold] '

// the tokenizer, scored against ./gold/segmentation.js.
// every sentence it gets wrong is printed underneath, as a comment.
//
// these floors sit just under today's score, so a change that makes things
// worse fails here.  raise them when the score goes up - never lower them
// to get a change through.
const floors = { precision: 0.99, recall: 0.975, exact: 0.94 }

test('segmentation gold-standard:', function (t) {
  const res = score(nlp, gold)
  const pct = (n) => (n * 100).toFixed(1) + '%'
  // a wrong cut leaves two things that aren't words
  t.ok(res.precision >= floors.precision, here + `precision ${pct(res.precision)} - ${res.wrong} wrong cuts`)
  // a missed cut leaves a term that's too big
  t.ok(res.recall >= floors.recall, here + `recall ${pct(res.recall)} - ${res.missed} missed cuts`)
  t.ok(res.exact / res.sentences >= floors.exact, here + `${res.exact} of ${res.sentences} sentences exactly right`)
  // what's still wrong - these don't fail anything, they're here to be read
  Object.keys(res.groups).forEach(k => {
    t.comment(`${k.padEnd(10)} ${res.groups[k].exact} / ${res.groups[k].sentences}`)
  })
  res.fails.forEach(o => {
    t.comment(`${o.wrong > 0 ? 'wrong cut ' : 'missed cut'} [${o.group}] ${o.text}`)
    t.comment('    want: ' + o.want.join(' | '))
    t.comment('    have: ' + o.have.join(' | '))
  })
  t.end()
})

test('the gold-standard is well-formed:', function (t) {
  Object.keys(gold).forEach(group => {
    gold[group].forEach(line => {
      t.ok(line.split('|').every(str => str.trim() !== ''), here + 'no empty terms in ' + line)
    })
  })
  t.end()
})
