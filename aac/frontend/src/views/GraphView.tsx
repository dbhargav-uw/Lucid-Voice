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

// LIGHT theme tokens (mirror tailwind.config.js so the inline styles re-theme
// by value, keeping AA contrast on the soft off-white canvas).
const INK = "#F5F7FA";
const INK_RAISED = "#FFFFFF";
const INK_LINE = "#D6DEE8";
const TEXT = "#161A21";
const TEXT_MUTED = "#566273";
const TEXT_FAINT = "#8089A3";
const VOICE = "#E14826"; // THE HUMAN coral
const VOICE_DEEP = "#C23A1B";
const VOICE_SOFT = "#FCE9E3";
const MIND = "#0C8276"; // THE MACHINE teal
const MIND_SOFT = "#DBF1ED";

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
    <div style={{ display: "flex", height: "100%", background: INK, color: TEXT }}>
      {/* Graph canvas */}
      <div ref={containerRef} style={{ position: "relative", flex: 1, minWidth: 0, background: INK }}>
        {data && dims.w > 0 && dims.h > 0 ? (
          <ForceGraph data={data} width={dims.w} height={dims.h} highlight={highlight} />
        ) : (
          <div
            style={{
              display: "grid",
              placeItems: "center",
              height: "100%",
              color: TEXT_MUTED,
              fontSize: 14,
            }}
          >
            {error ? `Could not load graph: ${error}` : "Loading memory graph…"}
          </div>
        )}

        {/* Status (top-left) */}
        <div style={overlay("top")}>
          <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>Elena · memory graph</div>
          <div style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 2 }}>
            {data ? `${data.nodes.length} nodes · ${data.links.length} edges` : "—"}
            {" · "}
            <span
              style={{
                color: highlight.active ? MIND : TEXT_FAINT,
                fontWeight: 600,
              }}
            >
              {highlight.active ? "firing" : "idle"}
            </span>
          </div>
        </div>

        {/* Legend (bottom-left) */}
        <div
          style={{
            ...overlay("bottom"),
            display: "flex",
            flexDirection: "column",
            gap: 8,
            maxWidth: 380,
          }}
        >
          <div
            style={{
              fontSize: 10.5,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: TEXT_MUTED,
              fontWeight: 600,
            }}
          >
            Legend
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px" }}>
            {usedKinds.map((k) => (
              <span
                key={k}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  fontSize: 12.5,
                  color: TEXT,
                }}
              >
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: KIND_COLORS[k] ?? "#6B7787",
                    border: "1px solid rgba(22,26,33,0.14)",
                  }}
                />
                {k}
              </span>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              fontSize: 12,
              color: TEXT_MUTED,
              paddingTop: 2,
              borderTop: `1px solid ${INK_LINE}`,
              marginTop: 2,
            }}
          >
            <span
              style={{
                width: 14,
                height: 0,
                borderTop: `2px solid ${VOICE}`,
                display: "inline-block",
              }}
            />
            firing pulse: retrieved memory path
          </div>
        </div>
      </div>

      {/* Side panel */}
      <aside
        style={{
          width: 340,
          flexShrink: 0,
          borderLeft: `1px solid ${INK_LINE}`,
          background: INK_RAISED,
          padding: "18px 16px",
          overflowY: "auto",
        }}
      >
        <h2 style={{ margin: "0 0 4px", fontSize: 18, color: TEXT }}>Reconstruction</h2>
        <p style={{ margin: "0 0 14px", fontSize: 12.5, color: TEXT_MUTED, lineHeight: 1.5 }}>
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
          <div style={{ fontSize: 13, color: TEXT_MUTED, marginBottom: 16 }}>
            No reconstruction yet. Trigger one below (or from the Speak view).
          </div>
        )}

        {candidates.map((c, i) => (
          <div
            key={i}
            style={{
              border: `1px solid ${INK_LINE}`,
              background: INK,
              borderRadius: 12,
              padding: "10px 12px",
              marginBottom: 10,
            }}
          >
            <div style={{ fontSize: 15, lineHeight: 1.4, color: TEXT }}>{c.text}</div>
            <div style={{ fontSize: 11, color: TEXT_MUTED, margin: "6px 0 8px" }}>
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
                    background: VOICE_SOFT,
                    color: VOICE_DEEP,
                    border: `1px solid ${VOICE}`,
                  }}
                >
                  {labelById.get(id) ?? id}
                </span>
              ))}
            </div>
          </div>
        ))}

        <h3
          style={{
            fontSize: 11,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: TEXT_MUTED,
            fontWeight: 600,
            margin: "18px 0 8px",
          }}
        >
          Try it
        </h3>
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
                border: `1px solid ${triggering === t.label ? MIND : INK_LINE}`,
                background: triggering === t.label ? MIND_SOFT : INK_RAISED,
                color: TEXT,
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
    padding: "10px 13px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.82)",
    backdropFilter: "blur(8px)",
    border: `1px solid ${INK_LINE}`,
    boxShadow: "0 1px 2px 0 rgba(22,26,33,0.04), 0 10px 24px -14px rgba(22,26,33,0.12)",
  };
}

function Pill({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <span
      style={{
        fontSize: 11,
        padding: "3px 9px",
        borderRadius: 999,
        background: warn ? "#FCE9E3" : MIND_SOFT,
        color: warn ? VOICE_DEEP : MIND,
        border: `1px solid ${warn ? VOICE : "rgba(12,130,118,0.35)"}`,
      }}
    >
      {label}: <strong style={{ color: warn ? VOICE_DEEP : "#075E55" }}>{value}</strong>
    </span>
  );
}
