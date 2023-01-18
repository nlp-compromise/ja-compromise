// the conjugations are ordered in such a way that when run in sequence they lead to proper deconstruction
const forms = {
  polite_negative_presumptive: ["わないだろう", "かないだろう", "がないだろう", "さないだろう", "たないだろう", "まないだろう", "ばないだろう", "なないだろう", "らないだろう", "ないだろう"],
  polite_presumptive: ["うでしょう", "くでしょう", "ぐでしょう", "すでしょう", "つでしょう", "むでしょう", "ぶでしょう", "ぬでしょう", "るでしょう", "るでしょう"],
  polite_negative: ["いません", "きません", "ぎません", "しません", "ちません", "みません", "びません", "にません", "りません", "ません"],
  others_desire: ["いたがる", "きたがる", "ぎたがる", "したがる", "ちたがる", "みたがる", "びたがる", "にたがる", "りたがる", "たがる"],
  simplified_te_ageru: ["ったげる", "いたげる", "いだげる", "したげる", "ったげる", "んだげる", "んだげる", "んだげる", "ったげる", "たげる"],
  te_iru: ["っている", "いている", "いでいる", "している", "っている", "んでいる", "んでいる", "んでいる", "っている", "ている"],
  te_aru: ["ってある", "いてある", "いである", "してある", "ってある", "んである", "んである", "んである", "ってある", "てある"],
  te_oru: ["っておる", "いておる", "いでおる", "しておる", "っておる", "んでおる", "んでおる", "んでおる", "っておる", "ておる"],
  te_oku: ["っておく", "いておく", "いでおく", "しておく", "っておく", "んでおく", "んでおく", "んでおく", "っておく", "ておく"],
  plain_presumptive: ["うだろう", "くだろう", "ぐだろう", "すだろう", "つだろう", "むだろう", "ぶだろう", "ぬだろう", "るだろう", "るだろう"],
  past_presumptive: ["ったろう", "いたろう", "いだろう", "したろう", "ったろう", "んだろう", "んだろう", "んだろう", "った", "たろう"],
  passive: ["われる", "かれる", "がれる", "される", "たれる", "まれる", "ばれる", "なれる", "られる", "られる"],
  causative: ["わせる", "かせる", "がせる", "させる", "たせる", "ませる", "ばせる", "なせる", "らせる", "させる"],
  way_of_doing: ["いかた", "きかた", "ぎかた", "しかた", "ちかた", "みかた", "びかた", "にかた", "りかた", "かた"],
  plain_negative: ["わない", "かない", "がない", "さない", "たない", "まない", "ばない", "なない", "らない", "ない"],
  plain_negative_presumptive: ["うまい", "くまい", "ぐまい", "すまい", "つまい", "むまい", "ぶまい", "ぬまい", "るまい", "まい"],
  polite: ["います", "きます", "ぎます", "します", "ちます", "みます", "びます", "にます", "ります", "ます"],
  desire: ["いたい", "きたい", "ぎたい", "したい", "ちたい", "みたい", "びたい", "にたい", "りたい", "たい"],
  simplified_te_iru: ["ってる", "いてる", "いでる", "してる", "ってる", "んでる", "んでる", "んでる", "ってる", "てる"],
  past_hypothetical: ["ったら", "いたら", "いだら", "したら", "ったら", "んだら", "んだら", "んだら", "ったら", "たら"],
  representative: ["ったり", "いたり", "いだり", "したり", "ったり", "んだり", "んだり", "んだり", "ったり", "たり"],
  simplified_te_oru: ["っとる", "いとる", "いどる", "しとる", "っとる", "んどる", "んどる", "んどる", "っとる", "とる"],
  impression: ["いそう", "きそう", "ぎそう", "しそう", "ちそう", "みそう", "びそう", "にそう", "りそう", "そう"],
  simplified_te_oku: ["っとく", "いとく", "いどく", "しとく", "っとく", "んどく", "んどく", "んどく", "っとく", "とく"],
  hypothetical: ["えば", "けば", "げば", "せば", "てば", "めば", "べば", "ねば", "れば", "れば"],
  perfect: ["わず", "かず", "がず", "さず", "たず", "まず", "ばず", "なず", "らず", "ず"],
  plain_negative: ["わん", "かん", "がん", "さん", "たん", "まん", "ばん", "なん", "らん", "ん"],
  negative_imperative: ["うな", "くな", "ぐな", "すな", "つな", "むな", "ぶな", "ぬな", "るな", "るな"],
  past_tense: ["った", "いた", "いだ", "した", "った", "んだ", "んだ", "んだ", "った", "た"],
  te_form: ["って", "いて", "いで", "して", "って", "んで", "んで", "んで", "って", "て"],
  short_potential: ["える", "ける", "げる", "せる", "てる", "める", "べる", "ねる", "れる", ""],
  pseudo_futurum: ["おう", "こう", "ごう", "そう", "とう", "もう", "ぼう", "のう", "ろう", "よう"],
  commanding: ["え", "け", "げ", "せ", "て", "め", "べ", "ね", "れ", "ろ"],
  //      predicative                 : ["う","く","ぐ","す","つ","む","ぶ","ぬ","る","る"],
  conjunctive: ["い", "き", "ぎ", "し", "ち", "み", "び", "に", "り", ""],
  advising_commanding: ["", "", "", "", "", "", "", "", "", "よ"]
};
let isAux = new Set()
Object.entries(forms).forEach(a => {
  a[1].forEach(str => {
    if (str) {
      isAux.add(str)
    }
  })
})

const endVerb = function (terms) {
  let end = terms[terms.length - 1]
  if (isAux.has(end.text)) {
    end.tags.add('Auxiliary')
    // also assume the next word in is a verb?
    let t = terms[terms.length - 2]
    if (t && t.tags.has('Kanji')) {
      t.tags.add('Verb')
    }

  }
}
export default endVerb