// the japanese-specific shapes: conjugation paradigms and verb classes.

/** which paradigm a verb follows */
export type VerbClass =
  | 'godan'    // 五段 - 書く, 話す, 帰る
  | 'ichidan'  // 一段 - 食べる, 見る
  | 'suru'     // する, and every 〜する compound
  | 'kuru'     // 来る, and て-form + 来る
  | 'aru'      // ある - its negative is ない, not あらない
  | 'iku'      // 行く - its て-form is 行って, not 行いて
  | 'ou'       // 問う, 請う - 問うて, not 問って
  | 'aru5'     // くださる, なさる, いらっしゃる - masu-stem drops the り

/** every form of a verb, built from its dictionary-form */
export interface VerbConjugation {
  /** which paradigm produced these */
  class: VerbClass
  /** 辞書形 - 書く */
  Infinitive: string
  /** 連用形, the 'masu-stem' - 書き */
  Stem: string
  /** 書く */
  PresentTense: string
  /** 書いた */
  PastTense: string
  /** 書かない */
  Negative: string
  /** 書かなかった */
  PastNegative: string
  /** て形 - 書いて */
  Gerund: string
  /** 書かなくて */
  NegativeGerund: string
  /** 書きます */
  Polite: string
  /** 書きました */
  PolitePast: string
  /** 書きません */
  PoliteNegative: string
  /** 書きませんでした */
  PolitePastNegative: string
  /** 書きましょう */
  PoliteVolitional: string
  /** 命令形 - 書け */
  Imperative: string
  /** 書くな */
  NegativeImperative: string
  /** 書こう */
  Volitional: string
  /** 可能形 - 書ける */
  Potential: string
  /** 受身形 - 書かれる */
  Passive: string
  /** 使役形 - 書かせる */
  Causative: string
  /** 書かせられる */
  CausativePassive: string
  /** 〜たら - 書いたら */
  Conditional: string
  /** 〜ば - 書けば */
  Provisional: string
  /** 書いている */
  Progressive: string
  /** 書いています */
  ProgressivePolite: string
  /** 書いていた */
  PastProgressive: string
  /** 書きたい */
  Desire: string
  /** 〜たり - 書いたり */
  Representative: string
  /** 書くだろう */
  Presumptive: string
  /** 書きながら */
  Continuative: string
}

/** every form of an い-adjective */
export interface IAdjectiveConjugation {
  /** 高い */
  Infinitive: string
  PresentTense: string
  /** 高くない */
  Negative: string
  /** 高かった */
  PastTense: string
  /** 高くなかった */
  PastNegative: string
  /** 高くて */
  Gerund: string
  /** 高く */
  Adverb: string
  /** 高ければ */
  Provisional: string
  /** 高かろう */
  Presumptive: string
  /** 高いです */
  Polite: string
  /** 高かったです */
  PolitePast: string
  /** 高くないです */
  PoliteNegative: string
  /** 高すぎる */
  Superlative: string
  /** 高そう */
  Impression: string
  /** 高さ */
  Nominal: string
}

/** every form of a な-adjective. it inflects with the copula */
export interface NaAdjectiveConjugation {
  /** 静か */
  Infinitive: string
  /** 静かな */
  Adnominal: string
  /** 静かだ */
  PresentTense: string
  /** 静かじゃない */
  Negative: string
  /** 静かだった */
  PastTense: string
  /** 静かじゃなかった */
  PastNegative: string
  /** 静かで */
  Gerund: string
  /** 静かに */
  Adverb: string
  /** 静かです */
  Polite: string
  /** 静かでした */
  PolitePast: string
  /** 静かじゃありません */
  PoliteNegative: string
  /** 静かなら */
  Provisional: string
}

/** the result of walking a conjugated verb back to its dictionary-form */
export interface Deconjugation {
  /** the dictionary-form - 書きました → 書く */
  root: string
  /** what the ending told us - ['Verb', 'PastTense', 'Polite'] */
  tags: string[]
  /** every dictionary-form the ending could have come from */
  candidates: string[]
  /** true when no candidate could be confirmed, and `root` is a guess */
  guess?: boolean
}

/** what `.numbers().parse()` reports about a number */
export interface NumberParse {
  /** the value, or null if it couldn't be read */
  num: number | null
  /** written in kanji (二十三) rather than digits */
  kanji: boolean
  /** written in full-width digits (２３) */
  wide: boolean
}
