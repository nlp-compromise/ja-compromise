import { isKanji } from '../../../01-one/tokenizer/methods/lib.js'

const reason = 'adjSuffix'

// い-adjective endings.  the old rule was 'ends in い → Adjective', which
// swallowed every negative verb (行かない), every masu-stem noun (お願い),
// and 弟/はい/せい besides.
const looksAdjective = /(し|た|な|か|ら|わ|が|ば|ざ|さ|は|ま|よ|る|す|つ|ぬ|ぶ|む|ぐ|ゆ|ろ|そ|お|こ|の|ほ|も|ど|ぼ|ぽ|ご|ぞ|づ|べ|で|げ|ぜ|え|け|せ|て|ね|へ|め|れ)い$/
// endings that look like an い-adjective but aren't
const notAdjective = /(ない|たい|らしい|っぽい)$/

const adjSuffixes = function (terms, setTag, world) {
  terms.forEach(term => {
    let str = term.text
    if (term.tags.size > 1 || term.tags.has('Verb') || term.tags.has('Adjective')) {
      return
    }
    if (str.length < 3 || !str.endsWith('い')) {
      return
    }
    // ない/たい are verb endings, and are already handled as such
    if (notAdjective.test(str) && !term.tags.has('Adjective')) {
      return
    }
    // 美しい - kanji stem plus a hiragana tail is the classic shape
    if (isKanji(str[0]) && looksAdjective.test(str)) {
      setTag([term], 'Adjective', world, null, reason)
      setTag([term], 'IAdjective', world, null, reason)
    }
  })
}

// 〜さ nominalises an adjective (高さ), 〜たち pluralises a noun (子供たち)
const nounSuffixes = function (terms, setTag, world) {
  terms.forEach(term => {
    if (term.text.length > 2 && /(たち|達)$/.test(term.text)) {
      setTag([term], 'Plural', world, null, 'nounSuffix')
      setTag([term], 'Noun', world, null, 'nounSuffix')
    }
  })
}

export default { adjSuffixes, nounSuffixes }
