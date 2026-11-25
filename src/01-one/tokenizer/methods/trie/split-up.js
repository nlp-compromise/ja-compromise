// lowest-cost segmentation.
//
// this used to take the longest lexicon-word at each position, and never look
// back.  that can't recover from a bad first choice -
//   きょうはいいてんきです → きょう|はい|いて|んき|です
// - so several passes ran afterwards, to repair what it got wrong.
//
// now every way of cutting the text up is given a cost, and the cheapest one
// wins.  the costs are small and hand-set - there's no corpus behind them:
//   - a known word costs about 1, so fewer, longer words are preferred
//   - a stretch of kana we don't know costs more the longer it is - cheaper
//     than shattering it into particles, dearer than the real words inside it
//   - a particle somewhere a particle can't go costs extra
//
// kanji compounds are not weighed here.  ./kanji-run.js decides those.

import kanjiRun from './kanji-run.js'
import verbRule from './verb-rule.js'
import deconjugate from '../../../conjugate/deconjugate.js'
import { canBeOkurigana } from '../okurigana.js'
import { roots } from '../../../lexicon/lexicon.js'
import { isSecondVerb } from '../../../conjugate/compound.js'
import { isHiragana, isKatakana, isKanji, isAscii, isEmoji, isEmojiJoiner, charAt } from '../lib.js'

const hasWord = Object.prototype.hasOwnProperty

// ---- costs ----
const WORD = 1 // a known word
const LOOSE = 1.2 // て, ば, だ, ん - known, but they belong on the end of something
const STRAY = 1.5 // one unknown character - a letter, a digit, a katakana
const STRAY_KANA = 3 // one unknown hiragana - nearly always a wrong cut
// an unknown kana word, by its length - てんき is 3.
// each kana costs more than its share of a known word would, so it can't
// swallow the words around it - がくせい|です.  two kana are dear, because
// they could be two particles - での.  long ones are dearer still, because
// they're probably two words and a particle - なまえ|は|たなか
const UNKNOWN = [0, 0, 2.4, 3, 3.7, 4.8, 6, 7.2]
const VERB = 1.3 // an unknown kanji and a verb-ending - 届きました
const GERUND = 0.95 // a て-form - 開けて|も, rather than 開け|ても
const RULE = 1.1 // a known verb, with an ending the lexicon doesn't list - 行かなければ
const LEAD = 1.2 // an unknown word with a particle on the front - 経験|に|つながる
const TRAIL = 0.5 // …or on the end - ひらがな|と.  but names end this way too - たなか
const MISPLACED = 1.5 // a particle that can't follow the one before it
const OPENER = 1 // a particle beginning the text
const AFTER_FINAL = 0.5 // something following ね or よ
const INTERJECTION = 1 // はい or うん in the middle of things - きょう|は|いい, not きょう|はい|い..

const MAX_KANA = UNKNOWN.length - 1 // beyond this, unknown kana really is several words
const MAX_OKURI = 6

// no word begins with one of these
const cantStart = new Set('ぁぃぅぇぉっゃゅょゎんー')
// …and nothing ends just before one of these
const cantFollow = new Set('ぁぃぅぇぉっゃゅょゎー')
// a case-particle on the end of an unknown word probably isn't part of it
const edgeParticle = new Set('はがをにへともので')
// には, にも, での, とか
const afterParticle = new Set('はものか')
// のは, のが, のを - の turns what's before it into a noun
const afterNo = new Set('はがをにでもかとだよねさ')

const particleTag = /Particle$/

const tagsOf = function (lexicon, str) {
  const tags = lexicon[str]
  return typeof tags === 'string' ? [tags] : tags || []
}

// what sort of word is this, as far as its neighbour is concerned?
//  no - の,  final - ね/よ/な,  particle - any other 助詞,  other
const getKind = function (lexicon, str) {
  if (str === 'の') {
    return 'no'
  }
  const tags = tagsOf(lexicon, str)
  if (str.length === 1 && tags.includes('SentenceParticle')) {
    return 'final'
  }
  // だけ and から can be followed by anything, so only the one-kana particles count
  if (str.length === 1 && tags.some(t => particleTag.test(t))) {
    return 'particle'
  }
  return 'other'
}

// is a hiragana run - ー may lengthen it, らーめん
const isKana = (c, isFirst) => isHiragana(c) || (c === 'ー' && !isFirst)
// …and so may a wave-dash, when there's more of the word to come - すご〜い
const isWave = (txt, i) => (txt[i] === '〜' || txt[i] === '~') && isHiragana(txt[i - 1] || '') && isHiragana(txt[i + 1] || '')

// things that are one word, whatever punctuation is inside them.
// the text here is plain-width, so these are all ascii
const patterns = [
  /https?:\/\/[\w\-.~:/?#[\]@!$&'()*+,;=%]+/y, // a url
  /www\.[\w-]+(?:\.[\w-]+)+[\w\-.~:/?#[\]@!$&'()*+,;=%]*/y,
  /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/y, // an email
  /\d{1,3}(?:,\d{3})+(?:\.\d+)?(?![\d,])/y, // 1,000,000
  /\d{1,4}[/-]\d{1,2}[/-]\d{1,4}(?![\d/-])/y, // 2024/01/05
  /\d{2,5}-\d{1,4}-\d{3,4}(?![\d-])/y, // 03-1234-5678
  /\d{3}-\d{4}(?![\d-])/y, // 100-0001
  /\d+\/\d+(?![\d/])/y, // 1/2
  /\d{1,2}:\d{2}(?::\d{2})?(?![\d:])/y, // 10:30
  /[a-z](?:\+\+|#)(?![a-z0-9])/iy, // C++, C#
  /[a-z]+(?:[-'’.&][a-z0-9]+)+/iy, // Wi-Fi, COVID-19, U.S.A, don't
]
// a url can't end in a full-stop or a bracket - that's the sentence's
const urlEnd = /[.,;:!?)\]'"]+$/
const startsPattern = /[a-z0-9]/i

const findPattern = function (txt, i) {
  if (!startsPattern.test(txt[i]) || startsPattern.test(txt[i - 1] || '')) {
    return null
  }
  for (let k = 0; k < patterns.length; k += 1) {
    patterns[k].lastIndex = i
    const m = patterns[k].exec(txt)
    if (m !== null) {
      return k < 3 ? m[0].replace(urlEnd, '') : m[0]
    }
  }
  return null
}

// the verb beginning at i, if it's one that finishes off another verb's stem
const secondVerb = function (txt, i, lexicon, maxLen) {
  const max = Math.min(maxLen, txt.length - i)
  for (let len = max; len > 1; len -= 1) {
    const str = txt.substr(i, len)
    if (hasWord.call(lexicon, str) && !cantFollow.has(txt[i + len]) && isSecondVerb(roots[str] || str)) {
      return str
    }
  }
  return null
}

/** every word that could begin at i */
const getEdges = function (txt, i, lexicon, maxLen) {
  // two or more kanji in a row are decided as a unit
  const run = kanjiRun(txt, i, lexicon, maxLen)
  if (run !== null) {
    return [{ end: run.end, pieces: run.pieces, cost: run.pieces.length, kind: 'other' }]
  }
  const edges = []
  // one whole character - 𠮷 and 😀 are two units long
  const c = charAt(txt, i)
  const found = findPattern(txt, i)
  if (found !== null) {
    return [{ end: i + found.length, pieces: [found], cost: WORD, kind: 'other' }]
  }
  // an emoji, with any skin-tones and joiners it has - 👨‍👩‍👧 is one
  if (isEmoji(c)) {
    let end = i + c.length
    while (end < txt.length) {
      const next = charAt(txt, end)
      if (!isEmoji(next) && !isEmojiJoiner(next)) {
        break
      }
      end += next.length
    }
    return [{ end, pieces: [txt.slice(i, end)], cost: WORD, kind: 'other' }]
  }
  // a latin word is one word.  compromise's lexicon has english abbreviations
  // in it - dec, al, ma - which are not to be found inside 'decimal'
  if (isAscii(c)) {
    let end = i + 1
    while (end < txt.length && isAscii(txt[end])) {
      end += 1
    }
    // Tシャツ, Jリーグ - one letter, and the katakana it names
    if (end === i + 1) {
      while (end < txt.length && (isKatakana(txt[end]) || (txt[end] === 'ー' && end > i + 1))) {
        end += 1
      }
    }
    return [{ end, pieces: [txt.slice(i, end)], cost: WORD, kind: 'other' }]
  }
  const max = Math.min(maxLen, txt.length - i)
  // known words
  for (let len = max; len > 1; len -= 1) {
    const str = txt.substr(i, len)
    if (hasWord.call(lexicon, str) && !cantFollow.has(txt[i + len])) {
      const tags = tagsOf(lexicon, str)
      const isExpression = tags.includes('Expression')
      const cost = tags.includes('Gerund') ? GERUND : WORD
      edges.push({ end: i + len, pieces: [str], cost, kind: getKind(lexicon, str), isExpression })
      // 走り + 出した - a verb's stem, and a second verb, are one verb
      if (tags.includes('VerbStem')) {
        const second = secondVerb(txt, i + len, lexicon, maxLen)
        if (second !== null) {
          edges.push({ end: i + len + second.length, pieces: [str + second], cost: WORD, kind: 'other' })
        }
      }
    }
  }
  const anyWords = edges.length > 0
  // a known verb, in a form we haven't listed
  if (isKanji(c) || anyWords) {
    const str = verbRule(txt, i, lexicon)
    if (str !== null) {
      edges.push({ end: i + str.length, pieces: [str], cost: RULE, kind: 'other' })
    }
  }
  // one character
  const known = hasWord.call(lexicon, c)
  let kind = known ? getKind(lexicon, c) : 'other'
  let cost = isHiragana(c) ? STRAY_KANA : STRAY
  if (known) {
    cost = isHiragana(c) && kind === 'other' ? LOOSE : WORD
  }
  const single = known && isHiragana(c) && kind !== 'other'
  // な only ends a sentence at the end - anywhere else it joins an adjective
  // to its noun, 静か|な|部屋, and what follows it is no surprise
  if (c === 'な' && i + 1 < txt.length) {
    kind = 'other'
  }
  edges.push({ end: i + c.length, pieces: [c], cost, kind, single })
  // a stretch of kana that isn't in the lexicon - a name, or a word we're missing
  // (バズ|って - a loanword can take a verb-ending, which begins with っ)
  const afterLoan = c === 'っ' && i > 0 && !isHiragana(txt[i - 1])
  if (isHiragana(c) && (!cantStart.has(c) || afterLoan) && c !== 'を') {
    for (let len = 2; len <= MAX_KANA && i + len <= txt.length; len += 1) {
      const last = txt[i + len - 1]
      // を is only ever a particle, so it's a hard word-boundary
      if ((!isKana(last, false) && !isWave(txt, i + len - 1)) || last === 'を') {
        break
      }
      const str = txt.substr(i, len)
      // no word ends in a っ
      if (hasWord.call(lexicon, str) || cantFollow.has(txt[i + len]) || last === 'っ') {
        continue
      }
      let n = UNKNOWN[len]
      if (edgeParticle.has(last)) {
        n += TRAIL
      }
      edges.push({ end: i + len, pieces: [str], cost: n, kind: 'other', unknown: true })
    }
  }
  // an unknown kanji, and the verb-ending after it - 含 + まれている.
  // if we know any word that starts here - 読んで - then it isn't unknown
  if (isKanji(c) && !known && !anyWords) {
    let stop = i + c.length
    while (stop < txt.length && stop - i <= MAX_OKURI && isHiragana(txt[stop])) {
      stop += 1
    }
    for (let j = stop; j >= i + c.length + 2; j -= 1) {
      const str = txt.slice(i, j)
      if (hasWord.call(lexicon, str) || cantFollow.has(txt[j])) {
        continue
      }
      if (canBeOkurigana(txt.slice(i + c.length, j)) && deconjugate(str)) {
        edges.push({ end: j, pieces: [str], cost: VERB, kind: 'other' })
        break
      }
    }
  }
  return edges
}

/** what does it cost to put this word after that sort of word? */
const fit = function (prev, edge, txt, i) {
  const c = txt[i]
  // a lone particle
  if (edge.single === true) {
    if (prev === 'start') {
      // a particle can't begin a clause - unless it's all there is
      return edge.end === txt.length ? 0 : OPENER
    }
    if (prev === 'particle') {
      return afterParticle.has(c) ? 0 : MISPLACED
    }
    if (prev === 'no') {
      return afterNo.has(c) ? 0 : MISPLACED
    }
    if (prev === 'final') {
      // よ|ね, か|な
      if (edge.kind === 'final') {
        return 0
      }
      return afterParticle.has(c) ? AFTER_FINAL : MISPLACED
    }
    return 0
  }
  // 「経験につながる」 is 経験|に|つながる - but は|がくせい is fine
  if (edge.unknown === true && prev === 'other' && edgeParticle.has(c)) {
    return LEAD
  }
  if (edge.isExpression === true && prev !== 'start') {
    return INTERJECTION
  }
  if (prev === 'final' && edge.kind === 'other') {
    return AFTER_FINAL
  }
  return 0
}

const kinds = ['start', 'other', 'particle', 'no', 'final']

const splitUp = function (txt, lexicon, maxLen) {
  const len = txt.length
  // best[position][kind-of-the-last-word] = { cost, from, kind, pieces }
  const best = []
  for (let i = 0; i <= len; i += 1) {
    best.push({})
  }
  best[0].start = { cost: 0 }
  for (let i = 0; i < len; i += 1) {
    const here = kinds.filter(k => best[i][k] !== undefined)
    if (here.length === 0) {
      continue
    }
    const edges = getEdges(txt, i, lexicon, maxLen)
    for (let e = 0; e < edges.length; e += 1) {
      const edge = edges[e]
      for (let k = 0; k < here.length; k += 1) {
        const cost = best[i][here[k]].cost + edge.cost + fit(here[k], edge, txt, i)
        const old = best[edge.end][edge.kind]
        if (old === undefined || cost < old.cost) {
          best[edge.end][edge.kind] = { cost, from: i, kind: here[k], pieces: edge.pieces }
        }
      }
    }
  }
  // walk back along the cheapest path
  let node = null
  kinds.forEach(k => {
    const found = best[len][k]
    if (found !== undefined && found.pieces && (node === null || found.cost < node.cost)) {
      node = found
    }
  })
  const out = []
  while (node && node.pieces) {
    out.push(node.pieces)
    node = best[node.from][node.kind]
  }
  return out.reverse().flat()
}
export default splitUp
