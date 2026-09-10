// vowel-row transforms for godan (五段) verbs
// the dictionary-form's final kana tells us the row, and each
// grammatical 'base' (活用形) shifts it to a different vowel

// 未然形 - the 'a' row (takes ない, れる, せる)
const aRow = {
  'う': 'わ', 'く': 'か', 'ぐ': 'が', 'す': 'さ', 'つ': 'た',
  'ぬ': 'な', 'ぶ': 'ば', 'む': 'ま', 'る': 'ら',
}
// 連用形 - the 'i' row (takes ます, たい, ながら) - also the 'masu-stem'
const iRow = {
  'う': 'い', 'く': 'き', 'ぐ': 'ぎ', 'す': 'し', 'つ': 'ち',
  'ぬ': 'に', 'ぶ': 'び', 'む': 'み', 'る': 'り',
}
// 仮定形/命令形 - the 'e' row (takes ば, る for potential)
const eRow = {
  'う': 'え', 'く': 'け', 'ぐ': 'げ', 'す': 'せ', 'つ': 'て',
  'ぬ': 'ね', 'ぶ': 'べ', 'む': 'め', 'る': 'れ',
}
// 意向形 - the 'o' row (takes う for volitional)
const oRow = {
  'う': 'お', 'く': 'こ', 'ぐ': 'ご', 'す': 'そ', 'つ': 'と',
  'ぬ': 'の', 'ぶ': 'ぼ', 'む': 'も', 'る': 'ろ',
}
// 音便 - the sound-change used by the て/た forms
const teRow = {
  'う': 'って', 'つ': 'って', 'る': 'って',
  'ぬ': 'んで', 'ぶ': 'んで', 'む': 'んで',
  'く': 'いて', 'ぐ': 'いで', 'す': 'して',
}

// kana that can precede る in an ichidan verb (the i-row and e-row)
const iRowKana = new Set('いきしちにひみりぎじぢびぴ'.split(''))
const eRowKana = new Set('えけせてねへめれげぜでべぺ'.split(''))

const godanEnding = new Set('うくぐすつぬぶむる'.split(''))

export { aRow, iRow, eRow, oRow, teRow, iRowKana, eRowKana, godanEnding }
