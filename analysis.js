/* Search Trend Velocity Studio - analysis engine
 * Pure functions used by the browser UI and by Node-based tests.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TrendAnalysis = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function normalizeText(value) {
    return String(value == null ? '' : value)
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function monthIndex(iso) {
    if (!iso || iso.length < 7) return -1;
    var m = parseInt(iso.slice(5, 7), 10);
    return Number.isFinite(m) && m >= 1 && m <= 12 ? m - 1 : -1;
  }

  /**
   * Turn a dictionary term into a matcher.
   *
   * Matching is intentionally forgiving (substring based) because scent words
   * frequently sit inside brand names: "flowerbomb" should match "flower".
   * Short words (<= 4 characters) get word boundaries so "tea" does not match
   * "steam" and "tar" does not match "tartar". Wildcards * and ? are supported.
   */
  function termToMatcher(raw) {
    if (typeof raw !== 'string') return null;
    var original = raw;
    var leading = /^\s/.test(original);
    var trailing = /\s$/.test(original);
    var term = original
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^["']+|["']+$/g, '')
      .trim();

    if (!term) return null;

    var hasWildcard = /[*?]/.test(term);
    var body = escapeRegExp(term)
      .replace(/\\\*/g, '.*')
      .replace(/\\\?/g, '.');
    var isShortWord =
      !hasWildcard &&
      !leading &&
      !trailing &&
      /^[a-z0-9]+$/i.test(term) &&
      term.length <= 4;

    var pattern = body;
    if (leading && /^[a-z0-9]/i.test(term)) pattern = '\\b' + pattern;
    if (trailing && /[a-z0-9]$/i.test(term)) pattern = pattern + '\\b';
    if (isShortWord) pattern = '\\b' + pattern + '\\b';

    try {
      return {
        raw: original,
        term: term,
        label: term.replace(/[*?]+/g, '').trim(),
        regex: new RegExp(pattern, 'i'),
        literal:
          !hasWildcard && !leading && !trailing && !isShortWord
            ? term.toLowerCase()
            : null
      };
    } catch (error) {
      return {
        raw: original,
        term: term,
        regex: new RegExp(escapeRegExp(term), 'i'),
        literal: null
      };
    }
  }

  function termMatches(matcher, keywordLower) {
    if (matcher.literal != null) {
      return keywordLower.indexOf(matcher.literal) !== -1;
    }
    return matcher.regex.test(keywordLower);
  }

  // ------------------------------------------------------------ boolean queries
  // The fragrance group definitions are information-retrieval style queries:
  //   (note OR note ...) NEAR/3 (scent OR fragrance ...) OR #hashtag
  //   NOT (recipe OR cooking ...)
  // Supported: parentheses, quoted phrases, OR, AND, NOT, NEAR/n, * and ?
  // wildcards, and #hashtag prefixes (the # is dropped for matching).

  function foldText(value) {
    var text = String(value == null ? '' : value)
      .replace(/\u00a0/g, ' ')
      .toLowerCase();
    if (text.normalize) {
      text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    return text.replace(/[\u2018\u2019']/g, '');
  }

  /** Split a search keyword into comparable words. */
  function keywordTokens(value) {
    var text = foldText(value).replace(/[^a-z0-9]+/g, ' ').trim();
    return text ? text.split(' ') : [];
  }

  /** Split a query atom, keeping wildcards. */
  function atomWords(value) {
    var text = foldText(value).replace(/[^a-z0-9*?]+/g, ' ').trim();
    return text ? text.split(' ') : [];
  }

  /** Very light English stemming so "scented" matches "scent" and "perfumes" matches "perfume". */
  function stemWord(word) {
    if (!word || word.length <= 3) return word;
    if (/ies$/.test(word) && word.length > 4) return word.slice(0, -3) + 'y';
    if (/es$/.test(word) && word.length > 4 && !/ses$/.test(word)) return word.slice(0, -2);
    if (/s$/.test(word) && !/ss$/.test(word)) return word.slice(0, -1);
    if (/ing$/.test(word) && word.length > 5) return word.slice(0, -3);
    if (/ed$/.test(word) && word.length > 4) return word.slice(0, -2);
    return word;
  }

  function compileAtomToken(word) {
    if (word.indexOf('*') === -1 && word.indexOf('?') === -1) {
      return { literal: word, stem: stemWord(word), prefix: word };
    }
    var prefix = /^[a-z0-9]*/.exec(word)[0];
    var body = escapeRegExp(word)
      .replace(/\\\*/g, '.*')
      .replace(/\\\?/g, '.');
    return { regex: new RegExp('^' + body + '$'), prefix: prefix };
  }

  function atomTokenMatches(part, word) {
    if (part.literal != null) {
      if (word === part.literal) return true;
      return part.stem != null && stemWord(word) === part.stem;
    }
    return part.regex.test(word);
  }

  function makeAtomNode(value) {
    var raw = String(value == null ? '' : value).replace(/^#+/, '').trim();
    var words = atomWords(raw);
    return {
      type: 'atom',
      raw: raw,
      key: words.join(' '),
      tokens: words.map(compileAtomToken)
    };
  }

  function tokenizeQuery(text) {
    var source = foldText(text);
    var tokens = [];
    var i = 0;
    while (i < source.length) {
      var ch = source[i];
      if (/\s/.test(ch)) { i++; continue; }
      if (ch === '(' || ch === ')') {
        tokens.push({ type: ch });
        i++;
        continue;
      }
      if (ch === '"') {
        var close = source.indexOf('"', i + 1);
        if (close === -1) close = source.length;
        var phrase = source.slice(i + 1, close).trim();
        if (phrase) tokens.push({ type: 'atom', value: phrase });
        i = close + 1;
        continue;
      }
      var start = i;
      while (i < source.length && !/[\s()"]/.test(source[i])) i++;
      var word = source.slice(start, i);
      var upper = word.toUpperCase();
      if (upper === 'OR' || upper === 'AND' || upper === 'NOT') {
        tokens.push({ type: upper });
      } else if (/^NEAR\/\d+$/.test(upper)) {
        tokens.push({ type: 'NEAR', n: parseInt(upper.slice(5), 10) });
      } else if (word) {
        tokens.push({ type: 'atom', value: word });
      }
    }
    return tokens;
  }

  function parseQuery(text) {
    var tokens = tokenizeQuery(text);
    var pos = 0;

    function peek() { return tokens[pos]; }
    function next() { return tokens[pos++]; }
    function isType(token, type) { return !!token && token.type === type; }

    function parseExpr() {
      var left = parseOr();
      while (isType(peek(), 'NOT')) {
        next();
        left = { type: 'not', left: left, right: parseOr() };
      }
      return left;
    }

    function parseOr() {
      var left = parseAnd();
      while (isType(peek(), 'OR')) {
        next();
        left = { type: 'or', left: left, right: parseAnd() };
      }
      return left;
    }

    function parseAnd() {
      var left = parseNear();
      while (true) {
        var token = peek();
        if (!token) break;
        if (token.type === 'AND') {
          next();
          left = { type: 'and', left: left, right: parseNear() };
          continue;
        }
        // Implicit AND: two primaries written next to each other.
        if (token.type === '(' || token.type === 'atom') {
          left = { type: 'and', left: left, right: parseNear() };
          continue;
        }
        break;
      }
      return left;
    }

    function parseNear() {
      var left = parsePrimary();
      while (isType(peek(), 'NEAR')) {
        var distance = next().n;
        left = { type: 'near', n: distance, left: left, right: parsePrimary() };
      }
      return left;
    }

    function parsePrimary() {
      var token = next();
      if (!token) return { type: 'empty' };
      if (token.type === '(') {
        var inner = parseExpr();
        if (isType(peek(), ')')) next();
        return inner;
      }
      if (token.type === ')') return { type: 'empty' };
      if (token.type === 'NOT') {
        return { type: 'not', left: { type: 'neutral' }, right: parsePrimary() };
      }
      if (token.type === 'atom') return makeAtomNode(token.value);
      return { type: 'empty' };
    }

    return parseExpr();
  }

  /** Add extra context words to the right-hand side of every NEAR/n. */
  function attachContext(node, extra) {
    if (!node) return node;
    if (node.type === 'near') {
      node.left = attachContext(node.left, extra);
      node.right = { type: 'or', left: attachContext(node.right, extra), right: extra };
      return node;
    }
    if (node.type === 'or' || node.type === 'and' || node.type === 'not') {
      node.left = attachContext(node.left, extra);
      node.right = attachContext(node.right, extra);
    }
    return node;
  }

  // Words that name the category, the product or the retailer rather than a
  // note. A bare search for one of these ("perfume", "candle", "bath") carries
  // no fragrance-family signal, so the bare-note fallback ignores them.
  var BARE_NOTE_STOPWORDS = new Set([
    'bath', 'candle', 'candles', 'perfume', 'perfumes', 'cologne', 'fragrance',
    'fragrances', 'parfum', 'scent', 'scents', 'scented', 'smell', 'aroma',
    'bouquet', 'note', 'notes', 'spray', 'oil', 'oils', 'mist', 'lotion', 'soap',
    'wax', 'melt', 'melts', 'diffuser', 'incense', 'freshener', 'wash',
    'laundry', 'detergent', 'toilette', 'eau', 'edp', 'edt', 'air', 'room',
    'car', 'body', 'gift', 'set', 'dupe', 'dupes', 'home', 'image', 'images',
    'picture', 'pictures', 'meaning', 'word', 'list', 'names', 'name'
  ]);

  // Words that can sit around a note without changing what is being searched.
  var BARE_NOTE_FILLER = new Set([
    'pure', 'essential', 'natural', 'organic', 'real', 'true', 'raw',
    'undiluted', 'premium', 'best', 'cheap', 'luxury', 'bottle', 'large',
    'small', 'mini', 'big', 'black', 'white', 'red', 'pink', 'gold', 'silver',
    'blue', 'yellow', 'purple', 'clear', 'new', 'top', 'good', 'nice', 'oil',
    'spray', 'mist', 'wax', 'melt', 'freshener', 'base', 'grade', 'size',
    'woman', 'man', 'women', 'men', 'unisex', 'bulk', 'wholesale', 'sale',
    'type', 'style', 'scented', 'oz', 'ml'
  ]);

  // Short notes that are unambiguous even at three letters.
  var BARE_NOTE_SHORT = new Set(['oud', 'fig', 'fir']);

  /**
   * Index the distinctive single-word notes of every query group, so a bare
   * search such as "sandalwood" or "white musk" can still be classified.
   *
   * groups: [{ group, atoms }] where atoms come from compileQuery().
   */
  function makeBareNoteIndex(groups, frequency, maxWords) {
    var index = new Map();
    var allowed = {};
    groups.forEach(function (entry) {
      var words = new Set();
      entry.atoms.forEach(function (atom) {
        if (!atom.matcher) return;
        if (atom.context) return;
        atom.key.split(/\s+/).forEach(function (word) {
          var plain = word.replace(/[*?]+$/, '');
          if (plain) words.add(stemWord(plain));
        });
        if (atom.key.indexOf(' ') !== -1) return;
        var note = atom.key.replace(/[*?]+$/, '');
        if (!note) return;
        if (note.length < 3) return;
        if (note.length === 3 && !BARE_NOTE_SHORT.has(note)) return;
        if ((frequency[atom.key] || 0) >= 4) return;
        if (BARE_NOTE_STOPWORDS.has(note)) return;
        var key = stemWord(note);
        var list = index.get(key);
        if (!list) { list = []; index.set(key, list); }
        if (list.indexOf(entry.group) === -1) list.push(entry.group);
      });
      allowed[entry.group] = words;
    });
    return { index: index, allowed: allowed, maxWords: maxWords || 3 };
  }

  /**
   * Groups whose notes make up the whole keyword ("patchouli", "white musk",
   * "sandalwood oil"), ignoring filler words. Long or messy searches are left
   * alone, so "vanilla extract" and "rose garden" are not pulled in.
   */
  function bareNoteGroups(tokens, bare) {
    if (!bare || !tokens.length || tokens.length > bare.maxWords) return [];
    var stems = tokens.map(stemWord);
    var candidates = [];
    stems.forEach(function (word) {
      var groups = bare.index.get(word);
      if (!groups) return;
      groups.forEach(function (group) {
        if (candidates.indexOf(group) === -1) candidates.push(group);
      });
    });
    var hits = [];
    candidates.forEach(function (group) {
      var allowed = bare.allowed[group];
      var noteWord = null;
      for (var i = 0; i < stems.length; i++) {
        if (!allowed.has(stems[i]) && !BARE_NOTE_FILLER.has(stems[i])) return;
        if (!noteWord && bare.index.has(stems[i])) {
          var groups = bare.index.get(stems[i]);
          if (groups.indexOf(group) !== -1) noteWord = stems[i];
        }
      }
      if (noteWord) hits.push({ group: group, word: noteWord });
    });
    return hits;
  }

  function editDistance(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    var prev = [];
    for (var j = 0; j <= b.length; j++) prev[j] = j;
    for (var i = 1; i <= a.length; i++) {
      var cur = [i];
      for (var k = 1; k <= b.length; k++) {
        cur[k] = Math.min(prev[k] + 1, cur[k - 1] + 1, prev[k - 1] + (a.charAt(i - 1) === b.charAt(k - 1) ? 0 : 1));
      }
      prev = cur;
    }
    return prev[b.length];
  }

  /**
   * Fuzzy fallback for brand/product attribution: when no alias matches exactly,
   * try aliases whose tokens are within one edit of a keyword token. Only
   * multi-token aliases (or single tokens of >= 6 chars) are eligible, at most
   * one fuzzy token per alias, and the result is used only when exactly one
   * brand matches (otherwise the keyword stays unattributed).
   */
  function fuzzyMatchEntries(entries, keyword) {
    var kwTokens = keywordTokens(keyword);
    if (!kwTokens.length) return [];
    var groups = new Set();
    var matchedEntries = [];
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      if (!entry.matcher) continue;
      var aliasTokens = keywordTokens(entry.matcher.term);
      if (!aliasTokens.length) continue;
      if (aliasTokens.length === 1 && aliasTokens[0].length < 6) continue;
      if (aliasTokens.length > kwTokens.length) continue;
      var fuzzyCount = 0;
      var ki = 0;
      var ok = true;
      for (var ai = 0; ai < aliasTokens.length; ai++) {
        var found = false;
        while (ki < kwTokens.length) {
          var tol = aliasTokens[ai].length >= 5 ? 1 : 0;
          var d = editDistance(aliasTokens[ai], kwTokens[ki]);
          if (d <= tol) {
            if (d > 0) fuzzyCount++;
            if (fuzzyCount > 1) { ok = false; break; }
            ki++;
            found = true;
            break;
          }
          ki++;
        }
        if (!ok) break;
        if (!found) { ok = false; break; }
      }
      if (ok && fuzzyCount >= 1) {
        groups.add(entry.group);
        matchedEntries.push(entry);
      }
    }
    if (groups.size !== 1) return [];
    var targetGroup = groups.values().next().value;
    var out = [];
    for (var m = 0; m < matchedEntries.length; m++) {
      if (matchedEntries[m].group === targetGroup) out.push(matchedEntries[m]);
    }
    // keep only the best (longest alias) to avoid duplicate term hits
    out.sort(function (a, b) { return keywordTokens(b.matcher.term).length - keywordTokens(a.matcher.term).length; });
    return out.slice(0, 1);
  }

  function spanGap(a, b) {
    if (a.e < b.s) return b.s - a.e - 1;
    if (b.e < a.s) return a.s - b.e - 1;
    return 0;
  }

  function evalQueryNode(node, tokens) {
    if (!node) return [];
    var count = tokens.length;
    var left;
    var right;

    if (node.type === 'neutral') {
      return count ? [{ s: 0, e: count - 1 }] : [];
    }
    if (node.type === 'empty') return [];
    if (node.type === 'atom') {
      var spans = [];
      var parts = node.tokens;
      if (!parts.length) return spans;
      for (var i = 0; i + parts.length <= count; i++) {
        var ok = true;
        for (var j = 0; j < parts.length; j++) {
          if (!atomTokenMatches(parts[j], tokens[i + j])) { ok = false; break; }
        }
        if (ok) spans.push({ s: i, e: i + parts.length - 1 });
      }
      return spans;
    }
    if (node.type === 'or') {
      return evalQueryNode(node.left, tokens).concat(evalQueryNode(node.right, tokens));
    }
    if (node.type === 'and') {
      left = evalQueryNode(node.left, tokens);
      if (!left.length) return [];
      right = evalQueryNode(node.right, tokens);
      if (!right.length) return [];
      return left.concat(right);
    }
    if (node.type === 'not') {
      right = evalQueryNode(node.right, tokens);
      if (right.length) return [];
      return evalQueryNode(node.left, tokens);
    }
    if (node.type === 'near') {
      left = evalQueryNode(node.left, tokens);
      if (!left.length) return [];
      right = evalQueryNode(node.right, tokens);
      if (!right.length) return [];
      var hits = [];
      for (var p = 0; p < left.length; p++) {
        for (var q = 0; q < right.length; q++) {
          if (spanGap(left[p], right[q]) > node.n) continue;
          hits.push({ s: Math.min(left[p].s, right[q].s), e: Math.max(left[p].e, right[q].e) });
        }
        if (hits.length > 64) break;
      }
      return hits;
    }
    return [];
  }

  function collectPositiveAtoms(node, out, role) {
    role = role || 'primary';
    if (!node) return out;
    if (node.type === 'atom') {
      node.role = node.role || role;
      out.push(node);
      return out;
    }
    if (node.type === 'not') {
      return collectPositiveAtoms(node.left, out, 'primary');
    }
    if (node.type === 'near') {
      collectPositiveAtoms(node.left, out, 'note');
      collectPositiveAtoms(node.right, out, 'context');
      return out;
    }
    collectPositiveAtoms(node.left, out, role);
    collectPositiveAtoms(node.right, out, role);
    return out;
  }

  /**
   * Compile a boolean group definition into a matcher.
   * options.contextWords: extra product words (candle, wax melt, diffuser...)
   * that count as "search context" wherever a NEAR/n is used.
   * Returns null when the query is empty or unparseable.
   */
  function compileQuery(text, options) {
    if (typeof text !== 'string' || !text.trim()) return null;
    var ast;
    try {
      ast = parseQuery(text);
    } catch (error) {
      return null;
    }
    if (!ast || ast.type === 'empty') return null;

    var extra = null;
    var contextWords = options && Array.isArray(options.contextWords) ? options.contextWords : [];
    if (contextWords.length) {
      contextWords.forEach(function (word) {
        var node = makeAtomNode(word);
        if (!node.tokens.length) return;
        extra = extra ? { type: 'or', left: extra, right: node } : node;
      });
    }
    if (extra) attachContext(ast, extra);

    var atoms = [];
    var seen = new Set();
    collectPositiveAtoms(ast, []).forEach(function (node) {
      if (!node.tokens.length || seen.has(node.key)) return;
      seen.add(node.key);
      atoms.push({
        key: node.key,
        raw: node.raw,
        first: node.tokens[0],
        matcher: termToMatcher(node.raw),
        // Atoms living on the product/context side of a NEAR expression (or added
        // as context words) describe the category rather than a theme's terms.
        context: node.role === 'context'
      });
    });

    // Fast reject: if the keyword contains none of the atoms' first words, the
    // query cannot match, so skip the full evaluation.
    var literals = new Set();
    var prefixes = [];
    var alwaysOpen = false;
    atoms.forEach(function (atom) {
      var part = atom.first;
      if (!part) return;
      if (part.literal != null) literals.add(part.literal);
      else if (part.prefix) prefixes.push(part.prefix);
      else alwaysOpen = true;
    });

    function gate(tokens) {
      if (alwaysOpen) return true;
      for (var i = 0; i < tokens.length; i++) {
        if (literals.has(tokens[i])) return true;
      }
      if (!prefixes.length) return false;
      for (var t = 0; t < tokens.length; t++) {
        for (var p = 0; p < prefixes.length; p++) {
          if (tokens[t].lastIndexOf(prefixes[p], 0) === 0) return true;
        }
      }
      return false;
    }

    function testTokens(tokens) {
      if (!tokens.length) return false;
      if (!gate(tokens)) return false;
      return evalQueryNode(ast, tokens).length > 0;
    }

    return {
      text: text,
      ast: ast,
      atoms: atoms,
      testTokens: testTokens,
      test: function (keyword) {
        return testTokens(keywordTokens(keyword));
      }
    };
  }

  function computeGrowth(monthly, endIdx, window, dates) {
    if (!monthly || endIdx < 0 || !monthly.length) {
      return null;
    }
    var startIdx = Math.max(0, endIdx - window + 1);
    var start = Number(monthly[startIdx]) || 0;
    var end = Number(monthly[endIdx]) || 0;
    return {
      window: window,
      actualWindow: endIdx - startIdx + 1,
      startIdx: startIdx,
      endIdx: endIdx,
      start: start,
      end: end,
      growth: start > 0 ? (end - start) / start : null,
      startIso: dates[startIdx] || null,
      endIso: dates[endIdx] || null
    };
  }

  function seasonality(monthly, dates) {
    var sums = new Array(12).fill(0);
    var counts = new Array(12).fill(0);

    for (var i = 0; i < dates.length; i++) {
      var m = monthIndex(dates[i]);
      if (m >= 0) {
        sums[m] += Number(monthly[i]) || 0;
        counts[m] += 1;
      }
    }

    var avg = sums.map(function (sum, idx) {
      return counts[idx] ? sum / counts[idx] : 0;
    });
    var valid = avg.filter(function (value, idx) {
      return counts[idx] > 0;
    });
    var overall = valid.length
      ? valid.reduce(function (a, b) { return a + b; }, 0) / valid.length
      : 0;

    return {
      sums: sums,
      counts: counts,
      avg: avg,
      overall: overall,
      index: avg.map(function (value) {
        return overall ? (value / overall) * 100 : 0;
      })
    };
  }

  function buildDrivers(rows, endIdx, window, dates, limit) {
    var drivers = [];
    rows.forEach(function (row) {
      var growth = computeGrowth(row.monthly, endIdx, window, dates);
      if (!growth || growth.growth == null) return;
      drivers.push({
        keyword: row.keyword,
        ams: row.ams,
        latest: growth.end,
        growth: growth.growth,
        change: growth.end - growth.start,
        start: growth.start
      });
    });
    drivers.sort(function (a, b) { return b.change - a.change; });
    var risers = drivers.slice(0, limit);
    var decliners = drivers
      .filter(function (driver) { return driver.change < 0; })
      .slice(-limit)
      .reverse();
    return { risers: risers, decliners: decliners };
  }

  /**
   * rows: [{ keyword, ams, monthly: number[] }]
   * classification: { "Family": ["term", ...], ... }
   * options: { dates: string[], shortWindow, longWindow, endIdx, topLimit }
   */
  function analyze(rows, classification, options) {
    options = options || {};
    var dates = options.dates || [];
    var n = dates.length;
    var endIdx = options.endIdx != null ? options.endIdx : n - 1;
    var shortWindow = options.shortWindow || 12;
    var longWindow = options.longWindow || 48;
    var topLimit = options.topLimit || 500;
    var contextWords = Array.isArray(options.contextWords) ? options.contextWords : [];
    var bareNoteMaxWords = options.bareNoteMaxWords || 3;
    var normalizeMap = options.normalize && typeof options.normalize === 'object' ? options.normalize : null;
    var normalizeKeys = normalizeMap ? Object.keys(normalizeMap).sort(function (a, b) { return b.length - a.length; }) : [];

    var groupNames = [];
    var matchers = [];
    var groupQueries = {};
    var seen = new Set();

    Object.keys(classification || {}).forEach(function (group) {
      var definition = classification[group];
      if (Array.isArray(definition)) {
        groupNames.push(group);
        definition.forEach(function (raw) {
          var matcher = termToMatcher(raw);
          if (!matcher) return;
          var key = group + '\u0000' + matcher.term.toLowerCase();
          if (seen.has(key)) return;
          seen.add(key);
          matcher.group = group;
          matchers.push(matcher);
        });
        return;
      }
      if (typeof definition === 'string' && definition.trim()) {
        var compiled = compileQuery(definition, { contextWords: contextWords });
        if (!compiled) return;
        groupNames.push(group);
        groupQueries[group] = compiled;
      }
    });

    // Words that appear in many group definitions ("scent", "perfume", "note*")
    // describe the category rather than a note, so they are not shown as terms.
    var atomFrequency = {};
    var queryGroupNames = Object.keys(groupQueries);
    queryGroupNames.forEach(function (group) {
      groupQueries[group].atoms.forEach(function (atom) {
        // Only count atoms that are part of a group's own definition. Context
        // words are attached to every group and would otherwise make every
        // such word look "too common" to be a term.
        if (atom.context) return;
        atomFrequency[atom.key] = (atomFrequency[atom.key] || 0) + 1;
      });
    });
    queryGroupNames.forEach(function (group) {
      var filtered = groupQueries[group].atoms.filter(function (atom) {
        return atom.matcher && (atomFrequency[atom.key] || 0) < 4;
      });
      // A group whose definition consists entirely of category-level words
      // (e.g. "Sneakers & Trainers" = sneaker/trainer/kicks) would otherwise
      // end up with no Terms, so fall back to all of its atoms.
      if (!filtered.length) {
        filtered = groupQueries[group].atoms.filter(function (atom) {
          return atom.matcher;
        });
      }
      groupQueries[group].terms = filtered;
    });

    // Optional fallback for bare note searches ("sandalwood", "white musk").
    var bareNotes = options.bareNotes && queryGroupNames.length
      ? makeBareNoteIndex(queryGroupNames.map(function (group) {
        return { group: group, atoms: groupQueries[group].atoms };
      }), atomFrequency, bareNoteMaxWords)
      : null;
    var bareMatchers = new Map();

    var groupMonthly = {};
    var groupSize = {};
    var groupKeywordCount = {};
    var groupKeywords = {};
    var termMap = {};
    var termKeywords = {};
    groupNames.forEach(function (group) {
      groupMonthly[group] = new Float64Array(n);
      groupSize[group] = 0;
      groupKeywordCount[group] = 0;
      groupKeywords[group] = [];
      termMap[group] = new Map();
      termKeywords[group] = new Map();
    });

    var totalAms = 0;
    var matchedAms = 0;
    var matchedKeywords = 0;
    var groupSet = new Set();
    // Optional: remember which groups every row belongs to, so brand/product
    // cross tabs can reuse this pass instead of re-running the queries.
    var rowGroups = options.collectRowGroups ? new Array(rows.length) : null;

    function addTermHit(group, matcher, keyword, ams, monthly) {
      var store = termMap[group];
      if (!store) return;
      var term = store.get(matcher.term);
      if (!term) {
        term = {
          group: group,
          term: matcher.label || matcher.term,
          raw: matcher.raw,
          size: 0,
          keywords: 0,
          monthly: new Float64Array(n),
          keywordsList: []
        };
        store.set(matcher.term, term);
        var kwStore = termKeywords[group];
        if (kwStore) kwStore.set(matcher.term, term.keywordsList);
      }
      term.size += ams;
      term.keywords += 1;
      for (var j = 0; j < n; j++) {
        term.monthly[j] += Number(monthly[j]) || 0;
      }
      if (term.keywordsList) term.keywordsList.push({ keyword: keyword, ams: ams, monthly: monthly });
    }

    rows.forEach(function (row, rowIndex) {
      var keyword = normalizeText(row.keyword);
      if (normalizeKeys.length) {
        normalizeKeys.forEach(function (from) {
          var re = new RegExp('\\b' + escapeRegExp(from) + '\\b', 'gi');
          keyword = keyword.replace(re, normalizeMap[from]);
        });
      }
      var keywordLower = keyword.toLowerCase();
      var ams = Number.isFinite(row.ams) ? row.ams : 0;
      var monthly = row.monthly || [];
      totalAms += ams;

      if (rowGroups) rowGroups[rowIndex] = [];

      if (!keywordLower) return;

      var matchedGroups = new Set();

      for (var i = 0; i < matchers.length; i++) {
        var matcher = matchers[i];
        // "Slip on" footwear must not be attributed to the brand "On".
        if (matcher.group === 'On' && /\bslip[- ]on\b/i.test(keywordLower)) continue;
        if (!termMatches(matcher, keywordLower)) continue;
        matchedGroups.add(matcher.group);
        addTermHit(matcher.group, matcher, keyword, ams, monthly);
      }

      // Fuzzy fallback for brand/product attribution (opt-in).
      if (options.fuzzy && !matchedGroups.size && matchers.length) {
        fuzzyMatchEntries(matchers, keyword).forEach(function (entry) {
          matchedGroups.add(entry.group);
          addTermHit(entry.group, entry.matcher, keyword, ams, monthly);
        });
      }

      // Group definitions written as boolean queries.
      if (queryGroupNames.length) {
        var tokens = keywordTokens(keyword);
        for (var q = 0; q < queryGroupNames.length; q++) {
          var queryGroup = queryGroupNames[q];
          var compiled = groupQueries[queryGroup];
          if (!compiled.testTokens(tokens)) continue;

          matchedGroups.add(queryGroup);
          if (!compiled.terms || !compiled.terms.length) continue;
          for (var t = 0; t < compiled.terms.length; t++) {
            var atom = compiled.terms[t];
            if (!atom.matcher || !termMatches(atom.matcher, keywordLower)) continue;
            addTermHit(queryGroup, atom.matcher, keyword, ams, monthly);
          }
        }
      }

      // A search that is nothing but a note ("patchouli", "white musk") still
      // belongs to that note's family, even without a context word.
      if (!matchedGroups.size && bareNotes) {
        var bareTokens = keywordTokens(keyword);
        bareNoteGroups(bareTokens, bareNotes).forEach(function (hit) {
          matchedGroups.add(hit.group);
          var noteMatcher = bareMatchers.get(hit.word);
          if (noteMatcher == null) {
            noteMatcher = termToMatcher(hit.word) || false;
            bareMatchers.set(hit.word, noteMatcher);
          }
          if (noteMatcher) addTermHit(hit.group, noteMatcher, keyword, ams, monthly);
        });
      }

      if (matchedGroups.size) {
        matchedKeywords += 1;
        matchedAms += ams;
        var matchedList = [];
        matchedGroups.forEach(function (group) {
          matchedList.push(group);
          groupSet.add(group);
          groupSize[group] += ams;
          groupKeywordCount[group] += 1;
          var target = groupMonthly[group];
          for (var k = 0; k < n; k++) {
            target[k] += Number(monthly[k]) || 0;
          }
        });
        if (rowGroups) rowGroups[rowIndex] = matchedList;
      }

      // Keep a small reference so top-search lists can be built below.
      if (matchedGroups.size) {
        matchedGroups.forEach(function (group) {
          groupKeywords[group].push({
            keyword: keyword,
            ams: ams,
            monthly: monthly
          });
        });
      }
    });

    // Deduplicated list of all matched keywords, for an "All themes" view in Top searches.
    var allKeywordMap = new Map();
    groupNames.forEach(function (group) {
      (groupKeywords[group] || []).forEach(function (row) {
        var key = String(row.keyword || '').toLowerCase();
        if (!allKeywordMap.has(key)) allKeywordMap.set(key, row);
      });
    });
    var allTopKeywords = Array.from(allKeywordMap.values())
      .sort(function (a, b) { return b.ams - a.ams; })
      .slice(0, topLimit)
      .map(function (row) {
        return {
          keyword: row.keyword,
          ams: row.ams,
          latest: Number(row.monthly[endIdx]) || 0,
          short: computeGrowth(row.monthly, endIdx, shortWindow, dates),
          long: computeGrowth(row.monthly, endIdx, longWindow, dates)
        };
      });

    var groups = groupNames.map(function (group) {
      var monthly = Array.from(groupMonthly[group]);
      var size = groupSize[group];
      var short = computeGrowth(monthly, endIdx, shortWindow, dates);
      var long = computeGrowth(monthly, endIdx, longWindow, dates);

      var terms = Array.from(termMap[group].values())
        .map(function (term) {
          var values = Array.from(term.monthly);
          var shortGrowth = computeGrowth(values, endIdx, shortWindow, dates);
          var longGrowth = computeGrowth(values, endIdx, longWindow, dates);
          return {
            group: group,
            term: term.term,
            raw: term.raw,
            size: term.size,
            keywords: term.keywords,
            monthly: values,
            latest: Number(values[endIdx]) || 0,
            short: shortGrowth,
            long: longGrowth,
            shortChange: shortGrowth ? shortGrowth.end - shortGrowth.start : null,
            longChange: longGrowth ? longGrowth.end - longGrowth.start : null,
            keywordsList: term.keywordsList || []
          };
        })
        .sort(function (a, b) { return b.size - a.size; });

      var topKeywords = groupKeywords[group]
        .slice()
        .sort(function (a, b) { return b.ams - a.ams; })
        .slice(0, topLimit)
        .map(function (row) {
          return {
            keyword: row.keyword,
            ams: row.ams,
            latest: Number(row.monthly[endIdx]) || 0,
            short: computeGrowth(row.monthly, endIdx, shortWindow, dates),
            long: computeGrowth(row.monthly, endIdx, longWindow, dates)
          };
        });

      return {
        name: group,
        size: size,
        keywords: groupKeywordCount[group],
        // Share of the AMS that actually landed in a family (not all raw rows).
        share: matchedAms > 0 ? size / matchedAms : 0,
        monthly: monthly,
        latest: Number(monthly[endIdx]) || 0,
        short: short,
        long: long,
        shortChange: short ? short.end - short.start : null,
        longChange: long ? long.end - long.start : null,
        seasonality: seasonality(monthly, dates),
        terms: terms,
        topKeywords: topKeywords,
        drivers: {
          short: buildDrivers(groupKeywords[group], endIdx, shortWindow, dates, 25),
          long: buildDrivers(groupKeywords[group], endIdx, longWindow, dates, 25)
        }
      };
    });

    groups.sort(function (a, b) { return b.size - a.size; });

    return {
      dates: dates,
      groups: groups,
      allTopKeywords: allTopKeywords,
      groupNames: groupNames,
      rowGroups: rowGroups,
      totals: {
        keywords: rows.length,
        matchedKeywords: matchedKeywords,
        matchedAms: matchedAms,
        totalAms: totalAms,
        dateStart: dates[0] || null,
        dateEnd: dates[n - 1] || null,
        shortWindow: shortWindow,
        longWindow: longWindow,
        endIdx: endIdx,
        groupCount: groupSet.size,
        termCount: matchers.length + queryGroupNames.reduce(function (sum, name) {
          var terms = groupQueries[name].terms;
          return sum + (terms ? terms.length : 0);
        }, 0)
      }
    };
  }

  /** Turn a dictionary (term lists or boolean queries) into matcher entries. */
  function buildDictionary(dictionary, options) {
    var contextWords = Array.isArray(options && options.contextWords) ? options.contextWords : [];
    var out = [];
    Object.keys(dictionary || {}).forEach(function (name) {
      var definition = dictionary[name];
      if (typeof definition === 'string' && definition.trim()) {
        var compiled = compileQuery(definition, { contextWords: contextWords });
        if (!compiled) return;
        out.push({ group: name, query: compiled });
        return;
      }
      if (!Array.isArray(definition)) return;
      var seen = new Set();
      definition.forEach(function (raw) {
        var matcher = termToMatcher(raw);
        if (!matcher) return;
        var key = matcher.term.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        matcher.group = name;
        out.push({ group: name, matcher: matcher });
      });
    });
    return out;
  }

  function entryMatches(entry, keyword, getTokens) {
    return entry.query ? entry.query.testTokens(getTokens()) : termMatches(entry.matcher, keyword);
  }

  /** Names of every dictionary group this keyword belongs to (duplicates removed). */
  function matchGroups(entries, keyword, getTokens) {
    var names = [];
    var seen = new Set();
    for (var i = 0; i < entries.length; i++) {
      // "Slip on" footwear must not be attributed to the brand "On".
      if (entries[i].group === 'On' && /\bslip[- ]on\b/i.test(keyword)) continue;
      if (!entryMatches(entries[i], keyword, getTokens)) continue;
      var name = entries[i].group;
      if (seen.has(name)) continue;
      seen.add(name);
      names.push(name);
    }
    return names;
  }

  /**
   * Which families each row belongs to, index-aligned with rows.
   * Lets several cross tabs share one pass over the group queries.
   */
  function familyMatches(rows, families, options) {
    var entries = buildDictionary(families, options);
    var bare = null;
    if (options && options.bareNotes) {
      var frequency = {};
      entries.forEach(function (entry) {
        if (entry.query) entry.query.atoms.forEach(function (atom) {
          frequency[atom.key] = (frequency[atom.key] || 0) + 1;
        });
      });
      bare = makeBareNoteIndex(entries.filter(function (entry) {
        return !!entry.query;
      }).map(function (entry) {
        return { group: entry.group, atoms: entry.query.atoms };
      }), frequency, options.bareNoteMaxWords || 3);
    }
    var out = new Array(rows.length);
    for (var r = 0; r < rows.length; r++) {
      var keyword = normalizeText(rows[r].keyword);
      var normalizeKeys = options.normalizeKeys || (options.normalize ? Object.keys(options.normalize).sort(function (a, b) { return b.length - a.length; }) : []);
      if (normalizeKeys.length) {
        normalizeKeys.forEach(function (from) {
          var re = new RegExp('\\b' + escapeRegExp(from) + '\\b', 'gi');
          keyword = keyword.replace(re, options.normalize[from]);
        });
      }
      keyword = keyword.toLowerCase();
      if (!keyword) {
        out[r] = [];
        continue;
      }
      var cachedTokens = null;
      function tokens() {
        if (!cachedTokens) cachedTokens = keywordTokens(keyword);
        return cachedTokens;
      }
      var names = matchGroups(entries, keyword, tokens);
      if (!names.length && bare) {
        bareNoteGroups(tokens(), bare).forEach(function (hit) { names.push(hit.group); });
      }
      out[r] = names;
    }
    return out;
  }

  /**
   * Cross-tabulate two dictionaries: how much AMS each tag contributes to each
   * family. Used for "which brands / product types drive this family".
   *
   * rows: [{ keyword, ams }]
   * families: { "Family": ["term", ...] | "boolean query" }
   * tags: { "Brand": ["pattern", ...] | "boolean query" }
   * options.rowFamilies: precomputed familyMatches(rows, families) to reuse.
   */
  function crossTab(rows, families, tags, options) {
    options = options || {};
    var tagMatchers = buildDictionary(tags, options);
    var rowFamilies = Array.isArray(options.rowFamilies) ? options.rowFamilies : null;
    if (!rowFamilies && options.bareNotes) {
      // Keep the family side consistent when the caller did not precompute it.
      rowFamilies = familyMatches(rows, families, options);
    }
    var familyMatchers = rowFamilies ? null : buildDictionary(families, options);

    var familyNames = Object.keys(families || {});
    var tagNames = Object.keys(tags || {});
    var matrix = {};
    var tagTotals = {};

    familyNames.forEach(function (name) {
      matrix[name] = { size: 0, keywords: 0, tags: {} };
    });
    tagNames.forEach(function (name) {
      tagTotals[name] = { size: 0, keywords: 0, topKeyword: null, topAms: 0 };
    });

    rows.forEach(function (row, rowIndex) {
      var keyword = normalizeText(row.keyword);
      var normalizeKeys = options.normalizeKeys || (options.normalize ? Object.keys(options.normalize).sort(function (a, b) { return b.length - a.length; }) : []);
      if (normalizeKeys.length) {
        normalizeKeys.forEach(function (from) {
          var re = new RegExp('\\b' + escapeRegExp(from) + '\\b', 'gi');
          keyword = keyword.replace(re, options.normalize[from]);
        });
      }
      keyword = keyword.toLowerCase();
      var ams = Number.isFinite(row.ams) ? row.ams : 0;
      if (!keyword) return;

      var cachedTokens = null;
      function tokens() {
        if (!cachedTokens) cachedTokens = keywordTokens(keyword);
        return cachedTokens;
      }

      var matchedFamilies = rowFamilies
        ? (rowFamilies[rowIndex] || [])
        : matchGroups(familyMatchers, keyword, tokens);
      if (!matchedFamilies.length) return;

      var matchedTags = matchGroups(tagMatchers, keyword, tokens);
      if (!matchedTags.length && options.fuzzyTags) {
        var fuzzyTagHits = fuzzyMatchEntries(tagMatchers, keyword);
        fuzzyTagHits.forEach(function (entry) {
          if (matchedTags.indexOf(entry.group) === -1) matchedTags.push(entry.group);
        });
      }
      if (!matchedTags.length) return;

      matchedFamilies.forEach(function (family) {
        var cell = matrix[family];
        cell.size += ams;
        cell.keywords += 1;
        matchedTags.forEach(function (tag) {
          var entry = cell.tags[tag];
          if (!entry) entry = cell.tags[tag] = { size: 0, keywords: 0, topKeyword: null, topAms: 0 };
          entry.size += ams;
          entry.keywords += 1;
          if (ams > entry.topAms) {
            entry.topAms = ams;
            entry.topKeyword = row.keyword;
          }
        });
      });

      matchedTags.forEach(function (tag) {
        var entry = tagTotals[tag];
        entry.size += ams;
        entry.keywords += 1;
        if (ams > entry.topAms) {
          entry.topAms = ams;
          entry.topKeyword = row.keyword;
        }
      });
    });

    var result = { families: {}, tags: tagTotals };
    familyNames.forEach(function (family) {
      var cell = matrix[family];
      var tagsList = Object.keys(cell.tags).map(function (tag) {
        var entry = cell.tags[tag];
        return {
          tag: tag,
          size: entry.size,
          keywords: entry.keywords,
          share: cell.size > 0 ? entry.size / cell.size : 0,
          topKeyword: entry.topKeyword
        };
      }).sort(function (a, b) { return b.size - a.size; });
      result.families[family] = {
        size: cell.size,
        keywords: cell.keywords,
        tags: tagsList
      };
    });

    return result;
  }

  return {
    normalizeText: normalizeText,
    keywordTokens: keywordTokens,
    termToMatcher: termToMatcher,
    termMatches: termMatches,
    compileQuery: compileQuery,
    computeGrowth: computeGrowth,
    seasonality: seasonality,
    analyze: analyze,
    familyMatches: familyMatches,
    crossTab: crossTab
  };
});
