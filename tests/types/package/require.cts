import nlp = require('ja-compromise')

const text: string = nlp('hello').text()
const version: string = nlp.version
const tokens: string = nlp.tokenize('hello').text()
// @ts-expect-error input must be a string
nlp(42)
// @ts-expect-error document text is a string
const bad: number = nlp('hello').text()
export { text, version, tokens, bad }

const forms: nlp.VerbConjugation[] = []
export { forms }

const doc: nlp.JaView = nlp('二十三冊')
const nums: nlp.Numbers = doc.numbers()
const term: nlp.JaTerm = doc.docs[0][0]
export { doc, nums, term }
