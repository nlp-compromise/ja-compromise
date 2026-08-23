import { iRowKana, eRowKana, godanEnding } from './kana.js'

// -る verbs are genuinely ambiguous: 帰る is godan, but 変える is ichidan.
// when the stem is spelled in kanji the vowel is hidden, so we need word-lists.

// 一段 verbs the vowel-heuristic can't see (kanji sits right before the る)
const ichidan = `見る 着る 似る 煮る 干る 射る 鋳る 居る 出る 得る 経る 寝る
  生きる 起きる 過ぎる 落ちる 尽きる 飽きる 降りる 借りる 足りる 浴びる 滅びる 錆びる
  感じる 信じる 禁じる 命じる 応じる 通じる 生じる 存じる 論じる 演じる 転じる 案じる 講じる 恥じる
  老いる 用いる 報いる 強いる 悔いる 延びる 伸びる 帯びる 詫びる 綻びる 懲びる 出来る
  みる きる にる でる える ねる いる いきる おきる すぎる おちる おりる かりる たりる あびる`.split(/\s+/)

// 五段 verbs that *look* ichidan (an i/e-row kana sits before the る) but aren't.
// mostly matters for the kana spellings - kanji spellings already default to godan.
const godanRu = `帰る 返る 入る 要る 走る 知る 切る 限る 減る 練る 照る 滑る 握る 焦る
  脂ぎる 覆る 遮る 罵る 湿る 茂る 参る 交じる 混じる 陥る 侮る 嘲る 憚る 滾る 捻る 抓る 契る 齧る
  喋る 縋る 蘇る 甦る 詰る 罷る 迸る 阿る 熱る 散る 蹴る 耽る ふける
  かえる はいる はしる しる きる かぎる へる ねる てる すべる にぎる あせる ちる
  まじる しゃべる かじる ひねる くつがえる さえぎる ののしる しめる しげる まいる おちいる
  あなどる あざける はばかる なじる まかる ほとばしる ほてる ちぎる よみがえる すがる つねる
  たぎる おもねる いじる ける よぎる まざる ねじる
  打ち切る 思い切る 張り切る 立ち返る 生き返る 寝返る 立ち入る 押し入る 気に入る 見入る 恐れ入る`
  .split(/\s+/).filter(w => /る$/.test(w))

let isIchidan = new Set(ichidan.filter(w => /る$/.test(w)))
let isGodanRu = new Set(godanRu)

// verbs with a paradigm of their own
const irregular = {
  'する': 'suru',
  '為る': 'suru',
  'くる': 'kuru',
  '来る': 'kuru',
  'ある': 'aru',
  '有る': 'aru',
  '在る': 'aru',
  '行く': 'iku',
  'いく': 'iku',
  '逝く': 'iku',
  '往く': 'iku',
  '問う': 'ou',
  '請う': 'ou',
  '乞う': 'ou',
  '下さる': 'aru5',
  'くださる': 'aru5',
  'なさる': 'aru5',
  '為さる': 'aru5',
  'おっしゃる': 'aru5',
  '仰る': 'aru5',
  'いらっしゃる': 'aru5',
  'ござる': 'aru5',
  '御座る': 'aru5',
}

/** which conjugation-family does this dictionary-form belong to? */
const verbClass = function (dict, hint) {
  // an irregular is irregular even when the word-list calls it godan - 行く
  // is listed as a godan verb but its て-form is 行って, not 行いて
  if (irregular[dict]) {
    return irregular[dict]
  }
  if (hint === 'Ichidan' || hint === 'Godan') {
    return hint.toLowerCase()
  }
  // an explicit listing beats any compound-guess - 出来る ends in 来る but is
  // an ordinary ichidan verb, not a compound of 来る
  if (isIchidan.has(dict)) {
    return 'ichidan'
  }
  // -する compounds, like 勉強する
  if (dict.length > 2 && dict.endsWith('する')) {
    return 'suru'
  }
  // -来る compounds are always て-form + 来る: 持って来る, やって来る
  if (dict.length > 3 && /[てで](来る|くる)$/.test(dict)) {
    return 'kuru'
  }
  let last = dict[dict.length - 1]
  if (!godanEnding.has(last)) {
    return null // not a shape we can conjugate
  }
  if (last !== 'る') {
    return 'godan' // う/く/ぐ/す/つ/ぬ/ぶ/む are unambiguous
  }
  if (isIchidan.has(dict)) {
    return 'ichidan'
  }
  if (isGodanRu.has(dict)) {
    return 'godan'
  }
  // derived stems keep their ichidan shape - 食べさせる, 読まれる, 書ける
  if (/(せる|させる|れる|られる)$/.test(dict) && dict.length > 2) {
    return 'ichidan'
  }
  let before = dict[dict.length - 2]
  // an i-row or e-row kana before る is a good ichidan signal
  if (iRowKana.has(before) || eRowKana.has(before)) {
    return 'ichidan'
  }
  // ..otherwise assume godan, the larger class
  return 'godan'
}

export default verbClass
export { isIchidan, isGodanRu, irregular }
