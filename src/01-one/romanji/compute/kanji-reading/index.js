import readings from './readings.js'
import words from './words.js'

// the reading-table is written in katakana - fold it to hiragana so the
// romanizer only has to know one script
const toHiragana = function (str) {
  let out = ''
  for (let i = 0; i < str.length; i += 1) {
    let c = str[i]
    out += c >= 'ァ' && c <= 'ヶ' ? String.fromCharCode(c.charCodeAt(0) - 0x60) : c
  }
  return out
}

const isKanji = (c) => c >= '一' && c <= '龯'

// the kun-reading is written 'い.く' - the part before the dot is what the
// kanji itself spells;  the rest is the okurigana already in the text
const kunStem = (kun) => kun.split('.')[0]

const soundOut = function (char, type) {
  let r = readings[char]
  if (!r) {
    return char
  }
  let [kun, on] = r.split('|')
  let pick = type === 'kun' ? kun || on : on || kun
  return toHiragana(kunStem(pick || char))
}

/**
 * sound-out a word's kanji.
 * a lone kanji followed by okurigana (行き, 読む) is a native verb, so it
 * takes its kun-reading.  a run of two or more kanji (勉強) is a sino-japanese
 * compound, and takes the on-reading.
 */
/**
 * 食べました isn't in the override table, but its dictionary-form 食べる is.
 * the root tells us what its kanji spells (食 → た), and the okurigana is
 * already right there in the text.
 */
const fromRoot = function (word, root) {
  let reading = words[root]
  if (!reading) {
    return null
  }
  // the kanji sit at the front of both the word and its root
  let stem = root.split('').findIndex(c => !isKanji(c))
  if (stem <= 0) {
    return null
  }
  let okurigana = root.slice(stem)
  if (!reading.endsWith(okurigana)) {
    return null
  }
  let kanjiSound = reading.slice(0, reading.length - okurigana.length)
  return word.startsWith(root.slice(0, stem)) ? kanjiSound + word.slice(stem) : null
}

const spellKanji = function (word, type, root) {
  if (words[word] !== undefined) {
    return words[word]
  }
  if (root && root !== word) {
    let viaRoot = fromRoot(word, root)
    if (viaRoot) {
      return viaRoot
    }
  }
  let out = ''
  let i = 0
  while (i < word.length) {
    if (!isKanji(word[i])) {
      out += word[i]
      i += 1
      continue
    }
    // how long is this run of kanji?
    let run = ''
    while (i < word.length && isKanji(word[i])) {
      run += word[i]
      i += 1
    }
    let use = type || (run.length > 1 ? 'on' : 'kun')
    run.split('').forEach(c => {
      out += soundOut(c, use)
    })
  }
  return out
}
export default spellKanji
