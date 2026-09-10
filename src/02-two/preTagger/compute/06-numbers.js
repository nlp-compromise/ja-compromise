import counters from '../../../../lexicon/counters.js'
import toNumber, { isNumeral } from '../../../01-one/numbers/kanji-number.js'

const reason = 'number'

const allNumeral = function (str) {
  for (let i = 0; i < str.length; i += 1) {
    if (!isNumeral(str[i])) {
      return false
    }
  }
  return str.length > 0
}

// 一つ, 二つ - the native numerals fuse with their counter
const nativeNumeral = /^([一二三四五六七八九]|ひと|ふた|みっ|よっ|いつ|むっ|なな|やっ|ここの)つ$/
const nativeValue = {
  ひとつ: 1, ふたつ: 2, みっつ: 3, よっつ: 4, いつつ: 5,
  むっつ: 6, ななつ: 7, やっつ: 8, ここのつ: 9, とお: 10,
}

/**
 * tag numbers, and the counter that follows them.
 * 本 is a book far more often than it's a counter for long objects - the only
 * thing that makes it a counter is a number sitting in front of it.
 */
const tagNumbers = function (terms, setTag, world) {
  for (let i = 0; i < terms.length; i += 1) {
    let t = terms[i]
    let str = t.text

    // ---- is this a number? ----
    let value = null
    if (nativeValue[str] !== undefined) {
      value = nativeValue[str]
    } else if (nativeNumeral.test(str)) {
      value = toNumber(str.slice(0, -1))
    } else if (allNumeral(str)) {
      value = toNumber(str)
    }
    // 何人, 何冊 - 'how many' takes a counter exactly like a number does,
    // but there's no value to record
    let isQuestion = str === '何' || str === 'なん' || str === '幾' || str === 'いく'
    if (value === null && !isQuestion) {
      continue
    }
    if (value !== null) {
      setTag([t], 'Value', world, null, reason)
      setTag([t], 'Cardinal', world, null, reason)
      t.number = value
    }

    // ---- is the next word its counter? ----
    let next = terms[i + 1]
    if (!next || counters[next.text] === undefined) {
      continue
    }
    // a counter can't also be the verb or particle it looks like
    if (next.tags.has('Verb') || next.tags.has('Particle')) {
      continue
    }
    let kind = counters[next.text]
    // #Percent and #Ordinal live in the #Value family, which is exclusive
    // with #Noun - tagging those #Counter as well would just strip it again
    if (kind === 'Percent' || kind === 'Ordinal') {
      setTag([next], kind, world, null, reason)
    } else {
      setTag([next], 'Counter', world, null, reason)
      if (kind !== 'Counter') {
        setTag([next], kind, world, null, reason)
      }
    }
    // mark the pair, so `#NumberPhrase` finds 三冊 and 2時間
    setTag([t, next], 'NumberPhrase', world, null, reason)
    if (value !== null) {
      next.number = value
    }
  }
}
export default tagNumbers
