// policy/compiler.js
const { product } = require("../core/product");
const { minimizeDfa } = require("../core/minimize");
const { lengthRangeDfa, requiresOneOfDfa, forbidsSubstringDfa, LOWER, UPPER, DIGITS, SPECIAL } = require("./rules");
const { buildSymbolMap, classAlphabet, symbolsForCharSet, symbolizeString, charsIn } = require("../core/symbol-classes");

function compilePolicy(spec) {
 const distinguished = charsIn(spec.forbiddenSubstrings || []);
  const symbolMap = spec._sharedSymbolMap || buildSymbolMap(distinguished);
  const alphabet = classAlphabet(symbolMap);

  const rules = [];
  rules.push(lengthRangeDfa(spec.minLength, spec.maxLength, alphabet));

  if (spec.requireLower) rules.push(requiresOneOfDfa(symbolsForCharSet(LOWER, symbolMap), alphabet));
  if (spec.requireUpper) rules.push(requiresOneOfDfa(symbolsForCharSet(UPPER, symbolMap), alphabet));
  if (spec.requireDigit) rules.push(requiresOneOfDfa(symbolsForCharSet(DIGITS, symbolMap), alphabet));
  if (spec.requireSpecial) rules.push(requiresOneOfDfa(symbolsForCharSet(SPECIAL, symbolMap), alphabet));

  for (const forbidden of spec.forbiddenSubstrings || []) {
    const symbolized = symbolizeString(forbidden, symbolMap);
    rules.push(forbidsSubstringDfa(symbolized, alphabet));
  }

  let combined = rules[0];
  for (let i = 1; i < rules.length; i++) {
    combined = minimizeDfa(product(combined, rules[i], "intersection"));
  }

  // attach the symbol map so callers can translate real strings -> symbol strings for .accepts()
  combined._symbolMap = symbolMap;
  return combined;
}

// helper: check a REAL string (with actual characters) against a compiled policy DFA
function policyAccepts(policyDfa, realString) {
  const symbolized = symbolizeString(realString, policyDfa._symbolMap);
  return policyDfa.accepts(symbolized);
}

module.exports = { compilePolicy, policyAccepts };