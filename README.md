<div align="center">
  <img height="15px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>
  <div><b>ja-compromise</b></div>
  <img src="https://user-images.githubusercontent.com/399657/68222691-6597f180-ffb9-11e9-8a32-a7f38aa8bded.png"/>
  <div>ブラウザでのシンプルな自然言語処理</div>
  <div><code>npm install ja-compromise</code></div>
  <div align="center">
    <sub>
      work-in-progress! • 進行中！
    </sub>
  </div>
  <img height="25px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>
  <div align="center">
    <div>
      <a href="https://npmjs.org/package/ja-compromise">
        <img src="https://img.shields.io/npm/v/ja-compromise.svg?style=flat-square" />
      </a>
      <!-- <a href="https://codecov.io/gh/spencermountain/ja-compromise">
        <img src="https://codecov.io/gh/spencermountain/ja-compromise/branch/master/graph/badge.svg" />
      </a> -->
      <a href="https://bundlephobia.com/result?p=ja-compromise">
        <img src="https://img.shields.io/bundlephobia/min/ja-compromise"/>
      </a>
  </div>
    <sub>see: 
     <a href="https://github.com/nlp-compromise/fr-compromise">フランス語</a> • 
     <a href="https://github.com/nlp-compromise/es-compromise">スペイン語</a>  • 
     <a href="https://github.com/nlp-compromise/de-compromise">ドイツ語</a>  • 
     <a href="https://github.com/spencermountain/compromise">英語</a>
    </sub>
  </div>
</div>


<!-- spacer -->
<img height="85px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

ja-compromise は、英語の JavaScript ライブラリ nlp-compromise を日本語で移植したものです。

このプロジェクトの目標は、小さくて基本的なルール ベースの POS タグを提供することです。

`ja-compromise` (妥協) is a port of [compromise](https://github.com/nlp-compromise/compromise) in japanese.

The goal of this project is to provide a small, basic, rule-based POS-tagger.



<!-- spacer -->
<img height="15px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

```js
import nlp from 'ja-compromise'

let doc = nlp('小さな子供は食料品店に歩いた')
doc.match('#Noun').out('array')
// [ '子供', '食料品店' ]

doc.match('#Verb').json()[0].terms[0].tags
// [ 'Verb', 'PastTense' ]
```


<!-- spacer -->
<img height="15px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

またはブラウザで
```html
<script src="https://unpkg.com/ja-compromise"></script>
<script>
  let txt = '小さな子供が食料品を買いました。'
  let doc = jaCompromise(txt)

  console.log(doc.nouns().out('array'))
  // [ '子供', '食料品' ]

  console.log(doc.verbs().out('array'))
  // [ '買いました。' ]

  console.log(doc.compute('root').text('root'))
  // '小さな子供が食料品を買う。'
</script>
```


see [en-compromise/api](https://github.com/spencermountain/compromise#api) for full API documentation.


<!-- spacer -->
<img height="15px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

## 助詞 - particles
日本語には前置詞がなく、助詞があります。

Japanese has no prepositions - it has 助詞, which follow the word they mark.
Which kind of particle it is tells you most of what you need to know about the
words around it, so each kind gets its own tag:

| tag | 種類 | examples |
|---|---|---|
| `#CaseParticle` | 格助詞 | が を に へ で と から より まで |
| `#TopicParticle` | 係助詞 | は も こそ さえ しか |
| `#AdverbialParticle` | 副助詞 | だけ ばかり ほど くらい など |
| `#ConjunctiveParticle` | 接続助詞 | て ば たら ながら ので のに けれど |
| `#SentenceParticle` | 終助詞 | か ね よ わ ぞ ぜ |
| `#AdnominalParticle` | 連体助詞 | の |
| `#QuotativeParticle` | 引用の と | と |

They all inherit `#Particle`, and the case-marking ones also answer to
`#Preposition`, so older matches keep working.

```js
nlp('私は本を読む').match('#TopicParticle').text()  // 'は'
nlp('私は本を読む').match('#Topic').text()          // '私'
nlp('私は本を読む').match('#Object').text()         // '本'
```


<!-- spacer -->
<img height="15px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

## 活用 - conjugation
Verb conjugation is rule-based - the verb's class (五段/一段/irregular) decides
everything else.

```js
nlp.verbClass('書く')   // 'godan'
nlp.verbClass('食べる') // 'ichidan'

nlp.conjugate('書く')
// {
//   Infinitive: '書く',     Stem: '書き',        PastTense: '書いた',
//   Negative: '書かない',    Gerund: '書いて',     Polite: '書きます',
//   PolitePast: '書きました', Imperative: '書け',   Volitional: '書こう',
//   Potential: '書ける',     Passive: '書かれる',  Causative: '書かせる',
//   Conditional: '書いたら',  Provisional: '書けば', Desire: '書きたい', ..
// }

nlp.deconjugate('書きました')
// { root: '書く', tags: [ 'Verb', 'PastTense', 'Polite' ] }
```

い-adjectives conjugate too - they carry tense themselves, without the copula:

```js
nlp('この本は高かった').match('#Adjective').json()[0].terms[0].tags
// [ 'Adjective', 'IAdjective', 'PastTense' ]
```

`.compute('root')` puts every word back in its dictionary-form:

```js
nlp('映画を見ました。').compute('root').text('root')
// '映画を見る。'
```


<!-- spacer -->
<img height="15px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

## 助数詞 - counters
Japanese can't count a noun directly - it's 本を三冊, never 三本. The counter
says what *kind* of thing is being counted, so it's the nearest thing to a unit:

```js
let doc = nlp('本を五冊買って、2時間読んだ。')
doc.numbers().out('array')   // [ '五冊', '2時間' ]
doc.numbers().toNumber()     // [ 5, 2 ]
doc.counters().out('array')  // [ '冊', '時間' ]
```

A counter is only a counter when a number is in front of it - 本 is a book far
more often than it's the counter for long thin things:

```js
nlp('本を五冊買った').match('#Counter').text()  // '冊'  (not 本)
```

Numerals parse from kanji, half-width or full-width digits:

```js
nlp.toNumber('二十三')      // 23
nlp.toNumber('三百二十一')   // 321
nlp.toNumber('五十万')      // 500000
```


<!-- spacer -->
<img height="15px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

## 日付 - dates
Dates are built out of number + counter, so `年`, `月` and `日` need context -
they're the same word whether they mean a date or a span of time:

```js
nlp('1995年3月10日の午後3時').dates().out('array')
// [ '1995年3月10日', '午後3時' ]

nlp('3月').match('#Month').found      // true  - march
nlp('三ヶ月').match('#Duration').found // true  - three months
nlp('五十年').match('#Year').found     // false - fifty years, not the year 50
```

`#Date` covers `#Year`, `#Month`, `#Day`, `#WeekDay`, `#Time`, `#Season`,
`#Duration` and `#Era` (令和5年).


<!-- spacer -->
<img height="15px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

## 分かち書き - tokenizing
Japanese isn't written with spaces, so the tokenizer segments by longest-match
against the lexicon, then repairs what that gets wrong:

```js
nlp('本を読んでいる人').terms().out('array')
// [ '本', 'を', '読んでいる', '人' ]

// an unknown verb is still one word - 含む isn't in the lexicon
nlp('含まれている').terms().out('array')
// [ '含まれている' ]
```

Run `npm run score` to check segmentation and tagging against
[learn/test/gold.js](./learn/test/gold.js).


## API
ja-compromise には、`compromise/one` のすべてのメソッドが含まれます:

##### 日本語のメソッド / japanese-specific

| | |
|---|---|
| `.verbs()` | every 動詞 in the document |
| `.nouns()` | every 名詞 |
| `.adjectives()` | every 形容詞 and 形容動詞 |
| `.particles()` | every 助詞 |
| `.romanji()` | the document sounded-out in the latin alphabet |
| `.toInfinitive()` | the dictionary-form of each match |
| `.compute('root')` | set each term's dictionary-form |
| `nlp.conjugate(verb)` | the full paradigm of a dictionary-form verb |
| `nlp.deconjugate(word)` | walk a conjugated verb back to its dictionary-form |
| `nlp.conjugateAdjective(word)` | the paradigm of an い- or な-adjective |
| `nlp.verbClass(verb)` | `'godan'`, `'ichidan'`, `'suru'`, .. |
| `.numbers()` | every number, with its counter |
| `.counters()` | every 助数詞 |
| `.dates()` | every date, time and duration |
| `nlp.toNumber(numeral)` | 「二十三」 → `23` |

TypeScript declarations ship with the package - see [types/](./types).


<details>
  <summary><h3>クリックして API メソッドを表示</h3></summary>

##### Output

- **[.text()](https://observablehq.com/@spencermountain/compromise-text)** - return the document as text
- **[.json()](https://observablehq.com/@spencermountain/compromise-json)** - return the document as data
- **[.debug()](https://observablehq.com/@spencermountain/compromise-output)** - pretty-print the interpreted document
- **[.out()](https://observablehq.com/@spencermountain/compromise-output)** - a named or custom output
- **[.html({})](https://observablehq.com/@spencermountain/compromise-html)** - output custom html tags for matches
- **[.wrap({})](https://observablehq.com/@spencermountain/compromise-output)** - produce custom output for document matches

##### Utils

- **[.found](https://observablehq.com/@spencermountain/compromise-utils)** _[getter]_ - is this document empty?
- **[.docs](https://observablehq.com/@spencermountain/compromise-utils)** _[getter]_ get term objects as json
- **[.length](https://observablehq.com/@spencermountain/compromise-utils)** _[getter]_ - count the # of characters in the document (string length)
- **[.isView](https://observablehq.com/@spencermountain/compromise-utils)** _[getter]_ - identify a compromise object
- **[.compute()](https://observablehq.com/@spencermountain/compromise-compute)** - run a named analysis on the document
- **[.clone()](https://observablehq.com/@spencermountain/compromise-utils)** - deep-copy the document, so that no references remain
- **[.termList()](https://observablehq.com/@spencermountain/compromise-accessors)** - return a flat list of all Term objects in match
- **[.cache({})](https://observablehq.com/@spencermountain/compromise-cache)** - freeze the current state of the document, for speed-purposes
- **[.uncache()](https://observablehq.com/@spencermountain/compromise-cache)** - un-freezes the current state of the document, so it may be transformed

##### Accessors

- **[.all()](https://observablehq.com/@spencermountain/compromise-utils)** - return the whole original document ('zoom out')
- **[.terms()](https://observablehq.com/@spencermountain/compromise-selections)** - split-up results by each individual term
- **[.first(n)](https://observablehq.com/@spencermountain/compromise-accessors)** - use only the first result(s)
- **[.last(n)](https://observablehq.com/@spencermountain/compromise-accessors)** - use only the last result(s)
- **[.slice(n,n)](https://observablehq.com/@spencermountain/compromise-accessors)** - grab a subset of the results
- **[.eq(n)](https://observablehq.com/@spencermountain/compromise-accessors)** - use only the nth result
- **[.firstTerms()](https://observablehq.com/@spencermountain/compromise-accessors)** - get the first word in each match
- **[.lastTerms()](https://observablehq.com/@spencermountain/compromise-accessors)** - get the end word in each match
- **[.fullSentences()](https://observablehq.com/@spencermountain/compromise-accessors)** - get the whole sentence for each match
- **[.groups()](https://observablehq.com/@spencermountain/compromise-accessors)** - grab any named capture-groups from a match
- **[.wordCount()](https://observablehq.com/@spencermountain/compromise-utils)** - count the # of terms in the document

##### Match

_(match methods use the [match-syntax](https://docs.compromise.cool/compromise-match-syntax).)_

- **[.match('')](https://observablehq.com/@spencermountain/compromise-match)** - return a new Doc, with this one as a parent
- **[.not('')](https://observablehq.com/@spencermountain/compromise-match)** - return all results except for this
- **[.matchOne('')](https://observablehq.com/@spencermountain/compromise-match)** - return only the first match
- **[.if('')](https://observablehq.com/@spencermountain/compromise-match)** - return each current phrase, only if it contains this match ('only')
- **[.ifNo('')](https://observablehq.com/@spencermountain/compromise-match)** - Filter-out any current phrases that have this match ('notIf')
- **[.has('')](https://observablehq.com/@spencermountain/compromise-match)** - Return a boolean if this match exists
- **[.before('')](https://observablehq.com/@spencermountain/compromise-match)** - return all terms before a match, in each phrase
- **[.after('')](https://observablehq.com/@spencermountain/compromise-match)** - return all terms after a match, in each phrase
- **[.union()](https://observablehq.com/@spencermountain/compromise-pointers)** - return combined matches without duplicates
- **[.intersection()](https://observablehq.com/@spencermountain/compromise-pointers)** - return only duplicate matches
- **[.complement()](https://observablehq.com/@spencermountain/compromise-pointers)** - get everything not in another match
- **[.settle()](https://observablehq.com/@spencermountain/compromise-pointers)** - remove overlaps from matches
- **[.growRight('')](https://observablehq.com/@spencermountain/compromise-match)** - add any matching terms immediately after each match
- **[.growLeft('')](https://observablehq.com/@spencermountain/compromise-match)** - add any matching terms immediately before each match
- **[.grow('')](https://observablehq.com/@spencermountain/compromise-match)** - add any matching terms before or after each match
- **[.sweep(net)](https://observablehq.com/@spencermountain/compromise-sweep)** - apply a series of match objects to the document
- **[.splitOn('')](https://observablehq.com/@spencermountain/compromise-split)** - return a Document with three parts for every match ('splitOn')
- **[.splitBefore('')](https://observablehq.com/@spencermountain/compromise-split)** - partition a phrase before each matching segment
- **[.splitAfter('')](https://observablehq.com/@spencermountain/compromise-split)** - partition a phrase after each matching segment
- **[.lookup([])](https://observablehq.com/@spencermountain/compromise-match)** - quick find for an array of string matches
- **[.autoFill()](https://observablehq.com/@spencermountain/compromise-typeahead)** - create type-ahead assumptions on the document

##### Tag

- **[.tag('')](https://observablehq.com/@spencermountain/compromise-tagger)** - Give all terms the given tag
- **[.tagSafe('')](https://observablehq.com/@spencermountain/compromise-tagger)** - Only apply tag to terms if it is consistent with current tags
- **[.unTag('')](https://observablehq.com/@spencermountain/compromise-tagger)** - Remove this term from the given terms
- **[.canBe('')](https://observablehq.com/@spencermountain/compromise-tagger)** - return only the terms that can be this tag

##### Case

- **[.toLowerCase()](https://observablehq.com/@spencermountain/compromise-case)** - turn every letter of every term to lower-cse
- **[.toUpperCase()](https://observablehq.com/@spencermountain/compromise-case)** - turn every letter of every term to upper case
- **[.toTitleCase()](https://observablehq.com/@spencermountain/compromise-case)** - upper-case the first letter of each term
- **[.toCamelCase()](https://observablehq.com/@spencermountain/compromise-case)** - remove whitespace and title-case each term

##### Whitespace

- **[.pre('')](https://observablehq.com/@spencermountain/compromise-whitespace)** - add this punctuation or whitespace before each match
- **[.post('')](https://observablehq.com/@spencermountain/compromise-whitespace)** - add this punctuation or whitespace after each match
- **[.trim()](https://observablehq.com/@spencermountain/compromise-whitespace)** - remove start and end whitespace
- **[.hyphenate()](https://observablehq.com/@spencermountain/compromise-whitespace)** - connect words with hyphen, and remove whitespace
- **[.dehyphenate()](https://observablehq.com/@spencermountain/compromise-whitespace)** - remove hyphens between words, and set whitespace
- **[.toQuotations()](https://observablehq.com/@spencermountain/compromise-whitespace)** - add quotation marks around these matches
- **[.toParentheses()](https://observablehq.com/@spencermountain/compromise-whitespace)** - add brackets around these matches

##### Loops

- **[.map(fn)](https://observablehq.com/@spencermountain/compromise-loops)** - run each phrase through a function, and create a new document
- **[.forEach(fn)](https://observablehq.com/@spencermountain/compromise-loops)** - run a function on each phrase, as an individual document
- **[.filter(fn)](https://observablehq.com/@spencermountain/compromise-loops)** - return only the phrases that return true
- **[.find(fn)](https://observablehq.com/@spencermountain/compromise-loops)** - return a document with only the first phrase that matches
- **[.some(fn)](https://observablehq.com/@spencermountain/compromise-loops)** - return true or false if there is one matching phrase
- **[.random(fn)](https://observablehq.com/@spencermountain/compromise-loops)** - sample a subset of the results

##### Insert

- **[.replace(match, replace)](https://observablehq.com/@spencermountain/compromise-insert)** - search and replace match with new content
- **[.replaceWith(replace)](https://observablehq.com/@spencermountain/compromise-insert)** - substitute-in new text
- **[.remove()](https://observablehq.com/@spencermountain/compromise-insert)** - fully remove these terms from the document
- **[.insertBefore(str)](https://observablehq.com/@spencermountain/compromise-insert)** - add these new terms to the front of each match (prepend)
- **[.insertAfter(str)](https://observablehq.com/@spencermountain/compromise-insert)** - add these new terms to the end of each match (append)
- **[.concat()](https://observablehq.com/@spencermountain/compromise-insert)** - add these new things to the end

##### Transform

- **[.sort('method')](https://observablehq.com/@spencermountain/compromise-sorting)** - re-arrange the order of the matches (in place)
- **[.reverse()](https://observablehq.com/@spencermountain/compromise-sorting)** - reverse the order of the matches, but not the words
- **[.unique()](https://observablehq.com/@spencermountain/compromise-sorting)** - remove any duplicate matches


##### Lib

_(these methods are on the main `nlp` object)_

- **[nlp.tokenize(str)](https://observablehq.com/@spencermountain/compromise-tokenization)** - parse text without running POS-tagging
- **[nlp.lazy(str, match)](https://observablehq.com/@spencermountain/compromise-performance)** - scan through a text with minimal analysis
- **[nlp.plugin({})](https://observablehq.com/@spencermountain/compromise-constructor-methods)** - mix in a compromise-plugin
- **[nlp.parseMatch(str)](https://observablehq.com/@spencermountain/compromise-constructor-methods)** - pre-parse any match statements into json
- **[nlp.world()](https://observablehq.com/@spencermountain/compromise-constructor-methods)** - grab or change library internals
- **[nlp.model()](https://observablehq.com/@spencermountain/compromise-constructor-methods)** - grab all current linguistic data
- **[nlp.methods()](https://observablehq.com/@spencermountain/compromise-constructor-methods)** - grab or change internal methods
- **[nlp.hooks()](https://observablehq.com/@spencermountain/compromise-constructor-methods)** - see which compute methods run automatically
- **[nlp.verbose(mode)](https://observablehq.com/@spencermountain/compromise-constructor-methods)** - log our decision-making for debugging
- **[nlp.version](https://observablehq.com/@spencermountain/compromise-constructor-methods)** - current semver version of the library

- **[nlp.addWords(obj)](https://observablehq.com/@spencermountain/compromise-plugin)** - add new words to the lexicon
- **[nlp.addTags(obj)](https://observablehq.com/@spencermountain/compromise-plugin)** - add new tags to the tagSet
- **[nlp.typeahead(arr)](https://observablehq.com/@spencermountain/compromise-typeahead)** - add words to the auto-fill dictionary
- **[nlp.buildTrie(arr)](https://observablehq.com/@spencermountain/compromise-lookup)** - compile a list of words into a fast lookup form
- **[nlp.buildNet(arr)](https://observablehq.com/@spencermountain/compromise-sweep)** - compile a list of matches into a fast match form

<!-- spacer -->
<img height="30px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>
</details>

参加して助けてください！ - please join to help!

### 指示： / Contributing
```
git clone https://github.com/nlp-compromise/ja-compromise.git
cd ja-compromise
npm install
npm test
npm watch
```

### 制限 / Known gaps
* kanji readings are per-character with a small override table, so romanization
  of unfamiliar compounds is often wrong
* segmentation is greedy longest-match, with no way to weigh one reading of an
  ambiguous kana string against another
* compound verbs (吐き出す) split at the first stem unless they're in the lexicon
* personal names are found from an honorific suffix, not from a name-list

### See also
* [spacy/japanese](https://spacy.io/models/ja) - python tagger/tokenizer, by [explosionAI](https://explosion.ai/)
* [meCab](https://taku910.github.io/mecab/) - C/C++ tokenizer/tagger, by Taku Kudo
* [fugashi](https://github.com/polm/fugashi) - Cython wrapper for MeCab, by [Paul O'Leary McCann](https://www.dampfkraft.com/)
* [janome](https://mocobeta.github.io/janome/en/) - python tokenizer/tagger, by Tomoko Uchida
* [sudachi](https://github.com/WorksApplications/Sudachi) - tokenizer/tagger, by Arseny Tolmachev
