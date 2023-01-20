let lex = {
  // copula forms
  // https://www.japaneseprofessor.com/reference/grammar/conjugations-of-the-japanese-copula/
  'だ': ['Copula', 'PresentTense'],
  'だった': ['Copula', 'PastTense'],
  'では': ['Copula'],
  'だろう': ['Copula', 'Volitional'],
  'で': ['Copula', 'Gerund'], //te form
  'なら': ['Copula', 'ConditionalVerb'],
  'ならば': ['Copula', 'ConditionalVerb'],
  // polite copula
  'です': ['Copula', 'PresentTense', 'Polite'],
  'でした': ['Copula', 'PresentTense', 'Polite'],
  'でしょう': ['Copula', 'Volitional', 'Polite'],
  '（でありまして': ['Copula', 'Gerund', 'Polite'],//te-form
  '（であれば': ['Copula', 'Conditional', 'Polite'],//te-form

  'たち': 'PluralSuffix'
}
export default lex