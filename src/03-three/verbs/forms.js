import { conjugateVerb, conjugateAdjective } from '../../01-one/conjugate/index.js'

// a japanese verb stacks tense, polarity and politeness onto one word.
// each 'paradigm' here is the eight ways those three can combine,
// keyed by past/negative/polite - '101' is past + polite, 食べました
const toKey = (o) => (o.past ? '1' : '0') + (o.negative ? '1' : '0') + (o.polite ? '1' : '0')

const fromKey = (key) => ({ past: key[0] === '1', negative: key[1] === '1', polite: key[2] === '1' })

const fromVerb = function (c, prefix = '') {
  return {
    '000': prefix + c.PresentTense,
    '100': prefix + c.PastTense,
    '010': prefix + c.Negative,
    '110': prefix + c.PastNegative,
    '001': prefix + c.Polite,
    '101': prefix + c.PolitePast,
    '011': prefix + c.PoliteNegative,
    '111': prefix + c.PolitePastNegative,
  }
}

// 食べたい inflects like an い-adjective
const fromAdjective = function (c) {
  return {
    '000': c.PresentTense,
    '100': c.PastTense,
    '010': c.Negative,
    '110': c.PastNegative,
    '001': c.Polite,
    '101': c.PolitePast,
    '011': c.PoliteNegative,
    '111': c.PastNegative + 'です',
  }
}

// the copula is its own thing - and じゃ is only a spoken では
const copula = function (neg) {
  return {
    '000': 'だ',
    '100': 'だった',
    '010': neg + 'ない',
    '110': neg + 'なかった',
    '001': 'です',
    '101': 'でした',
    '011': neg + 'ありません',
    '111': neg + 'ありませんでした',
  }
}
const copulas = [copula('じゃ'), copula('では')]

const hasText = (paradigm, str) => Object.keys(paradigm).find(k => paradigm[k] === str)

const iru = conjugateVerb('いる')
// forms which are themselves a verb, with a tense of their own - 食べられ + た
const derived = ['Potential', 'Passive', 'Causative', 'CausativePassive']

// every paradigm this word may be sitting in
const paradigms = function* (root) {
  const c = conjugateVerb(root)
  if (!c) {
    return
  }
  yield fromVerb(c)
  // 食べている
  yield fromVerb(iru, c.Gerund)
  // 食べたい
  const desire = conjugateAdjective(c.Desire)
  if (desire) {
    yield fromAdjective(desire)
  }
  for (const k of derived) {
    const d = conjugateVerb(c[k])
    if (d) {
      yield fromVerb(d)
    }
  }
}

// find where a word sits among its forms, so we can step to a neighbouring one.
// a word that's not found - 食べよう, 食べれば - has no tense to change
const findForms = function (str, root, isCopula) {
  if (isCopula) {
    for (const p of copulas) {
      const key = hasText(p, str)
      if (key) {
        return { paradigm: p, key }
      }
    }
    return null
  }
  for (const p of paradigms(root)) {
    const key = hasText(p, str)
    if (key) {
      return { paradigm: p, key }
    }
  }
  return null
}

// the full list of copula forms, for .conjugate()
const copulaForms = {
  Infinitive: 'だ',
  PresentTense: 'だ',
  PastTense: 'だった',
  Negative: 'じゃない',
  PastNegative: 'じゃなかった',
  Gerund: 'で',
  Polite: 'です',
  PolitePast: 'でした',
  PoliteNegative: 'じゃありません',
  PolitePastNegative: 'じゃありませんでした',
  Presumptive: 'だろう',
  Provisional: 'なら',
}

export { findForms, toKey, fromKey, copulaForms }
