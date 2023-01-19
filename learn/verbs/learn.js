import fs from 'fs'
import { learn, compress } from 'suffix-thumb'
import verbs from './verbs.js'

let out = {}
let forms = ['infinitive', 'te_form', 'past_indicative_polite_positive', 'present_indicative_plain_negative']
forms = [
  'causative_plain_negative',
  'causative_plain_positive',
  // 'causative_polite_negative',
  // 'causative_polite_positive',
  'conditional_plain_negative',
  'conditional_plain_positive',
  // 'conditional_polite_negative',
  // 'conditional_polite_positive',
  'imperative_plain_negative',
  'imperative_plain_positive',
  // 'imperative_polite_negative',
  // 'imperative_polite_positive',
  'infinitive',
  'passive_plain_negative',
  'passive_plain_positive',
  // 'passive_polite_negative',
  // 'passive_polite_positive',
  'past_indicative_plain_negative',
  'past_indicative_plain_positive',
  // 'past_indicative_polite_negative',
  // 'past_indicative_polite_positive',
  'past_presumptive_plain_negative',
  'past_presumptive_plain_positive',
  // 'past_presumptive_polite_negative',
  // 'past_presumptive_polite_positive',
  'past_progressive_plain_positive',
  // 'past_progressive_polite_negative',
  // 'past_progressive_polite_positive',
  'potential_plain_negative',
  'potential_plain_positive',
  // 'potential_polite_negative',
  // 'potential_polite_positive',
  'present_indicative_plain_negative',
  'present_indicative_plain_positive',
  // 'present_indicative_polite_negative',
  // 'present_indicative_polite_positive',
  'present_progressive_plain_positive',
  // 'present_progressive_polite_negative',
  // 'present_progressive_polite_positive',
  'provisional_conditional_plain_negative',
  'provisional_conditional_plain_positive',
  'te_form',
  'volitional_plain_negative',
  'volitional_plain_positive',
  // 'volitional_polite_negative',
  // 'volitional_polite_positive',
]
forms.forEach(form => {

  let pairs = []
  Object.keys(verbs).forEach(dict => {
    let inf = verbs[dict].infinitive
    // let stem = verbs[dict].infinitive
    if (inf && verbs[dict][form]) {
      pairs.push([inf, verbs[dict][form]])
    }
  })

  let model = learn(pairs)
  model = compress(model)
  out[form] = model
})

fs.writeFileSync('./src/01-one/lexicon/methods/_model.js', `export default ` + JSON.stringify(out, null, 2))