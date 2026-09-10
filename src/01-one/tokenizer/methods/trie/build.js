// index the lexicon for longest-match lookup
const buildIndex = function (arr) {
  let words = new Set()
  let maxLen = 1
  for (let i = 0; i < arr.length; i += 1) {
    words.add(arr[i])
    if (arr[i].length > maxLen) {
      maxLen = arr[i].length
    }
  }
  return { words, maxLen }
}
export default buildIndex
