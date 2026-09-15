// tests/step3.js
const { fromString } = require("../core/thompson");
const { nfaToDfa } = require("../core/subset-construction");

const nfa = fromString("cat");
const dfa = nfaToDfa(nfa);

console.log("DFA state count:", dfa.states.size);
console.log("accepts('cat'):", dfa.accepts("cat"));   // expect true
console.log("accepts('ca'):", dfa.accepts("ca"));     // expect false
console.log("accepts('cats'):", dfa.accepts("cats")); // expect false
console.log("accepts(''):", dfa.accepts(""));         // expect false