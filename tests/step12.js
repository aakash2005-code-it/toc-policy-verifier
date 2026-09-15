// tests/step12.js
const { verifyPolicySpec } = require("../verifier/verify");

console.log("Verifying WEAK policy...");
let start = Date.now();
const weakResult = verifyPolicySpec({ minLength: 6, maxLength: 16, forbiddenSubstrings: [] });
console.log(`Done in ${Date.now() - start}ms:`, weakResult);

console.log("\nVerifying STRONG policy...");
start = Date.now();
const strongResult = verifyPolicySpec({
  minLength: 8,
  maxLength: 16,
  requireLower: true,
  requireUpper: true,
  requireDigit: true,
  requireSpecial: true,
  forbiddenSubstrings: ["password", "12345678", "qwerty123", "letmein1"],
});
console.log(`Done in ${Date.now() - start}ms:`, strongResult);