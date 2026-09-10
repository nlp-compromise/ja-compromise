import { aRow, iRow, eRow, oRow } from './kana.js'
import conjugateVerb from './conjugate-verb.js'

// reverse the vowel-row tables, so we can walk a conjugated form back to its dictionary-form
const invert = (obj) => Object.keys(obj).reduce((h, k) => { h[obj[k]] = k; return h }, {})
const fromA = invert(aRow)
const fromI = invert(iRow)
const fromE = invert(eRow)
const fromO = invert(oRow)

// which 音便 endings can come from which dictionary-endings
// ordered by how common the dictionary-ending is, since 走って could in
// principle come from 走う/走つ/走る - only one of which is a real word
const fromTe = {
  'って': ['る', 'う', 'つ'],
  'んで': ['む', 'ぶ', 'ぬ'],
  'いて': ['く'],
  'いで': ['ぐ'],
  'して': ['す'],
  'て': [], // bare て means an ichidan stem
}

const defaultDict = function (stem, base) {
  let last = stem[stem.length - 1]
  let head = stem.slice(0, -1)
  let out = []
  if (base === 'neg') {
    if (fromA[last]) out.push(head + fromA[last]) // 書か → 書く
    out.push(stem + 'る') // 食べ → 食べる
  } else if (base === 'masu') {
    if (fromI[last]) out.push(head + fromI[last]) // 書き → 書く
    out.push(stem + 'る') // 食べ → 食べる
  } else if (base === 'cond') {
    if (fromE[last]) out.push(head + fromE[last]) // 書け → 書く
    out.push(head + fromE[last] + 'る') // 食べれ → 食べる (via れ)
  } else if (base === 'volit') {
    if (fromO[last]) out.push(head + fromO[last]) // 書こ → 書く
  } else if (base === 'te' || base === 'ta') {
    if (stem === 'し' || stem === 'き' || stem === '来') {
      return [stem === 'し' ? 'する' : '来る']
    }
    // the ending was already consumed, so `stem` still carries the 音便 kana
    let two = stem.slice(-1) // っ or ん or い
    if (two === 'っ') {
      fromTe['って'].forEach((c) => out.push(stem.slice(0, -1) + c))
      // 行く is the one く-verb that takes って - 行った, not 行いた
      out.push(stem.slice(0, -1) + 'く')
    } else if (two === 'ん') {
      fromTe['んで'].forEach((c) => out.push(stem.slice(0, -1) + c))
    } else if (two === 'い') {
      out.push(stem.slice(0, -1) + 'く', stem.slice(0, -1) + 'ぐ')
    } else if (two === 'し') {
      out.push(stem.slice(0, -1) + 'す')
    }
    out.push(stem + 'る') // ichidan: 食べ + た
  }
  return out.filter((s) => s && s.length > 1)
}


// the suffixes we know how to strip, longest-first.
// `base` says which of the five 活用形 the remaining stem is.
let suffixes = [
  ['ませんでした', ['Verb', 'PastTense', 'Polite', 'Negative'], 'masu'],
  ['なかったら', ['Verb', 'ConditionalVerb', 'Negative'], 'neg'],
  ['なければ', ['Verb', 'ConditionalVerb', 'Negative'], 'neg'],
  ['ましょう', ['Verb', 'Volitional', 'Polite'], 'masu'],
  ['なかった', ['Verb', 'PastTense', 'Negative'], 'neg'],
  ['ないで', ['Verb', 'Gerund', 'Negative'], 'neg'],
  ['なくて', ['Verb', 'Gerund', 'Negative'], 'neg'],
  ['ません', ['Verb', 'PresentTense', 'Polite', 'Negative'], 'masu'],
  ['ました', ['Verb', 'PastTense', 'Polite'], 'masu'],
  ['ながら', ['Verb', 'Continuative'], 'masu'],
  ['させる', ['Verb', 'Causative', 'PresentTense'], 'neg'],
  ['させられる', ['Verb', 'Causative', 'Passive', 'PresentTense'], 'neg'],
  ['られる', ['Verb', 'Passive', 'PresentTense'], 'neg'],
  ['たがる', ['Verb', 'Desire', 'PresentTense'], 'masu'],
  ['ます', ['Verb', 'PresentTense', 'Polite'], 'masu'],
  ['ない', ['Verb', 'PresentTense', 'Negative'], 'neg'],
  ['れる', ['Verb', 'Passive', 'PresentTense'], 'neg'],
  ['せる', ['Verb', 'Causative', 'PresentTense'], 'neg'],
  ['たい', ['Verb', 'Desire'], 'masu'],
  ['そう', ['Verb', 'Presumptive'], 'masu'],
  ['すぎる', ['Verb', 'PresentTense'], 'masu'],
  ['たら', ['Verb', 'ConditionalVerb'], 'ta'],
  ['だら', ['Verb', 'ConditionalVerb'], 'ta'],
  ['たり', ['Verb', 'Representative'], 'ta'],
  ['だり', ['Verb', 'Representative'], 'ta'],
  ['ている', ['Verb', 'Progressive', 'PresentTense'], 'te'],
  ['でいる', ['Verb', 'Progressive', 'PresentTense'], 'te'],
  ['ています', ['Verb', 'Progressive', 'PresentTense', 'Polite'], 'te'],
  ['でいます', ['Verb', 'Progressive', 'PresentTense', 'Polite'], 'te'],
  ['ていた', ['Verb', 'Progressive', 'PastTense'], 'te'],
  ['でいた', ['Verb', 'Progressive', 'PastTense'], 'te'],
  ['てる', ['Verb', 'Progressive', 'PresentTense'], 'te'],
  ['でる', ['Verb', 'Progressive', 'PresentTense'], 'te'],
  ['た', ['Verb', 'PastTense'], 'ta'],
  ['だ', ['Verb', 'PastTense'], 'ta'],
  ['て', ['Verb', 'Gerund'], 'te'],
  ['で', ['Verb', 'Gerund'], 'te'],
  ['ば', ['Verb', 'ConditionalVerb'], 'cond'],
  ['よう', ['Verb', 'Volitional'], 'neg', 'strict'],
  ['う', ['Verb', 'Volitional'], 'volit', 'strict'],
]
// always try the longest ending first - ています must win over ます
suffixes.sort((a, b) => b[0].length - a[0].length)

// walk a stem in a given 活用形 back to candidate dictionary-forms
// する and 来る don't decompose like anything else - their stem changes shape
const suruStem = new Set(['し', 'さ', 'せ', 'す'])
const kuruStem = new Set(['き', 'こ', 'く', '来'])

const toDict = function (stem, base) {
  if (!stem) {
    return []
  }
  let last = stem[stem.length - 1]
  let pre = stem.slice(0, -1)
  // a bare し/き is する/来る
  if (stem.length === 1) {
    if (suruStem.has(last)) return ['する']
    if (kuruStem.has(last)) return ['来る']
  }
  // 勉強し could be 勉強する or a godan 勉強す - a two-character head is
  // almost always a する-noun (勉強する), a one-character head almost always
  // a godan verb (話す, 出す, 貸す).
  if (suruStem.has(last)) {
    let rest = defaultDict(stem, base)
    return pre.length >= 2 ? [pre + 'する'].concat(rest) : rest.concat([pre + 'する'])
  }
  return defaultDict(stem, base)
}

/**
 * take a conjugated verb and work backwards to its dictionary-form.
 * `isKnown` lets the caller disambiguate 書いた (書く) from a hypothetical 書いる.
 */
const deconjugate = function (str, isKnown) {
  if (!str || str.length < 2) {
    return null
  }
  for (let i = 0; i < suffixes.length; i += 1) {
    let [suffix, tags, base, strict] = suffixes[i]
    if (!str.endsWith(suffix) || str.length <= suffix.length) {
      continue
    }
    let stem = str.slice(0, -suffix.length)
    // 'た'/'だ'/'て'/'で' hang off the 音便 kana, which belongs to the stem
    let candidates = toDict(stem, base)
    if (candidates.length === 0) {
      continue
    }
    let hit = isKnown ? candidates.find(isKnown) : null
    // a 'strict' suffix is too common a word-ending to trust on its own -
    // 「たろう」 is a name, not the volitional of 「たる」
    if (strict && !hit) {
      continue
    }
    let root = hit || candidates[0]
    // sanity-check: does re-conjugating the root actually produce this string?
    if (hit) {
      return { root, tags, candidates }
    }
    let verified = candidates.find(c => {
      let forms = conjugateVerb(c)
      return forms && Object.keys(forms).some(k => forms[k] === str)
    })
    if (verified) {
      return { root: verified, tags, candidates }
    }
    return { root, tags, candidates, guess: true }
  }
  return null
}

export default deconjugate
// exported so tests/tagset.test.js can check these tags are declared
export { suffixes }
