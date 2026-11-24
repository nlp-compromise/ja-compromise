import nlp from 'ja-compromise'

const text: string = nlp('hello').text()
const version: string = nlp.version
const tokens: string = nlp.tokenize('hello').text()
// @ts-expect-error input must be a string
nlp(42)
// @ts-expect-error document text is a string
const bad: number = nlp('hello').text()
export { text, version, tokens, bad }

import type { JaView, Numbers, VerbConjugation } from 'ja-compromise'
const doc: JaView = nlp('二十三冊')
const nums: Numbers = doc.numbers()
const forms: VerbConjugation[] = []
export { doc, nums, forms }
