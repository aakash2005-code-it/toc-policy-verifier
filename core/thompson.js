// core/thompson.js
const { NFA, EPSILON } = require("./automata");

/**
 * All functions here build fragments on a SHARED nfa instance and
 * return { start, accept } state ids for that fragment.
 * This lets us compose fragments (concat, union, star) cleanly.
 */

function literal(nfa, symbol) {
  const start = nfa.newState();
  const accept = nfa.newState();
  nfa.addTransition(start, symbol, accept);
  return { start, accept };
}

// matches any ONE symbol from a given set (e.g. character class [a-z])
function charSet(nfa, symbols) {
  const start = nfa.newState();
  const accept = nfa.newState();
  for (const sym of symbols) {
    nfa.addTransition(start, sym, accept);
  }
  return { start, accept };
}

function concat(nfa, fragA, fragB) {
  nfa.addTransition(fragA.accept, EPSILON, fragB.start);
  return { start: fragA.start, accept: fragB.accept };
}

function union(nfa, fragA, fragB) {
  const start = nfa.newState();
  const accept = nfa.newState();
  nfa.addTransition(start, EPSILON, fragA.start);
  nfa.addTransition(start, EPSILON, fragB.start);
  nfa.addTransition(fragA.accept, EPSILON, accept);
  nfa.addTransition(fragB.accept, EPSILON, accept);
  return { start, accept };
}

function star(nfa, frag) {
  const start = nfa.newState();
  const accept = nfa.newState();
  nfa.addTransition(start, EPSILON, frag.start);
  nfa.addTransition(start, EPSILON, accept);
  nfa.addTransition(frag.accept, EPSILON, frag.start);
  nfa.addTransition(frag.accept, EPSILON, accept);
  return { start, accept };
}

// one-or-more: frag frag*
function plus(nfa, frag) {
  const starred = star(nfa, frag);
  return concat(nfa, frag, starred);
}

// zero-or-one
function optional(nfa, frag) {
  const start = nfa.newState();
  const accept = nfa.newState();
  nfa.addTransition(start, EPSILON, frag.start);
  nfa.addTransition(start, EPSILON, accept);
  nfa.addTransition(frag.accept, EPSILON, accept);
  return { start, accept };
}

// builds a full NFA (with start/accept set) from a sequence of symbols (plain string literal)
function fromString(str) {
  const nfa = new NFA();
  if (str.length === 0) {
    const s = nfa.newState();
    nfa.start = s;
    nfa.accept.add(s);
    return nfa;
  }
  let frag = literal(nfa, str[0]);
  for (let i = 1; i < str.length; i++) {
    frag = concat(nfa, frag, literal(nfa, str[i]));
  }
  nfa.start = frag.start;
  nfa.accept.add(frag.accept);
  return nfa;
}

module.exports = { literal, charSet, concat, union, star, plus, optional, fromString };