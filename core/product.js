// core/product.js
const { DFA } = require("./automata");

/**
 * Builds the product automaton of two DFAs.
 * mode: "intersection" -> accept iff BOTH accept
 *       "difference"    -> accept iff dfa1 accepts AND dfa2 does NOT (dfa1 \ dfa2)
 * Both are useful for policy verification:
 *   - intersection(policy, threat): finds strings the policy WRONGLY allows
 *   - difference(requiredSafe, policy): finds strings that SHOULD be allowed but aren't
 */
function product(dfa1, dfa2, mode = "intersection") {
  const combinedAlphabet = new Set([...dfa1.alphabet, ...dfa2.alphabet]);

  const result = new DFA();
  result.alphabet = combinedAlphabet;

  const DEAD = null;
  function step(dfa, state, sym) {
    if (state === DEAD) return DEAD;
    return dfa.step(state, sym);
  }

  const idOf = new Map(); // "s1,s2" -> id
  const pairOf = new Map(); // id -> [s1, s2]
  let nextId = 0;

  function key(s1, s2) {
    return `${s1},${s2}`;
  }

  function getOrCreate(s1, s2) {
    const k = key(s1, s2);
    if (idOf.has(k)) return idOf.get(k);
    const id = nextId++;
    idOf.set(k, id);
    pairOf.set(id, [s1, s2]);
    result.states.add(id);
    result.transitions.set(id, new Map());

    const accepts1 = s1 !== DEAD && dfa1.accept.has(s1);
    const accepts2 = s2 !== DEAD && dfa2.accept.has(s2);
    const isAccept =
      mode === "intersection" ? accepts1 && accepts2 : accepts1 && !accepts2; // difference

    if (isAccept) result.accept.add(id);
    return id;
  }

  const startId = getOrCreate(dfa1.start, dfa2.start);
  result.start = startId;

  const worklist = [startId];
  const seen = new Set();

  while (worklist.length) {
    const id = worklist.pop();
    if (seen.has(id)) continue;
    seen.add(id);

    const [s1, s2] = pairOf.get(id);

    for (const sym of combinedAlphabet) {
      const t1 = step(dfa1, s1, sym);
      const t2 = step(dfa2, s2, sym);
      if (t1 === DEAD && t2 === DEAD) continue; // both dead -> implicit dead, skip

      const targetId = getOrCreate(t1, t2);
      result.transitions.get(id).set(sym, targetId);
      if (!seen.has(targetId)) worklist.push(targetId);
    }
  }

  return result;
}

module.exports = { product };