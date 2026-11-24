// japanese nouns don't inflect for number - 本 is 'book' and 'books'.
// only people (and things we treat like people) can take a plural suffix,
// and it's always optional - 子供たち

const irregular = {
  '人': '人々',
  '我': '我々',
  'われ': 'われわれ',
}
const fromIrregular = {}
Object.keys(irregular).forEach(k => {
  fromIrregular[irregular[k]] = k
})

// the same suffixes the tagger reads as #Plural
const suffix = /(?:たち|達)$/

// the nouns that sound right with 〜たち
const animate = new Set([
  '男', '女', '男性', '女性', '子', '子供', '大人', '男の子', '女の子', '赤ちゃん',
  '先生', '学生', '生徒', '医者', '看護師', '店員', '会社員', '社員', '選手', '客',
  '親', '兄', '姉', '弟', '妹', '息子', '娘', '孫',
  '猫', '犬', '鳥', '馬', '動物',
])
const people = ['Pronoun', 'Person', 'Honorific', 'Actor']
// 誰たち, これたち
const never = ['QuestionWord', 'Demonstrative', 'Plural']

const isPlural = function (term) {
  return term.tags.has('Plural') || fromIrregular.hasOwnProperty(term.text)
}

// can this word take a plural suffix?
const canPlural = function (term) {
  if (isPlural(term) || never.some(tag => term.tags.has(tag))) {
    return false
  }
  if (irregular.hasOwnProperty(term.text) || animate.has(term.text)) {
    return true
  }
  return people.some(tag => term.tags.has(tag))
}

const toPlural = function (str) {
  if (irregular.hasOwnProperty(str)) {
    return irregular[str]
  }
  return str + 'たち'
}

const toSingular = function (str) {
  if (fromIrregular.hasOwnProperty(str)) {
    return fromIrregular[str]
  }
  return str.replace(suffix, '')
}

export { isPlural, canPlural, toPlural, toSingular }
