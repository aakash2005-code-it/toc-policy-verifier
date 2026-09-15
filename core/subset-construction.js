// core/subset-construction.js
const { DFA } = require("./automata");

function setKey(stateSet) {
  return [...stateSet].sort((a, b) => a - b).join(",");
}

/**
 * Converts an NFA into an equivalent DFA using subset construction.
 */
function nfaToDfa(nfa) {
  const dfa = new DFA();
  const alphabet = nfa.alphabet();
  dfa.alphabet = alphabet;

  const startSet = nfa.epsilonClosure(new Set([nfa.start]));
  const startKey = setKey(startSet);

  const dfaStateOf = new Map(); // key -> dfa state id
  const nfaSetOf = new Map();   // dfa state id -> Set of nfa states

  let nextId = 0;
  function getOrCreateDfaState(nfaStateSet) {
    const key = setKey(nfaStateSet);
    if (dfaStateOf.has(key)) return dfaStateOf.get(key);
    const id = nextId++;
    dfaStateOf.set(key, id);
    nfaSetOf.set(id, nfaStateSet);
    dfa.states.add(id);
    dfa.transitions.set(id, new Map());
    // accepting if any NFA state in this set is accepting
    for (const s of nfaStateSet) {
      if (nfa.accept.has(s)) {
        dfa.accept.add(id);
        break;
      }
    }
    return id;
  }

  const startId = getOrCreateDfaState(startSet);
  dfa.start = startId;

  const worklist = [startId];
  const processed = new Set();

  while (worklist.length) {
    const currentId = worklist.pop();
    if (processed.has(currentId)) continue;
    processed.add(currentId);

    const currentSet = nfaSetOf.get(currentId);

    for (const symbol of alphabet) {
      // move: all NFA states reachable from currentSet on `symbol`
      const moveSet = new Set();
      for (const nfaState of currentSet) {
        const map = nfa.transitions.get(nfaState);
        if (map && map.has(symbol)) {
          for (const t of map.get(symbol)) moveSet.add(t);
        }
      }
      if (moveSet.size === 0) continue; // no transition -> implicit dead state

      const closureSet = nfa.epsilonClosure(moveSet);
      const targetId = getOrCreateDfaState(closureSet);
      dfa.transitions.get(currentId).set(symbol, targetId);

      if (!processed.has(targetId)) worklist.push(targetId);
    }
  }

  return dfa;
}

module.exports = { nfaToDfa };