import lexData from './_data.js'
import { unpack } from 'efrt'
import { conjugateVerb, conjugateAdjective, conjugateNaAdjective } from '../conjugate/index.js'
import { verbForms, adjForms, naAdjForms, desireForms, derivedForms } from '../conjugate/tags.js'
import misc from './misc.js'

// tags in _data.js that describe *how a word conjugates*, not what it is
// const verbHint = {
//   Godan: 'Godan',
//   Ichidan: 'Ichidan',
//   IrregularVerb: null,
//   SuruVerb: null,
// }

let lexicon = {}
// surface-form → dictionary-form, so 食べました can report 食べる
let roots = {}
// weak entries (generated forms) never overwrite a strong one (a listed word)
let strong = new Set()

const add = function (word, tags, isStrong) {
  if (!word) {
    return
  }
  if (strong.has(word) && !isStrong) {
    return
  }
  if (isStrong) {
    // a word can be listed twice - 毎朝 is a #Date and a #Noun.  keep both,
    // and let the tagset sort out any that genuinely conflict
    if (strong.has(word)) {
      let both = new Set([].concat(lexicon[word], tags))
      lexicon[word] = [...both]
      return
    }
    strong.add(word)
  }
  lexicon[word] = tags
}

// the derived stems - 褒められる, 書ける, 食べさせる - inflect like ichidan
// verbs in their own right, so give each of them a paradigm too
const derived = ['Potential', 'Passive', 'Causative', 'CausativePassive']

const addDerived = function (base, baseTags, dict) {
  let forms = conjugateVerb(base, 'Ichidan')
  if (!forms) {
    return
  }
  Object.keys(derivedForms).forEach(form => {
    let str = forms[form]
    if (str && str !== base) {
      add(str, ['Verb'].concat(baseTags, derivedForms[form]))
      if (roots[str] === undefined) {
        roots[str] = dict || base
      }
    }
  })
}

// expand a dictionary-form verb into every surface-form it can take
const addVerb = function (dict, hint) {
  let forms = conjugateVerb(dict, hint)
  if (!forms) {
    return
  }
  Object.keys(verbForms).forEach(form => {
    let str = forms[form]
    if (!str || str === dict) {
      return
    }
    // a bare kana masu-stem is a tokenizer hazard - のり (乗り) would eat
    // the front of 「のりこ」.  keep 泳ぎ and 読み, drop のり and きり.
    if (form === 'Stem' && !/[一-龯]/.test(str)) {
      return
    }
    add(str, verbForms[form])
    if (roots[str] === undefined) {
      roots[str] = dict
    }
  })
  // 食べたい inflects like an adjective
  let want = conjugateAdjective(forms.Desire)
  if (want) {
    Object.keys(desireForms).forEach(form => {
      let str = want[form]
      if (str) {
        add(str, desireForms[form])
        if (roots[str] === undefined) {
          roots[str] = dict
        }
      }
    })
  }
  derived.forEach(form => {
    if (forms[form]) {
      addDerived(forms[form], form === 'CausativePassive' ? ['Causative', 'Passive'] : [form], dict)
    }
  })
  add(dict, verbForms.Infinitive, true)
}

const addAdjective = function (word) {
  let forms = conjugateAdjective(word)
  if (forms) {
    Object.keys(adjForms).forEach(form => {
      let str = forms[form]
      if (str && str !== word) {
        add(str, adjForms[form])
        if (roots[str] === undefined) {
          roots[str] = word
        }
      }
    })
  }
  add(word, adjForms.Infinitive, true)
}

const addNaAdjective = function (word) {
  let forms = conjugateNaAdjective(word)
  Object.keys(naAdjForms).forEach(form => {
    let str = forms[form]
    if (str && str !== word) {
      add(str, naAdjForms[form])
    }
  })
  add(word, naAdjForms.Infinitive, true)
}

// ---- 1. generated forms first, so listed words can override them ----
const unpacked = {}
Object.keys(lexData).forEach(tag => {
  unpacked[tag] = Object.keys(unpack(lexData[tag]))
})

;(unpacked.Godan || []).forEach(w => addVerb(w, 'Godan'))
;(unpacked.Ichidan || []).forEach(w => addVerb(w, 'Ichidan'))
;(unpacked.IrregularVerb || []).forEach(w => addVerb(w))
// 勉強 is a noun *and* the root of 勉強する
;(unpacked.SuruVerb || []).forEach(w => {
  addVerb(w + 'する')
  add(w, ['Noun', 'SuruVerb'], true)
})
;(unpacked.Adjective || []).forEach(w => addAdjective(w))
;(unpacked.NaAdjective || []).forEach(w => addNaAdjective(w))

// ---- 2. everything else is a plain word-list ----
const skip = new Set(['Godan', 'Ichidan', 'IrregularVerb', 'SuruVerb', 'Adjective', 'NaAdjective'])
Object.keys(unpacked).forEach(tag => {
  if (skip.has(tag)) {
    return
  }
  unpacked[tag].forEach(w => add(w, tag, true))
})

// ---- 3. hand-written entries win over everything ----
Object.keys(misc).forEach(w => {
  lexicon[w] = misc[w]
  strong.add(w)
})

export default lexicon
export { roots }
