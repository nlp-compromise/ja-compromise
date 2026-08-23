// how each column of ./verbs.js is built out of the conjugator's forms.
// this is the bridge between the scraped table's naming and ours - and it's
// what lets the table cross-check the conjugator.
const expand = function (v) {
  const te = v.Gerund
  const negStem = v.Negative.replace(/ない$/, '') // 書か
  const potential = v.Potential
  const passive = v.Passive
  const causative = v.Causative
  const swap = (form, tail) => form.replace(/る$/, tail)
  return {
    present_indicative_plain_positive: v.Infinitive,
    present_indicative_plain_negative: v.Negative,
    present_indicative_polite_positive: v.Polite,
    present_indicative_polite_negative: v.PoliteNegative,

    past_indicative_plain_positive: v.PastTense,
    past_indicative_plain_negative: v.PastNegative,
    past_indicative_polite_positive: v.PolitePast,
    past_indicative_polite_negative: v.PolitePastNegative,

    te_form: te,
    masu_stem: v.Stem,

    volitional_plain_positive: v.Volitional,
    volitional_plain_negative: v.Negative + 'だろう',
    volitional_polite_positive: v.PoliteVolitional,
    volitional_polite_negative: v.Negative + 'でしょう',

    imperative_plain_positive: v.Imperative,
    imperative_plain_negative: v.NegativeImperative,
    imperative_polite_positive: te + 'ください',
    imperative_polite_negative: v.Negative + 'でください',

    potential_plain_positive: potential,
    potential_plain_negative: swap(potential, 'ない'),
    potential_polite_positive: swap(potential, 'ます'),
    potential_polite_negative: swap(potential, 'ません'),

    passive_plain_positive: passive,
    passive_plain_negative: swap(passive, 'ない'),
    passive_polite_positive: swap(passive, 'ます'),
    passive_polite_negative: swap(passive, 'ません'),

    causative_plain_positive: causative,
    causative_plain_negative: swap(causative, 'ない'),
    causative_polite_positive: swap(causative, 'ます'),
    causative_polite_negative: swap(causative, 'ません'),

    conditional_plain_positive: v.Conditional,
    conditional_plain_negative: v.PastNegative + 'ら',
    conditional_polite_positive: v.PolitePast + 'ら',
    conditional_polite_negative: v.PolitePastNegative + 'ら',

    provisional_conditional_plain_positive: v.Provisional,
    provisional_conditional_plain_negative: negStem + 'なければ',

    present_progressive_plain_positive: te + 'いる',
    present_progressive_polite_positive: te + 'います',
    present_progressive_polite_negative: te + 'いません',
    past_progressive_plain_positive: te + 'いた',
    past_progressive_polite_positive: te + 'いました',
    past_progressive_polite_negative: te + 'いませんでした',

    // 〜たろう is an accepted contraction of 〜ただろう, and the table uses
    // both - so this column has two right answers
    past_presumptive_plain_positive: [v.PastTense + 'だろう', v.PastTense + 'ろう'],
    past_presumptive_plain_negative: v.PastNegative + 'だろう',
    past_presumptive_polite_positive: v.PastTense + 'でしょう',
    past_presumptive_polite_negative: v.PastNegative + 'でしょう',
  }
}
export default expand
