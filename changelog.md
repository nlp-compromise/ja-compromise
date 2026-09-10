<!-- ja-compromise changelog -->

### [unreleased]

#### Tokenizer

- **[fix]** - opening brackets 「『（ attach to the word after them, not the word before - 彼は「はい」 was tokenized as は「
- **[change]** - drop the isSentence override - compromise handles japanese sentence-ends itself
- **[update]** - compromise 14.16.0

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
- **[new]** - `tests/conjugate-corpus.test.js` checks every generated form against
  the independent reference table in `learn/verbs/` - 16,798 forms across 367
  verbs, plus their verb-class. All of them match.

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

#### Counters (助数詞)

Japanese can't count a noun directly - it's 本を三冊, never 三本 - so the counter
is the closest thing the language has to a unit. None of this was recognised:
`三人` came out as two untagged tokens, `二十三` as three.

- **[new]** - `lexicon/counters.js` - 95 counters, grouped by what they count:
  people (人, 名), animals (匹, 頭, 羽), shapes (本, 枚, 冊, 台), time, money,
  measures, and the ordinal-forming ones (番目, 回目).
- **[new]** - a counter is only tagged `#Counter` when a number sits in front of
  it. 本 is a book far more often than it's the counter for long thin things, so
  the counter list is a tagger-side table rather than a lexicon override - the
  noun readings are left alone.
- **[new]** - `src/01-one/numbers/` parses japanese numerals: kanji, half-width
  and full-width digits. `nlp.toNumber('三百二十一')` is 321. Powers stack the
  way they do in japanese (十 is ×10, not a digit), and 万/億/兆 close a group
  off - so 五十万 is 500,000, not 51×10,000.
- **[fix]** - a numeral run is now one token. `二十三` was three separate `#Value`
  terms, and `三ヶ月` was 三 + ヶ + 月 (ヶ sits in the katakana unicode block, so
  the script-run joiner wouldn't merge it with 月).
- **[new]** - the parsed value is on the term as `.number`, and
  `.numbers().toNumber()` reads it back.
- **[new]** - `#Counter`, `#TimeCounter`, `#DurationCounter`, `#DateCounter` and
  `#NumberPhrase` tags, plus `.numbers()` and `.counters()`.
- **[new]** - 何 takes a counter just like a number does - `何冊`, `何人`.

#### Numbers, matching english compromise

- **[breaking]** - `.numbers().toNumber()` used to *return* the parsed values.
  In english compromise `.get()` reads and `.toNumber()` rewrites, so this now
  does too: `.get()` returns `[23]`, `.toNumber()` turns 二十三 into 23 in the
  document.
- **[breaking]** - `.numbers()` matches `#Value+` only, as it does in english.
  The counter comes from `.units()`, so `nlp('五冊').numbers().text()` is 五, not
  五冊.
- **[new]** - `.toText()` writes the other way - `23` becomes 二十三. Japanese
  numerals are fully compositional (23 is 二十三, "two-ten-three"), so unlike
  english there are no irregular forms to table. The one wrinkle is that
  japanese groups by 10,000 (万) rather than 1,000, and 一 is dropped before
  十/百/千 but kept before 万 - 10 is 十, 10,000 is 一万.
- **[new]** - `nlp.toKanji(1995)` → 千九百九十五, alongside the existing
  `nlp.toNumber`. Every integer from 0 to 20,000 round-trips through both, plus
  spot-checks to 5×10¹¹.
- **[new]** - a `Numbers` view-class mirroring english: `.parse()`, `.get()`,
  `.json()`, `.units()`, `.isOrdinal()`, `.isCardinal()`, `.toNumber()`,
  `.toText()`, `.toLocaleString()`, `.set()`, `.add()`, `.subtract()`,
  `.increment()`, `.decrement()`, `.isEqual()`, `.greaterThan()`, `.lessThan()`,
  `.between()`. Plus `.values()` as the alias, and `.money()` / `.percentages()`.
- **[new]** - rewriting keeps the script it found: 五冊 + 10 is 十五冊, 23人 - 2
  is 21人, and ２３冊 stays full-width.
- **[fix]** - the rewrite swaps the text on the term rather than going through
  `.replaceWith()`, which inserts a space between terms - 五冊 was coming back as
  `5 冊`, and japanese doesn't put a space there.

#### Dates

`1995年3月10日` was six untagged tokens. The `#Date`, `#Year`, `#Month` and
`#Time` tags existed in the tagset and nothing ever set them.

- **[new]** - dates are assembled from number + counter. 年, 月 and 日 are the
  same word whether they mean a date or a span of time, so the number in front
  and the word behind decide: `3月` is March, `三ヶ月` is three months; `十日` is
  the 10th, `十日間` is ten days; `五十年` is fifty years, not the year 50.
- **[new]** - times: `3時30分`, and `半` as half-past (`三時半`, `1時間半`).
  `午前`/`午後` tag as `#AmPm` and join the time beside them.
- **[new]** - the regnal eras (`令和5年`, `平成`, `昭和`) tag as `#Era`, and make
  the number after them a `#Year` even when it's small.
- **[new]** - `lexicon/dates.js` - relative dates (今日, 来年, 毎朝), seasons,
  and times of day.
- **[fix]** - **the weekday lexicon tagged 水曜日 `Weekday`, but the tagset
  declares `WeekDay`.** The tag was undeclared, so it inherited nothing - 水曜日
  was neither a `#Noun` nor a `#Date`. An undeclared tag doesn't throw, it just
  sits on the term inheriting nothing, so `tests/tagset.test.js` now checks every
  tag the library can emit against the tagset - the built lexicon, the
  counter/date/particle tables, the conjugator's form-tags, the deconjugator's
  suffix table, and the tags a real document ends up with. All 128 declared, 0
  undeclared.
- **[fix]** - `#Month` inherited from `#Singular`, so tagging `3月` stripped the
  `#Value` off the 3 (`#Noun` and `#Value` are mutually exclusive). It's a
  `#Date` now.
- **[fix]** - a word listed under two tags kept only the last one - 毎朝 became a
  `#Date` and stopped being a `#Noun`. The lexicon merges them now.
- **[new]** - `#Day`, `#Era`, `#AmPm` tags, and `.dates()`.

#### The reference verb-table

`learn/verbs/verbs.js` is the scraped table the old conjugation model was
learned from. It's now cleaned up, and `npm run audit` re-checks all of it.

- **[fix]** - **44 rows lost columns during the scrape, and the scraper zipped the
  surviving values against the wrong labels.** `書く`'s `passive_plain_positive`
  held `書ける` (the potential), its `causative_plain_positive` held `書いたら`
  (a conditional). The values are all real forms of the verb, just filed under
  the wrong names - which is precisely what `suffix-thumb` learned. Those rows
  can't be recovered (the original scrape input is gone), so they now carry
  `trusted: false` and keep only their dictionary-form, class, gloss and stem.
- **[fix]** - four rows were conjugated as the wrong verb-class: 言い換える, 滅びる,
  臥せる and 隠れる are ichidan. There's no structural tell for this - 混じる,
  脂ぎる, 蹴る and ふける look identical and really are godan - so the corrections
  are listed by hand in `audit.js` with their evidence.
- **[fix]** - 17 truncated volitionals (`喜ぼ` for `喜ぼう`, `泳ご` for `泳ごう`).
- **[fix]** - 72 `causative_plain_negative` cells were a copy of the plain negative
  (`喜ばない` where `喜ばせない` belongs). Dropped rather than guessed at.
- **[fix]** - one row was keyed by its masu-stem (`ふけ`) instead of its
  dictionary-form (`ふける`), and one key had a leading space (`' 寄る'`).
- **[change]** - the `infinitive` column is renamed `masu_stem`. It always held the
  連用形, and reading it as a dictionary-form is what put stems like 見 and 行き
  into the lexicon where 見る and 行く belonged.
- **[change]** - 2,784 values had stray internal whitespace (`書いて います`).
- **[new]** - `npm run audit` checks the table against the conjugator in both
  directions - verb-class and every column. 16,798 forms across 367 verbs, with
  no disagreements. Since the table is an outside source, that's real
  cross-validation rather than a self-check.
- **[change]** - deleted `learn/verbs/learn.js` (it retrains the broken
  `suffix-thumb` model), `cleanup.js` (its input file no longer exists), and the
  `index.js`/`easy-forms.js` scratch files. `audit.js` and `columns.js` replace them.

Two bugs in this library turned up because the cleaned table disagreed with it:
`出来る` was being treated as a 来る-compound (it's an ordinary ichidan verb - a
来る compound is always て-form + 来る), and `くれる`'s imperative is `くれ`, not
`くれろ`. `蹴る` was the reverse - the table was right and this library had it
filed as ichidan when modern 蹴る is godan (`蹴った`, not `蹴た`).

#### TypeScript

- **[fix]** - **`package.json` declared `"types": "types/index.d.ts"`, and no such
  file existed.** Every TypeScript consumer got an unresolvable import.
- **[new]** - written and checked-in: `types/index.d.ts` (the constructor and the
  `View`), `types/misc.d.ts` and `types/japanese.d.ts` (conjugation paradigms and
  verb classes). Compromise's `./one` subpath has no `types` condition in its
  exports map, so its `View` type can't be imported from here - it's restated
  instead, with a note to keep it in sync on a dependency bump.
- **[fix]** - `"files"` listed only `builds/` and `docs/`, so even a correct
  `types/` directory wouldn't have been published. Added.
- **[new]** - `npm run typecheck`, and `tsc` now runs as part of `npm test`.
  `tests/types/usage.ts` is a compile-only file that exercises the public API, so
  the declarations can't drift from the library again. (It's part of `test`
  rather than a `pretest` hook because `ignore-scripts` is a common npm setting
  and lifecycle hooks silently don't run under it.)

#### Demo and docs

- **[fix]** - **`demo/index.html` was an unmodified copy of the German demo** -
  German title, German UI, German sample text, loading `../builds/de-compromise.min.js`
  and reading `window.deCompromise`. Rewritten in Japanese against the real build.
- **[fix]** - the demo's highlighter passed `{nouns: ...}` to `.html()`, which
  emits `<nouns>` *elements*, so none of its CSS ever applied. The keys need a
  leading dot (`{'.nouns': '#Noun'}`) to produce `<span class="nouns">`. This bug
  was in the German original too.
- **[fix]** - the README's browser example loaded `unpkg.com/de-compromise` and
  called `doc.sentences(1)`, which `compromise/one` doesn't provide. Replaced
  with verified output.
- **[fix]** - the API list documented `.confidence()`, `.swap()` and
  `.normalize()`. The first two exist only once `compromise/two` is loaded (it
  patches the shared `View` prototype); the third doesn't exist at all. All 73
  remaining documented methods were checked against the library.
- **[new]** - README section for the japanese-specific methods.

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
