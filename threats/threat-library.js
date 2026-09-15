// threats/threat-library.js
const { NFA } = require("../core/automata");
const { literal, union, star, concat } = require("../core/thompson");
const { nfaToDfa } = require("../core/subset-construction");
const { minimizeDfa } = require("../core/minimize");
const { charsIn, buildSymbolMap, classAlphabet, symbolizeString } = require("../core/symbol-classes");
const { requiresOneOfDfa, anyCharFrag } = require("../policy/rules");
const { DIGITS } = require("../policy/alphabet");

// Union of two DFAs (OR), same convention as product() but accept = OR not AND
function unionDfa(dfa1, dfa2) {
  const { DFA } = require("../core/automata");
  const combinedAlphabet = new Set([...dfa1.alphabet, ...dfa2.alphabet]);
  const result = new DFA();
  result.alphabet = combinedAlphabet;

  const DEAD = null;
  function step(dfa, state, sym) {
    if (state === DEAD) return DEAD;
    return dfa.step(state, sym);
  }

  const idOf = new Map();
  const pairOf = new Map();
  let nextId = 0;
  function key(s1, s2) { return `${s1},${s2}`; }
  function getOrCreate(s1, s2) {
    const k = key(s1, s2);
    if (idOf.has(k)) return idOf.get(k);
    const id = nextId++;
    idOf.set(k, id);
    pairOf.set(id, [s1, s2]);
    result.states.add(id);
    result.transitions.set(id, new Map());
    const accepts1 = s1 !== DEAD && dfa1.accept.has(s1);
    const accepts2 = s2 !== DEAD && dfa2.accept.has(s2);
    if (accepts1 || accepts2) result.accept.add(id);
    return id;
  }

  const startId = getOrCreate(dfa1.start, dfa2.start);
  result.start = startId;
  const worklist = [startId];
  const seen = new Set();
  while (worklist.length) {
    const id = worklist.pop();
    if (seen.has(id)) continue;
    seen.add(id);
    const [s1, s2] = pairOf.get(id);
    for (const sym of combinedAlphabet) {
      const t1 = step(dfa1, s1, sym);
      const t2 = step(dfa2, s2, sym);
      if (t1 === DEAD && t2 === DEAD) continue;
      const targetId = getOrCreate(t1, t2);
      result.transitions.get(id).set(sym, targetId);
      if (!seen.has(targetId)) worklist.push(targetId);
    }
  }
  return result;
}

// builds a DFA matching an EXACT literal string, in symbol-space, over `classAlphabetArr`
function exactStringDfa(symbolizedStr) {
  const nfa = new NFA();
  if (symbolizedStr.length === 0) {
    const s = nfa.newState();
    nfa.start = s;
    nfa.accept.add(s);
    return minimizeDfa(nfaToDfa(nfa));
  }
  let frag = literal(nfa, symbolizedStr[0]);
  for (let i = 1; i < symbolizedStr.length; i++) {
    frag = concat(nfa, frag, literal(nfa, symbolizedStr[i]));
  }
  nfa.start = frag.start;
  nfa.accept.add(frag.accept);
  return minimizeDfa(nfaToDfa(nfa));
}

/**
 * Builds the "weak password" threat DFA as a union of known-weak exact passwords.
 * Returns { dfa, symbolMap } — callers must symbolize real strings the SAME way
 * before comparing against a policy DFA built with a DIFFERENT symbol map, OR
 * (better) both policy and threat should be compiled with a shared symbol map —
 * see buildThreatAndPolicyWithSharedAlphabet() in verifier/verify.js (Step 15).
 */
function buildWeakPasswordThreatDfa(symbolMap) {
  const commonWeak = ["password", "12345678", "qwerty123", "letmein1", "Password1", "Welcome1"];
  const symbolized = commonWeak.map((w) => symbolizeString(w, symbolMap));
  let threat = exactStringDfa(symbolized[0]);
  for (let i = 1; i < symbolized.length; i++) {
    threat = minimizeDfa(unionDfa(threat, exactStringDfa(symbolized[i])));
  }
  return threat;
}

function weakPasswordList() {
  return ["password", "12345678", "qwerty123", "letmein1", "Password1", "Welcome1"];
}

module.exports = { buildWeakPasswordThreatDfa, weakPasswordList, unionDfa, exactStringDfa };