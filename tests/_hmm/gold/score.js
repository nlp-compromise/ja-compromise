import { isPunctuation, charAt } from '../../../src/01-one/tokenizer/methods/lib.js'

// where the terms end, counted in letters - punctuation and spaces don't count
const letters = function (str) {
  let n = 0
  for (let i = 0; i < str.length; i += 1) {
    const c = charAt(str, i)
    if (!isPunctuation(c) && !/\s/.test(c)) {
      n += 1
    }
    i += c.length - 1
  }
  return n
}

const toCuts = function (words) {
  const cuts = new Set()
  let at = 0
  words.forEach((w, i) => {
    at += letters(w)
    if (i < words.length - 1 && at > 0) {
      cuts.add(at)
    }
  })
  return { cuts, total: at }
}

/**
 * score a tokenizer against the gold-standard.
 *  - a 'wrong cut' is a boundary we made that shouldn't be there.  this is the
 *    serious kind - it leaves two things that aren't words.
 *  - a 'missed cut' is a boundary we didn't make.  the term is too big,
 *    but it's still a real thing.
 */
const score = function (nlp, gold) {
  const out = { sentences: 0, exact: 0, right: 0, wrong: 0, missed: 0, fails: [], groups: {} }
  Object.keys(gold).forEach(group => {
    const g = { sentences: 0, exact: 0 }
    gold[group].forEach(line => {
      const want = line.split('|')
      const text = want.join('')
      const have = nlp(text).docs.flat().map(t => t.text)
      const a = toCuts(want)
      const b = toCuts(have)
      let wrong = 0
      let missed = 0
      b.cuts.forEach(n => (a.cuts.has(n) ? (out.right += 1) : (wrong += 1)))
      a.cuts.forEach(n => (b.cuts.has(n) ? null : (missed += 1)))
      out.wrong += wrong
      out.missed += missed
      out.sentences += 1
      g.sentences += 1
      // the same letters have to be there, too
      const isExact = wrong === 0 && missed === 0 && a.total === b.total
      if (isExact) {
        out.exact += 1
        g.exact += 1
      } else {
        out.fails.push({ group, text, want: want.map(s => s.trim()).filter(s => letters(s) > 0), have, wrong, missed })
      }
    })
    out.groups[group] = g
  })
  // of the cuts we made, how many were right?
  out.precision = out.right / (out.right + out.wrong)
  // of the cuts we should have made, how many did we?
  out.recall = out.right / (out.right + out.missed)
  out.f1 = (2 * out.precision * out.recall) / (out.precision + out.recall)
  return out
}
export default score
