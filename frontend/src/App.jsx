import { useState } from "react";
import DfaGraph from "./DfaGraph";
import "./App.css";

const API_BASE = "https://toc-policy-verifier.onrender.com";

function App() {
    const presets = {
    weak: { minLength: 6, maxLength: 20, requireLower: false, requireUpper: false, requireDigit: false, requireSpecial: false, forbiddenSubstrings: "" },
    medium: { minLength: 8, maxLength: 20, requireLower: true, requireUpper: false, requireDigit: true, requireSpecial: false, forbiddenSubstrings: "" },
    strong: { minLength: 8, maxLength: 16, requireLower: true, requireUpper: true, requireDigit: true, requireSpecial: true, forbiddenSubstrings: "password, 12345678, qwerty123, letmein1" },
  };

  function loadPreset(name) {
    setSpec(presets[name]);
    setResult(null);
    setError(null);
    setCheckResult(null);
  }
  const [spec, setSpec] = useState({
    minLength: 8,
    maxLength: 16,
    requireLower: true,
    requireUpper: true,
    requireDigit: true,
    requireSpecial: true,
    forbiddenSubstrings: "password",
  });


  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [testString, setTestString] = useState("");
  const [checkResult, setCheckResult] = useState(null);

  function handleChange(field, value) {
    setSpec((prev) => ({ ...prev, [field]: value }));
  }

  function buildRequestBody() {
    return {
      minLength: Number(spec.minLength),
      maxLength: Number(spec.maxLength),
      requireLower: spec.requireLower,
      requireUpper: spec.requireUpper,
      requireDigit: spec.requireDigit,
      requireSpecial: spec.requireSpecial,
      forbiddenSubstrings: spec.forbiddenSubstrings
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
    };
  }

  async function handleVerify() {
    setLoading(true);
    setError(null);
    setResult(null);
    setCheckResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildRequestBody()),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckString() {
    if (!testString) return;
    try {
      const res = await fetch(`${API_BASE}/api/check-string`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spec: buildRequestBody(), testString }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Check failed");
      setCheckResult(data.accepted);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container">
      <h1>Formal Password Policy Verifier</h1>
      <p className="subtitle">
        Compiles your policy into a DFA and formally verifies it against a threat
        library of known-weak passwords — using automata intersection, not sampling.
      </p>
       <DfaGraph />

      <div className="card">
        <h2>1. Define your policy</h2>
          <div className="row" style={{ marginBottom: 16 }}>
          <button className="secondary" onClick={() => loadPreset("weak")}>Load: Weak</button>
          <button className="secondary" onClick={() => loadPreset("medium")}>Load: Medium</button>
          <button className="secondary" onClick={() => loadPreset("strong")}>Load: Strong</button>
        </div>
        <div className="row">
          <label>
            Min length
            <input
              type="number"
              value={spec.minLength}
              onChange={(e) => handleChange("minLength", e.target.value)}
            />
          </label>
          <label>
            Max length
            <input
              type="number"
              value={spec.maxLength}
              onChange={(e) => handleChange("maxLength", e.target.value)}
            />
          </label>
        </div>

        <div className="checkboxes">
          <label>
            <input
              type="checkbox"
              checked={spec.requireLower}
              onChange={(e) => handleChange("requireLower", e.target.checked)}
            />
            Require lowercase
          </label>
          <label>
            <input
              type="checkbox"
              checked={spec.requireUpper}
              onChange={(e) => handleChange("requireUpper", e.target.checked)}
            />
            Require uppercase
          </label>
          <label>
            <input
              type="checkbox"
              checked={spec.requireDigit}
              onChange={(e) => handleChange("requireDigit", e.target.checked)}
            />
            Require digit
          </label>
          <label>
            <input
              type="checkbox"
              checked={spec.requireSpecial}
              onChange={(e) => handleChange("requireSpecial", e.target.checked)}
            />
            Require special character
          </label>
        </div>

        <label className="full-width">
          Forbidden substrings (comma-separated)
          <input
            type="text"
            value={spec.forbiddenSubstrings}
            onChange={(e) => handleChange("forbiddenSubstrings", e.target.value)}
            placeholder="password, 12345678"
          />
        </label>

        <button onClick={handleVerify} disabled={loading}>
          {loading ? "Compiling & verifying (may take a few seconds)..." : "Verify Policy"}
        </button>
      </div>

      {error && <div className="card error">Error: {error}</div>}

      {result && (
        <div className={`card result ${result.safe ? "safe" : "unsafe"}`}>
          <h2>2. Verification result</h2>
          {result.safe ? (
            <p>
              ✅ <strong>Provably safe.</strong> No string exists that satisfies this
              policy AND matches a known-weak password in the threat library.
            </p>
          ) : (
            <p>
              ⚠️ <strong>Bypass found:</strong>{" "}
              <code>{JSON.stringify(result.bypass)}</code> — this string satisfies your
              policy but is a known-weak password.
            </p>
          )}
          <p className="meta">
            Policy DFA states: {result.policyStates} · Threat DFA states:{" "}
            {result.threatStates}
          </p>
        </div>
      )}

      {result && (
        <div className="card">
          <h2>3. Test a specific string (optional)</h2>
          <div className="row">
            <input
              type="text"
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="Try a password..."
            />
            <button onClick={handleCheckString}>Check</button>
          </div>
          {checkResult !== null && (
            <p>
              {checkResult ? "✅ Accepted by this policy" : "❌ Rejected by this policy"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;