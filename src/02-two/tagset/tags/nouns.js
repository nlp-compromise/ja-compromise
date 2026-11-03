const entity = ['Person', 'Place', 'Organization']

export default {
  Noun: {
    aliases: [null, '名詞'],
    not: ['Verb', 'Adjective', 'Adverb', 'Value', 'Determiner'],
  },

  Topic: {
    aliases: [null, '主題'],
    is: 'Noun',
  },
  Object: {
    aliases: [null, '目的語'],
    is: 'Noun',
  },
  Singular: {
    aliases: [null, '単数'],
    is: 'Noun',
    not: ['Plural'],
  },
  ProperNoun: {
    aliases: [null, '固有名詞'],
    is: 'Noun',
  },
  Person: {
    aliases: [null, '人名'],
    is: 'Singular',
    also: ['ProperNoun'],
    not: ['Place', 'Organization', 'Date'],
  },
  FirstName: {
    aliases: [null, '名'],
    is: 'Person',
  },
  MaleName: {
    aliases: [null, '男性名'],
    is: 'FirstName',
    not: ['FemaleName', 'LastName'],
  },
  FemaleName: {
    aliases: [null, '女性名'],
    is: 'FirstName',
    not: ['MaleName', 'LastName'],
  },
  LastName: {
    aliases: [null, '名字'],
    is: 'Person',
    not: ['FirstName'],
  },
  Honorific: {
    aliases: [null, '敬称'],
    is: 'Noun',
    not: ['FirstName', 'LastName', 'Value'],
  },
  Place: {
    aliases: [null, '地名'],
    is: 'Singular',
    not: ['Person', 'Organization'],
  },
  Country: {
    aliases: [null, '国名'],
    is: 'Place',
    also: ['ProperNoun'],
    not: ['City'],
  },
  City: {
    aliases: [null, '都市名'],
    is: 'Place',
    also: ['ProperNoun'],
    not: ['Country'],
  },
  Region: {
    aliases: [null, '地域名'],
    is: 'Place',
    also: ['ProperNoun'],
  },
  Address: {
    aliases: [null, '住所'],
    // is: 'Place',
  },
  Organization: {
    aliases: [null, '組織名'],
    is: 'ProperNoun',
    not: ['Person', 'Place'],
  },
  SportsTeam: {
    aliases: [null, 'スポーツチーム'],
    is: 'Organization',
  },
  School: {
    aliases: [null, '学校名'],
    is: 'Organization',
  },
  Company: {
    aliases: [null, '会社名'],
    is: 'Organization',
  },
  Plural: {
    aliases: [null, '複数'],
    is: 'Noun',
    not: ['Singular'],
  },
  Uncountable: {
    is: 'Noun',
  },
  Pronoun: {
    aliases: [null, '代名詞'],
    is: 'Noun',
    not: entity,
  },
  Actor: {
    is: 'Noun',
    not: entity,
  },
  Activity: {
    aliases: [null, '活動'],
    is: 'Noun',
    not: ['Person', 'Place'],
  },
  Unit: {
    aliases: [null, '単位'],
    is: 'Noun',
    not: entity,
  },
  Demonym: {
    is: 'Noun',
    also: ['ProperNoun'],
    not: entity,
  },
  Possessive: {
    aliases: [null, '所有格'],
    is: 'Noun',
  },
  // こそあど - これ, その, どこ
  Demonstrative: {
    aliases: [null, '指示詞'],
  },
  // 形式名詞 - こと, もの, ため: grammatical, but still nouns
  FormalNoun: {
    aliases: [null, '形式名詞'],
    is: 'Noun',
  },
  // さん, 様, 先生
  PluralSuffix: {
    aliases: [null, '複数接尾辞'],
  },
  // german genders
  MaleNoun: {
    is: 'Noun',
    not: ['FemaleNoun', 'NeuterNoun'],
  },
  FemaleNoun: {
    is: 'Noun',
    not: ['MaleNoun', 'NeuterNoun'],
  },
  NeuterNoun: {
    is: 'Noun',
    not: ['MaleNoun', 'FemaleNoun'],
  },
}
