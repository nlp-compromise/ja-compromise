import fs from 'node:fs'
const out = fs.readFileSync('/Users/spencer/Desktop/mecab-master/mecab-ipadic/Verb.csv', { encoding: 'utf16le' }).toString()

console.log(out.match('㘬㠱'))