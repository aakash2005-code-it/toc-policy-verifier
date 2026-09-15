// tests/step5.js
const { NFA } = require("../core/automata");
const { literal, union, star, concat } = require("../core/thompson");
const { nfaToDfa } = require("../core/subset-construction");
const { minimizeDfa } = require("../core/minimize");
const { product } = require("../core/product");

// helper: builds a DFA for "contains substring `sub`" over alphabet {a,b,d}
// pattern: (a|b|d)* sub (a|b|d)*
function containsSubstringDfa(sub, alphabetChars) {
  const nfa = new NFA();
  const anyChar = () => {
    const frags = alphabetChars.map((c) => literal(nfa, c));
    return frags.reduce((acc, f) => union(nfa, acc, f));
  };
  const prefix = star(nfa, anyChar());
  let mid = literal(nfa, sub[0]);
  for (let i = 1; i < sub.length; i++) {
    mid = concat(nfa, mid, literal(nfa, sub[i]));
  }
  const suffix = star(nfa, anyChar());
  let frag = concat(nfa, prefix, mid);
  frag = concat(nfa, frag, suffix);

  nfa.start = frag.start;
  nfa.accept.add(frag.accept);

  return minimizeDfa(nfaToDfa(nfa));
}

const containsA = containsSubstringDfa("a", ["a", "b", "d"]);
const containsBad = containsSubstringDfa("bad", ["a", "b", "d"]);

const intersectionDfa = product(containsA, containsBad, "intersection");

console.log("containsA states:", containsA.states.size);
console.log("containsBad states:", containsBad.states.size);
console.log("intersection states:", intersectionDfa.states.size);

const tests = ["bad", "abad", "abd", "dab", "aaa", "bd"];
for (const s of tests) {
  console.log(
    `"${s}": containsA=${containsA.accepts(s)} containsBad=${containsBad.accepts(s)} intersection=${intersectionDfa.accepts(s)}`
  );
}