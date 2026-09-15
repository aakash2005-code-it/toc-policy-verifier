# Formal Password/Input Policy Verifier Using Finite Automata

A Theory of Computation project that treats input-validation policies (e.g., password rules) as formal languages, and **proves** whether a policy is safe against a library of known-weak passwords — instead of testing it against a handful of examples.

Built entirely from scratch: no third-party automata libraries. Implements Thompson's construction, subset construction (NFA to DFA), DFA minimization (partition refinement), product construction (intersection/complement), and BFS-based shortest counterexample extraction.

## What it does

- Compiles a password policy (length, character classes, forbidden substrings) into a minimized DFA
- Compiles a threat library of known-weak passwords into a DFA
- Formally verifies whether the two languages intersect. If they do, it returns the shortest possible bypass string as a concrete proof; if not, it returns a formal safety certificate

## Key result

An alphabet-class optimization (collapsing characters into equivalence classes like any lowercase letter, except where individual characters matter) reduced compile time by roughly 74x (21s to 284ms) with zero loss of correctness.

Evaluated against 4 common real-world-style policies: 3 of 4 had a formally provable gap, including a policy requiring uppercase, lowercase, and digit that still admitted Welcome1.

## Tech stack

- Backend: Node.js/Express, custom automata engine (no external automata libraries)
- Frontend: React + Vite, React Flow for DFA graph visualization

## Project structure

- core: NFA/DFA data structures, Thompson's construction, subset construction, minimization, product construction, shortest-string BFS
- policy: Policy rule builders and compiler (combines rules via intersection)
- threats: Threat language library (known-weak passwords)
- verifier: Verification engine (policy vs threat, shared alphabet handling)
- api: Express REST API
- frontend: React UI (policy builder, results, DFA visualizer)
- eval: Benchmark script vs real-world-style policies
- tests: Step-by-step correctness tests for every pipeline stage

## Running locally

Backend:
npm install
node api/server.js  (runs on http://localhost:3001)

Frontend (separate terminal):
cd frontend
npm install
npm run dev  (runs on http://localhost:5173)

## Author

Aakash Wadhwani, B.Tech Information Technology, VIT Vellore, BITE306L Theory of Computation
