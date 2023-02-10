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

let doc = ldv('小さな子供は食料品店に歩いた')
doc.match('#Noun').out('array')
// [ '子', '食料品店']
```


<!-- spacer -->
<img height="15px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

またはブラウザで
```html
<script src="https://unpkg.com/de-compromise"></script>
<script>
  let txt = '小さな子供が食料品を買いました。 彼はとても怖がっていた'
  let doc = jaCompromise(txt)
  console.log(doc.sentences(1).json())
  // { text:'小さな子供が食...', terms:[ ... ] }
</script>
```


see [en-compromise/api](https://github.com/spencermountain/compromise#api) for full API documentation.

参加して助けてください！ - please join to help!

### 指示： / Contributing
```
git clone https://github.com/nlp-compromise/ja-compromise.git
cd ja-compromise
npm install
npm test
npm watch
```

### See also
* [spacy/japanese](https://spacy.io/models/ja) - python tagger/tokenizer, by [explosionAI](https://explosion.ai/)
* [meCab](https://taku910.github.io/mecab/) - C/C++ tokenizer/tagger, by Taku Kudo
* [fugashi](https://github.com/polm/fugashi) - Cython wrapper for MeCab, by [Paul O'Leary McCann](https://www.dampfkraft.com/)
* [janome](https://mocobeta.github.io/janome/en/) - python tokenizer/tagger, by Tomoko Uchida
* [sudachi](https://github.com/WorksApplications/Sudachi) - tokenizer/tagger, by Arseny Tolmachev
