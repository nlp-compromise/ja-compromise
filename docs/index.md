# ja-compromise

`ja-compromise` は、日本語のテキストを解析するための JavaScript ライブラリです。

日本語のテキストを文と単語に分割し、それぞれの単語に品詞のタグを付けます。
そのうえで、正規表現に似た書き方で文書の一部を検索したり、書き換えたりできます。

ブラウザでも動くほど小さく、オフラインで動作し、依存パッケージはありません。
ルールベースで、設定を変えることもできます。ニューラルモデルは使わず、速くて「十分によい」判断をします。

これは、もとになった[英語版ライブラリ](https://github.com/spencermountain/compromise/)の日本語版です。

```bash
npm install ja-compromise
```

```js
import nlp from 'ja-compromise'

const doc = nlp('彼女は浜辺で貝殻を売る。')
doc.match('#動詞').text() // '売る。'
```

ブラウザでは:

```html
<script src="https://unpkg.com/ja-compromise"></script>
```

### ドキュメント

- [タグ一覧](./tagset.md)
- [検索パターンの書き方](./match.md)
- [API](./api.md)
- [貢献するには](./contributing.md)

### しくみ

テキストは文のリストに分けられ、それぞれの文は単語のリストになります:

```
Sentence [
  Term { text: '彼女', pre: '', post: '', normal: '彼女', tags: ['Noun', 'Pronoun', 'Kanji', 'Topic'] },
  Term { text: 'は', pre: '', post: '', normal: 'は', tags: ['Particle', 'Preposition', 'TopicParticle', 'Hiragana'] },
  ...
]
```

- `text` は、書かれたとおりの単語です
- `pre` と `post` は、その前後にある空白や句読点です
- `normal` は、検索に使われる、整えられた形です
- `tags` は、その単語の[品詞タグ](./tagset.md)です

このデータは `.json()` で取り出せます:

```js
const doc = nlp('彼女は浜辺で貝殻を売る。')
doc.json()
// [{ terms: [{ text: '彼女', tags: ['Noun', 'Pronoun', 'Kanji', 'Topic'], ... }, ...] }]
```

### 検索する

文書の一部を選ぶには `.match()` を使います。パターンの中では、単語をスペースで区切ります:

```js
const doc = nlp('彼女は浜辺で貝殻を売る。')
const m = doc.match('貝殻 を .')
m.text() // '貝殻を売る。'
m.json() // [{ text: '貝殻を売る。', terms: [...] }]

doc.has('#名詞 #格助詞 #動詞') // true
doc.match('#名詞').out('array') // ['彼女', '浜辺', '貝殻']
```

パターンでできることのすべては[検索パターンの書き方](./match.md)に、使えるタグは[タグ一覧](./tagset.md)にあります。

### 書き換える

文書の一部は書き換えることができ、その変更はもとの文書に反映されます:

```js
const doc = nlp('彼女は浜辺で貝殻を売る。')
doc.match('売る').replaceWith('買う')
doc.text() // '彼女は浜辺で貝殻を買う。'
```

`.verbs()`、`.nouns()`、`.numbers()` のような、あらかじめ用意された選択メソッドもあります。`.get()` や `.add()` のような独自のメソッドを持つものもあります:

```js
const doc = nlp('本を二十三冊買った。')
doc.nouns().out('array') // ['本', '冊']
doc.particles().out('array') // ['を']

doc.numbers().get() // [23]
doc.numbers().add(10)
doc.text() // '本を三十三冊買った。'
```

これらは言語によって異なります。このライブラリにあるものは [API](./api.md) を見てください。

### 知っておくこと

**どのメソッドもビューを返します。** ビューとは、文書の中から選ばれた単語のまとまりです。`nlp(text)` は文書全体のビューで、`.match()` はそれより小さなビューを返します。ほとんどのメソッドがビューを返すので、つなげて書くことができます。文書全体に戻るには `.all()` を使います。

**書き換えは文書そのものを変更します。** 書き換えが返すビューは選んだ部分だけなので、結果はもとの文書から読み取ります:

```js
const doc = nlp('彼女は浜辺で貝殻を売る。')
doc.match('売る').replaceWith('買う').text() // '買う。' (選んだ部分だけ)
doc.text() // '彼女は浜辺で貝殻を買う。'
```

もとの文書を変えたくないときは、`.clone()` でコピーを作って作業します:

```js
const doc = nlp('彼女は浜辺で貝殻を売る。')
const copy = doc.clone()
copy.match('貝殻 を').remove()
copy.text() // '彼女は浜辺で売る。'
doc.text() // '彼女は浜辺で貝殻を売る。'
```

**パターンは文をまたぎません。**

```js
nlp('それだけです。また明日。').has('です また') // false
```

**存在しないタグは何も見つけず、エラーにもなりません。** 検索結果が空のときは、[タグ一覧](./tagset.md)でタグを確かめ、`doc.debug()` でそれぞれの単語に付いたタグを表示してみてください。

### 設定

単語のタグが間違っているときや、単語が登録されていないときは、自分で指定できます:

```js
// ひとつの文書だけに
nlp('ピカチュウが走った', { ピカチュウ: '人名' }).match('#人名').text() // 'ピカチュウ'

// すべての文書に
nlp.addWords({ ピカチュウ: '人名' })
```

タグは[タグ一覧](./tagset.md)にあるものか、`nlp.addTags()` で追加したものでなければなりません。

プラグインを使うと、単語、タグ、新しいメソッドをまとめて追加できます:

```js
nlp.plugin({
  words: { カーミット: '人名' },
  tags: { Muppet: { isA: 'Person' } },
  api: (View) => {
    View.prototype.exclaim = function () {
      return this.post('！')
    }
  }
})

const doc = nlp('こんにちは')
doc.match('こんにちは').exclaim()
doc.text() // 'こんにちは！'
```
