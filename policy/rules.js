// policy/rules.js
const { NFA } = require("../core/automata");
const { literal, union, star, concat } = require("../core/thompson");
const { nfaToDfa } = require("../core/subset-construction");
const { minimizeDfa } = require("../core/minimize");
const { LOWER, UPPER, DIGITS, SPECIAL } = require("./alphabet");
const { symbolsForCharSet, symbolizeString } = require("../core/symbol-classes");

function anyCharFrag(nfa, symbols) {
  const frags = symbols.map((s) => literal(nfa, s));
  return frags.reduce((acc, f) => union(nfa, acc, f));
}

// length range, over the reduced class alphabet
function lengthRangeDfa(min, max, classAlphabet) {
  const nfa = new NFA();
  const anyChar = () => anyCharFrag(nfa, classAlphabet);

  let frag = null;
  for (let i = 0; i < min; i++) {
    frag = frag ? concat(nfa, frag, anyChar()) : anyChar();
  }
  if (min === 0) {
    const s = nfa.newState();
    frag = { start: s, accept: s };
  }
  for (let i = min; i < max; i++) {
    const start = nfa.newState();
    const accept = nfa.newState();
    const ch = anyChar();
    nfa.addTransition(start, "ε", ch.start);
    nfa.addTransition(start, "ε", accept);
    nfa.addTransition(ch.accept, "ε", accept);
    frag = concat(nfa, frag, { start, accept });
  }

  nfa.start = frag.start;
  nfa.accept.add(frag.accept);
  return minimizeDfa(nfaToDfa(nfa));
}

// requires at least one symbol from `requiredSymbols` (already class-mapped),
// but must still range over the FULL classAlphabet for other positions
function requiresOneOfDfa(requiredSymbols, classAlphabet) {
  const nfa = new NFA();
  const anyChar = () => anyCharFrag(nfa, classAlphabet);
  const prefix = star(nfa, anyChar());
  const required = anyCharFrag(nfa, requiredSymbols);
  const suffix = star(nfa, anyChar());

  let frag = concat(nfa, prefix, required);
  frag = concat(nfa, frag, suffix);

  nfa.start = frag.start;
  nfa.accept.add(frag.accept);
  return minimizeDfa(nfaToDfa(nfa));
}

// forbids a substring: substring is given in symbol-space already (via symbolizeString)
function forbidsSubstringDfa(symbolizedSub, classAlphabet) {
  const nfa = new NFA();
  const anyChar = () => anyCharFrag(nfa, classAlphabet);
  const prefix = star(nfa, anyChar());
  let mid = literal(nfa, symbolizedSub[0]);
  for (let i = 1; i < symbolizedSub.length; i++) {
    mid = concat(nfa, mid, literal(nfa, symbolizedSub[i]));
  }
  const suffix = star(nfa, anyChar());

  let frag = concat(nfa, prefix, mid);
  frag = concat(nfa, frag, suffix);

  nfa.start = frag.start;
  nfa.accept.add(frag.accept);

  const containsDfa = minimizeDfa(nfaToDfa(nfa));
  return complementDfa(containsDfa, classAlphabet);
}

function complementDfa(dfa, classAlphabet) {
  const { DFA } = require("../core/automata");
  const DEAD = "__DEAD__";
  const result = new DFA();
  result.alphabet = new Set(classAlphabet);

  const states = [...dfa.states, DEAD];
  const idMap = new Map(states.map((s, i) => [s, i]));

  for (const s of states) {
    result.states.add(idMap.get(s));
    result.transitions.set(idMap.get(s), new Map());
  }
  result.start = idMap.get(dfa.start);

  for (const s of states) {
    for (const sym of classAlphabet) {
      const raw = s === DEAD ? DEAD : dfa.step(s, sym);
      const target = raw === null ? DEAD : raw;
      result.transitions.get(idMap.get(s)).set(sym, idMap.get(target));
    }
  }

  for (const s of states) {
    const wasAccepting = s !== DEAD && dfa.accept.has(s);
    if (!wasAccepting) result.accept.add(idMap.get(s));
  }

  return result;
}

module.exports = {
  LOWER, UPPER, DIGITS, SPECIAL,
  lengthRangeDfa, requiresOneOfDfa, forbidsSubstringDfa, complementDfa, anyCharFrag,
};