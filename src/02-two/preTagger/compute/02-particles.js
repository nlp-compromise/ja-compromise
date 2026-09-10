// what a particle tells us about the word in front of it.
// this is the workhorse of japanese pos-tagging: the particle *is* the syntax.
const reason = 'particle'

// particles that only ever follow a noun-phrase
const nounBefore = {
  'は': 'Topic',
  'が': 'Noun',
  'を': 'Object',
  'へ': 'Noun',
  'から': 'Noun',
  'まで': 'Noun',
  'より': 'Noun',
  'の': 'Possessive',
}
// に and で follow nouns, but also verb-stems (見に行く) and な-adjectives (静かで)
const softNounBefore = new Set(['に', 'で', 'と', 'も'])

// particles that only ever follow a verb or adjective
const verbBefore = new Set(['て', 'ば', 'たら', 'ながら', 'ので', 'のに', 'けれど', 'けれども', 'けど', 'たり'])

const tagParticles = function (terms, setTag, world) {
  for (let i = 0; i < terms.length; i += 1) {
    let t = terms[i]
    let prev = terms[i - 1]
    let next = terms[i + 1]
    let str = t.text

    // な before a noun is the adnominal copula (静かな人), not a final particle
    if (str === 'な' && next && !next.tags.has('Verb')) {
      setTag([t], 'AdnominalParticle', world, null, reason)
      if (prev) {
        setTag([prev], 'NaAdjective', world, null, reason)
      }
      continue
    }
    // か at the end of a clause is a question-marker, not 'or'
    if (str === 'か' && (!next || next.tags.has('SentenceParticle'))) {
      setTag([t], 'SentenceParticle', world, null, reason)
      setTag([t], 'QuestionWord', world, null, reason)
      continue
    }
    // と after a verb introduces a quote;  between two nouns it means 'and'
    if (str === 'と' && prev) {
      if (prev.tags.has('Verb') || prev.tags.has('Copula')) {
        setTag([t], 'QuotativeParticle', world, null, reason)
        continue
      }
      if (next && !next.tags.has('Verb')) {
        setTag([t], 'Conjunction', world, null, reason)
      }
    }
    // で after a noun is 'at/by'; after a な-adjective it's the copula
    if (str === 'で' && prev && prev.tags.has('NaAdjective')) {
      setTag([t], 'Copula', world, null, reason)
      setTag([t], 'Gerund', world, null, reason)
      continue
    }

    // a particle never marks another particle
    if (!prev || prev.tags.has('Particle')) {
      continue
    }
    if (nounBefore[str] !== undefined) {
      if (!prev.tags.has('Verb') && !prev.tags.has('Adjective')) {
        setTag([prev], nounBefore[str], world, null, reason)
      } else if (str === 'の' || str === 'が') {
        // 走るの / 行くが - the verb is nominalized or the clause continues
        setTag([t], str === 'の' ? 'AdnominalParticle' : 'ConjunctiveParticle', world, null, reason)
      }
      continue
    }
    if (softNounBefore.has(str) && !prev.tags.has('Verb') && !prev.tags.has('Adjective') && prev.tags.size <= 1) {
      setTag([prev], 'Noun', world, null, reason)
      continue
    }
    if (verbBefore.has(str) && prev.tags.size <= 1) {
      setTag([prev], 'Verb', world, null, reason)
    }
  }
}
export default tagParticles
