<!-- ja-compromise changelog -->

### 0.1.0 [Aug 2023]

A grammar-focused overhaul. The tokenizer, the part-of-speech tagger and the
whole conjugation engine were rewritten. Tagging on the reference set went from
roughly a third of tokens mis-tagged to 100% on the 25-sentence gold file
(`npm run score`), and the test-suite grew from 23 assertions to 313.

#### Conjugation

- **[fix]** - **the conjugation model was producing wrong forms for most verbs.**
  It was learned with `suffix-thumb` from a scraped table (`learn/verbs/verbs.js`)
  whose columns are shifted on a majority of rows, so the model had learned the
  wrong mapping outright. `toPassive('書き')` returned `書ける` (the *potential*),
  `toCausative('書き')` returned `書いたら` (a *conditional*), and `toPastPolite`
  returned the plain past for most verbs - which is why `食べた` and `行った` were
  being tagged `#Polite`.
- **[new]** - replaced it with a rule-based conjugator in `src/01-one/conjugate/`.
  Japanese conjugation is regular once you know the verb's class, so the new code
  derives the five 活用形 and builds every form off them. 五段, 一段, する, 来る,
  ある, 行く, 問う and the くださる-group each get their own paradigm.
- **[new]** - 30 forms per verb, including ones the old model had no notion of:
  potential, volitional, provisional (〜ば) as distinct from conditional (〜たら),
  progressive, representative (〜たり), continuative (〜ながら), desire (〜たい),
  causative-passive, and the negative of each.
- **[fix]** - 音便 (the て/た sound-change) is now correct for every godan ending,
  including the 行く exception (`行って`, never `行いて`) and 問う/請う (`問うて`).
- **[fix]** - ある's negative is `ない`, not `あらない`.
- **[new]** - `verb-class.js` decides 五段 vs 一段 for -る verbs from a vowel
  heuristic plus word-lists for the cases kanji hides (帰る is godan, 変える isn't).
- **[new]** - い-adjectives conjugate: `高い → 高くない → 高かった → 高くて → 高ければ`,
  with いい/良い inflecting irregularly as よい. な-adjectives get `静かに` and their
  copula forms.
- **[new]** - `deconjugate()` walks a surface-form back to its dictionary-form,
  so an unknown verb can still be tagged. It disambiguates 話した (話す) from
  勉強しました (勉強する) by how long the head is.
- **[new]** - `tests/conjugate-corpus.test.js` checks 1,620 generated forms against
  the reference table's four trustworthy columns. All of them match.

#### Tokenizer

- **[fix]** - **verb inflections were being split off as separate tokens.** The
  lexicon held bare suffix-fragments (`んで`, `って`, `いた`, `ました`) as if they
  were words, so 読んでいる came out `読 | んで | いる` and 降ったら came out
  `降 | ったら`. Conjugated forms are now generated into the lexicon in full.
- **[fix]** - punctuation no longer becomes its own empty-text term. `昨日、映画` used
  to produce a term whose text was `''`, tagged `#Noun`.
- **[fix]** - `.text()` round-trips its input. Leading `「` and a trailing `。` were
  both being dropped.
- **[fix]** - a sentence containing spaces skipped the tokenizer entirely, so
  `ニュージーランドは 2 つの…` came out with `ニュージーランドは` as one token. Every
  whitespace chunk is now tokenized, and the space is treated as a real boundary.
- **[fix]** - kanji runs no longer merge across word boundaries (`毎日学校` was one
  token). A known single kanji can extend a run (`日本人`) but never start one, so
  `読んでいる人` keeps 人 separate.
- **[new]** - a stretch of loose kana that matched nothing is now read as one
  unknown word: `ひらがな` was coming out as `ひ|ら|が|な` because が and な are also
  particles. `を` acts as a hard boundary, and a case-particle at either edge is
  split back off, so `しんぶんをよむ` → `しんぶん | を | よむ`.
- **[new]** - an unknown kanji stem now picks up its okurigana by deconjugating the
  kana that follow it, so 含まれている is one verb even though 含む isn't in the
  lexicon. `木で作った` still stays three tokens - a particle can't start okurigana.
- **[fix]** - katakana words stay whole. `ヨーロッパ` and `カレンダー` were being cut
  at 4 characters, `ー` was treated as a script change, and `・` (which lives inside
  the katakana unicode block) was being glued into the word.
- **[change]** - the character-trie was replaced by a Set plus a bounded backwards
  scan - same segmentation, ~20mb less memory.

#### Tagging

- **[new]** - **a real particle tagset.** Japanese has postpositions, not
  prepositions, and which kind matters: `#CaseParticle` (が を に へ で と から),
  `#TopicParticle` (は も こそ さえ), `#AdverbialParticle` (だけ ばかり ほど),
  `#ConjunctiveParticle` (て ば たら ながら ので), `#SentenceParticle` (か ね よ わ ぞ),
  `#AdnominalParticle` (の) and `#QuotativeParticle`. They all inherit `#Particle`,
  and the case-marking ones still answer to `#Preposition` for compatibility.
- **[fix]** - sentence-final particles were being tagged `#Verb`/`#Auxiliary`.
  「いいですね」 tagged ね as a verb; 「ですか」 tagged か as one.
- **[fix]** - **the last word of a sentence was blanket-tagged `#Verb`.** 猫, 人 and
  ベッド were all coming back as verbs. The end-of-sentence guess is gone; verbs are
  identified from the lexicon or from their conjugation.
- **[fix]** - **`#PresentTense` and `#PastTense` no longer imply `#Verb`.** Japanese
  adjectives carry tense themselves, and the old tagset made `高かった` a verb by
  forcing `#PastTense → #Verb → not #Adjective`.
- **[fix]** - **'ends in い' is no longer enough to be an adjective.** That rule was
  tagging every negative verb (`分からない`, `行かない`) and every `〜たい` form as an
  adjective, and stripping their `#Verb` tag in the process.
- **[new]** - い-adjectives (`#IAdjective`) and な-adjectives (`#NaAdjective`) are
  separate classes. きれい, 嫌い and 幸い end in い but are な-adjectives; they were
  all in the wrong list.
- **[new]** - a particle tells the tagger about the word before it - を marks an
  `#Object`, は a `#Topic`, の a `#Possessive` - but only when that word isn't
  already a verb, so 「走るの」 and 「行くと言った」 tag the particle instead.
- **[new]** - と is a `#Conjunction` between two nouns and a `#QuotativeParticle`
  after a verb. な before a noun is the adnominal copula, not a final particle.
- **[new]** - 〜て + いる/ある carries `#Progressive` back onto the て-form, and an
  auxiliary hands its tense and politeness back to the verb it attaches to.
- **[new]** - する-nouns: 勉強 is a `#Noun`, 勉強します is a `#Verb`.
- **[new]** - `#Honorific` after a name marks it `#Person` (田中さん), and 〜たち
  marks `#Plural`.
- **[new]** - こそあど demonstratives, question words, and 形式名詞 (こと, もの, ため)
  are in the lexicon with real tags.

#### Lexicon

- **[fix]** - **there was one noun in the noun list.** 「人」. There are now ~300
  high-frequency ones.
- **[fix]** - する, 来る, ある, いる and なる - the five most common verbs in the
  language - were all missing.
- **[change]** - verbs are stored as dictionary-forms tagged by conjugation class
  (`lexicon/verbs/godan.js`, `ichidan.js`, `irregular.js`) rather than as
  masu-stems tagged `Infinitive`. The old data had 見 (a stem) where 見る belongs.
- **[fix]** - `でした` was tagged `#PresentTense`.
- **[fix]** - hand-written entries in `misc.js` were being silently overwritten by
  the packed word-lists - which is how で lost its copula reading. They now win.
- **[fix]** - dropped junk that was breaking segmentation: `さ`/`もの` tagged
  `#Preposition`, conjunctions stored with their comma attached (`と、`), pronouns
  stored comma-joined (`我, 吾`), 家 and 内 listed as pronouns, verb past-forms
  (`怒った`, `痩せた`) and の-adjectives (`緑の`) in the adjective list, and short
  katakana interjections (`フェ` was eating the front of カフェ).
- **[change]** - deleted `lexicon/verbs/auxiliaries.js` - a list of 313 bare
  suffix fragments (`んで`, `って`, `ました`) stored as if they were words. That
  list is what was cutting verbs in half. `lexicon/adjectives.js` and
  `lexicon/verbs/infinitives.js` are superseded by `adjectives-i.js` /
  `adjectives-na.js` and `godan.js` / `ichidan.js`.
- **[new]** - a bare kana masu-stem is kept out of the index (のり would eat the
  front of のりこ); kanji ones like 泳ぎ stay, tagged `#VerbStem`, which is a `#Noun`.

#### Romanization

- **[fix]** - katakana wasn't romanized at all - `カタカナ` came back unchanged.
  Both scripts now fold to one map.
- **[fix]** - `isHiragana(str)` was called on the whole string instead of the
  character, so a mixed word bailed out on its first character.
- **[fix]** - `ー` lengthens the preceding vowel (`コーヒー` → `koohii`), and a lone
  `っ` doubles the following consonant instead of spelling itself out.
- **[fix]** - は, へ and を romanize as `wa`, `e` and `o` when they're particles.
- **[fix]** - kanji with okurigana take their kun-reading, so 行きました is
  `ikimashita`, not `koukimashita`, and 読む is `yomu`, not `dokumu`.
- **[new]** - a small word-level reading table for the 熟字訓 and compounds that
  per-character readings always get wrong (日本語, 手紙, 美味しい). Kanji readings are
  still approximate - a real reading dictionary is the proper fix.

#### API

- **[new]** - `nlp.conjugate('書く')` returns the full paradigm.
- **[new]** - `nlp.deconjugate('書きました')` returns `{root, tags}`.
- **[new]** - `nlp.verbClass('食べる')` returns `'ichidan'`.
- **[new]** - `.compute('root')` sets each term's dictionary-form, so
  `.text('root')` turns 映画を見ました into 映画を見る.
- **[new]** - `.verbs()`, `.nouns()`, `.adjectives()`, `.particles()`.

#### Housekeeping

- **[fix]** - `src/_lib.js` imported compromise from a hard-coded path on the
  author's machine (`/Users/spencer/mountain/compromise/src/one.js`), so the
  package couldn't be installed by anyone else.
- **[fix]** - `src/lib/char.js` called `str.split()` at module scope before `str`
  was declared. It was dead code; it's gone, along with the unused
  `suffix-thumb` model files.
- **[new]** - `npm run score` reports segmentation and tagging accuracy against
  `learn/test/gold.js`.

#### Known gaps

- Kanji readings are per-character with a small override table, so romanization of
  unfamiliar compounds is often wrong.
- Segmentation is greedy longest-match. It has no way to prefer one reading of an
  ambiguous kana string over another - `がっこう` still splits at こう.
- Compound verbs (吐き出す, 引き受ける) are only recognized when they're in the
  lexicon; otherwise they split at the first stem.
- Personal names are recognized from an honorific suffix, not a name list.

### 0.0.1 [Jan 2023]
- **[new]** - first commit
