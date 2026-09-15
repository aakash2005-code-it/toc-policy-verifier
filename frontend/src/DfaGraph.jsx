import { useEffect, useState, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const API_BASE = "https://toc-policy-verifier.onrender.com";

// simple circular layout so we don't need a heavy layout library
function layoutNodes(nodes) {
  const radius = 150;
  const centerX = 250;
  const centerY = 150;
  const n = nodes.length;
  return nodes.map((node, i) => {
    const angle = (2 * Math.PI * i) / n;
    return {
      id: node.id,
      position: {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      },
      data: { label: node.isStart ? `${node.id} (start)` : node.id },
      style: {
        background: node.isAccept ? "#1f4d33" : "#1a1d24",
        color: "#e6e6e6",
        border: node.isAccept ? "3px double #4ade80" : "1px solid #3a3f4b",
        borderRadius: "50%",
        width: 60,
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
      },
    };
  });
}

function layoutEdges(edges) {
  return edges.map((e, i) => ({
    id: `e${i}`,
    source: e.from,
    target: e.to,
    label: e.label,
    labelStyle: { fill: "#e6e6e6", fontSize: 12 },
    style: { stroke: "#7a7f89" },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#7a7f89" },
    animated: false,
    type: e.from === e.to ? "default" : "default",
  }));
}

export default function DfaGraph() {
  const [exampleType, setExampleType] = useState("requires-digit");
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (type) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/example-dfa/${type}`);
      const data = await res.json();
      setNodes(layoutNodes(data.nodes));
      setEdges(layoutEdges(data.edges));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(exampleType);
  }, [exampleType, load]);

  return (
    <div className="card">
      <h2>DFA Visualizer (illustrative examples)</h2>
      <p className="meta">
        Full compiled policies can have hundreds of states — too many to render
        legibly. These small examples illustrate the underlying construction.
      </p>

      <div className="row" style={{ marginBottom: 12 }}>
        <button
          className={exampleType === "requires-digit" ? "active" : ""}
          onClick={() => setExampleType("requires-digit")}
        >
          Requires a digit
        </button>
        <button
          className={exampleType === "length" ? "active" : ""}
          onClick={() => setExampleType("length")}
        >
          Length 2–3
        </button>
        <button
          className={exampleType === "forbids-bad" ? "active" : ""}
          onClick={() => setExampleType("forbids-bad")}
        >
          Forbids "LL"
        </button>
      </div>

      <div style={{ height: 350, background: "#0f1117", borderRadius: 8 }}>
        {!loading && (
          <ReactFlow nodes={nodes} edges={edges} fitView>
            <Background color="#2a2e38" />
            <Controls />
          </ReactFlow>
        )}
      </div>
    </div>
  );
}