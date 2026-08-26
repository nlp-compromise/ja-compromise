import test from 'tape'
import nlp from './_lib.js'
const here = '[dates] '

const tagsOf = (str, word) => {
  let term = nlp(str).json()[0].terms.find(t => t.text === word)
  return term ? term.tags : []
}

test('numeric dates:', function (t) {
  let str = '1995年3月10日'
  t.ok(tagsOf(str, '1995').includes('Year'), here + '1995年 → Year')
  t.ok(tagsOf(str, '3').includes('Month'), here + '3月 → Month')
  t.ok(tagsOf(str, '10').includes('Day'), here + '10日 → Day')
  t.ok(tagsOf(str, '年').includes('Date'), here + 'the counter is part of the date')
  // the number keeps its #Value - #Month must not turn it into a noun
  t.ok(tagsOf(str, '3').includes('Value'), here + '3 is still a Value')
  t.end()
})

test('times:', function (t) {
  t.ok(tagsOf('3時30分に会う', '3').includes('Time'), here + '3時')
  t.ok(tagsOf('3時30分に会う', '30').includes('Time'), here + '30分')
  t.ok(tagsOf('午後3時', '午後').includes('AmPm'), here + '午後')
  t.ok(tagsOf('三時半に', '半').includes('Time'), here + '三時半 - 半 is half-past')
  t.end()
})

test('eras:', function (t) {
  t.ok(tagsOf('令和5年', '令和').includes('Era'), here + '令和')
  t.ok(tagsOf('令和5年', '5').includes('Year'), here + '令和5年 → Year')
  // ..a bare 5年 is five years, not the year 5
  t.ok(!tagsOf('5年かかった', '5').includes('Year'), here + '5年 alone is not a year')
  t.end()
})

test('date or duration:', function (t) {
  // 年/月/日 are the same word either way - the number and what follows decide
  t.ok(tagsOf('三ヶ月かかる', 'ヶ月').includes('Duration'), here + '三ヶ月 → Duration')
  t.ok(tagsOf('十日間', '日間').includes('Duration'), here + '十日間 → Duration')
  t.ok(tagsOf('五十年', '年').includes('Duration'), here + '五十年 → Duration, not a year')
  t.ok(tagsOf('1時間半', '半').includes('Duration'), here + '1時間半')
  // 3月 is March;  a month can only be 1-12
  t.ok(tagsOf('12月に行く', '12').includes('Month'), here + '12月 → Month')
  t.ok(!tagsOf('20月', '20').includes('Month'), here + 'there is no 20th month')
  t.end()
})

test('date words:', function (t) {
  t.ok(tagsOf('水曜日です', '水曜日').includes('WeekDay'), here + '水曜日')
  // the tagset spells it WeekDay - the lexicon used to say 'Weekday', which
  // inherited nothing at all
  t.ok(tagsOf('水曜日です', '水曜日').includes('Date'), here + '水曜日 is a Date')
  t.ok(tagsOf('水曜日です', '水曜日').includes('Noun'), here + '水曜日 is a Noun')
  t.ok(tagsOf('今日は暑い', '今日').includes('Date'), here + '今日')
  t.ok(tagsOf('来年の春に', '春').includes('Season'), here + '春')
  t.ok(tagsOf('毎朝コーヒーを飲む', '毎朝').includes('Date'), here + '毎朝')
  t.end()
})

test('.dates():', function (t) {
  let doc = nlp('1995年3月10日の午後3時に生まれました。')
  t.deepEqual(doc.dates().out('array'), ['1995年3月10日', '午後3時'], here + '.dates()')
  t.end()
})
