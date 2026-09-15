// policy/alphabet.js
const LOWER = "abcdefghijklmnopqrstuvwxyz".split("");
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const DIGITS = "0123456789".split("");
const SPECIAL = "!@#$%^&*()-_=+".split("");
const FULL_ALPHABET = [...LOWER, ...UPPER, ...DIGITS, ...SPECIAL];

module.exports = { LOWER, UPPER, DIGITS, SPECIAL, FULL_ALPHABET };