// core/minimize.js
const { DFA } = require("./automata");

/**
 * Minimizes a DFA via partition refinement (Hopcroft-style, table-filling variant).
 * A "dead" trap state is used internally so the transition function is total
 * (required for the minimization argument to be valid), but we DROP it from
 * the final output so the result stays consistent with our DFA convention
 * of treating a missing transition as an implicit dead state.
 */
function minimizeDfa(dfa) {
  const DEAD = "__DEAD__";
  const allStates = [...dfa.states, DEAD];
  const alphabet = [...dfa.alphabet];

  function step(state, symbol) {
    if (state === DEAD) return DEAD;
    const result = dfa.step(state, symbol);
    return result === null ? DEAD : result;
  }

  let partition = [
    new Set(allStates.filter((s) => dfa.accept.has(s))),
    new Set(allStates.filter((s) => !dfa.accept.has(s))),
  ].filter((group) => group.size > 0);

  function findGroup(partition, state) {
    return partition.findIndex((g) => g.has(state));
  }

  let changed = true;
  while (changed) {
    changed = false;
    const newPartition = [];

    for (const group of partition) {
      const buckets = new Map();
      for (const state of group) {
        const signature = alphabet
          .map((sym) => findGroup(partition, step(state, sym)))
          .join(",");
        if (!buckets.has(signature)) buckets.set(signature, new Set());
        buckets.get(signature).add(state);
      }
      if (buckets.size > 1) changed = true;
      for (const bucket of buckets.values()) newPartition.push(bucket);
    }
    partition = newPartition;
  }

  const deadGroupIdx = partition.findIndex((g) => g.has(DEAD));

  const minDfa = new DFA();
  minDfa.alphabet = dfa.alphabet;

  const groupIdOf = new Map();
  partition.forEach((group, idx) => {
    for (const state of group) groupIdOf.set(state, idx);
  });

  partition.forEach((group, idx) => {
    if (idx === deadGroupIdx) return; // drop explicit dead state
    minDfa.states.add(idx);
    minDfa.transitions.set(idx, new Map());
    const representative = [...group][0];
    if (dfa.accept.has(representative)) {
      minDfa.accept.add(idx);
    }
  });

  minDfa.start = groupIdOf.get(dfa.start);

  partition.forEach((group, idx) => {
    if (idx === deadGroupIdx) return;
    const representative = [...group][0];
    for (const sym of alphabet) {
      const target = step(representative, sym);
      const targetIdx = groupIdOf.get(target);
      if (targetIdx !== deadGroupIdx) {
        minDfa.transitions.get(idx).set(sym, targetIdx);
      }
    }
  });

  return minDfa;
}

module.exports = { minimizeDfa };