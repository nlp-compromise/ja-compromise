import { deconjugate, conjugateVerb } from '../../../01-one/conjugate/index.js'
import { isSecondVerb } from '../../../01-one/conjugate/compound.js'
import lexicon, { roots } from '../../../01-one/lexicon/lexicon.js'

const reason = 'verbSuffix'
const isKnown = (w) => lexicon.hasOwnProperty(w)
const scriptOnly = new Set(['Kanji', 'Hiragana', 'Katakana', 'Ascii'])

const hasTag = (word, tag) => isKnown(word) && [].concat(lexicon[word]).includes(tag)

// 走り出した is 走り + 出した - a verb's stem, and a second verb.
// it conjugates on its second half, so that's where its tags come from
const compoundVerb = function (str) {
  for (let i = str.length - 2; i >= 1; i -= 1) {
    const stem = str.slice(0, i)
    const second = str.slice(i)
    if (hasTag(stem, 'VerbStem') && hasTag(second, 'Verb') && isSecondVerb(roots[second] || second)) {
      return { tags: [].concat(lexicon[second]), root: stem + (roots[second] || second) }
    }
  }
  return null
}

// a verb we've never seen can still be read off its ending.
// 「散歩した」 is a verb even if 散歩する isn't in the lexicon.
const tagUnknownVerbs = function (terms, setTag, world) {
  terms.forEach(term => {
    // only guess at words the lexicon hasn't already resolved.
    // すみません is an expression, not the negative of a verb 済む.
    const known = [...term.tags].some(t => !scriptOnly.has(t))
    if (known) {
      return
    }
    if (term.text.length < 2) {
      return
    }
    const compound = compoundVerb(term.text)
    if (compound !== null) {
      compound.tags.forEach(tag => setTag([term], tag, world, null, 'compoundVerb'))
      term.root = compound.root
      return
    }
    const found = deconjugate(term.text, isKnown)
    if (!found || found.guess === true) {
      return
    }
    found.tags.forEach(tag => setTag([term], tag, world, null, reason))
    term.root = roots[found.root] || found.root
  })
}

// する attaches to the noun before it - 「勉強 します」
const tagSuruVerbs = function (terms, setTag, world) {
  for (let i = 1; i < terms.length; i += 1) {
    const t = terms[i]
    if (!t.tags.has('Verb')) {
      continue
    }
    if (/^[しすさ]/.test(t.text) === false) {
      continue
    }
    const prev = terms[i - 1]
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
  const set = new Set()
  list.forEach(dict => {
    const forms = conjugateVerb(dict)
    if (forms) {
      Object.keys(forms).forEach(k => typeof forms[k] === 'string' && set.add(forms[k]))
    }
  })
  return set
}
const isAspect = formsOf(aspectVerbs)
const isHelper = formsOf(otherHelpers)

const tagCompoundVerbs = function (terms, setTag, world) {
  for (let i = 1; i < terms.length; i += 1) {
    const t = terms[i]
    const prev = terms[i - 1]
    if (!prev || !prev.tags.has('Gerund') || !t.tags.has('Verb')) {
      continue
    }
    if (!isAspect.has(t.text) && !isHelper.has(t.text)) {
      continue
    }
    // 読んで|いる is two terms, but one progressive verb - #Progressive finds both
    if (isAspect.has(t.text)) {
      setTag([prev, t], 'Progressive', world, null, 'compoundVerb')
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
    const t = terms[i]
    if (!t.tags.has('Auxiliary')) {
      continue
    }
    const prev = terms[i - 1]
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
export { isAspect, isHelper }
