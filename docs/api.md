# API

`ja-compromise` は英語版ライブラリ [compromise](https://github.com/spencermountain/compromise/) をもとに作られていて、基本メソッドを共有しています。これらはどの言語でも同じように動きます。

ほとんどのメソッドは新しい**ビュー**（文書の中から選んだ部分）を返すので、つなげて書くことができます:

```js
nlp(text).match('#名詞').first().text()
```

`match` を受け取るメソッドは、[検索パターンの書き方](./match.md)に従います。

## 基本メソッド

_(すべてのビューで使えます)_

### ユーティリティ

- **`.found`** _[getter]_ — このビューに何か入っているか
- **`.docs`** _[getter]_ — このビューの単語オブジェクトのリスト
- **`.document`** _[getter]_ — 解析されたテキスト全体
- **`.pointer`** _[getter]_ — 現在のビューのインデックス
- **`.fullPointer`** _[getter]_ — 現在のビューの、省略のないインデックス
- **`.methods`** _[getter]_ — ライブラリ内部のメソッドにアクセスする
- **`.model`** _[getter]_ — ライブラリ内部のデータにアクセスする
- **`.hooks`** _[getter]_ — 標準で実行される compute メソッド
- **`.isView`** _[getter]_ — compromise のオブジェクトかどうかを見分ける
- **`.length`** _[getter]_ — ビューに含まれる結果の数
- **`.update(pointer)`** — この文書から新しいビューを作る
- **`.toView(pointer)`** — Verb や Noun のビューをふつうのビューにする
- **`.fromText(text)`** — 新しい文書を作る
- **`.termList()`** — .docs の別名
- **`.compute(method)`** — 名前の付いた処理を文書に対して実行する
- **`.clone(shallow?)`** — 参照が残らないよう、文書を丸ごとコピーする

### ループ

- **`.forEach(fn)`** — それぞれの結果を独立した文書として、関数を実行する
- **`.map(fn, emptyResult?)`** — それぞれの結果を関数に通し、新しい文書を作る
- **`.filter(fn)`** — true を返した結果だけを残す
- **`.find(fn)`** — 条件に合う最初の結果だけを持つ文書を返す
- **`.some(fn)`** — 条件に合う結果がひとつでもあれば true を返す
- **`.random(n?)`** — 結果の一部をランダムに選ぶ

### アクセサ

- **`.terms(n?)`** — 結果を単語ひとつずつに分ける
- **`.groups(name?)`** — 名前付きキャプチャグループを取り出す
- **`.eq(n)`** — n 番目の結果だけを使う
- **`.first(n?)`** — 最初の結果だけを使う
- **`.last(n?)`** — 最後の結果だけを使う
- **`.firstTerms()`** — それぞれの結果の最初の単語
- **`.lastTerms()`** — それぞれの結果の最後の単語
- **`.slice(start, end?)`** — 結果の一部を取り出す
- **`.all()`** — もとの文書全体を返す（「ズームアウト」）
- **`.fullSentences()`** — それぞれの結果について、もとの文全体を返す
- **`.none()`** — 空のビューを返す
- **`.isDoc(view?)`** — ふたつのビューが同じ文書のものかどうか
- **`.wordCount()`** — 単語の数を数える

### 検索

- **`.match(match, group?, options?)`** — 文書の中でパターンに合う部分を返す
- **`.matchOne(match, group?, options?)`** — 最初に見つかったものだけを返す
- **`.has(match, group?, options?)`** — このパターンがあるかどうかを真偽値で返す
- **`.if(match, group?, options?)`** — このパターンを含む結果だけを残す
- **`.ifNo(match, group?, options?)`** — このパターンを含む結果を取り除く
- **`.before(match, group?, options?)`** — それぞれの結果の前にある単語を返す
- **`.after(match, group?, options?)`** — それぞれの結果の後ろにある単語を返す
- **`.lookBehind(match, group?, options?)`** — .before() の別名
- **`.lookBefore(match, group?, options?)`** — .before() の別名
- **`.lookAhead(match, group?, options?)`** — .after() の別名
- **`.lookAfter(match, group?, options?)`** — .after() の別名
- **`.growLeft(match, group?, options?)`** — すぐ前にある、パターンに合う単語をビューに加える
- **`.growRight(match, group?, options?)`** — すぐ後ろにある、パターンに合う単語をビューに加える
- **`.grow(match, group?, options?)`** — 左右にある、パターンに合う単語でビューを広げる
- **`.sweep(match, opts?)`** — まとめて準備したパターンを文書に適用する
- **`.splitOn(match?, group?)`** — 結果を、前・パターン・後ろの 3 つに分ける
- **`.splitBefore(match?, group?)`** — 見つかったパターンのすぐ前で分ける
- **`.splitAfter(match?, group?)`** — 見つかったパターンのすぐ後ろで分ける
- **`.split(match?, group?)`** — .splitAfter() の別名

### 大文字と小文字

_(ラテン文字で書かれた単語にだけ意味があります)_

- **`.toLowerCase()`** — すべての文字を小文字にする
- **`.toUpperCase()`** — すべての文字を大文字にする
- **`.toTitleCase()`** — それぞれの単語の最初の文字を大文字にする
- **`.toCamelCase()`** — 空白を取り除き、それぞれの単語の最初を大文字にする

### 挿入

- **`.concat(input)`** — 末尾にこれらを追加する
- **`.insertBefore(input)`** — それぞれの結果の前にこれらの単語を追加する
- **`.prepend(input)`** — .insertBefore() の別名
- **`.insertAfter(text)`** — それぞれの結果の後ろにこれらの単語を追加する
- **`.append(text)`** — .insertAfter() の別名
- **`.insert(text)`** — .insertAfter() の別名
- **`.remove(match)`** — これらの単語を文書から完全に取り除く
- **`.delete(match)`** — .remove() の別名
- **`.replace(from, to?, keep?)`** — パターンを探し、新しい内容に置き換える
- **`.replaceWith(to, keep?)`** — 選んだ部分を新しい内容に置き換える
- **`.unique()`** — 重複した結果を取り除く
- **`.reverse()`** — 結果の順序を逆にする（単語の順序は変えない）
- **`.sort(method?)`** — 結果を並べ替える（その場で）
<!-- - **`.normalize(options?)`** — 単語のさまざまな面を整える -->

### 空白と句読点

- **`.pre(str?, concat?)`** — それぞれの結果の前に、この句読点や空白を付ける
- **`.post(str?, concat?)`** — それぞれの結果の後ろに、この句読点や空白を付ける
- **`.trim()`** — 先頭と末尾の空白を取り除く
- **`.hyphenate()`** — 単語をハイフンでつなぎ、空白を取り除く
- **`.dehyphenate()`** — 単語のあいだのハイフンを取り除き、空白を入れる
- **`.deHyphenate()`** — .dehyphenate() の別名
- **`.toQuotations(start?, end?)`** — 選んだ部分を引用符で囲む
- **`.toQuotation(start?, end?)`** — .toQuotations() の別名
- **`.toParentheses(start?, end?)`** — 選んだ部分をかっこで囲む

### 出力

- **`.text(options?)`** — 文書をテキストとして返す
- **`.json(options?)`** — 文書から必要なメタデータを取り出す
- **`.debug()`** — 現在の文書とそのタグを見やすく表示する
- **`.out(format?)`** — 名前の付いたいくつかの出力形式
- **`.html(toHighlight)`** — 見つかったパターンをタグで囲んだ html 文字列を作る
- **`.wrap(matches)`** — 見つかったパターンのまわりに独自の出力を作る

### ポインタ

- **`.union(match)`** — 重複のないすべての結果を返す
- **`.and(match)`** — .union() の別名
- **`.intersection(match)`** — 共通する結果だけを返す
- **`.not(match, options?)`** — これ以外のすべての結果を返す
- **`.difference(match, options?)`** — .not() の別名
- **`.complement(match)`** — 結果に含まれないすべてを返す
- **`.settle(match)`** — 結果どうしの重なりを取り除く

### タグ

- **`.tag(tag, reason?)`** — すべての単語にこのタグを付ける
- **`.tagSafe(tag, reason?)`** — 今のタグと矛盾しないときだけタグを付ける
- **`.unTag(tag, reason?)`** — 単語からこのタグを外す
- **`.canBe(tag)`** — このタグを持つことができる単語だけを返す

### キャッシュ

- **`.cache(options?)`** — 速度のために、文書の今の状態を固定する
- **`.uncache(options?)`** — 文書を書き換えられるよう、固定を解除する
- **`.freeze()`** — 今のタグが外されないようにする
- **`.unfreeze()`** — 今のタグを変えられるようにする [標準]

### リスト検索

- **`.lookup(trie, opts?)`** — 単語のリストをすばやく探す
- **`.autoFill()`** — 入力補完の辞書をもとに、書きかけの単語を補う

<!--
## タガーのメソッド

- **`.confidence()`** — タグの確信度の平均
- **`.swap(fromLemma, toLemma, guardTag?)`** — 辞書形をもとに、活用形をうまく置き換える
-->

## 選択メソッド

選択メソッドは、`.verbs()` や `.numbers()` のような、あらかじめ用意された検索です。
言語ごとに書かれているので、ここで使えるものは英語版と同じではありません。

### 品詞

- **`.nouns()`** — 文書の中の名詞を返す（下の `.nouns()` を参照）
- **`.verbs()`** — 文書の中の動詞を返す（下の `.verbs()` を参照）
- **`.adjectives()`** — 文書の中の形容詞と形容動詞を返す
- **`.particles()`** — 文書の中の助詞を返す
- **`.counters()`** — 文書の中の助数詞を返す
- **`.dates()`** — 日付、時刻、期間を返す
- **`.money()`** — 金額を返す
- **`.percentages()`** — パーセントを返す

### 辞書形とローマ字

- **`.toInfinitive()`** — それぞれの結果の辞書形を、文字列の配列で返す（文書は変更しない）
- **`.compute('root')`** — それぞれの単語に辞書形を設定する（`{辞書形}` の検索に必要）
- **`.romanji()`** — 文書をローマ字にした文字列を返す

### `.verbs()`

- **`.verbs(n?)`** — 文書の中の動詞を返す（「読んで + いました」のような補助動詞は、一つの動詞としてまとめる）
- **`.verbs().parse()`** — それぞれの動詞の辞書形、活用の種類、時制、否定、丁寧さを返す
- **`.verbs().json()`** — それぞれの動詞の json を返す（文法情報は `verb` に入る）
- **`.verbs().conjugate()`** — それぞれの動詞のすべての活用形を返す
- **`.verbs().toInfinitive()`** — それぞれの動詞の辞書形を、文字列の配列で返す（文書は変更しない）
- **`.verbs().toPastTense()`** — 動詞を過去形にする（食べる → 食べた）
- **`.verbs().toPresentTense()`** — 動詞を現在形にする（食べた → 食べる）
- **`.verbs().toNegative()`** — 動詞を否定形にする（食べる → 食べない）
- **`.verbs().toPositive()`** — 動詞を肯定形にする（食べない → 食べる）
- **`.verbs().toPolite()`** — 動詞を丁寧語にする（食べる → 食べます）
- **`.verbs().toPlain()`** — 動詞を普通体にする（食べます → 食べる）
- **`.verbs().isNegative()`** — 否定形の動詞だけを返す
- **`.verbs().isPositive()`** — 肯定形の動詞だけを返す
- **`.verbs().isPolite()`** — 丁寧語の動詞だけを返す
- **`.verbs().isPlain()`** — 普通体の動詞だけを返す
- **`.verbs().isImperative()`** — 命令形の動詞だけを返す

時制・否定・丁寧さは、それぞれ独立に変わります（食べました → `.toNegative()` → 食べませんでした）。
「食べよう」「食べれば」のように時制を持たない形は、そのまま残ります。

### `.nouns()`

- **`.nouns(n?)`** — 文書の中の名詞を返す
- **`.nouns().parse()`** — それぞれの名詞の基本の形、複数かどうか、後ろの助詞を返す
- **`.nouns().json()`** — それぞれの名詞の json を返す（文法情報は `noun` に入る）
- **`.nouns().conjugate()`** — それぞれの名詞の単数と複数の形を返す
- **`.nouns().isPlural()`** — 複数の印がある名詞だけを返す（子供たち、人々）
- **`.nouns().isSingular()`** — 複数の印がない名詞だけを返す
- **`.nouns().toPlural()`** — 人を表す名詞に「たち」を付ける（子供 → 子供たち）。「本」のような物の名詞は変更しない
- **`.nouns().toSingular()`** — 複数の接尾辞を取り除く（子供たち → 子供）

### `.numbers()`

- **`.numbers()`** — 数字または漢数字で書かれた数を返す（`1.5`、`１．５`、「一・五」のような小数は一つの数として扱う）
- **`.values()`** — .numbers() の別名
- **`.numbers().get()`** — それぞれの数の値を返す（「二十三」は `23`）
- **`.numbers().units()`** — それぞれの数に付いている助数詞を返す
- **`.numbers().toNumber()`** — 数を数字で書き直す（`23`）
- **`.numbers().toText()`** — 数を漢数字で書き直す（`二十三`）
- **`.numbers().toLocaleString()`** — 数を桁区切り付きで書き直す
- **`.numbers().isCardinal()`** — 基数だけを返す
- **`.numbers().isOrdinal()`** — 序数だけを返す
- **`.numbers().isEqual(n)`** — n と等しい数だけを返す
- **`.numbers().greaterThan(n)`** — n より大きい数だけを返す
- **`.numbers().lessThan(n)`** — n より小さい数だけを返す
- **`.numbers().between(min, max)`** — min と max のあいだの数だけを返す
- **`.numbers().set(n)`** — それぞれの数を n に置き換える
- **`.numbers().add(n)`** — それぞれの数に n を足す
- **`.numbers().subtract(n)`** — それぞれの数から n を引く
- **`.numbers().increment()`** — それぞれの数に 1 を足す
- **`.numbers().decrement()`** — それぞれの数から 1 を引く

## コンストラクタのメソッド

_(ビューではなく、インポートした `nlp` オブジェクトに対して呼び出します)_

- **`nlp.tokenize(text, lexicon?)`** — タガーを実行せずにテキストを解析する
- **`nlp.plugin(plugin)`** — compromise のプラグインを組み込む
- **`nlp.extend(plugin)`** — nlp.plugin() の別名
- **`nlp.addWords(words, isFrozen?)`** — 内部の辞書に新しい単語を追加する
- **`nlp.addTags(tags)`** — タグ一覧に新しいタグを追加する
- **`nlp.parseMatch(match, opts?)`** — 検索パターンを json に変換する
- **`nlp.buildNet(matches)`** — 複数のパターンを、.sweep() 用の速い形にまとめる
- **`nlp.buildTrie(words)`** — 単語のリストを、.lookup() 用の速い形にまとめる
- **`nlp.typeahead(words)`** — 入力補完の辞書に単語を追加する
- **`nlp.world()`** — ライブラリ内部のデータにアクセスする
- **`nlp.model()`** — ライブラリの言語データにアクセスする
- **`nlp.methods()`** — ライブラリ内部のメソッドにアクセスする
- **`nlp.hooks()`** — 自動的に実行される compute 関数
- **`nlp.verbose(toLog?)`** — デバッグ用に、タガーの判断を表示する
- **`nlp.version`** — ライブラリの現在の semver バージョン

### 日本語のためのメソッド

- **`nlp.conjugate(verb)`** — 辞書形の動詞から、すべての活用形を返す
- **`nlp.deconjugate(word)`** — 活用した動詞を辞書形に戻す
- **`nlp.conjugateAdjective(word)`** — イ形容詞またはナ形容詞の活用形を返す
- **`nlp.verbClass(verb)`** — 動詞の種類を返す（`'godan'`、`'ichidan'`、`'suru'` など）
- **`nlp.toNumber(numeral)`** — 漢数字を数値にする（「二十三」は `23`、「一・五」や「一点五」は `1.5`）
- **`nlp.toKanji(num)`** — 数値を漢数字にする（`23` は「二十三」、`1.5` は「一・五」）
