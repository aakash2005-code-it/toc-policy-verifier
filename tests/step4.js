// tests/step4.js
const { NFA } = require("../core/automata");
const { literal, union, star, concat } = require("../core/thompson");
const { nfaToDfa } = require("../core/subset-construction");
const { minimizeDfa } = require("../core/minimize");

// Build (a|b)*abb on a single shared NFA instance
const nfa = new NFA();
const fragA = literal(nfa, "a");
const fragB = literal(nfa, "b");
const altAB = union(nfa, fragA, fragB);
const starPart = star(nfa, altAB);

let frag = concat(nfa, starPart, literal(nfa, "a"));
frag = concat(nfa, frag, literal(nfa, "b"));
frag = concat(nfa, frag, literal(nfa, "b"));

nfa.start = frag.start;
nfa.accept.add(frag.accept);

const dfa = nfaToDfa(nfa);
const minDfa = minimizeDfa(dfa);

console.log("Before minimization:", dfa.states.size, "states");
console.log("After minimization:", minDfa.states.size, "states");

const testStrings = ["abb", "aabb", "babb", "ab", "a", "", "abbabb", "aab"];
for (const s of testStrings) {
  const before = dfa.accepts(s);
  const after = minDfa.accepts(s);
  console.log(`accepts(${JSON.stringify(s)}): before=${before} after=${after} ${before === after ? "OK" : "MISMATCH!"}`);
}