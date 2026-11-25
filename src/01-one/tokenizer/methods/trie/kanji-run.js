import { isKanji, isHiragana, isLowSurrogate, charAt } from '../lib.js'
import { canBeOkurigana } from '../okurigana.js'
import verbRule from './verb-rule.js'
import deconjugate from '../../../conjugate/deconjugate.js'
import { isNumeral } from '../../../numbers/kanji-number.js'

// a run of kanji is one word, unless we can account for every part of it.
//
// single kanji are nearly all words in their own right - 国, 人, 本 - so
// matching them greedily shatters any compound that isn't in the lexicon:
// 京都 → 京|都,  外国人参政権 → 外|国|人|参|政権.
// a compound left whole is a coarse answer.  a compound cut in the wrong
// places is a wrong one, and nothing downstream can repair it.
//
// so a run is only split when *known words of two or more kanji* cover all
// of it - 自然|言語|処理.  a single kanji may only stand alone where it is
// reliably a word:
//   - a number, and the counter after it     二十三|人,  令和|六|年
//   - a pronoun                              昨日|彼|は
//   - straight after a time-word             今日|本|を
//   - an honorific, closing the run          田中|様
//   - in front of a verb or adjective        雨|降る,  京都|行きます

const hasWord = Object.prototype.hasOwnProperty
const isWord = (lexicon, str) => hasWord.call(lexicon, str)

const hasTag = function (lexicon, str, want) {
  const tags = lexicon[str]
  if (typeof tags === 'string') {
    return want.has(tags.replace(/^#/, ''))
  }
  return Array.isArray(tags) && tags.some(t => want.has(t))
}
const timeTags = new Set(['Date', 'Time', 'WeekDay', 'Season', 'AmPm', 'Duration'])
const placeTags = new Set(['City', 'Country'])
const negators = new Set('不無未非')
// 東京 + 都, 大阪 + 府, 京都 + 市, 中国 + 人 - what a place-name can end in
const placeSuffix = new Set('都府県市区町村駅港人語製産内')
const pronoun = new Set(['Pronoun'])
const honorific = new Set(['Honorific'])

// 京 is 10^16, but it never begins a number - 京都 is a city
const startsNumber = (c) => isNumeral(c) && c !== '京'

// where does the run of kanji beginning at i end?
const runEnd = function (txt, i) {
  let end = i
  while (end < txt.length) {
    // 𠮷 is two units long
    const c = charAt(txt, end)
    if (!isKanji(c)) {
      break
    }
    end += c.length
  }
  return end
}

// no word begins with one of these, so no word ends just before one -
// 学生じゃない is not 学 + 生じ (生じる) + ゃない
const cantStart = new Set('ぁぃぅぇぉっゃゅょゎんー')

// 東京大学行きます - the last kanji of a run may belong to a word that
// carries on into the kana.  list them, earliest (so, longest) first.
const findTails = function (txt, start, end, lexicon, maxLen) {
  const tails = []
  for (let s = start; s < end; s += 1) {
    const max = Math.min(maxLen, txt.length - s)
    for (let len = max; len > end - s; len -= 1) {
      const str = txt.substr(s, len)
      if (isWord(lexicon, str) && !cantStart.has(txt[s + len])) {
        tails.push({ at: s, word: str })
        break
      }
    }
    // 勉強しなければ - a known verb, in a form the lexicon doesn't list
    const last = tails[tails.length - 1]
    const listed = last !== undefined && last.at === s ? s + last.word.length : end
    const str = verbRule(txt, s, lexicon, listed)
    if (str !== null) {
      if (last !== undefined && last.at === s) {
        tails.pop()
      }
      tails.push({ at: s, word: str })
    }
  }
  return tails
}

// split txt[start, end) into known pieces, using as few as possible.
// returns null if some part of it can't be accounted for.
const cover = function (txt, start, end, lexicon, first = 'start') {
  const memo = {}
  const walk = function (p, prev) {
    if (p === end) {
      return []
    }
    const key = p + prev
    if (memo[key] !== undefined) {
      return memo[key]
    }
    let best = null
    const consider = function (piece, type) {
      const rest = walk(p + piece.length, type)
      if (rest !== null && (best === null || rest.length + 1 < best.length)) {
        best = [piece].concat(rest)
      }
    }
    // known words, of two or more kanji
    for (let j = end; j >= p + 2; j -= 1) {
      const str = txt.slice(p, j)
      if (isWord(lexicon, str)) {
        if (prev === 'number') {
          // 1|時間|半
          consider(str, 'counter')
        } else if (j < end && placeSuffix.has(txt[j]) && hasTag(lexicon, str, placeTags)) {
          consider(str + txt[j], 'word')
          consider(str, 'word')
        } else {
          consider(str, hasTag(lexicon, str, timeTags) ? 'time' : 'word')
        }
      }
    }
    // a whole number - 二十三
    if (prev !== 'number' && startsNumber(txt[p])) {
      let j = p + 1
      while (j < end && isNumeral(txt[j])) {
        j += 1
      }
      consider(txt.slice(p, j), 'number')
    }
    // one kanji, on its own
    const c = txt[p]
    if (c === '第' && p + 1 < end && startsNumber(txt[p + 1])) {
      // 第|三|回
      consider(c, 'single')
    } else if (c === '何' && prev !== 'number') {
      // 何|冊 - 'how many' stands in for a number
      consider(c, 'number')
    } else if (c === '半' && prev === 'counter') {
      // 一|時間|半
      consider(c, 'single')
    } else if (isWord(lexicon, c) && !startsNumber(c)) {
      const next = txt[p + 1]
      if (prev === 'number' || prev === 'counter') {
        // 三|人,  五|日|間
        consider(c, prev === 'number' ? 'counter' : 'single')
      } else if (prev === 'time' || hasTag(lexicon, c, pronoun)) {
        consider(c, 'single')
      } else if (p + 1 < end && startsNumber(next)) {
        // 第|三|回
        consider(c, 'single')
      } else if (p === end - 1 && prev === 'word' && hasTag(lexicon, c, honorific)) {
        consider(c, 'single')
      }
    }
    memo[key] = best
    return best
  }
  return walk(start, first)
}

// the part of a run that isn't an inflected word's stem
const splitBody = function (txt, start, end, lexicon) {
  // is this the counter of a number written in digits? - 3時間
  const first = isNumeral(txt[start - 1] || '') ? 'number' : 'start'
  if (end - start === 0) {
    return []
  }
  if (end - start === 1) {
    return [txt[start]]
  }
  const found = cover(txt, start, end, lexicon, first)
  if (found !== null) {
    return found
  }
  // 100|円|玉 - the lexicon knows every counter
  if (first === 'number' && isWord(lexicon, txt[start])) {
    return [txt[start]].concat(splitBody(txt, start + 1, end, lexicon))
  }
  // a number is still a number, whatever comes after it - 三匹目
  if (startsNumber(txt[start])) {
    let j = start + 1
    while (j < end && isNumeral(txt[j])) {
      j += 1
    }
    if (j < end) {
      const rest = cover(txt, j, end, lexicon)
      // 三|匹|目 - the lexicon knows every counter
      if (rest === null && isWord(lexicon, txt[j])) {
        return [txt.slice(start, j), txt[j]].concat(splitBody(txt, j + 1, end, lexicon))
      }
      return [txt.slice(start, j)].concat(rest || [txt.slice(j, end)])
    }
  }
  // an unknown compound stays whole
  return [txt.slice(start, end)]
}

const MAX_OKURI = 6

// 手紙届きました - 届く isn't in the lexicon, but its ending gives it away.
// is the last kanji of this run the stem of a verb we don't know?
const isUnknownStem = function (txt, end, lexicon) {
  const stem = txt[end - 1]
  if (isLowSurrogate(stem)) {
    return false
  }
  if (isWord(lexicon, stem) || cantStart.has(txt[end]) || !canBeOkurigana(txt.slice(end, end + 2))) {
    return false
  }
  let stop = end
  while (stop < txt.length && stop - end < MAX_OKURI && isHiragana(txt[stop])) {
    stop += 1
  }
  for (let j = stop; j >= end + 2; j -= 1) {
    if (deconjugate(txt.slice(end - 1, j))) {
      return true
    }
  }
  return false
}

/**
 * segment the kanji run that begins at i.
 * returns null when there's no run here (fewer than two kanji), or the
 * pieces and where they end - which may be past the run, in the kana.
 */
const kanjiRun = function (txt, i, lexicon, maxLen) {
  const end = runEnd(txt, i)
  if (end - i < 2) {
    return null
  }
  const tails = findTails(txt, i, end, lexicon, maxLen)
  let tail = tails[0]
  // if the run is made of known words, a tail may not cut one in half -
  // 学生|じゃない, not 学|生じ|ゃない
  const whole = cover(txt, i, end, lexicon)
  if (whole !== null) {
    const edges = new Set()
    let at = i
    whole.forEach(str => {
      edges.add(at)
      at += str.length
    })
    tail = tails.find(o => edges.has(o.at))
  }
  if (tail === undefined) {
    // leave an unknown verb's stem on its own, to collect its okurigana later
    if (whole === null && isUnknownStem(txt, end, lexicon)) {
      return { pieces: splitBody(txt, i, end - 1, lexicon).concat(txt[end - 1]), end }
    }
    return { pieces: splitBody(txt, i, end, lexicon), end }
  }
  // 不適切に - 不 turns the word after it around, and can't be left on its own
  if (tail.at === i + 1 && negators.has(txt[i])) {
    return { pieces: [txt.slice(i, end)], end }
  }
  const pieces = splitBody(txt, i, tail.at, lexicon)
  pieces.push(tail.word)
  return { pieces, end: tail.at + tail.word.length }
}

export default kanjiRun
