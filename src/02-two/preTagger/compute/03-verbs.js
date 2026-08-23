import { deconjugate, conjugateVerb } from '../../../01-one/conjugate/index.js'
import lexicon from '../../../01-one/lexicon/lexicon.js'

const reason = 'verbSuffix'
const isKnown = (w) => lexicon.hasOwnProperty(w)
const scriptOnly = new Set(['Kanji', 'Hiragana', 'Katakana', 'Ascii'])

// a verb we've never seen can still be read off its ending.
// 「散歩した」 is a verb even if 散歩する isn't in the lexicon.
const tagUnknownVerbs = function (terms, setTag, world) {
  terms.forEach(term => {
    // only guess at words the lexicon hasn't already resolved.
    // すみません is an expression, not the negative of a verb 済む.
    let known = [...term.tags].some(t => !scriptOnly.has(t))
    if (known) {
      return
    }
    if (term.text.length < 2) {
      return
    }
    let found = deconjugate(term.text, isKnown)
    if (!found || found.guess === true) {
      return
    }
    found.tags.forEach(tag => setTag([term], tag, world, null, reason))
    term.root = found.root
  })
}

// する attaches to the noun before it - 「勉強 します」
const tagSuruVerbs = function (terms, setTag, world) {
  for (let i = 1; i < terms.length; i += 1) {
    let t = terms[i]
    if (!t.tags.has('Verb')) {
      continue
    }
    if (/^(し|す|さ)/.test(t.text) === false) {
      continue
    }
    let prev = terms[i - 1]
    if (prev && prev.tags.has('SuruVerb')) {
      setTag([prev], 'Verb', world, null, 'suruVerb')
    }
  }
}

// 〜て + いる/ある/おく/しまう - the helper verb carries the aspect,
// but the meaning belongs to the て-form in front of it
// 〜ている marks aspect;  〜てしまう, 〜てくれる and friends only add nuance
const aspectVerbs = ['いる', '居る', 'おる', 'ある']
const otherHelpers = ['おく', 'しまう', '来る', 'くる', '行く', 'いく', 'みる', '見る', 'あげる', 'くれる', 'もらう']

// every surface-form of every helper, so we can recognise いました / しまった
const formsOf = function (list) {
  let set = new Set()
  list.forEach(dict => {
    let forms = conjugateVerb(dict)
    if (forms) {
      Object.keys(forms).forEach(k => typeof forms[k] === 'string' && set.add(forms[k]))
    }
  })
  return set
}
let isAspect = formsOf(aspectVerbs)
let isHelper = formsOf(otherHelpers)

const tagCompoundVerbs = function (terms, setTag, world) {
  for (let i = 1; i < terms.length; i += 1) {
    let t = terms[i]
    let prev = terms[i - 1]
    if (!prev || !prev.tags.has('Gerund') || !t.tags.has('Verb')) {
      continue
    }
    if (!isAspect.has(t.text) && !isHelper.has(t.text)) {
      continue
    }
    if (isAspect.has(t.text)) {
      setTag([prev], 'Progressive', world, null, 'compoundVerb')
    }
    ;['PastTense', 'Negative', 'Polite'].forEach(tag => {
      if (t.tags.has(tag)) {
        setTag([prev], tag, world, null, 'compoundVerb')
      }
    })
  }
}

// an auxiliary hands its tense back to the verb it attaches to
const tagAuxiliary = function (terms, setTag, world) {
  for (let i = 1; i < terms.length; i += 1) {
    let t = terms[i]
    if (!t.tags.has('Auxiliary')) {
      continue
    }
    let prev = terms[i - 1]
    if (!prev) {
      continue
    }
    if (!prev.tags.has('Verb') && !prev.tags.has('Adjective') && !prev.tags.has('Noun')) {
      setTag([prev], 'Verb', world, null, 'beforeAuxiliary')
    }
    // ませんでした after 行き makes the whole phrase past-polite-negative
    ;['PastTense', 'PresentTense', 'Negative', 'Polite'].forEach(tag => {
      if (t.tags.has(tag) && prev.tags.has('Verb')) {
        setTag([prev], tag, world, null, 'fromAuxiliary')
      }
    })
  }
}

export default { tagUnknownVerbs, tagSuruVerbs, tagAuxiliary, tagCompoundVerbs }
