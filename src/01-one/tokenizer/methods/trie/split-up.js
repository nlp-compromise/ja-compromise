
// dig-down into the trie, and find the longest match
const getGreedy = function (chars, i, node) {
  let best = []
  let n = i
  while (node.more[chars[n]]) {
    if (node.more[chars[n]].end) {
      best = chars.slice(i, n + 1)
    }
    node = node.more[chars[n]]
    n += 1
  }
  if (best.length === 0) {
    return chars[i]
  }
  return best.join('')
}

// tokenize a given string using our trie
const splitUp = function (txt, root) {
  let chars = txt.split('')
  let out = []
  for (let i = 0; i < chars.length; i += 1) {
    let run = getGreedy(chars, i, root)
    out.push(run)
    i += run.length - 1
  }
  return out
}
export default splitUp

// console.log(splitUp('O4ことごとくと0', trie))
// console.log(splitUp('abcdefgg', trie))