// core/automata.js

const EPSILON = "ε";


class NFA {
  constructor() {
    this.states = new Set();
    this.transitions = new Map(); // state -> Map(symbol -> Set(state))
    this.start = null;
    this.accept = new Set();
    this.nextStateId = 0;
  }

  newState() {
    const id = this.nextStateId++;
    this.states.add(id);
    this.transitions.set(id, new Map());
    return id;
  }

  addTransition(from, symbol, to) {
    if (!this.transitions.has(from)) this.transitions.set(from, new Map());
    const map = this.transitions.get(from);
    if (!map.has(symbol)) map.set(symbol, new Set());
    map.get(symbol).add(to);
  }

  // epsilon-closure of a set of states
  epsilonClosure(states) {
    const stack = [...states];
    const closure = new Set(states);
    while (stack.length) {
      const s = stack.pop();
      const map = this.transitions.get(s);
      if (map && map.has(EPSILON)) {
        for (const t of map.get(EPSILON)) {
          if (!closure.has(t)) {
            closure.add(t);
            stack.push(t);
          }
        }
      }
    }
    return closure;
  }

  // all symbols used in this NFA, excluding epsilon
  alphabet() {
    const alpha = new Set();
    for (const map of this.transitions.values()) {
      for (const sym of map.keys()) {
        if (sym !== EPSILON) alpha.add(sym);
      }
    }
    return alpha;
  }
}


class DFA {
  constructor() {
    this.states = new Set();
    this.transitions = new Map(); // state -> Map(symbol -> state)
    this.start = null;
    this.accept = new Set();
    this.alphabet = new Set();
    
  }

  step(state, symbol) {
    const map = this.transitions.get(state);
    if (!map || !map.has(symbol)) return null; // implicit dead state
    return map.get(symbol);
  }

  accepts(str) {
    let cur = this.start;
    for (const ch of str) {
      cur = this.step(cur, ch);
      if (cur === null) return false;
    }
    return this.accept.has(cur);
  }
  // add this method inside the DFA class in core/automata.js, right before the closing `}`

  toGraphData() {
    const nodes = [...this.states].map((s) => ({
      id: String(s),
      isStart: s === this.start,
      isAccept: this.accept.has(s),
    }));

    const edges = [];
    for (const [from, transMap] of this.transitions) {
      // group symbols that go to the same target, so edges aren't duplicated
      const bySource = new Map(); // targetState -> [symbols]
      for (const [sym, to] of transMap) {
        if (!bySource.has(to)) bySource.set(to, []);
        bySource.get(to).push(sym);
      }
      for (const [to, symbols] of bySource) {
        edges.push({ from: String(from), to: String(to), label: symbols.join(",") });
      }
    }

    return { nodes, edges, start: String(this.start) };
  }
}

module.exports = { EPSILON, NFA, DFA };