// GraphView — live knowledge-graph visualization with retrieval highlighting
// (Phase 5). Loads GET /graph/{person} once, then polls /trace/latest every
// 600ms; when a new /generate trace arrives it lights up the retrieved
// subgraph (anchor rings on the partner, glow on retrieved nodes, grounded
// nodes emphasized most) and shows the candidates with their grounded labels.

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import ForceGraph, {
  KIND_COLORS,
  type FGNode,
  type FGLink,
  type GraphData,
  type Highlight,
} from "../components/ForceGraph";
import { getGraph, generate } from "../lib/api";

const PERSON_ID = "elena";
const POLL_MS = 600;

interface TraceCandidate {
  text: string;
  register: string;
  length_label: string;
  rationale: string;
  grounded_node_ids: string[];
}
interface Trace {
  anchors?: string[];
  subgraph_node_ids?: string[];
  subgraph_edge_ids?: string[];
  confidence?: number;
  latency_ms?: number;
  abstain?: boolean;
  candidates?: TraceCandidate[];
}

const EMPTY_HL: Highlight = {
  active: false,
  anchorIds: new Set(),
  subgraphNodeIds: new Set(),
  subgraphEdgeIds: new Set(),
  groundedIds: new Set(),
};

const TRY_IT: { label: string; fragments: string[]; context: string }[] = [
  { label: "“cold”, “window”", fragments: ["cold", "window"], context: "" },
  {
    label: "“tired”, “maybe” · dinner",
    fragments: ["tired", "maybe"],
    context: "Mom, do you want to come for dinner Sunday?",
  },
  {
    label: "“tired”, “maybe” · play",
    fragments: ["tired", "maybe"],
    context: "Grandma, will you play with me?",
  },
];

export default function GraphView() {
  const [data, setData] = useState<GraphData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [highlight, setHighlight] = useState<Highlight>(EMPTY_HL);
  const [candidates, setCandidates] = useState<TraceCandidate[]>([]);
  const [meta, setMeta] = useState<{ confidence: number; latency: number; abstain: boolean } | null>(
    null,
  );
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [triggering, setTriggering] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const traceSig = useRef<string>("");

  // --- load the graph once ---
  useEffect(() => {
    let alive = true;
    getGraph(PERSON_ID)
      .then((g) => {
        if (!alive) return;
        const nodes: FGNode[] = g.nodes.map((n) => {
          const node: FGNode = {
            id: n.id,
            kind: n.type,
            label: n.label,
            salience: n.salience,
          };
          if (n.type === "user") {
            node.fx = 0; // pin the speaker at the center for a stable layout
            node.fy = 0;
          }
          return node;
        });
        const links: FGLink[] = g.edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          type: e.type,
          weight: e.weight,
          term: (e as { term?: string }).term ?? "",
        }));
        setData({ nodes, links });
      })
      .catch((e) => alive && setError(String(e)));
    return () => {
      alive = false;
    };
  }, []);

  // --- size the canvas to its container ---
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setDims({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [data]);

  // --- poll the latest trace; update highlight when it changes ---
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const res = await fetch("/api/trace/latest");
        const trace = (await res.json()) as Trace;
        if (!alive) return;
        const sig = JSON.stringify([
          trace.anchors ?? [],
          trace.subgraph_node_ids ?? [],
          trace.latency_ms ?? 0,
          trace.confidence ?? 0,
          (trace.candidates ?? []).map((c) => c.text),
        ]);
        if (sig === traceSig.current) return;
        traceSig.current = sig;

        const grounded = new Set<string>();
        (trace.candidates ?? []).forEach((c) =>
          (c.grounded_node_ids ?? []).forEach((id) => grounded.add(id)),
        );
        const anchorIds = new Set(trace.anchors ?? []);
        const subgraphNodeIds = new Set(trace.subgraph_node_ids ?? []);
        setHighlight({
          active: subgraphNodeIds.size > 0 || anchorIds.size > 0,
          anchorIds,
          subgraphNodeIds,
          subgraphEdgeIds: new Set(trace.subgraph_edge_ids ?? []),
          groundedIds: grounded,
        });
        setCandidates(trace.candidates ?? []);
        setMeta({
          confidence: trace.confidence ?? 0,
          latency: trace.latency_ms ?? 0,
          abstain: !!trace.abstain,
        });
      } catch {
        /* keep polling */
      }
    };
    const id = setInterval(tick, POLL_MS);
    tick();
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const labelById = useMemo(() => {
    const m = new Map<string, string>();
    data?.nodes.forEach((n) => m.set(n.id, n.label));
    return m;
  }, [data]);

  const runDemo = useCallback(
    async (t: (typeof TRY_IT)[number]) => {
      setTriggering(t.label);
      try {
        await generate({ person_id: PERSON_ID, fragments: t.fragments, context: t.context });
      } catch {
        /* the poller surfaces nothing; ignore */
      } finally {
        setTriggering(null);
      }
    },
    [],
  );

  const usedKinds = useMemo(
    () => Array.from(new Set(data?.nodes.map((n) => n.kind) ?? [])).sort(),
    [data],
  );

  return (
    <div style={{ display: "flex", height: "100%", background: "#0b1220", color: "#dce4ee" }}>
      {/* Graph canvas */}
      <div ref={containerRef} style={{ position: "relative", flex: 1, minWidth: 0 }}>
        {data && dims.w > 0 && dims.h > 0 ? (
          <ForceGraph data={data} width={dims.w} height={dims.h} highlight={highlight} />
        ) : (
          <div style={{ display: "grid", placeItems: "center", height: "100%", opacity: 0.6 }}>
            {error ? `Could not load graph: ${error}` : "Loading memory graph…"}
          </div>
        )}

        {/* Status (top-left) */}
        <div style={overlay("top")}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Elena · memory graph</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            {data ? `${data.nodes.length} nodes · ${data.links.length} edges` : "—"}
            {" · "}
            <span style={{ color: highlight.active ? "#7fdcff" : "#7a8aa0" }}>
              {highlight.active ? "retrieved" : "idle"}
            </span>
          </div>
        </div>

        {/* Legend (bottom-left) */}
        <div style={{ ...overlay("bottom"), display: "flex", flexWrap: "wrap", gap: 10, maxWidth: 360 }}>
          {usedKinds.map((k) => (
            <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}>
              <span
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  background: KIND_COLORS[k] ?? "#9aa6b5",
                  boxShadow: `0 0 6px ${KIND_COLORS[k] ?? "#9aa6b5"}`,
                }}
              />
              {k}
            </span>
          ))}
        </div>
      </div>

      {/* Side panel */}
      <aside
        style={{
          width: 340,
          flexShrink: 0,
          borderLeft: "1px solid #1c2840",
          background: "#0d1626",
          padding: "18px 16px",
          overflowY: "auto",
        }}
      >
        <h2 style={{ margin: "0 0 4px", fontSize: 18 }}>Reconstruction</h2>
        <p style={{ margin: "0 0 14px", fontSize: 12.5, opacity: 0.65, lineHeight: 1.5 }}>
          The candidates from the latest <code>/generate</code>, grounded in the lit-up nodes.
        </p>

        {meta && (
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            <Pill label="confidence" value={meta.confidence.toFixed(2)} />
            <Pill label="latency" value={`${meta.latency} ms`} />
            {meta.abstain && <Pill label="abstain" value="ask for a word" warn />}
          </div>
        )}

        {!meta && (
          <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 16 }}>
            No reconstruction yet. Trigger one below (or from the Speak view).
          </div>
        )}

        {candidates.map((c, i) => (
          <div
            key={i}
            style={{
              border: "1px solid #1f2c47",
              background: "#101b2e",
              borderRadius: 12,
              padding: "10px 12px",
              marginBottom: 10,
            }}
          >
            <div style={{ fontSize: 15, lineHeight: 1.4 }}>{c.text}</div>
            <div style={{ fontSize: 11, opacity: 0.55, margin: "6px 0 8px" }}>
              {c.register} · {c.length_label}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {(c.grounded_node_ids ?? []).map((id) => (
                <span
                  key={id}
                  title={id}
                  style={{
                    fontSize: 11,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: "#13314a",
                    color: "#9fd0ff",
                    border: "1px solid #1d4a66",
                  }}
                >
                  {labelById.get(id) ?? id}
                </span>
              ))}
            </div>
          </div>
        ))}

        <h3 style={{ fontSize: 13, opacity: 0.7, margin: "18px 0 8px" }}>Try it</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {TRY_IT.map((t) => (
            <button
              key={t.label}
              type="button"
              disabled={triggering !== null}
              onClick={() => runDemo(t)}
              style={{
                textAlign: "left",
                padding: "9px 12px",
                borderRadius: 10,
                border: "1px solid #24344f",
                background: triggering === t.label ? "#1b3350" : "#111d31",
                color: "#cfe0f2",
                fontSize: 13,
                cursor: triggering ? "wait" : "pointer",
              }}
            >
              {triggering === t.label ? "thinking…" : t.label}
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}

function overlay(pos: "top" | "bottom"): CSSProperties {
  return {
    position: "absolute",
    left: 14,
    [pos]: 14,
    padding: "8px 12px",
    borderRadius: 12,
    background: "rgba(8,14,24,0.6)",
    backdropFilter: "blur(6px)",
    border: "1px solid rgba(120,150,190,0.15)",
  };
}

function Pill({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <span
      style={{
        fontSize: 11,
        padding: "3px 9px",
        borderRadius: 999,
        background: warn ? "#3a2a12" : "#142235",
        color: warn ? "#ffcf8f" : "#9fb6d4",
        border: `1px solid ${warn ? "#5a4220" : "#22344f"}`,
      }}
    >
      {label}: <strong style={{ color: warn ? "#ffe0b0" : "#dce8f7" }}>{value}</strong>
    </span>
  );
}
