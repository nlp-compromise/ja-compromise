// the copula - だ, です, である - is an irregular paradigm of its own.
// its forms look like verb-endings (だった could be a godan 〜った, ではない a
// negative 〜ない) but they never decompose that way, so they're listed whole.
// https://www.japaneseprofessor.com/reference/grammar/conjugations-of-the-japanese-copula/
//
// each of these is a single token, and a single term - 「ではない」 is one
// word, not で + は + ない - and its root is the copula's own dictionary-form:
//  - plain forms go back to だ
//  - polite forms go back to です
//  - the written/formal forms go back to である
const paradigms = {
  'だ': {
    'だ': ['PresentTense'],
    'だった': ['PastTense'],
    'だったら': ['ConditionalVerb'],
    'だろう': ['Presumptive'],
    'なら': ['ConditionalVerb'],
    'ならば': ['ConditionalVerb'],
    // the negative is で(は) + ない, and じゃ is a spoken では
    'でない': ['PresentTense', 'Negative'],
    'ではない': ['PresentTense', 'Negative'],
    'じゃない': ['PresentTense', 'Negative'],
    'でなかった': ['PastTense', 'Negative'],
    'ではなかった': ['PastTense', 'Negative'],
    'じゃなかった': ['PastTense', 'Negative'],
  },
  'です': {
    'です': ['PresentTense', 'Polite'],
    'でした': ['PastTense', 'Polite'],
    'でしたら': ['ConditionalVerb', 'Polite'],
    'でしょう': ['Presumptive', 'Polite'],
    'ではありません': ['PresentTense', 'Polite', 'Negative'],
    'じゃありません': ['PresentTense', 'Polite', 'Negative'],
    'ではありませんでした': ['PastTense', 'Polite', 'Negative'],
    'じゃありませんでした': ['PastTense', 'Polite', 'Negative'],
  },
  'である': {
    'である': ['PresentTense'],
    'であった': ['PastTense'],
    'であろう': ['Presumptive'],
    'であれば': ['ConditionalVerb'],
    'であって': ['Gerund'],
    'であります': ['PresentTense', 'Polite'],
    'でありました': ['PastTense', 'Polite'],
    'でありまして': ['Gerund', 'Polite'],
  },
  // the humble copula only turns up in this form
  'でございます': {
    'でございます': ['PresentTense', 'Polite'],
  },
}

// surface-form → { root, tags }
const copula = {}
Object.keys(paradigms).forEach(root => {
  Object.keys(paradigms[root]).forEach(str => {
    copula[str] = { root, tags: ['Copula'].concat(paradigms[root][str]) }
  })
})

export default copula
