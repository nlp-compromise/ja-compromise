// hand-written entries. these win over every generated form.
const lex = {
  // the copula (だ/です/である) has a paradigm of its own - ../conjugate/copula.js

  // ---- negation & other bound auxiliaries that stand as their own token ----
  'ない': ['Auxiliary', 'PresentTense', 'Negative'],
  'なかった': ['Auxiliary', 'PastTense', 'Negative'],
  'ません': ['Auxiliary', 'PresentTense', 'Polite', 'Negative'],
  'ませんでした': ['Auxiliary', 'PastTense', 'Polite', 'Negative'],
  'ます': ['Auxiliary', 'PresentTense', 'Polite'],
  'ました': ['Auxiliary', 'PastTense', 'Polite'],
  'ましょう': ['Auxiliary', 'Volitional', 'Polite'],
  'ぬ': ['Auxiliary', 'PresentTense', 'Negative'],
  'ん': ['Auxiliary', 'PresentTense', 'Negative'],

  // ---- existence verbs, easy to get wrong ----
  'ある': ['Verb', 'Infinitive', 'PresentTense'],
  'あります': ['Verb', 'PresentTense', 'Polite'],
  'あった': ['Verb', 'PastTense'],
  'ありました': ['Verb', 'PastTense', 'Polite'],
  'ありません': ['Verb', 'PresentTense', 'Polite', 'Negative'],
  'いる': ['Verb', 'Infinitive', 'PresentTense'],
  'います': ['Verb', 'PresentTense', 'Polite'],
  'いた': ['Verb', 'PastTense'],
  'いました': ['Verb', 'PastTense', 'Polite'],
  'いません': ['Verb', 'PresentTense', 'Polite', 'Negative'],

  // ---- suffixes ----
  'たち': 'PluralSuffix',
  'ら': 'PluralSuffix',
  'さん': 'Honorific',
  'ちゃん': 'Honorific',
  'くん': 'Honorific',
  '君': ['Noun', 'Honorific'],
  '様': 'Honorific',
  'さま': 'Honorific',
  '先生': ['Noun', 'Honorific'],
  '氏': 'Honorific',

  // ---- formal nouns (形式名詞) - grammatical, but nouns ----
  'こと': ['Noun', 'FormalNoun'],
  '事': ['Noun', 'FormalNoun'],
  'もの': ['Noun', 'FormalNoun'],
  '物': ['Noun', 'FormalNoun'],
  'ため': ['Noun', 'FormalNoun'],
  '為': ['Noun', 'FormalNoun'],
  'とき': ['Noun', 'FormalNoun'],
  'ところ': ['Noun', 'FormalNoun'],
  'はず': ['Noun', 'FormalNoun'],
  'つもり': ['Noun', 'FormalNoun'],
  'わけ': ['Noun', 'FormalNoun'],

  // ---- demonstratives (こそあど) ----
  'これ': ['Pronoun', 'Demonstrative'],
  'それ': ['Pronoun', 'Demonstrative'],
  'あれ': ['Pronoun', 'Demonstrative'],
  'どれ': ['Pronoun', 'Demonstrative', 'QuestionWord'],
  'ここ': ['Pronoun', 'Demonstrative'],
  'そこ': ['Pronoun', 'Demonstrative'],
  'あそこ': ['Pronoun', 'Demonstrative'],
  'どこ': ['Pronoun', 'Demonstrative', 'QuestionWord'],
  'この': ['Determiner', 'Demonstrative'],
  'その': ['Determiner', 'Demonstrative'],
  'あの': ['Determiner', 'Demonstrative'],
  'どの': ['Determiner', 'Demonstrative', 'QuestionWord'],
  'こんな': ['Determiner', 'Demonstrative'],
  'そんな': ['Determiner', 'Demonstrative'],
  'あんな': ['Determiner', 'Demonstrative'],
  'どんな': ['Determiner', 'Demonstrative', 'QuestionWord'],
  'こう': ['Adverb', 'Demonstrative'],
  'そう': ['Adverb', 'Demonstrative'],
  'ああ': ['Adverb', 'Demonstrative'],
  'どう': ['Adverb', 'Demonstrative', 'QuestionWord'],

  // ---- question words ----
  '何': ['Noun', 'QuestionWord'],
  'なに': ['Noun', 'QuestionWord'],
  'なん': ['Noun', 'QuestionWord'],
  '誰': ['Noun', 'QuestionWord'],
  'だれ': ['Noun', 'QuestionWord'],
  'いつ': ['Noun', 'QuestionWord'],
  'なぜ': ['Adverb', 'QuestionWord'],
  'どうして': ['Adverb', 'QuestionWord'],
  'いくら': ['Noun', 'QuestionWord'],
  'いくつ': ['Noun', 'QuestionWord'],

  // ---- irregular adnominals (連体詞) that look like adjectives but aren't ----
  '大きな': ['Adjective', 'Adnominal'],
  '小さな': ['Adjective', 'Adnominal'],
  'おかしな': ['Adjective', 'Adnominal'],
  'いろんな': ['Adjective', 'Adnominal'],
}
export default lex
