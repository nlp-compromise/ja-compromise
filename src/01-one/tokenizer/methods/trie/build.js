const addWord = function (str, root) {
  let chars = str.split('')
  let node = root
  chars.forEach(c => {
    node.more[c] = node.more[c] || { more: {} }
    node = node.more[c]
  })
  node.end = true
}

// construct a nested character trie, from given words
const buildTrie = function (arr) {
  let root = {
    more: {}
  }
  arr.forEach(str => addWord(str, root))
  return root
}


export default buildTrie
