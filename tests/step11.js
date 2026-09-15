// tests/step11.js
const { compilePolicy, policyAccepts } = require("../policy/compiler");

const spec = {
  minLength: 8,
  maxLength: 16,
  requireLower: true,
  requireUpper: true,
  requireDigit: true,
  requireSpecial: true,
  forbiddenSubstrings: ["password"],
};

console.log("Compiling policy with reduced alphabet...");
const start = Date.now();
const policyDfa = compilePolicy(spec);
console.log(`Compiled in ${Date.now() - start}ms, ${policyDfa.states.size} states (was 532 states / ~21000ms before optimization)`);

const tests = [
  ["Short1!", false],
  ["nouppercase1!", false],
  ["NOLOWERCASE1!", false],
  ["NoDigitsHere!", false],
  ["NoSpecial123", false],
  ["MyPassword1!", true],
  ["Mypassword1!", false],
  ["Str0ngP@ss", true],
  ["Val1d@Entry", true],
];

for (const [pw, expected] of tests) {
  const result = policyAccepts(policyDfa, pw);
  const status = result === expected ? "OK" : "MISMATCH!";
  console.log(`"${pw}": accepted=${result} expected=${expected} ${status}`);
}