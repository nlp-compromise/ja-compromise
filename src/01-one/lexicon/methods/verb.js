import { convert } from 'suffix-thumb'
import { fwd, rev } from './models.js'


const toCausative = (str, neg) => {
  let model = neg ? fwd.causative_negative : fwd.causative
  return convert(str, model)
}
const fromCausative = (str, neg) => {
  let model = neg ? rev.causative_negative : rev.causative
  return convert(str, model)
}

const toConditional = (str, neg) => {
  let model = neg ? fwd.conditional_negative : fwd.conditional
  return convert(str, model)
}
const fromConditional = (str, neg) => {
  let model = neg ? rev.conditional_negative : rev.conditional
  return convert(str, model)
}

const toImperative = (str, neg) => {
  let model = neg ? fwd.imperative_negative : fwd.imperative
  return convert(str, model)
}
const fromImperative = (str, neg) => {
  let model = neg ? rev.imperative_negative : rev.imperative
  return convert(str, model)
}

const toPassive = (str, neg) => {
  let model = neg ? fwd.passive_negative : fwd.passive
  return convert(str, model)
}
const fromPassive = (str, neg) => {
  let model = neg ? rev.passive_negative : rev.passive
  return convert(str, model)
}

const toPresent = (str, neg) => {
  let model = neg ? fwd.present_negative : fwd.present
  return convert(str, model)
}
const fromPresent = (str, neg) => {
  let model = neg ? rev.present_negative : rev.present
  return convert(str, model)
}

const toPast = (str, neg) => {
  let model = neg ? fwd.past_negative : fwd.past
  return convert(str, model)
}
const fromPast = (str, neg) => {
  let model = neg ? rev.past_negative : rev.past
  return convert(str, model)
}

const all = function (str) {
  return [
    toImperative(str),
    toImperative(str, true),
    toPast(str),
    toPast(str, true),
    toPassive(str),
    toPassive(str, true),
    toConditional(str),
    toConditional(str, true),
    toCausative(str),
    toCausative(str, true),
    toPresent(str),
    toPresent(str, true),
  ]
}


export default {
  all,
  toImperative, fromImperative,
  toPast, fromPast,
  toPassive, fromPassive,
  toConditional, fromConditional,
  toCausative, fromCausative,
  toPresent, fromPresent
}


// console.log(toImperative('褒め') === '褒めろ')
// console.log(toImperative('褒め', true) === '褒めるな')
// console.log(fromImperative('褒めろ') === '褒め')
// console.log(fromImperative('褒めるな', true) === '褒め')