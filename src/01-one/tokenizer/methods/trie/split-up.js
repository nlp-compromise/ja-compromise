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
import deconjugate from '../../../conjugate/deconjugate.js'
import { canBeOkurigana } from '../okurigana.js'
import { isHiragana, isKanji, isAscii } from '../lib.js'

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

/** every word that could begin at i */
const getEdges = function (txt, i, lexicon, maxLen) {
  // two or more kanji in a row are decided as a unit
  const run = kanjiRun(txt, i, lexicon, maxLen)
  if (run !== null) {
    return [{ end: run.end, pieces: run.pieces, cost: run.pieces.length, kind: 'other' }]
  }
  const edges = []
  const c = txt[i]
  // a latin word is one word.  compromise's lexicon has english abbreviations
  // in it - dec, al, ma - which are not to be found inside 'decimal'
  if (isAscii(c)) {
    let end = i + 1
    while (end < txt.length && isAscii(txt[end])) {
      end += 1
    }
    return [{ end, pieces: [txt.slice(i, end)], cost: WORD, kind: 'other' }]
  }
  const max = Math.min(maxLen, txt.length - i)
  // known words
  for (let len = max; len > 1; len -= 1) {
    const str = txt.substr(i, len)
    if (hasWord.call(lexicon, str) && !cantFollow.has(txt[i + len])) {
      const isExpression = tagsOf(lexicon, str).includes('Expression')
      edges.push({ end: i + len, pieces: [str], cost: WORD, kind: getKind(lexicon, str), isExpression })
    }
  }
  const anyWords = edges.length > 0
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
  edges.push({ end: i + 1, pieces: [c], cost, kind, single })
  // a stretch of kana that isn't in the lexicon - a name, or a word we're missing
  // (バズ|って - a loanword can take a verb-ending, which begins with っ)
  const afterLoan = c === 'っ' && i > 0 && !isHiragana(txt[i - 1])
  if (isHiragana(c) && (!cantStart.has(c) || afterLoan) && c !== 'を') {
    for (let len = 2; len <= MAX_KANA && i + len <= txt.length; len += 1) {
      const last = txt[i + len - 1]
      // を is only ever a particle, so it's a hard word-boundary
      if (!isKana(last, false) || last === 'を') {
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
    let stop = i + 1
    while (stop < txt.length && stop - i <= MAX_OKURI && isHiragana(txt[stop])) {
      stop += 1
    }
    for (let j = stop; j >= i + 3; j -= 1) {
      const str = txt.slice(i, j)
      if (hasWord.call(lexicon, str) || cantFollow.has(txt[j])) {
        continue
      }
      if (canBeOkurigana(txt.slice(i + 1, j)) && deconjugate(str)) {
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
