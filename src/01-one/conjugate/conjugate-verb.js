import { aRow, iRow, eRow, oRow, teRow } from './kana.js'
import verbClass from './verb-class.js'

// the five 'bases' every japanese verb form is built out of.
// get these right and every suffix falls out of them.
const toBases = function (dict, cls) {
  let stem = dict.slice(0, -1)
  let last = dict[dict.length - 1]
  switch (cls) {
    case 'godan':
      return {
        negStem: stem + aRow[last],   // 未然形 - 書か
        stem: stem + iRow[last],      // 連用形 - 書き
        cond: stem + eRow[last],      // 仮定形 - 書け
        imper: stem + eRow[last],     // 命令形 - 書け
        volit: stem + oRow[last] + 'う', // 意向形 - 書こう
        te: stem + teRow[last],       // て形   - 書いて
        potential: stem + eRow[last] + 'る',
        passive: stem + aRow[last] + 'れる',
        causative: stem + aRow[last] + 'せる',
      }
    case 'ichidan': {
      let s = dict.slice(0, -1) // 食べ
      return {
        negStem: s, stem: s, cond: s + 'れ', imper: s + 'ろ',
        volit: s + 'よう', te: s + 'て',
        potential: s + 'られる', passive: s + 'られる', causative: s + 'させる',
      }
    }
    case 'suru': {
      let pre = dict.slice(0, -2) // 勉強
      return {
        negStem: pre + 'し', stem: pre + 'し', cond: pre + 'すれ', imper: pre + 'しろ',
        volit: pre + 'しよう', te: pre + 'して',
        potential: pre === '' ? 'できる' : pre + 'できる',
        passive: pre + 'される', causative: pre + 'させる',
      }
    }
    case 'kuru': {
      let pre = dict.slice(0, -2)
      let kana = dict.endsWith('くる')
      let ko = kana ? 'こ' : '来'
      let ki = kana ? 'き' : '来'
      let ku = kana ? 'く' : '来'
      return {
        negStem: pre + ko, stem: pre + ki, cond: pre + ku + 'れ', imper: pre + ko + 'い',
        volit: pre + ko + 'よう', te: pre + ki + 'て',
        potential: pre + ko + 'られる', passive: pre + ko + 'られる', causative: pre + ko + 'させる',
      }
    }
    case 'aru': {
      let s = dict.slice(0, -1) // あ / 有 / 在
      return {
        negStem: null, // ある has no 未然形 - its negative is just ない
        stem: s + 'り', cond: s + 'れ', imper: s + 'れ', volit: s + 'ろう', te: s + 'って',
        potential: s + 'れる', passive: s + 'られる', causative: s + 'らせる',
      }
    }
    case 'iku': { // 行く takes って, not the regular いて
      let s = dict.slice(0, -1)
      return {
        negStem: s + 'か', stem: s + 'き', cond: s + 'け', imper: s + 'け', volit: s + 'こう',
        te: s + 'って',
        potential: s + 'ける', passive: s + 'かれる', causative: s + 'かせる',
      }
    }
    case 'ou': { // 問う/請う keep うて rather than って
      let s = dict.slice(0, -1)
      return {
        negStem: s + 'わ', stem: s + 'い', cond: s + 'え', imper: s + 'え', volit: s + 'おう',
        te: s + 'うて',
        potential: s + 'える', passive: s + 'われる', causative: s + 'わせる',
      }
    }
    case 'aru5': { // くださる/なさる - godan, but the masu-stem drops the り
      let s = dict.slice(0, -1)
      return {
        negStem: s + 'ら', stem: s + 'い', cond: s + 'れ', imper: s + 'い', volit: s + 'ろう',
        te: s + 'って',
        potential: s + 'れる', passive: s + 'られる', causative: s + 'らせる',
      }
    }
    default:
      return null
  }
}

// て → た,  で → だ
const teToTa = (te) => te.replace(/て$/, 'た').replace(/で$/, 'だ')

/** produce the full paradigm of a dictionary-form verb */
const conjugate = function (dict, hint) {
  let cls = verbClass(dict, hint)
  if (!cls) {
    return null
  }
  let b = toBases(dict, cls)
  if (!b) {
    return null
  }
  // ある is the one verb whose plain negative isn't built on a 未然形
  let negative = b.negStem === null ? 'ない' : b.negStem + 'ない'
  let pastNegative = b.negStem === null ? 'なかった' : b.negStem + 'なかった'
  let te = b.te
  let past = teToTa(te)

  return {
    class: cls,
    Infinitive: dict,               // 辞書形 - 書く
    Stem: b.stem,                   // 連用形 - 書き
    PresentTense: dict,
    PastTense: past,                // 書いた
    Negative: negative,             // 書かない
    PastNegative: pastNegative,     // 書かなかった
    Gerund: te,                     // 書いて  (て形)
    NegativeGerund: b.negStem === null ? 'なくて' : b.negStem + 'なくて',
    Polite: b.stem + 'ます',         // 書きます
    PolitePast: b.stem + 'ました',    // 書きました
    PoliteNegative: b.stem + 'ません', // 書きません
    PolitePastNegative: b.stem + 'ませんでした',
    PoliteVolitional: b.stem + 'ましょう',
    Imperative: b.imper,            // 書け
    NegativeImperative: dict + 'な', // 書くな
    PoliteImperative: te + 'ください',
    Volitional: b.volit,            // 書こう
    Potential: b.potential,         // 書ける
    Passive: b.passive,             // 書かれる
    Causative: b.causative,         // 書かせる
    CausativePassive: b.causative.replace(/せる$/, 'せられる'),
    Conditional: past + 'ら',        // 書いたら (たら)
    Provisional: b.cond + 'ば',      // 書けば  (ば)
    Progressive: te + 'いる',        // 書いている
    ProgressivePolite: te + 'います',
    PastProgressive: te + 'いた',
    Desire: b.stem + 'たい',          // 書きたい
    Representative: past + 'り',      // 書いたり
    Presumptive: dict + 'だろう',
    Continuative: b.stem + 'ながら',   // 書きながら
  }
}

export default conjugate
export { toBases, teToTa }
