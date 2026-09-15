// api/server.js
const express = require("express");
const cors = require("cors");
const { compilePolicy, policyAccepts } = require("../policy/compiler");
const { verifyPolicySpec } = require("../verifier/verify");

const app = express();
app.use(cors());
app.use(express.json());

// simple in-memory cache: same spec -> don't recompile
const policyCache = new Map();
function cacheKey(spec) {
  return JSON.stringify(spec);
}

/**
 * POST /api/compile-policy
 * body: { minLength, maxLength, requireLower, requireUpper, requireDigit, requireSpecial, forbiddenSubstrings }
 * returns: { states, cached, compileTimeMs }
 */
app.post("/api/compile-policy", (req, res) => {
  const spec = req.body;
  const key = cacheKey(spec);

  if (policyCache.has(key)) {
    const dfa = policyCache.get(key);
    return res.json({ states: dfa.states.size, cached: true });
  }

  const start = Date.now();
  try {
    const dfa = compilePolicy(spec);
    policyCache.set(key, dfa);
    res.json({ states: dfa.states.size, cached: false, compileTimeMs: Date.now() - start });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/verify
 * body: same policy spec as above
 * returns: { safe, bypass, policyStates, threatStates }
 */
app.post("/api/verify", (req, res) => {
  try {
    const result = verifyPolicySpec(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/check-string
 * body: { spec: {...}, testString: "..." }
 * returns: { accepted: boolean }
 */
app.post("/api/check-string", (req, res) => {
  const { spec, testString } = req.body;
  const key = cacheKey(spec);

  let policyDfa;
  if (policyCache.has(key)) {
    policyDfa = policyCache.get(key);
  } else {
    try {
      policyDfa = compilePolicy(spec);
      policyCache.set(key, policyDfa);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  res.json({ accepted: policyAccepts(policyDfa, testString) });
});

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
/**
 * GET /api/example-dfa/:type
 * Returns graph data for a small, illustrative DFA (NOT the full policy —
 * those are too large to render). type: "length" | "requires-digit" | "forbids-bad"
 */
app.get("/api/example-dfa/:type", (req, res) => {
  const { lengthRangeDfa, requiresOneOfDfa, forbidsSubstringDfa } = require("../policy/rules");
  const { DIGITS } = require("../policy/alphabet");

  const smallAlphabet = ["L", "D"]; // toy alphabet: Letter, Digit — keeps the graph tiny

  let dfa;
  if (req.params.type === "length") {
    dfa = lengthRangeDfa(2, 3, smallAlphabet);
  } else if (req.params.type === "requires-digit") {
    dfa = requiresOneOfDfa(["D"], smallAlphabet);
  } else if (req.params.type === "forbids-bad") {
    dfa = forbidsSubstringDfa("LL", smallAlphabet); // toy: forbid two letters in a row
  } else {
    return res.status(400).json({ error: "Unknown example type" });
  }

  res.json(dfa.toGraphData());
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Policy verifier API running on http://localhost:${PORT}`));