// tests/step8.js
const { compilePolicy } = require("../policy/compiler");

// a realistic policy: 8-16 chars, needs upper, lower, digit, special, forbids "password"
const spec = {
  minLength: 8,
  maxLength: 16,
  requireLower: true,
  requireUpper: true,
  requireDigit: true,
  requireSpecial: true,
  forbiddenSubstrings: ["password"],
};

console.log("Compiling policy... (this may take a few seconds)");
const start = Date.now();
const policyDfa = compilePolicy(spec);
console.log(`Compiled in ${Date.now() - start}ms, ${policyDfa.states.size} states`);

const tests = [
  ["Short1!", false],        // too short (7 chars)
  ["nouppercase1!", false],  // missing uppercase
  ["NOLOWERCASE1!", false],  // missing lowercase
  ["NoDigitsHere!", false],  // missing digit
  ["NoSpecial123", false],   // missing special char
  ["MyPassword1!", true],   // contains forbidden "password" (case-sensitive: "Password" won't match "password")
  ["Mypassword1!", false],   // contains forbidden "password" lowercase
  ["Str0ngP@ss", true],      // should PASS all rules
  ["Val1d@Entry", true],     // should PASS all rules
];

for (const [pw, expected] of tests) {
  const result = policyDfa.accepts(pw);
  const status = result === expected ? "OK" : "MISMATCH!";
  console.log(`"${pw}": accepted=${result} expected=${expected} ${status}`);
}