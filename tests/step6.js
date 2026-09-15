// tests/step6.js
const { NFA } = require("../core/automata");
const { literal, union, star, concat } = require("../core/thompson");
const { nfaToDfa } = require("../core/subset-construction");
const { minimizeDfa } = require("../core/minimize");
const { product } = require("../core/product");
const { shortestAcceptedString } = require("../core/shortest-string");

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

const bypass = shortestAcceptedString(intersectionDfa);
console.log("Shortest string containing both 'a' AND 'bad':", JSON.stringify(bypass));
console.log("Length:", bypass ? bypass.length : "N/A");

// verify it independently against both original DFAs
if (bypass !== null) {
  console.log("Verification -> containsA.accepts(bypass):", containsA.accepts(bypass));
  console.log("Verification -> containsBad.accepts(bypass):", containsBad.accepts(bypass));
}

// now test an EMPTY intersection case: containsA vs "contains z" (z not in alphabet, so genuinely disjoint)
const containsZ = containsSubstringDfa("d", ["a", "b", "d"]); // reuse, but let's build a truly disjoint one
// disjoint example: strings of length exactly 1 vs strings of length exactly 2 (built directly)
const nfaLen1 = new NFA();
const s0 = nfaLen1.newState();
const s1 = nfaLen1.newState();
nfaLen1.start = s0;
nfaLen1.accept.add(s1);
for (const c of ["a", "b", "d"]) nfaLen1.addTransition(s0, c, s1);
const len1Dfa = minimizeDfa(nfaToDfa(nfaLen1));

const nfaLen2 = new NFA();
const t0 = nfaLen2.newState();
const t1 = nfaLen2.newState();
const t2 = nfaLen2.newState();
nfaLen2.start = t0;
nfaLen2.accept.add(t2);
for (const c of ["a", "b", "d"]) {
  nfaLen2.addTransition(t0, c, t1);
  nfaLen2.addTransition(t1, c, t2);
}
const len2Dfa = minimizeDfa(nfaToDfa(nfaLen2));

const emptyIntersection = product(len1Dfa, len2Dfa, "intersection");
const noBypass = shortestAcceptedString(emptyIntersection);
console.log("\nIntersection of (length=1) and (length=2) languages:");
console.log("Bypass found:", noBypass); 