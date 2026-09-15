// tests/step1.js
const { NFA, EPSILON } = require("../core/automata");

const nfa = new NFA();
const s0 = nfa.newState();
const s1 = nfa.newState();
nfa.start = s0;
nfa.accept.add(s1);
nfa.addTransition(s0, "a", s1);
nfa.addTransition(s0, EPSILON, s1);

console.log("epsilon-closure of {s0}:", [...nfa.epsilonClosure(new Set([s0]))]);
console.log("alphabet:", [...nfa.alphabet()]);