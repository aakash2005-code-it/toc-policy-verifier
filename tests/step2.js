// tests/step2.js
const { fromString } = require("../core/thompson");

const nfa = fromString("cat");
console.log("States:", nfa.states.size);
console.log("Start:", nfa.start, "Accept:", [...nfa.accept]);
console.log("Alphabet:", [...nfa.alphabet()]);