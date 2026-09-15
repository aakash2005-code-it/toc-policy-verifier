// tests/step9.js
const { compilePolicy } = require("../policy/compiler");
const { buildWeakPasswordThreatDfa } = require("../threats/threat-library");
const { verifyPolicyAgainstThreat } = require("../verifier/verify");

console.log("Building threat library...");
const threat = buildWeakPasswordThreatDfa();
console.log("Threat DFA states:", threat.states.size);

// WEAK policy: only enforces length >= 6, nothing else
const weakSpec = { minLength: 6, maxLength: 16, forbiddenSubstrings: [] };
console.log("\nCompiling WEAK policy (length >= 6 only)...");
const weakPolicy = compilePolicy(weakSpec);
const weakResult = verifyPolicyAgainstThreat(weakPolicy, threat);
console.log("Weak policy result:", weakResult);
// expect safe=false, since "password" (8 chars) satisfies length>=6 and is in the threat list

// STRONG policy: from step 8, requires all char classes + forbids "password"
const strongSpec = {
  minLength: 8,
  maxLength: 16,
  requireLower: true,
  requireUpper: true,
  requireDigit: true,
  requireSpecial: true,
  forbiddenSubstrings: ["password", "12345678", "qwerty123", "letmein1"],
};
console.log("\nCompiling STRONG policy (all char classes + forbids weak list)...");
const strongPolicy = compilePolicy(strongSpec);
const strongResult = verifyPolicyAgainstThreat(strongPolicy, threat);
console.log("Strong policy result:", strongResult);
// expect safe=true — none of the weak-password threats have upper+lower+digit+special