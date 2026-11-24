# タグ一覧

ja-compromise のタグです。どのタグも、検索パターンの中で英語名と日本語の別名のどちらでも使えます。

```js
const doc = nlp('服がとても汚い')
doc.match('#名詞 #格助詞 #副詞 #形容詞')
doc.match('#Noun #CaseParticle #Adverb #Adjective') // 同じ意味
```

`—` は、該当する別名がないことを示します。英語名はそのまま使えます。例の欄の `—` は、日本語には当てはまらないタグであることを示します。

`*` は、現在のタガーがこの例にこのタグを自動では付けないことを示します。`.tag()` で付けることはできます。

## 名詞

| 英語 | 日本語 | 例 |
|---|---|---|
| `#Noun` | `#名詞` | `本` |
| `#Topic` | `#主題` | `太郎は紀子を見ました` |
| `#Object` | `#目的語` | `太郎は紀子を見ました` |
| `#Singular` | `#単数` | `本` * |
| `#ProperNoun` | `#固有名詞` | `東京` * |
| `#Person` | `#人名` | `田中さん` |
| `#FirstName` | `#名` | `太郎` * |
| `#MaleName` | `#男性名` | `太郎` * |
| `#FemaleName` | `#女性名` | `花子` * |
| `#LastName` | `#名字` | `田中さん` * |
| `#Honorific` | `#敬称` | `さん` |
| `#Place` | `#地名` | `日本` |
| `#Country` | `#国名` | `日本` |
| `#City` | `#都市名` | `杉並区` |
| `#Region` | `#地域名` | `関東` * |
| `#Address` | `#住所` | `東京都渋谷区` * |
| `#Organization` | `#組織名` | `国連` * |
| `#SportsTeam` | `#スポーツチーム` | `阪神タイガース` * |
| `#School` | `#学校名` | `東京大学` * |
| `#Company` | `#会社名` | `トヨタ` * |
| `#Plural` | `#複数` | `私たち` |
| `#Uncountable` | — | `水` * |
| `#Pronoun` | `#代名詞` | `私` |
| `#Actor` | — | `先生` * |
| `#Activity` | `#活動` | `水泳` * |
| `#Unit` | `#単位` | `km` |
| `#Demonym` | — | `日本人` * |
| `#Possessive` | `#所有格` | `私の` |
| `#Demonstrative` | `#指示詞` | `これ` |
| `#FormalNoun` | `#形式名詞` | `こと` |
| `#PluralSuffix` | `#複数接尾辞` | `たち` |
| `#MaleNoun` | — | — |
| `#FemaleNoun` | — | — |
| `#NeuterNoun` | — | — |

## 動詞

| 英語 | 日本語 | 例 |
|---|---|---|
| `#Verb` | `#動詞` | `読む` |
| `#ConditionalVerb` | `#条件形` | `読んだら` |
| `#Passive` | `#受身` | `読まれる` |
| `#Causative` | `#使役` | `読ませる` |
| `#PresentTense` | `#現在形` | `読む` |
| `#Infinitive` | `#辞書形` | `読む` |
| `#Imperative` | `#命令形` | `読め` |
| `#Gerund` | `#て形` | `読んで` |
| `#PastTense` | `#過去形` | `読んだ` |
| `#Copula` | `#コピュラ` | `です` |
| `#Modal` | — | `べき` * |
| `#PerfectTense` | — | `読んだ` * |
| `#Pluperfect` | — | — |
| `#Participle` | — | `読んだ` * |
| `#PhrasalVerb` | — | — |
| `#Auxiliary` | `#助動詞` | `ます` |
| `#Negative` | `#否定` | `読まない` |
| `#Polite` | `#丁寧` | `読みます` |
| `#Volitional` | `#意向形` | `読もう` |
| `#Potential` | `#可能形` | `読める` |
| `#Progressive` | `#進行形` | `読んでいる` |
| `#Desire` | `#願望` | `読みたい` |
| `#Representative` | `#たり形` | `読んだり` |
| `#Presumptive` | `#推量` | `読むだろう` |
| `#Continuative` | `#ながら形` | `読みながら` |
| `#VerbStem` | `#連用形` | `読み` |
| `#SuruVerb` | `#サ変名詞` | `勉強` |

## 助詞

| 英語 | 日本語 | 例 |
|---|---|---|
| `#Particle` | `#助詞` | `は` |
| `#CaseParticle` | `#格助詞` | `が` |
| `#TopicParticle` | `#係助詞` | `は` |
| `#AdverbialParticle` | `#副助詞` | `だけ` |
| `#ConjunctiveParticle` | `#接続助詞` | `ながら` |
| `#SentenceParticle` | `#終助詞` | `よ` |
| `#AdnominalParticle` | `#連体助詞` | `の` |
| `#QuotativeParticle` | `#引用助詞` | `行くと言った` |

## 数

| 英語 | 日本語 | 例 |
|---|---|---|
| `#Value` | `#数` | `三` |
| `#Ordinal` | `#序数` | `三番目` |
| `#Cardinal` | `#基数` | `三` |
| `#Fraction` | `#分数` | `3分の1` * |
| `#Multiple` | `#倍数` | `百` * |
| `#RomanNumeral` | `#ローマ数字` | `XIV` * |
| `#TextValue` | `#数詞` | `三` * |
| `#TextOrdinal` | — | `第三` * |
| `#TextCardinal` | — | `三` * |
| `#NumericValue` | `#数値` | `234` * |
| `#Money` | `#金額` | `千円` * |
| `#Counter` | `#助数詞` | `三冊` |
| `#TimeCounter` | `#時刻助数詞` | `3時` |
| `#DurationCounter` | `#期間助数詞` | `3時間` |
| `#DateCounter` | `#日付助数詞` | `3年` |
| `#NumberPhrase` | `#数量表現` | `三冊` |
| `#Percent` | `#パーセント` | `50%` |

## 日付と時刻

| 英語 | 日本語 | 例 |
|---|---|---|
| `#Date` | `#日付` | `3月5日` |
| `#Month` | `#月` | `3月` |
| `#WeekDay` | `#曜日` | `月曜日` |
| `#Year` | `#年` | `2026年` |
| `#FinancialQuarter` | `#四半期` | `第3四半期` * |
| `#Holiday` | `#祝日` | `元日` * |
| `#Season` | `#季節` | `夏` |
| `#Timezone` | `#タイムゾーン` | `JST` * |
| `#Time` | `#時刻` | `3時` |
| `#Duration` | `#期間` | `3時間` |
| `#Day` | `#日` | `十日` |
| `#Era` | `#元号` | `昭和` |
| `#AmPm` | `#午前午後` | `午前` |

## その他

| 英語 | 日本語 | 例 |
|---|---|---|
| `#Hiragana` | `#ひらがな` | `ひらがな` |
| `#Kanji` | `#漢字` | `漢字` |
| `#Katakana` | `#カタカナ` | `カタカナ` |
| `#Ascii` | — | `abc` |
| `#Adjective` | `#形容詞` | `高い` |
| `#IAdjective` | `#イ形容詞` | `高い` |
| `#NaAdjective` | `#ナ形容詞`, `#形容動詞` | `静か` |
| `#Adnominal` | `#連体詞` | `大きな` |
| `#Comparable` | — | `高い` * |
| `#Comparative` | `#比較級` | `より高い` * |
| `#Superlative` | `#最上級` | `一番高い` * |
| `#NumberRange` | `#数値範囲` | `5-10` |
| `#Adverb` | `#副詞` | `とても` |
| `#Determiner` | `#限定詞` | `この` |
| `#Conjunction` | `#接続詞` | `そして` |
| `#Preposition` | — | `に` |
| `#QuestionWord` | `#疑問詞` | `何` |
| `#Currency` | `#通貨` | `円` * |
| `#Expression` | `#感動詞` | `ただいま` |
| `#Abbreviation` | `#略語` | `略` * |
| `#Url` | — | `www.example.com` * |
| `#PhoneNumber` | `#電話番号` | `555-123-4567` * |
| `#HashTag` | `#ハッシュタグ` | `#nlp` * |
| `#AtMention` | `#メンション` | `@spencer` * |
| `#Emoji` | `#絵文字` | `😀` * |
| `#Emoticon` | `#顔文字` | `:-)` * |
| `#Email` | `#メール` | `info@example.com` * |
| `#Acronym` | `#頭字語` | `NATO` * |
| `#Condition` | `#条件` | `もし` * |
