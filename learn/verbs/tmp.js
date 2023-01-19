import verbs from './verbs.js'

Object.keys(verbs).forEach(k => {
  console.log(`'${verbs[k].infinitive}',//${verbs[k].english}`)
})
