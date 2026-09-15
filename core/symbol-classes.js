// core/symbol-classes.js
const { LOWER, UPPER, DIGITS, SPECIAL } = require("../policy/alphabet");

/**
 * Builds a mapping from every real character to a "class symbol":
 * - a generic class symbol (L, U, D, S) if the character is NOT distinguished
 * - itself, if the character IS distinguished (must be tracked exactly,
 *   e.g. because it appears in a forbidden substring)
 */
function buildSymbolMap(distinguishedChars) {
  const map = new Map();
  const assign = (chars, genericSymbol) => {
    for (const c of chars) {
      map.set(c, distinguishedChars.has(c) ? c : genericSymbol);
    }
  };
  assign(LOWER, "L");
  assign(UPPER, "U");
  assign(DIGITS, "D");
  assign(SPECIAL, "S");
  return map;
}

// the reduced alphabet actually used by the automata (unique class symbols)
function classAlphabet(symbolMap) {
  return [...new Set(symbolMap.values())];
}

// converts a real string into its class-symbol string, e.g. "Pass1!" -> "Uaaaa1DS"... 
// (each character becomes ONE class symbol, so result is same length as input)
function symbolizeString(str, symbolMap) {
  return [...str].map((ch) => symbolMap.get(ch) ?? ch).join("");
}

// the set of class symbols that represent ANY character in `chars`
// (used for "requires one of LOWER" etc. — may include the generic class
// symbol plus any individually-distinguished characters from that category)
function symbolsForCharSet(chars, symbolMap) {
  return [...new Set(chars.map((c) => symbolMap.get(c)))];
}

// collects every distinct character used across a list of strings
function charsIn(strings) {
  const set = new Set();
  for (const s of strings) for (const ch of s) set.add(ch);
  return set;
}

module.exports = { buildSymbolMap, classAlphabet, symbolizeString, symbolsForCharSet, charsIn };