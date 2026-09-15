
function shortestAcceptedString(dfa) {
  if (dfa.accept.has(dfa.start)) return ""; // empty string already accepted

  const visited = new Set([dfa.start]);
  const queue = [{ state: dfa.start, path: "" }];

  while (queue.length) {
    const { state, path } = queue.shift();
    const transitions = dfa.transitions.get(state);
    if (!transitions) continue;

    // sort symbols for determinism (so results are reproducible/testable)
    const symbols = [...transitions.keys()].sort();

    for (const sym of symbols) {
      const next = transitions.get(sym);
      if (visited.has(next)) continue;
      visited.add(next);

      const newPath = path + sym;
      if (dfa.accept.has(next)) {
        return newPath;
      }
      queue.push({ state: next, path: newPath });
    }
  }

  return null; // language is empty — no bypass exists
}

module.exports = { shortestAcceptedString };