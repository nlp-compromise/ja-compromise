import conjugationForms from './suffixes.js'

conjugationForms.sort(function (a, b) { return b.forms[0].length - a.forms[0].length; });

let verbTypes = ["v5u", "v5k", "v5g", "v5s", "v5t", "v5m", "v5b", "v5n", "v5r", "v1"];
let verbEndings = ["う", "く", "ぐ", "す", "つ", "む", "ぶ", "ぬ", "る", "る"];

const process = function (word, seen, aggregated, entry, i, suffix, j) {
  if (!suffix.trim()) return;
  let re = new RegExp(suffix + "$");
  if (word.match(re)) {
    newword = word.replace(re, verbEndings[j]);
    // special check for する
    if (newword === "す") { newword = "する"; }
    // terminal check for orphan v1
    if (newword === "る") { return; }
    aggregated.push(destep(newword, seen.concat({
      word: newword,
      found: entry.name,
      verbType: verbTypes[j]
    })));
  }
};

const destep = function (word, seen) {
  seen = seen || [];
  let aggregated = [];
  conjugationForms.forEach(function (entry, i) {
    entry.forms.forEach(function (suffix, j) {
      process(word, seen, aggregated, entry, i, suffix, j);
    });
  });
  if (aggregated.length === 0) return seen.slice();
  return aggregated;
};


/**
 * conjugate a verb
 */
const conjugate = function (verb, type) {
  type = type || "v5";
  let index, verbstem, ret = [];
  if (type.toLowerCase().indexOf("v1") > -1) {
    index = verbTypes.indexOf("v1");
    verbstem = verb.substring(0, verb.length - 1);
  } else {
    let lastchar = verb.substring(verb.length - 1, verb.length);
    index = verbEndings.indexOf(lastchar);
    verbstem = verb.substring(0, verb.length - 1);
  }
  let i, e = conjugationForms.length, form, specific;
  for (i = 0; i < e; i++) {
    form = conjugationForms[i];
    specific = form.forms[index];
    if (specific !== false) {
      ret.push({ name: form.name, form: verbstem + specific });
    }
  }
  return ret;
}

/**
 * try to find the original verb for a conjugation
 */
const toRoot = function (word, verbtype) {
  let result = destep(word);
  return result;
}

export { conjugate, toRoot }