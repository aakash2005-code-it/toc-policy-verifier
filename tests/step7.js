// tests/step7.js
const { lengthRangeDfa, requiresOneOfDfa, forbidsSubstringDfa, DIGITS } = require("../policy/rules");

const len8to12 = lengthRangeDfa(8, 12);
console.log("--- length 8-12 ---");
console.log("'short':", len8to12.accepts("short"));           // false (5 chars)
console.log("'exactly8c':", len8to12.accepts("exactly8c"));   // true (9 chars)
console.log("'waytoolongforthis':", len8to12.accepts("waytoolongforthis")); // false

const needsDigit = requiresOneOfDfa(DIGITS);
console.log("\n--- requires digit ---");
console.log("'password':", needsDigit.accepts("password"));   // false
console.log("'password1':", needsDigit.accepts("password1")); // true

const noPassword = forbidsSubstringDfa("password");
console.log("\n--- forbids 'password' substring ---");
console.log("'mypassword1':", noPassword.accepts("mypassword1")); // false
console.log("'mySecret1':", noPassword.accepts("mySecret1"));     // true