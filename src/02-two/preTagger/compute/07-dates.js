const reason = 'date'

// 年, 月 and 日 are the same word whether they mean a date or a span of time.
// 三月 is March, but 三ヶ月 is three months;  十日 is the 10th, but 十日間 is
// ten days.  the number in front, and the word behind, decide which.
const dateCounter = { '年': 'Year', '月': 'Month', '日': 'Day' }

const inRange = { Year: [1, 9999], Month: [1, 12], Day: [1, 31] }

const tagDates = function (terms, setTag, world) {
  for (let i = 0; i < terms.length; i += 1) {
    let t = terms[i]
    let prev = terms[i - 1]
    let next = terms[i + 1]

    // ---- 令和5年 - an era makes the number after it a year ----
    if (t.tags.has('Era') && next && next.tags.has('Value')) {
      let after = terms[i + 2]
      if (after && after.text === '年') {
        setTag([next], 'Year', world, null, reason)
        setTag([after], 'Year', world, null, reason)
        setTag([t, next, after], 'Date', world, null, reason)
        i += 2
        continue
      }
    }

    // ---- 3時30分 - a point on the clock ----
    if (t.tags.has('Value') && next && next.text === '時' && next.tags.has('Counter')) {
      setTag([t, next], 'Time', world, null, reason)
      setTag([t, next], 'Date', world, null, reason)
      // ..and the 分 that may follow it
      let n2 = terms[i + 2]
      let n3 = terms[i + 3]
      if (n2 && n3 && n2.tags.has('Value') && n3.text === '分') {
        setTag([n2, n3], 'Time', world, null, reason)
        setTag([n2, n3], 'Date', world, null, reason)
        i += 3
      } else {
        i += 1
      }
      continue
    }

    // ---- 1995年 / 3月 / 10日 ----
    if (!t.tags.has('Value') || !next || dateCounter[next.text] === undefined) {
      continue
    }
    if (!next.tags.has('Counter')) {
      continue
    }
    let kind = dateCounter[next.text]
    let value = t.number

    // 三日間 / 十年間 - 間 turns any of them into a span
    let after = terms[i + 2]
    if (after && (after.text === '間' || after.text === 'ぶり' || after.text === '目')) {
      setTag([next], 'Duration', world, null, reason)
      i += 1
      continue
    }
    // a number outside the calendar's range is a count, not a date -
    // 「五十年」 is fifty years, not the year 50 of anything
    let [lo, hi] = inRange[kind]
    if (typeof value !== 'number' || value < lo || value > hi) {
      setTag([next], 'Duration', world, null, reason)
      i += 1
      continue
    }
    // 年 only reads as a calendar year when it's a plausible one
    if (kind === 'Year' && value < 100 && !(prev && prev.tags.has('Era'))) {
      setTag([next], 'Duration', world, null, reason)
      i += 1
      continue
    }
    setTag([t], kind, world, null, reason)
    setTag([next], kind, world, null, reason)
    setTag([t, next], 'Date', world, null, reason)
    i += 1
  }

  // ---- 三時半, 一時間半 - 半 is the 'half' after a time ----
  terms.forEach((t, i) => {
    if (t.text !== '半' || i === 0) {
      return
    }
    let prev = terms[i - 1]
    if (prev.tags.has('TimeCounter') || prev.tags.has('DurationCounter')) {
      setTag([t], prev.tags.has('TimeCounter') ? 'Time' : 'Duration', world, null, reason)
      setTag([t], 'Date', world, null, reason)
    }
  })

  // ---- 午前/午後 belong to the time beside them ----
  terms.forEach((t, i) => {
    if (!t.tags.has('AmPm')) {
      return
    }
    let next = terms[i + 1]
    if (next && next.tags.has('Date')) {
      setTag([t], 'Date', world, null, reason)
    }
  })
}
export default tagDates
