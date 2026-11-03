(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.jaCompromise = factory());
})(this, (function () { 'use strict';

  const methods$o = {
    one: {},
    two: {},
    three: {},
    four: {},
  };

  const model$4 = {
    one: {},
    two: {},
    three: {},
  };
  const compute$8 = {};
  const hooks = [];

  var tmpWrld = { methods: methods$o, model: model$4, compute: compute$8, hooks };

  const fns$4 = {
    /** add metadata to term objects */
    compute: function (input, options) {
      const { world } = this;
      const compute = world.compute;
      // do one method
      if (typeof input === 'string' && Object.hasOwn(compute, input)) {
        compute[input](this, options);
      }
      // allow a list of methods
      else if (Array.isArray(input)) {
        input.forEach(name => {
          if (Object.hasOwn(world.compute, name)) {
            compute[name](this, options);
          } else {
            console.warn('no compute:', input); // eslint-disable-line
          }
        });
      }
      // allow a custom compute function
      else if (typeof input === 'function') {
        input(this, options);
      } else {
        console.warn('no compute:', input); // eslint-disable-line
      }
      return this
    },
  };

  // wrappers for loops in javascript arrays

  const forEach = function (cb) {
    const ptrs = this.fullPointer;
    ptrs.forEach((ptr, i) => {
      const view = this.update([ptr]);
      cb(view, i);
    });
    return this
  };

  const map = function (cb, empty) {
    const ptrs = this.fullPointer;
    const res = ptrs.map((ptr, i) => {
      const view = this.update([ptr]);
      const out = cb(view, i);
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
      const view = this.update([ptr]);
      return cb(view, i)
    });
    const res = this.update(ptrs);
    return res
  };

  const find = function (cb) {
    const ptrs = this.fullPointer;
    const found = ptrs.find((ptr, i) => {
      const view = this.update([ptr]);
      return cb(view, i)
    });
    return this.update([found])
  };

  const some = function (cb) {
    const ptrs = this.fullPointer;
    return ptrs.some((ptr, i) => {
      const view = this.update([ptr]);
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
      const m = this.match('.');
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
      const res = {};
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
      const n = this.fullPointer.length - 1;
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
      const ptrs = this.fullPointer.map(a => [a[0]]); //lazy!
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
      const aPtr = this.fullPointer;
      const bPtr = b.fullPointer;
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
      const ptrs = this.pointer;
      if (!ptrs) {
        return true
      }
      // must start at beginning
      if (ptrs.length === 0 || ptrs[0][0] !== 0) {
        return false
      }
      let wantTerms = 0;
      let haveTerms = 0;
      this.document.forEach(terms => wantTerms += terms.length);
      this.docs.forEach(terms => haveTerms += terms.length);
      return wantTerms === haveTerms
      // for (let i = 0; i < ptrs.length; i += 1) {
      //   let [n, start, end] = ptrs[i]
      //   // it's not the start
      //   if (n !== i || start !== 0) {
      //     return false
      //   }
      //   // it's too short
      //   if (document[n].length > end) {
      //     return false
      //   }
      // }
      // return true
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

  const methods$n = { ...utils, ...fns$4, ...loops };

  // aliases
  methods$n.get = methods$n.eq;

  class View {
    constructor(document, pointer, groups = {}) {
      // invisible props
      const props = [
        ['document', document],
        ['world', tmpWrld],
        ['_groups', groups],
        ['_cache', null],
        ['viewType', 'View'],
      ];
      props.forEach(a => {
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
      const { docs, ptrs, document } = this;
      // compute a proper pointer, from docs
      const pointers = ptrs || docs.map((_d, n) => [n]);
      // do we need to repair it, first?
      return pointers.map(a => {
        // eslint-disable-next-line prefer-const
        let [n, start, end, id, endId] = a;
        start ||= 0;
        end ||= (document[n] || []).length;
        //add frozen id, for good-measure
        if (document[n]?.[start]) {
          id ||= document[n][start].id;
          if (document[n][end - 1]) {
            endId ||= document[n][end - 1].id;
          }
        }
        return [n, start, end, id, endId]
      })
    }
    // create a new View, from this one
    update(pointer) {
      const m = new View(this.document, pointer);
      // send the cache down, too?
      if (this._cache && pointer?.length > 0) {
        // only keep cache if it's a full-sentence
        const cache = [];
        pointer.forEach((ptr, i) => {
          const [n, start, end] = ptr;
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
      const document = methods.one.tokenize.fromString(input, this.world);
      const doc = new View(document);
      doc.world = this.world;
      doc.compute(['normal', 'freeze', 'lexicon']);
      if (this.world.compute.preTagger) {
        doc.compute('preTagger');
      }
      doc.compute('unfreeze');
      return doc
    }
    clone() {
      // clone the whole document
      let document = this.document.slice(0); //node 17: structuredClone(document);
      document = document.map(terms => {
        return terms.map(term => {
          term = { ...term };
          term.tags = new Set(term.tags);
          return term
        })
      });
      // clone only sub-document ?
      const m = this.update(this.pointer);
      m.document = document;
      m._cache = this._cache; //clone this too?
      return m
    }
  }
  Object.assign(View.prototype, methods$n);

  var version$1 = '14.19.0';

  const isObject$6 = function (item) {
    return item && typeof item === 'object' && !Array.isArray(item)
  };

  const isUnsafeKey = key => key === '__proto__' || key === 'constructor' || key === 'prototype';

  // recursive merge of objects
  function mergeDeep(model, plugin) {
    if (isObject$6(plugin)) {
      for (const key in plugin) {
        // prevent prototype pollution
        if (isUnsafeKey(key)) {
          continue
        }
        if (isObject$6(plugin[key])) {
          if (!model[key]) Object.assign(model, { [key]: {} });
          mergeDeep(model[key], plugin[key]); //recursion
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
      if (isUnsafeKey(key)) continue
      model[key] ||= {};
      Object.assign(model[key], plugin[key]);
    }
    return model
  }

  const addIrregulars = function (model, conj) {
    const m = model.two.models || {};
    Object.keys(conj).forEach(k => {
      // verb forms
      if (conj[k].pastTense) {
        if (m.toPast) {
          m.toPast.ex[k] = conj[k].pastTense;
        }
        if (m.fromPast) {
          m.fromPast.ex[conj[k].pastTense] = k;
        }
      }
      if (conj[k].presentTense) {
        if (m.toPresent) {
          m.toPresent.ex[k] = conj[k].presentTense;
        }
        if (m.fromPresent) {
          m.fromPresent.ex[conj[k].presentTense] = k;
        }
      }
      if (conj[k].gerund) {
        if (m.toGerund) {
          m.toGerund.ex[k] = conj[k].gerund;
        }
        if (m.fromGerund) {
          m.fromGerund.ex[conj[k].gerund] = k;
        }
      }
      // adjective forms
      if (conj[k].comparative) {
        if (m.toComparative) {
          m.toComparative.ex[k] = conj[k].comparative;
        }
        if (m.fromComparative) {
          m.fromComparative.ex[conj[k].comparative] = k;
        }
      }
      if (conj[k].superlative) {
        if (m.toSuperlative) {
          m.toSuperlative.ex[k] = conj[k].superlative;
        }
        if (m.fromSuperlative) {
          m.fromSuperlative.ex[conj[k].superlative] = k;
        }
      }
    });
  };

  const extend = function (plugin, world, View, nlp) {
    // support array of plugins
    if (Array.isArray(plugin)) {
      plugin.forEach(p => extend(p, world, View, nlp));
      return
    }
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
      Object.keys(plugin.lib).forEach(k => (nlp[k] = plugin.lib[k]));
    }
    if (plugin.tags) {
      nlp.addTags(plugin.tags);
    }
    if (plugin.words) {
      nlp.addWords(plugin.words);
    }
    if (plugin.frozen) {
      nlp.addWords(plugin.frozen, true);
    }
    if (plugin.mutate) {
      plugin.mutate(world, nlp);
    }
  };

  // Shared CLI colors and styles.
  const color = code => s => '\x1b[' + code + 'm' + s + '\x1b[0m';

  const green = color(32);
  const red = color(31);
  const blue = color(34);
  const magenta = color(35);
  const cyan = color(36);
  const yellow = color(33);
  const black = color(30);
  const white = color(37);
  const dim = color(2);
  const i$1 = color(3);
  const b = color(1);
  const ul = color(4);
  const grey = color(90);

  var cli$2 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    b: b,
    black: black,
    blue: blue,
    cyan: cyan,
    dim: dim,
    green: green,
    grey: grey,
    i: i$1,
    magenta: magenta,
    red: red,
    ul: ul,
    white: white,
    yellow: yellow
  });

  const env = globalThis.process?.env ?? globalThis.env ?? {};
  const debug$4 = { tags: Boolean(env.DEBUG_TAGS) };

  // Capture only the requested terms, and only while tracing.
  const before$2 = term => {
    if (debug$4.tags && (!debug$4.word || debug$4.word === (term.normal || term.text || term.implicit || '').toLowerCase())) {
      return [...term.tags]
    }
    return null
  };

  // Show actual changes, including conflict removals.
  const log = (term, previous, reason = '') => {
    if (!previous) {
      return
    }
    const added = [...term.tags].filter(tag => !previous.includes(tag));
    const removed = previous.filter(tag => !term.tags.has(tag));
    if (!added.length && !removed.length) {
      return
    }
    const text = term.text || term.implicit || '';
    const index = term.index?.join(':') || '?';
    const prefix = debug$4.prefix || '   ';
    if (debug$4.rule !== reason) {
      const headingPrefix = debug$4.prefix ? prefix.replace('│  ', '│ ') : '  ';
      console.log(`${headingPrefix}${dim(white((reason || 'tag change') + ':'))}`); // eslint-disable-line no-console
      debug$4.rule = reason;
    }
    const print = (tags, sign, color) => {
      if (!tags.length) {
        return
      }
      const word = color(`'${text}'`);
      const changes = tags.map(tag => color(`#${tag}`)).join(' ');
      console.log(`${prefix}${color(sign)} ${word} ${dim(index.padEnd(9))} ${changes}`); // eslint-disable-line no-console
    };
    print(removed, '−', red);
    print(added, '+', green);
  };

  debug$4.before = before$2;
  debug$4.log = log;

  // Install only while verbose matching is enabled; restore the original hot path.
  const matchDebug = (world, options) => {
    const one = world.methods.one;
    const match = one.match;
    const parse = one.parseMatch;
    const sources = new WeakMap();
    const word = options.word?.toLowerCase();
    const includesWord = terms =>
      !word || terms.some(term => (term.normal || term.text || term.implicit || '').toLowerCase() === word);

    const parseLogged = function (...args) {
      const regs = parse.apply(this, args);
      sources.set(regs, String(args[0]));
      return regs
    };
    const matchLogged = function (docs, todo, cache) {
      const result = match.call(this, docs, todo, cache);
      const pattern = todo.match || sources.get(todo.regs) || '[parsed pattern]';
      if (options.pattern !== undefined && pattern !== options.pattern) {
        return result
      }
      if (word && !docs.some(includesWord)) {
        return result
      }
      const matches = result.ptrs
        .map(([n, start, end]) => docs[n].slice(start, end))
        .filter(includesWord);
      if (word && result.ptrs.length && !matches.length) {
        return result
      }
      debug$4.rule = undefined;
      const status = result.ptrs.length ? green('✓') : red('✗');
      const spans = matches.map(terms => {
        const text = terms.map(term => term.text || term.implicit).join(' ');
        return `${green("'" + text + "'")} ${dim(terms[0]?.index?.join(':') || '?')}`
      }).join(', ');
      const rule = pattern.length > 80 ? pattern.slice(0, 79) + '…' : pattern;
      const words = spans ? spans + '  ' : ' ---         ';
      console.log(`${debug$4.prefix || '   '}${status} ${words}${dim(i$1(rule))}`); // eslint-disable-line no-console
      return result
    };
    one.parseMatch = parseLogged;
    one.match = matchLogged;
    return () => {
      // Do not overwrite a plugin's replacement installed during tracing.
      if (one.parseMatch === parseLogged) {
        one.parseMatch = parse;
      }
      if (one.match === matchLogged) {
        one.match = match;
      }
    }
  };

  const colorSpec = doc => {
    return doc.docs
      .map((terms, index) => {
        const plain = terms
          .map(t => t.pre + t.text + t.post)
          .join('')
          .trim();
        const text = dim("'" + plain + "'");
        const spec = doc.update([[index]]).out('spec');
        return text + grey(i$1(spec.slice(plain.length)))
      })
      .join('\n')
  };

  // Trace the actual pipeline once, including the initial tokenized document.
  const hooksDebug = headings => (doc, hooks) => {
    const width = Math.max('tokenize'.length, ...hooks.map(hook => hook.length));
    const snapshot = (hook, nested = false) => {
      const output = colorSpec(doc);
      output.split('\n').forEach((line, index, lines) => {
        if (nested) {
          const branch = index === lines.length - 1 ? ' ╰─' : '│ ';
          console.log(`  ${dim(branch)} ${line}`); // eslint-disable-line no-console
          return
        }
        const label = (index === 0 ? hook : '').padEnd(width);
        console.log(`  ${dim(label)}  ${line}`); // eslint-disable-line no-console
      });
    };
    snapshot('tokenize');
    hooks.forEach(hook => {
      const nested = headings;
      const prefix = debug$4.prefix;
      const rule = debug$4.rule;
      debug$4.rule = undefined;
      if (nested) {
        console.log(`  ${blue(b(ul(hook + ':')))}`); // eslint-disable-line no-console
        debug$4.prefix = dim('   │  ');
      }
      // Restore the log prefix even when a plugin hook throws.
      try {
        doc.compute(hook);
        snapshot(hook, nested);
      } finally {
        debug$4.prefix = prefix;
        debug$4.rule = rule;
      }
    });
  };

  let restoreMatch;

  /** log the decision-making to console */
  const verbose = function (set = true, options = {}) {
    restoreMatch?.();
    restoreMatch = undefined;
    if (set === 'match' || set === true) {
      restoreMatch = matchDebug(this._world, options);
    }
    const env = globalThis.process?.env ?? globalThis.env ?? {}; //use window, in browser
    debug$4.hooks = set === 'hooks' || set === true ? hooksDebug(set === true) : undefined;
    debug$4.word = options.word?.toLowerCase();
    debug$4.contractions = set === 'contractions' || set === true;
    debug$4.rule = undefined;
    debug$4.tags = set === 'tagger' || set === true;
    env.DEBUG_TAGS = debug$4.tags ? true : '';
    env.DEBUG_MATCH = set === 'match' || set === true ? true : '';
    return this
  };

  const isObject$5 = val => {
    return Object.prototype.toString.call(val) === '[object Object]'
  };

  // internal Term objects are slightly different
  const fromJson = function (json) {
    return json.map(o => {
      return o.terms.map(term => {
        if (Array.isArray(term.tags)) {
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
    const doc = new View([]);
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
      const document = methods.one.tokenize.fromString(input, world);
      return new View(document)
    }
    // handle compromise View
    if (isObject$5(input) && input.isView) {
      return new View(input.document, input.ptrs)
    }
    // handle json input
    if (Array.isArray(input)) {
      // pre-tokenized array-of-arrays 
      if (Array.isArray(input[0])) {
        const document = preTokenized(input);
        return new View(document)
      }
      // handle json output
      const document = fromJson(input);
      return new View(document)
    }
    return doc
  };

  const world = { ...tmpWrld };

  const nlp = function nlp(input, lex) {
    if (lex) {
      nlp.addWords(lex);
    }
    const doc = inputs(input, View, world);
    if (input) {
      if (debug$4.hooks) {
        debug$4.hooks(doc, world.hooks);
      } else {
        doc.compute(world.hooks);
      }
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
    const doc = inputs(input, View, world);
    // give contractions a shot, at least
    if (debug$4.hooks) {
      debug$4.hooks(doc, compute.contractions ? ['alias', 'normal', 'machine', 'contractions'] : []);
    } else if (compute.contractions) {
      doc.compute(['alias', 'normal', 'machine', 'contractions']); //run it if we've got it
    }
    return doc
  };

  /** extend compromise functionality */
  nlp.plugin = function (plugin) {
    extend(plugin, this._world, View, this);
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

  // log the decision-making to console
  nlp.verbose = verbose;
  // current library release version
  nlp.version = version$1;

  const createCache = function (document) {
    const cache = document.map(terms => {
      const items = new Set();
      terms.forEach(term => {
        // add words
        if (term.normal !== '') {
          items.add(term.normal);
        }
        // cache switch-status - '%Noun|Verb%'
        if (term.switch) {
          items.add(`%${term.switch}%`);
        }
        // cache implicit words, too
        if (term.implicit) {
          items.add(term.implicit);
        }
        if (term.machine) {
          items.add(term.machine);
        }
        if (term.root) {
          items.add(term.root);
        }
        // cache slashes words, etc
        if (term.alias) {
          term.alias.forEach(str => items.add(str));
        }
        term.tags.forEach(tag => {
          items.add('#' + tag);
        });
      });
      return items
    });
    return cache
  };

  var methods$m = {
    one: {
      cacheDoc: createCache,
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

  var compute$7 = {
    cache: function (view) {
      view._cache = view.methods.one.cacheDoc(view.document);
    }
  };

  var cache$1 = {
    api: addAPI$3,
    compute: compute$7,
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
  const isTitleCase$1 = (str) => /^\p{Lu}[\p{Ll}'’]/u.test(str) || /^\p{Lu}$/u.test(str);
  const toTitleCase$1 = (str) => str.replace(/^\p{Ll}/u, x => x.toUpperCase());
  const toLowerCase$1 = (str) => str.replace(/^\p{Lu}/u, x => x.toLowerCase());

  // splice an array into an array
  const spliceArr = (parent, index, child) => {
    // tag them as dirty
    child.forEach(term => term.dirty = true);
    if (parent) {
      parent.splice(index, 0, ...child);
    }
    return parent
  };

  // add a space at end, if required
  const endSpace = function (terms) {
    const hasSpace = / $/;
    const hasDash = /[-–—]/;
    const lastTerm = terms.at(-1);
    if (lastTerm && !hasSpace.test(lastTerm.post) && !hasDash.test(lastTerm.post)) {
      lastTerm.post += ' ';
    }
  };

  // sentence-ending punctuation should move in append
  const movePunct = (source, end, needle) => {
    const juicy = /[-.?!,;:)–—'"]/g;
    const wasLast = source[end - 1];
    if (!wasLast) {
      return
    }
    const post = wasLast.post;
    if (juicy.test(post)) {
      const punct = post.match(juicy).join(''); //not perfect
      const last = needle.at(-1);
      last.post = punct + last.post;
      // remove it, from source
      wasLast.post = wasLast.post.replace(juicy, '');
    }
  };


  const moveTitleCase = function (home, start, needle) {
    const from = home[start];
    // should we bother?
    if (start !== 0 || !isTitleCase$1(from.text)) {
      return
    }
    // titlecase new first term
    needle[0].text = toTitleCase$1(needle[0].text);
    // should we un-titlecase the old word?
    const old = home[start];
    if (old.tags.has('ProperNoun') || old.tags.has('Acronym')) {
      return
    }
    if (isTitleCase$1(old.text) && old.text.length > 1) {
      old.text = toLowerCase$1(old.text);
    }
  };

  // put these words before the others
  const cleanPrepend = function (home, ptr, needle, document) {
    const [n, start, end] = ptr;
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
    const [n, , end] = ptr;
    const total = (document[n] || []).length;
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
        needle.at(-1).post += ' ';
      }
    }
    spliceArr(home, ptr[2], needle);
    // set new endId
    ptr[4] = needle.at(-1).id;
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
  let index$1 = 0;

  const pad3 = (str) => {
    str = str.length < 3 ? '0' + str : str;
    return str.length < 3 ? '0' + str : str
  };

  const toId = function (term) {
    let [n, i] = term.index || [0, 0];
    index$1 += 1;

    //don't overflow index
    index$1 = index$1 > 46655 ? 0 : index$1;
    //don't overflow sentences
    n = n > 46655 ? 0 : n;
    // //don't overflow terms
    i = i > 1294 ? 0 : i;

    // 3 digits for time
    let id = pad3(index$1.toString(36));
    // 3 digit  for sentence index (46k)
    id += pad3(n.toString(36));

    // 1 digit for term index (36)
    let tx = i.toString(36);
    tx = tx.length < 2 ? '0' + tx : tx; //pad2
    id += tx;

    // 1 digit random number
    const r = parseInt(Math.random() * 36, 10);
    id += (r).toString(36);

    return term.normal + '|' + id.toUpperCase()
  };

  // setInterval(() => console.log(toId(4, 12)), 100)

  // are we inserting inside a contraction?
  // expand it first
  const expand$1 = function (m) {
    if (m.has('@hasContraction') && typeof m.contractions === 'function') {
      //&& m.after('^.').has('@hasContraction')
      const more = m.grow('@hasContraction');
      more.contractions().expand();
    }
  };

  // set new ids for each terms
  const addIds$2 = function (terms) {
    terms = terms.map(term => {
      term.id = toId(term);
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
    if (Array.isArray(input)) {
      return Array.isArray(input[0]) ? input[0] : input
    }
    return []
  };

  const insert = function (input, view, prepend) {
    const { document, world } = view;
    view.uncache();
    // insert words at end of each doc
    const ptrs = view.fullPointer;
    const selfPtrs = view.fullPointer;
    view.forEach((m, i) => {
      const ptr = m.fullPointer[0];
      const [n] = ptr;
      // add-in the words
      const home = document[n];
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
      if (document[n]?.[ptr[1]]) {
        ptr[3] = document[n][ptr[1]].id;
      }
      // change self backwards by len
      selfPtrs[i] = ptr;
      // extend the pointer
      ptr[2] += terms.length;
      ptrs[i] = ptr;
    });
    const doc = view.toView(ptrs);
    // shift our self pointer, if necessary
    view.ptrs = selfPtrs;
    // try to tag them, too
    doc.compute(['id', 'index', 'freeze', 'lexicon']);
    if (doc.world.compute.preTagger) {
      doc.compute('preTagger');
    }
    doc.compute('unfreeze');
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

  const dollarStub = /\$[0-9a-z]+/g;
  const fns$2 = {};

  // case logic
  const isTitleCase = (str) => /^\p{Lu}[\p{Ll}'’]/u.test(str) || /^\p{Lu}$/u.test(str);
  const toTitleCase = (str) => str.replace(/^\p{Ll}/u, x => x.toUpperCase());
  const toLowerCase = (str) => str.replace(/^\p{Lu}/u, x => x.toLowerCase());

  // doc.replace('foo', (m)=>{})
  const replaceByFn = function (main, fn, keep) {
    main.forEach(m => {
      const out = fn(m);
      m.replaceWith(out, keep);
    });
    return main
  };

  // support 'foo $0' replacements
  const subDollarSign = function (input, main) {
    if (typeof input !== 'string') {
      return input
    }
    const groups = main.groups();
    input = input.replace(dollarStub, a => {
      const num = a.replace(/\$/, '');
      if (Object.hasOwn(groups, num)) {
        return groups[num].text()
      }
      return a
    });
    return input
  };

  fns$2.replaceWith = function (input, keep = {}) {
    let ptrs = this.fullPointer;
    // support keep-all option
    if (keep === true) {
      keep = {
        tags: true,
        case: true,
        possessives: true,
      };
    }
    const main = this;
    this.uncache();
    if (typeof input === 'function') {
      return replaceByFn(main, input, keep)
    }
    const terms = main.docs[0];
    if (!terms) return main
    const isOriginalPossessive = keep.possessives && terms.at(-1).tags.has('Possessive');
    const isOriginalTitleCase = keep.case && isTitleCase(terms[0].text);
    // support 'foo $0' replacements
    input = subDollarSign(input, main);

    const original = this.update(ptrs);
    // soften-up pointer
    ptrs = ptrs.map(ptr => ptr.slice(0, 3));
    // original.freeze()
    let oldTags = (original.docs[0] || []).map(term => Array.from(term.tags));
    const originalPre = original.docs[0][0].pre;
    const originalPost = original.docs[0].at(-1).post;
    // slide this in
    if (typeof input === 'string') {
      input = this.fromText(input).compute('id');
    }
    main.insertAfter(input);
    // are we replacing part of a contraction?
    if (original.has('@hasContraction') && main.contractions) {
      const more = main.grow('@hasContraction+');
      more.contractions().expand();
    }
    // delete the original terms
    main.delete(original); //science.

    // keep "John's"
    if (isOriginalPossessive) {
      const tmp = main.docs[0];
      const term = tmp.at(-1);
      if (!term.tags.has('Possessive')) {
        term.text += "'s";
        term.normal += "'s";
        term.tags.add('Possessive');
      }
    }

    // try to keep some pre-punctuation
    if (originalPre && main.docs[0]) {
      main.docs[0][0].pre = originalPre;
    }
    // try to keep any post-punctuation
    if (originalPost && main.docs[0]) {
      const lastOne = main.docs[0].at(-1);
      if (!lastOne.post.trim()) {
        lastOne.post = originalPost;
      }
    }
    // what should we return?
    const m = main.toView(ptrs).compute(['index', 'freeze', 'lexicon']);
    if (m.world.compute.preTagger) {
      m.compute('preTagger');
    }
    m.compute('unfreeze');
    // replace any old tags
    if (keep.tags) {
      // truncate old tags to only touch new terms
      oldTags = oldTags.slice(0, input.wordCount());
      m.terms().forEach((term, i) => {
        term.tagSafe(oldTags[i]);
      });
    }

    if (!m.docs[0] || !m.docs[0][0]) return m

    // try to co-erce case, too
    if (keep.case) {
      const transformCase = isOriginalTitleCase ? toTitleCase : toLowerCase;
      m.docs[0][0].text = transformCase(m.docs[0][0].text);
    }
    return m
  };

  fns$2.replace = function (match, input, keep) {
    if (match && !input) {
      return this.replaceWith(match, keep)
    }
    const m = this.match(match);
    if (!m.found) {
      return this
    }
    this.soften();
    return m.replaceWith(input, keep)
  };

  // Remove only the first qualifying run, matching String.replace without /g.
  const removeRunBefore = (str, run, following) => {
    let i = 0;
    while (i < str.length) {
      if (!run.includes(str[i])) {
        i++;
        continue
      }
      const start = i;
      while (i < str.length && run.includes(str[i])) i++;
      if (i < str.length && following.includes(str[i])) {
        return str.slice(0, start) + str.slice(i)
      }
    }
    return str
  };

  // transfer sentence-ending punctuation
  const repairPunct = function (terms, len) {
    const last = terms.length - 1;
    const from = terms[last];
    const to = terms[last - len];
    if (to && from) {
      to.post += from.post; //this isn't perfect.
      to.post = removeRunBefore(to.post, ' ', '.?!,;:');
      // don't allow any silly punctuation outcomes like ',!'
      to.post = removeRunBefore(to.post, ',;:', '.?!');
    }
  };

  // remove terms from document json
  const pluckOut = function (document, nots) {
    nots.forEach(ptr => {
      const [n, start, end] = ptr;
      const len = end - start;
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
          const terms = document[i - 1];
          const lastTerm = terms.at(-1);
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

  const fixPointers$1 = function (ptrs, gonePtrs) {
    ptrs = ptrs.map(ptr => {
      const [n] = ptr;
      if (!gonePtrs[n]) {
        return ptr
      }
      gonePtrs[n].forEach(no => {
        const len = no[2] - no[1];
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
      const isFull = !self.ptrs;
      // is it part of a contraction?
      if (not.has('@hasContraction') && not.contractions) {
        const more = not.grow('@hasContraction');
        more.contractions().expand();
      }

      let ptrs = self.fullPointer;
      const nots = not.fullPointer.reverse();
      // remove them from the actual document)
      const document = pluckOut(this.document, nots);
      // repair our pointers
      const gonePtrs = indexN(nots);
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
      const res = self.toView(ptrs); //return new document
      return res
    },
  };

  // aliases
  methods$k.delete = methods$k.remove;

  const methods$j = {
    /** add this punctuation or whitespace before each match: */
    pre: function (str, concat) {
      if (str === undefined && this.found) {
        return this.docs[0][0].pre
      }
      this.docs.forEach(terms => {
        const term = terms[0];
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
        const last = this.docs.at(-1);
        return last.at(-1).post
      }
      this.docs.forEach(terms => {
        const term = terms.at(-1);
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
      const docs = this.docs;
      const start = docs[0][0];
      start.pre = start.pre.trimStart();
      const last = docs.at(-1);
      const end = last.at(-1);
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
      start ||= `"`;
      end ||= `"`;
      this.docs.forEach(terms => {
        terms[0].pre = start + terms[0].pre;
        const last = terms.at(-1);
        last.post = end + last.post;
      });
      return this
    },

    /** add brackets around these matches */
    toParentheses: function (start, end) {
      start ||= `(`;
      end ||= `)`;
      this.docs.forEach(terms => {
        terms[0].pre = start + terms[0].pre;
        const last = terms.at(-1);
        last.post = end + last.post;
      });
      return this
    },
  };

  // aliases
  methods$j.deHyphenate = methods$j.dehyphenate;
  methods$j.toQuotation = methods$j.toQuotations;

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
    const left = a.normal.trim().length;
    const right = b.normal.trim().length;
    if (left < right) {
      return 1
    }
    if (left > right) {
      return -1
    }
    return 0
  };

  /** count the # of terms in each match */
  const wordCount$1 = (a, b) => {
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
    const counts = Object.create(null);
    arr.forEach(o => {
      counts[o.normal] ??= 0;
      counts[o.normal] += 1;
    });
    // sort by freq
    arr.sort((a, b) => {
      const left = counts[a.normal];
      const right = counts[b.normal];
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

  var methods$i = { alpha, length, wordCount: wordCount$1, sequential, byFreq };

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
    const { docs, pointer } = this;
    this.uncache();
    if (typeof input === 'function') {
      return customSort(this, input)
    }
    input ||= 'alpha';
    const ptrs = pointer || docs.map((_d, n) => [n]);
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
    const already = new Set();
    const res = this.filter(m => {
      const txt = m.text('machine');
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

  // append a new document, somehow
  const combineDocs = function (homeDocs, inputDocs) {
    if (homeDocs.length > 0) {
      // add a space
      const end = homeDocs.at(-1);
      const last = end.at(-1);
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
      const ptrs = home.fullPointer.concat(input.fullPointer);
      return home.toView(ptrs).compute('index')
    }
    // update n of new pointer, to end of our pointer
    const ptrs = input.fullPointer;
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
        const more = this.fromText(input);
        // easy concat
        if (!this.found || !this.ptrs) {
          this.document = this.document.concat(more.document);
        } else {
          // if we are in the middle, this is actually a splice operation
          const ptrs = this.fullPointer;
          const at = ptrs.at(-1)[0];
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
      if (Array.isArray(input)) {
        const docs = combineDocs(this.document, input);
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
    if (!ptr || ptr.length === 0) {
      return this
    }
    ptr = ptr.map(a => a.slice(0, 3));
    this.ptrs = ptr;
    return this
  };
  var harden$1 = { harden, soften };

  const methods$h = { ...caseFns, ...fns$3, ...fns$2, ...methods$k, ...methods$j, ...sort$1, ...concat, ...harden$1 };

  const addAPI$2 = function (View) {
    Object.assign(View.prototype, methods$h);
  };

  const compute$6 = {
    id: function (view) {
      const docs = view.docs;
      for (let n = 0; n < docs.length; n += 1) {
        for (let i = 0; i < docs[n].length; i += 1) {
          const term = docs[n][i];
          term.id ||= toId(term);
        }
      }
    }
  };

  var change = {
    api: addAPI$2,
    compute: compute$6,
  };

  var contractions$1 = [
    // simple mappings
    { word: '@', out: ['at'] },
    { word: 'arent', out: ['are', 'not'] },
    { word: 'alot', out: ['a', 'lot'] },
    { word: 'brb', out: ['be', 'right', 'back'] },
    { word: 'cannot', out: ['can', 'not'] },
    { word: 'dun', out: ['do', 'not'] },
    { word: "can't", out: ['can', 'not'] },
    { word: "shan't", out: ['should', 'not'] },
    { word: "won't", out: ['will', 'not'] },
    { word: "that's", out: ['that', 'is'] },
    { word: "what's", out: ['what', 'is'] },
    { word: "let's", out: ['let', 'us'] },
    // { word: "there's", out: ['there', 'is'] },
    { word: 'dunno', out: ['do', 'not', 'know'] },
    { word: 'gonna', out: ['going', 'to'] },
    { word: 'gotta', out: ['have', 'got', 'to'] }, //hmm
    { word: 'gimme', out: ['give', 'me'] },
    { word: 'outta', out: ['out', 'of'] },
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
    // shoulda, coulda
    { word: 'shoulda', out: ['should', 'have'] },
    { word: 'coulda', out: ['coulda', 'have'] },
    { word: 'woulda', out: ['woulda', 'have'] },
    { word: 'musta', out: ['must', 'have'] },

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

    // missing apostrophes
    { word: 'shouldnt', out: ['should', 'not'] },
    { word: 'couldnt', out: ['could', 'not'] },
    { word: 'wouldnt', out: ['would', 'not'] },
    { word: 'hasnt', out: ['has', 'not'] },
    { word: 'wasnt', out: ['was', 'not'] },
    { word: 'isnt', out: ['is', 'not'] },
    { word: 'cant', out: ['can', 'not'] },
    { word: 'dont', out: ['do', 'not'] },
    { word: 'wont', out: ['will', 'not'] },
    // apostrophe d
    { word: 'howd', out: ['how', 'did'] },
    { word: 'whatd', out: ['what', 'did'] },
    { word: 'whend', out: ['when', 'did'] },
    { word: 'whered', out: ['where', 'did'] },
  ];

  // number suffixes that are not units
  const t = true;
  var numberSuffixes = {
    'st': t,
    'nd': t,
    'rd': t,
    'th': t,
    'am': t,
    'pm': t,
    'max': t,
    '°': t,
    's': t, // 1990s
    'e': t, // 18e - french/spanish ordinal
    'er': t, //french 1er
    'ère': t, //''
    'ème': t, //french 2ème
  };

  var model$3 = {
    one: {
      contractions: contractions$1,
      numberSuffixes
    }
  };

  // Log decisions before splicing replaces the original term.
  const contractionDebug = (term, expansion) => {
    if (!debug$4.contractions || (debug$4.word && debug$4.word !== (term.normal || term.text).toLowerCase())) {
      return
    }
    debug$4.rule = undefined;
    const result = expansion ? '[' + expansion.map(word => yellow(`'${word}'`)).join(', ') + ']' : 'possessive (kept)';
    console.log(`${debug$4.prefix || '   '}${yellow(JSON.stringify(term.text))} →  ${result}`); // eslint-disable-line no-console
  };

  // put n new words where 1 word was
  const insertContraction = function (document, point, words) {
    const [n, w] = point;
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
    const before = terms[i].normal.split(hasContraction$1)[0];

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

  //ain't -> are/is not
  const apostropheT = function (terms, i) {
    if (terms[i].normal === "ain't" || terms[i].normal === 'aint') {
      return null //do this in ./two/
    }
    const before = terms[i].normal.replace(/n't/, '');
    return [before, 'not']
  };

  const hasContraction = /'/;
  const isFeminine = /(e|é|aison|sion|tion)$/;
  const isMasculine = /(age|isme|acle|ege|oire)$/;
  // l'amour
  const preL = (terms, i) => {
    // le/la
    const after = terms[i].normal.split(hasContraction)[1];
    // quick french gender disambig (rough)
    if (after && after.endsWith('e')) {
      return ['la', after]
    }
    return ['le', after]
  };

  // d'amerique
  const preD = (terms, i) => {
    const after = terms[i].normal.split(hasContraction)[1];
    // quick guess for noun-agreement (rough)
    if (after && isFeminine.test(after) && !isMasculine.test(after)) {
      return ['du', after]
    } else if (after && after.endsWith('s')) {
      return ['des', after]
    }
    return ['de', after]
  };

  // j'aime
  const preJ = (terms, i) => {
    const after = terms[i].normal.split(hasContraction)[1];
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
    const term = terms[i];
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

  const numUnit = /^([+-]?[0-9][.,0-9]*)([a-z°²³µ/]+)$/; //(must be lowercase)

  const numberUnit = function (terms, i, world) {
    const notUnit = world.model.one.numberSuffixes || {};
    const term = terms[i];
    const parts = term.text.match(numUnit);
    if (parts !== null) {
      // is it a recognized unit, like 'km'?
      const unit = parts[2].toLowerCase().trim();
      // don't split '3rd'
      if (Object.hasOwn(notUnit, unit)) {
        return null
      }
      return [parts[1], unit] //split it
    }
    return null
  };

  const byApostrophe = /'/;
  const numDash = /^[0-9][^-–—]*[-–—].*?[0-9]/;

  // run tagger on our new implicit terms
  const reTag = function (terms, view, start, len) {
    const tmp = view.update();
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
    t: (terms, i) => apostropheT(terms, i),
    // how'd
    d: (terms, i) => _apostropheD(terms, i),
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
      const o = list[i];
      // look for word-word match (cannot-> [can, not])
      if (o.word === term.normal) {
        return o.out
      }
      // look for after-match ('re -> [_, are])
      else if (after !== null && after === o.after) {
        return [before].concat(o.out)
      }
      // look for before-match (l' -> [le, _])
      else if (before !== null && before === o.before && after && after.length > 2) {
        return o.out.concat(after)
        // return [o.out, after] //typeof o.out === 'string' ? [o.out, after] : o.out(terms, i)
      }
    }
    return null
  };

  const toDocs = function (words, view, term) {
    contractionDebug(term, words);
    const doc = view.fromText(words.join(' '));
    doc.compute(['id', 'alias']);
    return doc.docs[0]
  };

  // there's is usually [there, is]
  // but can be 'there has' for 'there has (..) been'
  const thereHas = function (terms, i) {
    for (let k = i + 1; k < 5; k += 1) {
      if (!terms[k]) {
        break
      }
      if (terms[k].normal === 'been') {
        return ['there', 'has']
      }
    }
    return ['there', 'is']
  };

  //really easy ones
  const contractions = view => {
    const { world, document } = view;
    const { model, methods } = world;
    const list = model.one.contractions || [];
    // let units = new Set(model.one.units || [])
    // each sentence
    document.forEach((terms, n) => {
      // loop through terms backwards
      for (let i = terms.length - 1; i >= 0; i -= 1) {
        let before = null;
        let after = null;
        if (byApostrophe.test(terms[i].normal) === true) {
          const res = terms[i].normal.split(byApostrophe);
          before = res[0];
          after = res[1];
        }
        // any known-ones, like 'dunno'?
        let words = knownOnes(list, terms[i], before, after);
        // ['foo', 's']
        if (!words && Object.hasOwn(byEnd, after)) {
          words = byEnd[after](terms, i, world);
        }
        // ['j', 'aime']
        if (!words && Object.hasOwn(byStart, before)) {
          words = byStart[before](terms, i);
        }
        // 'there is' vs 'there has'
        if (before === 'there' && after === 's') {
          words = thereHas(terms, i);
        }
        // actually insert the new terms
        if (words) {
          words = toDocs(words, view, terms[i]);
          insertContraction(document, [n, i], words);
          reTag(document[n], view, i, words.length);
          continue
        }
        // '44-2' has special care
        if (numDash.test(terms[i].normal)) {
          words = numberRange(terms, i);
          if (words) {
            words = toDocs(words, view, terms[i]);
            insertContraction(document, [n, i], words);
            methods.one.setTag(words, 'NumberRange', world); //add custom tag
            // is it a time-range, like '5-9pm'
            if (words[2] && words[2].tags.has('Time')) {
              methods.one.setTag([words[0]], 'Time', world, null, 'time-range');
            }
            reTag(document[n], view, i, words.length);
          }
          continue
        }
        // split-apart '4km'
        words = numberUnit(terms, i, world);
        if (words) {
          words = toDocs(words, view, terms[i]);
          insertContraction(document, [n, i], words);
          methods.one.setTag([words[1]], 'Unit', world, null, 'contraction-unit');
        }
      }
    });
  };

  var compute$5 = { contractions };

  const plugin = {
    model: model$3,
    compute: compute$5,
    hooks: ['contractions'],
  };

  const freeze$1 = function (view) {
    const world = view.world;
    const { model, methods } = view.world;
    const setTag = methods.one.setTag;
    const { frozenLex } = model.one;
    const multi = model.one._multiCache || {};

    view.docs.forEach(terms => {
      for (let i = 0; i < terms.length; i += 1) {
        // basic lexicon lookup
        const t = terms[i];
        const word = t.machine || t.normal;

        // test a multi-word
        if (multi[word] !== undefined && terms[i + 1]) {
          const end = i + multi[word] - 1;
          for (let k = end; k > i; k -= 1) {
            const words = terms.slice(i, k + 1);
            const str = words.map(term => term.machine || term.normal).join(' ');
            // lookup frozen lexicon
            if (Object.hasOwn(frozenLex, str) === true) {
              setTag(words, frozenLex[str], world, false, '1-frozen-multi-lexicon');
              words.forEach(term => (term.frozen = true));
              continue
            }
          }
        }
        // test single word
        if (frozenLex[word] !== undefined && Object.hasOwn(frozenLex, word)) {
          setTag([t], frozenLex[word], world, false, '1-freeze-lexicon');
          t.frozen = true;
          continue
        }
      }
    });
  };

  const unfreeze = function (view) {
    view.docs.forEach(ts => {
      ts.forEach(term => {
        delete term.frozen;
      });
    });
    return view
  };
  var compute$4 = { frozen: freeze$1, freeze: freeze$1, unfreeze };

  /* eslint-disable no-console */

  const debug$3 = function (view) {
    view.docs.forEach(terms => {
      console.log(blue('\n  ╭─────────'));
      terms.forEach(t => {
        let str = `  ${i$1(dim('│'))}  `;
        const txt = t.implicit || t.text || '-';
        if (t.frozen === true) {
          str += `${blue(txt)} ❄️`;
        } else {
          str += i$1(dim(txt));
        }
        console.log(str);
      });
    });
  };

  var freeze = {
    // add .compute('freeze')
    compute: compute$4,

    mutate: world => {
      const methods = world.methods.one;
      // add @isFrozen method
      methods.termMethods.isFrozen = term => term.frozen === true;
      // adds `.debug('frozen')`
      methods.debug.freeze = debug$3;
      methods.debug.frozen = debug$3;
    },

    api: function (View) {
      // set all terms to reject any desctructive tags
      View.prototype.freeze = function () {
        this.docs.forEach(ts => {
          ts.forEach(term => {
            term.frozen = true;
          });
        });
        return this
      };
      // reset all terms to allow  any desctructive tags
      View.prototype.unfreeze = function () {
        this.compute('unfreeze');
      };
      // return all frozen terms
      View.prototype.isFrozen = function () {
        return this.match('@isFrozen+')
      };
    },
    // run it in init
    hooks: ['freeze'],
  };

  // scan-ahead to match multiple-word terms - 'jack rabbit'
  const multiWord = function (terms, start_i, world) {
    const { model, methods } = world;
    const setTag = methods.one.setTag;
    const multi = model.one._multiCache || {};
    const { lexicon } = model.one || {};
    const t = terms[start_i];
    const word = t.machine || t.normal;

    // found a word to scan-ahead on
    if (multi[word] !== undefined && terms[start_i + 1]) {
      const end = start_i + multi[word] - 1;
      for (let i = end; i > start_i; i -= 1) {
        const words = terms.slice(start_i, i + 1);
        if (words.length <= 1) {
          return false
        }
        const str = words.map(term => term.machine || term.normal).join(' ');
        // lookup regular lexicon
        if (Object.hasOwn(lexicon, str) === true) {
          const tag = lexicon[str];
          // 'is off-white' is not the phrasal verb 'is off'.
          if (tag && tag.includes('PhrasalVerb') && words[words.length - 1].post === '-') {
            continue
          }
          setTag(words, tag, world, false, '1-multi-lexicon');
          // special case for phrasal-verbs - 2nd word is a #Particle
          if (tag && tag.length === 2 && (tag[0] === 'PhrasalVerb' || tag[1] === 'PhrasalVerb')) {
            setTag([words[1]], 'Particle', world, false, '1-phrasal-particle');
          }
          return true
        }
      }
      return false
    }
    return null
  };

  const prefix$1 = /^(under|over|mis|re|un|dis|semi|pre|post)-?/;
  // anti|non|extra|inter|intra|over
  const allowPrefix = new Set(['Verb', 'Infinitive', 'PastTense', 'Gerund', 'PresentTense', 'Adjective', 'Participle']);

  // tag any words in our lexicon
  const checkLexicon = function (terms, i, world) {
    const { model, methods } = world;
    // const fastTag = methods.one.fastTag
    const setTag = methods.one.setTag;
    const { lexicon } = model.one;

    // basic lexicon lookup
    const t = terms[i];
    const word = t.machine || t.normal;
    // normal lexicon lookup
    if (lexicon[word] !== undefined && Object.hasOwn(lexicon, word)) {
      setTag([t], lexicon[word], world, false, '1-lexicon');
      return true
    }
    // '#gojetsgo' can be in the lexicon with its hash
    if (t.machine && Object.hasOwn(lexicon, t.normal)) {
      setTag([t], lexicon[t.normal], world, false, '1-lexicon-normal');
      return true
    }
    // lookup aliases in the lexicon
    if (t.alias) {
      const found = t.alias.find(str => Object.hasOwn(lexicon, str));
      if (found) {
        setTag([t], lexicon[found], world, false, '1-lexicon-alias');
        return true
      }
    }
    // prefixing for verbs/adjectives
    if (prefix$1.test(word) === true) {
      const stem = word.replace(prefix$1, '');
      if (Object.hasOwn(lexicon, stem) && stem.length > 3) {
        // only allow prefixes for verbs/adjectives
        if (allowPrefix.has(lexicon[stem])) {
          // console.log('->', word, stem, lexicon[stem])
          setTag([t], lexicon[stem], world, false, '1-lexicon-prefix');
          return true
        }
      }
    }
    return null
  };

  // tag any words in our lexicon - even if it hasn't been filled-up yet
  // rest of pre-tagger is in ./two/preTagger
  const lexicon$5 = function (view) {
    const world = view.world;
    // loop through our terms
    view.docs.forEach(terms => {
      for (let i = 0; i < terms.length; i += 1) {
        if (terms[i].tags.size === 0) {
          let found = null;
          found ||= multiWord(terms, i, world);
          // lookup known words
          found ||= checkLexicon(terms, i, world);
        }
      }
    });
  };

  var compute$3 = {
    lexicon: lexicon$5,
  };

  // derive clever things from our lexicon key-value pairs
  const expand = function (words) {
    // const { methods, model } = world
    const lex = {};
    // console.log('start:', Object.keys(lex).length)
    const _multi = {};
    // go through each word in this key-value obj:
    Object.keys(words).forEach(word => {
      const tag = words[word];
      // normalize lexicon a little bit
      word = word.toLowerCase().trim();
      word = word.replace(/'s\b/, '');
      // cache multi-word terms
      const split = word.split(/ /);
      if (split.length > 1) {
        // prefer longer ones
        if (_multi[split[0]] === undefined || split.length > _multi[split[0]]) {
          _multi[split[0]] = split.length;
        }
      }
      lex[word] ||= tag;
    });
    // cleanup
    delete lex[''];
    delete lex[null];
    delete lex[' '];
    return { lex, _multi }
  };

  var methods$g = {
    one: {
      expandLexicon: expand,
    }
  };

  /** insert new words/phrases into the lexicon */
  const addWords = function (words, isFrozen = false) {
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
    // these words go into a seperate lexicon
    if (isFrozen === true) {
      const { lex, _multi } = methods.one.expandLexicon(words, world);
      Object.assign(model.one._multiCache, _multi);
      Object.assign(model.one.frozenLex, lex);
      return
    }
    // add some words to our lexicon
    if (methods.two.expandLexicon) {
      // do fancy ./two version
      const { lex, _multi } = methods.two.expandLexicon(words, world);
      Object.assign(model.one.lexicon, lex);
      Object.assign(model.one._multiCache, _multi);
    }
    // do basic ./one version
    const { lex, _multi } = methods.one.expandLexicon(words, world);
    Object.assign(model.one.lexicon, lex);
    Object.assign(model.one._multiCache, _multi);
  };

  var lib$5 = { addWords };

  const model$2 = {
    one: {
      lexicon: {}, //setup blank lexicon
      _multiCache: {},
      frozenLex: {}, //2nd lexicon
    },
  };

  var lexicon$4 = {
    model: model$2,
    methods: methods$g,
    compute: compute$3,
    lib: lib$5,
    hooks: ['lexicon'],
  };

  // edited by Spencer Kelly
  // credit to https://github.com/BrunoRB/ahocorasick by Bruno Roberto Búrigo.

  const tokenize$3 = function (phrase, world) {
    const { methods, model } = world;
    const terms = methods.one.tokenize.splitTerms(phrase, model).map(t => methods.one.tokenize.splitWhitespace(t, model));
    return terms.map(term => term.text.toLowerCase())
  };

  // turn an array or object into a compressed aho-corasick structure
  const buildTrie = function (phrases, world) {

    // const tokenize=methods.one.
    const goNext = [{}];
    const endAs = [null];
    const failTo = [0];

    const xs = [];
    let n = 0;
    phrases.forEach(function (phrase) {
      let curr = 0;
      // let wordsB = phrase.split(/ /g).filter(w => w)
      const words = tokenize$3(phrase, world);
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (goNext[curr] && Object.hasOwn(goNext[curr], word)) {
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
    for (const word in goNext[0]) {
      n = goNext[0][word];
      failTo[n] = 0;
      xs.push(n);
    }

    while (xs.length > 0) {
      const r = xs.shift();
      // for each symbol a such that g(r, a) = s
      const keys = Object.keys(goNext[r]);
      for (let i = 0; i < keys.length; i += 1) {
        const word = keys[i];
        const s = goNext[r][word];
        xs.push(s);
        // set state = f(r)
        n = failTo[r];
        while (n > 0 && !Object.hasOwn(goNext[n], word)) {
          n = failTo[n];
        }
        if (Object.hasOwn(goNext, n)) {
          const fs = goNext[n][word];
          failTo[s] = fs;
          if (endAs[fs]) {
            endAs[s] ||= [];
            endAs[s] = endAs[s].concat(endAs[fs]);
          }
        } else {
          failTo[s] = 0;
        }
      }
    }
    return { goNext, endAs, failTo }
  };

  // console.log(buildTrie(['smart and cool', 'smart and nice']))

  // follow our trie structure
  const scanWords = function (terms, trie, opts) {
    let n = 0;
    const results = [];
    for (let i = 0; i < terms.length; i++) {
      const word = terms[i][opts.form] || terms[i].normal;
      // main match-logic loop:
      while (n > 0 && (trie.goNext[n] === undefined || !Object.hasOwn(trie.goNext[n], word))) {
        n = trie.failTo[n] || 0; // (usually back to 0)
      }
      // did we fail?
      if (!Object.hasOwn(trie.goNext[n], word)) {
        continue
      }
      n = trie.goNext[n][word];
      if (trie.endAs[n]) {
        const arr = trie.endAs[n];
        for (let o = 0; o < arr.length; o++) {
          const len = arr[o];
          const term = terms[i - len + 1];
          const [no, start] = term.index;
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
    opts.form ||= 'normal';
    const docs = view.docs;
    if (!trie.goNext || !trie.goNext[0]) {
      console.error('Compromise invalid lookup trie');//eslint-disable-line
      return view.none()
    }
    const firstWords = Object.keys(trie.goNext[0]);
    // do each phrase
    for (let i = 0; i < docs.length; i++) {
      // can we skip the phrase, all together?
      if (view._cache && view._cache[i] && cacheMiss(firstWords, view._cache[i]) === true) {
        continue
      }
      const terms = docs[i];
      const found = scanWords(terms, trie, opts);
      if (found.length > 0) {
        results = results.concat(found);
      }
    }
    return view.update(results)
  };

  const isObject$4 = val => {
    return Object.prototype.toString.call(val) === '[object Object]'
  };

  function api$5 (View) {

    /** find all matches in this document */
    View.prototype.lookup = function (input, opts = {}) {
      if (!input) {
        return this.none()
      }
      if (typeof input === 'string') {
        input = [input];
      }
      const trie = isObject$4(input) ? input : buildTrie(input, this.world);
      let res = scan(this, trie, opts);
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

  /** pre-compile a list of matches to lookup */
  const lib$4 = {
    /** turn an array or object into a compressed trie*/
    buildTrie: function (input) {
      const trie = buildTrie(input, this.world());
      return compress(trie)
    }
  };
  // add alias
  lib$4.compile = lib$4.buildTrie;

  var lookup = {
    api: api$5,
    lib: lib$4
  };

  const relPointer = function (ptrs, parent) {
    if (!parent) {
      return ptrs
    }
    ptrs.forEach(ptr => {
      const n = ptr[0];
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
    let { ptrs } = res;
    const { byGroup } = res;
    ptrs = relPointer(ptrs, parent);
    Object.keys(byGroup).forEach(k => {
      byGroup[k] = relPointer(byGroup[k], parent);
    });
    return { ptrs, byGroup }
  };

  // turn any matchable input intp a list of matches
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

  const isObject$3 = val => {
    return Object.prototype.toString.call(val) === '[object Object]'
  };

  // did they pass-in a compromise object?
  const isView = val => val && isObject$3(val) && val.isView === true;

  const isNet = val => val && isObject$3(val) && val.isNet === true;

  const match$1 = function (regs, group, opts) {
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
    const todo = { regs, group };
    const res = one.match(this.docs, todo, this._cache);
    const { ptrs, byGroup } = fixPointers(res, this.fullPointer);
    const view = this.toView(ptrs);
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
    const todo = { regs, group, justOne: true };
    const res = one.match(this.docs, todo, this._cache);
    const { ptrs, byGroup } = fixPointers(res, this.fullPointer);
    const view = this.toView(ptrs);
    view._groups = byGroup;
    return view
  };

  const has = function (regs, group, opts) {
    const one = this.methods.one;
    // support view as input
    if (isView(regs)) {
      const ptrs = this.intersection(regs).fullPointer;
      return ptrs.length > 0
    }
    // support a compiled set of matches
    if (isNet(regs)) {
      return this.sweep(regs, { tagger: false }).view.found
    }
    regs = parseRegs(regs, opts, this.world);
    const todo = { regs, group, justOne: true };
    const ptrs = one.match(this.docs, todo, this._cache).ptrs;
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
      const m = this.sweep(regs, { tagger: false }).view.settle();
      return this.if(m) //recurse with result
    }
    regs = parseRegs(regs, opts, this.world);
    const todo = { regs, group, justOne: true };
    let ptrs = this.fullPointer;
    const cache = this._cache || [];
    ptrs = ptrs.filter((ptr, i) => {
      const m = this.update([ptr]);
      const res = one.match(m.docs, todo, cache[i]).ptrs;
      return res.length > 0
    });
    const view = this.update(ptrs);
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
      const m = this.sweep(regs, { tagger: false }).view.settle();
      return this.ifNo(m)
    }
    // otherwise parse the match string
    regs = parseRegs(regs, opts, this.world);
    const cache = this._cache || [];
    const view = this.filter((m, i) => {
      const todo = { regs, group, justOne: true };
      const ptrs = one.match(m.docs, todo, cache[i]).ptrs;
      return ptrs.length === 0
    });
    // try to reconstruct the cache
    if (this._cache) {
      view._cache = view.ptrs.map(ptr => cache[ptr[0]]);
    }
    return view
  };

  var match$2 = { matchOne, match: match$1, has, if: ifFn, ifNo };

  const before$1 = function (regs, group, opts) {
    const { indexN } = this.methods.one.pointer;
    const pre = [];
    const byN = indexN(this.fullPointer);
    Object.keys(byN).forEach(k => {
      // check only the earliest match in the sentence
      const first = byN[k].sort((a, b) => (a[1] > b[1] ? 1 : -1))[0];
      if (first[1] > 0) {
        pre.push([first[0], 0, first[1]]);
      }
    });
    const preWords = this.toView(pre);
    if (!regs) {
      return preWords
    }
    return preWords.match(regs, group, opts)
  };

  const after$1 = function (regs, group, opts) {
    const { indexN } = this.methods.one.pointer;
    const post = [];
    const byN = indexN(this.fullPointer);
    const document = this.document;
    Object.keys(byN).forEach(k => {
      // check only the latest match in the sentence
      const last = byN[k].sort((a, b) => (a[1] > b[1] ? -1 : 1))[0];
      const [n, , end] = last;
      if (end < document[n].length) {
        post.push([n, end, document[n].length]);
      }
    });
    const postWords = this.toView(post);
    if (!regs) {
      return postWords
    }
    return postWords.match(regs, group, opts)
  };

  const growLeft = function (regs, group, opts) {
    if (typeof regs === 'string') {
      regs = this.world.methods.one.parseMatch(regs, opts, this.world);
    }
    regs[regs.length - 1].end = true; // ensure matches are beside us ←
    const ptrs = this.fullPointer;
    this.forEach((m, n) => {
      const more = m.before(regs, group);
      if (more.found) {
        const terms = more.terms();
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
    regs[0].start = true; // ensure matches are beside us →
    const ptrs = this.fullPointer;
    this.forEach((m, n) => {
      const more = m.after(regs, group);
      if (more.found) {
        const terms = more.terms();
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

  const getDoc$2 = (reg, view, group) => {
    if (typeof reg === 'string' || Array.isArray(reg)) {
      return view.match(reg, group)
    }
    if (!reg) {
      return view.none()
    }
    return reg
  };

  const addIds$1 = function (ptr, view) {
    const [n, start, end] = ptr;
    if (view.document[n]?.[start]) {
      ptr[3] ||= view.document[n][start].id;
      if (view.document[n][end - 1]) {
        ptr[4] ||= view.document[n][end - 1].id;
      }
    }
    return ptr
  };

  const methods$f = {};
  // [before], [match], [after]
  methods$f.splitOn = function (m, group) {
    const { splitAll } = this.methods.one.pointer;
    const splits = getDoc$2(m, this, group).fullPointer;
    const all = splitAll(this.fullPointer, splits);
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
    const splits = getDoc$2(m, this, group).fullPointer;
    const all = splitAll(this.fullPointer, splits);
    // repair matches to favor [match, after]
    // - instead of [before, match]
    for (let i = 0; i < all.length; i += 1) {
      // move a before to a preceding after
      if (!all[i].after && all[i + 1]?.before) {
        // ensure it's from the same original sentence
        if (all[i].match && all[i].match[0] === all[i + 1].before[0]) {
          all[i].after = all[i + 1].before;
          delete all[i + 1].before;
        }
      }
    }

    let res = [];
    all.forEach(o => {
      res.push(o.passthrough);
      res.push(o.before);
      // a, [x, b]
      if (o.match && o.after) {
        res.push(combine(o.match, o.after));
      } else {
        // a, [x], b
        res.push(o.match);
      }
    });
    res = res.filter(p => p);
    res = res.map(p => addIds$1(p, this));
    return this.update(res)
  };

  // [before match], [after]
  methods$f.splitAfter = function (m, group) {
    const { splitAll } = this.methods.one.pointer;
    const splits = getDoc$2(m, this, group).fullPointer;
    const all = splitAll(this.fullPointer, splits);
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

  // check if two pointers are perfectly consecutive
  const isNeighbour = function (ptrL, ptrR) {
    // validate
    if (!ptrL || !ptrR) {
      return false
    }
    // same sentence
    if (ptrL[0] !== ptrR[0]) {
      return false
    }
    // ensure R starts where L ends
    return ptrL[2] === ptrR[1]
  };

  // join two neighbouring words, if they both match
  const mergeIf = function (doc, lMatch, rMatch) {
    const world = doc.world;
    const parseMatch = world.methods.one.parseMatch;
    lMatch ||= '.$'; //defaults
    rMatch ||= '^.';
    const leftMatch = parseMatch(lMatch, {}, world);
    const rightMatch = parseMatch(rMatch, {}, world);
    // ensure end-requirement to left-match, start-requiremnts to right match
    leftMatch[leftMatch.length - 1].end = true;
    rightMatch[0].start = true;
    // let's get going.
    const ptrs = doc.fullPointer;
    const res = [ptrs[0]];
    for (let i = 1; i < ptrs.length; i += 1) {
      const ptrL = res[res.length - 1];
      const ptrR = ptrs[i];
      const left = doc.update([ptrL]);
      const right = doc.update([ptrR]);
      // should we marge left+right?
      if (isNeighbour(ptrL, ptrR) && left.has(leftMatch) && right.has(rightMatch)) {
        // merge right ptr into existing result
        res[res.length - 1] = [ptrL[0], ptrL[1], ptrR[2], ptrL[3], ptrR[4]];
      } else {
        res.push(ptrR);
      }
    }
    // return new pointers
    return doc.update(res)
  };

  const methods$e = {
    //  merge only if conditions are met
    joinIf: function (lMatch, rMatch) {
      return mergeIf(this, lMatch, rMatch)
    },
    // merge all neighbouring matches
    join: function () {
      return mergeIf(this)
    },
  };

  const methods$d = { ...match$2, ...lookaround, ...methods$f, ...methods$e };
  // aliases
  methods$d.lookBehind = methods$d.before;
  methods$d.lookBefore = methods$d.before;

  methods$d.lookAhead = methods$d.after;
  methods$d.lookAfter = methods$d.after;

  methods$d.notIf = methods$d.ifNo;
  const matchAPI = function (View) {
    Object.assign(View.prototype, methods$d);
  };

  // Split parenthesized match blocks without retrying long rejected prefixes or
  // bodies. Preserve the original grammar, including its greedy capture header.
  const prefix = new Set('!~[^');
  const suffix = new Set('?]+*$~');
  const whitespace$1 = /\s/;

  const splitGroups = str => {
    if (!str.includes('(') || !str.includes(')')) return [str]
    const length = str.length;
    const afterSuffix = new Uint32Array(length + 1);
    const bodyEnd = new Uint32Array(length);
    const captureEnd = new Uint32Array(length);
    afterSuffix[length] = length;
    let close = -1;
    let capture = 0;
    for (let i = length - 1; i >= 0; i--) {
      afterSuffix[i] = suffix.has(str[i]) ? afterSuffix[i + 1] : i;
      if (str[i] === ')') close = i;
      if (str[i] === '(' && close >= i + 3 && str[close - 1] !== '\\') {
        const end = afterSuffix[close + 1];
        if (end === length || whitespace$1.test(str[end])) bodyEnd[i] = end;
      }
      // The optional <...> header cannot cross another '<', and prefers the
      // rightmost '>' which is followed by a valid parenthesized block.
      if (str[i] === '<') {
        captureEnd[i] = capture;
        capture = 0;
      } else if (str[i] === '>' && !capture && bodyEnd[i + 1]) {
        capture = bodyEnd[i + 1];
      }
    }
    const parts = [];
    let previous = 0;
    let i = 0;
    while (i < length) {
      const start = i;
      while (i < length && prefix.has(str[i])) i++;
      const end = str[i] === '<' ? captureEnd[i] : bodyEnd[i];
      if (end) {
        parts.push(str.slice(previous, start), str.slice(start, end));
        // The old delimiter consumes one following whitespace character.
        i = end < length ? end + 1 : end;
        previous = i;
      } else if (i === start) {
        i++;
      }
    }
    parts.push(str.slice(previous));
    return parts
  };

  // match  'foo /yes/' and not 'foo/no/bar'
  const bySlashes = /(?:^|\s)([![^]*(?:<[^<]*>)?\/.*?[^\\/]\/[?\]+*$~]*)(?:\s|$)/;
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
    const arr = txt.split(bySlashes);
    let res = [];
    // parse by (blocks), next
    arr.forEach(str => {
      if (isReg(str)) {
        res.push(str);
        return
      }
      res = res.concat(splitGroups(str));
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

  const hasMinMax = /\{([0-9]+)?(, *[0-9]*)?\}/;
  const andSign = /&&/;
  // const hasDash = /\p{Letter}[-–—]\p{Letter}/u
  const captureName = /^<\s*([^\s>]+)\s*>/;
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
  const parseToken = function (w, opts, aliases) {
    const obj = {};
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
      if (end(w) === '?') {
        obj.optional = true;
        w = stripEnd(w);
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
          if (!res) {
            throw new SyntaxError('Invalid named capture: expected [<name> ...]')
          }
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
      if (start(w) === '!') {
        obj.negative = true;
        // obj.optional = true
        w = stripStart(w);
      }
      //soft-match
      if (start(w) === '~' && end(w) === '~' && w.length > 2) {
        w = stripBoth(w);
        obj.fuzzy = true;
        obj.min = opts.fuzzy ?? 0.85;
        if (/\(/.test(w) === false) {
          obj.word = w;
          return obj
        }
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
        const last = obj.choices.length - 1;
        obj.choices[last] = stripEnd(obj.choices[last]);
        // clean up the results
        obj.choices = obj.choices.map(s => s.trim());
        obj.choices = obj.choices.filter(s => s);
        //recursion alert!
        obj.choices = obj.choices.map(str => {
          return str.split(/ /g).map(s => parseToken(s, opts, aliases))
        });
        w = '';
      }

      //root/sense overloaded
      if (start(w) === '{' && end(w) === '}') {
        w = stripBoth(w);
        // obj.sense = w
        obj.root = w;
        if (/\//.test(w)) {
          const split = obj.root.split(/\//);
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
    //do the actual token content
    if (start(w) === '#') {
      const name = stripStart(w);
      obj.tag = aliases?.[name];
      if (!obj.tag) {
        obj.tag = titleCase(name);
        obj.tag = aliases?.[obj.tag] || obj.tag;
      }
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

  // Text recognition, rather than full email/URL validation. Share these rules with
  // the tagger so hyphens in recognized addresses survive tokenization.
  const email = /^[\w.!#$%&'*+/=?^`{|}~-]+@(?:[\w-]+\.)+[a-z]{2,}$/i;
  const explicitUrl = /^(?:https?:(?:\/\/)?|www\.)(?:[a-z0-9-]+\.)+[a-z]{2,}(?::[0-9]+)?(?:[/?#]\S*)?$/i;
  const bareUrl = /^(?:[a-z0-9-]+\.)+(?:com|net|gov|org|ly|edu|info|biz|dev|ru|jp|de|in|uk|br|io|ai)(?::[0-9]+)?(?:[/?#]\S*)?$/i;

  const isWebToken = function (str) {
    if (!str.includes('.')) {
      return false
    }
    let start = 0;
    let end = str.length;
    while (start < end && /[\s("'“‘<]/.test(str[start])) start++;
    while (end > start && /[\s).,!?:;"'”’>]/.test(str[end - 1])) end--;
    const text = str.slice(start, end);
    return email.test(text) || explicitUrl.test(text) || bareUrl.test(text)
  };

  const hasHyphen$1 = function (str, model) {
    const parts = str.split(/[-–—]/);
    if (parts.length <= 1) {
      return false
    }
    if (isWebToken(str)) {
      return false
    }
    const { prefixes, suffixes } = model.one;

    // l-theanine, x-ray
    if (parts[0].length === 1 && /[a-z]/i.test(parts[0])) {
      return false
    }
    //dont split 're-do'
    if (Object.hasOwn(prefixes, parts[0])) {
      return false
    }
    //dont split 'flower-like'
    parts[1] = parts[1].trim().replace(/[.?!]$/, '');
    if (Object.hasOwn(suffixes, parts[1])) {
      return false
    }
    //letter-number 'aug-20'
    const reg = /^([a-z\u00C0-\u00FF`"'/]+)[-–—]([a-z0-9\u00C0-\u00FF].*)/i;
    if (reg.test(str) === true) {
      return true
    }
    //number-letter '20-aug'
    const reg2 = /^[('"]?([0-9]{1,4})[-–—]([a-z\u00C0-\u00FF`"'/-]+[)'"]?$)/i;
    if (reg2.test(str) === true) {
      return true
    }
    return false
  };

  const splitHyphens$1 = function (word) {
    const arr = [];
    //support multiple-hyphenated-terms
    const hyphens = word.split(/[-–—]/);
    let whichDash = '-';
    const found = word.match(/[-–—]/);
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

  // match 're-do' -> ['re','do']
  // split them the same way the tokenizer does - 'x-ray' stays one word
  const splitHyphens = function (regs, world) {
    for (let i = regs.length - 1; i >= 0; i -= 1) {
      const reg = regs[i];
      if (reg.word && hasHyphen$1(reg.word, world.model)) {
        let words = reg.word.split(/[-–—]/g);
        words = words.filter(w => w).reverse();
        regs.splice(i, 1);
        words.forEach(w => {
          const obj = { ...reg };
          obj.word = w;
          regs.splice(i, 0, obj);
        });
      }
    }
    return regs
  };

  // add all conjugations of this verb
  const addVerbs = function (token, world) {
    const { all } = world.methods.two.transform.verb || {};
    const str = token.root;
    if (!all) {
      return []
    }
    return all(str, world.model)
  };

  // add all inflections of this noun
  const addNoun = function (token, world) {
    const { all } = world.methods.two.transform.noun || {};
    if (!all) {
      return [token.root]
    }
    return all(token.root, world.model)
  };

  // add all inflections of this adjective
  const addAdjective$1 = function (token, world) {
    const { all } = world.methods.two.transform.adjective || {};
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
        const shouldPack = token.choices.every(block => {
          if (block.length !== 1) {
            return false
          }
          const reg = block[0];
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

  /** parse a match-syntax string into json */
  const syntax = function (input, opts, world) {
    // fail-fast
    if (input === null || input === undefined || input === '') {
      return []
    }
    opts ||= {};
    if (typeof input === 'number') {
      input = String(input); //go for it?
    }
    let tokens = parseBlocks(input);
    //turn them into objects
    tokens = tokens.map(str => parseToken(str, opts, world.model.one.tagAliases));
    // '~re-do~'
    tokens = splitHyphens(tokens, world);
    // '{walk}'
    tokens = inflectRoot(tokens, world);
    //clean up anything weird
    tokens = postProcess(tokens);
    // console.log(tokens)
    return tokens
  };

  const anyIntersection = function (setA, setB) {
    for (const elem of setB) {
      if (setA.has(elem)) {
        return true
      }
    }
    return false
  };
  // check words/tags against our cache
  const failFast = function (regs, cache) {
    for (let i = 0; i < regs.length; i += 1) {
      const reg = regs[i];
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
      // are all of the fast-or words missing?
      if (reg.fastOr !== undefined && anyIntersection(reg.fastOr, cache) === false) {
        return true
      }
    }
    return false
  };

  // fuzzy-match (damerau-levenshtein)
  // Based on  tad-lispy /node-damerau-levenshtein
  // https://github.com/tad-lispy/node-damerau-levenshtein/blob/master/index.js
  // count steps (insertions, deletions, substitutions, or transpositions)
  const editDistance = function (strA, strB) {
    const aLength = strA.length,
      bLength = strB.length;
    // fail-fast
    if (aLength === 0) {
      return bLength
    }
    if (bLength === 0) {
      return aLength
    }
    // If the limit is not defined it will be calculate from this and that args.
    const limit = (bLength > aLength ? bLength : aLength) + 1;
    if (Math.abs(aLength - bLength) > (limit || 100)) {
      return limit || 100
    }
    // init the array
    const matrix = [];
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
        const shouldUpdate =
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
    const length = Math.max(strA.length, strB.length);
    const relative = length === 0 ? 0 : steps / length;
    const similarity = 1 - relative;
    return similarity
  };

  // these methods are called with '@hasComma' in the match syntax
  // various unicode quotation-mark formats
  const startQuote =
    /([\u0022\uFF02\u0027\u201C\u2018\u201F\u201B\u201E\u2E42\u201A\u00AB\u2039\u2035\u2036\u2037\u301D\u0060\u301F])/;

  const endQuote = /([\u0022\uFF02\u0027\u201D\u2019\u00BB\u203A\u2032\u2033\u2034\u301E\u00B4])/;

  const hasHyphen = /^[-–—]$/;
  const hasDash$1 = / [-–—]{1,3} /;

  /** search the term's 'post' punctuation  */
  const hasPost = (term, punct) => term.post.indexOf(punct) !== -1;
  /** search the term's 'pre' punctuation  */
  // const hasPre = (term, punct) => term.pre.indexOf(punct) !== -1

  const methods$c = {
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
    hasEllipses: term => hasPost(term, '..') || hasPost(term, '…'),
    /** is there a semicolon after term word? */
    hasSemicolon: term => hasPost(term, ';'),
    /** is there a colon after term word? */
    hasColon: term => hasPost(term, ':'),
    /** is there a slash '/' in term word? */
    hasSlash: term => /\//.test(term.text),
    /** a hyphen connects two words like-term */
    hasHyphen: term => hasHyphen.test(term.post) || hasHyphen.test(term.pre),
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
  methods$c.hasQuotation = methods$c.hasQuote;

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
      // support ~ fuzzy match
      if (reg.fuzzy === true) {
        if (reg.word === term.root) {
          return true
        }
        const score = fuzzyMatch(reg.word, term.normal);
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
      if (typeof methods$c[reg.method] === 'function' && methods$c[reg.method](term) === true) {
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
      if (reg.regex.global || reg.regex.sticky) {
        const lastIndex = reg.regex.lastIndex;
        try {
          reg.regex.lastIndex = 0;
          return reg.regex.test(str)
        } finally {
          reg.regex.lastIndex = lastIndex;
        }
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
      const str = term.root || term.implicit || term.machine || term.normal;
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
    const result = doesMatch$1(t, reg, index, length);
    if (reg.negative === true) {
      return !result
    }
    return result
  };

  // for greedy checking, we no longer care about the reg.start
  // value, and leaving it can cause failures for anchored greedy
  // matches.  ditto for end-greedy matches: we need an earlier non-
  // ending match to succceed until we get to the actual end.
  const getGreedy = function (state, endReg) {
    const reg = { ...state.regs[state.r], start: false, end: false };
    const start = state.t;
    for (; state.t < state.terms.length; state.t += 1) {
      // the number of terms we've matched, if we stop here
      const count = state.t - start + 1;
      //stop for next-reg match - unless we're still under our min
      if (endReg && wrapMatch(state.terms[state.t], endReg, state.start_i + state.t, state.phrase_length)) {
        if (reg.min === undefined || count >= reg.min) {
          return state.t
        }
      }
      // is it max-length now?
      if (reg.max !== undefined && count === reg.max) {
        return state.t
      }
      //stop here
      if (wrapMatch(state.terms[state.t], reg, state.start_i + state.t, state.phrase_length) === false) {
        // is it too short?
        if (reg.min !== undefined && count < reg.min) {
          return null
        }
        return state.t
      }
    }
    // we ran out of terms - did we reach our min?
    if (reg.min !== undefined && state.t - start + 1 < reg.min) {
      return null
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
      if (wrapMatch(state.terms[t], nextReg, state.start_i + t, state.phrase_length) === true) {
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
        const tmpReg = { ...reg, end: false };
        if (wrapMatch(state.terms[state.t], tmpReg, state.start_i + state.t, state.phrase_length) === true) {
          // console.log(`endGreedy ${state.terms[state.t].normal}`)
          return true
        }
      }
    }
    return false
  };

  const getGroup$1 = function (state, term_index) {
    // Most attempts fail without capturing anything.
    if (!state.groups) {
      state.groups = {};
    }
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
    const { regs } = state;
    const reg = regs[state.r];

    const skipto = greedyTo(state, regs[state.r + 1]);
    //maybe we couldn't find it
    if (skipto === null || skipto === state.offset) {
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
      const g = getGroup$1(state, state.t);
      // accumulate onto any tokens already captured before the wildcard,
      // so '[one .* after]' keeps its leading (and trailing) tokens
      g.length += skipto - state.t;
    }
    state.t = skipto;
    // log(`✓ |greedy|`)
    return true
  };

  // try to match a list of tokens, starting at state.t + skipN
  // returns the number of terms it consumed, or 0 for no-match
  const tryChoice = function (state, regs, skipN) {
    let len = 0;
    for (let w = 0; w < regs.length; w += 1) {
      const cr = regs[w];
      const t = state.t + skipN + len;
      if (state.terms[t] === undefined) {
        return 0
      }
      if (wrapMatch(state.terms[t], cr, state.start_i + t, state.phrase_length) !== true) {
        return 0
      }
      len += 1;
      // this can be greedy - '(foo+ bar)'
      if (cr.greedy === true) {
        // like getGreedy, anchors should not apply to the repeated terms
        const gr = { ...cr, start: false, end: false };
        for (let i = t + 1; i < state.terms.length; i += 1) {
          if (wrapMatch(state.terms[i], gr, state.start_i + i, state.phrase_length) !== true) {
            break
          }
          len += 1;
        }
      }
    }
    return len
  };

  // match the first choice that works - '(a b|c)'
  const tryChoices = function (state, skipN) {
    const block = state.regs[state.r];
    for (let c = 0; c < block.choices.length; c += 1) {
      const regs = block.choices[c];
      if (!Array.isArray(regs)) {
        return 0
      }
      const len = tryChoice(state, regs, skipN);
      if (len > 0) {
        return len
      }
    }
    return 0
  };

  const doOrBlock = function (state) {
    const block = state.regs[state.r];
    let skipN = tryChoices(state, 0);
    if (skipN === 0) {
      return 0
    }
    // greedy or-block - keep matching choices - '(a b|c)+'
    if (block.greedy === true) {
      let more = tryChoices(state, skipN);
      while (more > 0) {
        skipN += more;
        more = tryChoices(state, skipN);
      }
    }
    return skipN
  };

  const doAndBlock = function (state) {
    let longest = 0;
    // all blocks must match, and we return the greediest match
    const reg = state.regs[state.r];
    const allDidMatch = reg.choices.every(block => {
      //  for multi-word blocks, all must match
      const allWords = block.every((cr, w_index) => {
        const tryTerm = state.t + w_index;
        if (state.terms[tryTerm] === undefined) {
          return false
        }
        return wrapMatch(state.terms[tryTerm], cr, state.start_i + tryTerm, state.phrase_length)
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
    const reg = regs[state.r];
    const skipNum = doOrBlock(state);
    // did we find a match?
    if (skipNum) {
      // handle 'not' logic
      if (reg.negative === true) {
        return null // die
      }
      // tuck in as named-group
      if (state.hasGroup === true) {
        const g = getGroup$1(state, state.t);
        g.length += skipNum;
      }
      // ensure we're at the end
      if (reg.end === true) {
        const end = state.phrase_length;
        if (state.t + state.start_i + skipNum !== end) {
          return null
        }
      }
      state.t += skipNum;
      // log(`✓ |found-or|`)
      return true
    }
    // we didn't find it - for a negative-block, that's good news
    if (reg.negative === true) {
      // a '!(a b)?' can pass-through without consuming anything
      if (!reg.optional) {
        state.t += 1;
      }
      return true
    }
    if (!reg.optional) {
      return null //die
    }
    return true
  };

  // '(foo && #Noun)' - require all matches on the term
  const andBlock = function (state) {
    const { regs } = state;
    const reg = regs[state.r];

    const skipNum = doAndBlock(state);
    if (skipNum) {
      // handle 'not' logic
      if (reg.negative === true) {
        return null // die
      }
      if (state.hasGroup === true) {
        const g = getGroup$1(state, state.t);
        g.length += skipNum;
      }
      // ensure we're at the end
      if (reg.end === true) {
        const end = state.phrase_length;
        if (state.t + state.start_i + skipNum !== end) {
          return null
        }
      }
      state.t += skipNum;
      // log(`✓ |found-and|`)
      return true
    }
    // we didn't find it - for a negative-block, that's good news
    if (reg.negative === true) {
      // a '!(a && b)?' can pass-through without consuming anything
      if (!reg.optional) {
        state.t += 1;
      }
      return true
    }
    if (!reg.optional) {
      return null //die
    }
    return true
  };

  const negGreedy = function (state, reg, nextReg) {
    let skip = 0;
    for (let t = state.t; t < state.terms.length; t += 1) {
      let found = wrapMatch(state.terms[t], reg, state.start_i + t, state.phrase_length);
      // we don't want a match, here
      if (found) {
        break//stop going
      }
      // are we doing 'greedy-to'?
      // - "!foo+ after"  should stop at 'after'
      if (nextReg) {
        found = wrapMatch(state.terms[t], nextReg, state.start_i + t, state.phrase_length);
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

  // '!foo' should match anything that isn't 'foo'
  // if it matches, return false
  const doNegative = function (state) {
    const { regs } = state;
    const reg = regs[state.r];

    // match *anything* but this term
    const tmpReg = { ...reg };
    tmpReg.negative = false; // try removing it

    // found it? if so, we die here
    const found = wrapMatch(state.terms[state.t], tmpReg, state.start_i + state.t, state.phrase_length);
    if (found) {
      return false//bye
    }
    // should we skip the term too?
    if (reg.optional) {
      // "before after" - "before !foo? after"
      // does the next reg match the this term?
      const nextReg = regs[state.r + 1];
      if (nextReg) {
        const fNext = wrapMatch(state.terms[state.t], nextReg, state.start_i + state.t, state.phrase_length);
        if (fNext) {
          state.r += 1;
        } else if (nextReg.optional && regs[state.r + 2]) {
          // ugh. ok,
          // support "!foo? extra? need"
          // but don't scan ahead more than that.
          const fNext2 = wrapMatch(state.terms[state.t], regs[state.r + 2], state.start_i + state.t, state.phrase_length);
          if (fNext2) {
            state.r += 2;
          }
        }
      }
    }
    // negative greedy - !foo+  - super hard!
    if (reg.greedy) {
      return negGreedy(state, tmpReg, regs[state.r + 1])
    }
    state.t += 1;
    return true
  };

  // 'foo? foo' matches are tricky.
  const foundOptional = function (state) {
    const { regs } = state;
    const reg = regs[state.r];
    const term = state.terms[state.t];
    // does the next reg match it too?
    const nextRegMatched = wrapMatch(term, regs[state.r + 1], state.start_i + state.t, state.phrase_length);
    if (reg.negative || nextRegMatched) {
      // but does the next reg match the next term??
      // only skip if it doesn't
      const nextTerm = state.terms[state.t + 1];
      if (!nextTerm || !wrapMatch(nextTerm, regs[state.r + 1], state.start_i + state.t + 1, state.phrase_length)) {
        state.r += 1;
      }
    }
  };

  // keep 'foo+' or 'foo*' going..
  const greedyMatch = function (state) {
    const { regs, phrase_length } = state;
    const reg = regs[state.r];
    // foo{2,4} min-lengths are enforced inside getGreedy
    state.t = getGreedy(state, regs[state.r + 1]);
    if (state.t === null) {
      return null //greedy was too short
    }
    // 'foo+$' - if also an end-anchor, ensure we really reached the end
    if (reg.end === true && state.start_i + state.t !== phrase_length) {
      return null //greedy didn't reach the end
    }
    return true
  };

  // for: ['we', 'have']
  // a match for "we have" should work as normal
  // but matching "we've" should skip over implict terms
  const contractionSkip = function (state) {
    const term = state.terms[state.t];
    const reg = state.regs[state.r];
    // did we match the first part of a contraction?
    if (term.implicit && state.terms[state.t + 1]) {
      const nextTerm = state.terms[state.t + 1];
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

  // '[foo]' should also be logged as a group
  const setGroup = function (state, startAt) {
    const reg = state.regs[state.r];
    // Get or create capture group
    const g = getGroup$1(state, startAt);
    // Update group - add greedy or increment length
    if (state.t - state.offset > 1 && reg.greedy) {
      g.length += state.t - startAt;
    } else {
      g.length++;
    }
  };

  // when a reg matches a term
  const simpleMatch = function (state) {
    const { regs } = state;
    const reg = regs[state.r];
    const term = state.terms[state.t];
    const startAt = state.t;
    // if it's a negative optional match... :0
    if (reg.optional && regs[state.r + 1] && reg.negative) {
      return true
    }
    // okay, it was a match, but if it's optional too,
    // we should check the next reg too, to skip it?
    if (reg.optional && regs[state.r + 1]) {
      foundOptional(state);
    }
    // Contraction skip:
    // did we match the first part of a contraction?
    if (term.implicit && state.terms[state.t + 1]) {
      contractionSkip(state);
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
      const alive = greedyMatch(state);
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

  // i formally apologize for how complicated this is.

  /** 
   * try a sequence of match tokens ('regs') 
   * on a sequence of terms, 
   * starting at this certain term.
   */
  const tryHere = function (terms, regs, start_i, phrase_length, offset = 0) {
    // console.log(`\n\n:start: '${terms[0].text}':`)
    if (offset >= terms.length || regs.length === 0) {
      return null
    }
    // Use the original terms with a cursor instead of copying the remaining
    // sentence at every starting position. origin maps array indices to match
    // pointers; offset marks the beginning of this attempt within the array.
    const origin = start_i - offset;
    const state = {
      t: offset,
      offset: offset,
      terms: terms,
      r: 0,
      regs: regs,
      groups: null,
      start_i: origin,
      phrase_length: phrase_length,
      inGroup: null,
    };

    // we must satisfy every token in 'regs'
    // if we get to the end, we have a match.
    for (; state.r < regs.length; state.r += 1) {
      const reg = regs[state.r];
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
        const alive = doAstrix(state);
        if (!alive) {
          return null
        }
        continue
      }
      // slow-OR - multi-word OR (a|b|foo bar)
      if (reg.choices !== undefined && reg.operator === 'or') {
        const alive = orBlock(state);
        if (!alive) {
          return null
        }
        continue
      }
      // slow-AND - multi-word AND (#Noun && foo) blocks
      if (reg.choices !== undefined && reg.operator === 'and') {
        const alive = andBlock(state);
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
        const alive = simpleMatch(state);
        if (!alive) {
          return null
        }
        continue
      }
      // support 'foo*$' until the end
      if (isEndGreedy(reg, state) === true) {
        const alive = simpleMatch(state);
        if (!alive) {
          return null
        }
        continue
      }
      // ok, it doesn't match - but maybe it wasn't *supposed* to?
      if (reg.negative) {
        // we want *anything* but this term
        const alive = doNegative(state);
        if (!alive) {
          return null
        }
        continue
      }
      // ok, finally test the term-reg
      const hasMatch = wrapMatch(state.terms[state.t], reg, state.start_i + state.t, state.phrase_length);
      if (hasMatch === true) {
        const alive = simpleMatch(state);
        if (!alive) {
          return null
        }
        continue
      }
      //ok who cares, keep going
      if (reg.optional === true) {
        continue
      }

      // finally, we die
      return null
    }
    //return our results, as pointers
    const pntr = [null, start_i, state.t + origin];
    if (pntr[1] === pntr[2]) {
      return null //found 0 terms
    }
    const groups = {};
    if (state.groups) {
      Object.keys(state.groups).forEach(k => {
        const o = state.groups[k];
        const start = origin + o.start;
        groups[k] = [null, start, start + o.length];
      });
    }
    return { pointer: pntr, groups: groups }
  };

  // support returning a subset of a match
  // like 'foo [bar] baz' -> bar
  const getGroup = function (res, group) {
    const ptrs = [];
    const byGroup = {};
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
          byGroup[k] ||= [];
          byGroup[k].push(r.groups[k]);
        });
      });
    }
    return { ptrs, byGroup }
  };

  const notIf = function (results, not, docs) {
    results = results.filter(res => {
      const [n, start, end] = res.pointer;
      const terms = docs[n].slice(start, end);
      for (let i = 0; i < terms.length; i += 1) {
        const found = tryHere(terms, not, i, terms.length, i);
        if (found !== null) {
          return false
        }
      }
      return true
    });
    return results
  };

  // Compiled sweeps cache this check; editable public patterns are rechecked.
  const isFixed = regs => regs.every(reg => !reg.optional && !reg.greedy &&
    !reg.negative && !reg.choices && !reg.anything &&
    (reg.word !== undefined || reg.tag !== undefined || reg.switch !== undefined || reg.fastOr !== undefined));

  const fromFixed = (terms, regs, start, length, offset = 0) => {
    if (offset + regs.length > terms.length) {
      return null
    }
    for (let r = 0; r < regs.length; r += 1) {
      const term = terms[offset + r];
      // A literal contraction can consume more than one term.
      if (term.implicit) {
        return tryHere(terms, regs, start, length, offset)
      }
      if (wrapMatch(term, regs[r], start + r, length) !== true) {
        return null
      }
    }
    // Failed attempts never need capture state.
    const groups = {};
    for (let r = 0; r < regs.length; r += 1) {
      const name = regs[r].group;
      if (name) {
        if (!groups[name]) {
          groups[name] = [null, start + r, start + r];
        }
        groups[name][2] += 1;
      }
    }
    return { pointer: [null, start, start + regs.length], groups }
  };

  // make proper pointers
  const addSentence = function (res, n) {
    res.pointer[0] = n;
    Object.keys(res.groups).forEach(k => {
      res.groups[k][0] = n;
    });
    return res
  };

  const handleStart = function (terms, regs, n, attempt) {
    let res = attempt(terms, regs, 0, terms.length);
    if (res) {
      res = addSentence(res, n);
      return res //getGroup([res], group)
    }
    return null
  };

  // ok, here we go.
  const runMatch$1 = function (docs, todo, cache) {
    cache ||= [];
    const { regs, group, justOne, checkFirst } = todo;
    let results = [];
    if (!regs || regs.length === 0) {
      return { ptrs: [], byGroup: {} }
    }
    const attempt = (todo.fixed ?? isFixed(regs)) ? fromFixed : tryHere;

    // Compiled rules carry this value; public parsed patterns can still be edited
    // by callers, so calculate their minimum without caching on the token array.
    let minLength = todo.minLength;
    if (minLength === undefined) {
      minLength = 0;
      for (let i = 0; i < regs.length; i += 1) {
        const reg = regs[i];
        if (reg.optional !== true && reg.negative !== true) {
          minLength += 1;
        }
      }
    }
    docs: for (let n = 0; n < docs.length; n += 1) {
      const terms = docs[n];
      // let index = terms[0].index || []
      // can we skip this sentence?
      if (cache[n] && failFast(regs, cache[n])) {
        continue
      }
      // ^start regs only run once, per phrase
      if (regs[0].start === true) {
        const foundStart = handleStart(terms, regs, n, attempt);
        if (foundStart) {
          results.push(foundStart);
        }
        continue
      }
      //ok, try starting the match now from every term
      for (let i = 0; i < terms.length; i += 1) {
        // ensure it's long-enough
        if (terms.length - i < minLength) {
          break
        }
        // Compiled sweep rules can reject a start before allocating match state.
        if (checkFirst && !wrapMatch(terms[i], regs[0], i, terms.length)) {
          continue
        }
        let res = attempt(terms, regs, i, terms.length, i);
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
          const end = res.pointer[2];
          if (Math.abs(end - 1) > i) {
            i = Math.abs(end - 1);
          }
        }
      }
    }
    // ensure any end-results ($) match until the last term
    if (regs[regs.length - 1].end === true) {
      results = results.filter(res => {
        const n = res.pointer[0];
        return docs[n].length === res.pointer[2]
      });
    }
    if (todo.notIf) {
      results = notIf(results, todo.notIf, docs);
    }
    // grab the requested group
    results = getGroup(results, group);
    // add ids to pointers
    results.ptrs.forEach(ptr => {
      const [n, start, end] = ptr;
      ptr[3] = docs[n][start].id;//start-id
      ptr[4] = docs[n][end - 1].id;//end-id
    });
    return results
  };

  const methods$b = {
    one: {
      termMethods: methods$c,
      parseMatch: syntax,
      match: runMatch$1,
    },
  };

  var lib$3 = {
    /** pre-parse any match statements */
    parseMatch: function (str, opts) {
      const world = this.world();
      const killUnicode = world.methods.one.killUnicode;
      if (killUnicode) {
        str = killUnicode(str, world);
      }
      return world.methods.one.parseMatch(str, opts, world)
    }
  };

  var match = {
    api: matchAPI,
    methods: methods$b,
    lib: lib$3,
  };

  const isClass = /^\../;
  const isId = /^#./;

  const escapeXml = str => {
    str = str.replaceAll('&', '&amp;');
    str = str.replaceAll('<', '&lt;');
    str = str.replaceAll('>', '&gt;');
    str = str.replaceAll('"', '&quot;');
    str = str.replaceAll("'", '&apos;');
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
    const starts = {};
    const ends = {};
    Object.keys(obj).forEach(k => {
      let res = obj[k];
      const tag = toTag(k);
      if (typeof res === 'string') {
        res = doc.match(res);
      }
      res.docs.forEach(terms => {
        // don't highlight implicit terms
        if (terms.every(t => t.implicit)) {
          return
        }
        const a = terms[0].id;
        starts[a] ||= [];
        starts[a].push(tag.start);
        const b = terms.at(-1).id;
        ends[b] ||= [];
        ends[b].push(tag.end);
      });
    });
    return { starts, ends }
  };

  const html = function (obj) {
    // index ids to highlight
    const { starts, ends } = getIndex(this, obj);
    // create the text output
    let out = '';
    this.docs.forEach(terms => {
      for (let i = 0; i < terms.length; i += 1) {
        const t = terms[i];
        // do a span tag
        if (Object.hasOwn(starts, t.id)) {
          out += starts[t.id].join('');
        }
        out += t.pre || '';
        out += t.text || '';
        if (Object.hasOwn(ends, t.id)) {
          out += ends[t.id].join('');
        }
        out += t.post || '';
      }
    });
    return out
  };
  var html$1 = { html };

  // Walk the trailing punctuation run once, rather than retrying at every offset.
  const endPunctuation = /[,:;)\]*.?~!\u0022\uFF02\u201D\u2019\u00BB\u203A\u2032\u2033\u2034\u301E\u00B4—-]/;
  const trimEnd = str => {
    let end = str.length;
    while (end > 0 && endPunctuation.test(str[end - 1])) end--;
    return str.slice(0, end)
  };
  const trimStart =
    /^[(['"*~\uFF02\u201C\u2018\u201F\u201B\u201E\u2E42\u201A\u00AB\u2039\u2035\u2036\u2037\u301D\u0060\u301F]+/;

  const punctToKill = /[,:;)('"\uFF02\u201D\u2019\u00BB\u203A\u2032\u2033\u2034\u301E\u00B4\]]/;
  const isHyphen = /^[-–—]$/;
  const hasSpace = / /;

  const textFromTerms = function (terms, opts, keepSpace = true) {
    let txt = '';
    terms.forEach(t => {
      let pre = t.pre || '';
      let post = t.post || '';
      if (opts.punctuation === 'some') {
        pre = pre.replace(/[,،]/g, '');
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
        post = post.replace(/[,،…]|\.{2,}/g, '');
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
          post = trimEnd(post);
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
    if (opts.keepEndPunct === false) {
      // don't remove ':)' etc
      if (!docs[0][0].tags.has('Emoticon')) {
        text = text.replace(trimStart, '');
      }
      // remove ending periods
      const last = docs.at(-1);
      if (!last.at(-1).tags.has('Emoticon')) {
        text = trimEnd(text);
        // removing a spaced dash leaves its space behind
        if (!opts.keepSpace) {
          text = text.trimEnd();
        }
      }
      // kill end quotations
      if (text.endsWith(`'`) && !text.endsWith(`s'`)) {
        text = text.replace(/'/, '');
      }
    }
    if (opts.cleanWhitespace === true) {
      text = text.trim();
    }
    return text
  };

  const fmts$1 = {
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
  fmts$1.clean = fmts$1.normal;
  fmts$1.reduced = fmts$1.root;

  /* eslint-disable no-bitwise, no-multi-assign */

  // https://github.com/jbt/tiny-hashes/
  const k = [];
  let i = 0;
  for (; i < 64; i++) {
    k[i] = 0 | (Math.sin((i + 1) % Math.PI) * 4294967296);
  }

  const md5 = function (s) {
    let b,
      c,
      d,
      j = decodeURI(encodeURI(s)) + '\x80',
      a = j.length;

    const h = [(b = 0x67452301), (c = 0xefcdab89), ~b, ~c],
      words = [];

    s = (--a / 4 + 2) | 15;

    words[--s] = a * 8;

    for (; ~a; ) {
      words[a >> 2] |= j.charCodeAt(a) << (8 * a--);
    }

    for (i = j = 0; i < s; i += 16) {
      a = h;

      for (
        ;
        j < 64;
        a = [
          (d = a[3]),
          b +
            (((d =
              a[0] +
              [(b & c) | (~b & d), (d & b) | (~d & c), b ^ c ^ d, c ^ (b | ~d)][(a = j >> 4)] +
              k[j] +
              ~~words[i | ([j, 5 * j + 1, 3 * j + 5, 7 * j][a] & 15)]) <<
              (a = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21][4 * a + (j++ % 4)])) |
              (d >>> -a)),
          b,
          c,
        ]
      ) {
        b = a[1] | 0;
        c = a[2];
      }
      for (j = 4; j; ) h[--j] += a[j];
    }

    for (s = ''; j < 32; ) {
      s += ((h[j >> 3] >> ((1 ^ j++) * 4)) & 15).toString(16);
    }

    return s
  };
  // console.log(md5('food-safety'))

  const defaults$1 = {
    text: true,
    terms: true,
  };

  const opts = { case: 'none', unicode: 'some', form: 'machine', punctuation: 'some' };

  const merge = function (a, b) {
    return { ...a, ...b }
  };

  const fns$1 = {
    text: terms => textFromTerms(terms, { keepPunct: true }, false),
    normal: terms => textFromTerms(terms, merge(fmts$1.normal, { keepPunct: true }), false),
    implicit: terms => textFromTerms(terms, merge(fmts$1.implicit, { keepPunct: true }), false),

    machine: terms => textFromTerms(terms, opts, false),
    root: terms => textFromTerms(terms, merge(opts, { form: 'root' }), false),

    hash: terms => md5(textFromTerms(terms, { keepPunct: true }, false)),

    offset: terms => {
      const len = fns$1.text(terms).length;
      return {
        index: terms[0].offset.index,
        start: terms[0].offset.start,
        length: len,
      }
    },
    terms: terms => {
      return terms.map(t => ({ ...t, tags: [...t.tags] }))
    },
    confidence: (_terms, view, i) => view.eq(i).confidence(),
    syllables: (_terms, view, i) => view.eq(i).syllables(),
    sentence: (_terms, view, i) => view.eq(i).fullSentence().text(),
    dirty: terms => terms.some(t => t.dirty === true),
  };
  fns$1.sentences = fns$1.sentence;
  fns$1.clean = fns$1.normal;
  fns$1.reduced = fns$1.root;

  const toJSON = function (view, option) {
    option ||= {};
    if (typeof option === 'string') {
      option = {};
    }
    option = { ...defaults$1, ...option };
    // run any necessary upfront steps
    if (option.offset) {
      view.compute('offset');
    }
    return view.docs.map((terms, i) => {
      const res = {};
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
      const res = toJSON(this, n);
      if (typeof n === 'number') {
        return res[n]
      }
      return res
    },
  };
  methods$a.data = methods$a.json;

  const isClientSide$1 = () => typeof window !== 'undefined' && window.document;

  // Output the requested format, or the platform's default console view.
  const debug$2 = function (fmt) {
    const debugMethods = this.methods.one.debug || {};
    if (!fmt || !Object.hasOwn(debugMethods, fmt)) {
      fmt = isClientSide$1() ? 'clientSide' : 'tags';
    }
    debugMethods[fmt](this);
    return this
  };

  const toText$1 = function (term) {
    const pre = term.pre || '';
    const post = term.post || '';
    return pre + term.text + post
  };

  const findStarts = function (doc, obj) {
    const starts = {};
    Object.keys(obj).forEach(reg => {
      const m = doc.match(reg);
      m.fullPointer.forEach(a => {
        starts[a[3]] = { fn: obj[reg], end: a[2] };
      });
    });
    return starts
  };

  const wrap = function (doc, obj) {
    // index ids to highlight
    const starts = findStarts(doc, obj);
    let text = '';
    doc.docs.forEach((terms, n) => {
      for (let i = 0; i < terms.length; i += 1) {
        const t = terms[i];
        // do a span tag
        if (Object.hasOwn(starts, t.id)) {
          const { fn, end } = starts[t.id];
          const m = doc.update([[n, i, end]]);
          text += terms[i].pre || '';
          text += fn(m);
          i = end - 1;
          text += terms[i].post || '';
        } else {
          text += toText$1(t);
        }
      }
    });
    return text
  };

  // the 'spec' output format - a clean sentence + an ordered list of top-level tags
  // designed to round-trip between compromise and LLMs (see docs/spec-format.md)

  // roots that describe a token's shape, not its part-of-speech - never picked over a real POS
  const attributeTags = new Set(['Hyphenated', 'Prefix', 'SlashedTerm']);

  // walk a tag up to its top-level (root) ancestor
  const rootOf = function (tag, tagSet) {
    const entry = tagSet[tag];
    if (!entry || !entry.parents || entry.parents.length === 0) {
      return tag
    }
    for (let i = 0; i < entry.parents.length; i += 1) {
      const p = entry.parents[i];
      if (tagSet[p] && (!tagSet[p].parents || tagSet[p].parents.length === 0)) {
        return p
      }
    }
    return entry.parents.at(-1)
  };

  // reduce a term's tag-set to a single top-level tag (or '-' when untagged)
  const slotForTerm = function (term, tagSet) {
    const tags = Array.from(term.tags || []);
    if (tags.length === 0) {
      return '-'
    }
    const primary = tags.find(t => !attributeTags.has(rootOf(t, tagSet))) || tags[0];
    return rootOf(primary, tagSet)
  };

  const makeAliases = function (tagSet, registered) {
    const aliases = Object.create(null);
    for (const tag in tagSet) {
      const entry = tagSet[tag];
      // A leading null explicitly keeps the canonical name.
      const preferred = entry.aliases === undefined ? entry.alias : entry.aliases[0];
      if (preferred && registered[preferred] === tag) {
        aliases[tag] = preferred;
      }
    }
    return aliases
  };

  // one line per sentence: '<text> {Tag,Tag,…}'
  const toSpec = function (doc, world) {
    const tagSet = world.model.one.tagSet;
    const aliases = makeAliases(tagSet, world.model.one.tagAliases);
    return doc.docs.map(terms => {
      const text = terms.reduce((str, t) => str + t.pre + t.text + t.post, '').trim();
      const tags = terms.map(t => {
        const tag = slotForTerm(t, tagSet);
        return aliases[tag] || tag
      }).join(',');
      return `${text} {${tags}}`
    }).join('\n')
  };

  const isObject$2 = val => {
    return Object.prototype.toString.call(val) === '[object Object]'
  };

  // sort by frequency
  const topk = function (arr) {
    const counts = new Map();
    arr.forEach(word => {
      counts.set(word, (counts.get(word) ?? 0) + 1);
    });
    const res = Array.from(counts, ([normal, count]) => ({ normal, count }));
    return res.sort((a, b) => b.count - a.count)
  };

  /** some named output formats */
  const out$1 = function (method) {
    // support custom outputs
    if (isObject$2(method)) {
      return wrap(this, method)
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
    // tagged-sentence format for LLMs (see docs/spec-format.md)
    if (method === 'spec') {
      return toSpec(this, this.world)
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
      const arr = this.docs.map(terms => {
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
      return this.docs.flatMap(terms => terms.map(t => t.text).filter(Boolean))
    }
    if (method === 'tags') {
      return this.docs.map(terms => {
        return terms.reduce((h, t) => {
          h[t.implicit || t.normal] = Array.from(t.tags);
          return h
        }, {})
      })
    }
    if (method === 'best-tag') {
      this.compute('tagRank');
      return this.docs
        .map(ts => {
          return ts.map(t => (t.tagRank?.[0] ? `#${t.tagRank[0]}` : '')).join(' ')
        })
        .join('\n')
    }
    if (method === 'debug') {
      return this.debug() //allow
    }
    return this.text()
  };

  const methods$9 = {
    /** */
    debug: debug$2,
    /** */
    out: out$1,
    /** */
    wrap: function (obj) {
      return wrap(this, obj)
    },
  };

  const isObject$1 = val => {
    return Object.prototype.toString.call(val) === '[object Object]'
  };
  // a dash between two words, like '2025-05-11 - they'
  const spacedDash = /^\s+[-—]\s+$/;

  var text = {
    /** */
    text: function (fmt) {
      let opts = {};
      if (fmt && typeof fmt === 'string' && Object.hasOwn(fmts$1, fmt)) {
        opts = { ...fmts$1[fmt] };
      } else if (fmt && isObject$1(fmt)) {
        opts = { ...fmt }; //todo: fixme
      }
      // is it a full document?
      if (opts.keepSpace === undefined && !this.isFull()) {
        //
        opts.keepSpace = false;
      }
      if (opts.keepEndPunct === undefined && this.pointer) {
        const ptr = this.pointer[0];
        const lastTerm = this.docs.at(-1)?.at(-1);
        if (ptr?.[1] || spacedDash.test(lastTerm?.post)) {
          opts.keepEndPunct = false;
        } else {
          opts.keepEndPunct = true;
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

  const methods$8 = { ...methods$9, ...text, ...methods$a, ...html$1 };

  const addAPI$1 = function (View) {
    Object.assign(View.prototype, methods$8);
  };

  /* eslint-disable no-console */
  const logClientSide = function (view) {
    console.log('%c -=-=- ', 'background-color:#6699cc;');
    view.forEach(m => {
      console.groupCollapsed(m.text());
      const terms = m.docs[0];
      const out = terms.map(t => {
        let text = t.text || '-';
        if (t.implicit) {
          text = '[' + t.implicit + ']';
        }
        const tags = '[' + Array.from(t.tags).join(', ') + ']';
        return { text, tags }
      });
      console.table(out, ['text', 'tags']);
      console.groupEnd();
    });
  };

  /* eslint-disable no-console */

  const tagString$1 = function (tags, model) {
    if (model.one.tagSet) {
      tags = tags.map(tag => {
        if (!Object.hasOwn(model.one.tagSet, tag)) {
          return tag
        }
        const c = model.one.tagSet[tag].color || 'blue';
        return cli$2[c](tag)
      });
    }
    return tags.join(', ')
  };

  const showTags$1 = function (view) {
    const { docs, model } = view;
    if (docs.length === 0) {
      console.log(blue('\n     ──────'));
    }
    docs.forEach(terms => {
      console.log(blue('\n  ╭─────────'));
      terms.forEach(t => {
        const tags = [...(t.tags || [])];
        let text = t.text || '-';
        if (t.sense) {
          text = `{${t.normal}/${t.sense}}`;
        }
        if (t.implicit) {
          text = '[' + t.implicit + ']';
        }
        text = yellow(text);
        let word = "'" + text + "'";
        if (t.reference) {
          const str = view.update([t.reference]).text('normal');
          word += ` - ${dim(i$1('[' + str + ']'))}`;
        }
        word = word.padEnd(18);
        const str = blue('  │ ') + i$1(word) + '  - ' + tagString$1(tags, model);
        console.log(str);
      });
    });
    console.log('\n');
  };

  /* eslint-disable no-console */

  const colors$1 = { Noun: blue, Verb: green, Adjective: yellow, Pivot: red };

  const showChunks = view => {
    console.log('');
    view.docs.forEach(terms => {
      const out = terms.map(term => {
        const text = term.implicit || term.normal;
        if (Object.hasOwn(colors$1, term.chunk)) {
          return colors$1[term.chunk](text)
        }
        return text
      });
      console.log(out.join(' '), '\n');
    });
    console.log('\n');
  };

  /* eslint-disable no-console */

  const spliceIn = (txt, offset, index) => {
    const start = offset.start + index * 9; // Each highlight adds nine ANSI characters.
    const end = start + offset.length;
    return txt.substring(0, start) + blue(txt.substring(start, end)) + txt.substring(end)
  };

  const showHighlight = function (doc) {
    if (!doc.found) {
      return
    }
    const bySentence = {};
    doc.fullPointer.forEach(ptr => {
      bySentence[ptr[0]] ||= [];
      bySentence[ptr[0]].push(ptr);
    });
    Object.keys(bySentence).forEach(k => {
      const full = doc.update([[Number(k)]]);
      let txt = full.text();
      const matches = doc.update(bySentence[k]);
      const json = matches.json({ offset: true });
      json.forEach((obj, i) => {
        txt = spliceIn(txt, obj.offset, i);
      });
      console.log(txt);
    });
    console.log('\n');
  };

  const debug$1 = {
    tags: showTags$1,
    clientSide: logClientSide,
    chunks: showChunks,
    highlight: showHighlight,
  };

  // Diagnostics describe the original parse, before the returned View is mutated.
  const specFailures = (doc, slots, patterns, aliases) => {
    const terms = doc.docs.flat();
    const failures = [];
    if (terms.length !== slots.length) {
      failures.push({
        code: 'length', expected: slots.length, actual: terms.length,
        message: `expected ${slots.length} terms, got ${terms.length}`,
      });
    }
    doc.compute('tagRank');
    slots.forEach((slot, i) => {
      const term = terms[i];
      const actual = term ? Array.from(term.tags) : [];
      const detail = { term: i + 1, word: term?.implicit || term?.text || '', expected: slot, actual };
      if (patterns[i] === null) {
        failures.push({ ...detail, code: 'syntax', message: `term ${i + 1}: invalid slot ${slot.join('|')}` });
        return
      }
      if (!term) {
        return // covered by the length error
      }
      const problems = [];
      slot.forEach(value => {
        if (value === '.') {
          return
        }
        const negative = value.startsWith('!');
        const tag = value.replace(/^!?#?/, '');
        const present = term.tags.has(aliases[tag] || tag);
        if (negative && present) {
          problems.push(`unexpected #${tag}`);
        } else if (!negative && !present) {
          problems.push(`missing #${tag}`);
        }
      });
      if (problems.length > 0) {
        const best = term.tagRank?.[0] || actual.at(-1) || 'Untagged';
        failures.push({
          ...detail, code: 'tags',
          message: `term ${i + 1} '${detail.word}': #${best}, ${problems.join(', ')}`,
        });
      }
    });
    if (failures.length === 0) {
      failures.push({ code: 'match', message: 'tags align, but the sentence pattern did not match' });
    }
    return failures
  };

  const logSpec = (doc, slots, failures, aliases) => {
    const terms = doc.docs.flat();
    const wrong = new Set(failures.filter(failure => failure.term).map(failure => failure.term - 1));
    const invalid = new Set(failures.filter(failure => failure.code === 'syntax').map(failure => failure.term - 1));
    const unmatched = failures.some(failure => failure.code === 'match');
    let visible = 0;
    terms.forEach((term, i) => {
      if (term.text) {
        visible = i;
      }
      // Implicit terms share their visible contraction or number-range token.
      if (wrong.has(i) || i >= slots.length || unmatched) {
        wrong.add(visible);
      }
    });
    const text = terms.map((term, i) => {
      const word = wrong.has(i) && term.text ? red(term.text) : term.text;
      return term.pre + word + term.post
    }).join('').trim();
    const tags = slots.map((slot, i) => {
      const term = terms[i];
      if (!term || invalid.has(i) || unmatched) {
        return red(slot.join('|'))
      }
      return slot.map(value => {
        if (value === '.') {
          return value
        }
        const negative = value.startsWith('!');
        const tag = value.replace(/^!?#?/, '');
        const present = term.tags.has(aliases[tag] || tag);
        return present === negative ? red(value) : value
      }).join('|')
    }).join(',');
    const block = slots.length === 0 ? red('{}') : `{${tags}}`;
    return `${text} ${block}`
  };

  const lastBrace = /\{(?=[^{]*$)/; // split on the last { only
  const comment = /\}[ \t]*#.*$/; // an optional '# comment' after the last {tags} block


  // parse the spec output
  const parseLine = function (line = '') {
    let [text, tags] = line.split(lastBrace); // eslint-disable-line prefer-const
    if (tags === undefined) {
      return { text: text.replace(/\s#.*$/, '').trimEnd(), tags: null } // no {tags} block on this line
    }
    tags = tags.replace(comment, '}'); // drop the comment - only ever one, always last
    tags = tags.split(',').map(tag => tag.trim());
    const lastTag = tags[tags.length - 1];
    tags[tags.length - 1] = lastTag.replace(/\}$/, '');
    tags = tags.map(tag => tag.split('|').map(t => t.trim()));
    if (tags.length === 1 && tags[0].length === 1 && tags[0][0] === '') {
      tags = []; // empty '{}'; retain empty slots in nonempty lists
    }
    return { text, tags }
  };

  // make a match syntax looping through the arrays of tags
  const toMatchString = function (tags, aliases) {
    // Slots accept tags and '.', never match-syntax quantifiers or groups.
    if (tags.some(slot => slot.some(tag => tag !== '.' && !/^!?#?[a-z][a-z0-9]*$/i.test(tag)))) {
      return null
    }
    return tags.map(arr => {
      arr = arr.map(str => {
        if (str === '.') {
          return '.'
        }
        const negative = str.startsWith('!');
        const tag = str.replace(/^!?#?/, '');
        const prefix = negative ? '!#' : '#';
        return prefix + (aliases[tag] || tag)
      });
      if (arr.length > 1) {
        return `(${arr.join(' && ')})`
      }
      return arr[0]
    }).join(' ')
  };

  // Apply only positive constraints; negatives remain assertions.
  const applyTags = (doc, slots, aliases) => {
    const terms = doc.terms();
    // Tokenization can supply structural tags; literal slots replace them.
    doc.docs.flat().forEach(term => term.tags.clear());
    slots?.forEach((slot, i) => {
      const tags = slot.filter(tag => tag !== '.' && !tag.startsWith('!')).map(tag => {
        tag = tag.replace(/^#/, '');
        return aliases[tag] || tag
      });
      terms.eq(i).tag(tags, 'fromSpec');
    });
  };

  const fromSpec = function (spec, { tags: tagMode = 'ignore', failures: failureMode = 'ignore', verbose = false } = {}) {
    if (!['ignore', 'use'].includes(tagMode) || !['ignore', 'throw', 'retain', 'log'].includes(failureMode)) {
      throw new Error('Invalid fromSpec options')
    }
    const aliases = this.world().model.one.tagAliases;
    const result = this('');
    result.failures = [];
    spec.split('\n').forEach((line, index) => {
      if (!line.trim() || /^\s*#/.test(line)) {
        return
      }
      const { text, tags } = parseLine(line);
      const doc = tagMode === 'use' ? this.tokenize(text) : this(text);
      let failures = [];
      if (tags !== null && (tagMode === 'use' || failureMode !== 'ignore')) {
        const count = doc.docs.reduce((sum, terms) => sum + terms.length, 0);
        const patterns = tags.map(slot => toMatchString([slot], aliases));
        const pattern = toMatchString(tags, aliases);
        // Assigning slots is unsafe when the shape or syntax is invalid.
        const canApply = count === tags.length && pattern !== null;
        if (tagMode === 'use' && !canApply && failureMode !== 'log') {
          const invalid = specFailures(doc, tags, patterns, aliases);
          throw new Error(`${text.trim()} - ${invalid.map(failure => failure.message).join('; ')}`)
        }
        if (tagMode === 'use') {
          applyTags(doc, canApply ? tags : null, aliases);
        }
        if (failureMode !== 'ignore' && (count !== tags.length || pattern === null || !doc.has(pattern))) {
          failures = specFailures(doc, tags, patterns, aliases)
            .map(failure => ({ line: index + 1, text: text.trim(), ...failure }));
          result.failures.push(...failures);
        }
      } else if (tagMode === 'use') {
        applyTags(doc, null, aliases);
      }
      const detail = failures.map(failure => failure.message).join('; ');
      if (failureMode === 'log' && failures.length > 0) {
        console.error(logSpec(doc, tags, failures, aliases)); //eslint-disable-line no-console
      } else if (verbose) {
        const block = tags === null ? '' : ` {${tags.map(slot => slot.join('|')).join(',')}}`;
        if (failures.length > 0) {
          console.log(`${red('✗')} ${text}${dim(block)} - ${red(detail)}`); //eslint-disable-line no-console
        } else {
          console.log(`${green('✓')} ${green(dim(text))}${dim(block)}`); //eslint-disable-line no-console
        }
      }
      if (failures.length > 0 && failureMode === 'throw') {
        throw new Error(`${text.trim()} - ${detail}`)
      }
      if (failureMode === 'retain' && tags !== null && failures.length === 0) {
        return
      }
      // Preserve the parsed terms and assigned tags, without running hooks twice.
      if (doc.found) {
        const previous = result.document.at(-1)?.at(-1);
        if (previous) {
          previous.post += '\n';
        }
        result.document.push(...doc.docs);
      }
    });
    return result
  };

  // Keep the legacy logging and throwing arguments on the compatibility wrapper.
  const testSpec = function (spec, verbose = true, throwError = false) {
    const result = this.fromSpec(spec, { tags: 'ignore', failures: 'retain', verbose });
    if (throwError && result.failures.length > 0) {
      const failure = result.failures[0];
      throw new Error(`${failure.text} - ${failure.message}`)
    }
    return result
  };

  var output$1 = {
    lib: {
      fromSpec,
      testSpec,
    },
    api: addAPI$1,
    methods: {
      one: {
        hash: md5,
        debug: debug$1,
      },
    },
  };

  // do the pointers intersect?
  const doesOverlap = function (a, b) {
    if (a[0] !== b[0]) {
      return false
    }
    const [, startA, endA] = a;
    const [, startB, endB] = b;
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
    const byN = {};
    ptrs.forEach(ref => {
      byN[ref[0]] ||= [];
      byN[ref[0]].push(ref);
    });
    return byN
  };

  // remove exact duplicates
  const uniquePtrs = function (arr) {
    const obj = {};
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
    const [n, start] = full;
    const mStart = m[1];
    const mEnd = m[2];
    const res = {};
    // is there space before the match?
    if (start < mStart) {
      const end = mStart < full[2] ? mStart : full[2]; // find closest end-point
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
    const byN = indexN(m);
    const res = [];
    full.forEach(ptr => {
      const [n] = ptr;
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
        const found = pivotBy(carry, p);
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

  const max = 20;

  // sweep-around looking for our start term uuid
  const blindSweep = function (id, doc, n) {
    for (let i = 0; i < max; i += 1) {
      // look up a sentence
      if (doc[n - i]) {
        const index = doc[n - i].findIndex(term => term.id === id);
        if (index !== -1) {
          return [n - i, index]
        }
      }
      // look down a sentence
      if (doc[n + i]) {
        const index = doc[n + i].findIndex(term => term.id === id);
        if (index !== -1) {
          return [n + i, index]
        }
      }
    }
    return null
  };

  const repairEnding = function (ptr, document) {
    const [n, start, , , endId] = ptr;
    const terms = document[n];
    // look for end-id
    const newEnd = terms.findIndex(t => t.id === endId);
    if (newEnd === -1) {
      // if end-term wasn't found, so go all the way to the end
      ptr[2] = document[n].length;
      ptr[4] = terms.length > 0 ? terms[terms.length - 1].id : null;
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
      // eslint-disable-next-line prefer-const
      let [n, start, end, id, endId] = ptr;
      let terms = document[n] || [];
      if (start === undefined) {
        start = 0;
      }
      if (end === undefined) {
        end = terms.length;
      }
      if (id && (!terms[start] || terms[start].id !== id)) {
        // console.log('  repairing pointer...')
        const wild = blindSweep(id, document, n);
        if (wild !== null) {
          const len = end - start;
          terms = document[wild[0]].slice(wild[1], wild[1] + len);
          // actually change the pointer
          const startId = terms[0] ? terms[0].id : null;
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

  // flat list of terms from nested document
  const termList = function (docs) {
    const arr = [];
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
      getDoc: getDoc$1,
      pointer: {
        indexN,
        splitAll,
      }
    },
  };

  // a union is a + b, minus duplicates
  const getUnion = function (a, b) {
    const both = a.concat(b);
    const byN = indexN(both);
    let res = [];
    both.forEach(ptr => {
      const [n] = ptr;
      if (byN[n].length === 1) {
        // we're alone on this sentence, so we're good
        res.push(ptr);
        return
      }
      // there may be overlaps
      const hmm = byN[n].filter(m => doesOverlap(ptr, m));
      hmm.push(ptr);
      const range = getExtent(hmm);
      res.push(range);
    });
    res = uniquePtrs(res);
    return res
  };

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
    const res = [];
    const found = splitAll(refs, not);
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

  // console.log(subtract([[0, 0, 2]], [[0, 0, 1]]))
  // console.log(subtract([[0, 0, 2]], [[0, 1, 2]]))

  // [a,a,a,a,-,-,]
  // [-,-,b,b,b,-,]
  // [-,-,x,x,-,-,]
  const intersection = function (a, b) {
    // find the latest-start
    const start = a[1] < b[1] ? b[1] : a[1];
    // find the earliest-end
    const end = a[2] > b[2] ? b[2] : a[2];
    // does it form a valid pointer?
    if (start < end) {
      return [a[0], start, end]
    }
    return null
  };

  const getIntersection = function (a, b) {
    const byN = indexN(b);
    const res = [];
    a.forEach(ptr => {
      let hmm = byN[ptr[0]] || [];
      hmm = hmm.filter(p => doesOverlap(ptr, p));
      // no sentence-pairs, so no intersection
      if (hmm.length === 0) {
        return
      }
      hmm.forEach(h => {
        const overlap = intersection(ptr, h);
        if (overlap) {
          res.push(overlap);
        }
      });
    });
    return res
  };

  // console.log(getIntersection([[0, 1, 3]], [[0, 2, 4]]))

  const getDoc = (m, view) => {
    if (typeof m === 'string' || Array.isArray(m)) {
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
      const [n, start] = ptr;
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
    let ptrs = getUnion(this.fullPointer, m.fullPointer);
    ptrs = addIds(ptrs, this.document);
    return this.toView(ptrs)
  };
  methods$6.and = methods$6.union;

  // only parts they both have
  methods$6.intersection = function (m) {
    m = getDoc(m, this);
    let ptrs = getIntersection(this.fullPointer, m.fullPointer);
    ptrs = addIds(ptrs, this.document);
    return this.toView(ptrs)
  };

  // only parts of a that b does not have
  methods$6.not = function (m) {
    m = getDoc(m, this);
    let ptrs = subtract(this.fullPointer, m.fullPointer);
    ptrs = addIds(ptrs, this.document);
    return this.toView(ptrs)
  };
  methods$6.difference = methods$6.not;

  // get opposite of a match
  methods$6.complement = function () {
    const doc = this.all();
    let ptrs = subtract(doc.fullPointer, this.fullPointer);
    ptrs = addIds(ptrs, this.document);
    return this.toView(ptrs)
  };

  // remove overlaps
  methods$6.settle = function () {
    let ptrs = this.fullPointer;
    ptrs.forEach(ptr => {
      ptrs = getUnion(ptrs, [ptr]);
    });
    ptrs = addIds(ptrs, this.document);
    return this.update(ptrs)
  };

  const addAPI = function (View) {
    // add set/intersection/union
    Object.assign(View.prototype, methods$6);
  };

  var pointers = {
    methods: methods$7,
    api: addAPI,
  };

  var lib$2 = {
    // compile a list of matches into a match-net
    buildNet: function (matches) {
      const methods = this.methods();
      const net = methods.one.buildNet(matches, this.world());
      net.isNet = true;
      return net
    }
  };

  const api$4 = function (View) {

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
        const ptr = o.pointer;
        const term = docs[ptr[0]][ptr[1]];
        const len = ptr[2] - ptr[1];
        if (term.index) {
          o.pointer = [
            term.index[0],
            term.index[1],
            ptr[1] + len
          ];
        }
        return o
      });
      const ptrs = found.map(o => o.pointer);
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

  // Resolve actions and index hints once, alongside the match expression.
  const resolveAliases = (rule, aliases) => {
    const tag = value => {
      if (Array.isArray(value)) {
        return value.map(tag)
      }
      if (typeof value !== 'string') {
        return value
      }
      return value.trim().split(/ +/).map(name => {
        name = name.replace(/^#/, '');
        return aliases[name] || name
      }).join(' ')
    };
    const hook = value => {
      if (typeof value === 'string' && value.startsWith('#')) {
        return '#' + tag(value)
      }
      return value
    };
    if (rule.tag !== undefined) {
      rule.tag = tag(rule.tag);
    }
    if (rule.unTag !== undefined) {
      rule.unTag = tag(rule.unTag);
    }
    if (rule.hook !== undefined) {
      rule.hook = hook(rule.hook);
    }
    if (rule.ifNo !== undefined) {
      rule.ifNo = [rule.ifNo].flat().map(hook);
    }
  };

  // Only precheck required, single-term tokens without special matching steps.
  const canCheck = reg => Boolean(reg && !reg.optional && !reg.negative && !reg.greedy &&
    !reg.choices && !reg.anything && !reg.regex && !reg.method);

  const getBoundary = (reg, boundary) => {
    if (!canCheck(reg) || !reg[boundary]) {
      return null
    }
    return reg
  };

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

  // Only allow hooks that every successful match must contain. In particular,
  // a word inside an optional or negative AND block is not a required hook.
  const hasRequiredHook = function (regs, hook) {
    return regs.some(reg => {
      if (reg.optional || reg.negative) {
        return false
      }
      if (getTokenNeeds(reg) === hook) {
        return true
      }
      return reg.operator === 'and' && reg.choices &&
        reg.choices.some(side => hasRequiredHook(side, hook))
    })
  };

  const getNeeds = function (regs) {
    const needs = [];
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
    const wants = [];
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
              const n = getTokenNeeds(r);
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

  const parse$2 = function (matches, world) {
    const parseMatch = world.methods.one.parseMatch;
    matches.forEach(obj => {
      resolveAliases(obj, world.model.one.tagAliases);
      obj.regs = parseMatch(obj.match, {}, world);
      obj.fixed = isFixed(obj.regs);
      obj.checkFirst = canCheck(obj.regs[0]);
      obj.startTerm = getBoundary(obj.regs[0], 'start');
      obj.endTerm = getBoundary(obj.regs[obj.regs.length - 1], 'end');
      if (obj.notIf) {
        obj.notIf = parseMatch(obj.notIf, {}, world);
      }
      // cache any requirements up-front 
      obj.needs = getNeeds(obj.regs);
      if (obj.hook !== undefined) {
        if (typeof obj.hook !== 'string' || !obj.needs.includes(obj.hook) || !hasRequiredHook(obj.regs, obj.hook)) {
          throw new Error(`Invalid hook "${obj.hook}" for match "${obj.match}": use a required word, #Tag, or %Switch%.`)
        }
      }
      const { wants, count } = getWants(obj.regs);
      obj.wants = wants;
      obj.minWant = count;
      // get rid of tiny sentences
      obj.minWords = obj.regs.filter(o => !o.optional).length;
      // The matcher excludes negative tokens from its own minimum. Cache that
      // separately rather than changing the sweep's existing length filter.
      obj.minLength = obj.regs.filter(o => o.optional !== true && o.negative !== true).length;
    });
    return matches
  };

  // Choose one necessary hook per rule. A missing required hook guarantees that
  // the rule cannot match, so broader hooks need not enqueue it as well.
  const buildIndex$1 = function (matches, hooks, hookOrder) {
    const index = Object.create(null);
    const seen = new Set();
    const lastRank = Object.keys(hooks).length;
    matches.forEach((rule, order) => {
      if (seen.has(rule)) {
        return
      }
      seen.add(rule);
      let anchor = null;
      let rank = lastRank;
      for (let i = 0; i < rule.needs.length; i += 1) {
        const key = rule.needs[i];
        // Prefer the hook shared by the fewest rules in this network.
        if (anchor === null || hooks[key].length < hooks[anchor].length) {
          anchor = key;
        }
        rank = Math.min(rank, hookOrder[key]);
      }
      // Explicit hooks have already been checked against required match tokens.
      if (rule.hook !== undefined) {
        anchor = rule.hook;
      }
      // Historically, any earlier matching alternative could determine where
      // this rule ran. Retain that ordering even when using a required anchor.
      const earlier = [...new Set(rule.wants)]
        .filter(key => hookOrder[key] < rank)
        .sort((a, b) => hookOrder[a] - hookOrder[b]);
      const keys = anchor === null ? [...new Set(rule.wants)] : [anchor];
      // The bucket already proves its anchor; check each remaining need once.
      const needs = [...new Set(rule.needs)].filter(key => key !== anchor);
      const entry = { rule, order, rank, earlier, needs, single: keys.length === 1 };
      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i];
        index[key] ||= [];
        index[key].push(entry);
      }
    });
    return index
  };

  // do some indexing on the list of matches
  const buildNet = function (matches, world) {
    // turn match-syntax into json
    matches = parse$2(matches, world);

    // collect by wants and needs
    const hooks = {};
    matches.forEach(obj => {
      // add needs
      obj.needs.forEach(str => {
        hooks[str] = Array.isArray(hooks[str]) ? hooks[str] : [];
        hooks[str].push(obj);
      });
      // add wants
      obj.wants.forEach(str => {
        hooks[str] = Array.isArray(hooks[str]) ? hooks[str] : [];
        hooks[str].push(obj);
      });
    });
    // Record enumeration order, including numeric keys, so input-driven lookup
    // can preserve the order in which tag actions have always been applied.
    const hookOrder = Object.create(null);
    Object.keys(hooks).forEach((k, i) => {
      hookOrder[k] = i;
      // remove duplicates
      const already = new Set();
      hooks[k] = hooks[k].filter(obj => {
        if (already.has(obj)) {
          return false
        }
        already.add(obj);
        return true
      });
    });

    // keep all un-cacheable matches (those with no needs) 
    const always = matches.filter(o => o.needs.length === 0 && o.wants.length === 0);
    return {
      hooks,
      hookOrder,
      index: buildIndex$1(matches, hooks, hookOrder),
      always
    }
  };

  // Reject impossible candidates before allocating and sorting their entries.
  const canMatch = (obj, haves, terms, needs = obj.needs) => {
    const termCount = terms.length;
    if (!(termCount >= obj.minWords)) {
      return false
    }
    for (let j = 0; j < needs.length; j += 1) {
      if (!haves.has(needs[j])) {
        return false
      }
    }
    if (obj.ifNo !== undefined) {
      for (let j = 0; j < obj.ifNo.length; j += 1) {
        if (haves.has(obj.ifNo[j])) {
          return false
        }
      }
    }
    if (obj.wants.length > 0) {
      let count = 0;
      for (let j = 0; j < obj.wants.length; j += 1) {
        if (haves.has(obj.wants[j])) {
          count += 1;
          if (count >= obj.minWant) {
            break
          }
        }
      }
      if (!(count >= obj.minWant)) {
        return false
      }
    }
    // Required anchors must match the sentence boundary, not just occur in it.
    if (termCount && obj.startTerm && !wrapMatch(terms[0], obj.startTerm, 0, termCount)) {
      return false
    }
    if (termCount && obj.endTerm && !wrapMatch(terms[termCount - 1], obj.endTerm, termCount - 1, termCount)) {
      return false
    }
    return true
  };

  // Required anchors narrow the candidate list. Sort surviving entries by their
  // original first matching hook, then their position within that hook's bucket.
  const getIndexed = function (set, index, hookOrder, terms) {
    const found = [];
    const seen = new Set();
    set.forEach(key => {
      const bucket = index[key];
      if (!Array.isArray(bucket)) {
        return
      }
      for (let i = 0; i < bucket.length; i += 1) {
        const entry = bucket[i];
        // Single-bucket entries cannot be encountered twice. Older nets fall back.
        if (entry.single !== true) {
          if (seen.has(entry)) {
            continue
          }
          seen.add(entry);
        }
        if (!canMatch(entry.rule, set, terms, entry.needs)) {
          continue
        }
        let rank = entry.rank;
        for (let j = 0; j < entry.earlier.length; j += 1) {
          const earlier = entry.earlier[j];
          if (set.has(earlier)) {
            rank = hookOrder[earlier];
            break
          }
        }
        if (rank === entry.rank) {
          found.push(entry);
        } else {
          found.push({ rule: entry.rule, rank, order: entry.order });
        }
      }
    });
    found.sort((a, b) => a.rank - b.rank || a.order - b.order);
    return found.map(entry => entry.rule)
  };

  // for each cached-sentence, find a list of possible matches
  const getHooks = function (docCaches, net, document) {
    const { hooks, index, always } = net;
    let { hookOrder } = net;
    // Older compiled nets may not include the precomputed hook order.
    if (!hookOrder) {
      hookOrder = Object.create(null);
      Object.keys(hooks).forEach((k, i) => { hookOrder[k] = i; });
    }
    const lists = docCaches.map((set, n) => {
      if (index) {
        return getIndexed(set, index, hookOrder, document[n])
      }
      const keys = [];
      set.forEach(k => {
        if (typeof hookOrder[k] === 'number') {
          keys.push(k);
        }
      });
      keys.sort((a, b) => hookOrder[a] - hookOrder[b]);
      // Append each rule once, without concatenating and then filtering buckets.
      const maybe = [];
      const already = new Set();
      for (let i = 0; i < keys.length; i += 1) {
        const bucket = hooks[keys[i]];
        for (let j = 0; j < bucket.length; j += 1) {
          const m = bucket[j];
          if (!already.has(m)) {
            already.add(m);
            if (canMatch(m, set, document[n])) {
              maybe.push(m);
            }
          }
        }
      }
      return maybe
    });
    // Apply the same exclusions to unindexed rules, preserving their final position.
    lists.forEach((list, n) => {
      for (let i = 0; i < always.length; i += 1) {
        if (canMatch(always[i], docCaches[n], document[n])) {
          list.push(always[i]);
        }
      }
    });
    return lists
  };

  // finally,
  // actually run these match-statements on the terms
  const runMatch = function (maybeList, document, docCache, methods, opts) {
    const results = [];
    for (let n = 0; n < maybeList.length; n += 1) {
      const sentence = [document[n]];
      for (let i = 0; i < maybeList[n].length; i += 1) {
        const m = maybeList[n][i];
        // ok, actually do the work.
        const res = methods.one.match(sentence, m);
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
            const todo = { ...m, pointer: ptr };
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

  const sweep$1 = function (document, net, methods, opts = {}) {
    // find suitable matches to attempt, on each sentence
    const docCache = methods.one.cacheDoc(document);
    // filter candidates before sorting them into execution order
    const maybeList = getHooks(docCache, net, document);

    // now actually run the matches
    const results = runMatch(maybeList, document, docCache, methods, opts);
    // console.dir(results, { depth: 5 })
    return results
  };

  const sets = new WeakMap();
  const empty = new Set();

  // Normalization replaces these arrays when plugins rebuild the tag graph.
  const getTagSet = (tags) => {
    if (!tags || tags.length === 0) {
      return empty
    }
    let set = sets.get(tags);
    if (!set) {
      set = new Set(tags);
      sets.set(tags, set);
    }
    return set
  };

  // is this tag consistent with the tags they already have?
  const canBe$1 = function (terms, tag, model) {
    const tagSet = model.one.tagSet;
    if (!Object.hasOwn(tagSet, tag)) {
      return true
    }
    const conflicts = getTagSet(tagSet[tag].not);
    if (conflicts.size === 0) {
      return true
    }
    for (let i = 0; i < terms.length; i += 1) {
      const term = terms[i];
      for (const existing of term.tags) {
        if (conflicts.has(existing)) {
          return false //found a tag conflict - bail!
        }
      }
    }
    return true
  };

  const tagger = function (list, document, world) {
    const { model, methods } = world;
    const { getDoc, setTag, unTag } = methods.one;
    const looksPlural = methods.two.looksPlural;
    if (list.length === 0) {
      return list
    }
    return list.map(todo => {
      if (!todo.tag && !todo.chunk && !todo.unTag) {
        return
      }
      const reason = todo.reason || todo.match;
      const terms = getDoc([todo.pointer], document)[0];
      let validated;
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
        // Only an exact single tag was checked by canBe; arrays and shorthand
        // still need their individual checks in setTag.
        if (typeof todo.tag === 'string' && Object.hasOwn(model.one.tagSet, todo.tag)) {
          validated = model.one.tagSet[todo.tag];
        }
      }
      if (todo.tag !== undefined) {
        setTag(terms, todo.tag, world, todo.safe, `[post] '${reason}'`, validated);
        // quick and dirty plural tagger 😕
        if (todo.tag === 'Noun' && looksPlural) {
          const term = terms[terms.length - 1];
          if (looksPlural(term.text)) {
            setTag([term], 'Plural', world, todo.safe, 'quick-plural');
          } else {
            setTag([term], 'Singular', world, todo.safe, 'quick-singular');
          }
        }
        // allow freezing this match, too
        if (todo.freeze === true) {
          terms.forEach(term => (term.frozen = true));
        }
      }
      if (todo.unTag !== undefined) {
        unTag(terms, todo.unTag, model.one.tagSet, reason);
      }
      // allow setting chunks, too
      if (todo.chunk) {
        terms.forEach(t => (t.chunk = todo.chunk));
      }
    })
  };

  var methods$5 = {
    buildNet,
    bulkMatch: sweep$1,
    bulkTagger: tagger
  };

  var sweep = {
    lib: lib$2,
    api: api$4,
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

  // eslint-disable-next-line max-params
  const tagTerm = function (term, tag, tagSet, isSafe, validated, reason) {
    // does it already have this tag?
    if (term.tags.has(tag) === true) {
      return null
    }
    // allow this shorthand in multiple-tag strings
    if (tag === '.') {
      return null
    }
    // don't overwrite any tags, if term is frozen
    if (term.frozen === true) {
      isSafe = true;
    }
    const previous = debug$4.tags ? debug$4.before(term) : null;
    // for known tags, do logical dependencies first
    const known = tagSet[tag];
    if (known) {
      // first, we remove any conflicting tags
      if (known !== validated && known.not && known.not.length > 0) {
        const conflicts = getTagSet(known.not);
        for (const existing of term.tags) {
          if (conflicts.has(existing)) {
            // Safe and frozen terms cannot lose conflicting tags.
            if (isSafe === true) {
              return null
            }
            term.tags.delete(existing);
          }
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
    if (previous) {
      debug$4.log(term, previous, reason);
    }
    return true
  };

  // support '#Noun . #Adjective' syntax
  // eslint-disable-next-line max-params
  const multiTag = function (terms, tagString, tagSet, aliases, isSafe, reason) {
    const tags = tagString.split(isMulti);
    terms.forEach((term, i) => {
      let tag = tags[i];
      if (tag) {
        tag = tag.replace(/^#/, '');
        tag = aliases?.[tag] || tag;
        tagTerm(term, tag, tagSet, isSafe, undefined, reason);
      }
    });
  };

  // add a tag to all these terms
  // Whole-match validation is separate from per-term safety.
  // eslint-disable-next-line max-params
  const setTag = function (terms, tag, world = {}, isSafe, reason, validated) {
    const tagSet = world.model.one.tagSet || {};
    if (!tag) {
      return
    }
    if (Array.isArray(tag) === true) {
      tag.forEach(tg => setTag(terms, tg, world, isSafe, reason));
      return
    }
    if (typeof tag !== 'string') {
      console.warn(`compromise: Invalid tag '${tag}'`); // eslint-disable-line
      return
    }
    tag = tag.trim();
    // support '#Noun . #Adjective' syntax
    if (isMulti.test(tag)) {
      multiTag(terms, tag, tagSet, world.model.one.tagAliases, isSafe, reason);
      return
    }
    tag = tag.replace(/^#/, '');
    tag = world.model.one.tagAliases?.[tag] || tag;
    // let set = false
    for (let i = 0; i < terms.length; i += 1) {
      tagTerm(terms[i], tag, tagSet, isSafe, validated, reason);
    }
  };

  // remove this tag, and its children, from these terms
  const unTag = function (terms, tag, tagSet, reason = 'untag') {
    tag = tag.trim().replace(/^#/, '');
    const children = getTagSet(tagSet[tag]?.children);
    for (let i = 0; i < terms.length; i += 1) {
      const term = terms[i];
      // don't untag anything if term is frozen
      if (term.frozen === true) {
        continue
      }
      const previous = debug$4.tags ? debug$4.before(term) : null;
      // support clearing all tags, with '*'
      if (tag === '*') {
        term.tags.clear();
        if (previous) {
          debug$4.log(term, previous, reason);
        }
        continue
      }
      // removing #Verb should also remove #PastTense
      if (children.size > 0) {
        for (const existing of term.tags) {
          if (children.has(existing)) {
            term.tags.delete(existing);
          }
        }
      }
      term.tags.delete(tag);
      if (previous) {
        debug$4.log(term, previous, reason);
      }
    }
  };

  // quick check if this tag will require any untagging
  const canBe = function (term, tag, tagSet) {
    if (!Object.hasOwn(tagSet, tag)) {
      return true // everything can be an unknown tag
    }
    const conflicts = getTagSet(tagSet[tag].not);
    if (conflicts.size === 0) {
      return true
    }
    for (const existing of term.tags) {
      if (conflicts.has(existing)) {
        return false
      }
    }
    return true
  };

  const validate$1 = function (node) {
    node.children = node.children || [];
    node._cache = node._cache || {};
    node.props = node.props || {};
    node._cache.parents = node._cache.parents || [];
    return node
  };

  // Iterative DFS keeps deep inputs safe and distinguishes shared nodes from cycles.
  const checkCycles = roots => {
    const states = new Map();
    const stack = roots.map(node => [node, false]);
    for (; stack.length > 0;) {
      const [node, done] = stack.pop();
      if (done) {
        states.set(node, 2);
      } else if (states.get(node) === 1) {
        throw new Error('[Grad] - cyclic input')
      } else if (!states.has(node)) {
        states.set(node, 1);
        stack.push([node, true]);
        for (const child of node.children || []) {
          stack.push([child, false]);
        }
      }
    }
    return states.keys()
  };

  // turn parent-index rows into nested json
  const fromArray = function (rows) {
    const index = new Map();
    // addTags allocates these rows for this graph, so initialize them in place.
    rows.forEach(node => {
      validate$1(node);
      index.set(node.id, node);
    });
    const root = validate$1({});
    rows.forEach(node => {
      if (node.parent) {
        if (index.has(node.parent)) {
          const parent = index.get(node.parent);
          delete node.parent; //no-longer needed
          parent.children.push(node);
        } else {
          console.warn(`[Grad] - missing node '${node.parent}'`); // eslint-disable-line no-console
        }
        return
      }
      // no parent, add it to root
      root.children.push(node);
    });
    checkCycles(rows);
    return root
  };

  // [a, a1, b, b1]
  // Visitor-only callers can skip collecting nodes.
  const byDepth = (root, fn, collect = true) => {
    const list = collect ? [] : null;
    const queue = [root];
    for (; queue.length > 0;) {
      // get first
      const node = queue.pop();
      if (collect) {
        list.push(node);
      }
      // add kids to queue
      if (node.children) {
        for (let i = node.children.length - 1; i >= 0; i -= 1) {
          const child = node.children[i];
          if (fn) {
            fn(node, child);
          }
          queue.push(child);
        }
      }
    }
    return list
  };

  // Fresh graph nodes already have empty caches; fill ancestors in root-to-parent order.
  const cacheParents = root => {
    byDepth(root, (parent, child) => {
      if (parent.id) {
        child._cache.parents = parent._cache.parents.concat([parent.id]);
      }
    }, false);
  };

  // addTags supplies only exclusions, additional parents, and these scalar flags.
  const inherit = (props, parent) => {
    if (parent.not) {
      props.not = new Set([...props.not, ...parent.not]);
    }
    if (Array.isArray(parent.also) && (props.also === undefined || Array.isArray(props.also))) {
      props.also = parent.also.concat(props.also || []);
    } else if (props.also === undefined) {
      props.also = parent.also;
    }
    if (props.is === undefined) {
      props.is = parent.is;
    }
    if (props.novel === undefined) {
      props.novel = parent.novel;
    }
    return props
  };

  const fillDown = root => {
    byDepth(root, (parent, child) => {
      child.props = inherit(child.props, parent.props);
    }, false);
  };

  // https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color

  const reset$1 = '\x1b[0m';
  //cheaper than requiring chalk
  const cli$1 = {
    // green: str => '\x1b[32m' + str + reset,
    red: str => '\x1b[31m' + str + reset$1,
    // blue: str => '\x1b[34m' + str + reset,
    // magenta: str => '\x1b[35m' + str + reset,
    // cyan: str => '\x1b[36m' + str + reset,
    // yellow: str => '\x1b[33m' + str + reset,
    // black: str => '\x1b[30m' + str + reset,
    dim: str => '\x1b[2m' + str + reset$1,
  };

  const indent = '    ';

  const toText = function (json, color) {
    let arrow = '-> ';
    if (color) {
      arrow = cli$1.dim('→ ');
    }
    let txt = '';
    const rows = byDepth(json);
    rows.forEach((node, i) => {
      let label = node.id || '';
      if (color) {
        label = cli$1.red(label);
      }
      if (i === 0 && !node.id) {
        return //skip empty root
      }
      const depth = node._cache.parents.length;
      txt += indent.repeat(depth) + arrow + label + '\n';
    });
    return txt
  };

  const toArray$1 = function (json) {
    // The tag formatter only reads these graph-owned nodes.
    const nodes = byDepth(json);
    // should we show the root?
    const root = nodes[0];
    if (root && !root.id && Object.keys(root.props).length === 0) {
      nodes.shift();
    }
    return nodes
  };

  // Keep this dispatch intact: an array-only version regresses V8 benchmarks.
  const fmts = {
    text: toText,
    txt: toText,
    array: toArray$1,
    flat: toArray$1,
  };

  const out = function (root, label) {
    // return internal json
    if (label === 'nested' || label === 'json') {
      return root
    }
    if (label === 'debug') {
      console.log(toText(root, true)); // eslint-disable-line no-console
      return null
    }
    if (fmts.hasOwnProperty(label)) {
      return fmts[label](root)
    }
    return root
  };

  // The tag-inheritance subset of grad-school;
  // https://github.com/spencermountain/grad-school

  class Graph {
    constructor(json) {
      Object.defineProperty(this, 'json', {
        enumerable: false,
        value: json,
        writable: true,
      });
    }
    cache() {
      cacheParents(this.json);
      return this
    }
    fillDown() {
      fillDown(this.json);
      return this
    }
    out(fmt) {
      // fillDown changes properties, so the cached graph relationships still hold.
      return out(this.json, fmt)
    }
  }

  const graph = rows => new Graph(fromArray(rows));

  // i just made these up
  const colors = {
    Noun: 'blue',
    Verb: 'green',
    Negative: 'green',
    Date: 'red',
    Value: 'red',
    Adjective: 'magenta',
    Connector: 'cyan',
    Determiner: 'cyan',
    Hyphenated: 'cyan',
    Adverb: 'cyan',
  };

  const getColor = function (node) {
    if (Object.hasOwn(colors, node.id)) {
      return colors[node.id]
    }
    if (Object.hasOwn(colors, node.is)) {
      return colors[node.is]
    }
    const found = node._cache.parents.find(c => colors[c]);
    return colors[found]
  };

  // convert tags to our final format
  const fmt = function (nodes) {
    const res = {};
    nodes.forEach(node => {
      const { not, also, is, novel } = node.props;
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
        children: [],
        color: getColor(node),
        // Retain the preferred output name for legacy model consumers.
        alias: node.aliases === undefined ? node.alias : node.aliases[0],
        aliases: node.aliases,
      };
    });
    // `also` is another inheritance edge. Resolve its ancestors before building
    // reverse edges, so removing any parent also removes all dependent tags.
    const resolved = new Set();
    const resolving = new Set();
    const resolveParents = function (tag) {
      if (resolved.has(tag)) {
        return res[tag].parents
      }
      if (resolving.has(tag)) {
        throw new Error(`compromise: cyclic tag inheritance at '${tag}'`)
      }
      resolving.add(tag);
      const parents = new Set();
      res[tag].parents.forEach(parent => {
        if (res[parent]) {
          resolveParents(parent).forEach(ancestor => parents.add(ancestor));
        }
        parents.add(parent);
      });
      res[tag].parents = Array.from(parents);
      resolving.delete(tag);
      resolved.add(tag);
      return res[tag].parents
    };
    Object.keys(res).forEach(tag => resolveParents(tag));
    Object.keys(res).forEach(tag => {
      res[tag].parents.forEach(parent => {
        if (res[parent]) {
          res[parent].children.push(tag);
        }
      });
    });

    // Inherit exclusions through every parent, then exclude all descendants of
    // each conflicting tag. Read a snapshot to keep this independent of order.
    const exclusions = {};
    Object.keys(res).forEach(tag => { exclusions[tag] = res[tag].not; });
    Object.keys(res).forEach(k => {
      const nots = new Set(exclusions[k]);
      res[k].parents.forEach(parent => {
        for (const not of exclusions[parent] || []) {
          nots.add(not);
        }
      });
      Array.from(nots).forEach(not => {
        if (res[not]) {
          res[not].children.forEach(tag => nots.add(tag));
        }
      });
      res[k].not = Array.from(nots);
      getTagSet(res[k].not);
      getTagSet(res[k].children);
      // Keep accepting custom definitions, but flag impossible combinations once
      // per tag, after both inheritance and reciprocal exclusions are resolved.
      const conflicts = [k, ...res[k].parents].filter(tag => nots.has(tag));
      if (conflicts.length > 0) {
        const names = conflicts.map(tag => `#${tag}`).join(', ');
        console.warn(`compromise: contradictory tag '#${k}' requires and excludes: ${names}`); // eslint-disable-line no-console
      }
    });
    return res
  };

  // Compile once per registration. Real tag names always take precedence.
  const compileAliases = (tags, normalize) => {
    const aliases = Object.create(null);
    Object.keys(tags).forEach(tag => { aliases[tag] = tag; });
    Object.keys(tags).forEach(tag => {
      const entry = tags[tag];
      const names = entry.aliases === undefined ? [entry.alias] : [entry.aliases].flat();
      names.forEach(name => {
        if (name === null || name === undefined) {
          return
        }
        if (typeof name !== 'string' || !/^[\p{L}_][\p{L}\p{M}\p{N}_-]*$/u.test(name)) {
          throw new Error(`compromise: invalid alias for '#${tag}'`)
        }
        // Match strings undergo Unicode normalization before parsing.
        const spellings = normalize ? [name, normalize(name)] : [name];
        spellings.forEach(spelling => {
          if (Object.hasOwn(tags, spelling)) {
            if (spelling !== name && spelling !== tag) {
              throw new Error(`compromise: tag alias '${name}' normalizes to '#${spelling}'`)
            }
            return
          }
          if (aliases[spelling] && aliases[spelling] !== tag) {
            throw new Error(`compromise: duplicate tag alias '${spelling}'`)
          }
          aliases[spelling] = tag;
        });
      });
    });
    return aliases
  };

  const toArr = function (input) {
    if (!input) {
      return []
    }
    if (typeof input === 'string') {
      return [input]
    }
    return input.slice()
  };

  const addImplied = function (tags) {
    const aliases = compileAliases(tags);
    const resolve = tag => aliases[tag] || tag;
    Object.keys(tags).forEach(k => {
      // support deprecated fmts
      if (tags[k].isA) {
        tags[k].is = tags[k].isA;
      }
      if (tags[k].notA) {
        tags[k].not = tags[k].notA;
      }
      if (typeof tags[k].is === 'string') {
        tags[k].is = resolve(tags[k].is);
      }
      if (tags[k].also) {
        tags[k].also = toArr(tags[k].also).map(resolve);
      }
      if (tags[k].not) {
        tags[k].not = toArr(tags[k].not).map(resolve);
      }
      // add any implicit 'is' tags
      if (tags[k].is && typeof tags[k].is === 'string') {
        if (!Object.hasOwn(tags, tags[k].is)) {
          tags[tags[k].is] = {};
        }
      }
      // Additional parents need entries too, including parents introduced by plugins.
      toArr(tags[k].also).forEach(parent => {
        if (!Object.hasOwn(tags, parent)) {
          tags[parent] = {};
        }
      });
      // add any implicit 'not' tags
      toArr(tags[k].not).forEach(excluded => {
        if (!Object.hasOwn(tags, excluded)) {
          tags[excluded] = {};
        }
      });
    });
    return tags
  };


  const validate = function (tags, already) {
    // Reciprocal links must reach previously registered tags too. Copy entries
    // before normalization so the existing compiled model remains untouched.
    tags = Object.fromEntries(Object.keys({ ...already, ...tags }).map(tag => [tag, { ...already[tag], ...tags[tag] }]));
    tags = addImplied(tags);

    // property validation
    Object.keys(tags).forEach(k => {
      if (tags[k].aliases !== undefined) {
        tags[k].aliases = toArr(tags[k].aliases);
      }
      tags[k].children = toArr(tags[k].children);
      tags[k].not = toArr(tags[k].not);
      if (tags[k].also) {
        tags[k].also = toArr(tags[k].also);
      }
    });
    // not links are bi-directional
    // add any incoming not tags
    Object.keys(tags).forEach(k => {
      const nots = tags[k].not || [];
      nots.forEach(no => {
        if (tags[no] && tags[no].not && !tags[no].not.includes(k)) {
          tags[no].not.push(k);
        }
      });
    });
    return tags
  };

  // 'fill-down' parent logic inference
  const compute$2 = function (allTags) {
    // setup graph-lib format
    const flatList = Object.keys(allTags).map(k => {
      const o = allTags[k];
      const props = { not: new Set(o.not), also: o.also, is: o.is, novel: o.novel };
      return { id: k, parent: o.is, props, children: [], alias: o.alias, aliases: o.aliases?.slice() }
    });
    const graph$1 = graph(flatList).cache().fillDown();
    return graph$1.out('array')
  };

  const fromUser = function (tags) {
    Object.keys(tags).forEach(k => {
      tags[k] = { ...tags[k] };
      tags[k].novel = true;
    });
    return tags
  };

  const addTags$1 = function (tags, already) {
    // Normalization owns its definitions, including when callers reuse a tagset.
    tags = Object.fromEntries(Object.entries(tags).map(([tag, definition]) => [tag, { ...definition }]));
    // are these tags internal ones, or user-generated?
    if (Object.keys(already).length > 0) {
      tags = fromUser(tags);
    }
    tags = validate(tags, already);

    // do some basic setting-up
    // 'fill-down' parent logic
    const nodes = compute$2(tags);
    // convert it to our final format
    const res = fmt(nodes);
    return res
  };

  var methods$4 = {
    one: {
      setTag,
      unTag,
      addTags: addTags$1,
      canBe,
    },
  };

  /* eslint no-console: 0 */

  const fns = {
    /** add a given tag, to all these terms */
    tag: function (input, reason = '', isSafe) {
      if (!this.found || !input) {
        return this
      }
      const terms = this.termList();
      if (terms.length === 0) {
        return this
      }
      const { methods, verbose, world } = this;
      // logger
      if (verbose === true) {
        console.log(' +  ', input, reason || '');
      }
      if (Array.isArray(input)) {
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
      const terms = this.termList();
      if (terms.length === 0) {
        return this
      }
      const { methods, verbose, model } = this;
      // logger
      if (verbose === true) {
        console.log(' -  ', input, reason || '');
      }
      const tagSet = model.one.tagSet;
      const resolve = tag => {
        tag = tag.trim().replace(/^#/, '');
        return model.one.tagAliases[tag] || tag
      };
      if (Array.isArray(input)) {
        input.forEach(tag => methods.one.unTag(terms, resolve(tag), tagSet, reason));
      } else {
        methods.one.unTag(terms, resolve(input), tagSet, reason);
      }
      // uncache
      this.uncache();
      return this
    },

    /** return only the terms that can be this tag  */
    canBe: function (tag) {
      tag = tag.replace(/^#/, '');
      tag = this.model.one.tagAliases[tag] || tag;
      const tagSet = this.model.one.tagSet;
      const canBe = this.methods.one.canBe;
      const nope = [];
      this.document.forEach((terms, n) => {
        terms.forEach((term, i) => {
          if (!canBe(term, tag, tagSet)) {
            nope.push([n, i, i + 1]);
          }
        });
      });
      const noDoc = this.update(nope);
      return this.difference(noDoc)
    },
  };

  const tagAPI = function (View) {
    Object.assign(View.prototype, fns);
  };

  // wire-up more pos-tags to our model
  const addTags = function (tags) {
    const world = this.world();
    const { model, methods } = world;
    const tagSet = model.one.tagSet;
    const fn = methods.one.addTags;
    const res = fn(tags, tagSet);
    const aliases = compileAliases(res, name => methods.one.killUnicode(name, world));
    model.one.tagSet = res;
    model.one.tagAliases = aliases;
    return this
  };

  var lib$1 = { addTags };

  const boringTags = new Set(['Auxiliary', 'Possessive']);

  const sortByKids = function (tags, tagSet) {
    tags = tags.sort((a, b) => {
      // (unknown tags are interesting)
      if (boringTags.has(a) || !Object.hasOwn(tagSet, b)) {
        return 1
      }
      if (boringTags.has(b) || !Object.hasOwn(tagSet, a)) {
        return -1
      }
      let kids = tagSet[a].children || [];
      const aKids = kids.length;
      kids = tagSet[b].children || [];
      const bKids = kids.length;
      return aKids - bKids
    });
    return tags
  };

  const tagRank = function (view) {
    const { document, world } = view;
    const tagSet = world.model.one.tagSet;
    document.forEach(terms => {
      terms.forEach(term => {
        const tags = Array.from(term.tags);
        term.tagRank = sortByKids(tags, tagSet);
      });
    });
  };

  var tag = {
    model: {
      one: { tagSet: {}, tagAliases: Object.create(null) }
    },
    compute: {
      tagRank
    },
    methods: methods$4,
    api: tagAPI,
    lib: lib$1
  };

  // Scan punctuation runs once. Searching for an unanchored run followed by
  // whitespace repeatedly rescans long runs that have no following whitespace.
  const stops = new Set('.!?\u203D\u2E18\u203C\u2047\u2048\u2049\u0964\u0965\u061F\u06D4\u0589\u1362\u1367\u104B\u17D4\u3002');
  const cjkStops = new Set('。！？｡');
  const openers$1 = new Set('「『（【〔《〈“');
  const closers = new Set('」』）】〕》〉”');
  const whitespace = /\s/;
  const splitsOnly = /^[.!?‽⸘‼\u2047-\u2049।॥؟۔։።፧။។。]+\s$/;
  const splitsOnlyCjk = /^(?:[.!?‽⸘‼\u2047-\u2049।॥؟۔։።፧။។。！？｡]+\s|[。！？｡]+[」』）】〕》〉”]*)$/;
  const newLine = /((?:\r?\n|\r)+)/;

  const basicSplit = function (text) {
    const all = [];
    const isCjk = /[。！？｡]/.test(text);
    const activeStops = isCjk ? new Set([...stops, ...cjkStops]) : stops;
    for (const line of text.split(newLine)) {
      let start = 0;
      const arr = [];
      const emit = (from, end) => {
        arr.push(line.slice(start, from), line.slice(from, end));
        start = end;
      };
      let i = 0;
      while (i < line.length) {
        if (!activeStops.has(line[i])) {
          i++;
          continue
        }
        const runStart = i;
        while (i < line.length && activeStops.has(line[i])) i++;
        if (i < line.length && whitespace.test(line[i])) {
          emit(runStart, i + 1);
          i++;
          continue
        }
        if (!isCjk) continue
        // A CJK stop ends a sentence without whitespace. Following closing quotes
        // only end it when followed by whitespace, another opener, or end of text.
        let j = runStart;
        while (j < i) {
          if (!cjkStops.has(line[j])) {
            j++;
            continue
          }
          const from = j;
          while (j < i && cjkStops.has(line[j])) j++;
          let end = j;
          while (end < line.length && closers.has(line[end])) end++;
          if (end === j || end === line.length || whitespace.test(line[end]) || openers$1.has(line[end])) {
            emit(from, end);
            if (end > i) i = end;
          }
        }
      }
      arr.push(line.slice(start));
      // Preserve the existing merge behavior, including punctuation-only pieces.
      for (let k = 0; k < arr.length; k++) {
        const next = arr[k + 1];
        if (next && (isCjk ? splitsOnlyCjk : splitsOnly).test(next)) {
          arr[k] += next;
          arr[k + 1] = '';
        }
        if (arr[k]) all.push(arr[k]);
      }
    }
    return all
  };

  // a letter, number, or symbol/emoji in any script - otherwise it's only punctuation
  const hasLetter$1 = /[\p{L}\p{N}\p{So}]/u;
  const hasSomething$1 = /\S/;

  const notEmpty = function (splits) {
    const chunks = [];
    for (let i = 0; i < splits.length; i++) {
      const s = splits[i];
      if (s === undefined || s === '') {
        continue
      }
      //this is meaningful whitespace
      if (hasSomething$1.test(s) === false || hasLetter$1.test(s) === false) {
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

  const hasNewline = function (c) {
    return Boolean(/\n$/.test(c))
  };

  //loop through these chunks, and join the non-sentence chunks back together..
  const smartMerge = function (chunks, world) {
    const isSentence = world.methods.one.tokenize.isSentence;
    const abbrevs = world.model.one.abbreviations || new Set();

    const sentences = [];
    for (let i = 0; i < chunks.length; i++) {
      const c = chunks[i];
      //should this chunk be combined with the next one?
      if (chunks[i + 1] && !isSentence(c, abbrevs) && !hasNewline(c)) {
        chunks[i + 1] = c + (chunks[i + 1] || '');
      } else if (c && c.length > 0) {
        //this chunk is a proper sentence..
        sentences.push(c);
        chunks[i] = '';
      }
    }
    return sentences
  };

  /* eslint-disable regexp/no-dupe-characters-character-class */

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
    '\u300C': '\u300D', // 'CornerBrackets' 「」
    '\u300E': '\u300F', // 'WhiteCornerBrackets' 『』
  };
  const openQuote = RegExp('[' + Object.keys(pairs).join('') + ']', 'g');
  const closeQuote = RegExp('[' + Object.values(pairs).join('') + ']', 'g');

  const closesQuote = function (str) {
    if (!str) {
      return false
    }
    const m = str.match(closeQuote);
    if (m !== null && m.length === 1) {
      return true
    }
    return false
  };

  // allow micro-sentences when inside a quotation, like:
  // the doc said "no sir. i will not beg" and walked away.
  const quoteMerge = function (splits) {
    const arr = [];
    for (let i = 0; i < splits.length; i += 1) {
      const split = splits[i];
      // do we have an open-quote and not a closed one?
      const m = split.match(openQuote);
      if (m !== null && m.length === 1) {
        // is the quote already closed in this chunk? - '“Yes!” said Tom. “No!” said Ann.'
        const closed = split.match(closeQuote);
        if (closed !== null && closed[0] !== m[0]) {
          arr.push(split);
          continue
        }

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
          const toAdd = splits[i + 1] + splits[i + 2];// merge them all
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

  const MAX_LEN = 250;// ¯\_(ツ)_/¯

  // support unicode variants?
  // https://stackoverflow.com/questions/13535172/list-of-all-unicodes-open-close-brackets
  const hasOpen = /[(\uFF08]/g;
  const hasClosed = /[)\uFF09]/g;
  const mergeParens = function (splits) {
    const arr = [];
    for (let i = 0; i < splits.length; i += 1) {
      const split = splits[i];
      const m = split.match(hasOpen);
      if (m !== null && m.length === 1) {
        // look at next sentence, for closing parenthesis
        if (splits[i + 1] && splits[i + 1].length < MAX_LEN) {
          const m2 = splits[i + 1].match(hasClosed);
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

  //(Rule-based sentence boundary segmentation) - chop given text into its proper sentences.
  // Ignore periods/questions/exclamations used in acronyms/abbreviations/numbers, etc.
  //regs-
  const hasSomething = /\S/;
  const startWhitespace = /^\s+/;

  const splitSentences = function (text, world) {
    text ||= '';
    text = String(text);
    // Ensure it 'smells like' a sentence
    if (!text || typeof text !== 'string' || hasSomething.test(text) === false) {
      return []
    }
    // First do a greedy-split..
    const splits = basicSplit(text);
    // Filter-out the crap ones
    let sentences = notEmpty(splits);
    //detection of non-sentence chunks:
    sentences = smartMerge(sentences, world);
    // allow 'he said "no sir." and left.'
    sentences = quoteMerge(sentences);
    // allow 'i thought (no way!) and left.'
    sentences = mergeParens(sentences);
    //if we never got a sentence, return the given text
    if (sentences.length === 0) {
      return [text]
    }
    //move whitespace to the ends of sentences, when possible
    //['hello',' world'] -> ['hello ','world']
    for (let i = 1; i < sentences.length; i += 1) {
      const ws = sentences[i].match(startWhitespace);
      if (ws !== null) {
        sentences[i - 1] += ws[0];
        sentences[i] = sentences[i].replace(startWhitespace, '');
      }
    }
    return sentences
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

  const wordlike = /\S/;
  const isBoundary = /^[!?.]+$/;
  const naiiveSplit = /(\S+)/;

  let notWord = [
    '.',
    '?',
    '!',
    ':',
    ';',
    '-',
    '–',
    '—',
    '--',
    '...',
    '(',
    ')',
    '[',
    ']',
    '"',
    "'",
    '`',
    '«',
    '»',
    '*',
    '•',
  ];
  notWord = notWord.reduce((h, c) => {
    h[c] = true;
    return h
  }, {});

  //turn a string into an array of strings (naiive for now, lumped later)
  const splitWords = function (str, model) {
    let result = [];
    let arr = [];
    //start with a naiive split
    str ||= '';
    if (typeof str === 'number') {
      str = String(str);
    }
    if (Array.isArray(str)) {
      return str
    }
    const words = str.split(naiiveSplit);
    for (let i = 0; i < words.length; i++) {
      //split 'one-two'
      if (hasHyphen$1(words[i], model) === true) {
        arr = arr.concat(splitHyphens$1(words[i]));
        continue
      }
      arr.push(words[i]);
    }
    //greedy merge whitespace+arr to the right
    let carry = '';
    for (let i = 0; i < arr.length; i++) {
      const word = arr[i];
      //if it's more than a whitespace
      if (wordlike.test(word) === true && Object.hasOwn(notWord, word) === false && isBoundary.test(word) === false) {
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
    result = combineSlashes(result);
    result = combineRanges(result);
    // remove empty results
    result = result.filter(s => s);
    return result
  };

  //all punctuation marks, from https://en.wikipedia.org/wiki/Punctuation

  //we have slightly different rules for start/end - like #hashtags.
  const isLetter = /\p{Letter}/u;
  const isNumber$1 = /[\p{Number}\p{Currency_Symbol}]/u;
  const hasAcronym = /^[a-z]\.([a-z]\.)+/i;
  const chillin = /[sn]['’]$/;
  const isFullNumber = /^[(+\-]?\d+(th|st|nd|rd)?[)+\-]?$/;
  const openers = { ')': '(', ']': '[', '}': '{' };

  // does this closing bracket close one inside the word, like 'foo(bar)'
  const closesInside = function (chars, start, end) {
    const close = chars[end - 1];
    let depth = 0;
    for (let i = start; i < end - 1; i += 1) {
      if (chars[i] === openers[close]) {
        depth += 1;
      } else if (chars[i] === close) {
        depth -= 1;
      }
    }
    return depth > 0
  };

  const normalizePunctuation = function (str, model) {
    // quick lookup for allowed pre/post punctuation
    const { prePunctuation, postPunctuation, emoticons } = model.one;
    const original = str;
    let pre = '';
    let post = '';
    const chars = Array.from(str);
    let start = 0;
    let end = chars.length;

    // punctuation-only words, like '<3'
    if (Object.hasOwn(emoticons, str.trim())) {
      return { str: str.trim(), pre, post: ' ' } //not great
    }

    // Locate the first retained code point without shifting the array.
    while (start < end) {
      const c = chars[start];
      // keep any declared chars
      if (prePunctuation[c] === true) {
        break//keep it
      }
      // keep '+' or '-' only before a number
      if ((c === '+' || c === '-' || c === '(') && isFullNumber.test(str.trim())) {
        break//done
      }
      // '97 - year short-form
      if (c === "'" && c.length === 3 && isNumber$1.test(chars[start + 1])) {
        break//done
      }
      // start of word
      if (isLetter.test(c) || isNumber$1.test(c)) {
        break //done
      }
      // punctuation
      start++;
    }

    // Locate the last retained code point.
    while (end > start) {
      const c = chars[end - 1];
      // keep any declared chars
      if (postPunctuation[c] === true) {
        break//keep it
      }
      // start of word
      if (isLetter.test(c) || isNumber$1.test(c)) {
        break //done
      }
      // F.B.I.
      if (c === '.' && hasAcronym.test(original) === true) {
        break//keep it
      }
      //  keep s-apostrophe - "flanders'" or "chillin'"
      if (c === "'" && chillin.test(original) === true) {
        break//keep it
      }
      // keep '+' or ')' only for a number like (800) or 500+
      if ((c === '+' || c === ')') && isFullNumber.test(str.trim())) {
        break//done
      }
      if (Object.hasOwn(openers, c) && closesInside(chars, start, end)) {
        break//keep it
      }
      // punctuation
      end--;
    }
    pre = chars.slice(0, start).join('');
    post = chars.slice(end).join('');
    str = chars.slice(start, end).join('');
    //we went too far..
    if (str === '') {
      // do a very mild parse, and hope for the best.
      let last = original.length;
      while (last > 0 && original[last - 1] === ' ') last--;
      post = original.slice(last);
      str = original.slice(0, last);
      pre = '';
    }
    return { str, pre, post }
  };

  const parseTerm = (txt, model) => {
    // cleanup any punctuation as whitespace
    const { str, pre, post } = normalizePunctuation(txt, model);
    const parsed = {
      text: str,
      pre: pre,
      post: post,
      tags: new Set(),
    };
    return parsed
  };

  // 'Björk' to 'Bjork'.
  const killUnicode = function (str, world) {
    const unicode = world.model.one.unicode || {};
    str ||= '';
    const chars = str.split('');
    chars.forEach((s, i) => {
      if (unicode[s]) {
        chars[i] = unicode[s];
      }
    });
    return chars.join('')
  };

  // Inspect the trailing run once, including when punctuation occurs internally.
  const trimPunctuation = (str, punctuation) => {
    let end = str.length;
    while (end > 0 && punctuation.test(str[end - 1])) end--;
    return str.slice(0, end)
  };

  /** some basic operations on a string to reduce noise */
  const clean = function (str) {
    str ||= '';
    str = str.toLowerCase();
    str = str.trim();
    const original = str;
    //punctuation
    str = trimPunctuation(str, /[,;.!?]/);
    //coerce Unicode ellipses
    str = str.replaceAll('…', '...');
    //en-dash
    str = str.replaceAll('–', '-');
    //strip leading & trailing grammatical punctuation
    if (/^[:;]/.test(str) === false) {
      str = trimPunctuation(str, /[",.!:;?)]/);
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

  // do acronyms need to be ASCII?  ... kind of?
  const periodAcronym = /^([A-Z]\.)+[A-Z]?,?$/;
  const oneLetterAcronym = /^[A-Z]\.,?$/;
  const noPeriodAcronym = /^[A-Z]{2,}('s|,)?$/;
  const lowerCaseAcronym = /^([a-z]\.)+[a-z]\.?$/;

  const isAcronym$1 = function (str) {
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
    if (isAcronym$1(str)) {
      str = str.replace(/\./g, '');
    }
    return str
  };

  const normalize = function (term, world) {
    const killUnicode = world.methods.one.killUnicode;
    // console.log(world.methods.one)
    let str = term.text || '';
    str = clean(str);
    //(very) rough ASCII transliteration -  bjŏrk -> bjork
    str = killUnicode(str, world);
    str = doAcronym(str);
    term.normal = str;
  };

  // turn a string input into a 'document' json format
  const parse$1 = function (input, world) {
    const { methods, model } = world;
    const { splitSentences, splitTerms, splitWhitespace } = methods.one.tokenize;
    input ||= '';
    // split into sentences
    const sentences = splitSentences(input, world);
    // split into word objects
    input = sentences.map((txt) => {
      let terms = splitTerms(txt, model);
      // split into [pre-text-post]
      terms = terms.map(t => splitWhitespace(t, model));
      // add normalized term format, always
      terms.forEach((t) => {
        normalize(t, world);
      });
      return terms
    });
    return input
  };

  const isAcronym = /[ .][A-Z]\.? *$/i; //asci - 'n.s.a.'
  const hasEllipse = /(?:\u2026|\.{2}) *$/; // '...'
  const hasLetter = /\p{L}/u;
  const hasPeriod = /\. *$/;
  const leadInit = /^[A-Z]\. $/; // "W. Kensington"

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
    // check for leading initial - "W. Kensington"
    if (str.length === 3 && leadInit.test(str)) {
      return false
    }
    //check for '...'
    if (hasEllipse.test(str) === true) {
      return false
    }
    const txt = str.replace(/[.!?\u203D\u2E18\u203C\u2047-\u2049] *$/, '');
    const words = txt.split(' ');
    const lastWord = words[words.length - 1].toLowerCase();
    // check for 'Mr.' (and not mr?)
    if (Object.hasOwn(abbrevs, lastWord) === true && hasPeriod.test(str) === true) {
      return false
    }
    // //check for jeopardy!
    // if (blacklist.hasOwnProperty(lastWord)) {
    //   return false
    // }
    return true
  };

  var methods$3 = {
    one: {
      killUnicode,
      tokenize: {
        splitSentences,
        isSentence,
        splitTerms: splitWords,
        splitWhitespace: parseTerm,
        fromString: parse$1,
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

  var misc$1 = [
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
  const list = [
    [misc$1],
    [units, 'Unit'],
    [nouns$1, 'Noun'],
    [honorifics, 'Honorific'],
    [months, 'Month'],
    [organizations, 'Organization'],
    [places, 'Place'],
  ];
  // create key-val for sentence-tokenizer
  const abbreviations = {};
  // add them to a future lexicon
  const lexicon$3 = {};

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
  const compact = {
    '!': '¡',
    '?': '¿Ɂ',
    '"': '“”"❝❞',
    "'": '‘‛❛❜’',
    '-': '—–',
    a: 'ªÀÁÂÃÄÅàáâãäåĀāĂăĄąǍǎǞǟǠǡǺǻȀȁȂȃȦȧȺΆΑΔΛάαλАаѦѧӐӑӒӓƛæ',
    b: 'ßþƀƁƂƃƄƅɃΒβϐϦБВЪЬвъьѢѣҌҍ',
    c: '¢©ÇçĆćĈĉĊċČčƆƇƈȻȼͻͼϲϹϽϾСсєҀҁҪҫ',
    d: 'ÐĎďĐđƉƊȡƋƌ',
    e: 'ÈÉÊËèéêëĒēĔĕĖėĘęĚěƐȄȅȆȇȨȩɆɇΈΕΞΣέεξϵЀЁЕеѐёҼҽҾҿӖӗễ',
    f: 'ƑƒϜϝӺӻҒғſ',
    g: 'ĜĝĞğĠġĢģƓǤǥǦǧǴǵ',
    h: 'ĤĥĦħƕǶȞȟΉΗЂЊЋНнђћҢңҤҥҺһӉӊ',
    I: 'ÌÍÎÏ',
    i: 'ìíîïĨĩĪīĬĭĮįİıƖƗȈȉȊȋΊΐΪίιϊІЇіїi̇',
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
  const unicode = {};
  Object.keys(compact).forEach(function (k) {
    compact[k].split('').forEach(function (s) {
      unicode[s] = k;
    });
  });
  // fullwidth ascii - 'Ｈｅｌｌｏ ２０２４' to 'Hello 2024'
  for (let i = 0x21; i <= 0x7E; i += 1) {
    unicode[String.fromCharCode(i + 0xFEE0)] = String.fromCharCode(i);
  }

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
      aliases,
      abbreviations,
      prefixes: prefixes$1,
      suffixes: suffixes$2,
      prePunctuation,
      postPunctuation,
      lexicon: lexicon$3, //give this one forward
      unicode,
      emoticons
    },
  };

  const hasSlash = /\//;
  const hasDomain = /[a-z]\.[a-z]/i;
  const isMath = /[0-9]/;
  // const hasSlash = /[a-z\u00C0-\u00FF] ?\/ ?[a-z\u00C0-\u00FF]/
  // const hasApostrophe = /['’]s$/

  const addAliases = function (term, world) {
    const str = term.normal || term.text || term.machine;
    const aliases = world.model.one.aliases;
    // lookup known aliases like '&'
    if (Object.hasOwn(aliases, str)) {
      term.alias ||= [];
      term.alias.push(aliases[str]);
    }
    // support slashes as aliases
    if (hasSlash.test(str) && !hasDomain.test(str) && !isMath.test(str)) {
      const arr = str.split(hasSlash);
      // don't split urls and things
      if (arr.length <= 3) {
        arr.forEach(word => {
          word = word.trim();
          if (word !== '') {
            term.alias ||= [];
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

  // sort words by frequency
  const freq = function (view) {
    const docs = view.docs;
    const counts = Object.create(null);
    for (let i = 0; i < docs.length; i += 1) {
      for (let t = 0; t < docs[i].length; t += 1) {
        const term = docs[i][t];
        const word = term.machine || term.normal;
        counts[word] ??= 0;
        counts[word] += 1;
      }
    }
    // add counts on each term
    for (let i = 0; i < docs.length; i += 1) {
      for (let t = 0; t < docs[i].length; t += 1) {
        const term = docs[i][t];
        const word = term.machine || term.normal;
        term.freq = counts[word];
      }
    }
  };

  // get all character startings in doc
  const offset = function (view) {
    let elapsed = 0;
    let index = 0;
    const docs = view.document; //start from the actual-top
    for (let i = 0; i < docs.length; i += 1) {
      for (let t = 0; t < docs[i].length; t += 1) {
        const term = docs[i][t];
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

  // cheat- add the document's pointer to the terms
  const index = function (view) {
    // console.log('reindex')
    const document = view.document;
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

  const wordCount = function (view) {
    let n = 0;
    const docs = view.docs;
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

  // cheat-method for a quick loop
  const termLoop = function (view, fn) {
    const docs = view.docs;
    for (let i = 0; i < docs.length; i += 1) {
      for (let t = 0; t < docs[i].length; t += 1) {
        fn(docs[i][t], view.world);
      }
    }
  };

  const methods$2 = {
    alias: (view) => termLoop(view, addAliases),
    machine: (view) => termLoop(view, doMachine),
    normal: (view) => termLoop(view, normalize),
    freq,
    offset,
    index,
    wordCount,
  };

  var tokenize$2 = {
    compute: methods$2,
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
    const lastTerm = docs.at(-1)?.at(-1);
    // if we've already put whitespace, end.
    if (!lastTerm || lastTerm.post) {
      return
    }
    // if we found something
    if (Object.hasOwn(prefixes, lastTerm.normal)) {
      const found = prefixes[lastTerm.normal];
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
    const term = docs.at(-1)?.at(-1);
    if (term?.typeahead === true && term.machine) {
      term.text = term.machine;
      term.normal = term.machine;
    }
    return this
  };

  const api$3 = function (View) {
    View.prototype.autoFill = autoFill;
  };

  // generate all the possible prefixes up-front
  const getPrefixes = function (arr, opts, world) {
    let index = {};
    const collisions = [];
    const existing = world.prefixes || {};
    arr.forEach((str) => {
      str = str.toLowerCase().trim();
      let max = str.length;
      if (opts.max && max > opts.max) {
        max = opts.max;
      }
      for (let size = opts.min; size < max; size += 1) {
        const prefix = str.substring(0, size);
        // ensure prefix is not a word
        if (opts.safe && Object.hasOwn(world.model.one.lexicon, prefix)) {
          continue
        }
        // does it already exist?
        if (Object.hasOwn(existing, prefix) === true) {
          collisions.push(prefix);
          continue
        }
        if (Object.hasOwn(index, prefix) === true) {
          collisions.push(prefix);
          continue
        }
        index[prefix] = str;
      }
    });
    // merge with existing prefixes
    index = { ...existing, ...index };
    // remove ambiguous-prefixes
    collisions.forEach((str) => {
      delete index[str];
    });
    return index
  };

  const isObject = val => {
    return Object.prototype.toString.call(val) === '[object Object]'
  };

  const defaults = {
    safe: true,
    min: 3,
  };

  const prepare = function (words = [], opts = {}) {
    const model = this.model();
    opts = { ...defaults, ...opts };
    if (isObject(words)) {
      Object.assign(model.one.lexicon, words);
      words = Object.keys(words);
    }
    const prefixes = getPrefixes(words, opts, this.world());
    // manually combine these with any existing prefixes
    Object.keys(prefixes).forEach(str => {
      // explode any overlaps
      if (Object.hasOwn(model.one.typeahead, str)) {
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
    api: api$3,
    lib,
    compute: compute$1,
    hooks: ['typeahead']
  };

  // order here matters
  nlp.extend(change); //0kb
  nlp.extend(output$1); //0kb
  nlp.extend(match); //10kb
  nlp.extend(pointers); //2kb
  nlp.extend(tag); //2kb
  nlp.plugin(plugin); //~6kb
  nlp.extend(tokenize$2); //7kb
  nlp.extend(freeze); //
  nlp.plugin(cache$1); //~1kb
  nlp.extend(lookup); //7kb
  nlp.extend(typeahead); //1kb
  nlp.extend(lexicon$4); //1kb
  nlp.extend(sweep); //1kb

  // generated in ./lib/lexicon
  var lexData = {
    "City": "true¦:!1:#$%&()*+-./<=>?@[]:士富,くつ,勢伊,和大,幡八,ほか,わあ,みす,古宮,央中,濃美,珂那,芸安,豆伊,蔵武,後豊,日春,陸常;区36市0部区別特京東;いらみば$,かなちたひ,き33く),しよみ,じ*南,つむ,の32はきう,ば$,べない,)に,ま31+い,ら30りどみ,るがつ,わがか東,スプルア南,上2Z中2Y丹2X久2W亀丸,予2V井2U京2T仙2S代2R伯佐,佐2Q作美,保世佐,俣水,倉2P像宗,光2O児可,内2N出2M分大,別2L利足,前2K加草,%,北仙,十万四,南2J原2F取2E口2D-,台仙,吉2C名2B向日,吹笛,呂下,呉,咋羽,&2A唄美,喜久,国29土宇,坂須,坊御,垣28城27埼神,場殿御,堺,塚26#,多知,.25女八,好三,妻下,子24安浦,室根,宮23宿指,寄名,富弥,寺22尻塩,尾21屋1Z山1V岐1U岡1T島1Q崎1O嶋鹿,川1M州1K巣1J巻1I市1G布1F幌札,(1E平1D広帯,庄1C府1B座新,庭1A張19形山,後18御東,志17慈久,戸16所御,手15摩14敷13斐甲,斗北,方12於曽,日11早諫,旭10明豊,曲千,月大,木0Z本0Y村0X杜北,条0W来0V東0U杵臼,松0T板矢,林0S枝藤,柄足南,柏,栖0R根0Q梁高,梅青,條五,梨山,森青,槻高,樽小,橋0P次三,武山,歳千,毛宿,水0O江0N池菊,沢0M河0L治0K沼0J泉0I波0H津0F洲0E浜0D浦0C浪瑞,海0B添浦,渡0A温東,港境,湾野宜,満糸,滑常,潟新,潮八,/,瀬09燕,父08牧小07狩石,玉美小,<,理天,瑳匝,生06田01町00留都,畷條四,県山,真門,知高,石Z砂高,砺南,磐赤,社総,祢美,穂Y竈塩,立X童天,竹大,笠三,築杵,米W粟宍,総V縄沖,置日,美U羽鳥,能飯,脇西,良T芝香,=,若宮,茂加S草天R荘本利由,萌留,萩Q葉千,蕨,蘇阿,蘭室,街八,表之西,西P覇那,見O角鹿,訪諏,諸小,護名,谷N>,豊三,賀M走網,越L路K辺田J進日,道I達伊,那H郡G部F郷三,都E里D野A金東,門9間8関7阜岐,阪6陀宇,附見,陽5雄武,雲出,霞朝,面箕,須4館3馬2駒生,騨飛,高1鶴舞,鷲尾,鷹三,鹿0麻嘉;山,男,鈴;妙,日;対,相2E美;函,大;加,清;南,城;大23松;!一,下;中,串,入,座,笠;長,鳴;みじふ,るきあ,下,中,交,佐05大1嬉,小,志習,日,曇安,曳羽,木串きちい,熊,玉,秦,紫筑,良富,茅,?,裾,賀阿,遠,長0;!内河;!@;万伊,富,白網大;京,西;宇,[,矢小,綾,黒;小,蒲;伊,恵;尾,街四;!京;姫,淡,釧;上,川;伊,佐,加,古,敦,甲,須横;ヶ鎌,刈,千小,守,富,岡,深,熊,越;久津,北,#,新,氷,治多;加,印,川,愛,湖,筑;!高;!上;!/;奈,姶;奄,能,香;常,房南;留久1D登;国,日,知;瑞,赤;明,白,釜,高,黒;大,日十;三,上,下,半,吉#,吹,和3大,太2島,成,戸,日,有,池,沼,浜,牟大,町,発新,益,磐,秋0Y竹,蓮,行,角,豊,酒,野1鉾,飯,高0;前陸,&,@,=;!小陽山;!];十,岸;桐,相,福,羽;!苫;秩,養;清,綾;佐,船大;東,熱,西;ヶ袖,三,勝,土,松;小,居新,(,横,長,高;大,珠,野;!中,君,唐,大0宮,富,摂,更木,江,沼,海,焼,福,草,魚;!泉;丹,砺,阿;五,和;仙気,岩,魚0X鹿;今,宇;古,白;三,所,湯,滝,稲,米,花尾,藤,見岩,金;松,河寒,狛,近東,鯖;出,垂,射,清佐土;前,船,行,豊;ヶ駒,久阿,彦,東;神,鳥;小,田富,館;下,小,本二,浜,若津会,高;伊,加,国,坂,大,栗;安,朝,潮;三,西;大,田,羽;北,松,橋,洲,熊;三,厚,志,栃,茨;!張尾;向,春;多喜,枚,直,行;倉,稲;多,志;久長,取,幸,横;二,八,坂,室,平,松,水,瀬,神;合,布志;丹京,筑;名,夕;恵,真;別,大,宰太,甲,防;新,本;小,(,赤;!江近;由,調;々野,日0;四,廿;石,花;本,鴻;九0奥,甲;北,南;の紀,古加,吉,大,屋寝,市,平,掛,旭,柳,桜,桶,津0深,渋,滑,滝,<,田,砂,立,菊,豊,賀須,野吉,魚糸,鴨;中,木;ヶ0前御,%,大,宮,尼,岡,川,枕,柏,長,韮,須,高;茅,龍;ヶ鶴,三,五,児鹿,-,和宇,広1徳,昭,松0津,田江,福,糸,羽,輪,霧,高,鹿;小,東;!北,東;亀,富,延,白,盛,真,石,福,笠,藤,豊,長,静,高,鶴;土,壱;上,亀,勝,守,富,小,岡,村2松E歌和,津,流,烏M犬,狭1白,知福,福,篠波丹,郡0飯,館,高;!&;!阪大;!東,?;古名0芦,鹿;!北;七,上,八,荒,西;井藤,分国,通善,音観;一,#,大],新,本,西,都宇;孫我,王八,米,逗,銚;!国四;宝,平,貝,飯;南,宇,安,小,新,稲,結,茨北,葛,見豊,賀多,都,野大;大,石;の>,南,岩;!東;桑,玉,老海;人,倉;守,山,川,浅;名,香,鳥;三,之牧,井,務各,%,塩2島1川所五,市,庄,松,柏,栗,模相,橿,田0竹,米,茂,野上;!大,小;!南;須那;周,日,江,泉,海,湖,碧,阪,阿,雲,香;備,弘,豊,越;士,江,登,紋,芦;坂,岩;川摩薩,志歌,戸瀬,稚,胎;!和,日;佐,岩,朝,鎌;伊,土,宇;八,千八,能;大,雲;岡長,東西;坂,[,柳,桜,白,福,袋,金小,長;伊,西;佐,多,牛;伊,南;安,府,豊;北,村,潟,郡;うが+か,くさ,*;あ,たいさ,つさ南,やみ,るう;つた,びえ;ぬさ,わい;$;並杉,京文,北,.,宿新,島豊,川3東2橋板,港,田1立足,谷0野中,飾葛,馬練,黒目;渋,田世;代千,墨,大;台,江;品,戸江,荒",
    "Country": "true¦:!1:#$%&()*+-./<=>?@[]^_`~:ルブ,トス,アニ,ガン,シー,ャシ,ンセ,フア,ェウ,ルア,バル,アグ,ーュ,ウサ,オラ,ジン,ァフ,ルベ,リマ,ラカ,ィデ,シン;ア0Kイ0I>ビ%ギ,エ0H?パ,カ0F&ト,ク0Dコ0Cゴ0B(ルラベ,@#,ス09ズーリベ,ソ[ナキ#,タルマ,ダ05チ04ツ03デ]ボーカ,ト02ドWナVネオレラエシ,ノ^UバSフバ_・ノルゴナ,ブ`Tペ~リプ・メトUボソコ,マRムナQ)リギ,ュシデラグンバ,ラPリOルJロIン9ー8国3島諸1本日,湾台,邦連0鮮朝北;アシネロクミ,国長首ブラア;クック,ルャ(マ,ン0;モロソ,ー`ナレグびよおト*ンビ0X;カニ3中,和共0韓;アビラスゴーユ旧%ドケマ,カ1ゴ0主民ゴ0;ンコ;ニ0リ+央中;ミド;-ルノ,ギ],ジRマンャミ,リ&ハ,ルペ;イ7カチバ,タ3ダ1チンゼ.,デー-ス,ナベ,ノバレ,ピリQボガ,メエイ,ャジイ/ゼア,ライ,ー0;マオ,ルメカ,レーバ;ルヨ,ース0;!南;ス0ーブ;キ1ニ0フザカ;ガ+,メクルト;ジタ,パ,ベズウ;タュ~テヒリ,ペス;グネテ3モコ;ウナ,ェ(セ,エラスイ,カスガダマ,ガ3ゴ2ジラブ,$エニド沿,ド1バツ,ー0;ェジニ,タカ,パネ,ポ&シ,モィテ東,ワボジトーコ;アクエ,/サルエ;ンモ;トルポ,ネセ;チ,マ;エズネベ,ゴGドGハサ西,マテ<;トベ,リス;ナパ,ハバ;ド0=キ;ルモ;ンサ;アイガ,イラクウ,チスレパ,ビゴェツルヘ・%スボ,ワツボ,ーガ;ャチ,ン0;イ,ラ0;ジワス,ス2^ソ,ル2ン1ー0;ジ=ニ,ポ;ィフ;イア;ソレ,プジエ,ー-ク;アヌバ,イド;イハ,ブジ;ナ2ン1ーブーバ・<ィテ0;ンア;ガウ,ラオ,ワル;カ,レグ;イス,?,ギルキ,ド/バ,バリキ,ビイネ・ー[$リクQ)Lラュ@ホ,リギイ,ロプキ0ンラフ;!北;バト・ドーダニリト,ート;ェチ,シキメ,ッロモ,ナモ,ルト;ライ,#*クル,ー0;ビンザモ,マンデ;イマャジ,リ0ンラリス;タスコ,+南,メア;ウニ,ブバンジ;<0ウラマ,タ,ネ5;ラパ,ルウ;キバGグ_ニ,シEジDチCニ8ビ5ピオチエ,モサ,リ0;ェジ3ガ2シ,タイ,ト0ベリ,マソ,ラ$1;ス0リエ;ーオ;#;イナ,.;トラ,ミナ,ラアジ>,リ1ルセ,ン0;ガ,ザ,ロコ;!ボ;アトリ,ギ2ケ,ザンタ,タ1$エ,バ0ベ7マール,メ0;.;リーモ;!=ニアプパ,道赤;アロク,セオ南;ニュチ,ハブア,ボンカ,ーョジ;ネドンイ,ル0ロ,ーレマ;ト*;ロス",
    "Noun": "true¦:々人,い0Pう0Oえ0Nく0Mしとこ,すあ,たしあ,ち持気,つ,てっさあ,べ夕,み休,り0Lれ切,ろ後,ん0Jジーペ,チン0Iトンセーパ,ドンポ,プッコ,ム0Gリミ,ル0Eロ0Dン0Cヶ,上,下,中0B乳牛,事,人0A今,件,位,体,供子,個,倍,側,傘,元,兄,光,内,円,冊,冬,分,則規,前09割,匹,午正,卵,口,台,右,号,名07呂風,味意,和06品,員05噌味,回,因原,図地,国,園公,堂食,塩,声,夏,外,夜04夢,夫,奥,女,妹,妻,姉,娘,子03字02学大,定予,客,室01家,対,尾,局便郵,屋00山,島,川,左,市Z布財,師護看,席,年W店V度,庭,弟,当弁,形,後午,徒生,心,性U成平,戸,所T扉,手S才,指,数,方R族家,日Q旬P春,昼,時,晩O暦西,書N月M服,朝L末週,本,机,村,束,杯,枚,果結,校学,棟,森,業授,横,橋,機行飛,正大,歯,歳,段値,母K気J水,池,油醤,治明,泊,法I海,港空,湖,火,点,為H父K物G琲珈,瓶,生F由理,男,町,画計,界世,畑,番,発,皆,皿,目E県,真写,着,碗茶,社会,秋,秒,空,窓,章D端,筆C筒封,箇,箱,箸,節季,米,粒,糖砂,紀世,紙B組,絵,緒一,羽,者医,耳,聞新,肉,肩,腕,腹,舎田,船,色,茶お,菜野,葉言,行銀,街,袋,親両,角,計時,話,誌雑,語9課,足,路道,車8軒,輪指,通,週7道,達友,部,都首,酒,量,金6鉄下地,銭,鍵,鏡眼,長5間4院病,階,隣,隻,雨,雪,雲,雷,震地,面,靴,鞄,音,頁,頭,題3顔,風,飯1館0首,駅,験試,魚,鼻,齢年;書図,物博,画映,術美;ご0御;!昼,晩,朝;問,宿;!人,分,年,日,時,秒,週;社,部;!お,料,税;!今,先,来P毎;!動自,転自,電;単,国0本日,英,言;中,韓;!手;!鉛;!文;!人,個,回,番;先,学;!べ食,み飲,果,着,荷;!所;文,方;!天;!祖;!今,毎;!か,カ,ヵ,ヶ,今,先,来A正,毎,箇;科教,葉,辞;今,毎;下,中,初;!今,前,平,当,後明,明,昨7本,毎,翌;!夕;!切;!住,務事,台,場;女,男;!茶喫;!今,去,昨1来0毎,翌;!再;!一;!都;本,百八,部;!教;文,漢,苗;帽,息,椅;!今,昨,深;店,社会;令,昭;!仮0;平,片;!元紀,午,名;!二,大;!ん真,夜真,背;ォウ,ト,パ,ペ;キ,ーユ;ト0ド;ッリ,ーメ1;ゴし消,ラグ0;!ロキ;イ,セ;さ0ゃち赤;客お,皆;辺,通;近,遠;答,考;のき,ょき;ととお,違",
    "Date": "true¦:いととお,う9しとこ,すあ,たしあ,てっさあ,べ夕,夜8年5日4旬3晩2月1朝2末週,週0;今,先,来5毎;今,先,来4正,毎;今,毎;下,中,初;今,前,平,当,後明,明,昨2本,毎,翌;今,去,昨1来0毎,翌;!再;!一;今,昨;のき,ょき",
    "Time": "true¦:中夜真,午正,夜0方夕,昼,朝;!深",
    "AmPm": "true¦午0;前,後",
    "Season": "true¦冬,夏,春,秋",
    "SuruVerb": "true¦:了終,事D介紹,供提,価評,係関,備準,像想,入輸,内案,出輸,力努,功成,加C動B化変,可認,告報,問質,善改,営運,売販,始開,婚結,定決,対反,少減,帰復,張緊,強勉,待A得納,心安,応対,意9慢我,慮8憶記,成7択選,敗失,文注,断判,明6更変,期延,束約,査調,権棄,止中,歩散,決解,活生,濯洗,物い買,現実,理5用4発3着到,票投,究研,約2絡連,習練,脱逸,行1表発,見発,解理,言発,討検,設建,話0認確,談相,論議,謝感,議会,転運,造製,配心,長成,除掃,響影,験経;会,電;実,旅;予,契;出,開;使,利;修,料,管;発,説;完,賛;考,遠;注,用;招,期;活,移,運;参,増;仕,返",
    "Pronoun": "true¦!1:#$%&(:やつ,しゃ,くし,まえ,いつ;あJおHかFきDこCしょうせい,じぶん,そCてBへいIぼく,#,わ7俺6僕,儂,其奴,吾,小生,弊社,彼5御4我2手前,此奴,私1自分,貴0;下,女,官,方,様,男,社;!たち;!々,が0等;!社;宅,社;!女,奴,等;!様;が2し,た1て,れ0;!ら,われ;%,し;!$;&,めえ;(,#;か0さま,$,み;!ん;のじょ,れ0;!ら;いら,たく,&,ら,れ,ん0前,宅;$;(,た1なた,の0#,んた;かた,ひと,人,方;い,%,し",
    "Adverb": "true¦:!1:#$%&()*+-.<=>?@[]^_`~:うど,っい,とご,まあ,ちい,くい,きっ,ょじ,っけ,かい,こそ,すま,たか,だま,ばし,通普,まい,んあ,るま,いだ,ょし; 0Q々時,あ&ま,い0Hう0Eか0Cが.,き0Bく09ぐ07けだるきで,<<,し05==,ず04せ#,そよお,たが>,?,(んま,つ),てXでWとUどTなんみ,にM@@,ひぜ,びKぶJめじからあ,もDやはも,ゅし$,らCり7るすく,ろ6ん4一万,人一,体3分2変大,外1夫丈大,定の案,対絶,局結,層一,度丁,当相,応一,接直,旦一,構結,段普,然0番一,種一,約,[,部全;全,突;以,意;十,大;一,大;さくた,せ]て～Dぜんぜ,た$,だんだ,どCば(,ぶ0;いず,うゅじ,た;いろい,しむ,そろそ;かっす,*3くっ2とひ,な1はや,ぱっや,びんの,ま0;あ,^;か,きい;び,ゆ;は,_;かれこ,),たしかしも,や#,わQ;し4つい,て1でまくあ,に0;.,],り&,今;し#,と,～0;にな0らL;んど;?;`,う+`;た0再;たふ,びた;々別,い5う3えま,か2き$,ぐす,たZだいあ,で1どTま0~$,りかば,上以,主,今,前,実,常非,度一,当本,後最,急,気一,特,間;い,た;す,ま;い,した;とんほ,ゅき,+0;い,ひ;たみ,つ;うょち,んとほ;っ0ふ,りわ,割;き,ず,も,や,ょち;とあ,_,後;え3し1つか,め0;じは,初,極;いた,#,た0決;は,果;あ,敢;);>;ま,ら8必;こす0% / く% / き%,少;!少;す0直っ真;!っま;%とこ,べるな,や0ょ*け,よ,らそお,早;うよ,は;っさ,どきと;なかな,に0何か;なか;お1こ0そAつふ,とうと,ど,も,ゅちっ~,+の^;!-;(;がい,た7ていた,な～0ぱ7;く5てし4に2もに1り0;&;#;た0つべ,別;っめ;-,決;たっま,全;$;々色,[",
    "Adjective": "true¦:!1:#$%:もお,かし,たあ;い0;い05お04か01が00きZくYごす,さXしOすLずま,そKたJつIとふ,どひ,なEねいて,ばや,ぱっDまCむBめうゆ,#,やは,よAら8る6ろ4わ3丸,低,偉,円,凄,厚,古,味不,固,多,太,安,寒2広,弱,強,怖,悪,惨,愛可,手上,早,暑,暗,汚,浅,深,温,濃,熱,狭,甘,痛,白1眠,短,硬,細,緩,良,色黄,若,苦,荒,薄,角四,賢,赤,軽,辛0近,速,遅,遠,酷,醜,重,鈍,鋭,長,青,高,黒;!塩;!面;!肌;こ,よ;いき,く,し0ひ;!#;か0ず,だ,ぬ,ふ,ま,わ,明;!あ;あ,え,か0つ;!おし;!つ;さ,ざだは,ね;あ,う,せ;す,酸;いたっも,くす,た2の1ぶあ,らま0危,少;つ,詰;くょりみ,力魅;$,き;あ,き;い,か,めつ,冷;お,ほ;う,や0;!みし0;たし,親;いお,か6が5くつう,さや,ず4だた3な2のた,ほ,ま1も頼,ら0れう,ろ恐,わ疑,人大,優,厳,味美,喧,嬉,寂,忙,応相,悔,悲,惜,新,易,楽,欲,正,涼,激,珍,眩,美,苦,詳,貧,難;ずめ,%,ばす,晴素,汚;好,望;か,とお;!慌;す,ま;そい,騒;ず0懐;む,恥;いち,だ,小;$,にみ,ひ;おお,大;な,に;あ,じみ,た1ち,ら0わ,暖,温;わや,柔;!%;あ,お,と;!わか",
    "AdverbialParticle": "true¦:いら2か1けだ,つず,ど0らや,りかば;な,ほ;と,んな;く,ぐ",
    "NaAdjective": "true¦:々色,いGうEかBき9くどこ,こんが,ず8たへ,ち7つ5ぶ8まひ,めじま,りんべ,ん4価高,全安,切親,利便,単簡,名有,固頑,変,夫丈,寧丁,常3念残,手2敵素,料無,暇,気元,独孤,的1目面真,要重,険危,雑複,鮮新,麗0;奇,綺;交社,力魅,均平;上,下;正,異;けき,せ1ぜんあ,たんか,ねんざ,へ;ざくふ,せ0;んし;もねかお,持金お;うょじ;す,て0んげ,好;うこゃし,くょりみ,す,んきいへ;うこ,ずし,や1ら0静;めな,滑;ぎに,ざあ,賑,鮮;ょじい0ようゅじ;!せ;らき,れき,わいさ,嫌0幸;!大",
    "Conjunction": "true¦:!1:#$%&()*+-./<=>?@[]:れそ,うそ,もと,のそ,かし,すで,いな,たま,だた,ろこ,方一,たし,んほ,けだ,いと,らな,とた,のな;いかさやそ,うぽっい,え0Qおな,か0Nが0Kく0Hし0Gずらわかかもに,そこ0F+0E-,ち0Dつか,て07で05と01どZなほ,にUはPばIびHめたGもDゃAや8ら1り0れあ%,.とる0んめんは,上&,亦,但,又,否,尚,後&,/,至乃,面反;まつ;か5がな2<1な0乍し然;ぜな,ほ,#,=;!$,そ;し1れ0;そお,恐;(,然;),だ,#;い0たか,てしま;!$,ーそ;じ0りそ;!ん0;!ふ,ほ;(,そもそ,て1でYと0どれ>,のう?,#,尤;っも,#;けわ,しにW;!の;よお,及;え5へ4@,れ0;けな2す0;と0%;!だ;で,もさ;[,例,譬;いE[,例,譬;い3く0し*,ずま,+,ていつ,でY又,実,当本,或;し1らむし0;お,惜;も,若;るあ,或;え3くゃぎ,け2]Tび1み0%,らさ,#,故,時同と,次,逆;なち,因;@,並;だEまお;うSゆP;>,れ0;け),さ;*で,る0#;す1な0;$;!$,とだ;い0えうLこそ,],#,ろF=,/;つ,次;いで4さ,し2せ1っ0とりさ;?6が<,だ,よ,従,追;わあ,併;う0くか,そ;こ,そ;#;わなす,即;!も;らかだ;*,(,-,も,但,然;じ1ず0づ0;んかな;なお,同;)1だ,ゃじ,ろ0;こと;!$;て1.ど0ーゆて;!#;!っ;い,う0;&",
    "Expression": "true¦!1:#$%&()*+-./<=>?@[:まあ,ーい,ただ,ゃー,もし,ハッ,モシ,馳走,ーン,しょ,うん,いた,なら,りゃ,いえ,きま,かん;あ0Vい0Tう0Qえ0Nお0Gきゃ0Fぎ0Cぐふ0Bげっ,こ06ご03さ01ざ#みろ,じゃ0UすZそX%いまWどRなNねぇ,はMひ&,ふLへIほHまG((,やFよAわ9ア7ウ6オヤスミ,ガ5キャ4コンニチワ,ゴメン,サヨナラ,デヘヘ,トホホ,))ハ,バカヤロー,ヒヒヒ,フ3メリークリスマス,**,ヤ2ヨロシク,ワ1南無,嗚呼,御0有難う;意,+0I;ァー,ーッ;ダー,ッター,レヤレ;ェ1ムフム;ッ,ー;-;ヒャー,-,～ン;ッ0ハハ,リガトウ;カンベー,プップ～;ぁZあ,っ,んわん,$;い3う2お,くも#,し1っ0ーし;こら2しゃ;っ,ゃ;こそ,し;.;ぁ,あ,れやれ;ぁ,あS;う,んと;え1ー0;え,っ;え,ッ,ー;/,ふふ,むふむ,ん,ーん;い,じめ8っ,てな,$;あ2む,るほど,ん0;てこった,と0;!#,もはや;に,んだ;う2っこい1れどれ,ー0;ぞ,も;!.;<し0ぞ,も;まして;!ッ;う0らそら,れ;!ですね,ね;い0まん,み0ん0;ません;ぁ,あ7てと,よ0らば;う=,=;きげんEくろうさん,ちそうFっつぁん,めん1苦労さ0+F;ま,ん;!くだGなG;ら3>2れこれ,ん0;にち0ばん0;は,わ;!ー;!ぁ;!っ;ゃ1ょ0;!い,ぎょ;あ,ふん;あ,ー;!い,ぉ,お,かえり4ぎ3そまつ2っ,つかれ様,は1めでとう,や0$,早う,疲れ2粗末2;!すみ3っ;よう;さま,様;&;!な0;さい;え1っ,ー0;っ,ッ;!い;/,ふ1わ,ん,ー0;む,ん;!っ,ふ;?,え?,%@す,や0ーえ;ぁ,あ,ー;ぁ,あ,<,[6@へん,っ5ら4り1れ0ーあ;!よあれよ,れ,ー;がと1ゃ0;!>;!う;!ッ,ー;![べー;!べ",
    "Value": "true¦〇,いつつ,ここのつ,とお,ななつ,ひとつ,ふたつ,み1む1や1よ1一0七0万,三0九0二0五0京,仟,伍,何,佰,億,兆,八0六0十,千,参,四0壱,弐,拾,捌,漆,玖,百,肆,萬,陸,零;!つ;っつ",
    "WeekDay": "true¦土0日0月0木0水0火0金0;曜日",
    "Godan": "true¦:!1:#$%&():えか,ゃし,っ引,く無,なつ,い言;う0Fく0Bぐ08すVつTぬSぶPむKる0;あ,いま,う,#,おと,かIがHぎGくお,ぐな,けFこEさDざCしは,じBせあ,たわ,ち,つ,とAど9な8ねひ,の7は,ば6ふ,ぶか,へ,べ$,ほ,ぼの,ま5むね,め温,も4$っ3よ,わ1乗,仰,作,侍,偽,光,入,切,削,劣,参,取,叱,喋,回,困,在,塗,売,太,守,実,寄,帰,座,張0怒,戻,捻,掘,探,握,撮,散,断,曇,有,残,殴,治,消魂,減,渡,湿,滑,焦,登,直,眠,知,祈,祭,練,縋,縛,罵,耽,腐,至,茂,蘇,行流,被,要,覆,触,誇,語,誤,談冗,謝,譲,走,踊,蹴,返,送0G通,遣,遮,配,釣,降,限,陥,頼,飾,黙,齧;!%,威,見,頑;お,か0さ,す,つい,ま,変,終,関;!か;お,らい;く,ま;き,こ,じは,だ,つあ,と,固,始,広,強,暖,止,決,泊,閉,集,静,高;し,んが;!い,み;&,異,重;お,も;!お,ふ;か,ま,混;か,ご;く,だく,な,下,為;お,の,起;かい追,ふ;か,脂;し欲,(,ま,上,下,嫌,広,怖,愛可,曲,群,転;か,し,つ見,ひ,わ,儲,分,助,掛;う,か3こ,し2す1ぢち,つ,の0やな,よ,企,休,住,刻,励,包,含,噛,囲,好,富,恨,悩,憎,挟,掴,望,染馴,沈,涼,済,生,産,畳,痛,盗,眩,睨,積,組,縮,読,踏,込,進,霞,頼,飲;!こ,た;!す,や;悲,惜,楽,苦;!つ;か浮,けさ,こ1すむ,と,なま,よ,ら0ろこ,並,及,叫,呼,喜,学,忍,結,転,遊,運,選,飛;え,な;は,ろよ;し,死;う,た,だそ,ま,も,保,勝,建,待,打,持,立0経,育;!役,目;#,おBかAがさ,&,け,こ起,ご過,た9だ,つう,と落,なは,ば8ぼ滅,ま励,めし,や7ら6ろ降,倒,做見,写,出3刺,増,壊,外,崩,干,志,戻,押,探,残,殺,污,治,消,渡,熟,現,直,示,移,表2試,話,貸,越1足,返0逃見,通,隠,離,騙;!り繰;!%;!);!い1び0り取;呼,飛;思,言;ふ),凝,暮,枯,減,漏;ふ,冷,増,生;喜,飛蹴;わ,満;!め仄,や冷,乾,沸,溶,負;!な;せ1そ0(,よお,わさ,仰,剥,嗅,急,担,次,注,泳,稼,継,脱,防,騒;い,そ;か,ふ;い,お,がみ,き,ごう,さ,だ,つ2づ1な,ひ,ふ,ま,や,ら0るあ,乾,付気,傾,働,効,動,吹,咲,導,就,届,履,巻,引,弾,往,抜,抱,招,描,敷,書,歩,沸,泣,焼,着,砕,磨,空,突,続,置,聞,行,解,説口,輝,逝,開,響,頂,驚;たは,ひ;つ,基;!い思;い,か6がち,す,そさ,たう,だつて,な行,まし,もお,よ5ら4わ味,乞,争,会3伝手,伴,使,匂,合2吸,商,問,庇,従,思,憩,払,扱,拾,揃,救,構,歌,沿,洗,添,潤,狂,疑,祝,笑,縫,習1舞,補,襲,言,誘,請,貰,買,賄,迷,追,這,通,違0遣気,適,遭,酔,願,飼;!い食,間;!見;!き付,し話,に間,り知;!出;あ,な,も;か,ま;!つ,向",
    "IrregularVerb": "true¦:る0;く,す,来,為",
    "Ichidan": "true¦:denifednu,る0;い06え00きZぎYけSげRじPせMぜLちKてJで,に,ねIびHべEみ,めCりBれ1似0出,寝,居,得,来出,煮,着,経,見;!真;い,う,お8か7が6き,く5ぐす,ごよ,すわ,ず4そお,つ,な3ぬ,は,ふ2ほ,ま1も,わ0倒,優,入,切,別,取,呉,壊,売,崩,忘,恐,惚,慣,折,晴,暮,枯,汚,流,溢,漏,濡,現,疲,触,訪,逃,連,遅,隠,離;こ,らあ;う,生;!あ;!は;く,とお;!か;な,の;!つ,わ,分;!た;お,か,た,借,足,降;う,かた,がな,き,さ,し,じは,すす,せ,ださ,つあ,と0な,ほ,よつ,らきあ,わよ,冷,努,勤,占,固,埋,始,定,広,弱,強,慰,戒,攻,止,求,決,眺,締,舐,虐,褒,覚,認,諦,責,進,閉,集,高;!つ,み,も;か1た,の,ら0並,比,調,述,食;く,し,な;う,浮;あ,伸,帯,延,浴,滅,綻,詫,錆;!さか,ずた,兼,委,尋,束,訪,跳,重;あ,す,た,だそ,企,建,当,慌,捨,果,立,育;お,落;ま,交,混;かま,の,ま1み,や,よ,ら0乗,任,伏,寄,痩,臥,見,載;し,知;し苦,済;ん0信,命,存,応,恥,感,案,演,生,禁,論,講,転,通;か,し;あ,さ,つ,と,な,に,ま,ろひ,上,下,告,妨,広,投,挙,掲,曲,焦,逃,遂;あ,う,か4さ,つ3と,どと,ま,わ,付2儲,分,助,受1届,怠,抜,掛0明,溶,点,焼,生,続,老,解,負,避,長,開;!腰;!き引;!片;!い言,傷,見;!で,出;す,過;!お,で,尽,生,起,飽;!か4がんか,き,こ3ささ,しお,ぞか,た2は,ふ,ぼお,も,るふ,わく,与,伝,使,備,冷,加,増,変,抑,抱,拵,揃,換0支,教,数,替,構,消,燃,甘,生,答,考,蓄,見,覚,訴,越,迎,違間,鍛,震;!い言,り0着;乗,取;あ,こ,つ;!き,聞;か,つ,む;!報,強,悔,用,老",
    "Determiner": "true¦:の0;あ,こ,そ",
    "CaseParticle": "true¦:が,で0と,に,へ,や,らか,りよ,を;!ま",
    "ConjunctiveParticle": "true¦け2し,た1つつ,て3ながら,の0ば;で,に;ら,り;ど,れど0;!も",
    "TopicParticle": "true¦:えさ,かし,そこ,は,も0らな;!で",
    "SentenceParticle": "true¦か3さ,ぜ,ぞ,な2ね1のか,ものか,よ0わ;!ね;!え;!あ;!しら,な",
    "Era": "true¦:前元紀,和0成平,暦西,正大,治明;令,昭",
    "AdnominalParticle": "true¦の"
  };

  /* eslint-disable no-empty */
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
    for (; places > 0; places--) {
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
    const reSymbol = /^([0-9A-Z]+):([0-9A-Z]+)$/;
    for (let i = 0; i < t.nodes.length; i++) {
      if (!t.nodes[i].includes(':')) {
        break
      }
      const m = reSymbol.exec(t.nodes[i]);
      if (!m || m[0].length !== t.nodes[i].length || encoding.fromAlphaCode(m[1]) !== i) {
        throw new SyntaxError('Invalid efrt packed data: symbol definition')
      }
      t.syms.push(encoding.fromAlphaCode(m[2]));
    }
    t.symCount = t.syms.length;
    t.nodes = t.nodes.slice(t.symCount);
    if (t.nodes.length === 0 || t.syms.some((index) => !Number.isSafeInteger(index) || index >= t.nodes.length)) {
      throw new SyntaxError('Invalid efrt packed data: symbol target')
    }
  };

  const unescapeLabel = function (text) {
    return text.replace(/\\([\s\S]|$)/g, (match, char) => {
      if (char === '\\') {
        return '\\'
      }
      if (char >= 'a' && char <= 'j') {
        return String(char.charCodeAt(0) - 97)
      }
      throw new SyntaxError('Invalid efrt packed data: label escape')
    })
  };

  const dictionary = function (trie) {
    if (!trie.nodes[0].startsWith('!1:')) {
      return
    }
    const header = trie.nodes.shift().split(':');
    const tokens = Array.from(header[1]);
    const fragments = (header[2] || '').split(',');
    if (header.length !== 3 || tokens.length === 0 || tokens.length !== fragments.length ||
      new Set(tokens).size !== tokens.length || trie.nodes.length === 0 ||
      tokens.some((token) => token.length !== 1 || token.charCodeAt(0) < 33 ||
        token.charCodeAt(0) > 126 || /[A-Za-z0-9,;!:|]/.test(token) ||
        (trie.versioned && token === '\\')) ||
      fragments.some((text) => !text || /[A-Z0-9,;!:|¦]/.test(text))) {
      throw new SyntaxError('Invalid efrt packed data: fragment dictionary')
    }
    trie.dictionary = Object.create(null);
    for (let i = 0; i < tokens.length; i++) {
      trie.dictionary[tokens[i]] = trie.versioned ? unescapeLabel(fragments[i]) : fragments[i];
    }
  };

  // References are either absolute (symbol) or relative (1 - based)
  const indexFromRef = function (trie, ref, index) {
    const dnode = encoding.fromAlphaCode(ref);
    const target = dnode < trie.symCount ? trie.syms[dnode] : index + dnode + 1 - trie.symCount;
    // The encoder emits nodes in topological order. Every edge must point
    // forward, which also rules out cycles before expansion starts.
    if (!Number.isSafeInteger(target) || target <= index || target >= trie.nodes.length) {
      throw new SyntaxError('Invalid efrt packed data: node reference')
    }
    return target
  };

  const parseNodes = function (trie) {
    return trie.nodes.map((node, index) => {
      if (node === '' && trie.nodes.length !== 1) {
        throw new SyntaxError('Invalid efrt packed data: empty node')
      }
      const terminal = node[0] === '!';
      const body = terminal ? node.slice(1) : node;
      const edges = [];
      // Match only at the current offset. Searching later positions would
      // repeatedly rescan a long malformed fragment before rejecting it.
      const token = /([^A-Z0-9,;!:|¦]+)([A-Z0-9]+|,|$)/y;
      for (let offset = 0; offset < body.length; offset = token.lastIndex) {
        const match = token.exec(body);
        if (!match || match.index !== offset || (match[2] === ',' && token.lastIndex === body.length)) {
          throw new SyntaxError('Invalid efrt packed data: node syntax')
        }
        const ref = match[2];
        const label = trie.versioned ? unescapeLabel(match[1]) : match[1];
        const text = trie.dictionary ? Array.from(label,
          (char) => trie.dictionary[char] || char).join('') : label;
        edges.push({
          text,
          target: ref === '' || ref === ',' ? -1 : indexFromRef(trie, ref, index)
        });
      }
      return { terminal, edges }
    })
  };

  const toArray = function (trie) {
    const nodes = parseNodes(trie);
    const all = [];
    const stack = [{ index: 0, pref: '', edge: -1 }];
    for (; stack.length > 0;) {
      const frame = stack[stack.length - 1];
      const node = nodes[frame.index];
      if (frame.edge === -1) {
        if (node.terminal) {
          all.push(frame.pref);
        }
        frame.edge = 0;
      }
      if (frame.edge === node.edges.length) {
        stack.pop();
        continue
      }
      const edge = node.edges[frame.edge++];
      const word = frame.pref + edge.text;
      if (edge.target === -1) {
        all.push(word);
      } else {
        stack.push({ index: edge.target, pref: word, edge: -1 });
      }
    }
    return all
  };

  //PackedTrie - Trie traversal of the Trie packed-string representation.
  const unpack$1 = function (str, versioned = false) {
    const trie = {
      nodes: str.split(';'),
      syms: [],
      symCount: 0,
      versioned
    };
    dictionary(trie);
    //process symbols, if they have them
    if (str.match(':')) {
      symbols(trie);
    }
    return toArray(trie)
  };

  const unpack = function (str) {
    if (str === '' || str === null || str === undefined) {
      return {}
    }
    if (typeof str !== 'string') {
      throw new TypeError('efrt unpack expects a string')
    }
    //turn the weird string into a key-value object again
    const obj = str.split('|').reduce((h, s) => {
      const arr = s.split('¦');
      if (arr.length !== 2 || Object.prototype.hasOwnProperty.call(h, arr[0])) {
        throw new SyntaxError('Invalid efrt packed data: category separator or duplicate category')
      }
      h[arr[0]] = arr[1];
      return h
    }, Object.create(null));
    const all = {};
    Object.keys(obj).forEach(function (cat) {
      let data = obj[cat];
      const versioned = data.startsWith('!2;');
      if (versioned) {
        data = data.slice(3);
        if (!data || data === ':') {
          throw new SyntaxError('Invalid efrt packed data: missing versioned trie')
        }
      }
      const reversed = data[0] === ':';
      const arr = unpack$1(reversed ? data.slice(1) : data, versioned);
      //special case, for botched-boolean
      if (cat === 'true') {
        cat = true;
      }
      for (let i = 0; i < arr.length; i++) {
        const k = reversed ? Array.from(arr[i]).reverse().join('') : arr[i];
        if (Object.prototype.hasOwnProperty.call(all, k)) {
          if (Array.isArray(all[k]) === false) {
            if (all[k] !== cat) {
              all[k] = [all[k], cat];
            }
          } else if (!all[k].includes(cat)) {
            all[k].push(cat);
          }
        } else {
          Object.defineProperty(all, k, {
            value: cat,
            writable: true,
            enumerable: true,
            configurable: true
          });
        }
      }
    });
    return all
  };

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
  const ichidan = `見る 着る 似る 煮る 干る 射る 鋳る 居る 出る 得る 経る 寝る
  生きる 起きる 過ぎる 落ちる 尽きる 飽きる 降りる 借りる 足りる 浴びる 滅びる 錆びる
  感じる 信じる 禁じる 命じる 応じる 通じる 生じる 存じる 論じる 演じる 転じる 案じる 講じる 恥じる
  老いる 用いる 報いる 強いる 悔いる 延びる 伸びる 帯びる 詫びる 綻びる 懲びる 出来る
  みる きる にる でる える ねる いる いきる おきる すぎる おちる おりる かりる たりる あびる`.split(/\s+/);

  // 五段 verbs that *look* ichidan (an i/e-row kana sits before the る) but aren't.
  // mostly matters for the kana spellings - kanji spellings already default to godan.
  const godanRu = `帰る 返る 入る 要る 走る 知る 切る 限る 減る 練る 照る 滑る 握る 焦る
  脂ぎる 覆る 遮る 罵る 湿る 茂る 参る 交じる 混じる 陥る 侮る 嘲る 憚る 滾る 捻る 抓る 契る 齧る
  喋る 縋る 蘇る 甦る 詰る 罷る 迸る 阿る 熱る 散る 蹴る 耽る ふける
  かえる はいる はしる しる きる かぎる へる ねる てる すべる にぎる あせる ちる
  まじる しゃべる かじる ひねる くつがえる さえぎる ののしる しめる しげる まいる おちいる
  あなどる あざける はばかる なじる まかる ほとばしる ほてる ちぎる よみがえる すがる つねる
  たぎる おもねる いじる ける よぎる まざる ねじる
  打ち切る 思い切る 張り切る 立ち返る 生き返る 寝返る 立ち入る 押し入る 気に入る 見入る 恐れ入る`
    .split(/\s+/).filter(w => /る$/.test(w));

  const isIchidan = new Set(ichidan.filter(w => /る$/.test(w)));
  const isGodanRu = new Set(godanRu);

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
    // an explicit listing beats any compound-guess - 出来る ends in 来る but is
    // an ordinary ichidan verb, not a compound of 来る
    if (isIchidan.has(dict)) {
      return 'ichidan'
    }
    // -する compounds, like 勉強する
    if (dict.length > 2 && dict.endsWith('する')) {
      return 'suru'
    }
    // -来る compounds are always て-form + 来る: 持って来る, やって来る
    if (dict.length > 3 && /[てで](来る|くる)$/.test(dict)) {
      return 'kuru'
    }
    const last = dict[dict.length - 1];
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
    const before = dict[dict.length - 2];
    // an i-row or e-row kana before る is a good ichidan signal
    if (iRowKana.has(before) || eRowKana.has(before)) {
      return 'ichidan'
    }
    // ..otherwise assume godan, the larger class
    return 'godan'
  };

  // the five 'bases' every japanese verb form is built out of.
  // get these right and every suffix falls out of them.
  const toBases = function (dict, cls) {
    const stem = dict.slice(0, -1);
    const last = dict[dict.length - 1];
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
        const s = dict.slice(0, -1); // 食べ
        // くれる is the one ichidan verb with a bare imperative - くれ, not くれろ
        const imper = /(呉れる|くれる)$/.test(dict) ? s : s + 'ろ';
        return {
          negStem: s, stem: s, cond: s + 'れ', imper: imper,
          volit: s + 'よう', te: s + 'て',
          potential: s + 'られる', passive: s + 'られる', causative: s + 'させる',
        }
      }
      case 'suru': {
        const pre = dict.slice(0, -2); // 勉強
        return {
          negStem: pre + 'し', stem: pre + 'し', cond: pre + 'すれ', imper: pre + 'しろ',
          volit: pre + 'しよう', te: pre + 'して',
          potential: pre === '' ? 'できる' : pre + 'できる',
          passive: pre + 'される', causative: pre + 'させる',
        }
      }
      case 'kuru': {
        const pre = dict.slice(0, -2);
        const kana = dict.endsWith('くる');
        const ko = kana ? 'こ' : '来';
        const ki = kana ? 'き' : '来';
        const ku = kana ? 'く' : '来';
        return {
          negStem: pre + ko, stem: pre + ki, cond: pre + ku + 'れ', imper: pre + ko + 'い',
          volit: pre + ko + 'よう', te: pre + ki + 'て',
          potential: pre + ko + 'られる', passive: pre + ko + 'られる', causative: pre + ko + 'させる',
        }
      }
      case 'aru': {
        const s = dict.slice(0, -1); // あ / 有 / 在
        return {
          negStem: null, // ある has no 未然形 - its negative is just ない
          stem: s + 'り', cond: s + 'れ', imper: s + 'れ', volit: s + 'ろう', te: s + 'って',
          potential: s + 'れる', passive: s + 'られる', causative: s + 'らせる',
        }
      }
      case 'iku': { // 行く takes って, not the regular いて
        const s = dict.slice(0, -1);
        return {
          negStem: s + 'か', stem: s + 'き', cond: s + 'け', imper: s + 'け', volit: s + 'こう',
          te: s + 'って',
          potential: s + 'ける', passive: s + 'かれる', causative: s + 'かせる',
        }
      }
      case 'ou': { // 問う/請う keep うて rather than って
        const s = dict.slice(0, -1);
        return {
          negStem: s + 'わ', stem: s + 'い', cond: s + 'え', imper: s + 'え', volit: s + 'おう',
          te: s + 'うて',
          potential: s + 'える', passive: s + 'われる', causative: s + 'わせる',
        }
      }
      case 'aru5': { // くださる/なさる - godan, but the masu-stem drops the り
        const s = dict.slice(0, -1);
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
    const cls = verbClass(dict, hint);
    if (!cls) {
      return null
    }
    const b = toBases(dict, cls);
    if (!b) {
      return null
    }
    // ある is the one verb whose plain negative isn't built on a 未然形
    const negative = b.negStem === null ? 'ない' : b.negStem + 'ない';
    const pastNegative = b.negStem === null ? 'なかった' : b.negStem + 'なかった';
    const te = b.te;
    const past = teToTa(te);

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

  // い-adjectives inflect for tense and polarity - they are not 'just adjectives'.
  // 高い → 高くない → 高かった → 高くなかった.  the copula does not carry that tense.

  // いい/良い is the one truly irregular い-adjective - it inflects as よい
  const irregularStem = { 'いい': 'よ', '良い': '良', 'よい': 'よ' };

  const conjugateAdjective = function (word) {
    if (!word || !word.endsWith('い') || word.length < 2) {
      return null
    }
    const stem = irregularStem[word] !== undefined ? irregularStem[word] : word.slice(0, -1);
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
    'んで': ['む', 'ぶ', 'ぬ']};

  const defaultDict = function (stem, base) {
    const last = stem[stem.length - 1];
    const head = stem.slice(0, -1);
    const out = [];
    if (base === 'neg') {
      if (fromA[last]) out.push(head + fromA[last]); // 書か → 書く
      out.push(stem + 'る'); // 食べ → 食べる
    } else if (base === 'masu') {
      if (fromI[last]) out.push(head + fromI[last]); // 書き → 書く
      out.push(stem + 'る'); // 食べ → 食べる
    } else if (base === 'cond') {
      if (fromE[last]) out.push(head + fromE[last]); // 書け → 書く
      out.push(head + fromE[last] + 'る'); // 食べれ → 食べる (via れ)
    } else if (base === 'volit') {
      if (fromO[last]) out.push(head + fromO[last]); // 書こ → 書く
    } else if (base === 'te' || base === 'ta') {
      if (stem === 'し' || stem === 'き' || stem === '来') {
        return [stem === 'し' ? 'する' : '来る']
      }
      // the ending was already consumed, so `stem` still carries the 音便 kana
      const two = stem.slice(-1); // っ or ん or い
      if (two === 'っ') {
        fromTe['って'].forEach((c) => out.push(stem.slice(0, -1) + c));
        // 行く is the one く-verb that takes って - 行った, not 行いた
        out.push(stem.slice(0, -1) + 'く');
      } else if (two === 'ん') {
        fromTe['んで'].forEach((c) => out.push(stem.slice(0, -1) + c));
      } else if (two === 'い') {
        out.push(stem.slice(0, -1) + 'く', stem.slice(0, -1) + 'ぐ');
      } else if (two === 'し') {
        out.push(stem.slice(0, -1) + 'す');
      }
      out.push(stem + 'る'); // ichidan: 食べ + た
    }
    return out.filter((s) => s && s.length > 1)
  };


  // the suffixes we know how to strip, longest-first.
  // `base` says which of the five 活用形 the remaining stem is.
  const suffixes$1 = [
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
    const last = stem[stem.length - 1];
    const pre = stem.slice(0, -1);
    // a bare し/き is する/来る
    if (stem.length === 1) {
      if (suruStem.has(last)) return ['する']
      if (kuruStem.has(last)) return ['来る']
    }
    // 勉強し could be 勉強する or a godan 勉強す - a two-character head is
    // almost always a する-noun (勉強する), a one-character head almost always
    // a godan verb (話す, 出す, 貸す).
    if (suruStem.has(last)) {
      const rest = defaultDict(stem, base);
      return pre.length >= 2 ? [pre + 'する'].concat(rest) : rest.concat([pre + 'する'])
    }
    return defaultDict(stem, base)
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
      const [suffix, tags, base, strict] = suffixes$1[i];
      if (!str.endsWith(suffix) || str.length <= suffix.length) {
        continue
      }
      const stem = str.slice(0, -suffix.length);
      // 'た'/'だ'/'て'/'で' hang off the 音便 kana, which belongs to the stem
      const candidates = toDict(stem, base);
      if (candidates.length === 0) {
        continue
      }
      const hit = isKnown ? candidates.find(isKnown) : null;
      // a 'strict' suffix is too common a word-ending to trust on its own -
      // 「たろう」 is a name, not the volitional of 「たる」
      if (strict && !hit) {
        continue
      }
      const root = hit || candidates[0];
      // sanity-check: does re-conjugating the root actually produce this string?
      if (hit) {
        return { root, tags, candidates }
      }
      const verified = candidates.find(c => {
        const forms = conjugate$1(c);
        return forms && Object.keys(forms).some(k => forms[k] === str)
      });
      if (verified) {
        return { root: verified, tags, candidates }
      }
      return { root, tags, candidates, guess: true }
    }
    return null
  };

  var conjugate = {
    verb: conjugate$1,
    adjective: conjugateAdjective,
    naAdjective: conjugateNaAdjective,
    verbClass,
    deconjugate,
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
  const lex = {
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

  // tags in _data.js that describe *how a word conjugates*, not what it is
  // const verbHint = {
  //   Godan: 'Godan',
  //   Ichidan: 'Ichidan',
  //   IrregularVerb: null,
  //   SuruVerb: null,
  // }

  const lexicon$2 = {};
  // surface-form → dictionary-form, so 食べました can report 食べる
  const roots = {};
  // weak entries (generated forms) never overwrite a strong one (a listed word)
  const strong = new Set();

  const add = function (word, tags, isStrong) {
    if (!word) {
      return
    }
    if (strong.has(word) && !isStrong) {
      return
    }
    if (isStrong) {
      // a word can be listed twice - 毎朝 is a #Date and a #Noun.  keep both,
      // and let the tagset sort out any that genuinely conflict
      if (strong.has(word)) {
        const both = new Set([].concat(lexicon$2[word], tags));
        lexicon$2[word] = [...both];
        return
      }
      strong.add(word);
    }
    lexicon$2[word] = tags;
  };

  // the derived stems - 褒められる, 書ける, 食べさせる - inflect like ichidan
  // verbs in their own right, so give each of them a paradigm too
  const derived = ['Potential', 'Passive', 'Causative', 'CausativePassive'];

  const addDerived = function (base, baseTags, dict) {
    const forms = conjugate$1(base, 'Ichidan');
    if (!forms) {
      return
    }
    Object.keys(derivedForms).forEach(form => {
      const str = forms[form];
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
    const forms = conjugate$1(dict, hint);
    if (!forms) {
      return
    }
    Object.keys(verbForms).forEach(form => {
      const str = forms[form];
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
    const want = conjugateAdjective(forms.Desire);
    if (want) {
      Object.keys(desireForms).forEach(form => {
        const str = want[form];
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
    const forms = conjugateAdjective(word);
    if (forms) {
      Object.keys(adjForms).forEach(form => {
        const str = forms[form];
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
    const forms = conjugateNaAdjective(word);
    Object.keys(naAdjForms).forEach(form => {
      const str = forms[form];
      if (str && str !== word) {
        add(str, naAdjForms[form]);
      }
    });
    add(word, naAdjForms.Infinitive, true);
  };

  // ---- 1. generated forms first, so listed words can override them ----
  const unpacked = {};
  Object.keys(lexData).forEach(tag => {
    unpacked[tag] = Object.keys(unpack(lexData[tag]));
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
  Object.keys(lex).forEach(w => {
    lexicon$2[w] = lex[w];
    strong.add(w);
  });

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
    /** every date, time and duration */
    View.prototype.dates = function () {
      return this.match('#Date+')
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
      return conjugate$1(str)
    },
    /** the paradigm of an い- or な-adjective */
    conjugateAdjective: function (str) {
      return str.endsWith('い') ? conjugateAdjective(str) : conjugateNaAdjective(str)
    },
    /** walk a conjugated verb back to its dictionary-form */
    deconjugate: function (str) {
      const found = deconjugate(str, isKnown$2);
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
      return verbClass(str)
    },
  };

  var lexicon$1 = {
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
    const words = new Set();
    let maxLen = 1;
    for (let i = 0; i < arr.length; i += 1) {
      words.add(arr[i]);
      if (arr[i].length > maxLen) {
        maxLen = arr[i].length;
      }
    }
    return { words, maxLen }
  };

  // longest-match segmentation.
  //
  // this used to build a character-trie over the whole lexicon, which cost
  // ~40mb of nodes.  a Set of the words plus a bounded backwards scan is the
  // same answer for a fraction of the memory.

  const splitUp = function (txt, words, maxLen) {
    const out = [];
    let i = 0;
    while (i < txt.length) {
      const max = Math.min(maxLen, txt.length - i);
      let found = '';
      for (let len = max; len > 1; len -= 1) {
        const str = txt.substr(i, len);
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
    const out = [];
    for (let i = 0; i < arr.length; i += 1) {
      const c = arr[i];
      if (c === null || c === '') {
        continue
      }
      const last = out[out.length - 1];
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
        const type = getType(c);
        let run = c;
        // race ahead, joining same-script characters.
        // a *known* single kanji may join an already-started run (日+本+人),
        // but never starts one - so 「読んでいる人」 keeps 人 on its own.
        const limit = runLimit(type);
        while (run.length < limit && arr[i + 1] !== undefined) {
          const next = arr[i + 1];
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
    const out = [];
    for (let i = 0; i < arr.length; i += 1) {
      const head = arr[i];
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
        const candidate = head + arr.slice(i + 1, o + 1).join('');
        if (candidate.length - head.length < 2) {
          continue
        }
        if (lexicon$2[candidate] || deconjugate(candidate)) {
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

  // 漢数字 → a javascript number.
  // japanese numerals are positional-by-power rather than positional-by-digit:
  // 三百二十一 is (3×100) + (2×10) + 1, and 三万 is 3×10,000.

  const digits = {
    '〇': 0, '零': 0, '０': 0, '0': 0,
    '一': 1, '壱': 1, '１': 1, '1': 1,
    '二': 2, '弐': 2, '２': 2, '2': 2,
    '三': 3, '参': 3, '３': 3, '3': 3,
    '四': 4, '肆': 4, '４': 4, '4': 4,
    '五': 5, '伍': 5, '５': 5, '5': 5,
    '六': 6, '陸': 6, '６': 6, '6': 6,
    '七': 7, '漆': 7, '７': 7, '7': 7,
    '八': 8, '捌': 8, '８': 8, '8': 8,
    '九': 9, '玖': 9, '９': 9, '9': 9,
  };
  // powers that stack inside a group
  const small$1 = { '十': 10, '拾': 10, '百': 100, '佰': 100, '千': 1000, '仟': 1000 };
  // powers that close a group off
  const large$1 = { '万': 1e4, '萬': 1e4, '億': 1e8, '兆': 1e12, '京': 1e16 };

  const isNumeral = function (c) {
    return digits[c] !== undefined || small$1[c] !== undefined || large$1[c] !== undefined
  };

  /** parse a japanese numeral - returns null if the string isn't one */
  const toNumber = function (str) {
    if (!str) {
      return null
    }
    let total = 0;    // everything closed off by 万/億/兆
    let section = 0;  // the current group, below 10,000
    let current = 0;  // the digits seen since the last power
    let seen = false;

    for (let i = 0; i < str.length; i += 1) {
      const c = str[i];
      if (digits[c] !== undefined) {
        // 15 and １５ are positional, so keep multiplying up
        current = Number(current * 10) + Number(digits[c]);
        seen = true;
        continue
      }
      if (small$1[c] !== undefined) {
        // 十 on its own is 10, not 0
        section += (current === 0 ? 1 : current) * small$1[c];
        current = 0;
        seen = true;
        continue
      }
      if (large$1[c] !== undefined) {
        // a bare 万 is 10,000 - but 五十万 is 50×10,000, not 51×10,000
        const group = section + current;
        total += (group === 0 ? 1 : group) * large$1[c];
        section = 0;
        current = 0;
        seen = true;
        continue
      }
      return null // not a numeral
    }
    if (!seen) {
      return null
    }
    return total + section + current
  };

  const allNumeral$1 = function (str) {
    for (let i = 0; i < str.length; i += 1) {
      if (!isNumeral(str[i])) {
        return false
      }
    }
    return str.length > 0
  };

  /**
   * 二十三 arrives as 二|十|三, because each of them is a lexicon entry on its own.
   * a run of numerals is one number.
   */
  const joinNumbers = function (arr) {
    const out = [];
    for (let i = 0; i < arr.length; i += 1) {
      if (!allNumeral$1(arr[i])) {
        out.push(arr[i]);
        continue
      }
      let run = arr[i];
      while (arr[i + 1] !== undefined && allNumeral$1(arr[i + 1])) {
        run += arr[i + 1];
        i += 1;
      }
      out.push(run);
    }
    return out
  };

  const { words: words$1, maxLen } = buildIndex(Object.keys(lexicon$2));
  // a very long 'word' is nearly always two words - cap the lookahead
  const LOOKAHEAD = Math.min(maxLen, 12);

  const allHiragana = /^[぀-ゟ]+$/;

  // a case-particle at either end of a kana run isn't part of the word
  const edgeParticle = new Set(['は', 'が', 'を', 'に', 'へ', 'と', 'も', 'の', 'で', 'や', 'か']);
  // beyond this, a string of loose kana really is several words
  const MAX_KANA_RUN = 7;

  const isSingleKana = (str) => str.length === 1 && allHiragana.test(str);

  // 「『（(【〔《〈 at the end of a punctuation run
  const trailingOpen = /[「『（(【〔《〈]+$/;

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
      const run = arr.slice(i, end);
      i = end - 1;
      // を is only ever a particle, so it's a hard word-boundary
      const segments = [[]];
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
        const hasLeft = out.length > 0 && !edgeParticle.has(out[out.length - 1]);
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
    let arr = splitUp(txt, words$1, LOOKAHEAD);
    // a kana run that fell apart into loose characters is one unknown word
    arr = rejoinKana(arr);
    // join-up neighbouring unknown characters
    arr = joinUp(arr);
    // 二|十|三 is one number
    arr = joinNumbers(arr);
    // give an unknown kanji stem its inflectional tail - 含 + まれている
    arr = attachOkurigana(arr);
    // punctuation is never its own term - it hangs off the word before it,
    // except an opening bracket, which hangs off the word after it - 彼は「はい」と
    const out = [];
    let carry = '';
    arr.forEach(str => {
      if (str === '') {
        return
      }
      if (str.split('').every(isPunctuation)) {
        let open = '';
        str = str.replace(trailingOpen, m => {
          open = m;
          return ''
        });
        if (str !== '' && out.length > 0) {
          out[out.length - 1] += str;
        } else {
          carry += str;
        }
        carry += open;
        return
      }
      out.push(carry + str);
      carry = '';
    });
    // punctuation with no word after it
    if (carry !== '') {
      if (out.length > 0) {
        out[out.length - 1] += carry;
      } else {
        out.push(carry);
      }
    }
    return out
  };

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
    const terms = [];
    tokenize$1(txt, isChunk).forEach(str => {
      const { pre, post, inside } = getPunct(str);
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

  const hasMulti = new Set(['き', 'ぎ', 'し', 'じ', 'ち', 'ぢ', 'っ', 'て', 'に', 'ひ', 'び', 'ぴ', 'み', 'り']);

  // katakana and hiragana are the same 46 sounds, 0x60 apart in unicode.
  // fold katakana down so one map handles both scripts.
  const toHiragana$1 = function (str) {
    let out = '';
    for (let i = 0; i < str.length; i += 1) {
      const c = str[i];
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
    const chars = toHiragana$1(str).split('');
    let out = '';

    for (let i = 0; i < chars.length; i += 1) {
      const c = chars[i];
      // ー is the 長音符 - it lengthens the vowel of the syllable before it
      if (c === 'ー' || c === 'ｰ') {
        const last = out[out.length - 1];
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
        const next = chars[i + 1] ? hMap[1][chars[i + 1]] : '';
        if (next && !vowels.includes(next[0])) {
          out += next[0];
        }
        continue
      }
      // look ahead at greedy multi-char sequences
      if (hasMulti.has(c)) {
        if (chars[i + 1]) {
          const two = c + chars[i + 1];
          if (hMap[2].hasOwnProperty(two)) {
            out += hMap[2][two];
            i += 1;
            continue
          }
          if (chars[i + 2]) {
            const three = c + chars[i + 1] + chars[i + 2];
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
      const c = str[i];
      out += c >= 'ァ' && c <= 'ヶ' ? String.fromCharCode(c.charCodeAt(0) - 0x60) : c;
    }
    return out
  };

  const isKanji = (c) => c >= '一' && c <= '龯';

  // the kun-reading is written 'い.く' - the part before the dot is what the
  // kanji itself spells;  the rest is the okurigana already in the text
  const kunStem = (kun) => kun.split('.')[0];

  const soundOut = function (char, type) {
    const r = readings$1[char];
    if (!r) {
      return char
    }
    const [kun, on] = r.split('|');
    const pick = type === 'kun' ? kun || on : on || kun;
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
    const reading = words[root];
    if (!reading) {
      return null
    }
    // the kanji sit at the front of both the word and its root
    const stem = root.split('').findIndex(c => !isKanji(c));
    if (stem <= 0) {
      return null
    }
    const okurigana = root.slice(stem);
    if (!reading.endsWith(okurigana)) {
      return null
    }
    const kanjiSound = reading.slice(0, reading.length - okurigana.length);
    return word.startsWith(root.slice(0, stem)) ? kanjiSound + word.slice(stem) : null
  };

  const spellKanji = function (word, type, root) {
    if (words[word] !== undefined) {
      return words[word]
    }
    if (root && root !== word) {
      const viaRoot = fromRoot(word, root);
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
      const use = (run.length > 1 ? 'on' : 'kun');
      run.split('').forEach(c => {
        out += soundOut(c, use);
      });
    }
    return out
  };

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
          word = spellKanji(word, null, term.root || roots[word]);
        }
        term.romanji = toRomanji(word);
      });
    });
    return view
  };

  const readings = function (view) {
    view.document.forEach(terms => {
      terms.forEach(term => {
        if (/[一-龯]/.test(term.text)) {
          term.reading = spellKanji(term.normal, null, term.root || roots[term.normal]);
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

  // import unicode from './unicode.js'
  // import contractions from './contractions.js'

  var tokenizer = {
    // mutate: (world) => {
    //   world.model.one.unicode = unicode
    //   world.model.one.contractions = contractions
    // },
    methods: {
      toTerms: tokenize$1
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
        return cli[c](tag)
      });
    }
    return tags.join(', ')
  };

  const showTags = function (view) {
    const { docs, model } = view;
    if (docs.length === 0) {
      console.log(cli.blue('\n     ──────'));
    }
    docs.forEach(terms => {
      console.log(cli.blue('\n  ┌─────────'));
      terms.forEach(t => {
        const tags = [...(t.tags || [])];
        let text = t.text || '-';
        if (t.sense) {
          text = `{${t.normal}/${t.sense}}`;
        }
        if (t.implicit) {
          text = '[' + t.implicit + ']';
        }
        text = cli.yellow(text);
        let word = "'" + text + "'";
        // word = word.padEnd(15)
        if (t.english) {
          word += cli.i(` {${t.english}}`.padEnd(6));
        }
        if (t.reference) {
          const str = view.update([t.reference]).text('normal');
          word += ` - ${cli.dim(cli.i('[' + str + ']'))}`;
        }
        word = word.padEnd(18);
        const str = cli.blue('  │ ') + cli.i(word) + '  - ' + tagString(tags, model);
        console.log(str);
      });
    });
  };

  /* eslint-disable no-console */

  function isClientSide() {
    return typeof window !== 'undefined' && window.document
  }
  //output some helpful stuff to the console
  const debug = function (opts = {}) {
    const view = this;
    if (typeof opts === 'string') {
      const tmp = {};
      tmp[opts] = true; //allow string input
      opts = tmp;
    }
    if (isClientSide()) {
      return view
    }
    if (opts.tags !== false) {
      showTags(view);
      console.log('\n');
    }
    return view
  };

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

  const isKnown$1 = (w) => lexicon.hasOwnProperty(w);

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
          const found = deconjugate(term.text, isKnown$1);
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

  const methods = { debug };

  const api = function (View) {
    Object.assign(View.prototype, methods);
  };
  var output = {
    compute: { english: addEnglish, root: addRoot },
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
    // 助数詞 - the counter after a number.  japanese can't count a noun
    // directly: it's 本を三冊, never 三本
    Counter: {
      is: 'Noun',
      not: ['Verb', 'Adjective', 'Adverb'],
    },
    // 時, 分, 秒 - a point on the clock
    TimeCounter: {
      is: 'Counter',
    },
    // 時間, 週間, ヶ月 - a span of time
    DurationCounter: {
      is: 'Counter',
      also: ['Duration'],
    },
    // 年, 月, 日 - a date *or* a duration, depending on context
    DateCounter: {
      is: 'Counter',
    },
    // the number and its counter, together - 三冊, 2時間
    NumberPhrase: {},
    Percent: {
      is: 'Value',
    },
  };

  var dates = {
    Date: {
      not: ['Verb', 'Adverb', 'Adjective'],
    },
    // 3月 - the number keeps its #Value, so Month can't inherit from #Singular
    // the way the english tagset does (#Noun and #Value are exclusive)
    Month: {
      is: 'Date',
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
    // 十日 - the day-of-the-month
    Day: {
      is: 'Date',
    },
    // 令和, 平成, 昭和 - the japanese regnal eras
    Era: {
      is: 'Date',
    },
    // 午前 / 午後
    AmPm: {
      is: 'Time',
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

  const tags = Object.assign({}, nouns, verbs$1, values, dates, particles, misc);

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
      const str = term.text;
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

  // what a particle tells us about the word in front of it.
  // this is the workhorse of japanese pos-tagging: the particle *is* the syntax.
  const reason$6 = 'particle';

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
      const t = terms[i];
      const prev = terms[i - 1];
      const next = terms[i + 1];
      const str = t.text;

      // な before a noun is the adnominal copula (静かな人), not a final particle
      if (str === 'な' && next && !next.tags.has('Verb')) {
        setTag([t], 'AdnominalParticle', world, null, reason$6);
        if (prev) {
          setTag([prev], 'NaAdjective', world, null, reason$6);
        }
        continue
      }
      // か at the end of a clause is a question-marker, not 'or'
      if (str === 'か' && (!next || next.tags.has('SentenceParticle'))) {
        setTag([t], 'SentenceParticle', world, null, reason$6);
        setTag([t], 'QuestionWord', world, null, reason$6);
        continue
      }
      // と after a verb introduces a quote;  between two nouns it means 'and'
      if (str === 'と' && prev) {
        if (prev.tags.has('Verb') || prev.tags.has('Copula')) {
          setTag([t], 'QuotativeParticle', world, null, reason$6);
          continue
        }
        if (next && !next.tags.has('Verb')) {
          setTag([t], 'Conjunction', world, null, reason$6);
        }
      }
      // で after a noun is 'at/by'; after a な-adjective it's the copula
      if (str === 'で' && prev && prev.tags.has('NaAdjective')) {
        setTag([t], 'Copula', world, null, reason$6);
        setTag([t], 'Gerund', world, null, reason$6);
        continue
      }

      // a particle never marks another particle
      if (!prev || prev.tags.has('Particle')) {
        continue
      }
      if (nounBefore[str] !== undefined) {
        if (!prev.tags.has('Verb') && !prev.tags.has('Adjective')) {
          setTag([prev], nounBefore[str], world, null, reason$6);
        } else if (str === 'の' || str === 'が') {
          // 走るの / 行くが - the verb is nominalized or the clause continues
          setTag([t], str === 'の' ? 'AdnominalParticle' : 'ConjunctiveParticle', world, null, reason$6);
        }
        continue
      }
      if (softNounBefore.has(str) && !prev.tags.has('Verb') && !prev.tags.has('Adjective') && prev.tags.size <= 1) {
        setTag([prev], 'Noun', world, null, reason$6);
        continue
      }
      if (verbBefore.has(str) && prev.tags.size <= 1) {
        setTag([prev], 'Verb', world, null, reason$6);
      }
    }
  };

  const reason$5 = 'verbSuffix';
  const isKnown = (w) => lexicon$2.hasOwnProperty(w);
  const scriptOnly$1 = new Set(['Kanji', 'Hiragana', 'Katakana', 'Ascii']);

  // a verb we've never seen can still be read off its ending.
  // 「散歩した」 is a verb even if 散歩する isn't in the lexicon.
  const tagUnknownVerbs = function (terms, setTag, world) {
    terms.forEach(term => {
      // only guess at words the lexicon hasn't already resolved.
      // すみません is an expression, not the negative of a verb 済む.
      const known = [...term.tags].some(t => !scriptOnly$1.has(t));
      if (known) {
        return
      }
      if (term.text.length < 2) {
        return
      }
      const found = deconjugate(term.text, isKnown);
      if (!found || found.guess === true) {
        return
      }
      found.tags.forEach(tag => setTag([term], tag, world, null, reason$5));
      term.root = found.root;
    });
  };

  // する attaches to the noun before it - 「勉強 します」
  const tagSuruVerbs = function (terms, setTag, world) {
    for (let i = 1; i < terms.length; i += 1) {
      const t = terms[i];
      if (!t.tags.has('Verb')) {
        continue
      }
      if (/^(し|す|さ)/.test(t.text) === false) {
        continue
      }
      const prev = terms[i - 1];
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
    const set = new Set();
    list.forEach(dict => {
      const forms = conjugate$1(dict);
      if (forms) {
        Object.keys(forms).forEach(k => typeof forms[k] === 'string' && set.add(forms[k]));
      }
    });
    return set
  };
  const isAspect = formsOf(aspectVerbs);
  const isHelper = formsOf(otherHelpers);

  const tagCompoundVerbs = function (terms, setTag, world) {
    for (let i = 1; i < terms.length; i += 1) {
      const t = terms[i];
      const prev = terms[i - 1];
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
      const t = terms[i];
      if (!t.tags.has('Auxiliary')) {
        continue
      }
      const prev = terms[i - 1];
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

  const reason$4 = 'adjSuffix';

  // い-adjective endings.  the old rule was 'ends in い → Adjective', which
  // swallowed every negative verb (行かない), every masu-stem noun (お願い),
  // and 弟/はい/せい besides.
  const looksAdjective = /(し|た|な|か|ら|わ|が|ば|ざ|さ|は|ま|よ|る|す|つ|ぬ|ぶ|む|ぐ|ゆ|ろ|そ|お|こ|の|ほ|も|ど|ぼ|ぽ|ご|ぞ|づ|べ|で|げ|ぜ|え|け|せ|て|ね|へ|め|れ)い$/;
  // endings that look like an い-adjective but aren't
  const notAdjective = /(ない|たい|らしい|っぽい)$/;

  const adjSuffixes = function (terms, setTag, world) {
    terms.forEach(term => {
      const str = term.text;
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
        setTag([term], 'Adjective', world, null, reason$4);
        setTag([term], 'IAdjective', world, null, reason$4);
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

  const reason$3 = 'honorific';

  // 田中さん - an honorific proves the word before it is a person
  const tagPeople = function (terms, setTag, world) {
    for (let i = 0; i < terms.length; i += 1) {
      const t = terms[i];
      if (!t.tags.has('Honorific')) {
        continue
      }
      const prev = terms[i - 1];
      if (prev && !prev.tags.has('Verb') && !prev.tags.has('Particle')) {
        setTag([prev], 'Person', world, null, reason$3);
      }
    }
    // 田中さん may have tokenized as one word - the suffix is still a signal
    terms.forEach(term => {
      if (term.text.length > 2 && /(さん|様|さま|ちゃん|くん|氏)$/.test(term.text) && term.tags.size <= 1) {
        setTag([term], 'Person', world, null, reason$3);
      }
    });
  };

  // 助数詞 - counters.
  // japanese can't count a noun directly: it's 本を三冊, never 三本.
  // the counter says what *kind* of thing is being counted, so it's the closest
  // thing japanese has to a unit.
  //
  // the value is the tag the counter gets, on top of #Counter.
  var counters = {
    // ---- generic ----
    'つ': 'Counter',      // native numerals - 一つ, 二つ
    '個': 'Counter',
    'ヶ': 'Counter',
    '箇': 'Counter',
    '件': 'Counter',
    '点': 'Counter',
    '品': 'Counter',

    // ---- living things ----
    '人': 'Counter',      // people
    '名': 'Counter',      // people, formal
    '匹': 'Counter',      // small animals
    '頭': 'Counter',      // large animals
    '羽': 'Counter',      // birds, rabbits
    '尾': 'Counter',      // fish

    // ---- shapes ----
    '本': 'Counter',      // long thin things - pens, bottles, trees
    '枚': 'Counter',      // flat things - paper, plates, shirts
    '冊': 'Counter',      // bound things - books
    '台': 'Counter',      // machines, vehicles
    '軒': 'Counter',      // buildings
    '棟': 'Counter',
    '隻': 'Counter',      // ships
    '着': 'Counter',      // clothing
    '足': 'Counter',      // footwear, in pairs
    '杯': 'Counter',      // cupfuls
    '皿': 'Counter',
    '粒': 'Counter',
    '束': 'Counter',
    '組': 'Counter',
    '対': 'Counter',
    '通': 'Counter',      // letters
    '通り': 'Counter',
    '切れ': 'Counter',
    '面': 'Counter',
    '部': 'Counter',
    '室': 'Counter',
    '席': 'Counter',
    '発': 'Counter',
    '筆': 'Counter',

    // ---- time ----
    '秒': 'TimeCounter',
    '分': 'TimeCounter',
    '時': 'TimeCounter',
    '時間': 'DurationCounter',
    '分間': 'DurationCounter',
    '秒間': 'DurationCounter',
    '日間': 'DurationCounter',
    '週': 'DurationCounter',
    '週間': 'DurationCounter',
    'ヶ月': 'DurationCounter',
    'か月': 'DurationCounter',
    'カ月': 'DurationCounter',
    '箇月': 'DurationCounter',
    'ヵ月': 'DurationCounter',
    '年間': 'DurationCounter',
    '世紀': 'DurationCounter',
    '泊': 'DurationCounter',
    // 年/月/日 are dates *or* durations, decided by context in 07-dates.js
    '年': 'DateCounter',
    '月': 'DateCounter',
    '日': 'DateCounter',

    // ---- money ----
    '円': 'Currency',
    'ドル': 'Currency',
    'ユーロ': 'Currency',
    'ポンド': 'Currency',
    '元': 'Currency',
    'ウォン': 'Currency',
    '銭': 'Currency',

    // ---- measures ----
    '歳': 'Counter',      // years of age
    '才': 'Counter',
    '度': 'Counter',      // degrees, occurrences
    '回': 'Counter',      // times
    '倍': 'Counter',      // -fold
    '割': 'Counter',      // tenths
    '%': 'Percent',
    '％': 'Percent',
    'パーセント': 'Percent',
    'メートル': 'Counter',
    'キロ': 'Counter',
    'センチ': 'Counter',
    'ミリ': 'Counter',
    'グラム': 'Counter',
    'キロメートル': 'Counter',
    'キログラム': 'Counter',
    'リットル': 'Counter',
    'トン': 'Counter',
    'インチ': 'Counter',
    'ページ': 'Counter',
    '頁': 'Counter',
    '階': 'Counter',      // storeys
    '号': 'Counter',
    '章': 'Counter',
    '課': 'Counter',
    '番': 'Ordinal',      // 三番 - third
    '番目': 'Ordinal',
    '個目': 'Ordinal',
    '人目': 'Ordinal',
    '回目': 'Ordinal',
    '位': 'Ordinal',
  };

  const reason$2 = 'number';

  const allNumeral = function (str) {
    for (let i = 0; i < str.length; i += 1) {
      if (!isNumeral(str[i])) {
        return false
      }
    }
    return str.length > 0
  };

  // 一つ, 二つ - the native numerals fuse with their counter
  const nativeNumeral = /^([一二三四五六七八九]|ひと|ふた|みっ|よっ|いつ|むっ|なな|やっ|ここの)つ$/;
  const nativeValue = {
    ひとつ: 1, ふたつ: 2, みっつ: 3, よっつ: 4, いつつ: 5,
    むっつ: 6, ななつ: 7, やっつ: 8, ここのつ: 9, とお: 10,
  };

  /**
   * tag numbers, and the counter that follows them.
   * 本 is a book far more often than it's a counter for long objects - the only
   * thing that makes it a counter is a number sitting in front of it.
   */
  const tagNumbers = function (terms, setTag, world) {
    for (let i = 0; i < terms.length; i += 1) {
      const t = terms[i];
      const str = t.text;

      // ---- is this a number? ----
      let value = null;
      if (nativeValue[str] !== undefined) {
        value = nativeValue[str];
      } else if (nativeNumeral.test(str)) {
        value = toNumber(str.slice(0, -1));
      } else if (allNumeral(str)) {
        value = toNumber(str);
      }
      // 何人, 何冊 - 'how many' takes a counter exactly like a number does,
      // but there's no value to record
      const isQuestion = str === '何' || str === 'なん' || str === '幾' || str === 'いく';
      if (value === null && !isQuestion) {
        continue
      }
      if (value !== null) {
        setTag([t], 'Value', world, null, reason$2);
        setTag([t], 'Cardinal', world, null, reason$2);
        t.number = value;
      }

      // ---- is the next word its counter? ----
      const next = terms[i + 1];
      if (!next || counters[next.text] === undefined) {
        continue
      }
      // a counter can't also be the verb or particle it looks like
      if (next.tags.has('Verb') || next.tags.has('Particle')) {
        continue
      }
      const kind = counters[next.text];
      // #Percent and #Ordinal live in the #Value family, which is exclusive
      // with #Noun - tagging those #Counter as well would just strip it again
      if (kind === 'Percent' || kind === 'Ordinal') {
        setTag([next], kind, world, null, reason$2);
      } else {
        setTag([next], 'Counter', world, null, reason$2);
        if (kind !== 'Counter') {
          setTag([next], kind, world, null, reason$2);
        }
      }
      // mark the pair, so `#NumberPhrase` finds 三冊 and 2時間
      setTag([t, next], 'NumberPhrase', world, null, reason$2);
      if (value !== null) {
        next.number = value;
      }
    }
  };

  const reason$1 = 'date';

  // 年, 月 and 日 are the same word whether they mean a date or a span of time.
  // 三月 is March, but 三ヶ月 is three months;  十日 is the 10th, but 十日間 is
  // ten days.  the number in front, and the word behind, decide which.
  const dateCounter = { '年': 'Year', '月': 'Month', '日': 'Day' };

  const inRange = { Year: [1, 9999], Month: [1, 12], Day: [1, 31] };

  const tagDates = function (terms, setTag, world) {
    for (let i = 0; i < terms.length; i += 1) {
      const t = terms[i];
      const prev = terms[i - 1];
      const next = terms[i + 1];

      // ---- 令和5年 - an era makes the number after it a year ----
      if (t.tags.has('Era') && next && next.tags.has('Value')) {
        const after = terms[i + 2];
        if (after && after.text === '年') {
          setTag([next], 'Year', world, null, reason$1);
          setTag([after], 'Year', world, null, reason$1);
          setTag([t, next, after], 'Date', world, null, reason$1);
          i += 2;
          continue
        }
      }

      // ---- 3時30分 - a point on the clock ----
      if (t.tags.has('Value') && next && next.text === '時' && next.tags.has('Counter')) {
        setTag([t, next], 'Time', world, null, reason$1);
        setTag([t, next], 'Date', world, null, reason$1);
        // ..and the 分 that may follow it
        const n2 = terms[i + 2];
        const n3 = terms[i + 3];
        if (n2 && n3 && n2.tags.has('Value') && n3.text === '分') {
          setTag([n2, n3], 'Time', world, null, reason$1);
          setTag([n2, n3], 'Date', world, null, reason$1);
          i += 3;
        } else {
          i += 1;
        }
        continue
      }

      // ---- 1995年 / 3月 / 10日 ----
      if (!t.tags.has('Value') || !next || dateCounter[next.text] === undefined) {
        continue
      }
      if (!next.tags.has('Counter')) {
        continue
      }
      const kind = dateCounter[next.text];
      const value = t.number;

      // 三日間 / 十年間 - 間 turns any of them into a span
      const after = terms[i + 2];
      if (after && (after.text === '間' || after.text === 'ぶり' || after.text === '目')) {
        setTag([next], 'Duration', world, null, reason$1);
        i += 1;
        continue
      }
      // a number outside the calendar's range is a count, not a date -
      // 「五十年」 is fifty years, not the year 50 of anything
      const [lo, hi] = inRange[kind];
      if (typeof value !== 'number' || value < lo || value > hi) {
        setTag([next], 'Duration', world, null, reason$1);
        i += 1;
        continue
      }
      // 年 only reads as a calendar year when it's a plausible one
      if (kind === 'Year' && value < 100 && !(prev && prev.tags.has('Era'))) {
        setTag([next], 'Duration', world, null, reason$1);
        i += 1;
        continue
      }
      setTag([t], kind, world, null, reason$1);
      setTag([next], kind, world, null, reason$1);
      setTag([t, next], 'Date', world, null, reason$1);
      i += 1;
    }

    // ---- 三時半, 一時間半 - 半 is the 'half' after a time ----
    terms.forEach((t, i) => {
      if (t.text !== '半' || i === 0) {
        return
      }
      const prev = terms[i - 1];
      if (prev.tags.has('TimeCounter') || prev.tags.has('DurationCounter')) {
        setTag([t], prev.tags.has('TimeCounter') ? 'Time' : 'Duration', world, null, reason$1);
        setTag([t], 'Date', world, null, reason$1);
      }
    });

    // ---- 午前/午後 belong to the time beside them ----
    terms.forEach((t, i) => {
      if (!t.tags.has('AmPm')) {
        return
      }
      const next = terms[i + 1];
      if (next && next.tags.has('Date')) {
        setTag([t], 'Date', world, null, reason$1);
      }
    });
  };

  // anything still unlabelled at the end is a noun - the safest guess in japanese
  const reason = 'noun-fallback';
  const scriptOnly = new Set(['Kanji', 'Hiragana', 'Katakana', 'Ascii']);

  const fallback = function (terms, setTag, world) {
    terms.forEach(term => {
      const tags = [...term.tags];
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
      tagScript(terms, setTag, world);
      // 2. verbs we don't have in the lexicon, read off their conjugation
      verbs.tagUnknownVerbs(terms, setTag, world);
      // 3. い-adjectives by their shape
      adjectives.adjSuffixes(terms, setTag, world);
      // 4. particles, and what they imply about their neighbour
      tagParticles(terms, setTag, world);
      // 5. 勉強 + します
      verbs.tagSuruVerbs(terms, setTag, world);
      // 6. an auxiliary passes its tense back to its verb
      verbs.tagAuxiliary(terms, setTag, world);
      // 7. 読んで + いました is one progressive verb-phrase
      verbs.tagCompoundVerbs(terms, setTag, world);
      // 8. numbers, and the counter that follows them
      tagNumbers(terms, setTag, world);
      // 9. dates and times, built out of number + counter
      tagDates(terms, setTag, world);
      // 10. plural and honorific suffixes
      adjectives.nounSuffixes(terms, setTag, world);
      tagPeople(terms, setTag, world);
      // 11. whatever's left is a noun
      fallback(terms, setTag, world);
    });
    return view
  };

  var preTagger = {
    compute: {
      preTagger: preTagger$1
    },

    hooks: ['preTagger'],
  };

  var version = '0.1.0';

  // a number → 漢数字.
  //
  // japanese numerals are fully compositional - 23 is 二十三, literally
  // 'two-ten-three' - so this is arithmetic rather than a lookup table.
  // the one wrinkle is that japanese groups by 10,000 (万) and not by 1,000.

  const digit = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  // powers that stack inside a group of four digits
  const small = [['千', 1000], ['百', 100], ['十', 10]];
  // powers that close a group off
  const large = [['京', 1e16], ['兆', 1e12], ['億', 1e8], ['万', 1e4]];

  // one group of four digits: 千百十 plus the remaining digit
  const toGroup = function (n) {
    let out = '';
    for (let i = 0; i < small.length; i += 1) {
      const [kanji, power] = small[i];
      const d = Math.floor(n / power);
      if (d === 0) {
        continue
      }
      // 一十 and 一百 aren't written - 10 is 十, not 一十
      out += (d === 1 ? '' : digit[d]) + kanji;
      n -= d * power;
    }
    return out + digit[n]
  };

  /** 23 → 二十三 */
  const toKanji = function (num) {
    if (typeof num !== 'number' || !Number.isFinite(num)) {
      return null
    }
    if (num < 0) {
      return 'マイナス' + toKanji(Math.abs(num))
    }
    num = Math.round(num);
    if (num === 0) {
      return '〇'
    }
    let out = '';
    for (let i = 0; i < large.length; i += 1) {
      const [kanji, power] = large[i];
      const chunk = Math.floor(num / power);
      if (chunk === 0) {
        continue
      }
      // 万 and up keep their 一 - 10,000 is 一万, never just 万
      out += toGroup(chunk) + kanji;
      num -= chunk * power;
    }
    return out + toGroup(num)
  };

  // 23 → '23',  using the same width of digit the source used
  const fullWidth = '０１２３４５６７８９';
  const toDigits = function (num, wide) {
    const str = String(num);
    if (!wide) {
      return str
    }
    return str.replace(/[0-9]/g, d => fullWidth[Number(d)])
  };

  const isWide = /[０-９]/;
  const isKanjiNumeral = /[〇零一二三四五六七八九十百千万億兆壱弐参拾]/;

  // pull the number out of a match, along with how it was written
  const parse = function (view) {
    const terms = view.docs[0] || [];
    let term = terms.find(t => typeof t.number === 'number');
    if (!term) {
      // not computed yet - read it off the text
      term = terms[0];
      const num = term ? toNumber(term.text) : null;
      return { num, term, kanji: term ? isKanjiNumeral.test(term.text) : false, wide: false }
    }
    return {
      num: term.number,
      term,
      kanji: isKanjiNumeral.test(term.text),
      wide: isWide.test(term.text),
    }
  };

  // swap a term's text in place.  .replaceWith() would put a space between the
  // number and its counter, and japanese doesn't use one - 五冊, never 五 冊
  const setText = function (term, str, num) {
    term.text = str;
    term.normal = str.toLowerCase();
    if (typeof num === 'number') {
      term.number = num;
    }
  };

  // write a number back in the shape it was found in
  const write = function (view, num, form) {
    const { term, kanji, wide } = parse(view);
    if (!term || typeof num !== 'number') {
      return view
    }
    let str;
    if (form === 'kanji' || (form === undefined && kanji)) {
      str = toKanji(num);
    } else {
      str = toDigits(num, form === undefined ? wide : false);
    }
    if (str === null) {
      return view
    }
    setText(term, str, num);
    return view
  };


  const addMethod = function (View) {
    class Numbers extends View {
      constructor(document, pointer, groups) {
        super(document, pointer, groups);
        this.viewType = 'Numbers';
      }
      /** the parsed number, plus how it was written */
      parse(n) {
        return this.getNth(n).map(parse)
      }
      /** the value of each number - 「二十三」 gives 23 */
      get(n) {
        // the second .map is a plain Array.map - compromise's own .map() only
        // unwraps to an array when the callback returns strings or objects
        return this.getNth(n).map(parse).map(o => o.num)
      }
      json(n) {
        const opts = typeof n === 'object' ? n : {};
        return this.getNth(n).map(m => {
          const json = m.toView().json(opts)[0];
          const found = parse(m);
          json.number = { num: found.num, counter: m.units().text() || null };
          return json
        }, [])
      }
      /** the 助数詞 attached to each number - 五冊 gives 冊 */
      units() {
        return this.growRight('#Counter').match('#Counter$')
      }
      /** only the ordinals - 三番目 */
      isOrdinal() {
        return this.if('#Ordinal')
      }
      /** only the cardinals */
      isCardinal() {
        return this.if('#Cardinal')
      }
      /** write each number in digits - 二十三 becomes 23 */
      toNumber() {
        this.forEach(m => {
          const { num } = parse(m);
          if (num !== null) {
            write(m, num, 'digits');
          }
        });
        return this
      }
      /** write each number in kanji - 23 becomes 二十三 */
      toText() {
        this.forEach(m => {
          const { num } = parse(m);
          if (num !== null) {
            write(m, num, 'kanji');
          }
        });
        return this
      }
      /** add thousands-separators - 1234 becomes 1,234 */
      toLocaleString() {
        this.forEach(m => {
          const { num, term } = parse(m);
          if (num === null || !term) {
            return
          }
          setText(term, num.toLocaleString(), num);
        });
        return this
      }
      /** replace each number with this one, keeping its script */
      set(n) {
        if (typeof n !== 'number') {
          return this
        }
        this.forEach(m => write(m, n));
        return this
      }
      add(n) {
        if (typeof n !== 'number') {
          return this
        }
        this.forEach(m => {
          const { num } = parse(m);
          if (num !== null) {
            write(m, num + n);
          }
        });
        return this
      }
      subtract(n) {
        return this.add(-1 * n)
      }
      increment() {
        return this.add(1)
      }
      decrement() {
        return this.add(-1)
      }
      isEqual(n) {
        return this.filter(m => parse(m).num === n)
      }
      greaterThan(n) {
        return this.filter(m => parse(m).num > n)
      }
      lessThan(n) {
        return this.filter(m => parse(m).num < n)
      }
      between(min, max) {
        return this.filter(m => {
          const { num } = parse(m);
          return num > min && num < max
        })
      }
      update(pointer) {
        const m = new Numbers(this.document, pointer);
        m._cache = this._cache;
        return m
      }
    }

    /** every number in the document */
    View.prototype.numbers = function (n) {
      let m = this.match('#Value+');
      m = new Numbers(this.document, m.pointer);
      return typeof n === 'number' ? m.eq(n) : m
    };
    /** .numbers() alias, to match english compromise */
    View.prototype.values = View.prototype.numbers;

    /** every 助数詞 in the document */
    View.prototype.counters = function (n) {
      const m = this.match('#Counter');
      return typeof n === 'number' ? m.eq(n) : m
    };
    /** every 円/ドル amount */
    View.prototype.money = function (n) {
      const m = this.match('#Value+ #Currency');
      return typeof n === 'number' ? m.eq(n) : m
    };
    /** every percentage */
    View.prototype.percentages = function (n) {
      const m = this.match('#Value+ #Percent');
      return typeof n === 'number' ? m.eq(n) : m
    };
  };

  var numbers = { api: addMethod };

  nlp.plugin(tokenizer);
  nlp.plugin(tagset);
  nlp.plugin(lexicon$1);
  nlp.plugin(output);
  nlp.plugin(romanji);
  nlp.plugin(preTagger);
  nlp.plugin(numbers);

  const ja = function (txt, lex) {
    // split sentences
    const doc = nlp.tokenize(txt, lex);
    // tokenize terms ourselves - compromise splits on whitespace, which japanese
    // mostly doesn't use.  every whitespace-chunk still needs splitting, so run
    // the tokenizer over each of them and keep their surrounding punctuation.
    doc.document = doc.document.map(a => {
      let out = [];
      // if the sentence has spaces in it, they're real word-boundaries
      const spaced = a.length > 1;
      a.forEach(term => {
        const terms = tokenize(term.text, spaced);
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
    const world = nlp.world();
    doc.compute(world.hooks);
    return doc
  };

  // copy constructor methods over
  Object.keys(nlp).forEach(k => {
    if (nlp.hasOwnProperty(k)) {
      ja[k] = nlp[k];
    }
  });

  // this one is hidden
  Object.defineProperty(ja, '_world', {
    value: nlp._world,
    writable: true,
  });
  /** log the decision-making to console */
  ja.verbose = function (set) {
    const env = typeof process === 'undefined' ? self.env || {} : process.env; //use window, in browser
    env.DEBUG_TAGS = set === 'tagger' || set === true ? true : '';
    env.DEBUG_MATCH = set === 'match' || set === true ? true : '';
    env.DEBUG_CHUNKS = set === 'chunker' || set === true ? true : '';
    return this
  };

  // conjugation helpers, usable without a document
  Object.assign(ja, methods$1);

  /** parse a japanese numeral - nlp.toNumber('二十三') === 23 */
  ja.toNumber = toNumber;

  /** write a number in kanji - nlp.toKanji(23) === '二十三' */
  ja.toKanji = toKanji;

  ja.version = version;

  return ja;

}));
