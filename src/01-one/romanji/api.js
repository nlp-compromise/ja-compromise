export default function (View) {

  /**  */
  View.prototype.romanji = function () {
    this.compute('romanji')
    let out = ''
    this.docs.forEach(terms => {
      terms.forEach(term => {
        out += term.pre + (term.romanji || term.text) + term.post
      })
    })
    return out
  }
}