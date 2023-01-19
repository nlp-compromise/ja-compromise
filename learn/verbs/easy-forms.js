import verbs from './verbs.js'

let forms = [
  'present_indicative_plain_negative',
  'past_indicative_polite_positive',
  'provisional_conditional_plain_positive',
  'past_presumptive_polite_negative',
  'present_indicative_plain_positive',
  'passive_polite_negative',
  'infinitive',
  'past_progressive_plain_positive',
  'passive_polite_positive',
  'conditional_plain_positive',
  'volitional_polite_positive',
  'past_progressive_polite_positive',
  'past_presumptive_plain_positive',
  'present_progressive_plain_positive',
  'imperative_plain_negative',
  'conditional_polite_negative',
  'past_progressive_polite_negative',
  'present_progressive_polite_positive',
  'past_indicative_plain_negative',
  'volitional_plain_negative',
  'passive_plain_positive',
  'imperative_plain_positive',
  'conditional_polite_positive',
  'potential_polite_negative',
  'causative_polite_positive',
  'present_indicative_polite_positive',
  'volitional_polite_negative',
  'past_indicative_plain_positive',
  'potential_plain_negative',
  'causative_plain_positive',
  'provisional_conditional_plain_negative',
  'present_indicative_polite_negative',
  'conditional_plain_negative',
  'potential_plain_positive',
  'volitional_plain_positive',
  'past_indicative_polite_negative',
  'present_progressive_polite_negative',
  'te_form',
  'past_presumptive_plain_negative',
  'potential_polite_positive',
  'causative_polite_negative',
  'causative_plain_negative',
  'past_presumptive_polite_positive',
  'imperative_polite_positive',
  'passive_plain_negative',
  'imperative_polite_negative',
]

forms.forEach(form => {
  let suffixes = {}
  Object.keys(verbs).forEach(k => {
    let obj = verbs[k]
    if (obj.type === "Ichidan") {
      if (obj[form]) {
        let suff = obj[form].replace(obj.stem, '')
        suffixes[suff] = suffixes[suff] || 0
        suffixes[suff] += 1
      }
    }

  })
  Object.keys(suffixes).forEach(suff => {
    console.log(`'${suff}', //${form}`)
  })
  // console.log(form)
  // console.log(suffixes)
})
