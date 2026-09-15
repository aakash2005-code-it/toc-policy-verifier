// verifier/verify.js
const { product } = require("../core/product");
const { shortestAcceptedString } = require("../core/shortest-string");
const { minimizeDfa } = require("../core/minimize");
const { compilePolicy } = require("../policy/compiler");
const { buildWeakPasswordThreatDfa, weakPasswordList } = require("../threats/threat-library");
const { buildSymbolMap, classAlphabet, charsIn } = require("../core/symbol-classes");

/**
 * Compiles a policy AND a threat DFA using a SHARED symbol alphabet
 * (union of both their distinguished-character requirements), so their
 * class symbols are directly comparable in the product construction.
 */
function verifyPolicySpec(policySpec) {
  const threatWords = weakPasswordList();
  const distinguished = new Set([
    ...charsIn(policySpec.forbiddenSubstrings || []),
    ...charsIn(threatWords),
  ]);
  const symbolMap = buildSymbolMap(distinguished);

  const policyDfa = compilePolicy({ ...policySpec, _sharedSymbolMap: symbolMap });
  const threatDfa = buildWeakPasswordThreatDfa(symbolMap);

  const intersection = minimizeDfa(product(policyDfa, threatDfa, "intersection"));
  const bypass = shortestAcceptedString(intersection);

  return {
    safe: bypass === null,
    bypass,
    policyStates: policyDfa.states.size,
    threatStates: threatDfa.states.size,
  };
}

module.exports = { verifyPolicySpec };