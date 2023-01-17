// https://github.com/darren-lester/nihongo/blob/master/src/analysers.js


// there are 46 of these
const isHiragana = function (ch) {
  return ch >= "\u3040" && ch <= "\u309f";
}

// there are 46 of these
const isKatakana = function (ch) {
  return ch >= "\u30a0" && ch <= "\u30ff";
}

// there are thousands of these
const isKanji = function (ch) {
  return (ch >= "\u4e00" && ch <= "\u9faf") ||
    (ch >= "\u3400" && ch <= "\u4dbf") ||
    ch === "𠮟";
}


const toUtf8 = function (s) {
  return decodeURIComponent(s)
}
// const toCodePoint = function (s) {
//   return encodeURIComponent(s)
// }
// console.log(toUtf8('\u96e8')) //雨 (rain)
// console.log(toUtf8('\u30a2\u30e1\u30ea\u30ab\u5408\u8846\u56fd')) //アメリカ合衆国 (USA)
// console.log(toUtf8('\u4f4e\u6f6e')) //low tide (低潮)
// console.log(toUtf8('\u5927\u6f6e')) //spring tide (大潮)

// some of thousands
let kanji = ['恭', '胸', '脅', '強', '教', '郷', '境', '橋', '矯', '勲', '化',]
// kanji.forEach(c => console.log(isKanji(c)))


let hiragana = ["あ", "い", "う", "え", "お", "か", "き", "く", "け",
  "こ", "さ", "し", "す", "せ", "そ", "た", "ち", "つ", "て", "と", "な",
  "に", "ぬ", "ね", "の", "は", "ひ", "ふ", "へ", "ほ", "ま", "み", "む",
  "め", "も", "や", "ゆ", "よ", "ら", "り", "る", "れ", "ろ", "わ", "を",
  "ん"];
// hiragana.forEach(c => console.log(isHiragana(c)))

var katakana = ["ア", "イ", "ウ", "エ", "オ", "カ", "キ", "ク", "ケ", "コ",
  "サ", "シ", "ス", "セ", "ソ", "タ", "チ", "ツ", "テ", "ト", "ナ", "ニ", "ヌ",
  "ネ", "ノ", "ハ", "ヒ", "フ", "ヘ", "ホ", "マ", "ミ", "ム", "メ", "モ", "ヤ",
  "ユ", "ヨ", "ラ", "リ", "ル", "レ", "ロ", "ワ", "ヲ", "ン"];
// katakana.forEach(c => console.log(isKatakana(c)))


str.split('').forEach(c => {
  console.log(isKanji(c),)
})

let str = '高清浄度ステンレス鋼'
// high cleanliness stainless steel
// 地震（ジシン, earthquake): the "earth" (subject) "quakes" (predicate)
// 造船（ゾウセン、shipbuilding): "make" (verb) "boat" (object)