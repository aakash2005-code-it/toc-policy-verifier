// tests/step10.js
const { buildSymbolMap, classAlphabet, symbolizeString, symbolsForCharSet, charsIn } = require("../core/symbol-classes");
const { LOWER } = require("../policy/alphabet");

const distinguished = charsIn(["password"]); // p,a,s,w,o,r,d
const symbolMap = buildSymbolMap(distinguished);

console.log("Distinguished chars:", [...distinguished]);
console.log("Reduced alphabet size:", classAlphabet(symbolMap).length, "(was 68)");
console.log("Reduced alphabet:", classAlphabet(symbolMap));

console.log("\nsymbolize('Password1!'):", symbolizeString("Password1!", symbolMap));
console.log("symbolize('Xyzqwer0!'):", symbolizeString("Xyzqwer0!", symbolMap));

console.log("\nsymbols for LOWER:", symbolsForCharSet(LOWER, symbolMap).length, "symbols (was 26 chars)");