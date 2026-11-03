import test from 'tape'
import nlp from './_lib.js'
const here = '[ja-aliases] '

// every alias, and the tag it stands for
const aliases = {
  // nouns
  名詞: 'Noun',
  主題: 'Topic',
  目的語: 'Object',
  単数: 'Singular',
  複数: 'Plural',
  固有名詞: 'ProperNoun',
  人名: 'Person',
  名: 'FirstName',
  男性名: 'MaleName',
  女性名: 'FemaleName',
  名字: 'LastName',
  敬称: 'Honorific',
  地名: 'Place',
  国名: 'Country',
  都市名: 'City',
  地域名: 'Region',
  住所: 'Address',
  組織名: 'Organization',
  スポーツチーム: 'SportsTeam',
  学校名: 'School',
  会社名: 'Company',
  代名詞: 'Pronoun',
  活動: 'Activity',
  単位: 'Unit',
  所有格: 'Possessive',
  指示詞: 'Demonstrative',
  形式名詞: 'FormalNoun',
  複数接尾辞: 'PluralSuffix',
  // verbs
  動詞: 'Verb',
  条件形: 'ConditionalVerb',
  受身: 'Passive',
  使役: 'Causative',
  現在形: 'PresentTense',
  辞書形: 'Infinitive',
  命令形: 'Imperative',
  て形: 'Gerund',
  過去形: 'PastTense',
  コピュラ: 'Copula',
  助動詞: 'Auxiliary',
  否定: 'Negative',
  丁寧: 'Polite',
  意向形: 'Volitional',
  可能形: 'Potential',
  進行形: 'Progressive',
  願望: 'Desire',
  たり形: 'Representative',
  推量: 'Presumptive',
  ながら形: 'Continuative',
  連用形: 'VerbStem',
  サ変名詞: 'SuruVerb',
  // particles
  助詞: 'Particle',
  格助詞: 'CaseParticle',
  係助詞: 'TopicParticle',
  副助詞: 'AdverbialParticle',
  接続助詞: 'ConjunctiveParticle',
  終助詞: 'SentenceParticle',
  連体助詞: 'AdnominalParticle',
  引用助詞: 'QuotativeParticle',
  // values
  数: 'Value',
  序数: 'Ordinal',
  基数: 'Cardinal',
  分数: 'Fraction',
  倍数: 'Multiple',
  ローマ数字: 'RomanNumeral',
  数詞: 'TextValue',
  数値: 'NumericValue',
  金額: 'Money',
  助数詞: 'Counter',
  時刻助数詞: 'TimeCounter',
  期間助数詞: 'DurationCounter',
  日付助数詞: 'DateCounter',
  数量表現: 'NumberPhrase',
  パーセント: 'Percent',
  // dates
  日付: 'Date',
  月: 'Month',
  曜日: 'WeekDay',
  年: 'Year',
  四半期: 'FinancialQuarter',
  祝日: 'Holiday',
  季節: 'Season',
  タイムゾーン: 'Timezone',
  時刻: 'Time',
  期間: 'Duration',
  日: 'Day',
  元号: 'Era',
  午前午後: 'AmPm',
  // misc
  ひらがな: 'Hiragana',
  漢字: 'Kanji',
  カタカナ: 'Katakana',
  形容詞: 'Adjective',
  イ形容詞: 'IAdjective',
  ナ形容詞: 'NaAdjective',
  形容動詞: 'NaAdjective',
  連体詞: 'Adnominal',
  比較級: 'Comparative',
  最上級: 'Superlative',
  数値範囲: 'NumberRange',
  副詞: 'Adverb',
  限定詞: 'Determiner',
  接続詞: 'Conjunction',
  疑問詞: 'QuestionWord',
  通貨: 'Currency',
  感動詞: 'Expression',
  略語: 'Abbreviation',
  電話番号: 'PhoneNumber',
  ハッシュタグ: 'HashTag',
  メンション: 'AtMention',
  絵文字: 'Emoji',
  顔文字: 'Emoticon',
  メール: 'Email',
  頭字語: 'Acronym',
  条件: 'Condition',
}

test('aliases point to the right tag:', function (t) {
  const { tagAliases } = nlp.world().model.one
  Object.keys(aliases).forEach(alias => {
    t.equal(tagAliases[alias], aliases[alias], here + `#${alias} is #${aliases[alias]}`)
  })
  t.end()
})

test('aliases match a tagged term:', function (t) {
  Object.keys(aliases).forEach(alias => {
    const doc = nlp('この本').tag(aliases[alias])
    t.ok(doc.has(`#${alias}`), here + `#${alias} finds a #${aliases[alias]}`)
  })
  t.end()
})

test('every alias in the tagset is tested:', function (t) {
  const { tagSet } = nlp.world().model.one
  Object.keys(tagSet).forEach(tag => {
    const names = (tagSet[tag].aliases || []).filter(name => name !== null)
    names.forEach(name => {
      t.equal(aliases[name], tag, here + `#${name} is listed for #${tag}`)
    })
  })
  t.end()
})

test('aliases match real sentences:', function (t) {
  const arr = [
    ['服がとても汚い', '#名詞 #格助詞 #副詞 #形容詞'],
    ['服がとても汚い', '#名詞 #助詞 #副詞 #イ形容詞'],
    ['私は歩いた', '#代名詞 #係助詞 #過去形'],
    ['ただいま', '#感動詞'],
    ['靴と家', '#名詞 #接続詞 #名詞'],
    ['美しいベッド', '#形容詞 #名詞'],
    ['このカバンは重いです。', '#限定詞 #名詞 #助詞 #形容詞 #コピュラ'],
    ['太郎は紀子を見ました', '#主題 #助詞 #目的語 #助詞 #動詞+'],
    ['ジョン', '#カタカナ'],
    ['午前', '#午前午後'],
    ['昭和', '#元号'],
    ['大きな', '#連体詞'],
    ['静か', '#ナ形容詞'],
    ['静か', '#形容動詞'],
    ['よ', '#終助詞'],
    ['だけ', '#副助詞'],
    ['の', '#連体助詞'],
    ['こと', '#形式名詞'],
    ['勉強', '#サ変名詞'],
    ['泳ぎ', '#連用形'],
    ['いわれる', '#受身'],
    ['いわせる', '#使役'],
    ['いいましょう', '#意向形'],
    ['いえる', '#可能形'],
    ['いっている', '#進行形'],
    ['いいたい', '#願望'],
    ['いったり', '#たり形'],
    ['いいながら', '#ながら形'],
    ['いった', '#過去形'],
    ['いって', '#て形'],
    ['いいます', '#丁寧'],
    ['いうだろう', '#推量'],
    ['いわない', '#否定'],
    ['いったら', '#条件形'],
    ['これ', '#指示詞'],
    ['たち', '#複数接尾辞'],
    ['三', '#数'],
  ]
  arr.forEach(function (a) {
    const [str, match] = a
    const doc = nlp(str)
    const tags = doc.json()[0].terms.map(term => term.tags[0])
    const msg = `'${(str + "' ").padEnd(20, ' ')}  - '${match}' - '${tags.join(', ')}'`
    t.equal(doc.match(match).text(), doc.text(), here + msg)
  })
  t.end()
})

test('aliases work in match syntax:', function (t) {
  const doc = nlp('この本')
  const [det, noun] = doc.json()[0].terms.map(term => term.text)
  t.ok(nlp('本は').has('#助詞'), here + 'particle')
  t.equal(doc.match('!#名詞').text(), det, here + 'negative')
  t.equal(doc.match('(#助動詞|#限定詞) #名詞').text(), doc.text(), here + 'or-block')
  t.equal(doc.match('#限定詞 [#名詞]', 0).text(), noun, here + 'capture')
  t.equal(doc.match('#限定詞 #形容詞? #名詞').text(), doc.text(), here + 'optional')
  t.equal(doc.not('#限定詞').text(), noun, here + 'not()')
  t.equal(doc.if('#名詞').length, 1, here + 'if()')
  t.end()
})

test('aliases do not over-match:', function (t) {
  const doc = nlp('この本')
  t.notOk(doc.has('#助動詞'), here + 'no #助動詞')
  t.notOk(doc.has('#助詞'), here + 'no #助詞')
  t.notOk(doc.has('#ナンセンス'), here + 'an unknown tag finds nothing')
  t.end()
})

test('aliases can also set tags:', function (t) {
  const doc = nlp('この本').tag('助動詞')
  t.ok(doc.has('#Auxiliary'), here + 'tag() with an alias')
  doc.unTag('助動詞')
  t.notOk(doc.has('#Auxiliary'), here + 'unTag() with an alias')
  t.end()
})

test('english tag names are unchanged:', function (t) {
  const doc = nlp('この本')
  t.ok(doc.has('#Determiner #Noun'), here + 'canonical names still match')
  t.ok(doc.out('spec').includes('{Determiner,Noun}'), here + 'spec output is canonical')
  const tags = doc.json()[0].terms[1].tags
  t.ok(tags.includes('Noun'), here + 'json has #Noun')
  t.notOk(tags.includes('名詞'), here + 'json has no #名詞')
  t.end()
})
