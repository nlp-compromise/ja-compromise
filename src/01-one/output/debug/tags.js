/* eslint-disable no-console */
import cli from './_color.js'

const skip = {
  Kanji: 'dim',
  Hiragana: 'dim',
  Katagana: 'dim',
  Ascii: 'dim'
}
const tagString = function (tags, model) {
  if (model.one.tagSet) {
    tags = tags.filter(str => !skip[str])
    tags = tags.map(tag => {
      if (!model.one.tagSet.hasOwnProperty(tag)) {
        return tag
      }
      const c = model.one.tagSet[tag].color || skip[tag] || 'blue'
      return cli[c](tag)
    })
  }
  return tags.join(', ')
}

const showTags = function (view) {
  const { docs, model } = view
  if (docs.length === 0) {
    console.log(cli.blue('\n     ──────'))
  }
  docs.forEach(terms => {
    console.log(cli.blue('\n  ┌─────────'))
    terms.forEach(t => {
      const tags = [...(t.tags || [])]
      let text = t.text || '-'
      if (t.sense) {
        text = `{${t.normal}/${t.sense}}`
      }
      if (t.implicit) {
        text = '[' + t.implicit + ']'
      }
      text = cli.yellow(text)
      let word = "'" + text + "'"
      // word = word.padEnd(15)
      if (t.english) {
        word += cli.i(` {${t.english}}`.padEnd(6))
      }
      if (t.reference) {
        const str = view.update([t.reference]).text('normal')
        word += ` - ${cli.dim(cli.i('[' + str + ']'))}`
      }
      word = word.padEnd(18)
      const str = cli.blue('  │ ') + cli.i(word) + '  - ' + tagString(tags, model)
      console.log(str)
    })
  })
}
export default showTags
