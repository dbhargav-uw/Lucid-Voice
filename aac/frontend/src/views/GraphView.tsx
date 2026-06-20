// GraphView — visualizes the person's memory graph.
// Phase 1: renders ForceGraph with empty/placeholder data, a sparse/dense
// toggle, and a legend.
// TODO Phase 5: load real graph via getGraph(personId) and highlight the
//   retrieved subgraph (anchor_ids / subgraph_node_ids) from the last trace.

import { useState } from "react";
import ForceGraph, {
  type ForceGraphNode,
  type ForceGraphLink,
} from "../components/ForceGraph";

type GraphMode = "session-start" | "after-learning";

const LEGEND: { color: string; label: string }[] = [
  { color: "#2b6cff", label: "Retrieved" },
  { color: "#9aa0a6", label: "Memory node" },
];

export default function GraphView() {
  const [mode, setMode] = useState<GraphMode>("session-start");

  // TODO Phase 5: replace with getGraph(PERSON_ID) results. The two modes
  //   show the graph before vs. after a learning session (sparse vs. dense).
  const nodes: ForceGraphNode[] = [];
  const links: ForceGraphLink[] = [];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        padding: "1.5rem",
        height: "100%",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.3rem" }}>Memory graph</h2>

        <div
          role="tablist"
          aria-label="Graph view"
          style={{ display: "inline-flex", gap: "0.5rem" }}
        >
          {(["session-start", "after-learning"] as GraphMode[]).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              style={{
                minHeight: "44px",
                padding: "0 1rem",
                borderRadius: "12px",
                border: "1px solid rgba(0,0,0,0.12)",
                background:
                  mode === m ? "var(--accent, #2b6cff)" : "transparent",
                color: mode === m ? "#fff" : "inherit",
                fontSize: "0.95rem",
                cursor: "pointer",
              }}
            >
              {m === "session-start" ? "Session start" : "After learning"}
            </button>
          ))}
        </div>
      </header>

      <div
        style={{
          flex: 1,
          minHeight: "420px",
          borderRadius: "16px",
          overflow: "hidden",
          background: "var(--strip-bg, #ffffff)",
          border: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <ForceGraph nodes={nodes} links={links} />
      </div>

      <footer style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
        {LEGEND.map((item) => (
          <span
            key={item.label}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.9rem",
              opacity: 0.8,
            }}
          >
            <span
              aria-hidden
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: item.color,
              }}
            />
            {item.label}
          </span>
        ))}
      </footer>
    </div>
  );
}
