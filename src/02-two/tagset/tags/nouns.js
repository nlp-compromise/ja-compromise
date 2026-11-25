// only our own tags, and what differs from the shared tagset - see ../plugin.js
export default {
  Noun: {
    aliases: [null, '名詞'],
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
    not: ['Plural'],
  },
  ProperNoun: {
    aliases: [null, '固有名詞'],
  },
  Person: {
    aliases: [null, '人名'],
  },
  FirstName: {
    aliases: [null, '名'],
  },
  MaleName: {
    aliases: [null, '男性名'],
  },
  FemaleName: {
    aliases: [null, '女性名'],
  },
  LastName: {
    aliases: [null, '名字'],
  },
  Honorific: {
    aliases: [null, '敬称'],
    is: 'Noun',
  },
  Place: {
    aliases: [null, '地名'],
  },
  Country: {
    aliases: [null, '国名'],
  },
  City: {
    aliases: [null, '都市名'],
  },
  Region: {
    aliases: [null, '地域名'],
  },
  Address: {
    aliases: [null, '住所'],
  },
  Organization: {
    aliases: [null, '組織名'],
  },
  SportsTeam: {
    aliases: [null, 'スポーツチーム'],
  },
  School: {
    aliases: [null, '学校名'],
  },
  Company: {
    aliases: [null, '会社名'],
  },
  Plural: {
    aliases: [null, '複数'],
    not: ['Singular'],
  },
  Uncountable: {
  },
  Pronoun: {
    aliases: [null, '代名詞'],
  },
  Actor: {
    not: ['Person', 'Place', 'Organization'],
  },
  Activity: {
    aliases: [null, '活動'],
  },
  Unit: {
    aliases: [null, '単位'],
  },
  Demonym: {
  },
  Possessive: {
    aliases: [null, '所有格'],
  },
  Demonstrative: {
    aliases: [null, '指示詞'],
  },
  FormalNoun: {
    aliases: [null, '形式名詞'],
    is: 'Noun',
  },
  PluralSuffix: {
    aliases: [null, '複数接尾辞'],
  },
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
