const { verifyPolicySpec } = require("../verifier/verify");
const realWorldPolicies = [
  {
    name: "Basic (min 6 chars only)",
    spec: { minLength: 6, maxLength: 20, forbiddenSubstrings: [] },
  },
  {
    name: "Common tutorial regex (min 8, 1 digit)",
    spec: { minLength: 8, maxLength: 20, requireDigit: true, forbiddenSubstrings: [] },
  },
  {
    name: "\"Strong\" per many blog posts (upper+lower+digit, no forbid list)",
    spec: {
      minLength: 8, maxLength: 20,
      requireUpper: true, requireLower: true, requireDigit: true,
      forbiddenSubstrings: [],
    },
  },
  {
    name: "OWASP-style (all 4 classes + blocklist)",
    spec: {
      minLength: 8, maxLength: 20,
      requireUpper: true, requireLower: true, requireDigit: true, requireSpecial: true,
      forbiddenSubstrings: ["password", "12345678", "qwerty123", "letmein1"],
    },
  },
];

console.log("=".repeat(70));
console.log("EVALUATION: Real-world-style policies vs. weak-password threat library");
console.log("=".repeat(70));

let gapsFound = 0;

for (const { name, spec } of realWorldPolicies) {
  const start = Date.now();
  const result = verifyPolicySpec(spec);
  const time = Date.now() - start;

  console.log(`\n[${name}]`);
  console.log(`  Policy states: ${result.policyStates} | Verified in ${time}ms`);
  if (result.safe) {
    console.log(`  Result: SAFE — no known-weak password satisfies this policy`);
  } else {
    console.log(`  Result: GAP FOUND — bypass = "${result.bypass}"`);
    gapsFound++;
  }
}

console.log("\n" + "=".repeat(70));
console.log(`SUMMARY: ${gapsFound}/${realWorldPolicies.length} common policies had a formally-provable gap`);
console.log("=".repeat(70));