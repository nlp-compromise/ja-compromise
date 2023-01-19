import verbs from './verbs.js'

const toStem = (dict) => {
  // ichidan
  if (dict.endsWith('る')) {
    return dict.replace(/る$/, '')
  }
  // godan
  dict = dict.replace(/[くすうぐつむぶぬ]$/, '')
  return dict
}

// const toInf = (stem) => {
//   return stem
// }

// const toDict = (inf) => {
//   inf = inf.replace(/[いりぎしきみび]+$/, '')
//   return inf
// }

const toPresProgPolNeg = (str) => str + 'って いません'
const toTE = (str) => str + 'て'
// 困て いません   -   困って いません
let good = 0
Object.keys(verbs).forEach(k => {
  let obj = verbs[k]
  let stem = toStem(k)
  let have = toTE(stem)
  // console.log(have, '  -  ', obj.present_progressive_polite_negative)

  // let inf = toInf(stem)

  if (obj.type === "Ichidan") {
  }
  if (obj.type === "Godan") {
    console.log(have === obj.te_form)
    //   if (inf === obj.infinitive) {
    //     good += 1
    //   } else {
    //     console.log(inf.padEnd(8), obj.infinitive)
    //   }
  }

})
console.log(good)

// ichidan dictionary-form all end with 'る'
// godan
