(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.jaCompromise = factory());
})(this, (function () { 'use strict';

  let methods$o = {
    one: {},
    two: {},
    three: {},
    four: {},
  };

  let model$4 = {
    one: {},
    two: {},
    three: {},
  };
  let compute$a = {};
  let hooks = [];

  var tmpWrld = { methods: methods$o, model: model$4, compute: compute$a, hooks };

  const isArray$9 = input => Object.prototype.toString.call(input) === '[object Array]';

  const fns$4 = {
    /** add metadata to term objects */
    compute: function (input) {
      const { world } = this;
      const compute = world.compute;
      // do one method
      if (typeof input === 'string' && compute.hasOwnProperty(input)) {
        compute[input](this);
      }
      // allow a list of methods
      else if (isArray$9(input)) {
        input.forEach(name => {
          if (world.compute.hasOwnProperty(name)) {
            compute[name](this);
          } else {
            console.warn('no compute:', input); // eslint-disable-line
          }
        });
      }
      // allow a custom compute function
      else if (typeof input === 'function') {
        input(this);
      } else {
        console.warn('no compute:', input); // eslint-disable-line
      }
      return this
    },
  };
  var compute$9 = fns$4;

  // wrappers for loops in javascript arrays

  const forEach = function (cb) {
    let ptrs = this.fullPointer;
    ptrs.forEach((ptr, i) => {
      let view = this.update([ptr]);
      cb(view, i);
    });
    return this
  };

  const map = function (cb, empty) {
    let ptrs = this.fullPointer;
    let res = ptrs.map((ptr, i) => {
      let view = this.update([ptr]);
      let out = cb(view, i);
      // if we returned nothing, return a view
      if (out === undefined) {
        return this.none()
      }
      return out
    });
    if (res.length === 0) {
      return empty || this.update([])
    }
    // return an array of values, or View objects?
    // user can return either from their callback
    if (res[0] !== undefined) {
      // array of strings
      if (typeof res[0] === 'string') {
        return res
      }
      // array of objects
      if (typeof res[0] === 'object' && (res[0] === null || !res[0].isView)) {
        return res
      }
    }
    // return a View object
    let all = [];
    res.forEach(ptr => {
      all = all.concat(ptr.fullPointer);
    });
    return this.toView(all)
  };

  const filter = function (cb) {
    let ptrs = this.fullPointer;
    ptrs = ptrs.filter((ptr, i) => {
      let view = this.update([ptr]);
      return cb(view, i)
    });
    let res = this.update(ptrs);
    return res
  };

  const find = function (cb) {
    let ptrs = this.fullPointer;
    let found = ptrs.find((ptr, i) => {
      let view = this.update([ptr]);
      return cb(view, i)
    });
    return this.update([found])
  };

  const some = function (cb) {
    let ptrs = this.fullPointer;
    return ptrs.some((ptr, i) => {
      let view = this.update([ptr]);
      return cb(view, i)
    })
  };

  const random = function (n = 1) {
    let ptrs = this.fullPointer;
    let r = Math.floor(Math.random() * ptrs.length);
    //prevent it from going over the end
    if (r + n > this.length) {
      r = this.length - n;
      r = r < 0 ? 0 : r;
    }
    ptrs = ptrs.slice(r, r + n);
    return this.update(ptrs)
  };
  var loops = { forEach, map, filter, find, some, random };

  const utils = {
    /** */
    termList: function () {
      return this.methods.one.termList(this.docs)
    },
    /** return individual terms*/
    terms: function (n) {
      let m = this.match('.');
      // this is a bit faster than .match('.') 
      // let ptrs = []
      // this.docs.forEach((terms) => {
      //   terms.forEach((term) => {
      //     let [y, x] = term.index || []
      //     ptrs.push([y, x, x + 1])
      //   })
      // })
      // let m = this.update(ptrs)
      return typeof n === 'number' ? m.eq(n) : m
    },

    /** */
    groups: function (group) {
      if (group || group === 0) {
        return this.update(this._groups[group] || [])
      }
      // return an object of Views
      let res = {};
      Object.keys(this._groups).forEach(k => {
        res[k] = this.update(this._groups[k]);
      });
      // this._groups = null
      return res
    },
    /** */
    eq: function (n) {
      let ptr = this.pointer;
      if (!ptr) {
        ptr = this.docs.map((_doc, i) => [i]);
      }
      if (ptr[n]) {
        return this.update([ptr[n]])
      }
      return this.none()
    },
    /** */
    first: function () {
      return this.eq(0)
    },
    /** */
    last: function () {
      let n = this.fullPointer.length - 1;
      return this.eq(n)
    },

    /** grab term[0] for every match */
    firstTerms: function () {
      return this.match('^.')
    },

    /** grab the last term for every match  */
    lastTerms: function () {
      return this.match('.$')
    },

    /** */
    slice: function (min, max) {
      let pntrs = this.pointer || this.docs.map((_o, n) => [n]);
      pntrs = pntrs.slice(min, max);
      return this.update(pntrs)
    },

    /** return a view of the entire document */
    all: function () {
      return this.update().toView()
    },
    /**  */
    fullSentences: function () {
      let ptrs = this.fullPointer.map(a => [a[0]]); //lazy!
      return this.update(ptrs).toView()
    },
    /** return a view of no parts of the document */
    none: function () {
      return this.update([])
    },

    /** are these two views looking at the same words? */
    isDoc: function (b) {
      if (!b || !b.isView) {
        return false
      }
      let aPtr = this.fullPointer;
      let bPtr = b.fullPointer;
      if (!aPtr.length === bPtr.length) {
        return false
      }
      // ensure pointers are the same
      return aPtr.every((ptr, i) => {
        if (!bPtr[i]) {
          return false
        }
        // ensure [n, start, end] are all the same
        return ptr[0] === bPtr[i][0] && ptr[1] === bPtr[i][1] && ptr[2] === bPtr[i][2]
      })
    },

    /** how many seperate terms does the document have? */
    wordCount: function () {
      return this.docs.reduce((count, terms) => {
        count += terms.filter(t => t.text !== '').length;
        return count
      }, 0)
    },

    // is the pointer the full sentence?
    isFull: function () {
      let ptrs = this.pointer;
      if (!ptrs) {
        return true
      }
      let document = this.document;
      for (let i = 0; i < ptrs.length; i += 1) {
        let [n, start, end] = ptrs[i];
        // it's not the start
        if (n !== i || start !== 0) {
          return false
        }
        // it's too short
        if (document[n].length > end) {
          return false
        }
      }
      return true
    },

    // return the nth elem of a doc
    getNth: function (n) {
      if (typeof n === 'number') {
        return this.eq(n)
      } else if (typeof n === 'string') {
        return this.if(n)
      }
      return this
    }

  };
  utils.group = utils.groups;
  utils.fullSentence = utils.fullSentences;
  utils.sentence = utils.fullSentences;
  utils.lastTerm = utils.lastTerms;
  utils.firstTerm = utils.firstTerms;
  var util = utils;

  const methods$n = Object.assign({}, util, compute$9, loops);

  // aliases
  methods$n.get = methods$n.eq;
  var api$e = methods$n;

  class View {
    constructor(document, pointer, groups = {}) {
      // invisible props
      [
        ['document', document],
        ['world', tmpWrld],
        ['_groups', groups],
        ['_cache', null],
        ['viewType', 'View']
      ].forEach(a => {
        Object.defineProperty(this, a[0], {
          value: a[1],
          writable: true,
        });
      });
      this.ptrs = pointer;
    }
    /* getters:  */
    get docs() {
      let docs = this.document;
      if (this.ptrs) {
        docs = tmpWrld.methods.one.getDoc(this.ptrs, this.document);
      }
      return docs
    }
    get pointer() {
      return this.ptrs
    }
    get methods() {
      return this.world.methods
    }
    get model() {
      return this.world.model
    }
    get hooks() {
      return this.world.hooks
    }
    get isView() {
      return true //this comes in handy sometimes
    }
    // is the view not-empty?
    get found() {
      return this.docs.length > 0
    }
    // how many matches we have
    get length() {
      return this.docs.length
    }
    // return a more-hackable pointer
    get fullPointer() {
      let { docs, ptrs, document } = this;
      // compute a proper pointer, from docs
      let pointers = ptrs || docs.map((_d, n) => [n]);
      // do we need to repair it, first?
      return pointers.map(a => {
        let [n, start, end, id, endId] = a;
        start = start || 0;
        end = end || (document[n] || []).length;
        //add frozen id, for good-measure
        if (document[n] && document[n][start]) {
          id = id || document[n][start].id;
          if (document[n][end - 1]) {
            endId = endId || document[n][end - 1].id;
          }
        }
        return [n, start, end, id, endId]
      })
    }
    // create a new View, from this one
    update(pointer) {
      let m = new View(this.document, pointer);
      // send the cache down, too?
      if (this._cache && pointer && pointer.length > 0) {
        // only keep cache if it's a full-sentence
        let cache = [];
        pointer.forEach((ptr, i) => {
          let [n, start, end] = ptr;
          if (ptr.length === 1) {
            cache[i] = this._cache[n];
          } else if (start === 0 && this.document[n].length === end) {
            cache[i] = this._cache[n];
          }
        });
        if (cache.length > 0) {
          m._cache = cache;
        }
      }
      m.world = this.world;
      return m
    }
    // create a new View, from this one
    toView(pointer) {
      return new View(this.document, pointer || this.pointer)
    }
    fromText(input) {
      const { methods } = this;
      //assume ./01-tokenize is installed
      let document = methods.one.tokenize.fromString(input, this.world);
      let doc = new View(document);
      doc.world = this.world;
      doc.compute(['normal', 'lexicon']);
      if (this.world.compute.preTagger) {
        doc.compute('preTagger');
      }
      return doc
    }
    clone() {
      // clone the whole document
      let document = this.document.slice(0);    //node 17: structuredClone(document);
      document = document.map(terms => {
        return terms.map(term => {
          term = Object.assign({}, term);
          term.tags = new Set(term.tags);
          return term
        })
      });
      // clone only sub-document ?
      let m = this.update(this.pointer);
      m.document = document;
      m._cache = this._cache; //clone this too?
      return m
    }
  }
  Object.assign(View.prototype, api$e);
  var View$1 = View;

  var version$1 = '14.8.2';

  const isObject$6 = function (item) {
    return item && typeof item === 'object' && !Array.isArray(item)
  };

  // recursive merge of objects
  function mergeDeep(model, plugin) {
    if (isObject$6(plugin)) {
      for (const key in plugin) {
        if (isObject$6(plugin[key])) {
          if (!model[key]) Object.assign(model, { [key]: {} });
          mergeDeep(model[key], plugin[key]); //recursion
          // } else if (isArray(plugin[key])) {
          // console.log(key)
          // console.log(model)
        } else {
          Object.assign(model, { [key]: plugin[key] });
        }
      }
    }
    return model
  }
  // const merged = mergeDeep({ a: 1 }, { b: { c: { d: { e: 12345 } } } })
  // console.dir(merged, { depth: 5 })

  // vroom
  function mergeQuick(model, plugin) {
    for (const key in plugin) {
      model[key] = model[key] || {};
      Object.assign(model[key], plugin[key]);
    }
    return model
  }

  const addIrregulars = function (model, conj) {
    let m = model.two.models || {};
    Object.keys(conj).forEach(k => {
      // verb forms
      if (conj[k].pastTense) {
        if (m.toPast) {
          m.toPast.exceptions[k] = conj[k].pastTense;
        }
        if (m.fromPast) {
          m.fromPast.exceptions[conj[k].pastTense] = k;
        }
      }
      if (conj[k].presentTense) {
        if (m.toPresent) {
          m.toPresent.exceptions[k] = conj[k].presentTense;
        }
        if (m.fromPresent) {
          m.fromPresent.exceptions[conj[k].presentTense] = k;
        }
      }
      if (conj[k].gerund) {
        if (m.toGerund) {
          m.toGerund.exceptions[k] = conj[k].gerund;
        }
        if (m.fromGerund) {
          m.fromGerund.exceptions[conj[k].gerund] = k;
        }
      }
      // adjective forms
      if (conj[k].comparative) {
        if (m.toComparative) {
          m.toComparative.exceptions[k] = conj[k].comparative;
        }
        if (m.fromComparative) {
          m.fromComparative.exceptions[conj[k].comparative] = k;
        }
      }
      if (conj[k].superlative) {
        if (m.toSuperlative) {
          m.toSuperlative.exceptions[k] = conj[k].superlative;
        }
        if (m.fromSuperlative) {
          m.fromSuperlative.exceptions[conj[k].superlative] = k;
        }
      }
    });
  };

  const extend = function (plugin, world, View, nlp) {
    const { methods, model, compute, hooks } = world;
    if (plugin.methods) {
      mergeQuick(methods, plugin.methods);
    }
    if (plugin.model) {
      mergeDeep(model, plugin.model);
    }
    if (plugin.irregulars) {
      addIrregulars(model, plugin.irregulars);
    }
    // shallow-merge compute
    if (plugin.compute) {
      Object.assign(compute, plugin.compute);
    }
    // append new hooks
    if (hooks) {
      world.hooks = hooks.concat(plugin.hooks || []);
    }
    // assign new class methods
    if (plugin.api) {
      plugin.api(View);
    }
    if (plugin.lib) {
      Object.keys(plugin.lib).forEach(k => nlp[k] = plugin.lib[k]);
    }
    if (plugin.tags) {
      nlp.addTags(plugin.tags);
    }
    if (plugin.words) {
      nlp.addWords(plugin.words);
    }
    if (plugin.mutate) {
      plugin.mutate(world);
    }
  };
  var extend$1 = extend;

  /** log the decision-making to console */
  const verbose = function (set) {
    const env = typeof process === 'undefined' || !process.env ? self.env || {} : process.env; //use window, in browser
    env.DEBUG_TAGS = set === 'tagger' || set === true ? true : '';
    env.DEBUG_MATCH = set === 'match' || set === true ? true : '';
    env.DEBUG_CHUNKS = set === 'chunker' || set === true ? true : '';
    return this
  };

  const isObject$5 = val => {
    return Object.prototype.toString.call(val) === '[object Object]'
  };

  const isArray$8 = function (arr) {
    return Object.prototype.toString.call(arr) === '[object Array]'
  };

  // internal Term objects are slightly different
  const fromJson = function (json) {
    return json.map(o => {
      return o.terms.map(term => {
        if (isArray$8(term.tags)) {
          term.tags = new Set(term.tags);
        }
        return term
      })
    })
  };

  // interpret an array-of-arrays
  const preTokenized = function (arr) {
    return arr.map((a) => {
      return a.map(str => {
        return {
          text: str,
          normal: str,//cleanup
          pre: '',
          post: ' ',
          tags: new Set()
        }
      })
    })
  };

  const inputs = function (input, View, world) {
    const { methods } = world;
    let doc = new View([]);
    doc.world = world;
    // support a number
    if (typeof input === 'number') {
      input = String(input);
    }
    // return empty doc
    if (!input) {
      return doc
    }
    // parse a string
    if (typeof input === 'string') {
      let document = methods.one.tokenize.fromString(input, world);
      return new View(document)
    }
    // handle compromise View
    if (isObject$5(input) && input.isView) {
      return new View(input.document, input.ptrs)
    }
    // handle json input
    if (isArray$8(input)) {
      // pre-tokenized array-of-arrays 
      if (isArray$8(input[0])) {
        let document = preTokenized(input);
        return new View(document)
      }
      // handle json output
      let document = fromJson(input);
      return new View(document)
    }
    return doc
  };
  var handleInputs = inputs;

  let world = Object.assign({}, tmpWrld);

  const nlp = function (input, lex) {
    if (lex) {
      nlp.addWords(lex);
    }
    let doc = handleInputs(input, View$1, world);
    if (input) {
      doc.compute(world.hooks);
    }
    return doc
  };
  Object.defineProperty(nlp, '_world', {
    value: world,
    writable: true,
  });

  /** don't run the POS-tagger */
  nlp.tokenize = function (input, lex) {
    const { compute } = this._world;
    // add user-given words to lexicon
    if (lex) {
      nlp.addWords(lex);
    }
    // run the tokenizer
    let doc = handleInputs(input, View$1, world);
    // give contractions a shot, at least
    if (compute.contractions) {
      doc.compute(['alias', 'normal', 'machine', 'contractions']); //run it if we've got it
    }
    return doc
  };

  /** extend compromise functionality */
  nlp.plugin = function (plugin) {
    extend$1(plugin, this._world, View$1, this);
    return this
  };
  nlp.extend = nlp.plugin;


  /** reach-into compromise internals */
  nlp.world = function () {
    return this._world
  };
  nlp.model = function () {
    return this._world.model
  };
  nlp.methods = function () {
    return this._world.methods
  };
  nlp.hooks = function () {
    return this._world.hooks
  };

  /** log the decision-making to console */
  nlp.verbose = verbose;
  /** current library release version */
  nlp.version = version$1;

  var nlp$1 = nlp;

  const createCache = function (document) {
    let cache = document.map(terms => {
      let stuff = new Set();
      terms.forEach(term => {
        // add words
        if (term.normal !== '') {
          stuff.add(term.normal);
        }
        // cache switch-status - '%Noun|Verb%'
        if (term.switch) {
          stuff.add(`%${term.switch}%`);
        }
        // cache implicit words, too
        if (term.implicit) {
          stuff.add(term.implicit);
        }
        if (term.machine) {
          stuff.add(term.machine);
        }
        if (term.root) {
          stuff.add(term.root);
        }
        // cache slashes words, etc
        if (term.alias) {
          term.alias.forEach(str => stuff.add(str));
        }
        let tags = Array.from(term.tags);
        for (let t = 0; t < tags.length; t += 1) {
          stuff.add('#' + tags[t]);
        }
      });
      return stuff
    });
    return cache
  };
  var cacheDoc = createCache;

  var methods$m = {
    one: {
      cacheDoc,
    },
  };

  const methods$l = {
    /** */
    cache: function () {
      this._cache = this.methods.one.cacheDoc(this.document);
      return this
    },
    /** */
    uncache: function () {
      this._cache = null;
      return this
    },
  };
  const addAPI$3 = function (View) {
    Object.assign(View.prototype, methods$l);
  };
  var api$d = addAPI$3;

  var compute$8 = {
    cache: function (view) {
      view._cache = view.methods.one.cacheDoc(view.document);
    }
  };

  var cache$1 = {
    api: api$d,
    compute: compute$8,
    methods: methods$m,
  };

  var caseFns = {
    /** */
    toLowerCase: function () {
      this.termList().forEach(t => {
        t.text = t.text.toLowerCase();
      });
      return this
    },
    /** */
    toUpperCase: function () {
      this.termList().forEach(t => {
        t.text = t.text.toUpperCase();
      });
      return this
    },
    /** */
    toTitleCase: function () {
      this.termList().forEach(t => {
        t.text = t.text.replace(/^ *[a-z\u00C0-\u00FF]/, x => x.toUpperCase()); //support unicode?
      });
      return this
    },
    /** */
    toCamelCase: function () {
      this.docs.forEach(terms => {
        terms.forEach((t, i) => {
          if (i !== 0) {
            t.text = t.text.replace(/^ *[a-z\u00C0-\u00FF]/, x => x.toUpperCase()); //support unicode?
          }
          if (i !== terms.length - 1) {
            t.post = '';
          }
        });
      });
      return this
    },
  };

  // case logic
  const isTitleCase = (str) => /^\p{Lu}[\p{Ll}'’]/u.test(str) || /^\p{Lu}$/u.test(str);
  const toTitleCase = (str) => str.replace(/^\p{Ll}/u, x => x.toUpperCase());
  const toLowerCase = (str) => str.replace(/^\p{Lu}/u, x => x.toLowerCase());

  // splice an array into an array
  const spliceArr = (parent, index, child) => {
    // tag them as dirty
    child.forEach(term => term.dirty = true);
    if (parent) {
      let args = [index, 0].concat(child);
      Array.prototype.splice.apply(parent, args);
    }
    return parent
  };

  // add a space at end, if required
  const endSpace = function (terms) {
    const hasSpace = / $/;
    const hasDash = /[-–—]/;
    let lastTerm = terms[terms.length - 1];
    if (lastTerm && !hasSpace.test(lastTerm.post) && !hasDash.test(lastTerm.post)) {
      lastTerm.post += ' ';
    }
  };

  // sentence-ending punctuation should move in append
  const movePunct = (source, end, needle) => {
    const juicy = /[-.?!,;:)–—'"]/g;
    let wasLast = source[end - 1];
    if (!wasLast) {
      return
    }
    let post = wasLast.post;
    if (juicy.test(post)) {
      let punct = post.match(juicy).join(''); //not perfect
      let last = needle[needle.length - 1];
      last.post = punct + last.post;
      // remove it, from source
      wasLast.post = wasLast.post.replace(juicy, '');
    }
  };


  const moveTitleCase = function (home, start, needle) {
    let from = home[start];
    // should we bother?
    if (start !== 0 || !isTitleCase(from.text)) {
      return
    }
    // titlecase new first term
    needle[0].text = toTitleCase(needle[0].text);
    // should we un-titlecase the old word?
    let old = home[start];
    if (old.tags.has('ProperNoun') || old.tags.has('Acronym')) {
      return
    }
    if (isTitleCase(old.text) && old.text.length > 1) {
      old.text = toLowerCase(old.text);
    }
  };

  // put these words before the others
  const cleanPrepend = function (home, ptr, needle, document) {
    let [n, start, end] = ptr;
    // introduce spaces appropriately
    if (start === 0) {
      // at start - need space in insert
      endSpace(needle);
    } else if (end === document[n].length) {
      // at end - need space in home
      endSpace(needle);
    } else {
      // in middle - need space in home and insert
      endSpace(needle);
      endSpace([home[ptr[1]]]);
    }
    moveTitleCase(home, start, needle);
    // movePunct(home, end, needle)
    spliceArr(home, start, needle);
  };

  const cleanAppend = function (home, ptr, needle, document) {
    let [n, , end] = ptr;
    let total = (document[n] || []).length;
    if (end < total) {
      // are we in the middle?
      // add trailing space on self
      movePunct(home, end, needle);
      endSpace(needle);
    } else if (total === end) {
      // are we at the end?
      // add a space to predecessor
      endSpace(home);
      // very end, move period
      movePunct(home, end, needle);
      // is there another sentence after?
      if (document[n + 1]) {
        needle[needle.length - 1].post += ' ';
      }
    }
    spliceArr(home, ptr[2], needle);
    // set new endId
    ptr[4] = needle[needle.length - 1].id;
  };

  /*
  unique & ordered term ids, based on time & term index

  Base 36 (numbers+ascii)
    3 digit 4,600
    2 digit 1,200
    1 digit 36

    TTT|NNN|II|R

  TTT -> 46 terms since load
  NNN -> 46 thousand sentences (>1 inf-jest)
  II  -> 1,200 words in a sentence (nuts)
  R   -> 1-36 random number 

  novels: 
    avg 80,000 words
      15 words per sentence
    5,000 sentences

  Infinite Jest:
    36,247 sentences
    https://en.wikipedia.org/wiki/List_of_longest_novels

  collisions are more-likely after
      46 seconds have passed,
    and 
      after 46-thousand sentences

  */
  let index$2 = 0;

  const pad3 = (str) => {
    str = str.length < 3 ? '0' + str : str;
    return str.length < 3 ? '0' + str : str
  };

  const toId = function (term) {
    let [n, i] = term.index || [0, 0];
    index$2 += 1;

    //don't overflow index
    index$2 = index$2 > 46655 ? 0 : index$2;
    //don't overflow sentences
    n = n > 46655 ? 0 : n;
    // //don't overflow terms
    i = i > 1294 ? 0 : i;

    // 3 digits for time
    let id = pad3(index$2.toString(36));
    // 3 digit  for sentence index (46k)
    id += pad3(n.toString(36));

    // 1 digit for term index (36)
    let tx = i.toString(36);
    tx = tx.length < 2 ? '0' + tx : tx; //pad2
    id += tx;

    // 1 digit random number
    let r = parseInt(Math.random() * 36, 10);
    id += (r).toString(36);

    return term.normal + '|' + id.toUpperCase()
  };

  var uuid = toId;

  // setInterval(() => console.log(toId(4, 12)), 100)

  // are we inserting inside a contraction?
  // expand it first
  const expand$1 = function (m) {
    if (m.has('@hasContraction') && typeof m.contractions === 'function') {//&& m.after('^.').has('@hasContraction')
      let more = m.grow('@hasContraction');
      more.contractions().expand();
    }
  };

  const isArray$7 = (arr) => Object.prototype.toString.call(arr) === '[object Array]';

  // set new ids for each terms
  const addIds$2 = function (terms) {
    terms = terms.map((term) => {
      term.id = uuid(term);
      return term
    });
    return terms
  };

  const getTerms = function (input, world) {
    const { methods } = world;
    // create our terms from a string
    if (typeof input === 'string') {
      return methods.one.tokenize.fromString(input, world)[0] //assume one sentence
    }
    //allow a view object
    if (typeof input === 'object' && input.isView) {
      return input.clone().docs[0] || [] //assume one sentence
    }
    //allow an array of terms, too
    if (isArray$7(input)) {
      return isArray$7(input[0]) ? input[0] : input
    }
    return []
  };

  const insert = function (input, view, prepend) {
    const { document, world } = view;
    view.uncache();
    // insert words at end of each doc
    let ptrs = view.fullPointer;
    let selfPtrs = view.fullPointer;
    view.forEach((m, i) => {
      let ptr = m.fullPointer[0];
      let [n] = ptr;
      // add-in the words
      let home = document[n];
      let terms = getTerms(input, world);
      // are we inserting nothing?
      if (terms.length === 0) {
        return
      }
      terms = addIds$2(terms);
      if (prepend) {
        expand$1(view.update([ptr]).firstTerm());
        cleanPrepend(home, ptr, terms, document);
      } else {
        expand$1(view.update([ptr]).lastTerm());
        cleanAppend(home, ptr, terms, document);
      }
      // harden the pointer
      if (document[n] && document[n][ptr[1]]) {
        ptr[3] = document[n][ptr[1]].id;
      }
      // change self backwards by len
      selfPtrs[i] = ptr;
      // extend the pointer
      ptr[2] += terms.length;
      ptrs[i] = ptr;
    });
    let doc = view.toView(ptrs);
    // shift our self pointer, if necessary
    view.ptrs = selfPtrs;
    // try to tag them, too
    doc.compute(['id', 'index', 'lexicon']);
    if (doc.world.compute.preTagger) {
      doc.compute('preTagger');
    }
    return doc
  };

  const fns$3 = {
    insertAfter: function (input) {
      return insert(input, this, false)
    },
    insertBefore: function (input) {
      return insert(input, this, true)
    },

  };
  fns$3.append = fns$3.insertAfter;
  fns$3.prepend = fns$3.insertBefore;
  fns$3.insert = fns$3.insertAfter;

  var insert$1 = fns$3;

  const dollarStub = /\$[0-9a-z]+/g;
  const fns$2 = {};

  const titleCase$1 = function (str) {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase())
  };

  // doc.replace('foo', (m)=>{})
  const replaceByFn = function (main, fn) {
    main.forEach(m => {
      let out = fn(m);
      m.replaceWith(out);
    });
    return main
  };

  // support 'foo $0' replacements
  const subDollarSign = function (input, main) {
    if (typeof input !== 'string') {
      return input
    }
    let groups = main.groups();
    input = input.replace(dollarStub, (a) => {
      let num = a.replace(/\$/, '');
      if (groups.hasOwnProperty(num)) {
        return groups[num].text()
      }
      return a
    });
    return input
  };

  fns$2.replaceWith = function (input, keep = {}) {
    let ptrs = this.fullPointer;
    let main = this;
    this.uncache();
    if (typeof input === 'function') {
      return replaceByFn(main, input)
    }
    // support 'foo $0' replacements
    input = subDollarSign(input, main);

    let original = this.update(ptrs);
    // soften-up pointer
    ptrs = ptrs.map(ptr => ptr.slice(0, 3));
    // original.freeze()
    let oldTags = (original.docs[0] || []).map(term => Array.from(term.tags));
    // slide this in
    if (typeof input === 'string') {
      input = this.fromText(input).compute('id');
    }
    main.insertAfter(input);
    // are we replacing part of a contraction?
    if (original.has('@hasContraction') && main.contractions) {
      let more = main.grow('@hasContraction+');
      more.contractions().expand();
    }
    // delete the original terms
    main.delete(original); //science.
    // what should we return?
    let m = main.toView(ptrs).compute(['index', 'lexicon']);
    if (m.world.compute.preTagger) {
      m.compute('preTagger');
    }
    // replace any old tags
    if (keep.tags) {
      m.terms().forEach((term, i) => {
        term.tagSafe(oldTags[i]);
      });
    }
    // try to co-erce case, too
    if (keep.case && m.docs[0] && m.docs[0][0] && m.docs[0][0].index[1] === 0) {
      m.docs[0][0].text = titleCase$1(m.docs[0][0].text);
    }
    // console.log(input.docs[0])
    // let regs = input.docs[0].map(t => {
    //   return { id: t.id, optional: true }
    // })
    // m.after('(a|hoy)').debug()
    // m.growRight('(a|hoy)').debug()
    // console.log(m)
    return m
  };

  fns$2.replace = function (match, input, keep) {
    if (match && !input) {
      return this.replaceWith(match, keep)
    }
    let m = this.match(match);
    if (!m.found) {
      return this
    }
    this.soften();
    return m.replaceWith(input, keep)
  };
  var replace = fns$2;

  // transfer sentence-ending punctuation
  const repairPunct = function (terms, len) {
    let last = terms.length - 1;
    let from = terms[last];
    let to = terms[last - len];
    if (to && from) {
      to.post += from.post; //this isn't perfect.
      to.post = to.post.replace(/ +([.?!,;:])/, '$1');
      // don't allow any silly punctuation outcomes like ',!'
      to.post = to.post.replace(/[,;:]+([.?!])/, '$1');
    }
  };

  // remove terms from document json
  const pluckOut = function (document, nots) {
    nots.forEach(ptr => {
      let [n, start, end] = ptr;
      let len = end - start;
      if (!document[n]) {
        return // weird!
      }
      if (end === document[n].length && end > 1) {
        repairPunct(document[n], len);
      }
      document[n].splice(start, len); // replaces len terms at index start
    });
    // remove any now-empty sentences
    // (foreach + splice = 'mutable filter')
    for (let i = document.length - 1; i >= 0; i -= 1) {
      if (document[i].length === 0) {
        document.splice(i, 1);
        // remove any trailing whitespace before our removed sentence
        if (i === document.length && document[i - 1]) {
          let terms = document[i - 1];
          let lastTerm = terms[terms.length - 1];
          if (lastTerm) {
            lastTerm.post = lastTerm.post.trimEnd();
          }
        }
        // repair any downstream indexes
        // for (let k = i; k < document.length; k += 1) {
        //   document[k].forEach(term => term.index[0] -= 1)
        // }
      }
    }
    return document
  };

  var pluckOutTerm = pluckOut;

  const fixPointers$1 = function (ptrs, gonePtrs) {
    ptrs = ptrs.map(ptr => {
      let [n] = ptr;
      if (!gonePtrs[n]) {
        return ptr
      }
      gonePtrs[n].forEach(no => {
        let len = no[2] - no[1];
        // does it effect our pointer?
        if (ptr[1] <= no[1] && ptr[2] >= no[2]) {
          ptr[2] -= len;
        }
      });
      return ptr
    });

    // decrement any pointers after a now-empty pointer
    ptrs.forEach((ptr, i) => {
      // is the pointer now empty?
      if (ptr[1] === 0 && ptr[2] == 0) {
        // go down subsequent pointers
        for (let n = i + 1; n < ptrs.length; n += 1) {
          ptrs[n][0] -= 1;
          if (ptrs[n][0] < 0) {
            ptrs[n][0] = 0;
          }
        }
      }
    });
    // remove any now-empty pointers
    ptrs = ptrs.filter(ptr => ptr[2] - ptr[1] > 0);

    // remove old hard-pointers
    ptrs = ptrs.map((ptr) => {
      ptr[3] = null;
      ptr[4] = null;
      return ptr
    });
    return ptrs
  };

  const methods$k = {
    /** */
    remove: function (reg) {
      const { indexN } = this.methods.one.pointer;
      this.uncache();
      // two modes:
      //  - a. remove self, from full parent
      let self = this.all();
      let not = this;
      //  - b. remove a match, from self
      if (reg) {
        self = this;
        not = this.match(reg);
      }
      let isFull = !self.ptrs;
      // is it part of a contraction?
      if (not.has('@hasContraction') && not.contractions) {
        let more = not.grow('@hasContraction');
        more.contractions().expand();
      }

      let ptrs = self.fullPointer;
      let nots = not.fullPointer.reverse();
      // remove them from the actual document)
      let document = pluckOutTerm(this.document, nots);
      // repair our pointers
      let gonePtrs = indexN(nots);
      ptrs = fixPointers$1(ptrs, gonePtrs);
      // clean up our original inputs
      self.ptrs = ptrs;
      self.document = document;
      self.compute('index');
      // if we started zoomed-out, try to end zoomed-out
      if (isFull) {
        self.ptrs = undefined;
      }
      if (!reg) {
        this.ptrs = [];
        return self.none()
      }
      let res = self.toView(ptrs); //return new document
      return res
    },
  };

  // aliases
  methods$k.delete = methods$k.remove;
  var remove = methods$k;

  const methods$j = {
    /** add this punctuation or whitespace before each match: */
    pre: function (str, concat) {
      if (str === undefined && this.found) {
        return this.docs[0][0].pre
      }
      this.docs.forEach(terms => {
        let term = terms[0];
        if (concat === true) {
          term.pre += str;
        } else {
          term.pre = str;
        }
      });
      return this
    },

    /** add this punctuation or whitespace after each match: */
    post: function (str, concat) {
      if (str === undefined) {
        let last = this.docs[this.docs.length - 1];
        return last[last.length - 1].post
      }
      this.docs.forEach(terms => {
        let term = terms[terms.length - 1];
        if (concat === true) {
          term.post += str;
        } else {
          term.post = str;
        }
      });
      return this
    },

    /** remove whitespace from start/end */
    trim: function () {
      if (!this.found) {
        return this
      }
      let docs = this.docs;
      let start = docs[0][0];
      start.pre = start.pre.trimStart();
      let last = docs[docs.length - 1];
      let end = last[last.length - 1];
      end.post = end.post.trimEnd();
      return this
    },

    /** connect words with hyphen, and remove whitespace */
    hyphenate: function () {
      this.docs.forEach(terms => {
        //remove whitespace
        terms.forEach((t, i) => {
          if (i !== 0) {
            t.pre = '';
          }
          if (terms[i + 1]) {
            t.post = '-';
          }
        });
      });
      return this
    },

    /** remove hyphens between words, and set whitespace */
    dehyphenate: function () {
      const hasHyphen = /[-–—]/;
      this.docs.forEach(terms => {
        //remove whitespace
        terms.forEach(t => {
          if (hasHyphen.test(t.post)) {
            t.post = ' ';
          }
        });
      });
      return this
    },

    /** add quotations around these matches */
    toQuotations: function (start, end) {
      start = start || `"`;
      end = end || `"`;
      this.docs.forEach(terms => {
        terms[0].pre = start + terms[0].pre;
        let last = terms[terms.length - 1];
        last.post = end + last.post;
      });
      return this
    },

    /** add brackets around these matches */
    toParentheses: function (start, end) {
      start = start || `(`;
      end = end || `)`;
      this.docs.forEach(terms => {
        terms[0].pre = start + terms[0].pre;
        let last = terms[terms.length - 1];
        last.post = end + last.post;
      });
      return this
    },
  };
  methods$j.deHyphenate = methods$j.dehyphenate;
  methods$j.toQuotation = methods$j.toQuotations;

  var whitespace = methods$j;

  /** alphabetical order */
  const alpha = (a, b) => {
    if (a.normal < b.normal) {
      return -1
    }
    if (a.normal > b.normal) {
      return 1
    }
    return 0
  };

  /** count the # of characters of each match */
  const length = (a, b) => {
    let left = a.normal.trim().length;
    let right = b.normal.trim().length;
    if (left < right) {
      return 1
    }
    if (left > right) {
      return -1
    }
    return 0
  };

  /** count the # of terms in each match */
  const wordCount$2 = (a, b) => {
    if (a.words < b.words) {
      return 1
    }
    if (a.words > b.words) {
      return -1
    }
    return 0
  };

  /** count the # of terms in each match */
  const sequential = (a, b) => {
    if (a[0] < b[0]) {
      return 1
    }
    if (a[0] > b[0]) {
      return -1
    }
    return a[1] > b[1] ? 1 : -1
  };

  /** sort by # of duplicates in the document*/
  const byFreq = function (arr) {
    let counts = {};
    arr.forEach(o => {
      counts[o.normal] = counts[o.normal] || 0;
      counts[o.normal] += 1;
    });
    // sort by freq
    arr.sort((a, b) => {
      let left = counts[a.normal];
      let right = counts[b.normal];
      if (left < right) {
        return 1
      }
      if (left > right) {
        return -1
      }
      return 0
    });
    return arr
  };

  var methods$i = { alpha, length, wordCount: wordCount$2, sequential, byFreq };

  // aliases
  const seqNames = new Set(['index', 'sequence', 'seq', 'sequential', 'chron', 'chronological']);
  const freqNames = new Set(['freq', 'frequency', 'topk', 'repeats']);
  const alphaNames = new Set(['alpha', 'alphabetical']);

  // support function as parameter
  const customSort = function (view, fn) {
    let ptrs = view.fullPointer;
    ptrs = ptrs.sort((a, b) => {
      a = view.update([a]);
      b = view.update([b]);
      return fn(a, b)
    });
    view.ptrs = ptrs; //mutate original
    return view
  };

  /** re-arrange the order of the matches (in place) */
  const sort = function (input) {
    let { docs, pointer } = this;
    this.uncache();
    if (typeof input === 'function') {
      return customSort(this, input)
    }
    input = input || 'alpha';
    let ptrs = pointer || docs.map((_d, n) => [n]);
    let arr = docs.map((terms, n) => {
      return {
        index: n,
        words: terms.length,
        normal: terms.map(t => t.machine || t.normal || '').join(' '),
        pointer: ptrs[n],
      }
    });
    // 'chronological' sorting
    if (seqNames.has(input)) {
      input = 'sequential';
    }
    // alphabetical sorting
    if (alphaNames.has(input)) {
      input = 'alpha';
    }
    // sort by frequency
    if (freqNames.has(input)) {
      arr = methods$i.byFreq(arr);
      return this.update(arr.map(o => o.pointer))
    }
    // apply sort method on each phrase
    if (typeof methods$i[input] === 'function') {
      arr = arr.sort(methods$i[input]);
      return this.update(arr.map(o => o.pointer))
    }
    return this
  };

  /** reverse the order of the matches, but not the words or index */
  const reverse = function () {
    let ptrs = this.pointer || this.docs.map((_d, n) => [n]);
    ptrs = [].concat(ptrs);
    ptrs = ptrs.reverse();
    if (this._cache) {
      this._cache = this._cache.reverse();
    }
    return this.update(ptrs)
  };

  /** remove any duplicate matches */
  const unique = function () {
    let already = new Set();
    let res = this.filter(m => {
      let txt = m.text('machine');
      if (already.has(txt)) {
        return false
      }
      already.add(txt);
      return true
    });
    // this.ptrs = res.ptrs //mutate original?
    return res//.compute('index')
  };

  var sort$1 = { unique, reverse, sort };

  const isArray$6 = (arr) => Object.prototype.toString.call(arr) === '[object Array]';

  // append a new document, somehow
  const combineDocs = function (homeDocs, inputDocs) {
    if (homeDocs.length > 0) {
      // add a space
      let end = homeDocs[homeDocs.length - 1];
      let last = end[end.length - 1];
      if (/ /.test(last.post) === false) {
        last.post += ' ';
      }
    }
    homeDocs = homeDocs.concat(inputDocs);
    return homeDocs
  };

  const combineViews = function (home, input) {
    // is it a view from the same document?
    if (home.document === input.document) {
      let ptrs = home.fullPointer.concat(input.fullPointer);
      return home.toView(ptrs).compute('index')
    }
    // update n of new pointer, to end of our pointer
    let ptrs = input.fullPointer;
    ptrs.forEach(a => {
      a[0] += home.document.length;
    });
    home.document = combineDocs(home.document, input.docs);
    return home.all()
  };

  var concat = {
    // add string as new match/sentence
    concat: function (input) {
      // parse and splice-in new terms
      if (typeof input === 'string') {
        let more = this.fromText(input);
        // easy concat
        if (!this.found || !this.ptrs) {
          this.document = this.document.concat(more.document);
        } else {
          // if we are in the middle, this is actually a splice operation
          let ptrs = this.fullPointer;
          let at = ptrs[ptrs.length - 1][0];
          this.document.splice(at, 0, ...more.document);
        }
        // put the docs
        return this.all().compute('index')
      }
      // plop some view objects together
      if (typeof input === 'object' && input.isView) {
        return combineViews(this, input)
      }
      // assume it's an array of terms
      if (isArray$6(input)) {
        let docs = combineDocs(this.document, input);
        this.document = docs;
        return this.all()
      }
      return this
    },
  };

  // add indexes to pointers
  const harden = function () {
    this.ptrs = this.fullPointer;
    return this
  };
  // remove indexes from pointers
  const soften = function () {
    let ptr = this.ptrs;
    if (!ptr || ptr.length < 1) {
      return this
    }
    ptr = ptr.map(a => a.slice(0, 3));
    this.ptrs = ptr;
    return this
  };
  var harden$1 = { harden, soften };

  const methods$h = Object.assign({}, caseFns, insert$1, replace, remove, whitespace, sort$1, concat, harden$1);

  const addAPI$2 = function (View) {
    Object.assign(View.prototype, methods$h);
  };
  var api$c = addAPI$2;

  const compute$6 = {
    id: function (view) {
      let docs = view.docs;
      for (let n = 0; n < docs.length; n += 1) {
        for (let i = 0; i < docs[n].length; i += 1) {
          let term = docs[n][i];
          term.id = term.id || uuid(term);
        }
      }
    }
  };

  var compute$7 = compute$6;

  var change = {
    api: api$c,
    compute: compute$7,
  };

  var contractions$3 = [
    // simple mappings
    { word: '@', out: ['at'] },
    { word: 'alot', out: ['a', 'lot'] },
    { word: 'brb', out: ['be', 'right', 'back'] },
    { word: 'cannot', out: ['can', 'not'] },
    { word: 'cant', out: ['can', 'not'] },
    { word: 'dont', out: ['do', 'not'] },
    { word: 'dun', out: ['do', 'not'] },
    { word: 'wont', out: ['will', 'not'] },
    { word: "can't", out: ['can', 'not'] },
    { word: "shan't", out: ['should', 'not'] },
    { word: "won't", out: ['will', 'not'] },
    { word: "that's", out: ['that', 'is'] },
    { word: "what's", out: ['what', 'is'] },
    { word: "let's", out: ['let', 'us'] },
    { word: "there's", out: ['there', 'is'] },
    { word: 'dunno', out: ['do', 'not', 'know'] },
    { word: 'gonna', out: ['going', 'to'] },
    { word: 'gotta', out: ['have', 'got', 'to'] }, //hmm
    { word: 'gimme', out: ['give', 'me'] },
    { word: 'tryna', out: ['trying', 'to'] },
    { word: 'gtg', out: ['got', 'to', 'go'] },
    { word: 'im', out: ['i', 'am'] },
    { word: 'imma', out: ['I', 'will'] },
    { word: 'imo', out: ['in', 'my', 'opinion'] },
    { word: 'irl', out: ['in', 'real', 'life'] },
    { word: 'ive', out: ['i', 'have'] },
    { word: 'rn', out: ['right', 'now'] },
    { word: 'tbh', out: ['to', 'be', 'honest'] },
    { word: 'wanna', out: ['want', 'to'] },
    { word: `c'mere`, out: ['come', 'here'] },
    { word: `c'mon`, out: ['come', 'on'] },
    // apostrophe d
    { word: 'howd', out: ['how', 'did'] },
    { word: 'whatd', out: ['what', 'did'] },
    { word: 'whend', out: ['when', 'did'] },
    { word: 'whered', out: ['where', 'did'] },
    // shoulda, coulda
    { word: 'shoulda', out: ['should', 'have'] },
    { word: 'coulda', out: ['coulda', 'have'] },
    { word: 'woulda', out: ['woulda', 'have'] },
    { word: 'musta', out: ['must', 'have'] },

    // { after: `cause`, out: ['because'] },
    { word: "tis", out: ['it', 'is'] },
    { word: "twas", out: ['it', 'was'] },
    { word: `y'know`, out: ['you', 'know'] },
    { word: "ne'er", out: ['never'] },
    { word: "o'er", out: ['over'] },
    // contraction-part mappings
    { after: 'll', out: ['will'] },
    { after: 've', out: ['have'] },
    { after: 're', out: ['are'] },
    { after: 'm', out: ['am'] },
    // french contractions
    { before: 'c', out: ['ce'] },
    { before: 'm', out: ['me'] },
    { before: 'n', out: ['ne'] },
    { before: 'qu', out: ['que'] },
    { before: 's', out: ['se'] },
    { before: 't', out: ['tu'] }, // t'aime
  ];

  var model$3 = { one: { contractions: contractions$3 } };

  // put n new words where 1 word was
  const insertContraction = function (document, point, words) {
    let [n, w] = point;
    if (!words || words.length === 0) {
      return
    }
    words = words.map((word, i) => {
      word.implicit = word.text;
      word.machine = word.text;
      word.pre = '';
      word.post = '';
      word.text = '';
      word.normal = '';
      word.index = [n, w + i];
      return word
    });
    if (words[0]) {
      // move whitespace over
      words[0].pre = document[n][w].pre;
      words[words.length - 1].post = document[n][w].post;
      // add the text/normal to the first term
      words[0].text = document[n][w].text;
      words[0].normal = document[n][w].normal; // move tags too?
    }
    // do the splice
    document[n].splice(w, 1, ...words);
  };
  var splice = insertContraction;

  const hasContraction$1 = /'/;
  //look for a past-tense verb
  // const hasPastTense = (terms, i) => {
  //   let after = terms.slice(i + 1, i + 3)
  //   return after.some(t => t.tags.has('PastTense'))
  // }
  // he'd walked -> had
  // how'd -> did
  // he'd go -> would

  const alwaysDid = new Set([
    'what',
    'how',
    'when',
    'where',
    'why',
  ]);

  // after-words
  const useWould = new Set([
    'be',
    'go',
    'start',
    'think',
    'need',
  ]);

  const useHad = new Set([
    'been',
    'gone'
  ]);
  // they'd gone
  // they'd go


  // he'd been
  //    he had been
  //    he would been

  const _apostropheD = function (terms, i) {
    let before = terms[i].normal.split(hasContraction$1)[0];

    // what'd, how'd
    if (alwaysDid.has(before)) {
      return [before, 'did']
    }
    if (terms[i + 1]) {
      // they'd gone
      if (useHad.has(terms[i + 1].normal)) {
        return [before, 'had']
      }
      // they'd go
      if (useWould.has(terms[i + 1].normal)) {
        return [before, 'would']
      }
    }
    return null
    //   if (hasPastTense(terms, i) === true) {
    //     return [before, 'had']
    //   }
    //   // had/would/did
    //   return [before, 'would']
  };
  var apostropheD = _apostropheD;

  //ain't -> are/is not
  const apostropheT = function (terms, i) {
    if (terms[i].normal === "ain't" || terms[i].normal === 'aint') {
      return null //do this in ./two/
    }
    let before = terms[i].normal.replace(/n't/, '');
    return [before, 'not']
  };

  var apostropheT$1 = apostropheT;

  const hasContraction = /'/;

  // l'amour
  const preL = (terms, i) => {
    // le/la
    let after = terms[i].normal.split(hasContraction)[1];
    // quick french gender disambig (rough)
    if (after && after.endsWith('e')) {
      return ['la', after]
    }
    return ['le', after]
  };

  // d'amerique
  const preD = (terms, i) => {
    let after = terms[i].normal.split(hasContraction)[1];
    // quick guess for noun-agreement (rough)
    if (after && after.endsWith('e')) {
      return ['du', after]
    } else if (after && after.endsWith('s')) {
      return ['des', after]
    }
    return ['de', after]
  };

  // j'aime
  const preJ = (terms, i) => {
    let after = terms[i].normal.split(hasContraction)[1];
    return ['je', after]
  };

  var french = {
    preJ,
    preL,
    preD,
  };

  const isRange = /^([0-9.]{1,4}[a-z]{0,2}) ?[-–—] ?([0-9]{1,4}[a-z]{0,2})$/i;
  const timeRange = /^([0-9]{1,2}(:[0-9][0-9])?(am|pm)?) ?[-–—] ?([0-9]{1,2}(:[0-9][0-9])?(am|pm)?)$/i;
  const phoneNum = /^[0-9]{3}-[0-9]{4}$/;

  const numberRange = function (terms, i) {
    let term = terms[i];
    let parts = term.text.match(isRange);
    if (parts !== null) {
      // 123-1234 is a phone number, not a number-range
      if (term.tags.has('PhoneNumber') === true || phoneNum.test(term.text)) {
        return null
      }
      return [parts[1], 'to', parts[2]]
    } else {
      parts = term.text.match(timeRange);
      if (parts !== null) {
        return [parts[1], 'to', parts[4]]
      }
    }
    return null
  };
  var numberRange$1 = numberRange;

  const numUnit = /^([+-]?[0-9][.,0-9]*)([a-z°²³µ/]+)$/; //(must be lowercase)

  const notUnit = new Set([
    'st',
    'nd',
    'rd',
    'th',
    'am',
    'pm',
    'max',
    '°',
    's', // 1990s
    'e' // 18e - french/spanish ordinal
  ]);

  const numberUnit = function (terms, i) {
    let term = terms[i];
    let parts = term.text.match(numUnit);
    if (parts !== null) {
      // is it a recognized unit, like 'km'?
      let unit = parts[2].toLowerCase().trim();
      // don't split '3rd'
      if (notUnit.has(unit)) {
        return null
      }
      return [parts[1], unit] //split it
    }
    return null
  };
  var numberUnit$1 = numberUnit;

  const byApostrophe = /'/;
  const numDash = /^[0-9][^-–—]*[-–—].*?[0-9]/;

  // run tagger on our new implicit terms
  const reTag = function (terms, view, start, len) {
    let tmp = view.update();
    tmp.document = [terms];
    // offer to re-tag neighbours, too
    let end = start + len;
    if (start > 0) {
      start -= 1;
    }
    if (terms[end]) {
      end += 1;
    }
    tmp.ptrs = [[0, start, end]];
  };

  const byEnd = {
    // ain't
    t: (terms, i) => apostropheT$1(terms, i),
    // how'd
    d: (terms, i) => apostropheD(terms, i),
  };

  const byStart = {
    // j'aime
    j: (terms, i) => french.preJ(terms, i),
    // l'amour
    l: (terms, i) => french.preL(terms, i),
    // d'amerique
    d: (terms, i) => french.preD(terms, i),
  };

  // pull-apart known contractions from model
  const knownOnes = function (list, term, before, after) {
    for (let i = 0; i < list.length; i += 1) {
      let o = list[i];
      // look for word-word match (cannot-> [can, not])
      if (o.word === term.normal) {
        return o.out
      }
      // look for after-match ('re -> [_, are])
      else if (after !== null && after === o.after) {
        return [before].concat(o.out)
      }
      // look for before-match (l' -> [le, _])
      else if (before !== null && before === o.before) {
        return o.out.concat(after)
        // return [o.out, after] //typeof o.out === 'string' ? [o.out, after] : o.out(terms, i)
      }
    }
    return null
  };

  const toDocs = function (words, view) {
    let doc = view.fromText(words.join(' '));
    doc.compute(['id', 'alias']);
    return doc.docs[0]
  };

  //really easy ones
  const contractions$1 = (view) => {
    let { world, document } = view;
    const { model, methods } = world;
    let list = model.one.contractions || [];
    new Set(model.one.units || []);
    // each sentence
    document.forEach((terms, n) => {
      // loop through terms backwards
      for (let i = terms.length - 1; i >= 0; i -= 1) {
        let before = null;
        let after = null;
        if (byApostrophe.test(terms[i].normal) === true) {
          [before, after] = terms[i].normal.split(byApostrophe);
        }
        // any known-ones, like 'dunno'?
        let words = knownOnes(list, terms[i], before, after);
        // ['foo', 's']
        if (!words && byEnd.hasOwnProperty(after)) {
          words = byEnd[after](terms, i, world);
        }
        // ['j', 'aime']
        if (!words && byStart.hasOwnProperty(before)) {
          words = byStart[before](terms, i);
        }
        // actually insert the new terms
        if (words) {
          words = toDocs(words, view);
          splice(document, [n, i], words);
          reTag(document[n], view, i, words.length);
          continue
        }
        // '44-2' has special care
        if (numDash.test(terms[i].normal)) {
          words = numberRange$1(terms, i);
          if (words) {
            words = toDocs(words, view);
            splice(document, [n, i], words);
            methods.one.setTag(words, 'NumberRange', world);//add custom tag
            // is it a time-range, like '5-9pm'
            if (words[2] && words[2].tags.has('Time')) {
              methods.one.setTag([words[0]], 'Time', world, null, 'time-range');
            }
            reTag(document[n], view, i, words.length);
          }
          continue
        }
        // split-apart '4km'
        words = numberUnit$1(terms, i);
        if (words) {
          words = toDocs(words, view);
          splice(document, [n, i], words);
          methods.one.setTag([words[1]], 'Unit', world, null, 'contraction-unit');
        }
      }
    });
  };
  var contractions$2 = contractions$1;

  var compute$5 = { contractions: contractions$2 };

  const plugin = {
    model: model$3,
    compute: compute$5,
    hooks: ['contractions'],
  };
  var contractions = plugin;

  // scan-ahead to match multiple-word terms - 'jack rabbit'
  const checkMulti = function (terms, i, lexicon, setTag, world) {
    let max = i + 4 > terms.length ? terms.length - i : 4;
    let str = terms[i].machine || terms[i].normal;
    for (let skip = 1; skip < max; skip += 1) {
      let t = terms[i + skip];
      let word = t.machine || t.normal;
      str += ' ' + word;
      if (lexicon.hasOwnProperty(str) === true) {
        let tag = lexicon[str];
        let ts = terms.slice(i, i + skip + 1);
        setTag(ts, tag, world, false, '1-multi-lexicon');

        // special case for phrasal-verbs - 2nd word is a #Particle
        if (tag && tag.length === 2 && (tag[0] === 'PhrasalVerb' || tag[1] === 'PhrasalVerb')) {
          setTag([ts[1]], 'Particle', world, false, '1-phrasal-particle');
        }
        return true
      }
    }
    return false
  };

  const multiWord = function (terms, i, world) {
    const { model, methods } = world;
    // const { fastTag } = methods.one
    const setTag = methods.one.setTag;
    const multi = model.one._multiCache || {};
    const lexicon = model.one.lexicon || {};
    // basic lexicon lookup
    let t = terms[i];
    let word = t.machine || t.normal;
    // multi-word lookup
    if (terms[i + 1] !== undefined && multi[word] === true) {
      return checkMulti(terms, i, lexicon, setTag, world)
    }
    return null
  };
  var multiWord$1 = multiWord;

  const prefix = /^(under|over|mis|re|un|dis|semi|pre|post)-?/;
  // anti|non|extra|inter|intra|over
  const allowPrefix = new Set(['Verb', 'Infinitive', 'PastTense', 'Gerund', 'PresentTense', 'Adjective', 'Participle']);

  // tag any words in our lexicon
  const checkLexicon = function (terms, i, world) {
    const { model, methods } = world;
    // const fastTag = methods.one.fastTag
    const setTag = methods.one.setTag;
    const lexicon = model.one.lexicon;

    // basic lexicon lookup
    let t = terms[i];
    let word = t.machine || t.normal;
    // normal lexicon lookup
    if (lexicon[word] !== undefined && lexicon.hasOwnProperty(word)) {
      let tag = lexicon[word];
      setTag([t], tag, world, false, '1-lexicon');
      // fastTag(t, tag, '1-lexicon')
      return true
    }
    // lookup aliases in the lexicon
    if (t.alias) {
      let found = t.alias.find(str => lexicon.hasOwnProperty(str));
      if (found) {
        let tag = lexicon[found];
        setTag([t], tag, world, false, '1-lexicon-alias');
        // fastTag(t, tag, '1-lexicon-alias')
        return true
      }
    }
    // prefixing for verbs/adjectives
    if (prefix.test(word) === true) {
      let stem = word.replace(prefix, '');
      if (lexicon.hasOwnProperty(stem) && stem.length > 3) {
        // only allow prefixes for verbs/adjectives
        if (allowPrefix.has(lexicon[stem])) {
          // console.log('->', word, stem, lexicon[stem])
          setTag([t], lexicon[stem], world, false, '1-lexicon-prefix');
          // fastTag(t, lexicon[stem], '1-lexicon-prefix')
          return true
        }
      }
    }
    return null
  };
  var singleWord = checkLexicon;

  // tag any words in our lexicon - even if it hasn't been filled-up yet
  // rest of pre-tagger is in ./two/preTagger
  const lexicon$5 = function (view) {
    const world = view.world;
    view.docs.forEach(terms => {
      for (let i = 0; i < terms.length; i += 1) {
        if (terms[i].tags.size === 0) {
          let found = null;
          found = found || multiWord$1(terms, i, world);
          // lookup known words
          found = found || singleWord(terms, i, world);
        }
      }
    });
  };

  var compute$4 = {
    lexicon: lexicon$5
  };

  // derive clever things from our lexicon key-value pairs
  const expand = function (words) {
    // const { methods, model } = world
    let lex = {};
    // console.log('start:', Object.keys(lex).length)
    let _multi = {};
    // go through each word in this key-value obj:
    Object.keys(words).forEach(word => {
      let tag = words[word];
      // normalize lexicon a little bit
      word = word.toLowerCase().trim();
      word = word.replace(/'s\b/, '');
      // cache multi-word terms
      let split = word.split(/ /);
      if (split.length > 1) {
        _multi[split[0]] = true;
      }
      lex[word] = lex[word] || tag;
    });
    // cleanup
    delete lex[''];
    delete lex[null];
    delete lex[' '];
    return { lex, _multi }
  };
  var expandLexicon = expand;

  var methods$g = {
    one: {
      expandLexicon,
    }
  };

  /** insert new words/phrases into the lexicon */
  const addWords = function (words) {
    const world = this.world();
    const { methods, model } = world;
    if (!words) {
      return
    }
    // normalize tag vals
    Object.keys(words).forEach(k => {
      if (typeof words[k] === 'string' && words[k].startsWith('#')) {
        words[k] = words[k].replace(/^#/, '');
      }
    });
    // add some words to our lexicon
    if (methods.two.expandLexicon) {
      // do fancy ./two version
      let { lex, _multi } = methods.two.expandLexicon(words, world);
      Object.assign(model.one.lexicon, lex);
      Object.assign(model.one._multiCache, _multi);
    } else if (methods.one.expandLexicon) {
      // do basic ./one version
      let { lex, _multi } = methods.one.expandLexicon(words, world);
      Object.assign(model.one.lexicon, lex);
      Object.assign(model.one._multiCache, _multi);
    } else {
      //no fancy-business
      Object.assign(model.one.lexicon, words);
    }
  };

  var lib$5 = { addWords };

  const model$2 = {
    one: {
      lexicon: {}, //setup blank lexicon
      _multiCache: {},
    }
  };

  var lexicon$4 = {
    model: model$2,
    methods: methods$g,
    compute: compute$4,
    lib: lib$5,
    hooks: ['lexicon']
  };

  // edited by Spencer Kelly
  // credit to https://github.com/BrunoRB/ahocorasick by Bruno Roberto Búrigo.

  const tokenize$4 = function (phrase, world) {
    const { methods, model } = world;
    let terms = methods.one.tokenize.splitTerms(phrase, model).map(t => methods.one.tokenize.splitWhitespace(t, model));
    return terms.map(term => term.text.toLowerCase())
  };

  // turn an array or object into a compressed aho-corasick structure
  const buildTrie = function (phrases, world) {

    // const tokenize=methods.one.
    let goNext = [{}];
    let endAs = [null];
    let failTo = [0];

    let xs = [];
    let n = 0;
    phrases.forEach(function (phrase) {
      let curr = 0;
      // let wordsB = phrase.split(/ /g).filter(w => w)
      let words = tokenize$4(phrase, world);
      for (let i = 0; i < words.length; i++) {
        let word = words[i];
        if (goNext[curr] && goNext[curr].hasOwnProperty(word)) {
          curr = goNext[curr][word];
        } else {
          n++;
          goNext[curr][word] = n;
          goNext[n] = {};
          curr = n;
          endAs[n] = null;
        }
      }
      endAs[curr] = [words.length];
    });
    // f(s) = 0 for all states of depth 1 (the ones from which the 0 state can transition to)
    for (let word in goNext[0]) {
      n = goNext[0][word];
      failTo[n] = 0;
      xs.push(n);
    }

    while (xs.length) {
      let r = xs.shift();
      // for each symbol a such that g(r, a) = s
      let keys = Object.keys(goNext[r]);
      for (let i = 0; i < keys.length; i += 1) {
        let word = keys[i];
        let s = goNext[r][word];
        xs.push(s);
        // set state = f(r)
        n = failTo[r];
        while (n > 0 && !goNext[n].hasOwnProperty(word)) {
          n = failTo[n];
        }
        if (goNext.hasOwnProperty(n)) {
          let fs = goNext[n][word];
          failTo[s] = fs;
          if (endAs[fs]) {
            endAs[s] = endAs[s] || [];
            endAs[s] = endAs[s].concat(endAs[fs]);
          }
        } else {
          failTo[s] = 0;
        }
      }
    }
    return { goNext, endAs, failTo }
  };
  var build = buildTrie;

  // console.log(buildTrie(['smart and cool', 'smart and nice']))

  // follow our trie structure
  const scanWords = function (terms, trie, opts) {
    let n = 0;
    let results = [];
    for (let i = 0; i < terms.length; i++) {
      let word = terms[i][opts.form] || terms[i].normal;
      // main match-logic loop:
      while (n > 0 && (trie.goNext[n] === undefined || !trie.goNext[n].hasOwnProperty(word))) {
        n = trie.failTo[n] || 0; // (usually back to 0)
      }
      // did we fail?
      if (!trie.goNext[n].hasOwnProperty(word)) {
        continue
      }
      n = trie.goNext[n][word];
      if (trie.endAs[n]) {
        let arr = trie.endAs[n];
        for (let o = 0; o < arr.length; o++) {
          let len = arr[o];
          let term = terms[i - len + 1];
          let [no, start] = term.index;
          results.push([no, start, start + len, term.id]);
        }
      }
    }
    return results
  };

  const cacheMiss = function (words, cache) {
    for (let i = 0; i < words.length; i += 1) {
      if (cache.has(words[i]) === true) {
        return false
      }
    }
    return true
  };

  const scan = function (view, trie, opts) {
    let results = [];
    opts.form = opts.form || 'normal';
    let docs = view.docs;
    if (!trie.goNext || !trie.goNext[0]) {
      console.error('Compromise invalid lookup trie');//eslint-disable-line
      return view.none()
    }
    let firstWords = Object.keys(trie.goNext[0]);
    // do each phrase
    for (let i = 0; i < docs.length; i++) {
      // can we skip the phrase, all together?
      if (view._cache && view._cache[i] && cacheMiss(firstWords, view._cache[i]) === true) {
        continue
      }
      let terms = docs[i];
      let found = scanWords(terms, trie, opts);
      if (found.length > 0) {
        results = results.concat(found);
      }
    }
    return view.update(results)
  };
  var scan$1 = scan;

  const isObject$4 = val => {
    return Object.prototype.toString.call(val) === '[object Object]'
  };

  function api$b (View) {

    /** find all matches in this document */
    View.prototype.lookup = function (input, opts = {}) {
      if (!input) {
        return this.none()
      }
      if (typeof input === 'string') {
        input = [input];
      }
      let trie = isObject$4(input) ? input : build(input, this.world);
      let res = scan$1(this, trie, opts);
      res = res.settle();
      return res
    };
  }

  // chop-off tail of redundant vals at end of array
  const truncate = (list, val) => {
    for (let i = list.length - 1; i >= 0; i -= 1) {
      if (list[i] !== val) {
        list = list.slice(0, i + 1);
        return list
      }
    }
    return list
  };

  // prune trie a bit
  const compress = function (trie) {
    trie.goNext = trie.goNext.map(o => {
      if (Object.keys(o).length === 0) {
        return undefined
      }
      return o
    });
    // chop-off tail of undefined vals in goNext array
    trie.goNext = truncate(trie.goNext, undefined);
    // chop-off tail of zeros in failTo array
    trie.failTo = truncate(trie.failTo, 0);
    // chop-off tail of nulls in endAs array
    trie.endAs = truncate(trie.endAs, null);
    return trie
  };
  var compress$1 = compress;

  /** pre-compile a list of matches to lookup */
  const lib$4 = {
    /** turn an array or object into a compressed trie*/
    buildTrie: function (input) {
      const trie = build(input, this.world());
      return compress$1(trie)
    }
  };
  // add alias
  lib$4.compile = lib$4.buildTrie;

  var lookup = {
    api: api$b,
    lib: lib$4
  };

  const relPointer = function (ptrs, parent) {
    if (!parent) {
      return ptrs
    }
    ptrs.forEach(ptr => {
      let n = ptr[0];
      if (parent[n]) {
        ptr[0] = parent[n][0]; //n
        ptr[1] += parent[n][1]; //start
        ptr[2] += parent[n][1]; //end
      }
    });
    return ptrs
  };

  // make match-result relative to whole document
  const fixPointers = function (res, parent) {
    let { ptrs, byGroup } = res;
    ptrs = relPointer(ptrs, parent);
    Object.keys(byGroup).forEach(k => {
      byGroup[k] = relPointer(byGroup[k], parent);
    });
    return { ptrs, byGroup }
  };

  const isObject$3 = val => {
    return Object.prototype.toString.call(val) === '[object Object]'
  };

  // did they pass-in a compromise object?
  const isView = val => val && isObject$3(val) && val.isView === true;

  const isNet = val => val && isObject$3(val) && val.isNet === true;


  // is the pointer the full sentence?
  // export const isFull = function (ptr, document) {
  //   let [n, start, end] = ptr
  //   if (start !== 0) {
  //     return false
  //   }
  //   if (document[n] && document[n][end - 1] && !document[n][end]) {
  //     return true
  //   }
  //   return false
  // }

  const parseRegs = function (regs, opts, world) {
    const one = world.methods.one;
    if (typeof regs === 'number') {
      regs = String(regs);
    }
    // support param as string
    if (typeof regs === 'string') {
      regs = one.killUnicode(regs, world);
      regs = one.parseMatch(regs, opts, world);
    }
    return regs
  };

  const match$2 = function (regs, group, opts) {
    const one = this.methods.one;
    // support param as view object
    if (isView(regs)) {
      return this.intersection(regs)
    }
    // support a compiled set of matches
    if (isNet(regs)) {
      return this.sweep(regs, { tagger: false }).view.settle()
    }
    regs = parseRegs(regs, opts, this.world);
    let todo = { regs, group };
    let res = one.match(this.docs, todo, this._cache);
    let { ptrs, byGroup } = fixPointers(res, this.fullPointer);
    let view = this.toView(ptrs);
    view._groups = byGroup;
    return view
  };

  const matchOne = function (regs, group, opts) {
    const one = this.methods.one;
    // support at view as a param
    if (isView(regs)) {
      return this.intersection(regs).eq(0)
    }
    // support a compiled set of matches
    if (isNet(regs)) {
      return this.sweep(regs, { tagger: false, matchOne: true }).view
    }
    regs = parseRegs(regs, opts, this.world);
    let todo = { regs, group, justOne: true };
    let res = one.match(this.docs, todo, this._cache);
    let { ptrs, byGroup } = fixPointers(res, this.fullPointer);
    let view = this.toView(ptrs);
    view._groups = byGroup;
    return view
  };

  const has = function (regs, group, opts) {
    const one = this.methods.one;
    // support view as input
    if (isView(regs)) {
      let ptrs = regs.fullPointer; // support a view object as input
      return ptrs.length > 0
    }
    // support a compiled set of matches
    if (isNet(regs)) {
      return this.sweep(regs, { tagger: false }).view.found
    }
    regs = parseRegs(regs, opts, this.world);
    let todo = { regs, group, justOne: true };
    let ptrs = one.match(this.docs, todo, this._cache).ptrs;
    return ptrs.length > 0
  };

  // 'if'
  const ifFn = function (regs, group, opts) {
    const one = this.methods.one;
    // support view as input
    if (isView(regs)) {
      return this.filter(m => m.intersection(regs).found)
    }
    // support a compiled set of matches
    if (isNet(regs)) {
      let m = this.sweep(regs, { tagger: false }).view.settle();
      return this.if(m)//recurse with result
    }
    regs = parseRegs(regs, opts, this.world);
    let todo = { regs, group, justOne: true };
    let ptrs = this.fullPointer;
    let cache = this._cache || [];
    ptrs = ptrs.filter((ptr, i) => {
      let m = this.update([ptr]);
      let res = one.match(m.docs, todo, cache[i]).ptrs;
      return res.length > 0
    });
    let view = this.update(ptrs);
    // try and reconstruct the cache
    if (this._cache) {
      view._cache = ptrs.map(ptr => cache[ptr[0]]);
    }
    return view
  };

  const ifNo = function (regs, group, opts) {
    const { methods } = this;
    const one = methods.one;
    // support a view object as input
    if (isView(regs)) {
      return this.filter(m => !m.intersection(regs).found)
    }
    // support a compiled set of matches
    if (isNet(regs)) {
      let m = this.sweep(regs, { tagger: false }).view.settle();
      return this.ifNo(m)
    }
    // otherwise parse the match string
    regs = parseRegs(regs, opts, this.world);
    let cache = this._cache || [];
    let view = this.filter((m, i) => {
      let todo = { regs, group, justOne: true };
      let ptrs = one.match(m.docs, todo, cache[i]).ptrs;
      return ptrs.length === 0
    });
    // try to reconstruct the cache
    if (this._cache) {
      view._cache = view.ptrs.map(ptr => cache[ptr[0]]);
    }
    return view
  };

  var match$3 = { matchOne, match: match$2, has, if: ifFn, ifNo };

  const before$1 = function (regs, group, opts) {
    const { indexN } = this.methods.one.pointer;
    let pre = [];
    let byN = indexN(this.fullPointer);
    Object.keys(byN).forEach(k => {
      // check only the earliest match in the sentence
      let first = byN[k].sort((a, b) => (a[1] > b[1] ? 1 : -1))[0];
      if (first[1] > 0) {
        pre.push([first[0], 0, first[1]]);
      }
    });
    let preWords = this.toView(pre);
    if (!regs) {
      return preWords
    }
    return preWords.match(regs, group, opts)
  };

  const after$1 = function (regs, group, opts) {
    const { indexN } = this.methods.one.pointer;
    let post = [];
    let byN = indexN(this.fullPointer);
    let document = this.document;
    Object.keys(byN).forEach(k => {
      // check only the latest match in the sentence
      let last = byN[k].sort((a, b) => (a[1] > b[1] ? -1 : 1))[0];
      let [n, , end] = last;
      if (end < document[n].length) {
        post.push([n, end, document[n].length]);
      }
    });
    let postWords = this.toView(post);
    if (!regs) {
      return postWords
    }
    return postWords.match(regs, group, opts)
  };

  const growLeft = function (regs, group, opts) {
    if (typeof regs === 'string') {
      regs = this.world.methods.one.parseMatch(regs, opts, this.world);
    }
    regs[regs.length - 1].end = true;// ensure matches are beside us ←
    let ptrs = this.fullPointer;
    this.forEach((m, n) => {
      let more = m.before(regs, group);
      if (more.found) {
        let terms = more.terms();
        ptrs[n][1] -= terms.length;
        ptrs[n][3] = terms.docs[0][0].id;
      }
    });
    return this.update(ptrs)
  };

  const growRight = function (regs, group, opts) {
    if (typeof regs === 'string') {
      regs = this.world.methods.one.parseMatch(regs, opts, this.world);
    }
    regs[0].start = true;// ensure matches are beside us →
    let ptrs = this.fullPointer;
    this.forEach((m, n) => {
      let more = m.after(regs, group);
      if (more.found) {
        let terms = more.terms();
        ptrs[n][2] += terms.length;
        ptrs[n][4] = null; //remove end-id
      }
    });
    return this.update(ptrs)
  };

  const grow = function (regs, group, opts) {
    return this.growRight(regs, group, opts).growLeft(regs, group, opts)
  };

  var lookaround = { before: before$1, after: after$1, growLeft, growRight, grow };

  const combine = function (left, right) {
    return [left[0], left[1], right[2]]
  };

  const isArray$5 = function (arr) {
    return Object.prototype.toString.call(arr) === '[object Array]'
  };

  const getDoc$3 = (reg, view, group) => {
    if (typeof reg === 'string' || isArray$5(reg)) {
      return view.match(reg, group)
    }
    if (!reg) {
      return view.none()
    }
    return reg
  };

  const addIds$1 = function (ptr, view) {
    let [n, start, end] = ptr;
    if (view.document[n] && view.document[n][start]) {
      ptr[3] = ptr[3] || view.document[n][start].id;
      if (view.document[n][end - 1]) {
        ptr[4] = ptr[4] || view.document[n][end - 1].id;
      }
    }
    return ptr
  };

  const methods$f = {};
  // [before], [match], [after]
  methods$f.splitOn = function (m, group) {
    const { splitAll } = this.methods.one.pointer;
    let splits = getDoc$3(m, this, group).fullPointer;
    let all = splitAll(this.fullPointer, splits);
    let res = [];
    all.forEach(o => {
      res.push(o.passthrough);
      res.push(o.before);
      res.push(o.match);
      res.push(o.after);
    });
    res = res.filter(p => p);
    res = res.map(p => addIds$1(p, this));
    return this.update(res)
  };

  // [before], [match after]
  methods$f.splitBefore = function (m, group) {
    const { splitAll } = this.methods.one.pointer;
    let splits = getDoc$3(m, this, group).fullPointer;
    let all = splitAll(this.fullPointer, splits);
    let res = [];
    all.forEach(o => {
      res.push(o.passthrough);
      res.push(o.before);
      if (o.match && o.after) {
        // console.log(combine(o.match, o.after))
        res.push(combine(o.match, o.after));
      } else {
        res.push(o.match);
        res.push(o.after);
      }
    });
    res = res.filter(p => p);
    res = res.map(p => addIds$1(p, this));
    return this.update(res)
  };

  // [before match], [after]
  methods$f.splitAfter = function (m, group) {
    const { splitAll } = this.methods.one.pointer;
    let splits = getDoc$3(m, this, group).fullPointer;
    let all = splitAll(this.fullPointer, splits);
    let res = [];
    all.forEach(o => {
      res.push(o.passthrough);
      if (o.before && o.match) {
        res.push(combine(o.before, o.match));
      } else {
        res.push(o.before);
        res.push(o.match);
      }
      res.push(o.after);
    });
    res = res.filter(p => p);
    res = res.map(p => addIds$1(p, this));
    return this.update(res)
  };
  methods$f.split = methods$f.splitAfter;

  var split$1 = methods$f;

  const methods$e = Object.assign({}, match$3, lookaround, split$1);
  // aliases
  methods$e.lookBehind = methods$e.before;
  methods$e.lookBefore = methods$e.before;

  methods$e.lookAhead = methods$e.after;
  methods$e.lookAfter = methods$e.after;

  methods$e.notIf = methods$e.ifNo;
  const matchAPI = function (View) {
    Object.assign(View.prototype, methods$e);
  };
  var api$a = matchAPI;

  // match  'foo /yes/' and not 'foo/no/bar'
  const bySlashes = /(?:^|\s)([![^]*(?:<[^<]*>)?\/.*?[^\\/]\/[?\]+*$~]*)(?:\s|$)/;
  // match '(yes) but not foo(no)bar'
  const byParentheses = /([!~[^]*(?:<[^<]*>)?\([^)]+[^\\)]\)[?\]+*$~]*)(?:\s|$)/;
  // okay
  const byWord = / /g;

  const isBlock = str => {
    return /^[![^]*(<[^<]*>)?\(/.test(str) && /\)[?\]+*$~]*$/.test(str)
  };
  const isReg = str => {
    return /^[![^]*(<[^<]*>)?\//.test(str) && /\/[?\]+*$~]*$/.test(str)
  };

  const cleanUp = function (arr) {
    arr = arr.map(str => str.trim());
    arr = arr.filter(str => str);
    return arr
  };

  const parseBlocks = function (txt) {
    // parse by /regex/ first
    let arr = txt.split(bySlashes);
    let res = [];
    // parse by (blocks), next
    arr.forEach(str => {
      if (isReg(str)) {
        res.push(str);
        return
      }
      res = res.concat(str.split(byParentheses));
    });
    res = cleanUp(res);
    // split by spaces, now
    let final = [];
    res.forEach(str => {
      if (isBlock(str)) {
        final.push(str);
      } else if (isReg(str)) {
        final.push(str);
      } else {
        final = final.concat(str.split(byWord));
      }
    });
    final = cleanUp(final);
    return final
  };
  var parseBlocks$1 = parseBlocks;

  const hasMinMax = /\{([0-9]+)?(, *[0-9]*)?\}/;
  const andSign = /&&/;
  // const hasDash = /\p{Letter}[-–—]\p{Letter}/u
  const captureName = new RegExp(/^<\s*(\S+)\s*>/);
  /* break-down a match expression into this:
  {
    word:'',
    tag:'',
    regex:'',

    start:false,
    end:false,
    negative:false,
    anything:false,
    greedy:false,
    optional:false,

    named:'',
    choices:[],
  }
  */
  const titleCase = str => str.charAt(0).toUpperCase() + str.substring(1);
  const end = (str) => str.charAt(str.length - 1);
  const start = (str) => str.charAt(0);
  const stripStart = (str) => str.substring(1);
  const stripEnd = (str) => str.substring(0, str.length - 1);

  const stripBoth = function (str) {
    str = stripStart(str);
    str = stripEnd(str);
    return str
  };
  //
  const parseToken = function (w, opts) {
    let obj = {};
    //collect any flags (do it twice)
    for (let i = 0; i < 2; i += 1) {
      //end-flag
      if (end(w) === '$') {
        obj.end = true;
        w = stripEnd(w);
      }
      //front-flag
      if (start(w) === '^') {
        obj.start = true;
        w = stripStart(w);
      }
      //capture group (this one can span multiple-terms)
      if (start(w) === '[' || end(w) === ']') {
        obj.group = null;
        if (start(w) === '[') {
          obj.groupStart = true;
        }
        if (end(w) === ']') {
          obj.groupEnd = true;
        }
        w = w.replace(/^\[/, '');
        w = w.replace(/\]$/, '');
        // Use capture group name
        if (start(w) === '<') {
          const res = captureName.exec(w);
          if (res.length >= 2) {
            obj.group = res[1];
            w = w.replace(res[0], '');
          }
        }
      }
      //back-flags
      if (end(w) === '+') {
        obj.greedy = true;
        w = stripEnd(w);
      }
      if (w !== '*' && end(w) === '*' && w !== '\\*') {
        obj.greedy = true;
        w = stripEnd(w);
      }
      if (end(w) === '?') {
        obj.optional = true;
        w = stripEnd(w);
      }
      if (start(w) === '!') {
        obj.negative = true;
        // obj.optional = true
        w = stripStart(w);
      }
      //soft-match
      if (start(w) === '~' && end(w) === '~' && w.length > 2) {
        w = stripBoth(w);
        obj.fuzzy = true;
        obj.min = opts.fuzzy || 0.85;
        if (/\(/.test(w) === false) {
          obj.word = w;
          return obj
        }
      }

      //wrapped-flags
      if (start(w) === '(' && end(w) === ')') {
        // support (one && two)
        if (andSign.test(w)) {
          obj.choices = w.split(andSign);
          obj.operator = 'and';
        } else {
          obj.choices = w.split('|');
          obj.operator = 'or';
        }
        //remove '(' and ')'
        obj.choices[0] = stripStart(obj.choices[0]);
        let last = obj.choices.length - 1;
        obj.choices[last] = stripEnd(obj.choices[last]);
        // clean up the results
        obj.choices = obj.choices.map(s => s.trim());
        obj.choices = obj.choices.filter(s => s);
        //recursion alert!
        obj.choices = obj.choices.map(str => {
          return str.split(/ /g).map(s => parseToken(s, opts))
        });
        w = '';
      }
      //regex
      if (start(w) === '/' && end(w) === '/') {
        w = stripBoth(w);
        if (opts.caseSensitive) {
          obj.use = 'text';
        }
        obj.regex = new RegExp(w); //potential vuln - security/detect-non-literal-regexp
        return obj
      }

      //root/sense overloaded
      if (start(w) === '{' && end(w) === '}') {
        w = stripBoth(w);
        // obj.sense = w
        obj.root = w;
        if (/\//.test(w)) {
          let split = obj.root.split(/\//);
          obj.root = split[0];
          obj.pos = split[1];
          if (obj.pos === 'adj') {
            obj.pos = 'Adjective';
          }
          // titlecase
          obj.pos = obj.pos.charAt(0).toUpperCase() + obj.pos.substr(1).toLowerCase();
          // add sense-number too
          if (split[2] !== undefined) {
            obj.sense = split[2];
          }
        }
        return obj
      }
      //chunks
      if (start(w) === '<' && end(w) === '>') {
        w = stripBoth(w);
        obj.chunk = titleCase(w);
        obj.greedy = true;
        return obj
      }
      if (start(w) === '%' && end(w) === '%') {
        w = stripBoth(w);
        obj.switch = w;
        return obj
      }
    }
    // support foo{1,9}
    if (hasMinMax.test(w) === true) {
      w = w.replace(hasMinMax, (_a, b, c) => {
        if (c === undefined) {
          // '{3}'	Exactly three times
          obj.min = Number(b);
          obj.max = Number(b);
        } else {
          c = c.replace(/, */, '');
          if (b === undefined) {
            // '{,9}' implied zero min
            obj.min = 0;
            obj.max = Number(c);
          } else {
            // '{2,4}' Two to four times
            obj.min = Number(b);
            // '{3,}' Three or more times
            obj.max = Number(c || 999);
          }
        }
        // use same method as '+'
        obj.greedy = true;
        // 0 as min means the same as '?'
        if (!obj.min) {
          obj.optional = true;
        }
        return ''
      });
    }
    //do the actual token content
    if (start(w) === '#') {
      obj.tag = stripStart(w);
      obj.tag = titleCase(obj.tag);
      return obj
    }
    //dynamic function on a term object
    if (start(w) === '@') {
      obj.method = stripStart(w);
      return obj
    }
    if (w === '.') {
      obj.anything = true;
      return obj
    }
    //support alone-astrix
    if (w === '*') {
      obj.anything = true;
      obj.greedy = true;
      obj.optional = true;
      return obj
    }
    if (w) {
      //somehow handle encoded-chars?
      w = w.replace('\\*', '*');
      w = w.replace('\\.', '.');
      if (opts.caseSensitive) {
        obj.use = 'text';
      } else {
        w = w.toLowerCase();
      }
      obj.word = w;
    }
    return obj
  };
  var parseToken$1 = parseToken;

  const hasDash$2 = /[a-z0-9][-–—][a-z]/i;

  // match 're-do' -> ['re','do']
  const splitHyphens$1 = function (regs, world) {
    let prefixes = world.model.one.prefixes;
    for (let i = regs.length - 1; i >= 0; i -= 1) {
      let reg = regs[i];
      if (reg.word && hasDash$2.test(reg.word)) {
        let words = reg.word.split(/[-–—]/g);
        // don't split 're-cycle', etc
        if (prefixes.hasOwnProperty(words[0])) {
          continue
        }
        words = words.filter(w => w).reverse();
        regs.splice(i, 1);
        words.forEach(w => {
          let obj = Object.assign({}, reg);
          obj.word = w;
          regs.splice(i, 0, obj);
        });
      }
    }
    return regs
  };
  var splitHyphens$2 = splitHyphens$1;

  // add all conjugations of this verb
  const addVerbs = function (token, world) {
    let { all } = world.methods.two.transform.verb || {};
    let str = token.root;
    // if (toInfinitive) {
    //   str = toInfinitive(str, world.model)
    // }
    if (!all) {
      return []
    }
    return all(str, world.model)
  };

  // add all inflections of this noun
  const addNoun = function (token, world) {
    let { all } = world.methods.two.transform.noun || {};
    if (!all) {
      return [token.root]
    }
    return all(token.root, world.model)
  };

  // add all inflections of this adjective
  const addAdjective$1 = function (token, world) {
    let { all } = world.methods.two.transform.adjective || {};
    if (!all) {
      return [token.root]
    }
    return all(token.root, world.model)
  };

  // turn '{walk}' into 'walking', 'walked', etc
  const inflectRoot = function (regs, world) {
    // do we have compromise/two?
    regs = regs.map(token => {
      // a reg to convert '{foo}'
      if (token.root) {
        // check if compromise/two is loaded
        if (world.methods.two && world.methods.two.transform) {
          let choices = [];
          // have explicitly set from POS - '{sweet/adjective}'
          if (token.pos) {
            if (token.pos === 'Verb') {
              choices = choices.concat(addVerbs(token, world));
            } else if (token.pos === 'Noun') {
              choices = choices.concat(addNoun(token, world));
            } else if (token.pos === 'Adjective') {
              choices = choices.concat(addAdjective$1(token, world));
            }
          } else {
            // do verb/noun/adj by default
            choices = choices.concat(addVerbs(token, world));
            choices = choices.concat(addNoun(token, world));
            choices = choices.concat(addAdjective$1(token, world));
          }
          choices = choices.filter(str => str);
          if (choices.length > 0) {
            token.operator = 'or';
            token.fastOr = new Set(choices);
          }
        } else {
          // if no compromise/two, drop down into 'machine' lookup
          token.machine = token.root;
          delete token.id;
          delete token.root;
        }
      }
      return token
    });

    return regs
  };
  var inflectRoot$1 = inflectRoot;

  // name any [unnamed] capture-groups with a number
  const nameGroups = function (regs) {
    let index = 0;
    let inGroup = null;
    //'fill in' capture groups between start-end
    for (let i = 0; i < regs.length; i++) {
      const token = regs[i];
      if (token.groupStart === true) {
        inGroup = token.group;
        if (inGroup === null) {
          inGroup = String(index);
          index += 1;
        }
      }
      if (inGroup !== null) {
        token.group = inGroup;
      }
      if (token.groupEnd === true) {
        inGroup = null;
      }
    }
    return regs
  };

  // optimize an 'or' lookup, when the (a|b|c) list is simple or multi-word
  const doFastOrMode = function (tokens) {
    return tokens.map(token => {
      if (token.choices !== undefined) {
        // make sure it's an OR
        if (token.operator !== 'or') {
          return token
        }
        if (token.fuzzy === true) {
          return token
        }
        // are they all straight-up words? then optimize them.
        let shouldPack = token.choices.every(block => {
          if (block.length !== 1) {
            return false
          }
          let reg = block[0];
          // ~fuzzy~ words need more care
          if (reg.fuzzy === true) {
            return false
          }
          // ^ and $ get lost in fastOr
          if (reg.start || reg.end) {
            return false
          }
          if (reg.word !== undefined && reg.negative !== true && reg.optional !== true && reg.method !== true) {
            return true //reg is simple-enough
          }
          return false
        });
        if (shouldPack === true) {
          token.fastOr = new Set();
          token.choices.forEach(block => {
            token.fastOr.add(block[0].word);
          });
          delete token.choices;
        }
      }
      return token
    })
  };

  // support ~(a|b|c)~
  const fuzzyOr = function (regs) {
    return regs.map(reg => {
      if (reg.fuzzy && reg.choices) {
        // pass fuzzy-data to each OR choice
        reg.choices.forEach(r => {
          if (r.length === 1 && r[0].word) {
            r[0].fuzzy = true;
            r[0].min = reg.min;
          }
        });
      }
      return reg
    })
  };

  const postProcess = function (regs) {
    // ensure all capture groups names are filled between start and end
    regs = nameGroups(regs);
    // convert 'choices' format to 'fastOr' format
    regs = doFastOrMode(regs);
    // support ~(foo|bar)~
    regs = fuzzyOr(regs);
    return regs
  };
  var postProcess$1 = postProcess;

  /** parse a match-syntax string into json */
  const syntax = function (input, opts, world) {
    // fail-fast
    if (input === null || input === undefined || input === '') {
      return []
    }
    opts = opts || {};
    if (typeof input === 'number') {
      input = String(input); //go for it?
    }
    let tokens = parseBlocks$1(input);
    //turn them into objects
    tokens = tokens.map(str => parseToken$1(str, opts));
    // '~re-do~'
    tokens = splitHyphens$2(tokens, world);
    // '{walk}'
    tokens = inflectRoot$1(tokens, world);
    //clean up anything weird
    tokens = postProcess$1(tokens);
    // console.log(tokens)
    return tokens
  };
  var parseMatch = syntax;

  const anyIntersection = function (setA, setB) {
    for (let elem of setB) {
      if (setA.has(elem)) {
        return true
      }
    }
    return false
  };
  // check words/tags against our cache
  const failFast = function (regs, cache) {
    for (let i = 0; i < regs.length; i += 1) {
      let reg = regs[i];
      if (reg.optional === true || reg.negative === true || reg.fuzzy === true) {
        continue
      }
      // is the word missing from the cache?
      if (reg.word !== undefined && cache.has(reg.word) === false) {
        return true
      }
      // is the tag missing?
      if (reg.tag !== undefined && cache.has('#' + reg.tag) === false) {
        return true
      }
      // perform a speedup for fast-or
      if (reg.fastOr && anyIntersection(reg.fastOr, cache) === false) {
        return false
      }
    }
    return false
  };
  var failFast$1 = failFast;

  // fuzzy-match (damerau-levenshtein)
  // Based on  tad-lispy /node-damerau-levenshtein
  // https://github.com/tad-lispy/node-damerau-levenshtein/blob/master/index.js
  // count steps (insertions, deletions, substitutions, or transpositions)
  const editDistance = function (strA, strB) {
    let aLength = strA.length,
      bLength = strB.length;
    // fail-fast
    if (aLength === 0) {
      return bLength
    }
    if (bLength === 0) {
      return aLength
    }
    // If the limit is not defined it will be calculate from this and that args.
    let limit = (bLength > aLength ? bLength : aLength) + 1;
    if (Math.abs(aLength - bLength) > (limit || 100)) {
      return limit || 100
    }
    // init the array
    let matrix = [];
    for (let i = 0; i < limit; i++) {
      matrix[i] = [i];
      matrix[i].length = limit;
    }
    for (let i = 0; i < limit; i++) {
      matrix[0][i] = i;
    }
    // Calculate matrix.
    let j, a_index, b_index, cost, min, t;
    for (let i = 1; i <= aLength; ++i) {
      a_index = strA[i - 1];
      for (j = 1; j <= bLength; ++j) {
        // Check the jagged distance total so far
        if (i === j && matrix[i][j] > 4) {
          return aLength
        }
        b_index = strB[j - 1];
        cost = a_index === b_index ? 0 : 1; // Step 5
        // Calculate the minimum (much faster than Math.min(...)).
        min = matrix[i - 1][j] + 1; // Deletion.
        if ((t = matrix[i][j - 1] + 1) < min) min = t; // Insertion.
        if ((t = matrix[i - 1][j - 1] + cost) < min) min = t; // Substitution.
        // Update matrix.
        let shouldUpdate =
          i > 1 && j > 1 && a_index === strB[j - 2] && strA[i - 2] === b_index && (t = matrix[i - 2][j - 2] + cost) < min;
        if (shouldUpdate) {
          matrix[i][j] = t;
        } else {
          matrix[i][j] = min;
        }
      }
    }
    // return number of steps
    return matrix[aLength][bLength]
  };
  // score similarity by from 0-1 (steps/length)
  const fuzzyMatch = function (strA, strB, minLength = 3) {
    if (strA === strB) {
      return 1
    }
    //don't even bother on tiny strings
    if (strA.length < minLength || strB.length < minLength) {
      return 0
    }
    const steps = editDistance(strA, strB);
    let length = Math.max(strA.length, strB.length);
    let relative = length === 0 ? 0 : steps / length;
    let similarity = 1 - relative;
    return similarity
  };
  var fuzzy = fuzzyMatch;

  // these methods are called with '@hasComma' in the match syntax
  // various unicode quotation-mark formats
  const startQuote =
    /([\u0022\uFF02\u0027\u201C\u2018\u201F\u201B\u201E\u2E42\u201A\u00AB\u2039\u2035\u2036\u2037\u301D\u0060\u301F])/;

  const endQuote = /([\u0022\uFF02\u0027\u201D\u2019\u00BB\u203A\u2032\u2033\u2034\u301E\u00B4])/;

  const hasHyphen$1 = /^[-–—]$/;
  const hasDash$1 = / [-–—]{1,3} /;

  /** search the term's 'post' punctuation  */
  const hasPost = (term, punct) => term.post.indexOf(punct) !== -1;
  /** search the term's 'pre' punctuation  */
  const hasPre = (term, punct) => term.pre.indexOf(punct) !== -1;

  const methods$d = {
    /** does it have a quotation symbol?  */
    hasQuote: term => startQuote.test(term.pre) || endQuote.test(term.post),
    /** does it have a comma?  */
    hasComma: term => hasPost(term, ','),
    /** does it end in a period? */
    hasPeriod: term => hasPost(term, '.') === true && hasPost(term, '...') === false,
    /** does it end in an exclamation */
    hasExclamation: term => hasPost(term, '!'),
    /** does it end with a question mark? */
    hasQuestionMark: term => hasPost(term, '?') || hasPost(term, '¿'),
    /** is there a ... at the end? */
    hasEllipses: term => hasPost(term, '..') || hasPost(term, '…') || hasPre(term, '..') || hasPre(term, '…'),
    /** is there a semicolon after term word? */
    hasSemicolon: term => hasPost(term, ';'),
    /** is there a colon after term word? */
    hasColon: term => hasPost(term, ':'),
    /** is there a slash '/' in term word? */
    hasSlash: term => /\//.test(term.text),
    /** a hyphen connects two words like-term */
    hasHyphen: term => hasHyphen$1.test(term.post) || hasHyphen$1.test(term.pre),
    /** a dash separates words - like that */
    hasDash: term => hasDash$1.test(term.post) || hasDash$1.test(term.pre),
    /** is it multiple words combinded */
    hasContraction: term => Boolean(term.implicit),
    /** is it an acronym */
    isAcronym: term => term.tags.has('Acronym'),
    /** does it have any tags */
    isKnown: term => term.tags.size > 0,
    /** uppercase first letter, then a lowercase */
    isTitleCase: term => /^\p{Lu}[a-z'\u00C0-\u00FF]/u.test(term.text),
    /** uppercase all letters */
    isUpperCase: term => /^\p{Lu}+$/u.test(term.text),
  };
  // aliases
  methods$d.hasQuotation = methods$d.hasQuote;

  var termMethods = methods$d;

  //declare it up here
  let wrapMatch = function () { };
  /** ignore optional/greedy logic, straight-up term match*/
  const doesMatch$1 = function (term, reg, index, length) {
    // support '.'
    if (reg.anything === true) {
      return true
    }
    // support '^' (in parentheses)
    if (reg.start === true && index !== 0) {
      return false
    }
    // support '$' (in parentheses)
    if (reg.end === true && index !== length - 1) {
      return false
    }
    // match an id
    if (reg.id !== undefined && reg.id === term.id) {
      return true
    }
    //support a text match
    if (reg.word !== undefined) {
      // check case-sensitivity, etc
      if (reg.use) {
        return reg.word === term[reg.use]
      }
      //match contractions, machine-form
      if (term.machine !== null && term.machine === reg.word) {
        return true
      }
      // term aliases for slashes and things
      if (term.alias !== undefined && term.alias.hasOwnProperty(reg.word)) {
        return true
      }
      // support ~ fuzzy match
      if (reg.fuzzy === true) {
        if (reg.word === term.root) {
          return true
        }
        let score = fuzzy(reg.word, term.normal);
        if (score >= reg.min) {
          return true
        }
      }
      // match slashes and things
      if (term.alias && term.alias.some(str => str === reg.word)) {
        return true
      }
      //match either .normal or .text
      return reg.word === term.text || reg.word === term.normal
    }
    //support #Tag
    if (reg.tag !== undefined) {
      return term.tags.has(reg.tag) === true
    }
    //support @method
    if (reg.method !== undefined) {
      if (typeof termMethods[reg.method] === 'function' && termMethods[reg.method](term) === true) {
        return true
      }
      return false
    }
    //support whitespace/punctuation
    if (reg.pre !== undefined) {
      return term.pre && term.pre.includes(reg.pre)
    }
    if (reg.post !== undefined) {
      return term.post && term.post.includes(reg.post)
    }
    //support /reg/
    if (reg.regex !== undefined) {
      let str = term.normal;
      if (reg.use) {
        str = term[reg.use];
      }
      return reg.regex.test(str)
    }
    //support <chunk>
    if (reg.chunk !== undefined) {
      return term.chunk === reg.chunk
    }
    //support %Noun|Verb%
    if (reg.switch !== undefined) {
      return term.switch === reg.switch
    }
    //support {machine}
    if (reg.machine !== undefined) {
      return term.normal === reg.machine || term.machine === reg.machine || term.root === reg.machine
    }
    //support {word/sense}
    if (reg.sense !== undefined) {
      return term.sense === reg.sense
    }
    // support optimized (one|two)
    if (reg.fastOr !== undefined) {
      // {work/verb} must be a verb
      if (reg.pos && !term.tags.has(reg.pos)) {
        return null
      }
      let str = term.root || term.implicit || term.machine || term.normal;
      return reg.fastOr.has(str) || reg.fastOr.has(term.text)
    }
    //support slower (one|two)
    if (reg.choices !== undefined) {
      // try to support && operator
      if (reg.operator === 'and') {
        // must match them all
        return reg.choices.every(r => wrapMatch(term, r, index, length))
      }
      // or must match one
      return reg.choices.some(r => wrapMatch(term, r, index, length))
    }
    return false
  };
  // wrap result for !negative match logic
  wrapMatch = function (t, reg, index, length) {
    let result = doesMatch$1(t, reg, index, length);
    if (reg.negative === true) {
      return !result
    }
    return result
  };
  var matchTerm = wrapMatch;

  // for greedy checking, we no longer care about the reg.start
  // value, and leaving it can cause failures for anchored greedy
  // matches.  ditto for end-greedy matches: we need an earlier non-
  // ending match to succceed until we get to the actual end.
  const getGreedy = function (state, endReg) {
    let reg = Object.assign({}, state.regs[state.r], { start: false, end: false });
    let start = state.t;
    for (; state.t < state.terms.length; state.t += 1) {
      //stop for next-reg match
      if (endReg && matchTerm(state.terms[state.t], endReg, state.start_i + state.t, state.phrase_length)) {
        return state.t
      }
      let count = state.t - start + 1;
      // is it max-length now?
      if (reg.max !== undefined && count === reg.max) {
        return state.t
      }
      //stop here
      if (matchTerm(state.terms[state.t], reg, state.start_i + state.t, state.phrase_length) === false) {
        // is it too short?
        if (reg.min !== undefined && count < reg.min) {
          return null
        }
        return state.t
      }
    }
    return state.t
  };

  const greedyTo = function (state, nextReg) {
    let t = state.t;
    //if there's no next one, just go off the end!
    if (!nextReg) {
      return state.terms.length
    }
    //otherwise, we're looking for the next one
    for (; t < state.terms.length; t += 1) {
      if (matchTerm(state.terms[t], nextReg, state.start_i + t, state.phrase_length) === true) {
        // console.log(`greedyTo ${state.terms[t].normal}`)
        return t
      }
    }
    //guess it doesn't exist, then.
    return null
  };

  const isEndGreedy = function (reg, state) {
    if (reg.end === true && reg.greedy === true) {
      if (state.start_i + state.t < state.phrase_length - 1) {
        let tmpReg = Object.assign({}, reg, { end: false });
        if (matchTerm(state.terms[state.t], tmpReg, state.start_i + state.t, state.phrase_length) === true) {
          // console.log(`endGreedy ${state.terms[state.t].normal}`)
          return true
        }
      }
    }
    return false
  };

  const getGroup$2 = function (state, term_index) {
    if (state.groups[state.inGroup]) {
      return state.groups[state.inGroup]
    }
    state.groups[state.inGroup] = {
      start: term_index,
      length: 0,
    };
    return state.groups[state.inGroup]
  };

  //support 'unspecific greedy' .* properly
  // its logic is 'greedy until', where it's looking for the next token
  // '.+ foo' means we check for 'foo', indefinetly
  const doAstrix = function (state) {
    let { regs } = state;
    let reg = regs[state.r];

    let skipto = greedyTo(state, regs[state.r + 1]);
    //maybe we couldn't find it
    if (skipto === null || skipto === 0) {
      return null
    }
    // ensure it's long enough
    if (reg.min !== undefined && skipto - state.t < reg.min) {
      return null
    }
    // reduce it back, if it's too long
    if (reg.max !== undefined && skipto - state.t > reg.max) {
      state.t = state.t + reg.max;
      return true
    }
    // set the group result
    if (state.hasGroup === true) {
      const g = getGroup$2(state, state.t);
      g.length = skipto - state.t;
    }
    state.t = skipto;
    // log(`✓ |greedy|`)
    return true
  };
  var doAstrix$1 = doAstrix;

  const isArray$4 = function (arr) {
    return Object.prototype.toString.call(arr) === '[object Array]'
  };

  const doOrBlock$1 = function (state, skipN = 0) {
    let block = state.regs[state.r];
    let wasFound = false;
    // do each multiword sequence
    for (let c = 0; c < block.choices.length; c += 1) {
      // try to match this list of tokens
      let regs = block.choices[c];
      if (!isArray$4(regs)) {
        return false
      }
      wasFound = regs.every((cr, w_index) => {
        let extra = 0;
        let t = state.t + w_index + skipN + extra;
        if (state.terms[t] === undefined) {
          return false
        }
        let foundBlock = matchTerm(state.terms[t], cr, t + state.start_i, state.phrase_length);
        // this can be greedy - '(foo+ bar)'
        if (foundBlock === true && cr.greedy === true) {
          for (let i = 1; i < state.terms.length; i += 1) {
            let term = state.terms[t + i];
            if (term) {
              let keepGoing = matchTerm(term, cr, state.start_i + i, state.phrase_length);
              if (keepGoing === true) {
                extra += 1;
              } else {
                break
              }
            }
          }
        }
        skipN += extra;
        return foundBlock
      });
      if (wasFound) {
        skipN += regs.length;
        break
      }
    }
    // we found a match -  is it greedy though?
    if (wasFound && block.greedy === true) {
      return doOrBlock$1(state, skipN) // try it again!
    }
    return skipN
  };

  const doAndBlock$1 = function (state) {
    let longest = 0;
    // all blocks must match, and we return the greediest match
    let reg = state.regs[state.r];
    let allDidMatch = reg.choices.every(block => {
      //  for multi-word blocks, all must match
      let allWords = block.every((cr, w_index) => {
        let tryTerm = state.t + w_index;
        if (state.terms[tryTerm] === undefined) {
          return false
        }
        return matchTerm(state.terms[tryTerm], cr, tryTerm, state.phrase_length)
      });
      if (allWords === true && block.length > longest) {
        longest = block.length;
      }
      return allWords
    });
    if (allDidMatch === true) {
      // console.log(`doAndBlock ${state.terms[state.t].normal}`)
      return longest
    }
    return false
  };

  const orBlock = function (state) {
    const { regs } = state;
    let reg = regs[state.r];
    let skipNum = doOrBlock$1(state);
    // did we find a match?
    if (skipNum) {
      // handle 'not' logic
      if (reg.negative === true) {
        return null // die
      }
      // tuck in as named-group
      if (state.hasGroup === true) {
        const g = getGroup$2(state, state.t);
        g.length += skipNum;
      }
      // ensure we're at the end
      if (reg.end === true) {
        let end = state.phrase_length;
        if (state.t + state.start_i + skipNum !== end) {
          return null
        }
      }
      state.t += skipNum;
      // log(`✓ |found-or|`)
      return true
    } else if (!reg.optional) {
      return null //die
    }
    return true
  };
  var doOrBlock = orBlock;

  // '(foo && #Noun)' - require all matches on the term
  const andBlock = function (state) {
    const { regs } = state;
    let reg = regs[state.r];

    let skipNum = doAndBlock$1(state);
    if (skipNum) {
      // handle 'not' logic
      if (reg.negative === true) {
        return null // die
      }
      if (state.hasGroup === true) {
        const g = getGroup$2(state, state.t);
        g.length += skipNum;
      }
      // ensure we're at the end
      if (reg.end === true) {
        let end = state.phrase_length - 1;
        if (state.t + state.start_i !== end) {
          return null
        }
      }
      state.t += skipNum;
      // log(`✓ |found-and|`)
      return true
    } else if (!reg.optional) {
      return null //die
    }
    return true
  };
  var doAndBlock = andBlock;

  const negGreedy = function (state, reg, nextReg) {
    let skip = 0;
    for (let t = state.t; t < state.terms.length; t += 1) {
      let found = matchTerm(state.terms[t], reg, state.start_i + state.t, state.phrase_length);
      // we don't want a match, here
      if (found) {
        break//stop going
      }
      // are we doing 'greedy-to'?
      // - "!foo+ after"  should stop at 'after'
      if (nextReg) {
        found = matchTerm(state.terms[t], nextReg, state.start_i + state.t, state.phrase_length);
        if (found) {
          break
        }
      }
      skip += 1;
      // is it max-length now?
      if (reg.max !== undefined && skip === reg.max) {
        break
      }
    }
    if (skip === 0) {
      return false //dead
    }
    // did we satisfy min for !foo{min,max}
    if (reg.min && reg.min > skip) {
      return false//dead
    }
    state.t += skip;
    // state.r += 1
    return true
  };

  var negGreedy$1 = negGreedy;

  // '!foo' should match anything that isn't 'foo'
  // if it matches, return false
  const doNegative = function (state) {
    const { regs } = state;
    let reg = regs[state.r];

    // match *anything* but this term
    let tmpReg = Object.assign({}, reg);
    tmpReg.negative = false; // try removing it

    // found it? if so, we die here
    let found = matchTerm(state.terms[state.t], tmpReg, state.start_i + state.t, state.phrase_length);
    if (found) {
      return false//bye
    }
    // should we skip the term too?
    if (reg.optional) {
      // "before after" - "before !foo? after"
      // does the next reg match the this term?
      let nextReg = regs[state.r + 1];
      if (nextReg) {
        let fNext = matchTerm(state.terms[state.t], nextReg, state.start_i + state.t, state.phrase_length);
        if (fNext) {
          state.r += 1;
        } else if (nextReg.optional && regs[state.r + 2]) {
          // ugh. ok,
          // support "!foo? extra? need"
          // but don't scan ahead more than that.
          let fNext2 = matchTerm(state.terms[state.t], regs[state.r + 2], state.start_i + state.t, state.phrase_length);
          if (fNext2) {
            state.r += 2;
          }
        }
      }
    }
    // negative greedy - !foo+  - super hard!
    if (reg.greedy) {
      return negGreedy$1(state, tmpReg, regs[state.r + 1])
    }
    state.t += 1;
    return true
  };
  var doNegative$1 = doNegative;

  // 'foo? foo' matches are tricky.
  const foundOptional = function (state) {
    const { regs } = state;
    let reg = regs[state.r];
    let term = state.terms[state.t];
    // does the next reg match it too?
    let nextRegMatched = matchTerm(term, regs[state.r + 1], state.start_i + state.t, state.phrase_length);
    if (reg.negative || nextRegMatched) {
      // but does the next reg match the next term??
      // only skip if it doesn't
      let nextTerm = state.terms[state.t + 1];
      if (!nextTerm || !matchTerm(nextTerm, regs[state.r + 1], state.start_i + state.t, state.phrase_length)) {
        state.r += 1;
      }
    }
  };

  var foundOptional$1 = foundOptional;

  // keep 'foo+' or 'foo*' going..
  const greedyMatch = function (state) {
    const { regs, phrase_length } = state;
    let reg = regs[state.r];
    state.t = getGreedy(state, regs[state.r + 1]);
    if (state.t === null) {
      return null //greedy was too short
    }
    // foo{2,4} - has a greed-minimum
    if (reg.min && reg.min > state.t) {
      return null //greedy was too short
    }
    // 'foo+$' - if also an end-anchor, ensure we really reached the end
    if (reg.end === true && state.start_i + state.t !== phrase_length) {
      return null //greedy didn't reach the end
    }
    return true
  };
  var greedyMatch$1 = greedyMatch;

  // for: ['we', 'have']
  // a match for "we have" should work as normal
  // but matching "we've" should skip over implict terms
  const contractionSkip = function (state) {
    let term = state.terms[state.t];
    let reg = state.regs[state.r];
    // did we match the first part of a contraction?
    if (term.implicit && state.terms[state.t + 1]) {
      let nextTerm = state.terms[state.t + 1];
      // ensure next word is implicit
      if (!nextTerm.implicit) {
        return
      }
      // we matched "we've" - skip-over [we, have]
      if (reg.word === term.normal) {
        state.t += 1;
      }
      // also skip for @hasContraction
      if (reg.method === 'hasContraction') {
        state.t += 1;
      }
    }
  };
  var contractionSkip$1 = contractionSkip;

  // '[foo]' should also be logged as a group
  const setGroup = function (state, startAt) {
    let reg = state.regs[state.r];
    // Get or create capture group
    const g = getGroup$2(state, startAt);
    // Update group - add greedy or increment length
    if (state.t > 1 && reg.greedy) {
      g.length += state.t - startAt;
    } else {
      g.length++;
    }
  };

  // when a reg matches a term
  const simpleMatch = function (state) {
    const { regs } = state;
    let reg = regs[state.r];
    let term = state.terms[state.t];
    let startAt = state.t;
    // if it's a negative optional match... :0
    if (reg.optional && regs[state.r + 1] && reg.negative) {
      return true
    }
    // okay, it was a match, but if it's optional too,
    // we should check the next reg too, to skip it?
    if (reg.optional && regs[state.r + 1]) {
      foundOptional$1(state);
    }
    // Contraction skip:
    // did we match the first part of a contraction?
    if (term.implicit && state.terms[state.t + 1]) {
      contractionSkip$1(state);
    }
    //advance to the next term!
    state.t += 1;
    //check any ending '$' flags
    //if this isn't the last term, refuse the match
    if (reg.end === true && state.t !== state.terms.length && reg.greedy !== true) {
      return null //die
    }
    // keep 'foo+' going...
    if (reg.greedy === true) {
      let alive = greedyMatch$1(state);
      if (!alive) {
        return null
      }
    }
    // log '[foo]' as a group
    if (state.hasGroup === true) {
      setGroup(state, startAt);
    }
    return true
  };
  var simpleMatch$1 = simpleMatch;

  // i formally apologize for how complicated this is.

  /** 
   * try a sequence of match tokens ('regs') 
   * on a sequence of terms, 
   * starting at this certain term.
   */
  const tryHere = function (terms, regs, start_i, phrase_length) {
    // console.log(`\n\n:start: '${terms[0].text}':`)
    if (terms.length === 0 || regs.length === 0) {
      return null
    }
    // all the variables that matter
    let state = {
      t: 0,
      terms: terms,
      r: 0,
      regs: regs,
      groups: {},
      start_i: start_i,
      phrase_length: phrase_length,
      inGroup: null,
    };

    // we must satisfy every token in 'regs'
    // if we get to the end, we have a match.
    for (; state.r < regs.length; state.r += 1) {
      let reg = regs[state.r];
      // Check if this reg has a named capture group
      state.hasGroup = Boolean(reg.group);
      // Reuse previous capture group if same
      if (state.hasGroup === true) {
        state.inGroup = reg.group;
      } else {
        state.inGroup = null;
      }
      //have we run-out of terms?
      if (!state.terms[state.t]) {
        //are all remaining regs optional or negative?
        const alive = regs.slice(state.r).some(remain => !remain.optional);
        if (alive === false) {
          break //done!
        }
        return null // die
      }
      // support 'unspecific greedy' .* properly
      if (reg.anything === true && reg.greedy === true) {
        let alive = doAstrix$1(state);
        if (!alive) {
          return null
        }
        continue
      }
      // slow-OR - multi-word OR (a|b|foo bar)
      if (reg.choices !== undefined && reg.operator === 'or') {
        let alive = doOrBlock(state);
        if (!alive) {
          return null
        }
        continue
      }
      // slow-AND - multi-word AND (#Noun && foo) blocks
      if (reg.choices !== undefined && reg.operator === 'and') {
        let alive = doAndBlock(state);
        if (!alive) {
          return null
        }
        continue
      }
      // support '.' as any-single
      if (reg.anything === true) {
        // '!.' negative anything should insta-fail
        if (reg.negative && reg.anything) {
          return null
        }
        let alive = simpleMatch$1(state);
        if (!alive) {
          return null
        }
        continue
      }
      // support 'foo*$' until the end
      if (isEndGreedy(reg, state) === true) {
        let alive = simpleMatch$1(state);
        if (!alive) {
          return null
        }
        continue
      }
      // ok, it doesn't match - but maybe it wasn't *supposed* to?
      if (reg.negative) {
        // we want *anything* but this term
        let alive = doNegative$1(state);
        if (!alive) {
          return null
        }
        continue
      }
      // ok, finally test the term-reg
      // console.log('   - ' + state.terms[state.t].text)
      let hasMatch = matchTerm(state.terms[state.t], reg, state.start_i + state.t, state.phrase_length);
      if (hasMatch === true) {
        let alive = simpleMatch$1(state);
        if (!alive) {
          return null
        }
        continue
      }
      // console.log('=-=-=-= here -=-=-=-')

      //ok who cares, keep going
      if (reg.optional === true) {
        continue
      }

      // finally, we die
      return null
    }
    //return our results, as pointers
    let pntr = [null, start_i, state.t + start_i];
    if (pntr[1] === pntr[2]) {
      return null //found 0 terms
    }
    let groups = {};
    Object.keys(state.groups).forEach(k => {
      let o = state.groups[k];
      let start = start_i + o.start;
      groups[k] = [null, start, start + o.length];
    });
    return { pointer: pntr, groups: groups }
  };
  var fromHere = tryHere;

  // support returning a subset of a match
  // like 'foo [bar] baz' -> bar
  const getGroup = function (res, group) {
    let ptrs = [];
    let byGroup = {};
    if (res.length === 0) {
      return { ptrs, byGroup }
    }
    if (typeof group === 'number') {
      group = String(group);
    }
    if (group) {
      res.forEach(r => {
        if (r.groups[group]) {
          ptrs.push(r.groups[group]);
        }
      });
    } else {
      res.forEach(r => {
        ptrs.push(r.pointer);
        Object.keys(r.groups).forEach(k => {
          byGroup[k] = byGroup[k] || [];
          byGroup[k].push(r.groups[k]);
        });
      });
    }
    return { ptrs, byGroup }
  };
  var getGroup$1 = getGroup;

  const notIf = function (results, not, docs) {
    results = results.filter(res => {
      let [n, start, end] = res.pointer;
      let terms = docs[n].slice(start, end);
      for (let i = 0; i < terms.length; i += 1) {
        let slice = terms.slice(i);
        let found = fromHere(slice, not, i, terms.length);
        if (found !== null) {
          return false
        }
      }
      return true
    });
    return results
  };

  var notIf$1 = notIf;

  // make proper pointers
  const addSentence = function (res, n) {
    res.pointer[0] = n;
    Object.keys(res.groups).forEach(k => {
      res.groups[k][0] = n;
    });
    return res
  };

  const handleStart = function (terms, regs, n) {
    let res = fromHere(terms, regs, 0, terms.length);
    if (res) {
      res = addSentence(res, n);
      return res //getGroup([res], group)
    }
    return null
  };

  // ok, here we go.
  const runMatch$2 = function (docs, todo, cache) {
    cache = cache || [];
    let { regs, group, justOne } = todo;
    let results = [];
    if (!regs || regs.length === 0) {
      return { ptrs: [], byGroup: {} }
    }

    const minLength = regs.filter(r => r.optional !== true && r.negative !== true).length;
    docs: for (let n = 0; n < docs.length; n += 1) {
      let terms = docs[n];
      // let index = terms[0].index || []
      // can we skip this sentence?
      if (cache[n] && failFast$1(regs, cache[n])) {
        continue
      }
      // ^start regs only run once, per phrase
      if (regs[0].start === true) {
        let foundStart = handleStart(terms, regs, n);
        if (foundStart) {
          results.push(foundStart);
        }
        continue
      }
      //ok, try starting the match now from every term
      for (let i = 0; i < terms.length; i += 1) {
        let slice = terms.slice(i);
        // ensure it's long-enough
        if (slice.length < minLength) {
          break
        }
        let res = fromHere(slice, regs, i, terms.length);
        // did we find a result?
        if (res) {
          // res = addSentence(res, index[0])
          res = addSentence(res, n);
          results.push(res);
          // should we stop here?
          if (justOne === true) {
            break docs
          }
          // skip ahead, over these results
          let end = res.pointer[2];
          if (Math.abs(end - 1) > i) {
            i = Math.abs(end - 1);
          }
        }
      }
    }
    // ensure any end-results ($) match until the last term
    if (regs[regs.length - 1].end === true) {
      results = results.filter(res => {
        let n = res.pointer[0];
        return docs[n].length === res.pointer[2]
      });
    }
    if (todo.notIf) {
      results = notIf$1(results, todo.notIf, docs);
    }
    // grab the requested group
    results = getGroup$1(results, group);
    // add ids to pointers
    results.ptrs.forEach(ptr => {
      let [n, start, end] = ptr;
      ptr[3] = docs[n][start].id;//start-id
      ptr[4] = docs[n][end - 1].id;//end-id
    });
    return results
  };

  var match$1 = runMatch$2;

  const methods$b = {
    one: {
      termMethods,
      parseMatch,
      match: match$1,
    },
  };

  var methods$c = methods$b;

  var lib$3 = {
    /** pre-parse any match statements */
    parseMatch: function (str, opts) {
      const world = this.world();
      let killUnicode = world.methods.one.killUnicode;
      if (killUnicode) {
        str = killUnicode(str, world);
      }
      return world.methods.one.parseMatch(str, opts, world)
    }
  };

  var match = {
    api: api$a,
    methods: methods$c,
    lib: lib$3,
  };

  const isClass = /^\../;
  const isId = /^#./;

  const escapeXml = (str) => {
    str = str.replace(/&/g, '&amp;');
    str = str.replace(/</g, '&lt;');
    str = str.replace(/>/g, '&gt;');
    str = str.replace(/"/g, '&quot;');
    str = str.replace(/'/g, '&apos;');
    return str
  };

  // interpret .class, #id, tagName
  const toTag = function (k) {
    let start = '';
    let end = '</span>';
    k = escapeXml(k);
    if (isClass.test(k)) {
      start = `<span class="${k.replace(/^\./, '')}"`;
    } else if (isId.test(k)) {
      start = `<span id="${k.replace(/^#/, '')}"`;
    } else {
      start = `<${k}`;
      end = `</${k}>`;
    }
    start += '>';
    return { start, end }
  };

  const getIndex = function (doc, obj) {
    let starts = {};
    let ends = {};
    Object.keys(obj).forEach(k => {
      let res = obj[k];
      let tag = toTag(k);
      if (typeof res === 'string') {
        res = doc.match(res);
      }
      res.docs.forEach(terms => {
        // don't highlight implicit terms
        if (terms.every(t => t.implicit)) {
          return
        }
        let a = terms[0].id;
        starts[a] = starts[a] || [];
        starts[a].push(tag.start);
        let b = terms[terms.length - 1].id;
        ends[b] = ends[b] || [];
        ends[b].push(tag.end);
      });
    });
    return { starts, ends }
  };

  const html = function (obj) {
    // index ids to highlight
    let { starts, ends } = getIndex(this, obj);
    // create the text output
    let out = '';
    this.docs.forEach(terms => {
      for (let i = 0; i < terms.length; i += 1) {
        let t = terms[i];
        // do a span tag
        if (starts.hasOwnProperty(t.id)) {
          out += starts[t.id].join('');
        }
        out += t.pre || '' + t.text || '';
        if (ends.hasOwnProperty(t.id)) {
          out += ends[t.id].join('');
        }
        out += t.post || '';
      }
    });
    return out
  };
  var html$1 = { html };

  const trimEnd = /[,:;)\]*.?~!\u0022\uFF02\u201D\u2019\u00BB\u203A\u2032\u2033\u2034\u301E\u00B4—-]+$/;
  const trimStart =
    /^[(['"*~\uFF02\u201C\u2018\u201F\u201B\u201E\u2E42\u201A\u00AB\u2039\u2035\u2036\u2037\u301D\u0060\u301F]+/;

  const punctToKill = /[,:;)('"\u201D\]]/;
  const isHyphen = /^[-–—]$/;
  const hasSpace = / /;

  const textFromTerms = function (terms, opts, keepSpace = true) {
    let txt = '';
    terms.forEach((t) => {
      let pre = t.pre || '';
      let post = t.post || '';
      if (opts.punctuation === 'some') {
        pre = pre.replace(trimStart, '');
        // replace a hyphen with a space
        if (isHyphen.test(post)) {
          post = ' ';
        }
        post = post.replace(punctToKill, '');
        // cleanup exclamations
        post = post.replace(/\?!+/, '?');
        post = post.replace(/!+/, '!');
        post = post.replace(/\?+/, '?');
        // kill elipses
        post = post.replace(/\.{2,}/, '');
        // kill abbreviation periods
        if (t.tags.has('Abbreviation')) {
          post = post.replace(/\./, '');
        }
      }
      if (opts.whitespace === 'some') {
        pre = pre.replace(/\s/, ''); //remove pre-whitespace
        post = post.replace(/\s+/, ' '); //replace post-whitespace with a space
      }
      if (!opts.keepPunct) {
        pre = pre.replace(trimStart, '');
        if (post === '-') {
          post = ' ';
        } else {
          post = post.replace(trimEnd, '');
        }
      }
      // grab the correct word format
      let word = t[opts.form || 'text'] || t.normal || '';
      if (opts.form === 'implicit') {
        word = t.implicit || t.text;
      }
      if (opts.form === 'root' && t.implicit) {
        word = t.root || t.implicit || t.normal;
      }
      // add an implicit space, for contractions
      if ((opts.form === 'machine' || opts.form === 'implicit' || opts.form === 'root') && t.implicit) {
        if (!post || !hasSpace.test(post)) {
          post += ' ';
        }
      }
      txt += pre + word + post;
    });
    if (keepSpace === false) {
      txt = txt.trim();
    }
    if (opts.lowerCase === true) {
      txt = txt.toLowerCase();
    }
    return txt
  };

  const textFromDoc = function (docs, opts) {
    let text = '';
    if (!docs || !docs[0] || !docs[0][0]) {
      return text
    }
    for (let i = 0; i < docs.length; i += 1) {
      // middle
      text += textFromTerms(docs[i], opts, true);
    }
    if (!opts.keepSpace) {
      text = text.trim();
    }
    if (opts.keepPunct === false) {
      // don't remove ':)' etc
      if (!docs[0][0].tags.has('Emoticon')) {
        text = text.replace(trimStart, '');
      }
      let last = docs[docs.length - 1];
      if (!last[last.length - 1].tags.has('Emoticon')) {
        text = text.replace(trimEnd, '');
      }
    }
    if (opts.cleanWhitespace === true) {
      text = text.trim();
    }
    return text
  };

  const fmts = {
    text: {
      form: 'text',
    },
    normal: {
      whitespace: 'some',
      punctuation: 'some',
      case: 'some',
      unicode: 'some',
      form: 'normal',
    },
    machine: {
      keepSpace: false,
      whitespace: 'some',
      punctuation: 'some',
      case: 'none',
      unicode: 'some',
      form: 'machine',
    },
    root: {
      keepSpace: false,
      whitespace: 'some',
      punctuation: 'some',
      case: 'some',
      unicode: 'some',
      form: 'root',
    },
    implicit: {
      form: 'implicit',
    }
  };
  fmts.clean = fmts.normal;
  fmts.reduced = fmts.root;
  var fmts$1 = fmts;

  /* eslint-disable no-bitwise */
  /* eslint-disable no-mixed-operators */
  /* eslint-disable no-multi-assign */

  // https://github.com/jbt/tiny-hashes/
  let k = [], i$1 = 0;
  for (; i$1 < 64;) {
    k[i$1] = 0 | Math.sin(++i$1 % Math.PI) * 4294967296;
  }

  function md5(s) {
    let b, c, d,
      h = [b = 0x67452301, c = 0xEFCDAB89, ~b, ~c],
      words = [],
      j = decodeURI(encodeURI(s)) + '\x80',
      a = j.length;

    s = (--a / 4 + 2) | 15;

    words[--s] = a * 8;

    for (; ~a;) {
      words[a >> 2] |= j.charCodeAt(a) << 8 * a--;
    }

    for (i$1 = j = 0; i$1 < s; i$1 += 16) {
      a = h;

      for (; j < 64;
        a = [
          d = a[3],
          (
            b +
            ((d =
              a[0] +
              [
                b & c | ~b & d,
                d & b | ~d & c,
                b ^ c ^ d,
                c ^ (b | ~d)
              ][a = j >> 4] +
              k[j] +
              ~~words[i$1 | [
                j,
                5 * j + 1,
                3 * j + 5,
                7 * j
              ][a] & 15]
            ) << (a = [
              7, 12, 17, 22,
              5, 9, 14, 20,
              4, 11, 16, 23,
              6, 10, 15, 21
            ][4 * a + j++ % 4]) | d >>> -a)
          ),
          b,
          c
        ]
      ) {
        b = a[1] | 0;
        c = a[2];
      }
      for (j = 4; j;) h[--j] += a[j];
    }

    for (s = ''; j < 32;) {
      s += ((h[j >> 3] >> ((1 ^ j++) * 4)) & 15).toString(16);
    }

    return s;
  }

  // console.log(md5('food-safety'))

  const defaults$1 = {
    text: true,
    terms: true,
  };

  let opts = { case: 'none', unicode: 'some', form: 'machine', punctuation: 'some' };

  const merge = function (a, b) {
    return Object.assign({}, a, b)
  };

  const fns$1 = {
    text: (terms) => textFromTerms(terms, { keepPunct: true }, false),
    normal: (terms) => textFromTerms(terms, merge(fmts$1.normal, { keepPunct: true }), false),
    implicit: (terms) => textFromTerms(terms, merge(fmts$1.implicit, { keepPunct: true }), false),

    machine: (terms) => textFromTerms(terms, opts, false),
    root: (terms) => textFromTerms(terms, merge(opts, { form: 'root' }), false),

    hash: (terms) => md5(textFromTerms(terms, { keepPunct: true }, false)),

    offset: (terms) => {
      let len = fns$1.text(terms).length;
      return {
        index: terms[0].offset.index,
        start: terms[0].offset.start,
        length: len,
      }
    },
    terms: (terms) => {
      return terms.map(t => {
        let term = Object.assign({}, t);
        term.tags = Array.from(t.tags);
        return term
      })
    },
    confidence: (_terms, view, i) => view.eq(i).confidence(),
    syllables: (_terms, view, i) => view.eq(i).syllables(),
    sentence: (_terms, view, i) => view.eq(i).fullSentence().text(),
    dirty: (terms) => terms.some(t => t.dirty === true)
  };
  fns$1.sentences = fns$1.sentence;
  fns$1.clean = fns$1.normal;
  fns$1.reduced = fns$1.root;

  const toJSON = function (view, option) {
    option = option || {};
    if (typeof option === 'string') {
      option = {};
    }
    option = Object.assign({}, defaults$1, option);
    // run any necessary upfront steps
    if (option.offset) {
      view.compute('offset');
    }
    return view.docs.map((terms, i) => {
      let res = {};
      Object.keys(option).forEach(k => {
        if (option[k] && fns$1[k]) {
          res[k] = fns$1[k](terms, view, i);
        }
      });
      return res
    })
  };


  const methods$a = {
    /** return data */
    json: function (n) {
      let res = toJSON(this, n);
      if (typeof n === 'number') {
        return res[n]
      }
      return res
    },
  };
  methods$a.data = methods$a.json;
  var json = methods$a;

  /* eslint-disable no-console */
  const logClientSide = function (view) {
    console.log('%c -=-=- ', 'background-color:#6699cc;');
    view.forEach(m => {
      console.groupCollapsed(m.text());
      let terms = m.docs[0];
      let out = terms.map(t => {
        let text = t.text || '-';
        if (t.implicit) {
          text = '[' + t.implicit + ']';
        }
        let tags = '[' + Array.from(t.tags).join(', ') + ']';
        return { text, tags }
      });
      console.table(out, ['text', 'tags']);
      console.groupEnd();
    });
  };
  var logClientSide$1 = logClientSide;

  // https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
  const reset$1 = '\x1b[0m';

  //cheaper than requiring chalk
  const cli$2 = {
    green: str => '\x1b[32m' + str + reset$1,
    red: str => '\x1b[31m' + str + reset$1,
    blue: str => '\x1b[34m' + str + reset$1,
    magenta: str => '\x1b[35m' + str + reset$1,
    cyan: str => '\x1b[36m' + str + reset$1,
    yellow: str => '\x1b[33m' + str + reset$1,
    black: str => '\x1b[30m' + str + reset$1,
    dim: str => '\x1b[2m' + str + reset$1,
    i: str => '\x1b[3m' + str + reset$1,
  };
  var cli$3 = cli$2;

  /* eslint-disable no-console */

  const tagString$1 = function (tags, model) {
    if (model.one.tagSet) {
      tags = tags.map(tag => {
        if (!model.one.tagSet.hasOwnProperty(tag)) {
          return tag
        }
        const c = model.one.tagSet[tag].color || 'blue';
        return cli$3[c](tag)
      });
    }
    return tags.join(', ')
  };

  const showTags$2 = function (view) {
    let { docs, model } = view;
    if (docs.length === 0) {
      console.log(cli$3.blue('\n     ──────'));
    }
    docs.forEach(terms => {
      console.log(cli$3.blue('\n  ┌─────────'));
      terms.forEach(t => {
        let tags = [...(t.tags || [])];
        let text = t.text || '-';
        if (t.sense) {
          text = `{${t.normal}/${t.sense}}`;
        }
        if (t.implicit) {
          text = '[' + t.implicit + ']';
        }
        text = cli$3.yellow(text);
        let word = "'" + text + "'";
        if (t.reference) {
          let str = view.update([t.reference]).text('normal');
          word += ` - ${cli$3.dim(cli$3.i('[' + str + ']'))}`;
        }
        word = word.padEnd(18);
        let str = cli$3.blue('  │ ') + cli$3.i(word) + '  - ' + tagString$1(tags, model);
        console.log(str);
      });
    });
  };
  var showTags$3 = showTags$2;

  /* eslint-disable no-console */

  const showChunks = function (view) {
    let { docs } = view;
    console.log('');
    docs.forEach(terms => {
      let out = [];
      terms.forEach(term => {
        if (term.chunk === 'Noun') {
          out.push(cli$3.blue(term.implicit || term.normal));
        } else if (term.chunk === 'Verb') {
          out.push(cli$3.green(term.implicit || term.normal));
        } else if (term.chunk === 'Adjective') {
          out.push(cli$3.yellow(term.implicit || term.normal));
        } else if (term.chunk === 'Pivot') {
          out.push(cli$3.red(term.implicit || term.normal));
        } else {
          out.push(term.implicit || term.normal);
        }
      });
      console.log(out.join(' '), '\n');
    });
  };
  var showChunks$1 = showChunks;

  const split = (txt, offset, index) => {
    let buff = index * 9; //there are 9 new chars addded to each highlight
    let start = offset.start + buff;
    let end = start + offset.length;
    let pre = txt.substring(0, start);
    let mid = txt.substring(start, end);
    let post = txt.substring(end, txt.length);
    return [pre, mid, post]
  };

  const spliceIn = function (txt, offset, index) {
    let parts = split(txt, offset, index);
    return `${parts[0]}${cli$3.blue(parts[1])}${parts[2]}`
  };

  const showHighlight = function (doc) {
    if (!doc.found) {
      return
    }
    let bySentence = {};
    doc.fullPointer.forEach(ptr => {
      bySentence[ptr[0]] = bySentence[ptr[0]] || [];
      bySentence[ptr[0]].push(ptr);
    });
    Object.keys(bySentence).forEach(k => {
      let full = doc.update([[Number(k)]]);
      let txt = full.text();
      let matches = doc.update(bySentence[k]);
      let json = matches.json({ offset: true });
      json.forEach((obj, i) => {
        txt = spliceIn(txt, obj.offset, i);
      });
      console.log(txt); // eslint-disable-line
    });
  };
  var showHighlight$1 = showHighlight;

  /* eslint-disable no-console */

  function isClientSide$1() {
    return typeof window !== 'undefined' && window.document
  }
  //output some helpful stuff to the console
  const debug$2 = function (opts = {}) {
    let view = this;
    if (typeof opts === 'string') {
      let tmp = {};
      tmp[opts] = true; //allow string input
      opts = tmp;
    }
    if (isClientSide$1()) {
      logClientSide$1(view);
      return view
    }
    if (opts.tags !== false) {
      showTags$3(view);
      console.log('\n');
    }
    // output chunk-view, too
    if (opts.chunks === true) {
      showChunks$1(view);
      console.log('\n');
    }
    // highlight match in sentence
    if (opts.highlight === true) {
      showHighlight$1(view);
      console.log('\n');
    }
    return view
  };
  var debug$3 = debug$2;

  const toText = function (term) {
    let pre = term.pre || '';
    let post = term.post || '';
    return pre + term.text + post
  };

  const findStarts = function (doc, obj) {
    let starts = {};
    Object.keys(obj).forEach(reg => {
      let m = doc.match(reg);
      m.fullPointer.forEach(a => {
        starts[a[3]] = { fn: obj[reg], end: a[2] };
      });
    });
    return starts
  };

  const wrap = function (doc, obj) {
    // index ids to highlight
    let starts = findStarts(doc, obj);
    let text = '';
    doc.docs.forEach((terms, n) => {
      for (let i = 0; i < terms.length; i += 1) {
        let t = terms[i];
        // do a span tag
        if (starts.hasOwnProperty(t.id)) {
          let { fn, end } = starts[t.id];
          let m = doc.update([[n, i, end]]);
          text += terms[i].pre || '';
          text += fn(m);
          i = end - 1;
          text += terms[i].post || '';
        } else {
          text += toText(t);
        }
      }
    });
    return text
  };
  var wrap$1 = wrap;

  const isObject$2 = val => {
    return Object.prototype.toString.call(val) === '[object Object]'
  };

  // sort by frequency
  const topk = function (arr) {
    let obj = {};
    arr.forEach(a => {
      obj[a] = obj[a] || 0;
      obj[a] += 1;
    });
    let res = Object.keys(obj).map(k => {
      return { normal: k, count: obj[k] }
    });
    return res.sort((a, b) => (a.count > b.count ? -1 : 0))
  };

  /** some named output formats */
  const out = function (method) {
    // support custom outputs
    if (isObject$2(method)) {
      return wrap$1(this, method)
    }
    // text out formats
    if (method === 'text') {
      return this.text()
    }
    if (method === 'normal') {
      return this.text('normal')
    }
    if (method === 'root') {
      return this.text('root')
    }
    if (method === 'machine' || method === 'reduced') {
      return this.text('machine')
    }
    if (method === 'hash' || method === 'md5') {
      return md5(this.text())
    }

    // json data formats
    if (method === 'json') {
      return this.json()
    }
    if (method === 'offset' || method === 'offsets') {
      this.compute('offset');
      return this.json({ offset: true })
    }
    if (method === 'array') {
      let arr = this.docs.map(terms => {
        return terms
          .reduce((str, t) => {
            return str + t.pre + t.text + t.post
          }, '')
          .trim()
      });
      return arr.filter(str => str)
    }
    // return terms sorted by frequency
    if (method === 'freq' || method === 'frequency' || method === 'topk') {
      return topk(this.json({ normal: true }).map(o => o.normal))
    }

    // some handy ad-hoc outputs
    if (method === 'terms') {
      let list = [];
      this.docs.forEach(s => {
        let terms = s.terms.map(t => t.text);
        terms = terms.filter(t => t);
        list = list.concat(terms);
      });
      return list
    }
    if (method === 'tags') {
      return this.docs.map(terms => {
        return terms.reduce((h, t) => {
          h[t.implicit || t.normal] = Array.from(t.tags);
          return h
        }, {})
      })
    }
    if (method === 'debug') {
      return this.debug() //allow
    }
    return this.text()
  };

  const methods$9 = {
    /** */
    debug: debug$3,
    /** */
    out,
    /** */
    wrap: function (obj) {
      return wrap$1(this, obj)
    },
  };

  var out$1 = methods$9;

  const isObject$1 = val => {
    return Object.prototype.toString.call(val) === '[object Object]'
  };

  var text = {
    /** */
    text: function (fmt) {
      let opts = {};
      if (fmt && typeof fmt === 'string' && fmts$1.hasOwnProperty(fmt)) {
        opts = Object.assign({}, fmts$1[fmt]);
      } else if (fmt && isObject$1(fmt)) {
        opts = Object.assign({}, fmt);//todo: fixme
      }
      if (opts.keepSpace === undefined && this.pointer) {
        opts.keepSpace = false;
      }
      if (opts.keepPunct === undefined && this.pointer) {
        let ptr = this.pointer[0];
        if (ptr && ptr[1]) {
          opts.keepPunct = false;
        } else {
          opts.keepPunct = true;
        }
      }
      // set defaults
      if (opts.keepPunct === undefined) {
        opts.keepPunct = true;
      }
      if (opts.keepSpace === undefined) {
        opts.keepSpace = true;
      }
      return textFromDoc(this.docs, opts)
    },
  };

  const methods$8 = Object.assign({}, out$1, text, json, html$1);

  const addAPI$1 = function (View) {
    Object.assign(View.prototype, methods$8);
  };
  var api$9 = addAPI$1;

  var output$1 = {
    api: api$9,
    methods: {
      one: {
        hash: md5
      }
    }
  };

  // do the pointers intersect?
  const doesOverlap = function (a, b) {
    if (a[0] !== b[0]) {
      return false
    }
    let [, startA, endA] = a;
    let [, startB, endB] = b;
    // [a,a,a,-,-,-,]
    // [-,-,b,b,b,-,]
    if (startA <= startB && endA > startB) {
      return true
    }
    // [-,-,-,a,a,-,]
    // [-,-,b,b,b,-,]
    if (startB <= startA && endB > startA) {
      return true
    }
    return false
  };

  // get widest min/max
  const getExtent = function (ptrs) {
    let min = ptrs[0][1];
    let max = ptrs[0][2];
    ptrs.forEach(ptr => {
      if (ptr[1] < min) {
        min = ptr[1];
      }
      if (ptr[2] > max) {
        max = ptr[2];
      }
    });
    return [ptrs[0][0], min, max]
  };

  // collect pointers by sentence number
  const indexN = function (ptrs) {
    let byN = {};
    ptrs.forEach(ref => {
      byN[ref[0]] = byN[ref[0]] || [];
      byN[ref[0]].push(ref);
    });
    return byN
  };

  // remove exact duplicates
  const uniquePtrs = function (arr) {
    let obj = {};
    for (let i = 0; i < arr.length; i += 1) {
      obj[arr[i].join(',')] = arr[i];
    }
    return Object.values(obj)
  };

  // a before b
  // console.log(doesOverlap([0, 0, 4], [0, 2, 5]))
  // // b before a
  // console.log(doesOverlap([0, 3, 4], [0, 1, 5]))
  // // disjoint
  // console.log(doesOverlap([0, 0, 3], [0, 4, 5]))
  // neighbours
  // console.log(doesOverlap([0, 1, 3], [0, 3, 5]))
  // console.log(doesOverlap([0, 3, 5], [0, 1, 3]))

  // console.log(
  //   getExtent([
  //     [0, 3, 4],
  //     [0, 4, 5],
  //     [0, 1, 2],
  //   ])
  // )

  // split a pointer, by match pointer
  const pivotBy = function (full, m) {
    let [n, start] = full;
    let mStart = m[1];
    let mEnd = m[2];
    let res = {};
    // is there space before the match?
    if (start < mStart) {
      let end = mStart < full[2] ? mStart : full[2]; // find closest end-point
      res.before = [n, start, end]; //before segment
    }
    res.match = m;
    // is there space after the match?
    if (full[2] > mEnd) {
      res.after = [n, mEnd, full[2]]; //after segment
    }
    return res
  };

  const doesMatch = function (full, m) {
    return full[1] <= m[1] && m[2] <= full[2]
  };

  const splitAll = function (full, m) {
    let byN = indexN(m);
    let res = [];
    full.forEach(ptr => {
      let [n] = ptr;
      let matches = byN[n] || [];
      matches = matches.filter(p => doesMatch(ptr, p));
      if (matches.length === 0) {
        res.push({ passthrough: ptr });
        return
      }
      // ensure matches are in-order
      matches = matches.sort((a, b) => a[1] - b[1]);
      // start splitting our left-to-right
      let carry = ptr;
      matches.forEach((p, i) => {
        let found = pivotBy(carry, p);
        // last one
        if (!matches[i + 1]) {
          res.push(found);
        } else {
          res.push({ before: found.before, match: found.match });
          if (found.after) {
            carry = found.after;
          }
        }
      });
    });
    return res
  };

  var splitAll$1 = splitAll;

  const max = 20;

  // sweep-around looking for our start term uuid
  const blindSweep = function (id, doc, n) {
    for (let i = 0; i < max; i += 1) {
      // look up a sentence
      if (doc[n - i]) {
        let index = doc[n - i].findIndex(term => term.id === id);
        if (index !== -1) {
          return [n - i, index]
        }
      }
      // look down a sentence
      if (doc[n + i]) {
        let index = doc[n + i].findIndex(term => term.id === id);
        if (index !== -1) {
          return [n + i, index]
        }
      }
    }
    return null
  };

  const repairEnding = function (ptr, document) {
    let [n, start, , , endId] = ptr;
    let terms = document[n];
    // look for end-id
    let newEnd = terms.findIndex(t => t.id === endId);
    if (newEnd === -1) {
      // if end-term wasn't found, so go all the way to the end
      ptr[2] = document[n].length;
      ptr[4] = terms.length ? terms[terms.length - 1].id : null;
    } else {
      ptr[2] = newEnd; // repair ending pointer
    }
    return document[n].slice(start, ptr[2] + 1)
  };

  /** return a subset of the document, from a pointer */
  const getDoc$1 = function (ptrs, document) {
    let doc = [];
    ptrs.forEach((ptr, i) => {
      if (!ptr) {
        return
      }
      let [n, start, end, id, endId] = ptr; //parsePointer(ptr)
      let terms = document[n] || [];
      if (start === undefined) {
        start = 0;
      }
      if (end === undefined) {
        end = terms.length;
      }
      if (id && (!terms[start] || terms[start].id !== id)) {
        // console.log('  repairing pointer...')
        let wild = blindSweep(id, document, n);
        if (wild !== null) {
          let len = end - start;
          terms = document[wild[0]].slice(wild[1], wild[1] + len);
          // actually change the pointer
          let startId = terms[0] ? terms[0].id : null;
          ptrs[i] = [wild[0], wild[1], wild[1] + len, startId];
        }
      } else {
        terms = terms.slice(start, end);
      }
      if (terms.length === 0) {
        return
      }
      if (start === end) {
        return
      }
      // test end-id, if it exists
      if (endId && terms[terms.length - 1].id !== endId) {
        terms = repairEnding(ptr, document);
      }
      // otherwise, looks good!
      doc.push(terms);
    });
    doc = doc.filter(a => a.length > 0);
    return doc
  };
  var getDoc$2 = getDoc$1;

  // flat list of terms from nested document
  const termList = function (docs) {
    let arr = [];
    for (let i = 0; i < docs.length; i += 1) {
      for (let t = 0; t < docs[i].length; t += 1) {
        arr.push(docs[i][t]);
      }
    }
    return arr
  };

  var methods$7 = {
    one: {
      termList,
      getDoc: getDoc$2,
      pointer: {
        indexN,
        splitAll: splitAll$1,
      }
    },
  };

  // a union is a + b, minus duplicates
  const getUnion = function (a, b) {
    let both = a.concat(b);
    let byN = indexN(both);
    let res = [];
    both.forEach(ptr => {
      let [n] = ptr;
      if (byN[n].length === 1) {
        // we're alone on this sentence, so we're good
        res.push(ptr);
        return
      }
      // there may be overlaps
      let hmm = byN[n].filter(m => doesOverlap(ptr, m));
      hmm.push(ptr);
      let range = getExtent(hmm);
      res.push(range);
    });
    res = uniquePtrs(res);
    return res
  };
  var getUnion$1 = getUnion;

  // two disjoint
  // console.log(getUnion([[1, 3, 4]], [[0, 1, 2]]))
  // two disjoint
  // console.log(getUnion([[0, 3, 4]], [[0, 1, 2]]))
  // overlap-plus
  // console.log(getUnion([[0, 1, 4]], [[0, 2, 6]]))
  // overlap
  // console.log(getUnion([[0, 1, 4]], [[0, 2, 3]]))
  // neighbours
  // console.log(getUnion([[0, 1, 3]], [[0, 3, 5]]))

  const subtract = function (refs, not) {
    let res = [];
    let found = splitAll$1(refs, not);
    found.forEach(o => {
      if (o.passthrough) {
        res.push(o.passthrough);
      }
      if (o.before) {
        res.push(o.before);
      }
      if (o.after) {
        res.push(o.after);
      }
    });
    return res
  };
  var getDifference = subtract;

  // console.log(subtract([[0, 0, 2]], [[0, 0, 1]]))
  // console.log(subtract([[0, 0, 2]], [[0, 1, 2]]))

  // [a,a,a,a,-,-,]
  // [-,-,b,b,b,-,]
  // [-,-,x,x,-,-,]
  const intersection = function (a, b) {
    // find the latest-start
    let start = a[1] < b[1] ? b[1] : a[1];
    // find the earliest-end
    let end = a[2] > b[2] ? b[2] : a[2];
    // does it form a valid pointer?
    if (start < end) {
      return [a[0], start, end]
    }
    return null
  };

  const getIntersection = function (a, b) {
    let byN = indexN(b);
    let res = [];
    a.forEach(ptr => {
      let hmm = byN[ptr[0]] || [];
      hmm = hmm.filter(p => doesOverlap(ptr, p));
      // no sentence-pairs, so no intersection
      if (hmm.length === 0) {
        return
      }
      hmm.forEach(h => {
        let overlap = intersection(ptr, h);
        if (overlap) {
          res.push(overlap);
        }
      });
    });
    return res
  };
  var getIntersection$1 = getIntersection;

  // console.log(getIntersection([[0, 1, 3]], [[0, 2, 4]]))

  const isArray$3 = function (arr) {
    return Object.prototype.toString.call(arr) === '[object Array]'
  };

  const getDoc = (m, view) => {
    if (typeof m === 'string' || isArray$3(m)) {
      return view.match(m)
    }
    if (!m) {
      return view.none()
    }
    // support pre-parsed reg object
    return m
  };

  // 'harden' our json pointers, again
  const addIds = function (ptrs, docs) {
    return ptrs.map(ptr => {
      let [n, start] = ptr;
      if (docs[n] && docs[n][start]) {
        ptr[3] = docs[n][start].id;
      }
      return ptr
    })
  };

  const methods$6 = {};

  // all parts, minus duplicates
  methods$6.union = function (m) {
    m = getDoc(m, this);
    let ptrs = getUnion$1(this.fullPointer, m.fullPointer);
    ptrs = addIds(ptrs, this.document);
    return this.toView(ptrs)
  };
  methods$6.and = methods$6.union;

  // only parts they both have
  methods$6.intersection = function (m) {
    m = getDoc(m, this);
    let ptrs = getIntersection$1(this.fullPointer, m.fullPointer);
    ptrs = addIds(ptrs, this.document);
    return this.toView(ptrs)
  };

  // only parts of a that b does not have
  methods$6.not = function (m) {
    m = getDoc(m, this);
    let ptrs = getDifference(this.fullPointer, m.fullPointer);
    ptrs = addIds(ptrs, this.document);
    return this.toView(ptrs)
  };
  methods$6.difference = methods$6.not;

  // get opposite of a
  methods$6.complement = function () {
    let doc = this.all();
    let ptrs = getDifference(doc.fullPointer, this.fullPointer);
    ptrs = addIds(ptrs, this.document);
    return this.toView(ptrs)
  };

  // remove overlaps
  methods$6.settle = function () {
    let ptrs = this.fullPointer;
    ptrs.forEach(ptr => {
      ptrs = getUnion$1(ptrs, [ptr]);
    });
    ptrs = addIds(ptrs, this.document);
    return this.update(ptrs)
  };


  const addAPI = function (View) {
    // add set/intersection/union
    Object.assign(View.prototype, methods$6);
  };
  var api$8 = addAPI;

  var pointers = {
    methods: methods$7,
    api: api$8,
  };

  var lib$2 = {
    // compile a list of matches into a match-net
    buildNet: function (matches) {
      const methods = this.methods();
      let net = methods.one.buildNet(matches, this.world());
      net.isNet = true;
      return net
    }
  };

  const api$6 = function (View) {

    /** speedy match a sequence of matches */
    View.prototype.sweep = function (net, opts = {}) {
      const { world, docs } = this;
      const { methods } = world;
      let found = methods.one.bulkMatch(docs, net, this.methods, opts);

      // apply any changes
      if (opts.tagger !== false) {
        methods.one.bulkTagger(found, docs, this.world);
      }
      // fix the pointers
      // collect all found results into a View
      found = found.map(o => {
        let ptr = o.pointer;
        let term = docs[ptr[0]][ptr[1]];
        let len = ptr[2] - ptr[1];
        if (term.index) {
          o.pointer = [
            term.index[0],
            term.index[1],
            ptr[1] + len
          ];
        }
        return o
      });
      let ptrs = found.map(o => o.pointer);
      // cleanup results a bit
      found = found.map(obj => {
        obj.view = this.update([obj.pointer]);
        delete obj.regs;
        delete obj.needs;
        delete obj.pointer;
        delete obj._expanded;
        return obj
      });
      return {
        view: this.update(ptrs),
        found
      }
    };

  };
  var api$7 = api$6;

  // extract the clear needs for an individual match token
  const getTokenNeeds = function (reg) {
    // negatives can't be cached
    if (reg.optional === true || reg.negative === true) {
      return null
    }
    if (reg.tag) {
      return '#' + reg.tag
    }
    if (reg.word) {
      return reg.word
    }
    if (reg.switch) {
      return `%${reg.switch}%`
    }
    return null
  };

  const getNeeds = function (regs) {
    let needs = [];
    regs.forEach(reg => {
      needs.push(getTokenNeeds(reg));
      // support AND (foo && tag)
      if (reg.operator === 'and' && reg.choices) {
        reg.choices.forEach(oneSide => {
          oneSide.forEach(r => {
            needs.push(getTokenNeeds(r));
          });
        });
      }
    });
    return needs.filter(str => str)
  };

  const getWants = function (regs) {
    let wants = [];
    let count = 0;
    regs.forEach(reg => {
      if (reg.operator === 'or' && !reg.optional && !reg.negative) {
        // add fast-or terms
        if (reg.fastOr) {
          Array.from(reg.fastOr).forEach(w => {
            wants.push(w);
          });
        }
        // add slow-or
        if (reg.choices) {
          reg.choices.forEach(rs => {
            rs.forEach(r => {
              let n = getTokenNeeds(r);
              if (n) {
                wants.push(n);
              }
            });
          });
        }
        count += 1;
      }
    });
    return { wants, count }
  };

  const parse$1 = function (matches, world) {
    const parseMatch = world.methods.one.parseMatch;
    matches.forEach(obj => {
      obj.regs = parseMatch(obj.match, {}, world);
      // wrap these ifNo properties into an array
      if (typeof obj.ifNo === 'string') {
        obj.ifNo = [obj.ifNo];
      }
      if (obj.notIf) {
        obj.notIf = parseMatch(obj.notIf, {}, world);
      }
      // cache any requirements up-front 
      obj.needs = getNeeds(obj.regs);
      let { wants, count } = getWants(obj.regs);
      obj.wants = wants;
      obj.minWant = count;
      // get rid of tiny sentences
      obj.minWords = obj.regs.filter(o => !o.optional).length;
    });
    return matches
  };

  var parse$2 = parse$1;

  // do some indexing on the list of matches
  const buildNet = function (matches, world) {
    // turn match-syntax into json
    matches = parse$2(matches, world);

    // collect by wants and needs
    let hooks = {};
    matches.forEach(obj => {
      // add needs
      obj.needs.forEach(str => {
        hooks[str] = hooks[str] || [];
        hooks[str].push(obj);
      });
      // add wants
      obj.wants.forEach(str => {
        hooks[str] = hooks[str] || [];
        hooks[str].push(obj);
      });
    });
    // remove duplicates
    Object.keys(hooks).forEach(k => {
      let already = {};
      hooks[k] = hooks[k].filter(obj => {
        if (already[obj.match]) {
          return false
        }
        already[obj.match] = true;
        return true
      });
    });

    // keep all un-cacheable matches (those with no needs) 
    let always = matches.filter(o => o.needs.length === 0 && o.wants.length === 0);
    return {
      hooks,
      always
    }
  };

  var buildNet$1 = buildNet;

  // for each cached-sentence, find a list of possible matches
  const getHooks = function (docCaches, hooks) {
    return docCaches.map((set, i) => {
      let maybe = [];
      Object.keys(hooks).forEach(k => {
        if (docCaches[i].has(k)) {
          maybe = maybe.concat(hooks[k]);
        }
      });
      // remove duplicates
      let already = {};
      maybe = maybe.filter(m => {
        if (already[m.match]) {
          return false
        }
        already[m.match] = true;
        return true
      });
      return maybe
    })
  };

  var getHooks$1 = getHooks;

  // filter-down list of maybe-matches
  const localTrim = function (maybeList, docCache) {
    return maybeList.map((list, n) => {
      let haves = docCache[n];
      // ensure all stated-needs of the match are met
      list = list.filter(obj => {
        return obj.needs.every(need => haves.has(need))
      });
      // ensure nothing matches in our 'ifNo' property
      list = list.filter(obj => {
        if (obj.ifNo !== undefined && obj.ifNo.some(no => haves.has(no)) === true) {
          return false
        }
        return true
      });
      // ensure atleast one(?) of the wants is found
      list = list.filter(obj => {
        if (obj.wants.length === 0) {
          return true
        }
        // ensure there's one cache-hit
        let found = obj.wants.filter(str => haves.has(str)).length;
        return found >= obj.minWant
      });
      return list
    })
  };
  var trimDown = localTrim;

  // finally,
  // actually run these match-statements on the terms
  const runMatch = function (maybeList, document, docCache, methods, opts) {
    let results = [];
    for (let n = 0; n < maybeList.length; n += 1) {
      for (let i = 0; i < maybeList[n].length; i += 1) {
        let m = maybeList[n][i];
        // ok, actually do the work.
        let res = methods.one.match([document[n]], m);
        // found something.
        if (res.ptrs.length > 0) {
          res.ptrs.forEach(ptr => {
            ptr[0] = n; // fix the sentence pointer
            // check ifNo
            // if (m.ifNo !== undefined) {
            //   let terms = document[n].slice(ptr[1], ptr[2])
            //   for (let k = 0; k < m.ifNo.length; k += 1) {
            //     const no = m.ifNo[k]
            //     // quick-check cache
            //     if (docCache[n].has(no)) {
            //       if (no.startsWith('#')) {
            //         let tag = no.replace(/^#/, '')
            //         if (terms.find(t => t.tags.has(tag))) {
            //           console.log('+' + tag)
            //           return
            //         }
            //       } else if (terms.find(t => t.normal === no || t.tags.has(no))) {
            //         console.log('+' + no)
            //         return
            //       }
            //     }
            //   }
            // }
            let todo = Object.assign({}, m, { pointer: ptr });
            if (m.unTag !== undefined) {
              todo.unTag = m.unTag;
            }
            results.push(todo);
          });
          //ok cool, can we stop early?
          if (opts.matchOne === true) {
            return [results[0]]
          }
        }
      }
    }
    return results
  };
  var runMatch$1 = runMatch;

  const tooSmall = function (maybeList, document) {
    return maybeList.map((arr, i) => {
      let termCount = document[i].length;
      arr = arr.filter(o => {
        return termCount >= o.minWords
      });
      return arr
    })
  };

  const sweep$1 = function (document, net, methods, opts = {}) {
    // find suitable matches to attempt, on each sentence
    let docCache = methods.one.cacheDoc(document);
    // collect possible matches for this document
    let maybeList = getHooks$1(docCache, net.hooks);
    // ensure all defined needs are met for each match
    maybeList = trimDown(maybeList, docCache);
    // add unchacheable matches to each sentence's todo-list
    if (net.always.length > 0) {
      maybeList = maybeList.map(arr => arr.concat(net.always));
    }
    // if we don't have enough words
    maybeList = tooSmall(maybeList, document);

    // now actually run the matches
    let results = runMatch$1(maybeList, document, docCache, methods, opts);
    // console.dir(results, { depth: 5 })
    return results
  };
  var bulkMatch = sweep$1;

  // is this tag consistent with the tags they already have?
  const canBe = function (terms, tag, model) {
    let tagSet = model.one.tagSet;
    if (!tagSet.hasOwnProperty(tag)) {
      return true
    }
    let not = tagSet[tag].not || [];
    for (let i = 0; i < terms.length; i += 1) {
      let term = terms[i];
      for (let k = 0; k < not.length; k += 1) {
        if (term.tags.has(not[k]) === true) {
          return false //found a tag conflict - bail!
        }
      }
    }
    return true
  };
  var canBe$1 = canBe;

  const tagger = function (list, document, world) {
    const { model, methods } = world;
    const { getDoc, setTag, unTag } = methods.one;
    const looksPlural = methods.two.looksPlural;
    if (list.length === 0) {
      return list
    }
    // some logging for debugging
    const env = typeof process === 'undefined' || !process.env ? self.env || {} : process.env;
    if (env.DEBUG_TAGS) {
      console.log(`\n\n  \x1b[32m→ ${list.length} post-tagger:\x1b[0m`); //eslint-disable-line
    }
    return list.map(todo => {
      if (!todo.tag && !todo.chunk && !todo.unTag) {
        return
      }
      let reason = todo.reason || todo.match;
      let terms = getDoc([todo.pointer], document)[0];
      // handle 'safe' tag
      if (todo.safe === true) {
        // check for conflicting tags
        if (canBe$1(terms, todo.tag, model) === false) {
          return
        }
        // dont tag half of a hyphenated word
        if (terms[terms.length - 1].post === '-') {
          return
        }
      }
      if (todo.tag !== undefined) {
        setTag(terms, todo.tag, world, todo.safe, `[post] '${reason}'`);
        // quick and dirty plural tagger
        if (todo.tag === 'Noun' && looksPlural) {
          let term = terms[terms.length - 1];
          if (looksPlural(term.text)) {
            setTag([term], 'Plural', world, todo.safe, 'quick-plural');
          } else {
            setTag([term], 'Singular', world, todo.safe, 'quick-singular');
          }
        }
      }
      if (todo.unTag !== undefined) {
        unTag(terms, todo.unTag, world, todo.safe, reason);
      }
      // allow setting chunks, too
      if (todo.chunk) {
        terms.forEach(t => t.chunk = todo.chunk);
      }
    })
  };
  var bulkTagger = tagger;

  var methods$5 = {
    buildNet: buildNet$1,
    bulkMatch,
    bulkTagger
  };

  var sweep = {
    lib: lib$2,
    api: api$7,
    methods: {
      one: methods$5,
    }
  };

  const isMulti = / /;

  const addChunk = function (term, tag) {
    if (tag === 'Noun') {
      term.chunk = tag;
    }
    if (tag === 'Verb') {
      term.chunk = tag;
    }
  };

  const tagTerm = function (term, tag, tagSet, isSafe) {
    // does it already have this tag?
    if (term.tags.has(tag) === true) {
      return null
    }
    // allow this shorthand in multiple-tag strings
    if (tag === '.') {
      return null
    }
    // for known tags, do logical dependencies first
    let known = tagSet[tag];
    if (known) {
      // first, we remove any conflicting tags
      if (known.not && known.not.length > 0) {
        for (let o = 0; o < known.not.length; o += 1) {
          // if we're in tagSafe, skip this term.
          if (isSafe === true && term.tags.has(known.not[o])) {
            return null
          }
          term.tags.delete(known.not[o]);
        }
      }
      // add parent tags
      if (known.parents && known.parents.length > 0) {
        for (let o = 0; o < known.parents.length; o += 1) {
          term.tags.add(known.parents[o]);
          addChunk(term, known.parents[o]);
        }
      }
    }
    // finally, add our tag
    term.tags.add(tag);
    // now it's dirty?
    term.dirty = true;
    // add a chunk too, if it's easy
    addChunk(term, tag);
    return true
  };

  // support '#Noun . #Adjective' syntax
  const multiTag = function (terms, tagString, tagSet, isSafe) {
    let tags = tagString.split(isMulti);
    terms.forEach((term, i) => {
      let tag = tags[i];
      if (tag) {
        tag = tag.replace(/^#/, '');
        tagTerm(term, tag, tagSet, isSafe);
      }
    });
  };

  const isArray$2 = function (arr) {
    return Object.prototype.toString.call(arr) === '[object Array]'
  };

  // verbose-mode tagger debuging
  const log = (terms, tag, reason = '') => {
    const yellow = str => '\x1b[33m\x1b[3m' + str + '\x1b[0m';
    const i = str => '\x1b[3m' + str + '\x1b[0m';
    let word = terms.map(t => {
      return t.text || '[' + t.implicit + ']'
    }).join(' ');
    if (typeof tag !== 'string' && tag.length > 2) {
      tag = tag.slice(0, 2).join(', #') + ' +'; //truncate the list of tags
    }
    tag = typeof tag !== 'string' ? tag.join(', #') : tag;
    console.log(` ${yellow(word).padEnd(24)} \x1b[32m→\x1b[0m #${tag.padEnd(22)}  ${i(reason)}`); // eslint-disable-line
  };

  // add a tag to all these terms
  const setTag = function (terms, tag, world = {}, isSafe, reason) {
    const tagSet = world.model.one.tagSet || {};
    if (!tag) {
      return
    }
    // some logging for debugging
    const env = typeof process === 'undefined' || !process.env ? self.env || {} : process.env;
    if (env && env.DEBUG_TAGS) {
      log(terms, tag, reason);
    }
    if (isArray$2(tag) === true) {
      tag.forEach(tg => setTag(terms, tg, world, isSafe));
      return
    }
    if (typeof tag !== 'string') {
      console.warn(`compromise: Invalid tag '${tag}'`);// eslint-disable-line
      return
    }
    tag = tag.trim();
    // support '#Noun . #Adjective' syntax
    if (isMulti.test(tag)) {
      multiTag(terms, tag, tagSet, isSafe);
      return
    }
    tag = tag.replace(/^#/, '');
    // let set = false
    for (let i = 0; i < terms.length; i += 1) {
      tagTerm(terms[i], tag, tagSet, isSafe);
    }
  };
  var setTag$1 = setTag;

  // remove this tag, and its children, from these terms
  const unTag = function (terms, tag, tagSet) {
    tag = tag.trim().replace(/^#/, '');
    for (let i = 0; i < terms.length; i += 1) {
      let term = terms[i];
      // support clearing all tags, with '*'
      if (tag === '*') {
        term.tags.clear();
        continue
      }
      // for known tags, do logical dependencies first
      let known = tagSet[tag];
      // removing #Verb should also remove #PastTense
      if (known && known.children.length > 0) {
        for (let o = 0; o < known.children.length; o += 1) {
          term.tags.delete(known.children[o]);
        }
      }
      term.tags.delete(tag);
    }
  };
  var unTag$1 = unTag;

  const e=function(e){return e.children=e.children||[],e._cache=e._cache||{},e.props=e.props||{},e._cache.parents=e._cache.parents||[],e._cache.children=e._cache.children||[],e},t=/^ *(#|\/\/)/,n=function(t){let n=t.trim().split(/->/),r=[];n.forEach((t=>{r=r.concat(function(t){if(!(t=t.trim()))return null;if(/^\[/.test(t)&&/\]$/.test(t)){let n=(t=(t=t.replace(/^\[/,"")).replace(/\]$/,"")).split(/,/);return n=n.map((e=>e.trim())).filter((e=>e)),n=n.map((t=>e({id:t}))),n}return [e({id:t})]}(t));})),r=r.filter((e=>e));let i=r[0];for(let e=1;e<r.length;e+=1)i.children.push(r[e]),i=r[e];return r[0]},r=(e,t)=>{let n=[],r=[e];for(;r.length>0;){let e=r.pop();n.push(e),e.children&&e.children.forEach((n=>{t&&t(e,n),r.push(n);}));}return n},i=e=>"[object Array]"===Object.prototype.toString.call(e),c=e=>(e=e||"").trim(),s=function(c=[]){return "string"==typeof c?function(r){let i=r.split(/\r?\n/),c=[];i.forEach((e=>{if(!e.trim()||t.test(e))return;let r=(e=>{const t=/^( {2}|\t)/;let n=0;for(;t.test(e);)e=e.replace(t,""),n+=1;return n})(e);c.push({indent:r,node:n(e)});}));let s=function(e){let t={children:[]};return e.forEach(((n,r)=>{0===n.indent?t.children=t.children.concat(n.node):e[r-1]&&function(e,t){let n=e[t].indent;for(;t>=0;t-=1)if(e[t].indent<n)return e[t];return e[0]}(e,r).node.children.push(n.node);})),t}(c);return s=e(s),s}(c):i(c)?function(t){let n={};t.forEach((e=>{n[e.id]=e;}));let r=e({});return t.forEach((t=>{if((t=e(t)).parent)if(n.hasOwnProperty(t.parent)){let e=n[t.parent];delete t.parent,e.children.push(t);}else console.warn(`[Grad] - missing node '${t.parent}'`);else r.children.push(t);})),r}(c):(r(s=c).forEach(e),s);var s;},h=e=>"[31m"+e+"[0m",o=e=>"[2m"+e+"[0m",l=function(e,t){let n="-> ";t&&(n=o("→ "));let i="";return r(e).forEach(((e,r)=>{let c=e.id||"";if(t&&(c=h(c)),0===r&&!e.id)return;let s=e._cache.parents.length;i+="    ".repeat(s)+n+c+"\n";})),i},a=function(e){let t=r(e);t.forEach((e=>{delete(e=Object.assign({},e)).children;}));let n=t[0];return n&&!n.id&&0===Object.keys(n.props).length&&t.shift(),t},p={text:l,txt:l,array:a,flat:a},d=function(e,t){return "nested"===t||"json"===t?e:"debug"===t?(console.log(l(e,!0)),null):p.hasOwnProperty(t)?p[t](e):e},u=e=>{r(e,((e,t)=>{e.id&&(e._cache.parents=e._cache.parents||[],t._cache.parents=e._cache.parents.concat([e.id]));}));},f=(e,t)=>(Object.keys(t).forEach((n=>{if(t[n]instanceof Set){let r=e[n]||new Set;e[n]=new Set([...r,...t[n]]);}else {if((e=>e&&"object"==typeof e&&!Array.isArray(e))(t[n])){let r=e[n]||{};e[n]=Object.assign({},t[n],r);}else i(t[n])?e[n]=t[n].concat(e[n]||[]):void 0===e[n]&&(e[n]=t[n]);}})),e),j=/\//;class g{constructor(e={}){Object.defineProperty(this,"json",{enumerable:!1,value:e,writable:!0});}get children(){return this.json.children}get id(){return this.json.id}get found(){return this.json.id||this.json.children.length>0}props(e={}){let t=this.json.props||{};return "string"==typeof e&&(t[e]=!0),this.json.props=Object.assign(t,e),this}get(t){if(t=c(t),!j.test(t)){let e=this.json.children.find((e=>e.id===t));return new g(e)}let n=((e,t)=>{let n=(e=>"string"!=typeof e?e:(e=e.replace(/^\//,"")).split(/\//))(t=t||"");for(let t=0;t<n.length;t+=1){let r=e.children.find((e=>e.id===n[t]));if(!r)return null;e=r;}return e})(this.json,t)||e({});return new g(n)}add(t,n={}){if(i(t))return t.forEach((e=>this.add(c(e),n))),this;t=c(t);let r=e({id:t,props:n});return this.json.children.push(r),new g(r)}remove(e){return e=c(e),this.json.children=this.json.children.filter((t=>t.id!==e)),this}nodes(){return r(this.json).map((e=>(delete(e=Object.assign({},e)).children,e)))}cache(){return (e=>{let t=r(e,((e,t)=>{e.id&&(e._cache.parents=e._cache.parents||[],e._cache.children=e._cache.children||[],t._cache.parents=e._cache.parents.concat([e.id]));})),n={};t.forEach((e=>{e.id&&(n[e.id]=e);})),t.forEach((e=>{e._cache.parents.forEach((t=>{n.hasOwnProperty(t)&&n[t]._cache.children.push(e.id);}));})),e._cache.children=Object.keys(n);})(this.json),this}list(){return r(this.json)}fillDown(){var e;return e=this.json,r(e,((e,t)=>{t.props=f(t.props,e.props);})),this}depth(){u(this.json);let e=r(this.json),t=e.length>1?1:0;return e.forEach((e=>{if(0===e._cache.parents.length)return;let n=e._cache.parents.length+1;n>t&&(t=n);})),t}out(e){return u(this.json),d(this.json,e)}debug(){return u(this.json),d(this.json,"debug"),this}}const _=function(e){let t=s(e);return new g(t)};_.prototype.plugin=function(e){e(this);};

  // i just made these up
  const colors = {
    Noun: 'blue',
    Verb: 'green',
    Negative: 'green',
    Date: 'red',
    Value: 'red',
    Adjective: 'magenta',
    Preposition: 'cyan',
    Conjunction: 'cyan',
    Determiner: 'cyan',
    Hyphenated: 'cyan',
    Adverb: 'cyan',
  };

  var colors$1 = colors;

  const getColor = function (node) {
    if (colors$1.hasOwnProperty(node.id)) {
      return colors$1[node.id]
    }
    if (colors$1.hasOwnProperty(node.is)) {
      return colors$1[node.is]
    }
    let found = node._cache.parents.find(c => colors$1[c]);
    return colors$1[found]
  };

  // convert tags to our final format
  const fmt = function (nodes) {
    const res = {};
    nodes.forEach(node => {
      let { not, also, is, novel } = node.props;
      let parents = node._cache.parents;
      if (also) {
        parents = parents.concat(also);
      }
      res[node.id] = {
        is,
        not,
        novel,
        also,
        parents,
        children: node._cache.children,
        color: getColor(node)
      };
    });
    // lastly, add all children of all nots
    Object.keys(res).forEach(k => {
      let nots = new Set(res[k].not);
      res[k].not.forEach(not => {
        if (res[not]) {
          res[not].children.forEach(tag => nots.add(tag));
        }
      });
      res[k].not = Array.from(nots);
    });
    return res
  };

  var fmt$1 = fmt;

  const toArr = function (input) {
    if (!input) {
      return []
    }
    if (typeof input === 'string') {
      return [input]
    }
    return input
  };

  const addImplied = function (tags, already) {
    Object.keys(tags).forEach(k => {
      // support deprecated fmts
      if (tags[k].isA) {
        tags[k].is = tags[k].isA;
      }
      if (tags[k].notA) {
        tags[k].not = tags[k].notA;
      }
      // add any implicit 'is' tags
      if (tags[k].is && typeof tags[k].is === 'string') {
        if (!already.hasOwnProperty(tags[k].is) && !tags.hasOwnProperty(tags[k].is)) {
          tags[tags[k].is] = {};
        }
      }
      // add any implicit 'not' tags
      if (tags[k].not && typeof tags[k].not === 'string' && !tags.hasOwnProperty(tags[k].not)) {
        if (!already.hasOwnProperty(tags[k].not) && !tags.hasOwnProperty(tags[k].not)) {
          tags[tags[k].not] = {};
        }
      }
    });
    return tags
  };


  const validate = function (tags, already) {

    tags = addImplied(tags, already);

    // property validation
    Object.keys(tags).forEach(k => {
      tags[k].children = toArr(tags[k].children);
      tags[k].not = toArr(tags[k].not);
    });
    // not links are bi-directional
    // add any incoming not tags
    Object.keys(tags).forEach(k => {
      let nots = tags[k].not || [];
      nots.forEach(no => {
        if (tags[no] && tags[no].not) {
          tags[no].not.push(k);
        }
      });
    });
    return tags
  };
  var validate$1 = validate;

  // 'fill-down' parent logic inference
  const compute$3 = function (allTags) {
    // setup graph-lib format
    const flatList = Object.keys(allTags).map(k => {
      let o = allTags[k];
      const props = { not: new Set(o.not), also: o.also, is: o.is, novel: o.novel };
      return { id: k, parent: o.is, props, children: [] }
    });
    const graph = _(flatList).cache().fillDown();
    return graph.out('array')
  };

  const fromUser = function (tags) {
    Object.keys(tags).forEach(k => {
      tags[k] = Object.assign({}, tags[k]);
      tags[k].novel = true;
    });
    return tags
  };

  const addTags$1 = function (tags, already) {
    // are these tags internal ones, or user-generated?
    if (Object.keys(already).length > 0) {
      tags = fromUser(tags);
    }
    tags = validate$1(tags, already);

    let allTags = Object.assign({}, already, tags);
    // do some basic setting-up
    // 'fill-down' parent logic
    const nodes = compute$3(allTags);
    // convert it to our final format
    const res = fmt$1(nodes);
    return res
  };
  var addTags$2 = addTags$1;

  var methods$4 = {
    one: {
      setTag: setTag$1,
      unTag: unTag$1,
      addTags: addTags$2
    },
  };

  /* eslint no-console: 0 */
  const isArray$1 = function (arr) {
    return Object.prototype.toString.call(arr) === '[object Array]'
  };
  const fns = {
    /** add a given tag, to all these terms */
    tag: function (input, reason = '', isSafe) {
      if (!this.found || !input) {
        return this
      }
      let terms = this.termList();
      if (terms.length === 0) {
        return this
      }
      const { methods, verbose, world } = this;
      // logger
      if (verbose === true) {
        console.log(' +  ', input, reason || '');
      }
      if (isArray$1(input)) {
        input.forEach(tag => methods.one.setTag(terms, tag, world, isSafe, reason));
      } else {
        methods.one.setTag(terms, input, world, isSafe, reason);
      }
      // uncache
      this.uncache();
      return this
    },

    /** add a given tag, only if it is consistent */
    tagSafe: function (input, reason = '') {
      return this.tag(input, reason, true)
    },

    /** remove a given tag from all these terms */
    unTag: function (input, reason) {
      if (!this.found || !input) {
        return this
      }
      let terms = this.termList();
      if (terms.length === 0) {
        return this
      }
      const { methods, verbose, model } = this;
      // logger
      if (verbose === true) {
        console.log(' -  ', input, reason || '');
      }
      let tagSet = model.one.tagSet;
      if (isArray$1(input)) {
        input.forEach(tag => methods.one.unTag(terms, tag, tagSet));
      } else {
        methods.one.unTag(terms, input, tagSet);
      }
      // uncache
      this.uncache();
      return this
    },

    /** return only the terms that can be this tag  */
    canBe: function (tag) {
      tag = tag.replace(/^#/, '');
      let tagSet = this.model.one.tagSet;
      // everything can be an unknown tag
      if (!tagSet.hasOwnProperty(tag)) {
        return this
      }
      let not = tagSet[tag].not || [];
      let nope = [];
      this.document.forEach((terms, n) => {
        terms.forEach((term, i) => {
          let found = not.find(no => term.tags.has(no));
          if (found) {
            nope.push([n, i, i + 1]);
          }
        });
      });
      let noDoc = this.update(nope);
      return this.difference(noDoc)
    },
  };
  var tag$1 = fns;

  const tagAPI = function (View) {
    Object.assign(View.prototype, tag$1);
  };
  var api$5 = tagAPI;

  // wire-up more pos-tags to our model
  const addTags = function (tags) {
    const { model, methods } = this.world();
    const tagSet = model.one.tagSet;
    const fn = methods.one.addTags;
    let res = fn(tags, tagSet);
    model.one.tagSet = res;
    return this
  };

  var lib$1 = { addTags };

  const boringTags = new Set(['Auxiliary', 'Possessive']);

  const sortByKids = function (tags, tagSet) {
    tags = tags.sort((a, b) => {
      // (unknown tags are interesting)
      if (boringTags.has(a) || !tagSet.hasOwnProperty(b)) {
        return 1
      }
      if (boringTags.has(b) || !tagSet.hasOwnProperty(a)) {
        return -1
      }
      let kids = tagSet[a].children || [];
      let aKids = kids.length;
      kids = tagSet[b].children || [];
      let bKids = kids.length;
      return aKids - bKids
    });
    return tags
  };

  const tagRank = function (view) {
    const { document, world } = view;
    const tagSet = world.model.one.tagSet;
    document.forEach(terms => {
      terms.forEach(term => {
        let tags = Array.from(term.tags);
        term.tagRank = sortByKids(tags, tagSet);
      });
    });
  };
  var tagRank$1 = tagRank;

  var tag = {
    model: {
      one: { tagSet: {} }
    },
    compute: {
      tagRank: tagRank$1
    },
    methods: methods$4,
    api: api$5,
    lib: lib$1
  };

  // split by periods, question marks, unicode ⁇, etc
  const initSplit = /([.!?\u203D\u2E18\u203C\u2047-\u2049\u3002]+\s)/g;
  // merge these back into prev sentence
  const splitsOnly = /^[.!?\u203D\u2E18\u203C\u2047-\u2049\u3002]+\s$/;
  const newLine = /((?:\r?\n|\r)+)/; // Match different new-line formats

  // Start with a regex:
  const basicSplit = function (text) {
    let all = [];
    //first, split by newline
    let lines = text.split(newLine);
    for (let i = 0; i < lines.length; i++) {
      //split by period, question-mark, and exclamation-mark
      let arr = lines[i].split(initSplit);
      for (let o = 0; o < arr.length; o++) {
        // merge 'foo' + '.'
        if (arr[o + 1] && splitsOnly.test(arr[o + 1]) === true) {
          arr[o] += arr[o + 1];
          arr[o + 1] = '';
        }
        if (arr[o] !== '') {
          all.push(arr[o]);
        }
      }
    }
    return all
  };
  var simpleSplit = basicSplit;

  const hasLetter$2 = /[a-z0-9\u00C0-\u00FF\u00a9\u00ae\u2000-\u3300\ud000-\udfff]/i;
  const hasSomething$1 = /\S/;

  const notEmpty = function (splits) {
    let chunks = [];
    for (let i = 0; i < splits.length; i++) {
      let s = splits[i];
      if (s === undefined || s === '') {
        continue
      }
      //this is meaningful whitespace
      if (hasSomething$1.test(s) === false || hasLetter$2.test(s) === false) {
        //add it to the last one
        if (chunks[chunks.length - 1]) {
          chunks[chunks.length - 1] += s;
          continue
        } else if (splits[i + 1]) {
          //add it to the next one
          splits[i + 1] = s + splits[i + 1];
          continue
        }
      }
      //else, only whitespace, no terms, no sentence
      chunks.push(s);
    }
    return chunks
  };
  var simpleMerge = notEmpty;

  //loop through these chunks, and join the non-sentence chunks back together..
  const smartMerge = function (chunks, world) {
    const isSentence = world.methods.one.tokenize.isSentence;
    const abbrevs = world.model.one.abbreviations || new Set();

    let sentences = [];
    for (let i = 0; i < chunks.length; i++) {
      let c = chunks[i];
      //should this chunk be combined with the next one?
      if (chunks[i + 1] && isSentence(c, abbrevs) === false) {
        chunks[i + 1] = c + (chunks[i + 1] || '');
      } else if (c && c.length > 0) {
        //this chunk is a proper sentence..
        sentences.push(c);
        chunks[i] = '';
      }
    }
    return sentences
  };
  var smartMerge$1 = smartMerge;

  // merge embedded quotes into 1 sentence
  // like - 'he said "no!" and left.' 
  const MAX_QUOTE = 280;// ¯\_(ツ)_/¯

  // don't support single-quotes for multi-sentences
  const pairs = {
    '\u0022': '\u0022', // 'StraightDoubleQuotes'
    '\uFF02': '\uFF02', // 'StraightDoubleQuotesWide'
    // '\u0027': '\u0027', // 'StraightSingleQuotes'
    '\u201C': '\u201D', // 'CommaDoubleQuotes'
    // '\u2018': '\u2019', // 'CommaSingleQuotes'
    '\u201F': '\u201D', // 'CurlyDoubleQuotesReversed'
    // '\u201B': '\u2019', // 'CurlySingleQuotesReversed'
    '\u201E': '\u201D', // 'LowCurlyDoubleQuotes'
    '\u2E42': '\u201D', // 'LowCurlyDoubleQuotesReversed'
    '\u201A': '\u2019', // 'LowCurlySingleQuotes'
    '\u00AB': '\u00BB', // 'AngleDoubleQuotes'
    '\u2039': '\u203A', // 'AngleSingleQuotes'
    '\u2035': '\u2032', // 'PrimeSingleQuotes'
    '\u2036': '\u2033', // 'PrimeDoubleQuotes'
    '\u2037': '\u2034', // 'PrimeTripleQuotes'
    '\u301D': '\u301E', // 'PrimeDoubleQuotes'
    // '\u0060': '\u00B4', // 'PrimeSingleQuotes'
    '\u301F': '\u301E', // 'LowPrimeDoubleQuotesReversed'
  };
  const openQuote = RegExp('(' + Object.keys(pairs).join('|') + ')', 'g');
  const closeQuote = RegExp('(' + Object.values(pairs).join('|') + ')', 'g');

  const closesQuote = function (str) {
    if (!str) {
      return false
    }
    let m = str.match(closeQuote);
    if (m !== null && m.length === 1) {
      return true
    }
    return false
  };

  // allow micro-sentences when inside a quotation, like:
  // the doc said "no sir. i will not beg" and walked away.
  const quoteMerge = function (splits) {
    let arr = [];
    for (let i = 0; i < splits.length; i += 1) {
      let split = splits[i];
      // do we have an open-quote and not a closed one?
      let m = split.match(openQuote);
      if (m !== null && m.length === 1) {

        // look at the next sentence for a closing quote,
        if (closesQuote(splits[i + 1]) && splits[i + 1].length < MAX_QUOTE) {
          splits[i] += splits[i + 1];// merge them
          arr.push(splits[i]);
          splits[i + 1] = '';
          i += 1;
          continue
        }
        // look at n+2 for a closing quote,
        if (closesQuote(splits[i + 2])) {
          let toAdd = splits[i + 1] + splits[i + 2];// merge them all
          //make sure it's not too-long
          if (toAdd.length < MAX_QUOTE) {
            splits[i] += toAdd;
            arr.push(splits[i]);
            splits[i + 1] = '';
            splits[i + 2] = '';
            i += 2;
            continue
          }
        }
      }
      arr.push(splits[i]);
    }
    return arr
  };
  var quoteMerge$1 = quoteMerge;

  const MAX_LEN = 250;// ¯\_(ツ)_/¯

  // support unicode variants?
  // https://stackoverflow.com/questions/13535172/list-of-all-unicodes-open-close-brackets
  const hasOpen = /\(/g;
  const hasClosed = /\)/g;
  const mergeParens = function (splits) {
    let arr = [];
    for (let i = 0; i < splits.length; i += 1) {
      let split = splits[i];
      let m = split.match(hasOpen);
      if (m !== null && m.length === 1) {
        // look at next sentence, for closing parenthesis
        if (splits[i + 1] && splits[i + 1].length < MAX_LEN) {
          let m2 = splits[i + 1].match(hasClosed);
          if (m2 !== null && m.length === 1 && !hasOpen.test(splits[i + 1])) {
            // merge in 2nd sentence
            splits[i] += splits[i + 1];
            arr.push(splits[i]);
            splits[i + 1] = '';
            i += 1;
            continue
          }
        }
      }
      arr.push(splits[i]);
    }
    return arr
  };
  var parensMerge = mergeParens;

  //(Rule-based sentence boundary segmentation) - chop given text into its proper sentences.
  // Ignore periods/questions/exclamations used in acronyms/abbreviations/numbers, etc.
  //regs-
  const hasSomething = /\S/;
  const startWhitespace = /^\s+/;

  const splitSentences = function (text, world) {
    text = text || '';
    text = String(text);
    // Ensure it 'smells like' a sentence
    if (!text || typeof text !== 'string' || hasSomething.test(text) === false) {
      return []
    }
    // cleanup unicode-spaces
    text = text.replace('\xa0', ' ');
    // First do a greedy-split..
    let splits = simpleSplit(text);
    // Filter-out the crap ones
    let sentences = simpleMerge(splits);
    //detection of non-sentence chunks:
    sentences = smartMerge$1(sentences, world);
    // allow 'he said "no sir." and left.'
    sentences = quoteMerge$1(sentences);
    // allow 'i thought (no way!) and left.'
    sentences = parensMerge(sentences);
    //if we never got a sentence, return the given text
    if (sentences.length === 0) {
      return [text]
    }
    //move whitespace to the ends of sentences, when possible
    //['hello',' world'] -> ['hello ','world']
    for (let i = 1; i < sentences.length; i += 1) {
      let ws = sentences[i].match(startWhitespace);
      if (ws !== null) {
        sentences[i - 1] += ws[0];
        sentences[i] = sentences[i].replace(startWhitespace, '');
      }
    }
    return sentences
  };
  var splitSentences$1 = splitSentences;

  const hasHyphen = function (str, model) {
    let parts = str.split(/[-–—]/);
    if (parts.length <= 1) {
      return false
    }
    const { prefixes, suffixes } = model.one;

    // l-theanine, x-ray
    if (parts[0].length === 1 && /[a-z]/i.test(parts[0])) {
      return false
    }
    //dont split 're-do'
    if (prefixes.hasOwnProperty(parts[0])) {
      return false
    }
    //dont split 'flower-like'
    parts[1] = parts[1].trim().replace(/[.?!]$/, '');
    if (suffixes.hasOwnProperty(parts[1])) {
      return false
    }
    //letter-number 'aug-20'
    let reg = /^([a-z\u00C0-\u00FF`"'/]+)[-–—]([a-z0-9\u00C0-\u00FF].*)/i;
    if (reg.test(str) === true) {
      return true
    }
    //number-letter '20-aug'
    let reg2 = /^([0-9]{1,4})[-–—]([a-z\u00C0-\u00FF`"'/-]+$)/i;
    if (reg2.test(str) === true) {
      return true
    }
    return false
  };

  const splitHyphens = function (word) {
    let arr = [];
    //support multiple-hyphenated-terms
    const hyphens = word.split(/[-–—]/);
    let whichDash = '-';
    let found = word.match(/[-–—]/);
    if (found && found[0]) {
      whichDash = found;
    }
    for (let o = 0; o < hyphens.length; o++) {
      if (o === hyphens.length - 1) {
        arr.push(hyphens[o]);
      } else {
        arr.push(hyphens[o] + whichDash);
      }
    }
    return arr
  };

  // combine '2 - 5' like '2-5' is
  // 2-4: 2, 4
  const combineRanges = function (arr) {
    const startRange = /^[0-9]{1,4}(:[0-9][0-9])?([a-z]{1,2})? ?[-–—] ?$/;
    const endRange = /^[0-9]{1,4}([a-z]{1,2})? ?$/;
    for (let i = 0; i < arr.length - 1; i += 1) {
      if (arr[i + 1] && startRange.test(arr[i]) && endRange.test(arr[i + 1])) {
        arr[i] = arr[i] + arr[i + 1];
        arr[i + 1] = null;
      }
    }
    return arr
  };
  var combineRanges$1 = combineRanges;

  const isSlash = /\p{L} ?\/ ?\p{L}+$/u;

  // 'he / she' should be one word
  const combineSlashes = function (arr) {
    for (let i = 1; i < arr.length - 1; i++) {
      if (isSlash.test(arr[i])) {
        arr[i - 1] += arr[i] + arr[i + 1];
        arr[i] = null;
        arr[i + 1] = null;
      }
    }
    return arr
  };
  var combineSlashes$1 = combineSlashes;

  const wordlike = /\S/;
  const isBoundary = /^[!?.]+$/;
  const naiiveSplit = /(\S+)/;

  let notWord = ['.', '?', '!', ':', ';', '-', '–', '—', '--', '...', '(', ')', '[', ']', '"', "'", '`', '«', '»', '*'];
  notWord = notWord.reduce((h, c) => {
    h[c] = true;
    return h
  }, {});

  const isArray = function (arr) {
    return Object.prototype.toString.call(arr) === '[object Array]'
  };

  //turn a string into an array of strings (naiive for now, lumped later)
  const splitWords = function (str, model) {
    let result = [];
    let arr = [];
    //start with a naiive split
    str = str || '';
    if (typeof str === 'number') {
      str = String(str);
    }
    if (isArray(str)) {
      return str
    }
    const words = str.split(naiiveSplit);
    for (let i = 0; i < words.length; i++) {
      //split 'one-two'
      if (hasHyphen(words[i], model) === true) {
        arr = arr.concat(splitHyphens(words[i]));
        continue
      }
      arr.push(words[i]);
    }
    //greedy merge whitespace+arr to the right
    let carry = '';
    for (let i = 0; i < arr.length; i++) {
      let word = arr[i];
      //if it's more than a whitespace
      if (wordlike.test(word) === true && notWord.hasOwnProperty(word) === false && isBoundary.test(word) === false) {
        //put whitespace on end of previous term, if possible
        if (result.length > 0) {
          result[result.length - 1] += carry;
          result.push(word);
        } else {
          //otherwise, but whitespace before
          result.push(carry + word);
        }
        carry = '';
      } else {
        carry += word;
      }
    }
    //handle last one
    if (carry) {
      if (result.length === 0) {
        result[0] = '';
      }
      result[result.length - 1] += carry; //put it on the end
    }
    // combine 'one / two'
    result = combineSlashes$1(result);
    result = combineRanges$1(result);
    // remove empty results
    result = result.filter(s => s);
    return result
  };
  var splitTerms = splitWords;

  //all punctuation marks, from https://en.wikipedia.org/wiki/Punctuation

  //we have slightly different rules for start/end - like #hashtags.
  const isLetter = /\p{Letter}/u;
  const isNumber$1 = /[\p{Number}\p{Currency_Symbol}]/u;
  const hasAcronym = /^[a-z]\.([a-z]\.)+/i;
  const chillin = /[sn]['’]$/;

  const normalizePunctuation = function (str, model) {
    // quick lookup for allowed pre/post punctuation
    let { prePunctuation, postPunctuation, emoticons } = model.one;
    let original = str;
    let pre = '';
    let post = '';
    let chars = Array.from(str);

    // punctuation-only words, like '<3'
    if (emoticons.hasOwnProperty(str.trim())) {
      return { str: str.trim(), pre, post: ' ' } //not great
    }

    // pop any punctuation off of the start
    let len = chars.length;
    for (let i = 0; i < len; i += 1) {
      let c = chars[0];
      // keep any declared chars
      if (prePunctuation[c] === true) {
        continue//keep it
      }
      // keep '+' or '-' only before a number
      if ((c === '+' || c === '-') && isNumber$1.test(chars[1])) {
        break//done
      }
      // '97 - year short-form
      if (c === "'" && c.length === 3 && isNumber$1.test(chars[1])) {
        break//done
      }
      // start of word
      if (isLetter.test(c) || isNumber$1.test(c)) {
        break //done
      }
      // punctuation
      pre += chars.shift();//keep going
    }

    // pop any punctuation off of the end
    len = chars.length;
    for (let i = 0; i < len; i += 1) {
      let c = chars[chars.length - 1];
      // keep any declared chars
      if (postPunctuation[c] === true) {
        continue//keep it
      }
      // start of word
      if (isLetter.test(c) || isNumber$1.test(c)) {
        break //done
      }
      // F.B.I.
      if (c === '.' && hasAcronym.test(original) === true) {
        continue//keep it
      }
      //  keep s-apostrophe - "flanders'" or "chillin'"
      if (c === "'" && chillin.test(original) === true) {
        continue//keep it
      }
      // punctuation
      post = chars.pop() + post;//keep going
    }

    str = chars.join('');
    //we went too far..
    if (str === '') {
      // do a very mild parse, and hope for the best.
      original = original.replace(/ *$/, after => {
        post = after || '';
        return ''
      });
      str = original;
      pre = '';
    }
    return { str, pre, post }
  };
  var tokenize$3 = normalizePunctuation;

  const parseTerm = (txt, model) => {
    // cleanup any punctuation as whitespace
    let { str, pre, post } = tokenize$3(txt, model);
    const parsed = {
      text: str,
      pre: pre,
      post: post,
      tags: new Set(),
    };
    return parsed
  };
  var splitWhitespace = parseTerm;

  // 'Björk' to 'Bjork'.
  const killUnicode = function (str, world) {
    const unicode = world.model.one.unicode || {};
    str = str || '';
    let chars = str.split('');
    chars.forEach((s, i) => {
      if (unicode[s]) {
        chars[i] = unicode[s];
      }
    });
    return chars.join('')
  };
  var killUnicode$1 = killUnicode;

  /** some basic operations on a string to reduce noise */
  const clean = function (str) {
    str = str || '';
    str = str.toLowerCase();
    str = str.trim();
    let original = str;
    //punctuation
    str = str.replace(/[,;.!?]+$/, '');
    //coerce Unicode ellipses
    str = str.replace(/\u2026/g, '...');
    //en-dash
    str = str.replace(/\u2013/g, '-');
    //strip leading & trailing grammatical punctuation
    if (/^[:;]/.test(str) === false) {
      str = str.replace(/\.{3,}$/g, '');
      str = str.replace(/[",.!:;?)]+$/g, '');
      str = str.replace(/^['"(]+/g, '');
    }
    // remove zero-width characters
    str = str.replace(/[\u200B-\u200D\uFEFF]/g, '');
    //do this again..
    str = str.trim();
    //oh shucks,
    if (str === '') {
      str = original;
    }
    //no-commas in numbers
    str = str.replace(/([0-9]),([0-9])/g, '$1$2');
    return str
  };
  var cleanup = clean;

  // do acronyms need to be ASCII?  ... kind of?
  const periodAcronym = /([A-Z]\.)+[A-Z]?,?$/;
  const oneLetterAcronym = /^[A-Z]\.,?$/;
  const noPeriodAcronym = /[A-Z]{2,}('s|,)?$/;
  const lowerCaseAcronym = /([a-z]\.)+[a-z]\.?$/;

  const isAcronym$2 = function (str) {
    //like N.D.A
    if (periodAcronym.test(str) === true) {
      return true
    }
    //like c.e.o
    if (lowerCaseAcronym.test(str) === true) {
      return true
    }
    //like 'F.'
    if (oneLetterAcronym.test(str) === true) {
      return true
    }
    //like NDA
    if (noPeriodAcronym.test(str) === true) {
      return true
    }
    return false
  };

  const doAcronym = function (str) {
    if (isAcronym$2(str)) {
      str = str.replace(/\./g, '');
    }
    return str
  };
  var doAcronyms = doAcronym;

  const normalize = function (term, world) {
    const killUnicode = world.methods.one.killUnicode;
    // console.log(world.methods.one)
    let str = term.text || '';
    str = cleanup(str);
    //(very) rough ASCII transliteration -  bjŏrk -> bjork
    str = killUnicode(str, world);
    str = doAcronyms(str);
    term.normal = str;
  };
  var normal = normalize;

  // turn a string input into a 'document' json format
  const parse = function (input, world) {
    const { methods, model } = world;
    const { splitSentences, splitTerms, splitWhitespace } = methods.one.tokenize;
    input = input || '';
    // split into sentences
    let sentences = splitSentences(input, world);
    // split into word objects
    input = sentences.map((txt) => {
      let terms = splitTerms(txt, model);
      // split into [pre-text-post]
      terms = terms.map(t => splitWhitespace(t, model));
      // add normalized term format, always
      terms.forEach((t) => {
        normal(t, world);
      });
      return terms
    });
    return input
  };
  var fromString = parse;

  const isAcronym$1 = /[ .][A-Z]\.? *$/i; //asci - 'n.s.a.'
  const hasEllipse$1 = /(?:\u2026|\.{2,}) *$/; // '...'
  const hasLetter$1 = /\p{L}/u;
  const leadInit = /^[A-Z]\. $/; // "W. Kensington"

  /** does this look like a sentence? */
  const isSentence$2 = function (str, abbrevs) {
    // must have a letter
    if (hasLetter$1.test(str) === false) {
      return false
    }
    // check for 'F.B.I.'
    if (isAcronym$1.test(str) === true) {
      return false
    }
    // check for leading initial - "W. Kensington"
    if (str.length === 3 && leadInit.test(str)) {
      return false
    }
    //check for '...'
    if (hasEllipse$1.test(str) === true) {
      return false
    }
    let txt = str.replace(/[.!?\u203D\u2E18\u203C\u2047-\u2049] *$/, '');
    let words = txt.split(' ');
    let lastWord = words[words.length - 1].toLowerCase();
    // check for 'Mr.'
    if (abbrevs.hasOwnProperty(lastWord) === true) {
      return false
    }
    // //check for jeopardy!
    // if (blacklist.hasOwnProperty(lastWord)) {
    //   return false
    // }
    return true
  };
  var isSentence$3 = isSentence$2;

  var methods$3 = {
    one: {
      killUnicode: killUnicode$1,
      tokenize: {
        splitSentences: splitSentences$1,
        isSentence: isSentence$3,
        splitTerms,
        splitWhitespace,
        fromString,
      },
    },
  };

  const aliases = {
    '&': 'and',
    '@': 'at',
    '%': 'percent',
    'plz': 'please',
    'bein': 'being',
  };
  var aliases$1 = aliases;

  var misc$2 = [
    'approx',
    'apt',
    'bc',
    'cyn',
    'eg',
    'esp',
    'est',
    'etc',
    'ex',
    'exp',
    'prob', //probably
    'pron', // Pronunciation
    'gal', //gallon
    'min',
    'pseud',
    'fig', //figure
    'jd',
    'lat', //latitude
    'lng', //longitude
    'vol', //volume
    'fm', //not am
    'def', //definition
    'misc',
    'plz', //please
    'ea', //each
    'ps',
    'sec', //second
    'pt',
    'pref', //preface
    'pl', //plural
    'pp', //pages
    'qt', //quarter
    'fr', //french
    'sq',
    'nee', //given name at birth
    'ss', //ship, or sections
    'tel',
    'temp',
    'vet',
    'ver', //version
    'fem', //feminine
    'masc', //masculine
    'eng', //engineering/english
    'adj', //adjective
    'vb', //verb
    'rb', //adverb
    'inf', //infinitive
    'situ', // in situ
    'vivo',
    'vitro',
    'wr', //world record
  ];

  var honorifics = [
    'adj',
    'adm',
    'adv',
    'asst',
    'atty',
    'bldg',
    'brig',
    'capt',
    'cmdr',
    'comdr',
    'cpl',
    'det',
    'dr',
    'esq',
    'gen',
    'gov',
    'hon',
    'jr',
    'llb',
    'lt',
    'maj',
    'messrs',
    'mlle',
    'mme',
    'mr',
    'mrs',
    'ms',
    'mstr',
    'phd',
    'prof',
    'pvt',
    'rep',
    'reps',
    'res',
    'rev',
    'sen',
    'sens',
    'sfc',
    'sgt',
    'sir',
    'sr',
    'supt',
    'surg'
    //miss
    //misses
  ];

  var months = ['jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'sept', 'oct', 'nov', 'dec'];

  var nouns$1 = [
    'ad',
    'al',
    'arc',
    'ba',
    'bl',
    'ca',
    'cca',
    'col',
    'corp',
    'ft',
    'fy',
    'ie',
    'lit',
    'ma',
    'md',
    'pd',
    'tce',
  ];

  var organizations = ['dept', 'univ', 'assn', 'bros', 'inc', 'ltd', 'co'];

  var places = [
    'rd',
    'st',
    'dist',
    'mt',
    'ave',
    'blvd',
    'cl',
    // 'ct',
    'cres',
    'hwy',
    //states
    'ariz',
    'cal',
    'calif',
    'colo',
    'conn',
    'fla',
    'fl',
    'ga',
    'ida',
    'ia',
    'kan',
    'kans',

    'minn',
    'neb',
    'nebr',
    'okla',
    'penna',
    'penn',
    'pa',
    'dak',
    'tenn',
    'tex',
    'ut',
    'vt',
    'va',
    'wis',
    'wisc',
    'wy',
    'wyo',
    'usafa',
    'alta',
    'ont',
    'que',
    'sask',
  ];

  // units that are abbreviations too
  var units = [
    'dl',
    'ml',
    'gal',
    // 'ft', //ambiguous
    'qt',
    'pt',
    'tbl',
    'tsp',
    'tbsp',
    'km',
    'dm', //decimeter
    'cm',
    'mm',
    'mi',
    'td',
    'hr', //hour
    'hrs', //hour
    'kg',
    'hg',
    'dg', //decigram
    'cg', //centigram
    'mg', //milligram
    'µg', //microgram
    'lb', //pound
    'oz', //ounce
    'sq ft',
    'hz', //hertz
    'mps', //meters per second
    'mph',
    'kmph', //kilometers per hour
    'kb', //kilobyte
    'mb', //megabyte
    // 'gb', //ambig
    'tb', //terabyte
    'lx', //lux
    'lm', //lumen
    // 'pa', //ambig
    'fl oz', //
    'yb',
  ];

  // add our abbreviation list to our lexicon
  let list = [
    [misc$2],
    [units, 'Unit'],
    [nouns$1, 'Noun'],
    [honorifics, 'Honorific'],
    [months, 'Month'],
    [organizations, 'Organization'],
    [places, 'Place'],
  ];
  // create key-val for sentence-tokenizer
  let abbreviations = {};
  // add them to a future lexicon
  let lexicon$3 = {};

  list.forEach(a => {
    a[0].forEach(w => {
      // sentence abbrevs
      abbreviations[w] = true;
      // future-lexicon
      lexicon$3[w] = 'Abbreviation';
      if (a[1] !== undefined) {
        lexicon$3[w] = [lexicon$3[w], a[1]];
      }
    });
  });

  // dashed prefixes that are not independent words
  //  'mid-century', 'pre-history'
  var prefixes$1 = [
    'anti',
    'bi',
    'co',
    'contra',
    'de',
    'extra',
    'infra',
    'inter',
    'intra',
    'macro',
    'micro',
    'mis',
    'mono',
    'multi',
    'peri',
    'pre',
    'pro',
    'proto',
    'pseudo',
    're',
    'sub',
    'supra',
    'trans',
    'tri',
    'un',
    'out', //out-lived
    'ex',//ex-wife

    // 'counter',
    // 'mid',
    // 'out',
    // 'non',
    // 'over',
    // 'post',
    // 'semi',
    // 'super', //'super-cool'
    // 'ultra', //'ulta-cool'
    // 'under',
    // 'whole',
  ].reduce((h, str) => {
    h[str] = true;
    return h
  }, {});

  // dashed suffixes that are not independent words
  //  'flower-like', 'president-elect'
  var suffixes$2 = {
    'like': true,
    'ish': true,
    'less': true,
    'able': true,
    'elect': true,
    'type': true,
    'designate': true,
    // 'fold':true,
  };

  //a hugely-ignorant, and widely subjective transliteration of latin, cryllic, greek unicode characters to english ascii.
  //approximate visual (not semantic or phonetic) relationship between unicode and ascii characters
  //http://en.wikipedia.org/wiki/List_of_Unicode_characters
  //https://docs.google.com/spreadsheet/ccc?key=0Ah46z755j7cVdFRDM1A2YVpwa1ZYWlpJM2pQZ003M0E
  let compact = {
    '!': '¡',
    '?': '¿Ɂ',
    '"': '“”"❝❞',
    "'": '‘‛❛❜’',
    '-': '—–',
    a: 'ªÀÁÂÃÄÅàáâãäåĀāĂăĄąǍǎǞǟǠǡǺǻȀȁȂȃȦȧȺΆΑΔΛάαλАаѦѧӐӑӒӓƛæ',
    b: 'ßþƀƁƂƃƄƅɃΒβϐϦБВЪЬвъьѢѣҌҍ',
    c: '¢©ÇçĆćĈĉĊċČčƆƇƈȻȼͻͼϲϹϽϾСсєҀҁҪҫ',
    d: 'ÐĎďĐđƉƊȡƋƌ',
    e: 'ÈÉÊËèéêëĒēĔĕĖėĘęĚěƐȄȅȆȇȨȩɆɇΈΕΞΣέεξϵЀЁЕеѐёҼҽҾҿӖӗ',
    f: 'ƑƒϜϝӺӻҒғſ',
    g: 'ĜĝĞğĠġĢģƓǤǥǦǧǴǵ',
    h: 'ĤĥĦħƕǶȞȟΉΗЂЊЋНнђћҢңҤҥҺһӉӊ',
    I: 'ÌÍÎÏ',
    i: 'ìíîïĨĩĪīĬĭĮįİıƖƗȈȉȊȋΊΐΪίιϊІЇії',
    j: 'ĴĵǰȷɈɉϳЈј',
    k: 'ĶķĸƘƙǨǩΚκЌЖКжкќҚқҜҝҞҟҠҡ',
    l: 'ĹĺĻļĽľĿŀŁłƚƪǀǏǐȴȽΙӀӏ',
    m: 'ΜϺϻМмӍӎ',
    n: 'ÑñŃńŅņŇňŉŊŋƝƞǸǹȠȵΝΠήηϞЍИЙЛПийлпѝҊҋӅӆӢӣӤӥπ',
    o: 'ÒÓÔÕÖØðòóôõöøŌōŎŏŐőƟƠơǑǒǪǫǬǭǾǿȌȍȎȏȪȫȬȭȮȯȰȱΌΘΟθοσόϕϘϙϬϴОФоѲѳӦӧӨөӪӫ',
    p: 'ƤΡρϷϸϼРрҎҏÞ',
    q: 'Ɋɋ',
    r: 'ŔŕŖŗŘřƦȐȑȒȓɌɍЃГЯгяѓҐґ',
    s: 'ŚśŜŝŞşŠšƧƨȘșȿЅѕ',
    t: 'ŢţŤťŦŧƫƬƭƮȚțȶȾΓΤτϮТт',
    u: 'ÙÚÛÜùúûüŨũŪūŬŭŮůŰűŲųƯưƱƲǓǔǕǖǗǘǙǚǛǜȔȕȖȗɄΰυϋύ',
    v: 'νѴѵѶѷ',
    w: 'ŴŵƜωώϖϢϣШЩшщѡѿ',
    x: '×ΧχϗϰХхҲҳӼӽӾӿ',
    y: 'ÝýÿŶŷŸƳƴȲȳɎɏΎΥΫγψϒϓϔЎУучўѰѱҮүҰұӮӯӰӱӲӳ',
    z: 'ŹźŻżŽžƵƶȤȥɀΖ',
  };
  //decompress data into two hashes
  let unicode = {};
  Object.keys(compact).forEach(function (k) {
    compact[k].split('').forEach(function (s) {
      unicode[s] = k;
    });
  });
  var unicode$1 = unicode;

  // https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5Cp%7Bpunctuation%7D

  // punctuation to keep at start of word
  const prePunctuation = {
    '#': true, //#hastag
    '@': true, //@atmention
    '_': true,//underscore
    '°': true,
    // '+': true,//+4
    // '\\-',//-4  (escape)
    // '.',//.4
    // zero-width chars
    '\u200B': true,
    '\u200C': true,
    '\u200D': true,
    '\uFEFF': true
  };

  // punctuation to keep at end of word
  const postPunctuation = {
    '%': true,//88%
    '_': true,//underscore
    '°': true,//degrees, italian ordinal
    // '\'',// sometimes
    // zero-width chars
    '\u200B': true,
    '\u200C': true,
    '\u200D': true,
    '\uFEFF': true
  };

  const emoticons = {
    '<3': true,
    '</3': true,
    '<\\3': true,
    ':^P': true,
    ':^p': true,
    ':^O': true,
    ':^3': true,
  };

  var model$1 = {
    one: {
      aliases: aliases$1,
      abbreviations,
      prefixes: prefixes$1,
      suffixes: suffixes$2,
      prePunctuation,
      postPunctuation,
      lexicon: lexicon$3, //give this one forward
      unicode: unicode$1,
      emoticons
    },
  };

  const hasSlash = /\//;
  const hasDomain = /[a-z]\.[a-z]/i;
  const isMath = /[0-9]/;
  // const hasSlash = /[a-z\u00C0-\u00FF] ?\/ ?[a-z\u00C0-\u00FF]/
  // const hasApostrophe = /['’]s$/

  const addAliases = function (term, world) {
    let str = term.normal || term.text || term.machine;
    const aliases = world.model.one.aliases;
    // lookup known aliases like '&'
    if (aliases.hasOwnProperty(str)) {
      term.alias = term.alias || [];
      term.alias.push(aliases[str]);
    }
    // support slashes as aliases
    if (hasSlash.test(str) && !hasDomain.test(str) && !isMath.test(str)) {
      let arr = str.split(hasSlash);
      // don't split urls and things
      if (arr.length <= 2) {
        arr.forEach(word => {
          word = word.trim();
          if (word !== '') {
            term.alias = term.alias || [];
            term.alias.push(word);
          }
        });
      }
    }
    // aliases for apostrophe-s
    // if (hasApostrophe.test(str)) {
    //   let main = str.replace(hasApostrophe, '').trim()
    //   term.alias = term.alias || []
    //   term.alias.push(main)
    // }
    return term
  };
  var alias = addAliases;

  const hasDash = /^\p{Letter}+-\p{Letter}+$/u;
  // 'machine' is a normalized form that looses human-readability
  const doMachine = function (term) {
    let str = term.implicit || term.normal || term.text;
    // remove apostrophes
    str = str.replace(/['’]s$/, '');
    str = str.replace(/s['’]$/, 's');
    //lookin'->looking (make it easier for conjugation)
    str = str.replace(/([aeiou][ktrp])in'$/, '$1ing');
    //turn re-enactment to reenactment
    if (hasDash.test(str)) {
      str = str.replace(/-/g, '');
    }
    //#tags, @mentions
    str = str.replace(/^[#@]/, '');
    if (str !== term.normal) {
      term.machine = str;
    }
  };
  var machine = doMachine;

  // sort words by frequency
  const freq = function (view) {
    let docs = view.docs;
    let counts = {};
    for (let i = 0; i < docs.length; i += 1) {
      for (let t = 0; t < docs[i].length; t += 1) {
        let term = docs[i][t];
        let word = term.machine || term.normal;
        counts[word] = counts[word] || 0;
        counts[word] += 1;
      }
    }
    // add counts on each term
    for (let i = 0; i < docs.length; i += 1) {
      for (let t = 0; t < docs[i].length; t += 1) {
        let term = docs[i][t];
        let word = term.machine || term.normal;
        term.freq = counts[word];
      }
    }
  };
  var freq$1 = freq;

  // get all character startings in doc
  const offset = function (view) {
    let elapsed = 0;
    let index = 0;
    let docs = view.document; //start from the actual-top
    for (let i = 0; i < docs.length; i += 1) {
      for (let t = 0; t < docs[i].length; t += 1) {
        let term = docs[i][t];
        term.offset = {
          index: index,
          start: elapsed + term.pre.length,
          length: term.text.length,
        };
        elapsed += term.pre.length + term.text.length + term.post.length;
        index += 1;
      }
    }
  };


  var offset$1 = offset;

  // cheat- add the document's pointer to the terms
  const index = function (view) {
    // console.log('reindex')
    let document = view.document;
    for (let n = 0; n < document.length; n += 1) {
      for (let i = 0; i < document[n].length; i += 1) {
        document[n][i].index = [n, i];
      }
    }
    // let ptrs = b.fullPointer
    // console.log(ptrs)
    // for (let i = 0; i < docs.length; i += 1) {
    //   const [n, start] = ptrs[i]
    //   for (let t = 0; t < docs[i].length; t += 1) {
    //     let term = docs[i][t]
    //     term.index = [n, start + t]
    //   }
    // }
  };

  var index$1 = index;

  const wordCount = function (view) {
    let n = 0;
    let docs = view.docs;
    for (let i = 0; i < docs.length; i += 1) {
      for (let t = 0; t < docs[i].length; t += 1) {
        if (docs[i][t].normal === '') {
          continue //skip implicit words
        }
        n += 1;
        docs[i][t].wordCount = n;
      }
    }
  };

  var wordCount$1 = wordCount;

  // cheat-method for a quick loop
  const termLoop = function (view, fn) {
    let docs = view.docs;
    for (let i = 0; i < docs.length; i += 1) {
      for (let t = 0; t < docs[i].length; t += 1) {
        fn(docs[i][t], view.world);
      }
    }
  };

  const methods$2 = {
    alias: (view) => termLoop(view, alias),
    machine: (view) => termLoop(view, machine),
    normal: (view) => termLoop(view, normal),
    freq: freq$1,
    offset: offset$1,
    index: index$1,
    wordCount: wordCount$1,
  };
  var compute$2 = methods$2;

  var tokenize$2 = {
    compute: compute$2,
    methods: methods$3,
    model: model$1,
    hooks: ['alias', 'machine', 'index', 'id'],
  };

  // const plugin = function (world) {
  //   let { methods, model, parsers } = world
  //   Object.assign({}, methods, _methods)
  //   Object.assign(model, _model)
  //   methods.one.tokenize.fromString = tokenize
  //   parsers.push('normal')
  //   parsers.push('alias')
  //   parsers.push('machine')
  //   // extend View class
  //   // addMethods(View)
  // }
  // export default plugin

  // lookup last word in the type-ahead prefixes
  const typeahead$1 = function (view) {
    const prefixes = view.model.one.typeahead;
    const docs = view.docs;
    if (docs.length === 0 || Object.keys(prefixes).length === 0) {
      return
    }
    let lastPhrase = docs[docs.length - 1] || [];
    let lastTerm = lastPhrase[lastPhrase.length - 1];
    // if we've already put whitespace, end.
    if (lastTerm.post) {
      return
    }
    // if we found something
    if (prefixes.hasOwnProperty(lastTerm.normal)) {
      let found = prefixes[lastTerm.normal];
      // add full-word as an implicit result
      lastTerm.implicit = found;
      lastTerm.machine = found;
      lastTerm.typeahead = true;
      // tag it, as our assumed term
      if (view.compute.preTagger) {
        view.last().unTag('*').compute(['lexicon', 'preTagger']);
      }
    }
  };

  var compute$1 = { typeahead: typeahead$1 };

  // assume any discovered prefixes
  const autoFill = function () {
    const docs = this.docs;
    if (docs.length === 0) {
      return this
    }
    let lastPhrase = docs[docs.length - 1] || [];
    let term = lastPhrase[lastPhrase.length - 1];
    if (term.typeahead === true && term.machine) {
      term.text = term.machine;
      term.normal = term.machine;
    }
    return this
  };

  const api$3 = function (View) {
    View.prototype.autoFill = autoFill;
  };
  var api$4 = api$3;

  // generate all the possible prefixes up-front
  const getPrefixes = function (arr, opts, world) {
    let index = {};
    let collisions = [];
    let existing = world.prefixes || {};
    arr.forEach((str) => {
      str = str.toLowerCase().trim();
      let max = str.length;
      if (opts.max && max > opts.max) {
        max = opts.max;
      }
      for (let size = opts.min; size < max; size += 1) {
        let prefix = str.substring(0, size);
        // ensure prefix is not a word
        if (opts.safe && world.model.one.lexicon.hasOwnProperty(prefix)) {
          continue
        }
        // does it already exist?
        if (existing.hasOwnProperty(prefix) === true) {
          collisions.push(prefix);
          continue
        }
        if (index.hasOwnProperty(prefix) === true) {
          collisions.push(prefix);
          continue
        }
        index[prefix] = str;
      }
    });
    // merge with existing prefixes
    index = Object.assign({}, existing, index);
    // remove ambiguous-prefixes
    collisions.forEach((str) => {
      delete index[str];
    });
    return index
  };

  var allPrefixes = getPrefixes;

  const isObject = val => {
    return Object.prototype.toString.call(val) === '[object Object]'
  };

  const defaults = {
    safe: true,
    min: 3,
  };

  const prepare = function (words = [], opts = {}) {
    let model = this.model();
    opts = Object.assign({}, defaults, opts);
    if (isObject(words)) {
      Object.assign(model.one.lexicon, words);
      words = Object.keys(words);
    }
    let prefixes = allPrefixes(words, opts, this.world());
    // manually combine these with any existing prefixes
    Object.keys(prefixes).forEach(str => {
      // explode any overlaps
      if (model.one.typeahead.hasOwnProperty(str)) {
        delete model.one.typeahead[str];
        return
      }
      model.one.typeahead[str] = prefixes[str];
    });
    return this
  };

  var lib = {
    typeahead: prepare
  };

  const model = {
    one: {
      typeahead: {} //set a blank key-val
    }
  };
  var typeahead = {
    model,
    api: api$4,
    lib,
    compute: compute$1,
    hooks: ['typeahead']
  };

  // order here matters
  nlp$1.extend(change); //0kb
  nlp$1.extend(output$1); //0kb
  nlp$1.extend(match); //10kb
  nlp$1.extend(pointers); //2kb
  nlp$1.extend(tag); //2kb
  nlp$1.plugin(contractions); //~6kb
  nlp$1.extend(tokenize$2); //7kb
  nlp$1.plugin(cache$1); //~1kb
  nlp$1.extend(lookup); //7kb
  nlp$1.extend(typeahead); //1kb
  nlp$1.extend(lexicon$4); //1kb
  nlp$1.extend(sweep); //1kb

  // generated in ./lib/lexicon
  var lexData = {
    "City": "true¦0:3O;1:54;2:3U;3:4P;4:4I;5:3P;6:38;あ58い56う54えび53か52さ51たつ53つ4Zにかほ市,ひたちなか市,ふじみ1み4Yむつ市,一4X七尾市,三4W上4U下4T世田谷区,中4Q串4P丸亀市,丹波4N久4L亀4K二4I五4H井3交1京4G人吉市,今治市,仙4F伊4B会津若4J佐4A倉49備48光市,入4P八45出44函館市,刈43別42前41加3Z勝3Y北3S匝瑳市,十3R千3P半0南3M印3L厚3K取3J古3I可児市,台東区,各務3合3H吉3G名3F向日市,君6吹0呉市,周3D和3C品3B唐6善通3A喜多39嘉麻市,四37国36土33坂32垂35城陽市,堺市,塩31境港市,墨3Q士30壱岐市,夕張市,多2Y大2T天2S太2R奄美市,奈2Q奥3X妙高市,姫2P姶2Q嬉1宇2N守2M安2K宍粟市,宗像市,宜野湾市,宝2J室2I宮2G宿毛市,富2E寒河2D寝屋2対3O射35小2B尼2A尾28山27岐阜市,岡26岩25岸和0島24川23市22帯広市,常20平1Z幸3J広5庄3府中市,座4P延1Y廿日38弘48弥富市,彦1X御1W徳5志1V恵1U愛3L成0我孫46戸0所29指宿市,掛2摂6敦1T文京区,新1S日1R旭4R明1Q春日1P昭5曽於市,有0朝1O木1N本1M札幌市,杉並区,村1L東1I杵築市,松1H板橋区,枕2A枚39柏4D柳1G栃3K栗1F根室市,桐生市,桑1E桜1G桶2横1D橋1C橿3歌志1B武19気仙3N水18氷2Z江17池0沖縄市,河内長1沼16泉15津14洲1C流4浅口市,浜13浦12海11淡2P深10清0Z渋0Y港区,湖0X湯29滑2滝0W潟上市,潮来市,瀬戸0V焼6熊0U熱海市,燕市,牛久市,牧之3犬4狛2D狭4玉0T珠洲市,瑞0S生駒市,田0R由0Q甲0P男0O町0留萌市,登0N白0M益0盛1Y目黒区,直39相0L真0K矢板市,知0J石0I砂2砺波市,碧3D磐0神0H福0G秋0秦1秩0F稚1B稲0E立2竹24笛吹市,笠0D筑0C箕面市,米0B糸0A紀の2紋30結3T網走市,綾09総社市,練馬区,美07羽06習志1胎1B能05臼杵市,舞鶴市,船41芦04花巻市,苫小牧市,茂3茅03茨3K草02荒01菊00萩市,葛Z蒲郡市,蓮0蕨市,薩摩川1B藤Y行X袋2C袖ヶ浦市,裾1西W見附市,観音3A角0調布市,諏訪市,諫早市,豊U貝2J赤T越S足R輪5近江八幡市,逗46遠1那P郡1L都O酒0野N金29釜1Q釧2P鈴0O鉾0銚46鎌M長K門真市,関市,阪3D防42阿J陸前高0雲I霧5青H静1Y韮2A須G飛騨市,飯F養0F館E香D駒ヶ1X高C魚B鯖2D鳥A鳴門市,鴨2鴻巣市,鶴9鹿8黒7龍ヶ2A;石市,部市;児5屋市,島市,嶋市,沼市,角市;ヶ5岡市;取市,栖市,羽市;沼市,津市;山市,岡市,島市,崎市,松市,梁市,槻市,浜市,知市,石市,砂市,萩市;南市,取市,美市,芝市;山市,林市;塚市,山市,田市,能市;坂市,崎市,賀2;梅市,森市;仙市,南市;久1K南市,波市,蘇市,賀1;久35井市,岡7崎市,浜市,野市,門市;京市,市;ヶ3N倉市;々2R洲市,田市;城市,留市;珂48覇市,須7;塩3烏4;利市,立区;前市,谷市;平市,磐市,穂市;中市,前市,岡市,島区,川市,後7明市,橋市,田市,見35;大1高0;之表市,予市,宮市,尾市,条市,東京市,海市,脇市,都市;方市,橋市,田市;井2I岡市,枝市,沢市;城市,飾区;川市,池市;尾市,川区;加市,津市;ヶ1D野市;別市,屋市;代市,美市;咋市,島市,曳1村市,生市;作市,唄市,濃7祢市,馬市;加茂市,市;瀬市,部市;島市,満市,魚2;原市,子市,沢市;後市,紫1西市;岡市,間市;城市,敷市,沢市;父市;井市,山市,岡市,島市,津市,生市,知4;埼市,戸市,栖市;垣市,岡市,巻市,狩市;多市,立市;岡市,庭市;模3生市,馬市;井市,山市,岡市,河市,石市;別市,米市;鹿市;州市,府市,斐市,賀市;利本荘市,布市;原市,川市,村市,辺市;浪市,穂市;名市,野市;本市,谷市,野市;内市,市;川市,沢市;南市,西市;川市,谷区;瀬市,須市;川市,谷市;南市,津市,老J;安市,添市;松市,田市;久11山市,島市,市;佐1南市,大6;津市,田市;別市,南市,戸1A東区,津市,田5;俣市,戸市;蔵7雄市;村4野市;内市;本市;手市,浜市,須M;名市;原市,東市;井市,川市;原市,山市,戸市,本市,江市,浦市,阪市;かがわ市,久留2A京特別区部,大8広5御市,村4松7根市,海市,温市,近01金市;山市,島市;和市,阪市;上市,山市;宮市,巣市,庄市;更6津2;倉市,来市,霞市;井市,市,部市;石市;光市,南市,向市,田市,立市,置市,進市,野市,高市;城市,宮市,宿区,居浜市,庄市,座市,潟市,発0見市;賀市;庭市,那市;布0S摩市,木市;前K坊市,所市,殿場市;根市;岡市;塚市,川市,戸市;滑市,総市,陸7;大T太0;原市,川市;口市,崎市,西市,越市;原市,田市;倉市,出市,国市,沼市,見A;山市,崎市,谷市;口市,形市,梨市,武市,県市,陽小野0鹿市;張旭市,花7道市,鷲市;沢市;崎市;千0Y城市,山市,平市,松C林市,樽市,浜市,牧市,田3矢部市,美玉市,諸市,郡市,野市,金7;井市;江市;士7山市,岡市,津市,田林市,良1谷市,里市;吉0宮市,市,見市;古7崎市,津市,若市;島市,市;戸市,蘭市;塚市;中市,城市,曇1来市,芸7;市,高0;口市,山市,谷市;佐市,和5土市,城市,治市,部市,都7陀市;宮市;路市;良市;宰0H田市;理市,童市,草市;仙市,分市,和A垣市,崎市,川市,府市,月市,村市,東市,津市,洲市,牟0田9町市,竹市,網白0R船渡市,野8阪7館市;市,狭4;城市,市;区,原市,市;市,郡4高0;久市,摩市,治7賀01;見市;別市;尻市,竈市;井市,出市,戸市,東市;佐7岐市,浦市;市,清7;水市;分A東市,立市;万十市,国中央市,日7條畷市,街道市;市市;方市;寺市;川区;光市,歌4泉市;南市;津市;取市,古N寄市,張市,護市;川市,野2;志市;河市,賀市;手市;木市;西市;あわじ市,さつ0Pアルプス市,丹市,九H国市,城市,島3房総市,相8砺市,足柄市,陽市,魚7;沼市;馬市;代7曲市,歳市,葉市;田区;和0日町市;上市,九B区,名古A広5斗市,本市,杜市,秋0茨7見市;城市;田市;島市;屋市;州市;山市,浦市;古2東市,茂市,西市,賀市,須市;川市;橋市;府市;谷市;水市,雲市;代市,千代市,女市,尾市,幡8戸市,潮市,王7街市;子市;市,平市,浜市;前市;吉市,敷市;世保市,久市,伯市,倉市,渡市,賀市,野市;万9丹市,予市,佐市,勢8東市,豆7賀市,達市,那市;の国市,市;原市,崎市,市;里市;北市,台市;丹後市,田辺市,都市;島市,所川3條市,泉市;戸市,本7;松市;山市,岡市;喜市,慈市,留7;米市;市,篠4;山市;間市;央8津7野8間市;川市,市;区,市;呂市,妻市,松市,田市,野市,関市;天草市,尾市,山市,田市,越市,野3;原市;原市,好市,島市,木市,条市,次市,沢市,浦市,田市,笠市,豊市,郷市,鷹市;宮市,関市;どり市,やDよし市;がる市,くば7;みらい市,市;いたAくEぬC;すみがうDほく市;の市;きは市,る7;ま市;すみ市,ちき串木1なべ市,わ7;き市;きる1ま市,わ7;ら市;野市",
    "Country": "true¦0:17;1:1F;ア15イ11ウ0Xエ0Vオ0Sカ0Qガ0Oキ0Mギ0Kク0Hグ0Gケ0コ0Dサ0Bザン0Pシ0Aジ09ス04セ01ソZタYチXツバル,デンマWトUドSナRニQネパ0Rノルウェー,ハPバOパMフKブIベHペルー,ホンジュラス,ボGポFマEミDメキシコ,モ9ヨル05ラ8リ7ル6レ5ロ13中4北3南2台湾,日本,東ティモ0R沿ドニエストル,西サハラ,赤道ギ0韓国;アフ1Aオセ0Hスー04;キプ0L朝鮮;国,央アフリカ共0C;ソト,バノン;クセンブルク,ワ0Vーマ0;トア0ヒテンシュタ02ビア,ベ13;オス,ト0I;ザンビOナコ,ル4ロッコ,ン3ーリ2;シャス,タ0;ゴル,テネグロ;ディブ,ドバ;クロネシア0Yャンマー;ケドニア旧ユーゴスラビア共02ダガスカル,ラウイ,リ,ルタ,レー0Qーシャル06;ルトPーラ1;スニア・ヘルツェゴビナ,ツワナ,リ0A;トナム,ナン,ネズエラ,ラルーシ,リーズ,ルギー;ラジル,ル2ー0X;ガ0Rキナファソ,ネイ,ンジ;ィ2ランス;ジー,リピン,ンラ1;キス0Tナマ,プアニューギ0ラ2レスチナ;オ,グ0C;チカン,ヌアツ,ハマ,ルバドス,ングラデシュ,ーレ07;イチ,ンガリー;ウエ,カラグア,ジェ02ュージーラ1;イジェ0Jウル,ゴルノ・カラバフ,ミZ;イツ,ミニカ2;共N国;リニダード・トバゴ,ル2ンガ,ーゴ;クメ0Jコ;ーク;ェコ,ャド,ュニ0Gリ;イ,ジ02ンザ0;マリ2ロモンL;ア,ラ1;ネ3ルPント2ーシェル;クリストファー・ネイビス,ビンセントおよびグレナディーンIル02;ガル;イス,ウェーデン,ペ5リ4ロ3ワジラ1ー2;ダン;バキア,ベ0;ナム,ランカ;イン;ブチ,ャマイカ,ョー04ンバブエ;エラレオネ,リア,ンガポI;ウジアラFモア,ン2;トメ・プリンシペ,マリノ;スタZソボ,モロ,ロンDンゴ2ートジボワF;共2民主共2;和国;アテマラ,レナダ;ウェート,ック3ロア2;チア;諸島;ニア2リシャ;!ビサウ;プ2ューバ,リバス,ルギス;ロス;イアナ,ボン,ン2ーナ;ビア;ザフスPタ2ナダ,メル5ンボNーボベルデ;ール;マ3ラ9ースト2;ラHリア;ーン;クア2ジプト,スト0チオピア,リトFルサルバ2;ドル;ガ4クライナ,ズベ3ルグ2;アイ;キスG;ンダ;エメン,ギリス,スラエル,タ9ラ4ンド2;!ネ2;シア;ク,ン;イBゼルバイジャン,フガ9ブハ8メ7ラブ首長国6ル3ン2;ゴラ,ティグア・バーブーダ,ドラ;ジェ3ゼンチン,バ0メ0;ニア;リア;連邦;リカ;ジア;ニス2;タン;スラ1ルラ1;ンド",
    "Noun": "true¦お02ご飯,コップ,パン,ペン,一緒,上,下,世界,両親,中01予定,事00二人,人Z今Y休み,会社X住所,体,値段,側,傘,兄,先W光,八百屋,公園,内,写真,冬,分,切手,前,医者,午V単語,博物館,卵,原因,去年,友達,口,台所,右,名前,味噌,問題,喫茶店,図書館,国,地U場所,塩,声,夏,夕方,外,夜,夢,大T天気,夫,奥,女S妹,妻,姉,娘,子供,季節,学R客,家Q宿題,封筒,山,島,川,左,市,帽子,平P年O店X庭,弁当,弟,形,後ろ,御飯,心,息子,意味,戸,所N扉,手M指L授業,教K数,文J料金,新聞,方I日H明日,映画館,春,昨日,昼G時F晩ご飯,月,服,朝G本E机,村,来D果物,森,椅子,横,橋,歯,母,毎C気B水,池,海,消しゴム,湖,漢字,火,為,父,片P牛乳,物,珈琲,理由,瓶,生徒,田舎,男S町,畑,病院,皆A皿,目,看護師,県,真ん中,眼鏡,着物,砂糖,社長,祖9秋,秒,税金,空8窓,端,答え,箱,箸,米,紙,結果,絵,美術館,考え,耳,肉,肩,背中,腕,腹,自7船,色,苗字,英語,茶碗,荷物,葉書,街,袋,規則,角,言6計画,試験,話,財布,赤ちゃん,足,車,辞書,辺り,近く,週5道4違い,遠く,部3郵便局,都市,酒,醤油,野菜,量,金,鉛筆,銀行,鍵,間,隣,雑誌,雨,雪,雲,雷,電車,靴,鞄,韓国語,音,頭,顔,風2飛行機,食1飲み物,首0駅,魚,鼻;!都;べ物,堂;!呂;屋,長;!路;!末;葉,語;動車,転車;!港;母,父;!さん;!持ち;年,日,晩,月,朝,週;年,月,週;!屋;!計,間;!ご飯;!本語;!法;字,法,章;室,科書;!輪;!紙;!為;!齢;仮名;!族;校,生;!性;人,学;下鉄,図,震;前,後;月,生,週;!員;!年,日,晩,月,朝,週;!々,間;!務所;!国語;客さん,茶,金",
    "SuruVerb": "true¦中止,予約,仕事,会8使用,修理,出発,判断,利用,到着,努力,勉強,参加,反対,報告,増加,変7失敗,契約,安心,完成,実6対応,延期,建設,影響,復帰,心配,想像,感謝,成5我慢,投票,招待,掃除,提供,改善,散歩,料理,旅行,期待,案内,棄権,検討,決定,注4洗濯,活動,減少,準備,理解,生活,用意,発3相談,研究,確認,移動,管理,約束,納得,紹介,終了,経験,結婚,緊張,練習,考慮,製造,解決,記憶,評価,認可,説明,調査,議論,販売,買い物,賛成,質問,輸2返事,連絡,逸脱,運1遠慮,選択,開0関係,電話;始,発;動,営,転;入,出;明,表,見,言;意,文;功,長;現,行;化,更;話,議",
    "Pronoun": "true¦あJおHかFきDこCしょうせい,じぶん,そCてBへいIぼく,やつ,わ7俺6僕,儂,其奴,吾,小生,弊社,彼5御4我2手前,此奴,私1自分,貴0;下,女,官,方,様,男,社;!たち;!々,が0等;!社;宅,社;!女,奴,等;!様;が2し,た1て,れ0;!ら,われ;くし,し;!しゃ;まえ,めえ;いつ,やつ;か0さま,しゃ,み;!ん;のじょ,れ0;!ら;いら,たく,まえ,ら,れ,ん0前,宅;しゃ;いつ,た1なた,の0やつ,んた;かた,ひと,人,方;い,くし,し",
    "Adverb": "true¦0:0W;あ0Tい0Iお0Hか0Eき0Dくする,けっ0Cこ0Bごとき / ごとく / ごとし,さっき,し0Aじゅう09す07ず06ぜ05そ04た01だZちょYつXできるだけ,とWどTなSのんびり,はOばかりに,ひNびMふLべつに～0ほKまGみFむしろ,めったにEもDやBゆMよAわりと,一9丁度,万一,主に,今に0S以8全7再び,初R別6前に,割と,十分,大5実に,少4後で,必ず,急に,意外,敢えて,早く,時々,普2最後に,本当に,果たQ案の定,極R決してE特に,直接,相当,真っ直ぐ,突然,約,結1絶対,色々 ,間に,非常に;局,構;段,通1;! ;し,すこし;丈夫,体,分,変;々に,に～0;く～0然,部;上に,外;人,体,層,度に,応,旦,気に,番,種;うやく,く;っ1はり;と,ぱり;う,しかしたら,っと,はや;!～0;たIんな;あまあ,えに,すます,ず,だ3っ2でに,る1んいち;っ8で;すぐ,たく～0;!しも,～ていません;とんど,んと03;たHつう,と;っくり;じょ00とり;じ3た2っ1やく;きり;して;めて;かなか,るべく;う2ん1;どん,なに～W;!してXせ,にも～0やら;うとう,きどき,ても;いに;うど,っと;い1んだん;じょうぶ,ぶ;い2くさん,しかに,び1ぶん,まに;たび;して,てい;こそこ,ろそろ;ひ,んぜん;い3っと;ぐ1こし,っかり,でに;!に;ぶん;ばしば,ょっちゅう;う,とごとく,れから;きょく,こう,して～0;っと,ゅA;た2つて,な1何か;にか,らず,り;がた,わら;そらく,よそ;か9がい,きなり,く6じょ5ち4っ1つも,まにAろいろ;きに,し2そう,た1ぱい;い,ん;ゅ,ょに;おう,どに,ばん;うに;つ,ら1;!～1;ても;が,に1;!も;いだに,えて,くまでも,とで,まり2らかじめ,ん1;のじょう,まり;!にも,～0;ない",
    "Adjective": "true¦0:06;あ03い02う01え00おWかVきUくYこわい,さTしQすOずNせまい,たMだLちJつHていねい,とおい,なGにGぬNねTはFひEふDほCまAみ9む8めずら0もったい04や7ゆうめい,よ6わ5上手い,不味い,丸い,低い,偉い,優0円い,冷I凄い,危04厚い,厳0古い,可愛い,喧0四角い,固い,塩辛い,多い,大4太い,好ま0嬉0安い,寂0寒い,小K少04広い,弱い,強い,忙0怖い,恐ろ0恥8悔0悪い,悲0惜0惨い,慌ただ0懐か0新0早い,明N易0暑い,暖07暗い,望ま0柔ら07楽0欲0正0汚3浅い,涼0深い,温2激0濃い,熱い,狭い,珍0甘い,疑わ0痛い,白い,相応0眠い,眩0短い,硬い,素晴ら0細い,緩い,美1肌寒い,良い,若い,苦B荒い,薄い,親R詰まら04詳0貧0賢い,赤い,軽い,辛い,近い,速い,遅い,遠い,酷い,酸っP醜い,重い,鈍い,鋭い,長い,難0青い,面白い,頼も0騒が0高い,魅力の04黄色い,黒い;しい,味0;い,かい;い,ら0;きい,人0;かい,るい;い,わい;さ0すい,ばい,わら00;ずか0;じYにくい,りょくのV;ず1るい;い,しい;しい,そい;とい,るい;くい,どい,ろい;だざEやい;がい;まらNめ1よい,らい;たい;い1かい;さい;さい,るい;かい,だ0の0;るい;くGごい,ず0っ1ばら0;ぱい;おかAか2た1ろい;しみやすい;くい,たC;むい;い4たAつい;たい,な0らい,るい,わいい;い0お3そい,とな0も1;い,し1;ろい;い,きい;らい;すい,つく0まい,れ0;い,そが0たい;おい,か5た2つい,ぶ1まい,らい;ない;た2ら0;しい;かい;い,るい",
    "AdverbialParticle": "true¦く1ぐ1ずつ,だけ,とか,な0ばかり,ほど,やら;ど,んか;らい",
    "NaAdjective": "true¦あCいBおAかんたん,がんこ,き9げんき,こ8さいわい,ざんねん,し5じ3す2せいBなめ1にぎDひま,ふくざつ,へ0べんり,まじめ,みりょく7丁寧,丈夫,上手,下手,便利,元気,危険,変,大嫌い,奇麗,好き,嫌い,孤独,安全,平均的,幸い,新鮮,暇,有名,正常,残念,滑1無料,異常,真面目,社交的,簡単,素敵,綺麗,色々,複雑,親切,賑D重要,静か,頑固,高価,魅力的,鮮D;いきん6た,ん;らか;き,てき;ゅうよう,ょう0;ず,ぶ;ずか,ゃこう1んせ0;つ,ん;てき;うか,どく;けん,らい,れい;かねもち,金持ち;じょう;ざ0んぜん;やか",
    "Conjunction": "true¦あ0Wい0Vお0Oか0Mぎゃくに,こう0Nさ0Kし0Fじゃ0Eす0DそYたVだRちなQってか,つNてMでJとGど04なBにもかかわらず,のため,はんめん,ふんAほ7ま6も4ゆ00よ0Hわけ02んA一方3並びに,乃至,亦,但X併0X例W即ち,又F及び,反面,同0Q否,因Q実は,尚,尤も,従0H恐0R惜し0T或2故に,本当は,次1然し0若し0U譬W追0H逆に;!な0R乍ら;いで,に;いは,は;!で;し0っとも,また;!くは;してや,ずは,た8;な1ん0;じゃ,で,なら;!ら;じゃ;いし3お,かん2ぜなら,の1ら0;ば,びに;で,に;ずく,づく;!は;いうのも,ころ1す04も0同時に;あれ,す03に;が,で;す1な0は;いと,け00;から,が,けれど;か,ゆーか;い1ま0;り,るところ;ては,で;みに;から2が,け1って,とす0;ると,れば;ど,れども;!こそ,といM;だ1と0め;えば,へば;!し;うAこで,しCの8もそも,やさかい,りゃ,れ0ーいや;から,だPで6と5ど4な3に1も,ゆ0;えに;!し0;ても;のに,ら;ころか;!も;!いて,は,も;うえ0上,後;!で,に;い2し1す0ですが,な0;ると;たら,て;えば,や;なわち,ると;!が;か2た0;が0ら;って;し0も;!な8;て,もなけ0らに,りとて,れど;れば;く0たや,つ;して;し4そ2な1ま0よび;けに;じく;れな0;がら;むら0;くは;え,っぽう,や;るいは,わ0;せて",
    "Expression": "true¦あ0Vい0Tう0Qえ0Nお0Gきゃ0Fぎ0Cぐふ0Bげっ,こ06ご03さ01ざまあみろ,じゃ0UすZそXただいまWどRなNねぇ,はMひ0KふLへIほHまGもしもし,やFよAわ9ア7ウ6オヤスミ,ガ5キャ4コンニチワ,ゴメン,サヨナラ,デヘヘ,トホホ,ハッハッハ,バカヤロー,ヒヒヒ,フ3メリークリスマス,モシモシ,ヤ2ヨロシク,ワ1南無,嗚呼,御0有難う;意,馳走0I;ァー,ーッ;ダー,ッター,レヤレ;ェ1ムフム;ッ,ー;ーン;ヒャー,ーン,～ン;ッ0ハハ,リガトウ;カンベー,プップ～;ぁZあ,っ,んわん,ーい;い3う2お,くもまあ,し1っ0ーし;こら2しゃ;っ,ゃ;こそ,し;しょ;ぁ,あ,れやれ;ぁ,あS;う,んと;え1ー0;え,っ;え,ッ,ー;うん,ふふ,むふむ,ん,ーん;い,じめ8っ,てな,ーい;あ2む,るほど,ん0;てこった,と0;!まあ,もはや;に,んだ;う2っこい1れどれ,ー0;ぞ,も;!しょ;いたし0ぞ,も;まして;!ッ;う0らそら,れ;!ですね,ね;い0まん,み0ん0;ません;ぁ,あ7てと,よ0らば;うなら,なら;きげんEくろうさん,ちそうFっつぁん,めん1苦労さ0馳走F;ま,ん;!くだGなG;ら3りゃ2れこれ,ん0;にち0ばん0;は,わ;!ー;!ぁ;!っ;ゃ1ょ0;!い,ぎょ;あ,ふん;あ,ー;!い,ぉ,お,かえり4ぎ3そまつ2っ,つかれ様,は1めでとう,や0ーい,早う,疲れ2粗末2;!すみ3っ;よう;さま,様;ゃー;!な0;さい;え1っ,ー0;っ,ッ;!い;うん,ふ1わ,ん,ー0;む,ん;!っ,ふ;いえ,えいえ,ただきます,や0ーえ;ぁ,あ,ー;ぁ,あ,いた,かん6きまへん,っ5ら4り1れ0ーあ;!よあれよ,れ,ー;がと1ゃ0;!りゃ;!う;!ッ,ー;!かんべー;!べ",
    "Value": "true¦一,七,三,九,二,五,八,六,十,千,四,百",
    "Weekday": "true¦土0日0月0木0水0火0金0;曜日",
    "Godan": "true¦0:19;1:0Z;2:04;あ19い16う14えらぶ,お12か0Zがんばる,き0Yく0Wけす,こ0Vござる,さ0Tし0Sす0Rそ0Qた0Pだ0Oち0Nつ0Kてつだう,と0Jな0Hねむる,の0Gは0Fひ0Eふ0Dへる,ほる,ま0Cみ0Bむすぶ,も0Aや09よ08わ07上2下05並ぶ,乗る,乞う,乾04争う,仄め03付き合う,仰0U企む,休む,会う,伴う,住む,作る,使う,侍る,保つ,倒す,偽る,傾く,働く,儲01光る,入る,冗談る,写す,冷や00凝Z出Y分01切る,刺す,刻む,削る,剥ぐ,劣る,助01励X効く,動く,勝つ,匂う,包む,参る,及ぶ,取V口説く,叫ぶ,可愛2叱る,合う,向かう,含む,吸う,吹く,味わう,呼U咲く,商う,問う,喋る,喜T嗅ぐ,噛む,回る,困る,囲む,固0在る,基づく,塗る,増S壊す,売る,変18外す,太る,好む,始0威R嫌2学ぶ,守る,実る,寄る,富む,導く,就く,届く,履く,崩す,巻く,帰る,干す,広Q庇う,座る,建つ,引O張る,強0弾く,役N往く,待つ,従う,忍ぶ,志す,怒る,怖2思L急ぐ,恨む,悩む,悲K惜K憎む,憩う,戻1手伝う,打つ,払う,扱う,抜く,抱く,押す,担ぐ,招く,拾う,持つ,挟む,捻る,掘る,掛01探1掴む,揃う,描く,握る,撮る,救う,散る,敷く,断る,暖0暮Z曇る,曲2書く,有る,望む,枯Z楽K構う,次ぐ,欲し2歌う,止0歩く,死ぬ,残1殴る,殺す,気J污す,決0沈む,沸04治1沿う,泊0泣く,注ぐ,泳ぐ,洗う,流行る,浮かぶ,消す,涼む,混じる,添う,済む,減I渡1温める,湿る,満たす,溶03滅ぼす,滑る,漏Z潤う,為0X無くH焦る,焼く,熟す,狂う,現す,生G産む,異F畳む,疑う,痛む,登る,盗む,目N直1眠る,眩む,着く,睨む,知E砕く,磨く,示す,祈る,祝う,祭る,移す,稼ぐ,積む,空く,突く,立つ,笑う,終18組む,経つ,結ぶ,継ぐ,続く,練る,縋る,縛る,縫う,縮む,繰り返す,置く,罵る,群2習う,聞く,育つ,脂ぎる,脱ぐ,腐る,至る,舞う,苦K茂る,落とす,蘇る,行D表す,被る,補う,襲う,要る,覆る,見C解く,触る,言A試す,話9誇る,誘う,語る,誤る,読む,請う,謝る,譲る,負03貰う,買う,貸す,賄う,走る,起こ1越す,足す,踊る,踏む,蹴飛ばす,転8輝く,込む,返1迷う,追7送る,這う,通6逝く,進む,遊ぶ,運ぶ,過ごす,違う,遣る,適う,遭う,遮る,選ぶ,配る,酔う,重F釣る,閉0開く,間5関18防ぐ,降4限る,陥る,隠す,集0離す,霞む,静0響く,頂く,頑R頼3願う,飛U食い違う,飲む,飼う,飾る,馴染む,騒ぐ,騙す,驚く,高0魂消る,黙る,齧る;む,る;る,ろす;にZ違う;う,す,る;いかける,う;がる,ぶ;しVす;い3う;ふQ出す,表す;つR做す,張る,習う,送る,逃す;く,なう;りQる;なる;む,やす;す,なる;らす,る;付く,遣う;しむ;い3う;つく,出す;立つ;く,っ3;張る,越す;がる,まる;張る;す,やす;ばす,ぶ;び4ぶ;り3る;出す;ます,む;す,会う;らす;かす,す;かる;合う;かす;かす,く;がる,さる;がる;かる,た1;ぶ,む,る,ろこぶ;く,すむ;つ,どる,らう;がく,のる;いる,がる,く,じる,つ,なぶ,もる,よう,わる;く,せぐ,とる,やす,る;かる,く,ねる,らく;こぶ,しる,じ0たらく,なす,る;こる,ぼる,む,る;おす,く,ぐる,さる,やむ,ら3;う,ぶ;おる,ぶ,まる,る;か4く,づく,な3む,る;がる,ぐ;う,む;がう,ぢむ,る;く,す,まる;つ,のむ;そぐ,だつ;う,すむ,む,わる;かる,ぬ,ばる,まう,めす,ゃべる;がす,く,けぶ,そう,わ3;ぐ,る;のむ,まる,む,ろぶ;さる,だ3もる;さる;く,まる;う,え1か3ぎる,ざる,じる,す,せぐ,ぶる,む,よう,わる;る,わる;す,る;く3こる,す,っ7とる,どる,もう,よぐ,わる;!る;ごく,たう,つ3む,る;!す;う,く,そぐ,つ4のる,らっ3;しゃる;わる;せる,つ0らう,る3;!く;まる",
    "IrregularVerb": "true¦くる,する,来る,為る",
    "Ichidan": "true¦0:0L;1:0K;2:0M;3:06;4:03;undefined,あ0Nい0Mう0Kえる,お0Jか0Gき0Fく0Eこ0Dさ0Cし09す08せ2そだ4た06つ04で02と01なZにYぬ1ねる,のXはWひろVふUほ00まSみRむか0もQやTよPわO上V下V与0並0L乗N交M付03任T企4伏T伝0伸L似る,使0信3倒1借K備0傷つ03優1儲03入1兼ねる,冷J出I分H切1別1加0助03努2勤2占2取G受03呉1告V命3固2埋2報F増0壊1売1変0妨V始2委ねる,存3定2寄T寝る,尋ねる,尽E居る,届03崩1帯L広D延L建4引き受03弱2強C当4得る,忘1応3怠03恐1恥3悔F惚1感3慌4慣1慰2戒2抑0投V折1抜03抱0拵0挙V捨4掛03掲V揃0換0支0攻2教0数0明03晴1暮1曲V替0束ねる,果4枯1案3構0止2比0L求2汚1決2流1浮か0L浴L消0混M済まT溢1溶03滅L漏1演3濡1点03焦V焼03煮る,燃0片付03現1甘0生B用F疲1痩T真似る,眺2着A知らT禁3立4答0経る,続03綻L締2老9考0聞こ0育4腰掛03臥T舐2苦しまT落ちる,蓄0虐2褒2見8覚J解03触1言い7訪6訴0詫L認2調0L論3諦2講3負03責2起E越0足K跳ねる,蹴る,転3載T迎0述0L逃5通3連1進2遂V遅1過ぎる,避03重ねる,錆L鍛0長03閉2開03間違0降K隠1集2離1震0食0L飽E高2;げる,れる;ねる,れる;つ00換0;える,せる,つZる;いる,ける;る,換0;える,きる,ける,じる,ま1;いる,める;げる,める;きる;いる;り換0れる;か1ける;かPる,来る;える,める;りる;びる;ぜる;せる,り換0;か1ける,す1;ご1せる,わ2;える,と2れる;せる,と2る;か5ける,げる,ぜる;せる;える,る0れる;げる;える,じ2な1れる;が1せる,べる;げる,る;が5げる,める,らQれる;める,れる;ける,げる,ど6める;か5きる,る;ける;か5ける,げる,た0と2よ2れる;える,れる;お1か2ずGてる,べる,りる;てる;ぎる,ぐ1す2てる;める,ら6ん3;じる;せる,べる;ける,げる,さ0だ2める;える,た0わ1;ず1らBれる,わ0;える,こ0める,る,れる;か0く1ける,さ6ぞ0りる,れる,ん5;が0じる;ねる;きる,し0そ1ちる,とず1ぼ0りる,れる;か5ける,ま1める,れる;べる;る,れる;きら2ける,げる,た0つ2てる,びる,ふ1らわ1;れる;える;める",
    "Determiner": "true¦あの,この,その",
    "CaseParticle": "true¦から,が,で,と,に,へ,まで,や,より,を",
    "ConjunctiveParticle": "true¦け2し,た1つつ,て3ながら,の0ば;で,に;ら,り;ど,れど0;!も",
    "TopicParticle": "true¦こそ,さえ,しか,でも,なら,は,も",
    "SentenceParticle": "true¦か3さ,ぜ,ぞ,な2ね1のか,ものか,よ0わ;!ね;!え;!あ;!しら,な",
    "AdnominalParticle": "true¦の"
  };

  const BASE = 36;
  const seq = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const cache = seq.split('').reduce(function (h, c, i) {
    h[c] = i;
    return h
  }, {});

  // 0, 1, 2, ..., A, B, C, ..., 00, 01, ... AA, AB, AC, ..., AAA, AAB, ...
  const toAlphaCode = function (n) {
    if (seq[n] !== undefined) {
      return seq[n]
    }
    let places = 1;
    let range = BASE;
    let s = '';
    for (; n >= range; n -= range, places++, range *= BASE) {}
    while (places--) {
      const d = n % BASE;
      s = String.fromCharCode((d < 10 ? 48 : 55) + d) + s;
      n = (n - d) / BASE;
    }
    return s
  };

  const fromAlphaCode = function (s) {
    if (cache[s] !== undefined) {
      return cache[s]
    }
    let n = 0;
    let places = 1;
    let range = BASE;
    let pow = 1;
    for (; places < s.length; n += range, places++, range *= BASE) {}
    for (let i = s.length - 1; i >= 0; i--, pow *= BASE) {
      let d = s.charCodeAt(i) - 48;
      if (d > 10) {
        d -= 7;
      }
      n += d * pow;
    }
    return n
  };

  var encoding = {
    toAlphaCode,
    fromAlphaCode
  };

  const symbols = function (t) {
    //... process these lines
    const reSymbol = new RegExp('([0-9A-Z]+):([0-9A-Z]+)');
    for (let i = 0; i < t.nodes.length; i++) {
      const m = reSymbol.exec(t.nodes[i]);
      if (!m) {
        t.symCount = i;
        break
      }
      t.syms[encoding.fromAlphaCode(m[1])] = encoding.fromAlphaCode(m[2]);
    }
    //remove from main node list
    t.nodes = t.nodes.slice(t.symCount, t.nodes.length);
  };
  var parseSymbols = symbols;

  // References are either absolute (symbol) or relative (1 - based)
  const indexFromRef = function (trie, ref, index) {
    const dnode = encoding.fromAlphaCode(ref);
    if (dnode < trie.symCount) {
      return trie.syms[dnode]
    }
    return index + dnode + 1 - trie.symCount
  };

  const toArray = function (trie) {
    const all = [];
    const crawl = (index, pref) => {
      let node = trie.nodes[index];
      if (node[0] === '!') {
        all.push(pref);
        node = node.slice(1); //ok, we tried. remove it.
      }
      const matches = node.split(/([A-Z0-9,]+)/g);
      for (let i = 0; i < matches.length; i += 2) {
        const str = matches[i];
        const ref = matches[i + 1];
        if (!str) {
          continue
        }
        const have = pref + str;
        //branch's end
        if (ref === ',' || ref === undefined) {
          all.push(have);
          continue
        }
        const newIndex = indexFromRef(trie, ref, index);
        crawl(newIndex, have);
      }
    };
    crawl(0, '');
    return all
  };

  //PackedTrie - Trie traversal of the Trie packed-string representation.
  const unpack$2 = function (str) {
    const trie = {
      nodes: str.split(';'),
      syms: [],
      symCount: 0
    };
    //process symbols, if they have them
    if (str.match(':')) {
      parseSymbols(trie);
    }
    return toArray(trie)
  };

  var traverse = unpack$2;

  const unpack = function (str) {
    if (!str) {
      return {}
    }
    //turn the weird string into a key-value object again
    const obj = str.split('|').reduce((h, s) => {
      const arr = s.split('¦');
      h[arr[0]] = arr[1];
      return h
    }, {});
    const all = {};
    Object.keys(obj).forEach(function (cat) {
      const arr = traverse(obj[cat]);
      //special case, for botched-boolean
      if (cat === 'true') {
        cat = true;
      }
      for (let i = 0; i < arr.length; i++) {
        const k = arr[i];
        if (all.hasOwnProperty(k) === true) {
          if (Array.isArray(all[k]) === false) {
            all[k] = [all[k], cat];
          } else {
            all[k].push(cat);
          }
        } else {
          all[k] = cat;
        }
      }
    });
    return all
  };

  var unpack$1 = unpack;

  // vowel-row transforms for godan (五段) verbs
  // the dictionary-form's final kana tells us the row, and each
  // grammatical 'base' (活用形) shifts it to a different vowel

  // 未然形 - the 'a' row (takes ない, れる, せる)
  const aRow = {
    'う': 'わ', 'く': 'か', 'ぐ': 'が', 'す': 'さ', 'つ': 'た',
    'ぬ': 'な', 'ぶ': 'ば', 'む': 'ま', 'る': 'ら',
  };
  // 連用形 - the 'i' row (takes ます, たい, ながら) - also the 'masu-stem'
  const iRow = {
    'う': 'い', 'く': 'き', 'ぐ': 'ぎ', 'す': 'し', 'つ': 'ち',
    'ぬ': 'に', 'ぶ': 'び', 'む': 'み', 'る': 'り',
  };
  // 仮定形/命令形 - the 'e' row (takes ば, る for potential)
  const eRow = {
    'う': 'え', 'く': 'け', 'ぐ': 'げ', 'す': 'せ', 'つ': 'て',
    'ぬ': 'ね', 'ぶ': 'べ', 'む': 'め', 'る': 'れ',
  };
  // 意向形 - the 'o' row (takes う for volitional)
  const oRow = {
    'う': 'お', 'く': 'こ', 'ぐ': 'ご', 'す': 'そ', 'つ': 'と',
    'ぬ': 'の', 'ぶ': 'ぼ', 'む': 'も', 'る': 'ろ',
  };
  // 音便 - the sound-change used by the て/た forms
  const teRow = {
    'う': 'って', 'つ': 'って', 'る': 'って',
    'ぬ': 'んで', 'ぶ': 'んで', 'む': 'んで',
    'く': 'いて', 'ぐ': 'いで', 'す': 'して',
  };

  // kana that can precede る in an ichidan verb (the i-row and e-row)
  const iRowKana = new Set('いきしちにひみりぎじぢびぴ'.split(''));
  const eRowKana = new Set('えけせてねへめれげぜでべぺ'.split(''));

  const godanEnding = new Set('うくぐすつぬぶむる'.split(''));

  // -る verbs are genuinely ambiguous: 帰る is godan, but 変える is ichidan.
  // when the stem is spelled in kanji the vowel is hidden, so we need word-lists.

  // 一段 verbs the vowel-heuristic can't see (kanji sits right before the る)
  const ichidan = `見る 着る 似る 煮る 干る 射る 鋳る 居る 出る 得る 経る 寝る 蹴る
  生きる 起きる 過ぎる 落ちる 尽きる 飽きる 降りる 借りる 足りる 浴びる 滅びる 錆びる
  感じる 信じる 禁じる 命じる 応じる 通じる 生じる 存じる 論じる 演じる 転じる 案じる 講じる 恥じる
  老いる 用いる 報いる 強いる 悔いる 延びる 伸びる 帯びる 詫びる 綻びる 懲びる 出来る
  みる きる にる でる える ねる いる いきる おきる すぎる おちる おりる かりる たりる あびる`.split(/\s+/);

  // 五段 verbs that *look* ichidan (an i/e-row kana sits before the る) but aren't.
  // mostly matters for the kana spellings - kanji spellings already default to godan.
  const godanRu = `帰る 返る 入る 要る 走る 知る 切る 限る 減る 練る 照る 滑る 握る 焦る
  脂ぎる 覆る 遮る 罵る 湿る 茂る 参る 交じる 混じる 陥る 侮る 嘲る 憚る 滾る 捻る 抓る 契る 齧る
  喋る 縋る 蘇る 甦る 詰る 罷る 迸る 阿る 熱る 散る italic misc
  かえる はいる はしる しる きる かぎる へる ねる てる すべる にぎる あせる ちる
  まじる しゃべる かじる ひねる くつがえる さえぎる ののしる しめる しげる まいる おちいる
  あなどる あざける はばかる なじる まかる ほとばしる ほてる ちぎる よみがえる すがる つねる
  たぎる おもねる いじる ける よぎる まざる ねじる
  打ち切る 思い切る 張り切る 立ち返る 生き返る 寝返る 立ち入る 押し入る 気に入る 見入る 恐れ入る`
    .split(/\s+/).filter(w => /る$/.test(w));

  let isIchidan = new Set(ichidan.filter(w => /る$/.test(w)));
  let isGodanRu = new Set(godanRu);
  // 蹴る is ichidan in modern standard japanese, 練る/照る are godan homophones
  isGodanRu.delete('蹴る');

  // verbs with a paradigm of their own
  const irregular = {
    'する': 'suru',
    '為る': 'suru',
    'くる': 'kuru',
    '来る': 'kuru',
    'ある': 'aru',
    '有る': 'aru',
    '在る': 'aru',
    '行く': 'iku',
    'いく': 'iku',
    '逝く': 'iku',
    '往く': 'iku',
    '問う': 'ou',
    '請う': 'ou',
    '乞う': 'ou',
    '下さる': 'aru5',
    'くださる': 'aru5',
    'なさる': 'aru5',
    '為さる': 'aru5',
    'おっしゃる': 'aru5',
    '仰る': 'aru5',
    'いらっしゃる': 'aru5',
    'ござる': 'aru5',
    '御座る': 'aru5',
  };

  /** which conjugation-family does this dictionary-form belong to? */
  const verbClass = function (dict, hint) {
    // an irregular is irregular even when the word-list calls it godan - 行く
    // is listed as a godan verb but its て-form is 行って, not 行いて
    if (irregular[dict]) {
      return irregular[dict]
    }
    if (hint === 'Ichidan' || hint === 'Godan') {
      return hint.toLowerCase()
    }
    // -する compounds, like 勉強する
    if (dict.length > 2 && dict.endsWith('する')) {
      return 'suru'
    }
    // -来る compounds, like 持って来る
    if (dict.length > 2 && (dict.endsWith('来る') || dict.endsWith('くる'))) {
      return 'kuru'
    }
    let last = dict[dict.length - 1];
    if (!godanEnding.has(last)) {
      return null // not a shape we can conjugate
    }
    if (last !== 'る') {
      return 'godan' // う/く/ぐ/す/つ/ぬ/ぶ/む are unambiguous
    }
    if (isIchidan.has(dict)) {
      return 'ichidan'
    }
    if (isGodanRu.has(dict)) {
      return 'godan'
    }
    // derived stems keep their ichidan shape - 食べさせる, 読まれる, 書ける
    if (/(せる|させる|れる|られる)$/.test(dict) && dict.length > 2) {
      return 'ichidan'
    }
    let before = dict[dict.length - 2];
    // an i-row or e-row kana before る is a good ichidan signal
    if (iRowKana.has(before) || eRowKana.has(before)) {
      return 'ichidan'
    }
    // ..otherwise assume godan, the larger class
    return 'godan'
  };

  var verbClass$1 = verbClass;

  // the five 'bases' every japanese verb form is built out of.
  // get these right and every suffix falls out of them.
  const toBases = function (dict, cls) {
    let stem = dict.slice(0, -1);
    let last = dict[dict.length - 1];
    switch (cls) {
      case 'godan':
        return {
          negStem: stem + aRow[last],   // 未然形 - 書か
          stem: stem + iRow[last],      // 連用形 - 書き
          cond: stem + eRow[last],      // 仮定形 - 書け
          imper: stem + eRow[last],     // 命令形 - 書け
          volit: stem + oRow[last] + 'う', // 意向形 - 書こう
          te: stem + teRow[last],       // て形   - 書いて
          potential: stem + eRow[last] + 'る',
          passive: stem + aRow[last] + 'れる',
          causative: stem + aRow[last] + 'せる',
        }
      case 'ichidan': {
        let s = dict.slice(0, -1); // 食べ
        return {
          negStem: s, stem: s, cond: s + 'れ', imper: s + 'ろ',
          volit: s + 'よう', te: s + 'て',
          potential: s + 'られる', passive: s + 'られる', causative: s + 'させる',
        }
      }
      case 'suru': {
        let pre = dict.slice(0, -2); // 勉強
        return {
          negStem: pre + 'し', stem: pre + 'し', cond: pre + 'すれ', imper: pre + 'しろ',
          volit: pre + 'しよう', te: pre + 'して',
          potential: pre === '' ? 'できる' : pre + 'できる',
          passive: pre + 'される', causative: pre + 'させる',
        }
      }
      case 'kuru': {
        let pre = dict.slice(0, -2);
        let kana = dict.endsWith('くる');
        let ko = kana ? 'こ' : '来';
        let ki = kana ? 'き' : '来';
        let ku = kana ? 'く' : '来';
        return {
          negStem: pre + ko, stem: pre + ki, cond: pre + ku + 'れ', imper: pre + ko + 'い',
          volit: pre + ko + 'よう', te: pre + ki + 'て',
          potential: pre + ko + 'られる', passive: pre + ko + 'られる', causative: pre + ko + 'させる',
        }
      }
      case 'aru': {
        let s = dict.slice(0, -1); // あ / 有 / 在
        return {
          negStem: null, // ある has no 未然形 - its negative is just ない
          stem: s + 'り', cond: s + 'れ', imper: s + 'れ', volit: s + 'ろう', te: s + 'って',
          potential: s + 'れる', passive: s + 'られる', causative: s + 'らせる',
        }
      }
      case 'iku': { // 行く takes って, not the regular いて
        let s = dict.slice(0, -1);
        return {
          negStem: s + 'か', stem: s + 'き', cond: s + 'け', imper: s + 'け', volit: s + 'こう',
          te: s + 'って',
          potential: s + 'ける', passive: s + 'かれる', causative: s + 'かせる',
        }
      }
      case 'ou': { // 問う/請う keep うて rather than って
        let s = dict.slice(0, -1);
        return {
          negStem: s + 'わ', stem: s + 'い', cond: s + 'え', imper: s + 'え', volit: s + 'おう',
          te: s + 'うて',
          potential: s + 'える', passive: s + 'われる', causative: s + 'わせる',
        }
      }
      case 'aru5': { // くださる/なさる - godan, but the masu-stem drops the り
        let s = dict.slice(0, -1);
        return {
          negStem: s + 'ら', stem: s + 'い', cond: s + 'れ', imper: s + 'い', volit: s + 'ろう',
          te: s + 'って',
          potential: s + 'れる', passive: s + 'られる', causative: s + 'らせる',
        }
      }
      default:
        return null
    }
  };

  // て → た,  で → だ
  const teToTa = (te) => te.replace(/て$/, 'た').replace(/で$/, 'だ');

  /** produce the full paradigm of a dictionary-form verb */
  const conjugate$1 = function (dict, hint) {
    let cls = verbClass$1(dict, hint);
    if (!cls) {
      return null
    }
    let b = toBases(dict, cls);
    if (!b) {
      return null
    }
    // ある is the one verb whose plain negative isn't built on a 未然形
    let negative = b.negStem === null ? 'ない' : b.negStem + 'ない';
    let pastNegative = b.negStem === null ? 'なかった' : b.negStem + 'なかった';
    let te = b.te;
    let past = teToTa(te);

    return {
      class: cls,
      Infinitive: dict,               // 辞書形 - 書く
      Stem: b.stem,                   // 連用形 - 書き
      PresentTense: dict,
      PastTense: past,                // 書いた
      Negative: negative,             // 書かない
      PastNegative: pastNegative,     // 書かなかった
      Gerund: te,                     // 書いて  (て形)
      NegativeGerund: b.negStem === null ? 'なくて' : b.negStem + 'なくて',
      Polite: b.stem + 'ます',         // 書きます
      PolitePast: b.stem + 'ました',    // 書きました
      PoliteNegative: b.stem + 'ません', // 書きません
      PolitePastNegative: b.stem + 'ませんでした',
      PoliteVolitional: b.stem + 'ましょう',
      Imperative: b.imper,            // 書け
      NegativeImperative: dict + 'な', // 書くな
      PoliteImperative: te + 'ください',
      Volitional: b.volit,            // 書こう
      Potential: b.potential,         // 書ける
      Passive: b.passive,             // 書かれる
      Causative: b.causative,         // 書かせる
      CausativePassive: b.causative.replace(/せる$/, 'せられる'),
      Conditional: past + 'ら',        // 書いたら (たら)
      Provisional: b.cond + 'ば',      // 書けば  (ば)
      Progressive: te + 'いる',        // 書いている
      ProgressivePolite: te + 'います',
      PastProgressive: te + 'いた',
      Desire: b.stem + 'たい',          // 書きたい
      Representative: past + 'り',      // 書いたり
      Presumptive: dict + 'だろう',
      Continuative: b.stem + 'ながら',   // 書きながら
    }
  };

  var conjugateVerb = conjugate$1;

  // い-adjectives inflect for tense and polarity - they are not 'just adjectives'.
  // 高い → 高くない → 高かった → 高くなかった.  the copula does not carry that tense.

  // いい/良い is the one truly irregular い-adjective - it inflects as よい
  const irregularStem = { 'いい': 'よ', '良い': '良', 'よい': 'よ' };

  const conjugateAdjective = function (word) {
    if (!word || !word.endsWith('い') || word.length < 2) {
      return null
    }
    let stem = irregularStem[word] !== undefined ? irregularStem[word] : word.slice(0, -1);
    return {
      Infinitive: word,               // 高い
      PresentTense: word,
      Negative: stem + 'くない',       // 高くない
      PastTense: stem + 'かった',      // 高かった
      PastNegative: stem + 'くなかった', // 高くなかった
      Gerund: stem + 'くて',           // 高くて
      Adverb: stem + 'く',             // 高く
      Provisional: stem + 'ければ',     // 高ければ
      Presumptive: stem + 'かろう',
      Polite: word + 'です',
      PolitePast: stem + 'かったです',
      PoliteNegative: stem + 'くないです',
      Superlative: stem + 'すぎる',     // 高すぎる
      Impression: stem + 'そう',        // 高そう
      Nominal: stem + 'さ',             // 高さ
    }
  };

  // な-adjectives (形容動詞) are stored bare - 静か - and inflect with the copula
  const conjugateNaAdjective = function (word) {
    if (!word) {
      return null
    }
    return {
      Infinitive: word,
      Adnominal: word + 'な',           // 静かな
      PresentTense: word + 'だ',        // 静かだ
      Negative: word + 'じゃない',       // 静かじゃない
      PastTense: word + 'だった',        // 静かだった
      PastNegative: word + 'じゃなかった',
      Gerund: word + 'で',              // 静かで
      Adverb: word + 'に',              // 静かに
      Polite: word + 'です',
      PolitePast: word + 'でした',
      PoliteNegative: word + 'じゃありません',
      Provisional: word + 'なら',
    }
  };

  var conjugateAdjective$1 = conjugateAdjective;

  // reverse the vowel-row tables, so we can walk a conjugated form back to its dictionary-form
  const invert = (obj) => Object.keys(obj).reduce((h, k) => { h[obj[k]] = k; return h }, {});
  const fromA = invert(aRow);
  const fromI = invert(iRow);
  const fromE = invert(eRow);
  const fromO = invert(oRow);

  // which 音便 endings can come from which dictionary-endings
  // ordered by how common the dictionary-ending is, since 走って could in
  // principle come from 走う/走つ/走る - only one of which is a real word
  const fromTe = {
    'って': ['る', 'う', 'つ'],
    'んで': ['む', 'ぶ', 'ぬ'],
    'いて': ['く'],
    'いで': ['ぐ'],
    'して': ['す'],
    'て': [], // bare て means an ichidan stem
  };

  // the suffixes we know how to strip, longest-first.
  // `base` says which of the five 活用形 the remaining stem is.
  let suffixes$1 = [
    ['ませんでした', ['Verb', 'PastTense', 'Polite', 'Negative'], 'masu'],
    ['なかったら', ['Verb', 'ConditionalVerb', 'Negative'], 'neg'],
    ['なければ', ['Verb', 'ConditionalVerb', 'Negative'], 'neg'],
    ['ましょう', ['Verb', 'Volitional', 'Polite'], 'masu'],
    ['なかった', ['Verb', 'PastTense', 'Negative'], 'neg'],
    ['ないで', ['Verb', 'Gerund', 'Negative'], 'neg'],
    ['なくて', ['Verb', 'Gerund', 'Negative'], 'neg'],
    ['ません', ['Verb', 'PresentTense', 'Polite', 'Negative'], 'masu'],
    ['ました', ['Verb', 'PastTense', 'Polite'], 'masu'],
    ['ながら', ['Verb', 'Continuative'], 'masu'],
    ['させる', ['Verb', 'Causative', 'PresentTense'], 'neg'],
    ['させられる', ['Verb', 'Causative', 'Passive', 'PresentTense'], 'neg'],
    ['られる', ['Verb', 'Passive', 'PresentTense'], 'neg'],
    ['たがる', ['Verb', 'Desire', 'PresentTense'], 'masu'],
    ['ます', ['Verb', 'PresentTense', 'Polite'], 'masu'],
    ['ない', ['Verb', 'PresentTense', 'Negative'], 'neg'],
    ['れる', ['Verb', 'Passive', 'PresentTense'], 'neg'],
    ['せる', ['Verb', 'Causative', 'PresentTense'], 'neg'],
    ['たい', ['Verb', 'Desire'], 'masu'],
    ['そう', ['Verb', 'Presumptive'], 'masu'],
    ['すぎる', ['Verb', 'PresentTense'], 'masu'],
    ['たら', ['Verb', 'ConditionalVerb'], 'ta'],
    ['だら', ['Verb', 'ConditionalVerb'], 'ta'],
    ['たり', ['Verb', 'Representative'], 'ta'],
    ['だり', ['Verb', 'Representative'], 'ta'],
    ['ている', ['Verb', 'Progressive', 'PresentTense'], 'te'],
    ['でいる', ['Verb', 'Progressive', 'PresentTense'], 'te'],
    ['ています', ['Verb', 'Progressive', 'PresentTense', 'Polite'], 'te'],
    ['でいます', ['Verb', 'Progressive', 'PresentTense', 'Polite'], 'te'],
    ['ていた', ['Verb', 'Progressive', 'PastTense'], 'te'],
    ['でいた', ['Verb', 'Progressive', 'PastTense'], 'te'],
    ['てる', ['Verb', 'Progressive', 'PresentTense'], 'te'],
    ['でる', ['Verb', 'Progressive', 'PresentTense'], 'te'],
    ['た', ['Verb', 'PastTense'], 'ta'],
    ['だ', ['Verb', 'PastTense'], 'ta'],
    ['て', ['Verb', 'Gerund'], 'te'],
    ['で', ['Verb', 'Gerund'], 'te'],
    ['ば', ['Verb', 'ConditionalVerb'], 'cond'],
    ['よう', ['Verb', 'Volitional'], 'neg', 'strict'],
    ['う', ['Verb', 'Volitional'], 'volit', 'strict'],
  ];
  // always try the longest ending first - ています must win over ます
  suffixes$1.sort((a, b) => b[0].length - a[0].length);

  // walk a stem in a given 活用形 back to candidate dictionary-forms
  // する and 来る don't decompose like anything else - their stem changes shape
  const suruStem = new Set(['し', 'さ', 'せ', 'す']);
  const kuruStem = new Set(['き', 'こ', 'く', '来']);

  const toDict = function (stem, base) {
    if (!stem) {
      return []
    }
    let last = stem[stem.length - 1];
    let pre = stem.slice(0, -1);
    // a bare し/き is する/来る
    if (stem.length === 1) {
      if (suruStem.has(last)) return ['する']
      if (kuruStem.has(last)) return ['来る']
    }
    // 勉強し could be 勉強する or a godan 勉強す - a two-character head is
    // almost always a する-noun (勉強する), a one-character head almost always
    // a godan verb (話す, 出す, 貸す).
    if (suruStem.has(last)) {
      let rest = defaultDict(stem, base);
      return pre.length >= 2 ? [pre + 'する'].concat(rest) : rest.concat([pre + 'する'])
    }
    return defaultDict(stem, base)
  };

  const defaultDict = function (stem, base) {
    let last = stem[stem.length - 1];
    let head = stem.slice(0, -1);
    let out = [];
    if (base === 'neg') {
      if (fromA[last]) out.push(head + fromA[last]);   // 書か → 書く
      out.push(stem + 'る');                            // 食べ → 食べる
    } else if (base === 'masu') {
      if (fromI[last]) out.push(head + fromI[last]);   // 書き → 書く
      out.push(stem + 'る');                            // 食べ → 食べる
    } else if (base === 'cond') {
      if (fromE[last]) out.push(head + fromE[last]);   // 書け → 書く
      out.push(head + fromE[last] + 'る');              // 食べれ → 食べる (via れ)
    } else if (base === 'volit') {
      if (fromO[last]) out.push(head + fromO[last]);   // 書こ → 書く
    } else if (base === 'te' || base === 'ta') {
      if (stem === 'し' || stem === 'き' || stem === '来') {
        return [stem === 'し' ? 'する' : '来る']
      }
      // the ending was already consumed, so `stem` still carries the 音便 kana
      let two = stem.slice(-1); // っ or ん or い
      if (two === 'っ') {
        fromTe['って'].forEach(c => out.push(stem.slice(0, -1) + c));
        // 行く is the one く-verb that takes って - 行った, not 行いた
        out.push(stem.slice(0, -1) + 'く');
      } else if (two === 'ん') {
        fromTe['んで'].forEach(c => out.push(stem.slice(0, -1) + c));
      } else if (two === 'い') {
        out.push(stem.slice(0, -1) + 'く', stem.slice(0, -1) + 'ぐ');
      } else if (two === 'し') {
        out.push(stem.slice(0, -1) + 'す');
      }
      out.push(stem + 'る'); // ichidan: 食べ + た
    }
    return out.filter(s => s && s.length > 1)
  };

  /**
   * take a conjugated verb and work backwards to its dictionary-form.
   * `isKnown` lets the caller disambiguate 書いた (書く) from a hypothetical 書いる.
   */
  const deconjugate = function (str, isKnown) {
    if (!str || str.length < 2) {
      return null
    }
    for (let i = 0; i < suffixes$1.length; i += 1) {
      let [suffix, tags, base, strict] = suffixes$1[i];
      if (!str.endsWith(suffix) || str.length <= suffix.length) {
        continue
      }
      let stem = str.slice(0, -suffix.length);
      // 'た'/'だ'/'て'/'で' hang off the 音便 kana, which belongs to the stem
      let candidates = toDict(stem, base);
      if (candidates.length === 0) {
        continue
      }
      let hit = isKnown ? candidates.find(isKnown) : null;
      // a 'strict' suffix is too common a word-ending to trust on its own -
      // 「たろう」 is a name, not the volitional of 「たる」
      if (strict && !hit) {
        continue
      }
      let root = hit || candidates[0];
      // sanity-check: does re-conjugating the root actually produce this string?
      if (hit) {
        return { root, tags, candidates }
      }
      let verified = candidates.find(c => {
        let forms = conjugateVerb(c);
        return forms && Object.keys(forms).some(k => forms[k] === str)
      });
      if (verified) {
        return { root: verified, tags, candidates }
      }
      return { root, tags, candidates, guess: true }
    }
    return null
  };

  var deconjugate$1 = deconjugate;

  var conjugate = {
    verb: conjugateVerb,
    adjective: conjugateAdjective$1,
    naAdjective: conjugateNaAdjective,
    verbClass: verbClass$1,
    deconjugate: deconjugate$1,
  };

  // which tags each generated verb-form should carry.
  // a form is 'PastTense' *and* 'Polite' *and* 'Negative' all at once - japanese
  // stacks these on one word, so the tag-list has to as well.
  const verbForms = {
    Infinitive: ['Verb', 'Infinitive', 'PresentTense'],
    PresentTense: ['Verb', 'PresentTense'],
    PastTense: ['Verb', 'PastTense'],
    Negative: ['Verb', 'PresentTense', 'Negative'],
    PastNegative: ['Verb', 'PastTense', 'Negative'],
    Gerund: ['Verb', 'Gerund'],
    NegativeGerund: ['Verb', 'Gerund', 'Negative'],
    Polite: ['Verb', 'PresentTense', 'Polite'],
    PolitePast: ['Verb', 'PastTense', 'Polite'],
    PoliteNegative: ['Verb', 'PresentTense', 'Polite', 'Negative'],
    PolitePastNegative: ['Verb', 'PastTense', 'Polite', 'Negative'],
    PoliteVolitional: ['Verb', 'Volitional', 'Polite'],
    Imperative: ['Verb', 'Imperative'],
    NegativeImperative: ['Verb', 'Imperative', 'Negative'],
    Volitional: ['Verb', 'Volitional'],
    Potential: ['Verb', 'Potential', 'PresentTense'],
    Passive: ['Verb', 'Passive', 'PresentTense'],
    Causative: ['Verb', 'Causative', 'PresentTense'],
    CausativePassive: ['Verb', 'Causative', 'Passive', 'PresentTense'],
    Conditional: ['Verb', 'ConditionalVerb'],
    Provisional: ['Verb', 'ConditionalVerb'],
    Progressive: ['Verb', 'Progressive', 'PresentTense'],
    ProgressivePolite: ['Verb', 'Progressive', 'PresentTense', 'Polite'],
    PastProgressive: ['Verb', 'Progressive', 'PastTense'],
    Desire: ['Verb', 'Desire'],
    Representative: ['Verb', 'Representative'],
    Presumptive: ['Verb', 'Presumptive'],
    Continuative: ['Verb', 'Continuative'],
    Stem: ['Verb', 'VerbStem'],
  };

  const adjForms = {
    Infinitive: ['Adjective', 'IAdjective', 'PresentTense'],
    PresentTense: ['Adjective', 'IAdjective', 'PresentTense'],
    Negative: ['Adjective', 'IAdjective', 'PresentTense', 'Negative'],
    PastTense: ['Adjective', 'IAdjective', 'PastTense'],
    PastNegative: ['Adjective', 'IAdjective', 'PastTense', 'Negative'],
    Gerund: ['Adjective', 'IAdjective', 'Gerund'],
    Adverb: ['Adverb'],
    Provisional: ['Adjective', 'IAdjective', 'ConditionalVerb'],
    Presumptive: ['Adjective', 'IAdjective', 'Presumptive'],
    Superlative: ['Verb', 'PresentTense'],
    Impression: ['Adjective', 'Presumptive'],
    Nominal: ['Noun'],
  };

  // 食べたい inflects like an い-adjective - 食べたくない, 食べたかった
  const desireForms = {
    Infinitive: ['Verb', 'Desire', 'PresentTense'],
    PresentTense: ['Verb', 'Desire', 'PresentTense'],
    Negative: ['Verb', 'Desire', 'PresentTense', 'Negative'],
    PastTense: ['Verb', 'Desire', 'PastTense'],
    PastNegative: ['Verb', 'Desire', 'PastTense', 'Negative'],
    Gerund: ['Verb', 'Desire', 'Gerund'],
    Provisional: ['Verb', 'Desire', 'ConditionalVerb'],
  };

  // the passive/potential/causative stems are themselves ichidan verbs, so
  // 褒められる has a past (褒められた) and a polite past (褒められました) of its own
  const derivedForms = {
    PastTense: ['PastTense'],
    Negative: ['PresentTense', 'Negative'],
    PastNegative: ['PastTense', 'Negative'],
    Gerund: ['Gerund'],
    Polite: ['PresentTense', 'Polite'],
    PolitePast: ['PastTense', 'Polite'],
    PoliteNegative: ['PresentTense', 'Polite', 'Negative'],
    PolitePastNegative: ['PastTense', 'Polite', 'Negative'],
    Progressive: ['Progressive', 'PresentTense'],
    Conditional: ['ConditionalVerb'],
    Provisional: ['ConditionalVerb'],
  };

  // な-adjectives inflect *with the copula* - 静か + でした - and the copula is
  // its own token.  only 静かに is a word in its own right.
  const naAdjForms = {
    Infinitive: ['Adjective', 'NaAdjective'],
    Adverb: ['Adverb'],
  };

  // hand-written entries. these win over every generated form.
  let lex = {
    // ---- copula (だ/です) ----
    // https://www.japaneseprofessor.com/reference/grammar/conjugations-of-the-japanese-copula/
    'だ': ['Copula', 'PresentTense'],
    'だった': ['Copula', 'PastTense'],
    'じゃない': ['Copula', 'PresentTense', 'Negative'],
    'ではない': ['Copula', 'PresentTense', 'Negative'],
    'じゃなかった': ['Copula', 'PastTense', 'Negative'],
    'ではなかった': ['Copula', 'PastTense', 'Negative'],
    'だろう': ['Copula', 'Presumptive'],
    'なら': ['Copula', 'ConditionalVerb'],
    'ならば': ['Copula', 'ConditionalVerb'],
    'であれば': ['Copula', 'ConditionalVerb'],
    'であって': ['Copula', 'Gerund'],
    // polite copula
    'です': ['Copula', 'PresentTense', 'Polite'],
    'でした': ['Copula', 'PastTense', 'Polite'],
    'でしょう': ['Copula', 'Presumptive', 'Polite'],
    'ではありません': ['Copula', 'PresentTense', 'Polite', 'Negative'],
    'じゃありません': ['Copula', 'PresentTense', 'Polite', 'Negative'],
    'ではありませんでした': ['Copula', 'PastTense', 'Polite', 'Negative'],
    'じゃありませんでした': ['Copula', 'PastTense', 'Polite', 'Negative'],
    'でありまして': ['Copula', 'Gerund', 'Polite'],
    'でございます': ['Copula', 'PresentTense', 'Polite'],

    // ---- negation & other bound auxiliaries that stand as their own token ----
    'ない': ['Auxiliary', 'PresentTense', 'Negative'],
    'なかった': ['Auxiliary', 'PastTense', 'Negative'],
    'ません': ['Auxiliary', 'PresentTense', 'Polite', 'Negative'],
    'ませんでした': ['Auxiliary', 'PastTense', 'Polite', 'Negative'],
    'ます': ['Auxiliary', 'PresentTense', 'Polite'],
    'ました': ['Auxiliary', 'PastTense', 'Polite'],
    'ましょう': ['Auxiliary', 'Volitional', 'Polite'],
    'ぬ': ['Auxiliary', 'PresentTense', 'Negative'],
    'ん': ['Auxiliary', 'PresentTense', 'Negative'],

    // ---- existence verbs, easy to get wrong ----
    'ある': ['Verb', 'Infinitive', 'PresentTense'],
    'あります': ['Verb', 'PresentTense', 'Polite'],
    'あった': ['Verb', 'PastTense'],
    'ありました': ['Verb', 'PastTense', 'Polite'],
    'ありません': ['Verb', 'PresentTense', 'Polite', 'Negative'],
    'いる': ['Verb', 'Infinitive', 'PresentTense'],
    'います': ['Verb', 'PresentTense', 'Polite'],
    'いた': ['Verb', 'PastTense'],
    'いました': ['Verb', 'PastTense', 'Polite'],
    'いません': ['Verb', 'PresentTense', 'Polite', 'Negative'],

    // ---- suffixes ----
    'たち': 'PluralSuffix',
    'ら': 'PluralSuffix',
    'さん': 'Honorific',
    'ちゃん': 'Honorific',
    'くん': 'Honorific',
    '君': ['Noun', 'Honorific'],
    '様': 'Honorific',
    'さま': 'Honorific',
    '先生': ['Noun', 'Honorific'],
    '氏': 'Honorific',

    // ---- formal nouns (形式名詞) - grammatical, but nouns ----
    'こと': ['Noun', 'FormalNoun'],
    '事': ['Noun', 'FormalNoun'],
    'もの': ['Noun', 'FormalNoun'],
    '物': ['Noun', 'FormalNoun'],
    'ため': ['Noun', 'FormalNoun'],
    '為': ['Noun', 'FormalNoun'],
    'とき': ['Noun', 'FormalNoun'],
    'ところ': ['Noun', 'FormalNoun'],
    'はず': ['Noun', 'FormalNoun'],
    'つもり': ['Noun', 'FormalNoun'],
    'わけ': ['Noun', 'FormalNoun'],

    // ---- demonstratives (こそあど) ----
    'これ': ['Pronoun', 'Demonstrative'],
    'それ': ['Pronoun', 'Demonstrative'],
    'あれ': ['Pronoun', 'Demonstrative'],
    'どれ': ['Pronoun', 'Demonstrative', 'QuestionWord'],
    'ここ': ['Pronoun', 'Demonstrative'],
    'そこ': ['Pronoun', 'Demonstrative'],
    'あそこ': ['Pronoun', 'Demonstrative'],
    'どこ': ['Pronoun', 'Demonstrative', 'QuestionWord'],
    'この': ['Determiner', 'Demonstrative'],
    'その': ['Determiner', 'Demonstrative'],
    'あの': ['Determiner', 'Demonstrative'],
    'どの': ['Determiner', 'Demonstrative', 'QuestionWord'],
    'こんな': ['Determiner', 'Demonstrative'],
    'そんな': ['Determiner', 'Demonstrative'],
    'あんな': ['Determiner', 'Demonstrative'],
    'どんな': ['Determiner', 'Demonstrative', 'QuestionWord'],
    'こう': ['Adverb', 'Demonstrative'],
    'そう': ['Adverb', 'Demonstrative'],
    'ああ': ['Adverb', 'Demonstrative'],
    'どう': ['Adverb', 'Demonstrative', 'QuestionWord'],

    // ---- question words ----
    '何': ['Noun', 'QuestionWord'],
    'なに': ['Noun', 'QuestionWord'],
    'なん': ['Noun', 'QuestionWord'],
    '誰': ['Noun', 'QuestionWord'],
    'だれ': ['Noun', 'QuestionWord'],
    'いつ': ['Noun', 'QuestionWord'],
    'なぜ': ['Adverb', 'QuestionWord'],
    'どうして': ['Adverb', 'QuestionWord'],
    'いくら': ['Noun', 'QuestionWord'],
    'いくつ': ['Noun', 'QuestionWord'],

    // ---- irregular adnominals (連体詞) that look like adjectives but aren't ----
    '大きな': ['Adjective', 'Adnominal'],
    '小さな': ['Adjective', 'Adnominal'],
    'おかしな': ['Adjective', 'Adnominal'],
    'いろんな': ['Adjective', 'Adnominal'],
  };
  var misc$1 = lex;

  let lexicon$1 = {};
  // surface-form → dictionary-form, so 食べました can report 食べる
  let roots = {};
  // weak entries (generated forms) never overwrite a strong one (a listed word)
  let strong = new Set();

  const add = function (word, tags, isStrong) {
    if (!word) {
      return
    }
    if (strong.has(word) && !isStrong) {
      return
    }
    if (isStrong) {
      strong.add(word);
    }
    lexicon$1[word] = tags;
  };

  // the derived stems - 褒められる, 書ける, 食べさせる - inflect like ichidan
  // verbs in their own right, so give each of them a paradigm too
  const derived = ['Potential', 'Passive', 'Causative', 'CausativePassive'];

  const addDerived = function (base, baseTags, dict) {
    let forms = conjugateVerb(base, 'Ichidan');
    if (!forms) {
      return
    }
    Object.keys(derivedForms).forEach(form => {
      let str = forms[form];
      if (str && str !== base) {
        add(str, ['Verb'].concat(baseTags, derivedForms[form]));
        if (roots[str] === undefined) {
          roots[str] = dict || base;
        }
      }
    });
  };

  // expand a dictionary-form verb into every surface-form it can take
  const addVerb = function (dict, hint) {
    let forms = conjugateVerb(dict, hint);
    if (!forms) {
      return
    }
    Object.keys(verbForms).forEach(form => {
      let str = forms[form];
      if (!str || str === dict) {
        return
      }
      // a bare kana masu-stem is a tokenizer hazard - のり (乗り) would eat
      // the front of 「のりこ」.  keep 泳ぎ and 読み, drop のり and きり.
      if (form === 'Stem' && !/[一-龯]/.test(str)) {
        return
      }
      add(str, verbForms[form]);
      if (roots[str] === undefined) {
        roots[str] = dict;
      }
    });
    // 食べたい inflects like an adjective
    let want = conjugateAdjective$1(forms.Desire);
    if (want) {
      Object.keys(desireForms).forEach(form => {
        let str = want[form];
        if (str) {
          add(str, desireForms[form]);
          if (roots[str] === undefined) {
            roots[str] = dict;
          }
        }
      });
    }
    derived.forEach(form => {
      if (forms[form]) {
        addDerived(forms[form], form === 'CausativePassive' ? ['Causative', 'Passive'] : [form], dict);
      }
    });
    add(dict, verbForms.Infinitive, true);
  };

  const addAdjective = function (word) {
    let forms = conjugateAdjective$1(word);
    if (forms) {
      Object.keys(adjForms).forEach(form => {
        let str = forms[form];
        if (str && str !== word) {
          add(str, adjForms[form]);
          if (roots[str] === undefined) {
            roots[str] = word;
          }
        }
      });
    }
    add(word, adjForms.Infinitive, true);
  };

  const addNaAdjective = function (word) {
    let forms = conjugateNaAdjective(word);
    Object.keys(naAdjForms).forEach(form => {
      let str = forms[form];
      if (str && str !== word) {
        add(str, naAdjForms[form]);
      }
    });
    add(word, naAdjForms.Infinitive, true);
  };

  // ---- 1. generated forms first, so listed words can override them ----
  const unpacked = {};
  Object.keys(lexData).forEach(tag => {
    unpacked[tag] = Object.keys(unpack$1(lexData[tag]));
  })

  ;(unpacked.Godan || []).forEach(w => addVerb(w, 'Godan'))
  ;(unpacked.Ichidan || []).forEach(w => addVerb(w, 'Ichidan'))
  ;(unpacked.IrregularVerb || []).forEach(w => addVerb(w))
  // 勉強 is a noun *and* the root of 勉強する
  ;(unpacked.SuruVerb || []).forEach(w => {
    addVerb(w + 'する');
    add(w, ['Noun', 'SuruVerb'], true);
  })
  ;(unpacked.Adjective || []).forEach(w => addAdjective(w))
  ;(unpacked.NaAdjective || []).forEach(w => addNaAdjective(w));

  // ---- 2. everything else is a plain word-list ----
  const skip$1 = new Set(['Godan', 'Ichidan', 'IrregularVerb', 'SuruVerb', 'Adjective', 'NaAdjective']);
  Object.keys(unpacked).forEach(tag => {
    if (skip$1.has(tag)) {
      return
    }
    unpacked[tag].forEach(w => add(w, tag, true));
  });

  // ---- 3. hand-written entries win over everything ----
  Object.keys(misc$1).forEach(w => {
    lexicon$1[w] = misc$1[w];
    strong.add(w);
  });

  var lexicon$2 = lexicon$1;

  const isKnown$2 = (w) => lexicon$2.hasOwnProperty(w);

  function api$2 (View) {
    /** every verb in the document */
    View.prototype.verbs = function () {
      return this.match('#Verb')
    };
    /** every noun in the document */
    View.prototype.nouns = function () {
      return this.match('#Noun')
    };
    /** every adjective - both い and な */
    View.prototype.adjectives = function () {
      return this.match('#Adjective')
    };
    /** every 助詞 */
    View.prototype.particles = function () {
      return this.match('#Particle')
    };
    /** the dictionary-form of each matched word */
    View.prototype.toInfinitive = function () {
      this.compute('root');
      return this.docs.map(terms => terms.map(t => t.root || t.text).join(''))
    };
  }

  // constructor-level helpers, so you can conjugate without a document
  const methods$1 = {
    /** the full paradigm of a dictionary-form verb - nlp.conjugate('書く') */
    conjugate: function (str) {
      return conjugateVerb(str)
    },
    /** the paradigm of an い- or な-adjective */
    conjugateAdjective: function (str) {
      return str.endsWith('い') ? conjugateAdjective$1(str) : conjugateNaAdjective(str)
    },
    /** walk a conjugated verb back to its dictionary-form */
    deconjugate: function (str) {
      let found = deconjugate$1(str, isKnown$2);
      if (!found) {
        return null
      }
      // 読まれた deconjugates to 読まれる - keep going, back to 読む
      if (roots[str] !== undefined && roots[str] !== str) {
        found.root = roots[str];
      }
      return found
    },
    /** 'godan' | 'ichidan' | 'suru' | 'kuru' | .. */
    verbClass: function (str) {
      return verbClass$1(str)
    },
  };

  var lexicon = {
    model: {
      one: {
        lexicon: lexicon$2,
        roots,
      },
    },
    api: api$2,
    methods: {
      two: {
        transform: {
          verb: conjugate,
        },
      },
    },
  };

  // index the lexicon for longest-match lookup
  const buildIndex = function (arr) {
    let words = new Set();
    let maxLen = 1;
    for (let i = 0; i < arr.length; i += 1) {
      words.add(arr[i]);
      if (arr[i].length > maxLen) {
        maxLen = arr[i].length;
      }
    }
    return { words, maxLen }
  };
  var buildIndex$1 = buildIndex;

  // longest-match segmentation.
  //
  // this used to build a character-trie over the whole lexicon, which cost
  // ~40mb of nodes.  a Set of the words plus a bounded backwards scan is the
  // same answer for a fraction of the memory.

  const splitUp = function (txt, words, maxLen) {
    let out = [];
    let i = 0;
    while (i < txt.length) {
      let max = Math.min(maxLen, txt.length - i);
      let found = '';
      for (let len = max; len > 1; len -= 1) {
        let str = txt.substr(i, len);
        if (words.has(str)) {
          found = str;
          break
        }
      }
      if (found === '') {
        // a single character is only a 'word' if the lexicon says so
        found = txt[i];
      }
      out.push(found);
      i += found.length;
    }
    return out
  };
  var splitUp$1 = splitUp;

  // https://github.com/darren-lester/nihongo/blob/master/src/analysers.js

  const isHiragana$1 = function (ch) {
    return ch >= '぀' && ch <= 'ゟ'
  };

  const isKatakana = function (ch) {
    // ・ (U+30FB) sits inside the katakana block but is punctuation - it
    // separates the parts of a foreign name, ジョン・スミス
    if (ch === '・' || ch === '゠') {
      return false
    }
    return (ch >= '゠' && ch <= 'ヿ') || (ch >= 'ㇰ' && ch <= 'ㇿ')
  };

  const isKanji$1 = function (ch) {
    return (
      (ch >= '一' && ch <= '龯') ||
      (ch >= '㐀' && ch <= '䶿') ||
      ch === '々' || // 々 - the repeat-mark, as in 人々
      ch === '〆' ||
      ch === 'ヶ' ||
      ch === '𠮟'
    )
  };

  const isNumber = function (c) {
    return (c >= '0' && c <= '9') || (c >= '０' && c <= '９') // half & full-width
  };

  const isAscii = function (c) {
    return /[a-zA-Z]/.test(c) || (c >= 'Ａ' && c <= 'ｚ')
  };

  // 、。！？ and friends
  const isPunctuation = function (c) {
    return /[、。，．！？!?,.:：;；・…〜~「」『』（）()【】〔〕《》〈〉\s]/.test(c)
  };

  const getType = function (c) {
    // ー is the 長音符 - it continues whatever script it follows
    if (c === 'ー' || c === 'ｰ') {
      return 'katakana'
    }
    if (isHiragana$1(c)) {
      return 'hiragana'
    }
    if (isKatakana(c)) {
      return 'katakana'
    }
    if (isKanji$1(c)) {
      return 'kanji'
    }
    if (isNumber(c)) {
      return 'number'
    }
    if (isAscii(c)) {
      return 'ascii'
    }
    if (isPunctuation(c)) {
      return 'punctuation'
    }
    return 'other'
  };

  // suffixes that belong to the word in front of them
  const suffixes = new Set(['たち', '達']);
  // honorific prefixes that belong to the word behind them
  const prefixes = new Set(['お', 'ご', '御']);

  // two unknown characters may only merge if they're the same script.
  // 'kanji then hiragana' used to merge too, which glued particles onto nouns.
  const mergeTypes = function (a, b) {
    return a === b && a !== 'punctuation' && a !== 'other'
  };

  // an unknown kanji run longer than this is almost certainly two words.
  // katakana has no such limit - ニュージーランド is one word.
  const MAX_RUN = 4;
  const runLimit = (type) => (type === 'kanji' || type === 'hiragana' ? MAX_RUN : Infinity);

  /** glue neighbouring unknown characters into plausible words */
  const joinUp = function (arr) {
    let out = [];
    for (let i = 0; i < arr.length; i += 1) {
      let c = arr[i];
      if (c === null || c === '') {
        continue
      }
      let last = out[out.length - 1];
      // 私 + たち,  田中 + さん
      if (suffixes.has(c) && last && !lexicon$2[last + c]) {
        out[out.length - 1] = last + c;
        continue
      }
      // お + 金,  ご + 飯
      if (prefixes.has(c) && arr[i + 1] && isKanji$1(arr[i + 1][0]) && !lexicon$2[c]) {
        out.push(c + arr[i + 1]);
        i += 1;
        continue
      }
      if (c.length === 1 && !lexicon$2[c]) {
        let type = getType(c);
        let run = c;
        // race ahead, joining same-script characters.
        // a *known* single kanji may join an already-started run (日+本+人),
        // but never starts one - so 「読んでいる人」 keeps 人 on its own.
        let limit = runLimit(type);
        while (run.length < limit && arr[i + 1] !== undefined) {
          let next = arr[i + 1];
          if (next.length !== 1 || !mergeTypes(type, getType(next))) {
            break
          }
          if (lexicon$2[next] && type !== 'kanji') {
            break
          }
          run += next;
          i += 1;
        }
        out.push(run);
        continue
      }
      out.push(c);
    }
    return out
  };

  var joinUp$1 = joinUp;

  // a particle can't be the first kana of a verb's okurigana - 「木で作った」
  // is 木 + で + 作った, not 木で + 作った
  const particleStart = new Set(['は', 'が', 'を', 'に', 'へ', 'と', 'も', 'の', 'か', 'ね', 'よ', 'や', 'で', 'ば']);
  const MAX_TAIL = 6;

  const isHiraganaWord = (str) => str.split('').every(isHiragana$1);

  /**
   * 含まれている is a verb even though 含む isn't in the lexicon.
   * glue an unknown kanji stem onto the inflectional tail that follows it.
   */
  const attachOkurigana = function (arr) {
    let out = [];
    for (let i = 0; i < arr.length; i += 1) {
      let head = arr[i];
      // only an unknown kanji chunk can pick up okurigana
      if (lexicon$2[head] || !head.split('').every(isKanji$1)) {
        out.push(head);
        continue
      }
      // collect the hiragana tokens that follow it
      let tail = '';
      let end = i;
      for (let o = i + 1; o < arr.length; o += 1) {
        if (!isHiraganaWord(arr[o]) || tail.length + arr[o].length > MAX_TAIL) {
          break
        }
        tail += arr[o];
        end = o;
      }
      if (tail === '' || particleStart.has(tail[0])) {
        out.push(head);
        continue
      }
      // try the longest tail first, shrinking a token at a time
      let joined = head;
      let taken = i;
      for (let o = end; o > i; o -= 1) {
        let candidate = head + arr.slice(i + 1, o + 1).join('');
        if (candidate.length - head.length < 2) {
          continue
        }
        if (lexicon$2[candidate] || deconjugate$1(candidate)) {
          joined = candidate;
          taken = o;
          break
        }
      }
      out.push(joined);
      i = taken;
    }
    return out
  };
  var attachOkurigana$1 = attachOkurigana;

  const { words: words$1, maxLen } = buildIndex$1(Object.keys(lexicon$2));
  // a very long 'word' is nearly always two words - cap the lookahead
  const LOOKAHEAD = Math.min(maxLen, 12);

  const allHiragana = /^[぀-ゟ]+$/;

  // a case-particle at either end of a kana run isn't part of the word
  const edgeParticle = new Set(['は', 'が', 'を', 'に', 'へ', 'と', 'も', 'の', 'で', 'や', 'か']);
  // beyond this, a string of loose kana really is several words
  const MAX_KANA_RUN = 7;

  const isSingleKana = (str) => str.length === 1 && allHiragana.test(str);

  /**
   * ひらがな comes back from the matcher as ひ|ら|が|な, because が and な happen
   * to be particles.  a stretch of single kana that matched nothing is one
   * unknown word - a name, or a word the lexicon is missing.
   */
  const rejoinKana = function (arr) {
    let out = [];
    for (let i = 0; i < arr.length; i += 1) {
      if (!isSingleKana(arr[i])) {
        out.push(arr[i]);
        continue
      }
      // how far does this stretch of loose kana go?
      let end = i;
      while (end < arr.length && isSingleKana(arr[end])) {
        end += 1;
      }
      let run = arr.slice(i, end);
      i = end - 1;
      // を is only ever a particle, so it's a hard word-boundary
      let segments = [[]];
      run.forEach(c => {
        if (c === 'を') {
          segments.push(['を'], []);
        } else {
          segments[segments.length - 1].push(c);
        }
      });
      segments.forEach(seg => {
        if (seg.length === 0) {
          return
        }
        if (seg.length === 1 || seg[0] === 'を' || seg.length > MAX_KANA_RUN) {
          out = out.concat(seg);
          return
        }
        // 「での」 is two particles in a row, not a word
        if (seg.every(c => edgeParticle.has(c))) {
          out = out.concat(seg);
          return
        }
        // 「ひらがなと」 is ひらがな + と, 「経験につながる」 is 経験 | に | つながる.
        // a particle can't begin a clause, so only trim the head when something
        // real came before it
        let hasLeft = out.length > 0 && !edgeParticle.has(out[out.length - 1]);
        let head = '';
        let tail = '';
        if (seg.length > 2 && hasLeft && edgeParticle.has(seg[0])) {
          head = seg.shift();
        }
        if (seg.length > 2 && edgeParticle.has(seg[seg.length - 1])) {
          tail = seg.pop();
        }
        if (head) {
          out.push(head);
        }
        out.push(seg.join(''));
        if (tail) {
          out.push(tail);
        }
      });
    }
    return out
  };

  const tokenize$1 = function (txt, isChunk) {
    // when the writer used a space, that chunk is one word - beginner japanese
    // is often written 「たろう は のりこ を…」, and 「のりこ」 must not be
    // greedily read as the particle の plus りこ
    if (isChunk === true && txt.length <= 6 && allHiragana.test(txt) && !lexicon$2[txt]) {
      return [txt]
    }
    // split by known-word segments
    let arr = splitUp$1(txt, words$1, LOOKAHEAD);
    // a kana run that fell apart into loose characters is one unknown word
    arr = rejoinKana(arr);
    // join-up neighbouring unknown characters
    arr = joinUp$1(arr);
    // give an unknown kanji stem its inflectional tail - 含 + まれている
    arr = attachOkurigana$1(arr);
    // punctuation is never its own term - it hangs off the word before it
    let out = [];
    arr.forEach(str => {
      if (str === '') {
        return
      }
      if (out.length > 0 && str.split('').every(isPunctuation)) {
        out[out.length - 1] += str;
        return
      }
      out.push(str);
    });
    return out
  };
  var toTerms$1 = tokenize$1;

  const before = /^[\s「『（(〽【〔《〈]+/;
  const after = /[\s、。，．：；・」』）)…〜~】〕》〉\.?!？！]+$/;

  const getPunct = function (str) {
    let pre = '';
    let post = '';
    let inside = str;
    // strip-off leading punctuation
    inside = inside.replace(before, m => {
      pre = m || '';
      return ''
    });
    // strip-off ending punctuation
    inside = inside.replace(after, m => {
      post = m || '';
      return ''
    });
    return { pre, inside, post }
  };

  const tokenize = function (txt, isChunk) {
    let terms = [];
    toTerms$1(txt, isChunk).forEach(str => {
      let { pre, post, inside } = getPunct(str);
      if (inside === '') {
        // punctuation-only - fold it into the term before it
        if (terms.length > 0) {
          terms[terms.length - 1].post += pre + post;
          return
        }
        return
      }
      terms.push({
        text: inside,
        normal: inside.toLowerCase(),
        pre,
        post,
        tags: new Set(),
      });
    });
    return terms
  };
  var toTerms = tokenize;

  function api$1 (View) {

    /**  */
    View.prototype.romanji = function () {
      this.compute('romanji');
      let out = '';
      this.docs.forEach(terms => {
        terms.forEach(term => {
          out += term.pre + (term.romanji || term.text) + (term.post || ' ');
        });
      });
      // convert inter-bang
      out = out.replace(/・/, ' ');
      return out
    };
  }

  // https://github.com/zkayser/jay_verb/blob/master/lib/japanese/to_romaji.rb
  var hMap = [
    {},
    // single-char
    {
      "あ": "a",
      "い": "i",
      "う": "u",
      "え": "e",
      "お": "o",
      "か": "ka",
      "き": "ki",
      "く": "ku",
      "け": "ke",
      "こ": "ko",
      "さ": "sa",
      "し": "shi",
      "す": "su",
      "せ": "se",
      "そ": "so",
      "た": "ta",
      "ち": "chi",
      "つ": "tsu",
      "て": "te",
      "と": "to",
      "な": "na",
      "に": "ni",
      "ぬ": "nu",
      "ね": "ne",
      "の": "no",
      "は": "ha",
      "ひ": "hi",
      "ふ": "fu",
      "へ": "he",
      "ほ": "ho",
      "ま": "ma",
      "み": "mi",
      "む": "mu",
      "め": "me",
      "も": "mo",
      "や": "ya",
      "ゆ": "yu",
      "よ": "yo",
      "ら": "ra",
      "り": "ri",
      "る": "ru",
      "れ": "re",
      "ろ": "ro",
      "わ": "wa",
      "を": "wo",
      "ん": "n",
      "が": "ga",
      "ぎ": "gi",
      "ぐ": "gu",
      "げ": "ge",
      "ご": "go",
      "ざ": "za",
      "じ": "ji",
      "ず": "zu",
      "ぜ": "ze",
      "ぞ": "zo",
      "だ": "da",
      "ぢ": "dchi",
      "づ": "dzu",
      "で": "de",
      "ど": "do",
      "ば": "ba",
      "び": "bi",
      "ぶ": "bu",
      "べ": "be",
      "ぼ": "bo",
      "ぱ": "pa",
      "ぴ": "pi",
      "ぷ": "pu",
      "ぺ": "pe",
      "ぽ": "po",
      //specials
      "ゃ": "ya",
      "ゅ": "yu",
      "ょ": "yo",
      "っ": "",
      "ぁ": "a",
      "ぃ": "i",
      "ぅ": "u",
      "ぇ": "e",
      "ぉ": "o",
      "。": "."
    },
    // two-char
    {
      "きゃ": "kya",
      "きゅ": "kyu",
      "きょ": "kyo",
      "しゃ": "sha",
      "しゅ": "shu",
      "しょ": "sho",
      "ちゃ": "cha",
      "ちゅ": "chu",
      "ちょ": "cho",
      "にゃ": "nya",
      "にゅ": "nyu",
      "にょ": "nyo",
      "ひゃ": "hya",
      "ひゅ": "hyu",
      "ひょ": "hyo",
      "みゃ": "mya",
      "みゅ": "myu",
      "みょ": "myo",
      "りゃ": "rya",
      "りゅ": "ryu",
      "りょ": "ryo",
      "ぎゃ": "gya",
      "ぎゅ": "gyu",
      "ぎょ": "gyo",
      "じゃ": "ja",
      "じゅ": "ju",
      "じょ": "jo",
      "ぢゃ": "dja",
      "ぢゅ": "dju",
      "ぢょ": "djo",
      "びゃ": "bya",
      "びゅ": "byu",
      "びょ": "byo",
      "ぴゃ": "pya",
      "ぴゅ": "pyu",
      "ぴょ": "pyo",
      "てぃ": "ti",
      "っか": "kka",
      "っき": "kki",
      "っく": "kku",
      "っけ": "kke",
      "っこ": "kko",
      "っさ": "ssa",
      "っし": "sshi",
      "っす": "ssu",
      "っせ": "sse",
      "っそ": "sso",
      "った": "tta",
      "っち": "cchi",
      "っつ": "ttsu",
      "って": "tte",
      "っと": "tto",
      "っば": "bba",
      "っび": "bbi",
      "っぶ": "bbu",
      "っべ": "bbe",
      "っぼ": "bbo",
      "っぱ": "ppa",
      "っぴ": "ppi",
      "っぷ": "ppu",
      "っぺ": "ppe",
      "っぽ": "ppo"
    },
    // three-char
    {
      "っきゃ": "kkya",
      "っきゅ": "kkyu",
      "っきょ": "kkyo",
      "っしゃ": "ssha",
      "っしゅ": "sshu",
      "っしょ": "ssho",
      "っちゃ": "ccha",
      "っちゅ": "cchu",
      "っちょ": "ccho",
      "っじゃ": "jja",
      "っじゅ": "jju",
      "っじょ": "jjo",
      "っびゃ": "bbya",
      "っびゅ": "bbyu",
      "っびょ": "bbyo",
      "っぴゃ": "ppya",
      "っぴゅ": "ppyu",
      "っぴょ": "ppyo"
    }
  ];

  let hasMulti = new Set(['き', 'ぎ', 'し', 'じ', 'ち', 'ぢ', 'っ', 'て', 'に', 'ひ', 'び', 'ぴ', 'み', 'り']);

  // katakana and hiragana are the same 46 sounds, 0x60 apart in unicode.
  // fold katakana down so one map handles both scripts.
  const toHiragana$1 = function (str) {
    let out = '';
    for (let i = 0; i < str.length; i += 1) {
      let c = str[i];
      if (c >= 'ァ' && c <= 'ヶ') {
        out += String.fromCharCode(c.charCodeAt(0) - 0x60);
      } else {
        out += c;
      }
    }
    return out
  };

  // there are 46 of these
  const isHiragana = function (ch) {
    return ch >= "\u3040" && ch <= "\u309f";
  };

  const vowels = 'aiueo';

  // sound-out japanese script in latin alphabet
  const toRomanji = function (str) {
    let chars = toHiragana$1(str).split('');
    let out = '';

    for (let i = 0; i < chars.length; i += 1) {
      let c = chars[i];
      // ー is the 長音符 - it lengthens the vowel of the syllable before it
      if (c === 'ー' || c === 'ｰ') {
        let last = out[out.length - 1];
        if (last && vowels.includes(last)) {
          out += last;
        }
        continue
      }
      // pass non-hiragana right through
      if (!isHiragana(c)) {
        out += c;
        continue
      }
      // a lone っ doubles the consonant that follows it, and is silent at the
      // end of a word - it never spells anything by itself
      if (c === 'っ') {
        let next = chars[i + 1] ? hMap[1][chars[i + 1]] : '';
        if (next && !vowels.includes(next[0])) {
          out += next[0];
        }
        continue
      }
      // look ahead at greedy multi-char sequences
      if (hasMulti.has(c)) {
        if (chars[i + 1]) {
          let two = c + chars[i + 1];
          if (hMap[2].hasOwnProperty(two)) {
            out += hMap[2][two];
            i += 1;
            continue
          }
          if (chars[i + 2]) {
            let three = c + chars[i + 1] + chars[i + 2];
            if (hMap[3].hasOwnProperty(three)) {
              out += hMap[3][three];
              i += 1;
              continue
            }
          }
        }
      }
      // single-char map
      out += hMap[1][c] || c;
    }
    return out
  };

  var toRomanji$1 = toRomanji;

  // console.log(toRomanji('ひらがな　カタカナ'))
  // console.log(toRomanji('あっきょっつああ'))

  // kun|on readings
  var readings$1 = {
    '一': 'ひと-|イチ',
    '二': 'ふた|ニ',
    '三': 'み|サン',
    '四': 'よ|シ',
    '五': 'いつ|ゴ',
    '六': 'む|ロク',
    '七': 'なな|シチ',
    '八': 'や|ハチ',
    '九': 'ここの|キュウ',
    '十': 'とお|ジュウ',
    '百': 'もも|ヒャク',
    '千': 'ち|セン',
    '上': 'うえ|ジョウ',
    '下': 'した|カ',
    '左': 'ひだり|サ',
    '右': 'みぎ|ウ',
    '中': 'なか|チュウ',
    '大': 'おお-|ダイ',
    '小': 'ちい.さい|ショウ',
    '月': 'つき|ゲツ',
    '日': 'ひ|ニチ',
    '年': 'とし|ネン',
    '早': 'はや.い|ソウ',
    '木': 'き|ボク',
    '林': 'はやし|リン',
    '山': 'やま|サン',
    '川': 'かわ|セン',
    '土': 'つち|ド',
    '空': 'そら|クウ',
    '田': 'た|デン',
    '天': 'あまつ|テン',
    '生': 'い.きる|セイ',
    '花': 'はな|カ',
    '草': 'くさ|ソウ',
    '虫': 'むし|チュウ',
    '犬': 'いぬ|ケン',
    '人': 'ひと|ジン',
    '名': 'な|メイ',
    '女': 'おんな|ジョ',
    '男': 'おとこ|ダン',
    '子': 'こ|シ',
    '目': 'め|モク',
    '耳': 'みみ|ジ',
    '口': 'くち|コウ',
    '手': 'て|シュ',
    '足': 'あし|ソク',
    '見': 'み.る|ケン',
    '音': 'おと|オン',
    '力': 'ちから|リョク',
    '気': 'いき|キ',
    '円': 'まる.い|エン',
    '入': 'い.る|ニュウ',
    '出': 'で.る|シュツ',
    '立': 'た.つ|リツ',
    '休': 'やす.む|キュウ',
    '先': 'さき|セン',
    '夕': 'ゆう|セキ',
    '本': 'もと|ホン',
    '文': 'ふみ|ブン',
    '字': 'あざ|ジ',
    '学': 'まな.ぶ|ガク',
    '村': 'むら|ソン',
    '町': 'まち|チョウ',
    '森': 'もり|シン',
    '正': 'ただ.しい|セイ',
    '水': 'みず|スイ',
    '火': 'ひ|カ',
    '玉': 'たま|ギョク',
    '石': 'いし|セキ',
    '竹': 'たけ|チク',
    '糸': 'いと|シ',
    '貝': 'かい|バイ',
    '車': 'くるま|シャ',
    '金': 'かね|キン',
    '雨': 'あめ|ウ',
    '赤': 'あか|セキ',
    '青': 'あお|セイ',
    '白': 'しろ|ハク',
    '数': 'かず|スウ',
    '多': 'おお.い|タ',
    '少': 'すく.ない|ショウ',
    '万': 'よろず|マン',
    '半': 'なか.ば|ハン',
    '形': 'かた|ケイ',
    '太': 'ふと.い|タイ',
    '細': 'ほそ.い|サイ',
    '広': 'ひろ.い|コウ',
    '長': 'なが.い|チョウ',
    '点': 'つ.ける|テン',
    '丸': 'まる|ガン',
    '交': 'まじ.わる|コウ',
    '光': 'ひか.る|コウ',
    '角': 'かど|カク',
    '計': 'はか.る|ケイ',
    '直': 'ただ.ちに|チョク',
    '線': 'すじ|セン',
    '矢': 'や|シ',
    '弱': 'よわ.い|ジャク',
    '強': 'つよ.い|キョウ',
    '高': 'たか.い|コウ',
    '同': 'おな.じ|ドウ',
    '親': 'おや|シン',
    '母': 'はは|ボ',
    '父': 'ちち|フ',
    '姉': 'あね|シ',
    '兄': 'あに|ケイ',
    '弟': 'おとうと|テイ',
    '妹': 'いもうと|マイ',
    '自': 'みずか.ら|ジ',
    '友': 'とも|ユウ',
    '体': 'からだ|タイ',
    '毛': 'け|モウ',
    '頭': 'あたま|トウ',
    '顔': 'かお|ガン',
    '首': 'くび|シュ',
    '心': 'こころ|シン',
    '時': 'とき|ジ',
    '朝': 'あさ|チョウ',
    '昼': 'ひる|チュウ',
    '夜': 'よ|ヤ',
    '分': 'わ.ける|ブン',
    '春': 'はる|シュン',
    '夏': 'なつ|カ',
    '秋': 'あき|シュウ',
    '冬': 'ふゆ|トウ',
    '今': 'いま|コン',
    '新': 'あたら.しい|シン',
    '古': 'ふる.い|コ',
    '間': 'あいだ|カン',
    '方': 'かた|ホウ',
    '北': 'きた|ホク',
    '南': 'みなみ|ナン',
    '東': 'ひがし|トウ',
    '西': 'にし|セイ',
    '遠': 'とお.い|エン',
    '近': 'ちか.い|キン',
    '前': 'まえ|ゼン',
    '後': 'のち|ゴ',
    '内': 'うち|ナイ',
    '外': 'そと|ガイ',
    '場': 'ば|ジョウ',
    '国': 'くに|コク',
    '園': 'その|エン',
    '谷': 'たに|コク',
    '野': 'の|ヤ',
    '原': 'はら|ゲン',
    '里': 'さと|リ',
    '市': 'いち|シ',
    '京': 'みやこ|キョウ',
    '風': 'かぜ|フウ',
    '雪': 'ゆき|セツ',
    '雲': 'くも|ウン',
    '池': 'いけ|チ',
    '海': 'うみ|カイ',
    '岩': 'いわ|ガン',
    '星': 'ほし|セイ',
    '室': 'むろ|シツ',
    '戸': 'と|コ',
    '家': 'いえ|カ',
    '寺': 'てら|ジ',
    '通': 'とお.る|ツウ',
    '門': 'かど|モン',
    '道': 'みち|ドウ',
    '話': 'はな.す|ワ',
    '言': 'い.う|ゲン',
    '答': 'こた.える|トウ',
    '声': 'こえ|セイ',
    '聞': 'き.く|ブン',
    '語': 'かた.る|ゴ',
    '読': 'よ.む|ドク',
    '書': 'か.く|ショ',
    '記': 'しる.す|キ',
    '紙': 'かみ|シ',
    '画': 'えが.く|ガ',
    '図': 'え|ズ',
    '教': 'おし.える|キョウ',
    '晴': 'は.れる|セイ',
    '思': 'おも.う|シ',
    '考': 'かんが.える|コウ',
    '知': 'し.る|チ',
    '理': 'ことわり|リ',
    '算': 'そろ|サン',
    '作': 'つく.る|サク',
    '元': 'もと|ゲン',
    '食': 'く.う|ショク',
    '肉': 'しし|ニク',
    '馬': 'うま|バ',
    '牛': 'うし|ギュウ',
    '魚': 'うお|ギョ',
    '鳥': 'とり|チョウ',
    '羽': 'は|ウ',
    '鳴': 'な.く|メイ',
    '麦': 'むぎ|バク',
    '米': 'こめ|ベイ',
    '色': 'いろ|ショク',
    '黄': 'き|コウ',
    '黒': 'くろ|コク',
    '来': 'く.る|ライ',
    '行': 'い.く|コウ',
    '帰': 'かえ.る|キ',
    '歩': 'ある.く|ホ',
    '走': 'はし.る|ソウ',
    '止': 'と.まる|シ',
    '活': 'い.きる|カツ',
    '店': 'みせ|テン',
    '買': 'か.う|バイ',
    '売': 'う.る|バイ',
    '午': 'うま|ゴ',
    '弓': 'ゆみ|キュウ',
    '回': 'まわ.る|カイ',
    '会': 'あ.う|カイ',
    '組': 'く.む|ソ',
    '船': 'ふね|セン',
    '明': 'あ.かり|メイ',
    '社': 'やしろ|シャ',
    '切': 'き.る|セツ',
    '毎': 'ごと|マイ',
    '合': 'あ.う|ゴウ',
    '当': 'あ.たる|トウ',
    '台': 'うてな|ダイ',
    '楽': 'たの.しい|ガク',
    '公': 'おおやけ|コウ',
    '引': 'ひ.く|イン',
    '歌': 'うた|カ',
    '刀': 'かたな|トウ',
    '番': 'つが.い|バン',
    '用': 'もち.いる|ヨウ',
    '何': 'なに|カ',
    '丁': 'ひのと|チョウ',
    '世': 'よ|セイ',
    '両': 'てる|リョウ',
    '主': 'ぬし|シュ',
    '乗': 'の.る|ジョウ',
    '予': 'あらかじ.め|ヨ',
    '事': 'こと|ジ',
    '仕': 'つか.える|シ',
    '他': 'ほか|タ',
    '代': 'か.わる|ダイ',
    '住': 'す.む|ジュウ',
    '使': 'つか.う|シ',
    '係': 'かか.る|ケイ',
    '全': 'まった.く|ゼン',
    '具': 'そな.える|グ',
    '写': 'うつ.す|シャ',
    '助': 'たす.ける|ジョ',
    '勉': 'つと.める|ベン',
    '動': 'うご.く|ドウ',
    '勝': 'か.つ|ショウ',
    '化': 'ば.ける|カ',
    '医': 'い.やす|イ',
    '去': 'さ.る|キョ',
    '反': 'そ.る|ハン',
    '取': 'と.る|シュ',
    '受': 'う.ける|ジュ',
    '号': 'さけ.ぶ|ゴウ',
    '向': 'む.く|コウ',
    '君': 'きみ|クン',
    '味': 'あじ|ミ',
    '命': 'いのち|メイ',
    '和': 'やわ.らぐ|ワ',
    '品': 'しな|ヒン',
    '商': 'あきな.う|ショウ',
    '問': 'と.う|モン',
    '坂': 'さか|ハン',
    '始': 'はじ.める|シ',
    '委': 'ゆだ.ねる|イ',
    '守': 'まも.る|シュ',
    '安': 'やす.い|アン',
    '定': 'さだ.める|テイ',
    '実': 'み|ジツ',
    '宮': 'みや|キュウ',
    '宿': 'やど|シュク',
    '寒': 'さむ.い|カン',
    '対': 'あいて|タイ',
    '局': 'つぼね|キョク',
    '屋': 'や|オク',
    '岸': 'きし|ガン',
    '島': 'しま|トウ',
    '州': 'す|シュウ',
    '帳': 'とばり|チョウ',
    '平': 'たい.ら|ヘイ',
    '幸': 'さいわ.い|コウ',
    '度': 'たび|ド',
    '庫': 'くら|コ',
    '庭': 'にわ|テイ',
    '待': 'ま.つ|タイ',
    '急': 'いそ.ぐ|キュウ',
    '息': 'いき|ソク',
    '悪': 'わる.い|アク',
    '悲': 'かな.しい|ヒ',
    '想': 'おも.う|ソウ',
    '所': 'ところ|ショ',
    '打': 'う.つ|ダ',
    '投': 'な.げる|トウ',
    '拾': 'ひろ.う|シュウ',
    '持': 'も.つ|ジ',
    '指': 'ゆび|シ',
    '放': 'はな.す|ホウ',
    '整': 'ととの.える|セイ',
    '旅': 'たび|リョ',
    '昔': 'むかし|セキ',
    '暑': 'あつ.い|ショ',
    '暗': 'くら.い|アン',
    '曲': 'ま.がる|キョク',
    '有': 'あ.る|ユウ',
    '板': 'いた|ハン',
    '柱': 'はしら|チュウ',
    '根': 'ね|コン',
    '植': 'う.える|ショク',
    '業': 'わざ|ギョウ',
    '様': 'さま|ヨウ',
    '横': 'よこ|オウ',
    '橋': 'はし|キョウ',
    '次': 'つ.ぐ|ジ',
    '歯': 'よわい|シ',
    '死': 'し.ぬ|シ',
    '氷': 'こおり|ヒョウ',
    '決': 'き.める|ケツ',
    '油': 'あぶら|ユ',
    '波': 'なみ|ハ',
    '注': 'そそ.ぐ|チュウ',
    '泳': 'およ.ぐ|エイ',
    '流': 'なが.れる|リュウ',
    '消': 'き.える|ショウ',
    '深': 'ふか.い|シン',
    '温': 'あたた.か|オン',
    '港': 'みなと|コウ',
    '湖': 'みずうみ|コ',
    '湯': 'ゆ|トウ',
    '炭': 'すみ|タン',
    '物': 'もの|ブツ',
    '球': 'たま|キュウ',
    '由': 'よし|ユ',
    '申': 'もう.す|シン',
    '病': 'や.む|ビョウ',
    '発': 'た.つ|ハツ',
    '登': 'のぼ.る|トウ',
    '皮': 'かわ|ヒ',
    '皿': 'さら|ベイ',
    '相': 'あい-|ソウ',
    '県': 'か.ける|ケン',
    '真': 'ま|シン',
    '着': 'き.る|チャク',
    '短': 'みじか.い|タン',
    '研': 'と.ぐ|ケン',
    '神': 'かみ|シン',
    '祭': 'まつ.る|サイ',
    '究': 'きわ.める|キュウ',
    '童': 'わらべ|ドウ',
    '笛': 'ふえ|テキ',
    '筆': 'ふで|ヒツ',
    '等': 'ひと.しい|トウ',
    '箱': 'はこ|ソウ',
    '終': 'お.わる|シュウ',
    '緑': 'みどり|リョク',
    '練': 'ね.る|レン',
    '羊': 'ひつじ|ヨウ',
    '美': 'うつく.しい|ビ',
    '習': 'なら.う|シュウ',
    '者': 'もの|シャ',
    '育': 'そだ.つ|イク',
    '苦': 'くる.しい|ク',
    '荷': 'に|カ',
    '落': 'お.ちる|ラク',
    '葉': 'は|ヨウ',
    '薬': 'くすり|ヤク',
    '血': 'ち|ケツ',
    '表': 'おもて|ヒョウ',
    '詩': 'うた|シ',
    '調': 'しら.べる|チョウ',
    '豆': 'まめ|トウ',
    '負': 'ま.ける|フ',
    '起': 'お.きる|キ',
    '路': '-じ|ロ',
    '身': 'み|シン',
    '転': 'ころ.がる|テン',
    '軽': 'かる.い|ケイ',
    '返': 'かえ.す|ヘン',
    '追': 'お.う|ツイ',
    '送': 'おく.る|ソウ',
    '速': 'はや.い|ソク',
    '進': 'すす.む|シン',
    '遊': 'あそ.ぶ|ユウ',
    '運': 'はこ.ぶ|ウン',
    '部': '-べ|ブ',
    '都': 'みやこ|ト',
    '配': 'くば.る|ハイ',
    '酒': 'さけ|シュ',
    '重': 'え|ジュウ',
    '鉄': 'くろがね|テツ',
    '銀': 'しろがね|ギン',
    '開': 'ひら.く|カイ',
    '陽': 'ひ|ヨウ',
    '階': 'きざはし|カイ',
    '集': 'あつ.まる|シュウ',
    '面': 'おも|メン',
    '飲': 'の.む|イン',
    '館': 'やかた|カン',
    '鼻': 'はな|ビ',
    '争': 'あらそ.う|ソウ',
    '付': 'つ.ける|フ',
    '以': 'もっ.て|イ',
    '仲': 'なか|チュウ',
    '伝': 'つた.わる|デン',
    '位': 'くらい|イ',
    '低': 'ひく.い|テイ',
    '例': 'たと.える|レイ',
    '便': 'たよ.り|ベン',
    '倉': 'くら|ソウ',
    '候': 'そうろう|コウ',
    '借': 'か.りる|シャク',
    '停': 'と.める|テイ',
    '健': 'すこ.やか|ケン',
    '側': 'かわ|ソク',
    '働': 'はたら.く|ドウ',
    '兆': 'きざ.す|チョウ',
    '児': 'こ|ジ',
    '共': 'とも|キョウ',
    '兵': 'つわもの|ヘイ',
    '冷': 'つめ.たい|レイ',
    '初': 'はじ.め|ショ',
    '別': 'わか.れる|ベツ',
    '利': 'き.く|リ',
    '刷': 'す.る|サツ',
    '功': 'いさお|コウ',
    '加': 'くわ.える|カ',
    '努': 'つと.める|ド',
    '労': 'ろう.する|ロウ',
    '勇': 'いさ.む|ユウ',
    '包': 'つつ.む|ホウ',
    '卒': 'そっ.する|ソツ',
    '単': 'ひとえ|タン',
    '印': 'しるし|イン',
    '参': 'まい.る|サン',
    '司': 'つかさど.る|シ',
    '各': 'おのおの|カク',
    '告': 'つ.げる|コク',
    '周': 'まわ.り|シュウ',
    '唱': 'とな.える|ショウ',
    '喜': 'よろこ.ぶ|キ',
    '器': 'うつわ|キ',
    '囲': 'かこ.む|イ',
    '固': 'かた.める|コ',
    '型': 'かた|ケイ',
    '塩': 'しお|エン',
    '士': 'さむらい|シ',
    '変': 'か.わる|ヘン',
    '夫': 'おっと|フ',
    '失': 'うしな.う|シツ',
    '好': 'この.む|コウ',
    '孫': 'まご|ソン',
    '巣': 'す|ソウ',
    '差': 'さ.す|サ',
    '希': 'まれ|キ',
    '席': 'むしろ|セキ',
    '帯': 'お.びる|タイ',
    '底': 'そこ|テイ',
    '建': 'た.てる|ケン',
    '径': 'みち|ケイ',
    '徒': 'いたずら|ト',
    '得': 'え.る|トク',
    '必': 'かなら.ず|ヒツ',
    '愛': 'いと.しい|アイ',
    '成': 'な.る|セイ',
    '戦': 'いくさ|セン',
    '折': 'お.る|セツ',
    '挙': 'あ.げる|キョ',
    '改': 'あらた.める|カイ',
    '救': 'すく.う|キュウ',
    '敗': 'やぶ.れる|ハイ',
    '散': 'ち.る|サン',
    '旗': 'はた|キ',
    '最': 'もっと.も|サイ',
    '望': 'のぞ.む|ボウ',
    '未': 'いま.だ|ミ',
    '末': 'すえ|マツ',
    '札': 'ふだ|サツ',
    '束': 'たば|ソク',
    '松': 'まつ|ショウ',
    '果': 'は.たす|カ',
    '栄': 'さか.える|エイ',
    '案': 'つくえ|アン',
    '梅': 'うめ|バイ',
    '械': 'かせ|カイ',
    '極': 'きわ.める|キョク',
    '標': 'しるべ|ヒョウ',
    '機': 'はた|キ',
    '欠': 'か.ける|ケツ',
    '残': 'のこ.る|ザン',
    '殺': 'ころ.す|サツ',
    '氏': 'うじ|シ',
    '民': 'たみ|ミン',
    '求': 'もと.める|キュウ',
    '治': 'おさ.める|ジ',
    '法': 'のり|ホウ',
    '泣': 'な.く|キュウ',
    '浅': 'あさ.い|セン',
    '浴': 'あ.びる|ヨク',
    '清': 'きよ.い|セイ',
    '満': 'み.ちる|マン',
    '漁': 'あさ.る|ギョ',
    '灯': 'ひ|トウ',
    '無': 'な.い|ム',
    '然': 'しか|ゼン',
    '焼': 'や.く|ショウ',
    '照': 'て.る|ショウ',
    '熱': 'あつ.い|ネツ',
    '牧': 'まき|ボク',
    '産': 'う.む|サン',
    '的': 'まと|テキ',
    '省': 'かえり.みる|セイ',
    '祝': 'いわ.う|シュク',
    '種': 'たね|シュ',
    '積': 'つ.む|セキ',
    '競': 'きそ.う|キョウ',
    '笑': 'わら.う|ショウ',
    '管': 'くだ|カン',
    '節': 'ふし|セツ',
    '粉': 'デシメートル|フン',
    '約': 'つづ.まる|ヤク',
    '結': 'むす.ぶ|ケツ',
    '給': 'たま.う|キュウ',
    '続': 'つづ.く|ゾク',
    '置': 'お.く|チ',
    '老': 'お.いる|ロウ',
    '脈': 'すじ|ミャク',
    '腸': 'はらわた|チョウ',
    '良': 'よ.い|リョウ',
    '芸': 'う.える|ゲイ',
    '芽': 'め|ガ',
    '英': 'はなぶさ|エイ',
    '菜': 'な|サイ',
    '街': 'まち|ガイ',
    '衣': 'ころも|イ',
    '要': 'い.る|ヨウ',
    '覚': 'おぼ.える|カク',
    '観': 'み.る|カン',
    '訓': 'おし.える|クン',
    '試': 'こころ.みる|シ',
    '説': 'と.く|セツ',
    '象': 'かたど.る|ショウ',
    '貨': 'たから|カ',
    '貯': 'た.める|チョ',
    '費': 'つい.やす|ヒ',
    '賞': 'ほ.める|ショウ',
    '軍': 'いくさ|グン',
    '輪': 'わ|リン',
    '辞': 'や.める|ジ',
    '辺': 'あた.り|ヘン',
    '連': 'つら.なる|レン',
    '達': '-たち|タツ',
    '選': 'えら.ぶ|セン',
    '郡': 'こおり|グン',
    '量': 'はか.る|リョウ',
    '録': 'しる.す|ロク',
    '鏡': 'かがみ|キョウ',
    '関': 'せき|カン',
    '陸': 'おか|リク',
    '静': 'しず-|セイ',
    '願': 'ねが.う|ガン',
    '類': 'たぐ.い|ルイ',
    '飛': 'と.ぶ|ヒ',
    '飯': 'めし|ハン',
    '養': 'やしな.う|ヨウ',
    '験': 'あかし|ケン',
    '久': 'ひさ.しい|キュウ',
    '仏': 'ほとけ|ブツ',
    '仮': 'かり|カ',
    '件': 'くだん|ケン',
    '任': 'まか.せる|ニン',
    '似': 'に.る|ジ',
    '余': 'あま.る|ヨ',
    '価': 'あたい|カ',
    '保': 'たも.つ|ホ',
    '修': 'おさ.める|シュウ',
    '俵': 'たわら|ヒョウ',
    '備': 'そな.える|ビ',
    '再': 'ふたた.び|サイ',
    '判': 'わか.る|ハン',
    '則': 'のっと.る|ソク',
    '効': 'き.く|コウ',
    '務': 'つと.める|ム',
    '勢': 'いきお.い|セイ',
    '厚': 'あつ.い|コウ',
    '可': '-べ.き|カ',
    '営': 'いとな.む|エイ',
    '因': 'よ.る|イン',
    '団': 'かたまり|ダン',
    '圧': 'お.す|アツ',
    '在': 'あ.る|ザイ',
    '均': 'なら.す|キン',
    '基': 'もと|キ',
    '報': 'むく.いる|ホウ',
    '境': 'さかい|キョウ',
    '墓': 'はか|ボ',
    '増': 'ま.す|ゾウ',
    '夢': 'ゆめ|ム',
    '妻': 'つま|サイ',
    '婦': 'よめ|フ',
    '容': 'い.れる|ヨウ',
    '寄': 'よ.る|キ',
    '富': 'と.む|フ',
    '導': 'みちび.く|ドウ',
    '居': 'い.る|キョ',
    '属': 'さかん|ゾク',
    '布': 'ぬの|フ',
    '師': 'いくさ|シ',
    '常': 'つね|ジョウ',
    '幹': 'みき|カン',
    '序': 'つい.で|ジョ',
    '弁': 'かんむり|ベン',
    '張': 'は.る|チョウ',
    '往': 'い.く|オウ',
    '復': 'また|フク',
    '志': 'シリング|シ',
    '応': 'あた.る|オウ',
    '快': 'こころよ.い|カイ',
    '性': 'さが|セイ',
    '情': 'なさ.け|ジョウ',
    '態': 'わざ.と|タイ',
    '慣': 'な.れる|カン',
    '承': 'うけたまわ.る|ショウ',
    '技': 'わざ|ギ',
    '招': 'まね.く|ショウ',
    '授': 'さず.ける|ジュ',
    '採': 'と.る|サイ',
    '接': 'つ.ぐ|セツ',
    '提': 'さ.げる|テイ',
    '損': 'そこ.なう|ソン',
    '支': 'ささ.える|シ',
    '政': 'まつりごと|セイ',
    '故': 'ゆえ|コ',
    '敵': 'かたき|テキ',
    '断': 'た.つ|ダン',
    '旧': 'ふる.い|キュウ',
    '易': 'やさ.しい|エキ',
    '暴': 'あば.く|ボウ',
    '条': 'えだ|ジョウ',
    '枝': 'えだ|シ',
    '桜': 'さくら|オウ',
    '検': 'しら.べる|ケン',
    '構': 'かま.える|コウ',
    '武': 'たけ|ブ',
    '比': 'くら.べる|ヒ',
    '永': 'なが.い|エイ',
    '河': 'かわ|カ',
    '混': 'ま.じる|コン',
    '減': 'へ.る|ゲン',
    '測': 'はか.る|ソク',
    '準': 'じゅん.じる|ジュン',
    '潔': 'いさぎよ.い|ケツ',
    '災': 'わざわ.い|サイ',
    '燃': 'も.える|ネン',
    '犯': 'おか.す|ハン',
    '独': 'ひと.り|ドク',
    '率': 'ひき.いる|ソツ',
    '現': 'あらわ.れる|ゲン',
    '留': 'と.める|リュウ',
    '略': 'ほぼ|リャク',
    '益': 'ま.す|エキ',
    '眼': 'まなこ|ガン',
    '破': 'やぶ.る|ハ',
    '確': 'たし.か|カク',
    '示': 'しめ.す|ジ',
    '移': 'うつ.る|イ',
    '程': 'ほど|テイ',
    '築': 'きず.く|チク',
    '素': 'もと|ソ',
    '経': 'へ.る|ケイ',
    '統': 'す.べる|トウ',
    '絶': 'た.える|ゼツ',
    '綿': 'わた|メン',
    '総': 'す.べて|ソウ',
    '編': 'あ.む|ヘン',
    '織': 'お.る|ショク',
    '罪': 'つみ|ザイ',
    '群': 'む.れる|グン',
    '耕': 'たがや.す|コウ',
    '肥': 'こ.える|ヒ',
    '能': 'よ.く|ノウ',
    '興': 'おこ.る|コウ',
    '舌': 'した|ゼツ',
    '舎': 'やど.る|シャ',
    '術': 'すべ|ジュツ',
    '解': 'と.く|カイ',
    '設': 'もう.ける|セツ',
    '許': 'ゆる.す|キョ',
    '証': 'あかし|ショウ',
    '謝': 'あやま.る|シャ',
    '識': 'し.る|シキ',
    '護': 'まも.る|ゴ',
    '豊': 'ゆた.か|ホウ',
    '財': 'たから|ザイ',
    '貧': 'まず.しい|ヒン',
    '責': 'せ.める|セキ',
    '貸': 'か.す|タイ',
    '賛': 'たす.ける|サン',
    '質': 'たち|シツ',
    '述': 'の.べる|ジュツ',
    '迷': 'まよ.う|メイ',
    '退': 'しりぞ.く|タイ',
    '逆': 'さか|ギャク',
    '造': 'つく.る|ゾウ',
    '過': 'す.ぎる|カ',
    '適': 'かな.う|テキ',
    '酸': 'す.い|サン',
    '鉱': 'あらがね|コウ',
    '銅': 'あかがね|ドウ',
    '銭': 'ぜに|セン',
    '防': 'ふせ.ぐ|ボウ',
    '限': 'かぎ.る|ゲン',
    '険': 'けわ.しい|ケン',
    '際': 'きわ|サイ',
    '雑': 'まじ.える|ザツ',
    '非': 'あら.ず|ヒ',
    '預': 'あず.ける|ヨ',
    '領': 'えり|リョウ',
    '額': 'ひたい|ガク',
    '飼': 'か.う|シ',
    '並': 'な.み|ヘイ',
    '乱': 'みだ.れる|ラン',
    '乳': 'ちち|ニュウ',
    '亡': 'な.い|ボウ',
    '供': 'そな.える|キョウ',
    '値': 'ね|チ',
    '傷': 'きず|ショウ',
    '優': 'やさ.しい|ユウ',
    '党': 'なかま|トウ',
    '冊': 'ふみ|サツ',
    '処': 'ところ|ショ',
    '刻': 'きざ.む|コク',
    '割': 'わ.る|カツ',
    '創': 'つく.る|ソウ',
    '勤': 'つと.める|キン',
    '危': 'あぶ.ない|キ',
    '卵': 'たまご|ラン',
    '厳': 'おごそ.か|ゲン',
    '収': 'おさ.める|シュウ',
    '后': 'きさき|コウ',
    '否': 'いな|ヒ',
    '吸': 'す.う|キュウ',
    '呼': 'よ.ぶ|コ',
    '善': 'よ.い|ゼン',
    '困': 'こま.る|コン',
    '垂': 'た.れる|スイ',
    '城': 'しろ|ジョウ',
    '奏': 'かな.でる|ソウ',
    '奮': 'ふる.う|フン',
    '姿': 'すがた|シ',
    '存': 'ながら.える|ソン',
    '宗': 'むね|シュウ',
    '宝': 'たから|ホウ',
    '宣': 'のたま.う|セン',
    '密': 'ひそ.か|ミツ',
    '専': 'もっぱ.ら|セン',
    '射': 'い.る|シャ',
    '将': 'まさ.に|ショウ',
    '尊': 'たっと.い|ソン',
    '就': 'つ.く|シュウ',
    '届': 'とど.ける|カイ',
    '己': 'おのれ|コ',
    '巻': 'ま.く|カン',
    '幕': 'とばり|マク',
    '干': 'ほ.す|カン',
    '幼': 'おさな.い|ヨウ',
    '庁': 'やくしょ|チョウ',
    '座': 'すわ.る|ザ',
    '延': 'の.びる|エン',
    '従': 'したが.う|ジュウ',
    '忘': 'わす.れる|ボウ',
    '我': 'われ|ガ',
    '担': 'かつ.ぐ|タン',
    '拝': 'おが.む|ハイ',
    '拡': 'ひろ.がる|カク',
    '捨': 'す.てる|シャ',
    '探': 'さぐ.る|タン',
    '推': 'お.す|スイ',
    '揮': 'ふる.う|キ',
    '操': 'みさお|ソウ',
    '敬': 'うやま.う|ケイ',
    '映': 'うつ.る|エイ',
    '暖': 'あたた.か|ダン',
    '暮': 'く.れる|ボ',
    '朗': 'ほが.らか|ロウ',
    '机': 'つくえ|キ',
    '染': 'そ.める|セン',
    '株': 'かぶ|シュ',
    '権': 'おもり|ケン',
    '樹': 'き|ジュ',
    '欲': 'ほっ.する|ヨク',
    '沿': 'そ.う|エン',
    '泉': 'いずみ|セン',
    '洗': 'あら.う|セン',
    '済': 'す.む|サイ',
    '源': 'みなもと|ゲン',
    '潮': 'しお|チョウ',
    '激': 'はげ.しい|ゲキ',
    '灰': 'はい|カイ',
    '熟': 'う.れる|ジュク',
    '片': 'かた-|ヘン',
    '異': 'こと|イ',
    '疑': 'うたが.う|ギ',
    '痛': 'いた.い|ツウ',
    '盛': 'も.る|セイ',
    '看': 'み.る|カン',
    '砂': 'すな|サ',
    '私': 'わたくし|シ',
    '秘': 'ひ.める|ヒ',
    '穴': 'あな|ケツ',
    '窓': 'まど|ソウ',
    '筋': 'すじ|キン',
    '簡': 'えら.ぶ|カン',
    '紅': 'べに|コウ',
    '納': 'おさ.める|ノウ',
    '絹': 'きぬ|ケン',
    '縦': 'たて|ジュウ',
    '縮': 'ちぢ.む|シュク',
    '聖': 'ひじり|セイ',
    '背': 'せ|ハイ',
    '胸': 'むね|キョウ',
    '脳': 'のうずる|ノウ',
    '腹': 'はら|フク',
    '臓': 'はらわた|ゾウ',
    '臨': 'のぞ.む|リン',
    '至': 'いた.る|シ',
    '若': 'わか.い|ジャク',
    '著': 'あらわ.す|チョ',
    '蒸': 'む.す|ジョウ',
    '蔵': 'くら|ゾウ',
    '蚕': 'かいこ|サン',
    '衆': 'おお.い|シュウ',
    '裁': 'た.つ|サイ',
    '装': 'よそお.う|ソウ',
    '裏': 'うら|リ',
    '補': 'おぎな.う|ホ',
    '視': 'み.る|シ',
    '覧': 'み.る|ラン',
    '討': 'う.つ|トウ',
    '訪': 'おとず.れる|ホウ',
    '訳': 'わけ|ヤク',
    '認': 'みと.める|ニン',
    '誠': 'まこと|セイ',
    '誤': 'あやま.る|ゴ',
    '諸': 'もろ|ショ',
    '警': 'いまし.める|ケイ',
    '貴': 'たっと.い|キ',
    '遺': 'のこ.す|イ',
    '郷': 'さと|キョウ',
    '針': 'はり|シン',
    '鋼': 'はがね|コウ',
    '閉': 'と.じる|ヘイ',
    '降': 'お.りる|コウ',
    '除': 'のぞ.く|ジョ',
    '障': 'さわ.る|ショウ',
    '難': 'かた.い|ナン',
    '革': 'かわ|カク',
    '頂': 'いただ.く|チョウ',
    '骨': 'ほね|コツ'
  };

  // per-character readings can't know that 日本 is にほん and not にちほん.
  // this is a small override-table for the words that get it wrong most often.
  // (a full reading-dictionary is the real fix - see the changelog)
  var words = {
    '私': 'わたし', '僕': 'ぼく', '俺': 'おれ', '君': 'きみ', '彼': 'かれ', '彼女': 'かのじょ',
    '日本': 'にほん', '日本語': 'にほんご', '日本人': 'にほんじん', '東京': 'とうきょう',
    '英語': 'えいご', '中国': 'ちゅうごく', '韓国': 'かんこく', '大阪': 'おおさか', '京都': 'きょうと',
    '今日': 'きょう', '明日': 'あした', '昨日': 'きのう', '毎日': 'まいにち', '今朝': 'けさ',
    '一昨日': 'おととい', '明後日': 'あさって', '今年': 'ことし', '去年': 'きょねん', '来年': 'らいねん',
    '時間': 'じかん', '時計': 'とけい', '手紙': 'てがみ', '写真': 'しゃしん', '電話': 'でんわ',
    '学生': 'がくせい', '先生': 'せんせい', '学校': 'がっこう', '大学': 'だいがく', '会社': 'かいしゃ',
    '友達': 'ともだち', '家族': 'かぞく', '子供': 'こども', '大人': 'おとな', '両親': 'りょうしん',
    '本': 'ほん', '人': 'ひと', '男': 'おとこ', '女': 'おんな', '水': 'みず', '火': 'ひ', '木': 'き',
    '空': 'そら', '海': 'うみ', '山': 'やま', '川': 'かわ', '花': 'はな', '犬': 'いぬ', '猫': 'ねこ',
    '車': 'くるま', '家': 'いえ', '店': 'みせ', '駅': 'えき', '道': 'みち', '町': 'まち', '国': 'くに',
    '目': 'め', '耳': 'みみ', '口': 'くち', '手': 'て', '足': 'あし', '頭': 'あたま', '顔': 'かお',
    '朝': 'あさ', '昼': 'ひる', '夜': 'よる', '雨': 'あめ', '雪': 'ゆき', '風': 'かぜ', '天気': 'てんき',
    '食べ物': 'たべもの', '飲み物': 'のみもの', '御飯': 'ごはん', '料理': 'りょうり', '野菜': 'やさい',
    '映画': 'えいが', '音楽': 'おんがく', '仕事': 'しごと', '勉強': 'べんきょう', '質問': 'しつもん',
    '一': 'いち', '二': 'に', '三': 'さん', '四': 'よん', '五': 'ご', '六': 'ろく', '七': 'なな',
    '八': 'はち', '九': 'きゅう', '十': 'じゅう', '百': 'ひゃく', '千': 'せん', '万': 'まん', '円': 'えん',
    // 熟字訓 - readings that belong to the whole word, not its characters
    '美味しい': 'おいしい', '大人': 'おとな', '今日': 'きょう', '一人': 'ひとり', '二人': 'ふたり',
    '大丈夫': 'だいじょうぶ', '上手': 'じょうず', '下手': 'へた', '眼鏡': 'めがね', '果物': 'くだもの',
    '八百屋': 'やおや', '土産': 'みやげ', '相撲': 'すもう', '風邪': 'かぜ', '田舎': 'いなか',
    '素敵': 'すてき', '素晴らしい': 'すばらしい', '綺麗': 'きれい', '沢山': 'たくさん',
    // 来る is irregular in speech as well as in grammar - こ / き / く
    '来る': 'くる', '来ます': 'きます', '来ました': 'きました', '来た': 'きた', '来て': 'きて',
    '来ない': 'こない', '来なかった': 'こなかった', '来い': 'こい', '来られる': 'こられる',
    '食べる': 'たべる', '食べます': 'たべます', '食べた': 'たべた', '食べて': 'たべて',
  };

  // the reading-table is written in katakana - fold it to hiragana so the
  // romanizer only has to know one script
  const toHiragana = function (str) {
    let out = '';
    for (let i = 0; i < str.length; i += 1) {
      let c = str[i];
      out += c >= 'ァ' && c <= 'ヶ' ? String.fromCharCode(c.charCodeAt(0) - 0x60) : c;
    }
    return out
  };

  const isKanji = (c) => c >= '一' && c <= '龯';

  // the kun-reading is written 'い.く' - the part before the dot is what the
  // kanji itself spells;  the rest is the okurigana already in the text
  const kunStem = (kun) => kun.split('.')[0];

  const soundOut = function (char, type) {
    let r = readings$1[char];
    if (!r) {
      return char
    }
    let [kun, on] = r.split('|');
    let pick = type === 'kun' ? kun || on : on || kun;
    return toHiragana(kunStem(pick || char))
  };

  /**
   * sound-out a word's kanji.
   * a lone kanji followed by okurigana (行き, 読む) is a native verb, so it
   * takes its kun-reading.  a run of two or more kanji (勉強) is a sino-japanese
   * compound, and takes the on-reading.
   */
  /**
   * 食べました isn't in the override table, but its dictionary-form 食べる is.
   * the root tells us what its kanji spells (食 → た), and the okurigana is
   * already right there in the text.
   */
  const fromRoot = function (word, root) {
    let reading = words[root];
    if (!reading) {
      return null
    }
    // the kanji sit at the front of both the word and its root
    let stem = root.split('').findIndex(c => !isKanji(c));
    if (stem <= 0) {
      return null
    }
    let okurigana = root.slice(stem);
    if (!reading.endsWith(okurigana)) {
      return null
    }
    let kanjiSound = reading.slice(0, reading.length - okurigana.length);
    return word.startsWith(root.slice(0, stem)) ? kanjiSound + word.slice(stem) : null
  };

  const spellKanji = function (word, type, root) {
    if (words[word] !== undefined) {
      return words[word]
    }
    if (root && root !== word) {
      let viaRoot = fromRoot(word, root);
      if (viaRoot) {
        return viaRoot
      }
    }
    let out = '';
    let i = 0;
    while (i < word.length) {
      if (!isKanji(word[i])) {
        out += word[i];
        i += 1;
        continue
      }
      // how long is this run of kanji?
      let run = '';
      while (i < word.length && isKanji(word[i])) {
        run += word[i];
        i += 1;
      }
      let use = type || (run.length > 1 ? 'on' : 'kun');
      run.split('').forEach(c => {
        out += soundOut(c, use);
      });
    }
    return out
  };
  var toReading = spellKanji;

  // は, へ and を are pronounced wa, e and o when they're particles
  const particleSound = { 'は': 'wa', 'へ': 'e', 'を': 'o' };

  const romanji$1 = function (view) {
    view.document.forEach(terms => {
      terms.forEach(term => {
        if (particleSound[term.text] && term.tags.has('Particle')) {
          term.romanji = particleSound[term.text];
          return
        }
        let word = term.normal;
        // any kanji in the word needs sounding-out first
        if (/[一-龯]/.test(word)) {
          word = toReading(word, null, term.root || roots[word]);
        }
        term.romanji = toRomanji$1(word);
      });
    });
    return view
  };

  const readings = function (view) {
    view.document.forEach(terms => {
      terms.forEach(term => {
        if (/[一-龯]/.test(term.text)) {
          term.reading = toReading(term.normal, null, term.root || roots[term.normal]);
        }
      });
    });
    return view
  };
  var compute = { romanji: romanji$1, readings };

  var romanji = {
    compute,
    api: api$1
  };

  const isAcronym = /[ .][A-Z]\.? *$/i;
  const hasEllipse = /(?:\u2026|\.{2,}) *$/;
  const hasLetter = /\p{L}/u;
  const isOrdinal = /[0-9]\. *$/;

  /** does this look like a sentence? */
  const isSentence = function (str, abbrevs) {
    // must have a letter
    if (hasLetter.test(str) === false) {
      return false
    }
    // check for 'F.B.I.'
    if (isAcronym.test(str) === true) {
      return false
    }
    // german ordinals like '4.'
    if (isOrdinal.test(str) === true) {
      return false
    }
    //check for '...'
    if (hasEllipse.test(str) === true) {
      return false
    }
    let txt = str.replace(/[.!?\u203D\u2E18\u203C\u2047-\u2049] *$/, '');
    let words = txt.split(' ');
    let lastWord = words[words.length - 1].toLowerCase();
    // check for 'Mr.'
    if (abbrevs.hasOwnProperty(lastWord) === true) {
      return false
    }
    // //check for jeopardy!
    // if (blacklist.hasOwnProperty(lastWord)) {
    //   return false
    // }
    return true
  };
  var isSentence$1 = isSentence;

  // import unicode from './unicode.js'


  var tokenizer = {
    mutate: (world) => {
      // world.model.one.unicode = unicode
      // world.model.one.contractions = contractions
      world.methods.one.tokenize.isSentence = isSentence$1;
    },
    methods: {
      toTerms: toTerms$1
    }
  };

  // https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
  const reset = '\x1b[0m';

  //cheaper than requiring chalk
  const cli = {
    green: str => '\x1b[32m' + str + reset,
    red: str => '\x1b[31m' + str + reset,
    blue: str => '\x1b[34m' + str + reset,
    magenta: str => '\x1b[35m' + str + reset,
    cyan: str => '\x1b[36m' + str + reset,
    yellow: str => '\x1b[33m' + str + reset,
    black: str => '\x1b[30m' + str + reset,
    dim: str => '\x1b[2m' + str + reset,
    i: str => '\x1b[3m' + str + reset,
  };
  var cli$1 = cli;

  /* eslint-disable no-console */

  const skip = {
    Kanji: 'dim',
    Hiragana: 'dim',
    Katagana: 'dim',
    Ascii: 'dim'
  };
  const tagString = function (tags, model) {
    if (model.one.tagSet) {
      tags = tags.filter(str => !skip[str]);
      tags = tags.map(tag => {
        if (!model.one.tagSet.hasOwnProperty(tag)) {
          return tag
        }
        const c = model.one.tagSet[tag].color || skip[tag] || 'blue';
        return cli$1[c](tag)
      });
    }
    return tags.join(', ')
  };

  const showTags = function (view) {
    let { docs, model } = view;
    if (docs.length === 0) {
      console.log(cli$1.blue('\n     ──────'));
    }
    docs.forEach(terms => {
      console.log(cli$1.blue('\n  ┌─────────'));
      terms.forEach(t => {
        let tags = [...(t.tags || [])];
        let text = t.text || '-';
        if (t.sense) {
          text = `{${t.normal}/${t.sense}}`;
        }
        if (t.implicit) {
          text = '[' + t.implicit + ']';
        }
        text = cli$1.yellow(text);
        let word = "'" + text + "'";
        // word = word.padEnd(15)
        if (t.english) {
          word += cli$1.i(` {${t.english}}`.padEnd(6));
        }
        if (t.reference) {
          let str = view.update([t.reference]).text('normal');
          word += ` - ${cli$1.dim(cli$1.i('[' + str + ']'))}`;
        }
        word = word.padEnd(18);
        let str = cli$1.blue('  │ ') + cli$1.i(word) + '  - ' + tagString(tags, model);
        console.log(str);
      });
    });
  };
  var showTags$1 = showTags;

  /* eslint-disable no-console */

  function isClientSide() {
    return typeof window !== 'undefined' && window.document
  }
  //output some helpful stuff to the console
  const debug = function (opts = {}) {
    let view = this;
    if (typeof opts === 'string') {
      let tmp = {};
      tmp[opts] = true; //allow string input
      opts = tmp;
    }
    if (isClientSide()) {
      return view
    }
    if (opts.tags !== false) {
      showTags$1(view);
      console.log('\n');
    }
    return view
  };
  var debug$1 = debug;

  var dict = {
    は: '-',
    が: '-',
    目: 'eye',
    '私たち': 'we',
    '彼': 'he',
    '彼女': 'she',
    '泳い': 'swim',
    '泳ぎ': 'swimming',
    '歩い': 'walk',
    'する': '(do)',
    '家': 'house'
  };

  const addEnglish = function (view) {
    view.docs.forEach(terms => {
      terms.forEach(term => {
        if (dict[term.normal]) {
          term.english = dict[term.normal];
        }
      });
    });
    return view
  };
  var english = addEnglish;

  const isKnown$1 = (w) => lexicon$2.hasOwnProperty(w);

  // the dictionary-form of each word - 食べました → 食べる, 高かった → 高い
  const addRoot = function (view) {
    view.docs.forEach(terms => {
      terms.forEach(term => {
        if (term.root) {
          return
        }
        if (roots[term.text] !== undefined) {
          term.root = roots[term.text];
          return
        }
        // an unknown verb can still be walked back to its dictionary-form
        if (term.tags.has('Verb')) {
          let found = deconjugate$1(term.text, isKnown$1);
          if (found) {
            term.root = found.root;
            return
          }
        }
        term.root = term.text;
      });
    });
    return view
  };
  var root = addRoot;

  const methods = { debug: debug$1 };

  const api = function (View) {
    Object.assign(View.prototype, methods);
  };
  var output = {
    compute: { english, root },
    api
  };

  const entity = ['Person', 'Place', 'Organization'];

  var nouns = {
    Noun: {
      not: ['Verb', 'Adjective', 'Adverb', 'Value', 'Determiner'],
    },

    Topic: {
      is: 'Noun',
    },
    Object: {
      is: 'Noun',
    },
    Singular: {
      is: 'Noun',
      not: ['Plural'],
    },
    ProperNoun: {
      is: 'Noun',
    },
    Person: {
      is: 'Singular',
      also: ['ProperNoun'],
      not: ['Place', 'Organization', 'Date'],
    },
    FirstName: {
      is: 'Person',
    },
    MaleName: {
      is: 'FirstName',
      not: ['FemaleName', 'LastName'],
    },
    FemaleName: {
      is: 'FirstName',
      not: ['MaleName', 'LastName'],
    },
    LastName: {
      is: 'Person',
      not: ['FirstName'],
    },
    Honorific: {
      is: 'Noun',
      not: ['FirstName', 'LastName', 'Value'],
    },
    Place: {
      is: 'Singular',
      not: ['Person', 'Organization'],
    },
    Country: {
      is: 'Place',
      also: ['ProperNoun'],
      not: ['City'],
    },
    City: {
      is: 'Place',
      also: ['ProperNoun'],
      not: ['Country'],
    },
    Region: {
      is: 'Place',
      also: ['ProperNoun'],
    },
    Address: {
      // is: 'Place',
    },
    Organization: {
      is: 'ProperNoun',
      not: ['Person', 'Place'],
    },
    SportsTeam: {
      is: 'Organization',
    },
    School: {
      is: 'Organization',
    },
    Company: {
      is: 'Organization',
    },
    Plural: {
      is: 'Noun',
      not: ['Singular'],
    },
    Uncountable: {
      is: 'Noun',
    },
    Pronoun: {
      is: 'Noun',
      not: entity,
    },
    Actor: {
      is: 'Noun',
      not: entity,
    },
    Activity: {
      is: 'Noun',
      not: ['Person', 'Place'],
    },
    Unit: {
      is: 'Noun',
      not: entity,
    },
    Demonym: {
      is: 'Noun',
      also: ['ProperNoun'],
      not: entity,
    },
    Possessive: {
      is: 'Noun',
    },
    // こそあど - これ, その, どこ
    Demonstrative: {},
    // 形式名詞 - こと, もの, ため: grammatical, but still nouns
    FormalNoun: {
      is: 'Noun',
    },
    // さん, 様, 先生
    PluralSuffix: {},
    // german genders
    MaleNoun: {
      is: 'Noun',
      not: ['FemaleNoun', 'NeuterNoun'],
    },
    FemaleNoun: {
      is: 'Noun',
      not: ['MaleNoun', 'NeuterNoun'],
    },
    NeuterNoun: {
      is: 'Noun',
      not: ['MaleNoun', 'FemaleNoun'],
    },
  };

  var verbs$1 = {
    Verb: {
      not: ['Noun', 'Adjective', 'Adverb', 'Value', 'Expression'],
    },
    ConditionalVerb: {
      is: 'Verb',
    },
    Passive: {
      is: 'Verb',
    },
    Causative: {
      is: 'Verb',
    },
    // tense is a facet, not a class: japanese adjectives carry it too
    // (高かった is a past-tense *adjective*), so these must not imply #Verb
    PresentTense: {
      not: ['PastTense'],
    },
    Infinitive: {
      is: 'Verb',
      not: ['Gerund'],
    },
    Imperative: {
      is: 'Verb',
    },
    // the て-form takes its tense from the helper verb that follows it
    // (読んで いました), so it must not fight with #PastTense
    Gerund: {},
    PastTense: {
      not: ['PresentTense'],
    },
    Copula: {
      is: 'Verb',
    },
    Modal: {
      is: 'Verb',
      not: ['Infinitive'],
    },
    PerfectTense: {
      is: 'Verb',
      not: ['Gerund'],
    },
    Pluperfect: {
      is: 'Verb',
    },
    Participle: {
      is: 'PastTense',
    },
    PhrasalVerb: {
      is: 'Verb',
    },
    Particle: {
      is: 'PhrasalVerb',
      not: ['PastTense', 'PresentTense', 'Copula', 'Gerund'],
    },
    Auxiliary: {
      is: 'Verb',
      not: ['Conjunction'],
    },
    // japanese stacks these onto a single word, so they're facets, not classes
    Negative: {
      not: ['Noun', 'Value'],
    },
    Polite: {},
    Volitional: {
      is: 'Verb',
    },
    Potential: {
      is: 'Verb',
    },
    Progressive: {
      is: 'Verb',
    },
    Desire: {
      is: 'Verb',
    },
    Representative: {
      is: 'Verb',
    },
    Presumptive: {},
    Continuative: {
      is: 'Verb',
    },
    // 連用形 - the 'masu-stem'.  it heads a verb-phrase (泳ぎます) but stands
    // alone as a noun too - 泳ぎ is 'a swim'
    VerbStem: {
      is: 'Noun',
    },
    // 勉強, which is a noun until it meets する
    SuruVerb: {
      is: 'Noun',
    },
  };

  var values = {
    Value: {
      not: ['Verb', 'Adjective', 'Adverb'],
    },
    Ordinal: {
      is: 'Value',
      not: ['Cardinal'],
    },
    Cardinal: {
      is: 'Value',
      not: ['Ordinal'],
    },
    Fraction: {
      is: 'Value',
      not: ['Noun'],
    },
    Multiple: {
      is: 'Value',
    },
    RomanNumeral: {
      is: 'Cardinal',
      not: ['TextValue'],
    },
    TextValue: {
      is: 'Value',
      not: ['NumericValue'],
    },
    TextOrdinal: {
      is: 'TextValue',
      also: ['Ordinal']
    },
    TextCardinal: {
      is: 'TextValue',
      also: ['Cardinal']
    },

    NumericValue: {
      is: 'Value',
      not: ['TextValue'],
    },
    Money: {
      is: 'Cardinal',
    },
    Percent: {
      is: 'Value',
    },
  };

  var dates = {
    Date: {
      not: ['Verb', 'Adverb', 'Adjective'],
    },
    Month: {
      is: 'Singular',
      also: ['Date'],
      not: ['Year', 'WeekDay', 'Time'],
    },
    WeekDay: {
      is: 'Noun',
      also: ['Date'],
    },
    Year: {
      is: 'Date',
      not: ['RomanNumeral'],
    },
    FinancialQuarter: {
      is: 'Date',
      not: 'Fraction',
    },
    // 'easter'
    Holiday: {
      is: 'Date',
      also: ['Noun'],
    },
    // 'summer'
    Season: {
      is: 'Date',
    },
    Timezone: {
      is: 'Noun',
      also: ['Date'],
      not: ['ProperNoun'],
    },
    Time: {
      is: 'Date',
      not: ['AtMention'],
    },
    // 'months'
    Duration: {
      is: 'Noun',
      also: ['Date'],
    },
  };

  const anything = ['Noun', 'Verb', 'Adjective', 'Adverb', 'Value', 'QuestionWord'];

  var misc = {
    // japanese scripts as tags
    Hiragana: {
      not: ['Katakana', 'Kanji', 'Ascii']
    },
    Kanji: {
      not: ['Hiragana', 'Katakana', 'Ascii']
    },
    Katakana: {
      not: ['Hiragana', 'Kanji', 'Ascii']
    },
    Ascii: {
      not: ['Hiragana', 'Kanji', 'Katakana']
    },

    Adjective: {
      not: ['Noun', 'Verb', 'Adverb', 'Value'],
    },
    // 形容詞 - conjugates by itself: 高い → 高くない → 高かった
    IAdjective: {
      is: 'Adjective',
    },
    // 形容動詞 - needs the copula: 静か → 静かだ → 静かな
    NaAdjective: {
      is: 'Adjective',
    },
    // 連体詞 - only ever modifies a noun: 大きな, この
    Adnominal: {},
    Comparable: {
      is: 'Adjective',
    },
    Comparative: {
      is: 'Adjective',
    },
    Superlative: {
      is: 'Adjective',
      not: ['Comparative'],
    },
    NumberRange: {},
    Adverb: {
      not: ['Noun', 'Verb', 'Adjective', 'Value'],
    },

    Determiner: {
      not: ['Noun', 'Verb', 'Adjective', 'Adverb', 'QuestionWord', 'Conjunction'], //allow 'a' to be a Determiner/Value
    },
    Conjunction: {
      not: anything,
    },
    Preposition: {
      not: ['Noun', 'Verb', 'Adjective', 'Adverb', 'QuestionWord'],
    },
    QuestionWord: {
      not: ['Determiner'],
    },
    Currency: {
      is: 'Noun',
    },
    Expression: {
      not: ['Noun', 'Adjective', 'Verb', 'Adverb'],
    },
    Abbreviation: {},
    Url: {
      not: ['HashTag', 'PhoneNumber', 'Verb', 'Adjective', 'Value', 'AtMention', 'Email'],
    },
    PhoneNumber: {
      not: ['HashTag', 'Verb', 'Adjective', 'Value', 'AtMention', 'Email'],
    },
    HashTag: {},
    AtMention: {
      is: 'Noun',
      not: ['HashTag', 'Email'],
    },
    Emoji: {
      not: ['HashTag', 'Verb', 'Adjective', 'Value', 'AtMention'],
    },
    Emoticon: {
      not: ['HashTag', 'Verb', 'Adjective', 'Value', 'AtMention'],
    },
    Email: {
      not: ['HashTag', 'Verb', 'Adjective', 'Value', 'AtMention'],
    },
    Acronym: {
      not: ['Plural', 'RomanNumeral'],
    },
    Condition: {
      not: ['Verb', 'Adjective', 'Noun', 'Value'],
    },
  };

  // 助詞 - japanese particles.
  // they follow the word they mark, so calling them 'prepositions' is a stretch -
  // but compromise's shared tagset uses #Preposition, and downstream matches
  // depend on it, so the case-marking particles keep that as a parent tag.
  var particles = {
    Particle: {
      not: ['Noun', 'Verb', 'Adjective', 'Adverb', 'Value'],
    },
    // 格助詞 - が を に へ で と から より まで
    CaseParticle: {
      is: 'Particle',
      not: ['TopicParticle', 'AdverbialParticle', 'ConjunctiveParticle', 'SentenceParticle', 'AdnominalParticle', 'QuotativeParticle'],
      also: ['Preposition'],
    },
    // 係助詞 - は も こそ さえ しか
    TopicParticle: {
      is: 'Particle',
      not: ['CaseParticle', 'AdverbialParticle', 'ConjunctiveParticle', 'SentenceParticle', 'AdnominalParticle', 'QuotativeParticle'],
      also: ['Preposition'],
    },
    // 副助詞 - だけ ばかり ほど くらい など
    AdverbialParticle: {
      is: 'Particle',
      not: ['CaseParticle', 'TopicParticle', 'ConjunctiveParticle', 'SentenceParticle', 'AdnominalParticle', 'QuotativeParticle'],
      also: ['Preposition'],
    },
    // 接続助詞 - て ば たら ながら ので のに けれど
    ConjunctiveParticle: {
      is: 'Particle',
      not: ['CaseParticle', 'TopicParticle', 'AdverbialParticle', 'SentenceParticle', 'AdnominalParticle', 'QuotativeParticle'],
      also: ['Conjunction'],
    },
    // 終助詞 - か ね よ な わ ぞ ぜ
    SentenceParticle: {
      is: 'Particle',
      not: ['CaseParticle', 'TopicParticle', 'AdverbialParticle', 'ConjunctiveParticle', 'AdnominalParticle', 'QuotativeParticle'],
    },
    // の - possessive and nominalizer
    AdnominalParticle: {
      is: 'Particle',
      not: ['CaseParticle', 'TopicParticle', 'AdverbialParticle', 'ConjunctiveParticle', 'SentenceParticle', 'QuotativeParticle'],
      also: ['Preposition'],
    },
    // と, when it introduces a quote
    QuotativeParticle: {
      is: 'Particle',
      not: ['CaseParticle', 'TopicParticle', 'AdverbialParticle', 'ConjunctiveParticle', 'SentenceParticle', 'AdnominalParticle'],
      also: ['Conjunction'],
    },
  };

  let tags = Object.assign({}, nouns, verbs$1, values, dates, particles, misc);

  var tagset = {
    tags
  };

  const every = function (str, fn) {
    for (let i = 0; i < str.length; i += 1) {
      if (!fn(str[i])) {
        return false
      }
    }
    return str.length > 0
  };

  const tagScript = function (terms, setTag, world) {
    const reason = 'script';
    terms.forEach(term => {
      let str = term.text;
      if (every(str, isHiragana$1)) {
        setTag([term], 'Hiragana', world, null, reason);
        return
      }
      if (every(str, c => isKatakana(c) || c === 'ー')) {
        setTag([term], 'Katakana', world, null, reason);
        // a katakana word is nearly always a loanword noun
        if (term.tags.size <= 1) {
          setTag([term], 'Noun', world, null, reason);
        }
        return
      }
      if (every(str, isKanji$1)) {
        setTag([term], 'Kanji', world, null, reason);
        return
      }
      if (every(str, isNumber)) {
        setTag([term], 'Value', world, null, reason);
        setTag([term], 'Cardinal', world, null, reason);
        return
      }
      if (every(str, isAscii)) {
        setTag([term], 'Ascii', world, null, reason);
        return
      }
      // a mixed kanji+hiragana word (書いた, 食べる) - no single script tag
    });
  };
  var tagScript$1 = tagScript;

  // what a particle tells us about the word in front of it.
  // this is the workhorse of japanese pos-tagging: the particle *is* the syntax.
  const reason$4 = 'particle';

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
  };
  // に and で follow nouns, but also verb-stems (見に行く) and な-adjectives (静かで)
  const softNounBefore = new Set(['に', 'で', 'と', 'も']);

  // particles that only ever follow a verb or adjective
  const verbBefore = new Set(['て', 'ば', 'たら', 'ながら', 'ので', 'のに', 'けれど', 'けれども', 'けど', 'たり']);

  const tagParticles = function (terms, setTag, world) {
    for (let i = 0; i < terms.length; i += 1) {
      let t = terms[i];
      let prev = terms[i - 1];
      let next = terms[i + 1];
      let str = t.text;

      // な before a noun is the adnominal copula (静かな人), not a final particle
      if (str === 'な' && next && !next.tags.has('Verb')) {
        setTag([t], 'AdnominalParticle', world, null, reason$4);
        if (prev) {
          setTag([prev], 'NaAdjective', world, null, reason$4);
        }
        continue
      }
      // か at the end of a clause is a question-marker, not 'or'
      if (str === 'か' && (!next || next.tags.has('SentenceParticle'))) {
        setTag([t], 'SentenceParticle', world, null, reason$4);
        setTag([t], 'QuestionWord', world, null, reason$4);
        continue
      }
      // と after a verb introduces a quote;  between two nouns it means 'and'
      if (str === 'と' && prev) {
        if (prev.tags.has('Verb') || prev.tags.has('Copula')) {
          setTag([t], 'QuotativeParticle', world, null, reason$4);
          continue
        }
        if (next && !next.tags.has('Verb')) {
          setTag([t], 'Conjunction', world, null, reason$4);
        }
      }
      // で after a noun is 'at/by'; after a な-adjective it's the copula
      if (str === 'で' && prev && prev.tags.has('NaAdjective')) {
        setTag([t], 'Copula', world, null, reason$4);
        setTag([t], 'Gerund', world, null, reason$4);
        continue
      }

      // a particle never marks another particle
      if (!prev || prev.tags.has('Particle')) {
        continue
      }
      if (nounBefore[str] !== undefined) {
        if (!prev.tags.has('Verb') && !prev.tags.has('Adjective')) {
          setTag([prev], nounBefore[str], world, null, reason$4);
        } else if (str === 'の' || str === 'が') {
          // 走るの / 行くが - the verb is nominalized or the clause continues
          setTag([t], str === 'の' ? 'AdnominalParticle' : 'ConjunctiveParticle', world, null, reason$4);
        }
        continue
      }
      if (softNounBefore.has(str) && !prev.tags.has('Verb') && !prev.tags.has('Adjective') && prev.tags.size <= 1) {
        setTag([prev], 'Noun', world, null, reason$4);
        continue
      }
      if (verbBefore.has(str) && prev.tags.size <= 1) {
        setTag([prev], 'Verb', world, null, reason$4);
      }
    }
  };
  var tagParticles$1 = tagParticles;

  const reason$3 = 'verbSuffix';
  const isKnown = (w) => lexicon$2.hasOwnProperty(w);
  const scriptOnly$1 = new Set(['Kanji', 'Hiragana', 'Katakana', 'Ascii']);

  // a verb we've never seen can still be read off its ending.
  // 「散歩した」 is a verb even if 散歩する isn't in the lexicon.
  const tagUnknownVerbs = function (terms, setTag, world) {
    terms.forEach(term => {
      // only guess at words the lexicon hasn't already resolved.
      // すみません is an expression, not the negative of a verb 済む.
      let known = [...term.tags].some(t => !scriptOnly$1.has(t));
      if (known) {
        return
      }
      if (term.text.length < 2) {
        return
      }
      let found = deconjugate$1(term.text, isKnown);
      if (!found || found.guess === true) {
        return
      }
      found.tags.forEach(tag => setTag([term], tag, world, null, reason$3));
      term.root = found.root;
    });
  };

  // する attaches to the noun before it - 「勉強 します」
  const tagSuruVerbs = function (terms, setTag, world) {
    for (let i = 1; i < terms.length; i += 1) {
      let t = terms[i];
      if (!t.tags.has('Verb')) {
        continue
      }
      if (/^(し|す|さ)/.test(t.text) === false) {
        continue
      }
      let prev = terms[i - 1];
      if (prev && prev.tags.has('SuruVerb')) {
        setTag([prev], 'Verb', world, null, 'suruVerb');
      }
    }
  };

  // 〜て + いる/ある/おく/しまう - the helper verb carries the aspect,
  // but the meaning belongs to the て-form in front of it
  // 〜ている marks aspect;  〜てしまう, 〜てくれる and friends only add nuance
  const aspectVerbs = ['いる', '居る', 'おる', 'ある'];
  const otherHelpers = ['おく', 'しまう', '来る', 'くる', '行く', 'いく', 'みる', '見る', 'あげる', 'くれる', 'もらう'];

  // every surface-form of every helper, so we can recognise いました / しまった
  const formsOf = function (list) {
    let set = new Set();
    list.forEach(dict => {
      let forms = conjugateVerb(dict);
      if (forms) {
        Object.keys(forms).forEach(k => typeof forms[k] === 'string' && set.add(forms[k]));
      }
    });
    return set
  };
  let isAspect = formsOf(aspectVerbs);
  let isHelper = formsOf(otherHelpers);

  const tagCompoundVerbs = function (terms, setTag, world) {
    for (let i = 1; i < terms.length; i += 1) {
      let t = terms[i];
      let prev = terms[i - 1];
      if (!prev || !prev.tags.has('Gerund') || !t.tags.has('Verb')) {
        continue
      }
      if (!isAspect.has(t.text) && !isHelper.has(t.text)) {
        continue
      }
      if (isAspect.has(t.text)) {
        setTag([prev], 'Progressive', world, null, 'compoundVerb');
      }
  ['PastTense', 'Negative', 'Polite'].forEach(tag => {
        if (t.tags.has(tag)) {
          setTag([prev], tag, world, null, 'compoundVerb');
        }
      });
    }
  };

  // an auxiliary hands its tense back to the verb it attaches to
  const tagAuxiliary = function (terms, setTag, world) {
    for (let i = 1; i < terms.length; i += 1) {
      let t = terms[i];
      if (!t.tags.has('Auxiliary')) {
        continue
      }
      let prev = terms[i - 1];
      if (!prev) {
        continue
      }
      if (!prev.tags.has('Verb') && !prev.tags.has('Adjective') && !prev.tags.has('Noun')) {
        setTag([prev], 'Verb', world, null, 'beforeAuxiliary');
      }
  ['PastTense', 'PresentTense', 'Negative', 'Polite'].forEach(tag => {
        if (t.tags.has(tag) && prev.tags.has('Verb')) {
          setTag([prev], tag, world, null, 'fromAuxiliary');
        }
      });
    }
  };

  var verbs = { tagUnknownVerbs, tagSuruVerbs, tagAuxiliary, tagCompoundVerbs };

  const reason$2 = 'adjSuffix';

  // い-adjective endings.  the old rule was 'ends in い → Adjective', which
  // swallowed every negative verb (行かない), every masu-stem noun (お願い),
  // and 弟/はい/せい besides.
  const looksAdjective = /(し|た|な|か|ら|わ|が|ば|ざ|さ|は|ま|よ|る|す|つ|ぬ|ぶ|む|ぐ|ゆ|ろ|そ|お|こ|の|ほ|も|ど|ぼ|ぽ|ご|ぞ|づ|べ|で|げ|ぜ|え|け|せ|て|ね|へ|め|れ)い$/;
  // endings that look like an い-adjective but aren't
  const notAdjective = /(ない|たい|らしい|っぽい)$/;

  const adjSuffixes = function (terms, setTag, world) {
    terms.forEach(term => {
      let str = term.text;
      if (term.tags.size > 1 || term.tags.has('Verb') || term.tags.has('Adjective')) {
        return
      }
      if (str.length < 3 || !str.endsWith('い')) {
        return
      }
      // ない/たい are verb endings, and are already handled as such
      if (notAdjective.test(str) && !term.tags.has('Adjective')) {
        return
      }
      // 美しい - kanji stem plus a hiragana tail is the classic shape
      if (isKanji$1(str[0]) && looksAdjective.test(str)) {
        setTag([term], 'Adjective', world, null, reason$2);
        setTag([term], 'IAdjective', world, null, reason$2);
      }
    });
  };

  // 〜さ nominalises an adjective (高さ), 〜たち pluralises a noun (子供たち)
  const nounSuffixes = function (terms, setTag, world) {
    terms.forEach(term => {
      if (term.text.length > 2 && /(たち|達)$/.test(term.text)) {
        setTag([term], 'Plural', world, null, 'nounSuffix');
        setTag([term], 'Noun', world, null, 'nounSuffix');
      }
    });
  };

  var adjectives = { adjSuffixes, nounSuffixes };

  const reason$1 = 'honorific';

  // 田中さん - an honorific proves the word before it is a person
  const tagPeople = function (terms, setTag, world) {
    for (let i = 0; i < terms.length; i += 1) {
      let t = terms[i];
      if (!t.tags.has('Honorific')) {
        continue
      }
      let prev = terms[i - 1];
      if (prev && !prev.tags.has('Verb') && !prev.tags.has('Particle')) {
        setTag([prev], 'Person', world, null, reason$1);
      }
    }
    // 田中さん may have tokenized as one word - the suffix is still a signal
    terms.forEach(term => {
      if (term.text.length > 2 && /(さん|様|さま|ちゃん|くん|氏)$/.test(term.text) && term.tags.size <= 1) {
        setTag([term], 'Person', world, null, reason$1);
      }
    });
  };
  var tagPeople$1 = tagPeople;

  // anything still unlabelled at the end is a noun - the safest guess in japanese
  const reason = 'noun-fallback';
  const scriptOnly = new Set(['Kanji', 'Hiragana', 'Katakana', 'Ascii']);

  const fallback = function (terms, setTag, world) {
    terms.forEach(term => {
      let tags = [...term.tags];
      if (tags.length === 0 || tags.every(t => scriptOnly.has(t))) {
        setTag([term], 'Noun', world, null, reason);
      }
    });
  };

  const preTagger$1 = function (view) {
    const setTag = view.methods.one.setTag || function () { };
    const world = view.world;
    view.document.forEach(terms => {
      // 1. which script is each token written in?
      tagScript$1(terms, setTag, world);
      // 2. verbs we don't have in the lexicon, read off their conjugation
      verbs.tagUnknownVerbs(terms, setTag, world);
      // 3. い-adjectives by their shape
      adjectives.adjSuffixes(terms, setTag, world);
      // 4. particles, and what they imply about their neighbour
      tagParticles$1(terms, setTag, world);
      // 5. 勉強 + します
      verbs.tagSuruVerbs(terms, setTag, world);
      // 6. an auxiliary passes its tense back to its verb
      verbs.tagAuxiliary(terms, setTag, world);
      // 7. 読んで + いました is one progressive verb-phrase
      verbs.tagCompoundVerbs(terms, setTag, world);
      // 8. plural and honorific suffixes
      adjectives.nounSuffixes(terms, setTag, world);
      tagPeople$1(terms, setTag, world);
      // 9. whatever's left is a noun
      fallback(terms, setTag, world);
    });
    return view
  };
  var preTagger$2 = preTagger$1;

  var preTagger = {
    compute: {
      preTagger: preTagger$2
    },

    hooks: ['preTagger'],
  };

  var version = '0.1.0';

  nlp$1.plugin(tokenizer);
  nlp$1.plugin(tagset);
  nlp$1.plugin(lexicon);
  nlp$1.plugin(output);
  nlp$1.plugin(romanji);
  nlp$1.plugin(preTagger);

  const ja = function (txt, lex) {
    // split sentences
    let doc = nlp$1.tokenize(txt, lex);
    // tokenize terms ourselves - compromise splits on whitespace, which japanese
    // mostly doesn't use.  every whitespace-chunk still needs splitting, so run
    // the tokenizer over each of them and keep their surrounding punctuation.
    doc.document = doc.document.map(a => {
      let out = [];
      // if the sentence has spaces in it, they're real word-boundaries
      let spaced = a.length > 1;
      a.forEach(term => {
        let terms = toTerms(term.text, spaced);
        if (terms.length === 0) {
          out.push(term);
          return
        }
        terms[0].pre = (term.pre || '') + terms[0].pre;
        terms[terms.length - 1].post += term.post || '';
        out = out.concat(terms);
      });
      return out
    });
    const world = nlp$1.world();
    doc.compute(world.hooks);
    return doc
  };

  // copy constructor methods over
  Object.keys(nlp$1).forEach(k => {
    if (nlp$1.hasOwnProperty(k)) {
      ja[k] = nlp$1[k];
    }
  });

  // this one is hidden
  Object.defineProperty(ja, '_world', {
    value: nlp$1._world,
    writable: true,
  });
  /** log the decision-making to console */
  ja.verbose = function (set) {
    let env = typeof process === 'undefined' ? self.env || {} : process.env; //use window, in browser
    env.DEBUG_TAGS = set === 'tagger' || set === true ? true : '';
    env.DEBUG_MATCH = set === 'match' || set === true ? true : '';
    env.DEBUG_CHUNKS = set === 'chunker' || set === true ? true : '';
    return this
  };

  // conjugation helpers, usable without a document
  Object.assign(ja, methods$1);

  ja.version = version;

  return ja;

}));
