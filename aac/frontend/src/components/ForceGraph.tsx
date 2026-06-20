// ForceGraph — polished canvas renderer over react-force-graph-2d (Phase 5).
//
// Two visual states driven by `highlight.active`:
//   default  — calm, everything slightly dimmed, labels on hover (+ the user).
//   retrieved — non-subgraph dimmed hard; subgraph at full opacity with a glow
//               and always-on labels; anchors get a white ring; grounded nodes
//               are emphasized most (extra ring + strongest glow). Highlighted
//               nodes and edges breathe via a time-based pulse.

import { useEffect, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
// d3-force-3d is the same force lib react-force-graph-2d uses internally, so a
// collision force from it composes cleanly and keeps nodes/labels from crowding.
import { forceCollide } from "d3-force-3d";

export const KIND_COLORS: Record<string, string> = {
  user: "#f5c451", // warm amber — the speaker, centered
  contact: "#ff8fa3", // coral
  topic: "#56d3c4", // teal
  routine: "#6aa6ff", // blue
  preference: "#b69cff", // violet
  need: "#ff9f6b", // warm orange
  place: "#86d98b", // green
  phrase: "#f29bdd", // pink
  event: "#c9d36a", // olive
};
const DEFAULT_COLOR = "#9aa6b5";

export interface FGNode {
  id: string;
  kind: string;
  label: string;
  salience: number;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
}
export interface FGLink {
  id: string;
  source: string | FGNode;
  target: string | FGNode;
  type: string;
  weight: number;
  term?: string;
}
export interface GraphData {
  nodes: FGNode[];
  links: FGLink[];
}
export interface Highlight {
  active: boolean;
  anchorIds: Set<string>;
  subgraphNodeIds: Set<string>;
  subgraphEdgeIds: Set<string>;
  groundedIds: Set<string>;
}

function nodeRadius(n: FGNode): number {
  const base = n.kind === "user" ? 10 : 5.5;
  const s = Math.min(2, Math.max(0.4, n.salience ?? 1));
  return base * (0.82 + 0.3 * s);
}

const pulse = () => 0.5 + 0.5 * Math.sin(performance.now() / 450);

export default function ForceGraph({
  data,
  width,
  height,
  highlight,
}: {
  data: GraphData;
  width: number;
  height: number;
  highlight: Highlight;
}) {
  const fgRef = useRef<any>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const fitted = useRef(false);

  // Configure forces once for a stable, readable, well-spread layout.
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    fg.d3Force("charge")?.strength(-320).distanceMax(420);
    fg.d3Force("link")?.distance(78).strength(0.32);
    if (fg.d3Force("center")) fg.d3Force("center").strength(0.04);
    // Keep nodes (and therefore their labels) from overlapping.
    fg.d3Force("collide", forceCollide((n: FGNode) => nodeRadius(n) + 18).iterations(2));
    fitted.current = false;
    fg.d3ReheatSimulation?.();
  }, [data]);

  const hi = highlight.active;

  const nodeCanvas = (node: any, ctx: CanvasRenderingContext2D, scale: number) => {
    const n = node as FGNode;
    const color = KIND_COLORS[n.kind] ?? DEFAULT_COLOR;
    const r = nodeRadius(n);
    const inSub = highlight.subgraphNodeIds.has(n.id);
    const isAnchor = highlight.anchorIds.has(n.id);
    const isGrounded = highlight.groundedIds.has(n.id);
    const lit = inSub || isAnchor || isGrounded;
    const p = pulse();

    let alpha: number;
    if (!hi) alpha = 0.92;
    else if (lit) alpha = 1;
    else alpha = 0.12;

    // Node circle (+ glow for the retrieved subgraph).
    ctx.save();
    if (hi && lit) {
      ctx.shadowColor = color;
      ctx.shadowBlur = (isGrounded ? 26 : isAnchor ? 20 : 13) * (0.7 + 0.3 * p);
    }
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(n.x!, n.y!, r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();

    // Anchor: distinct white ring.
    if (hi && isAnchor) {
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.lineWidth = 1.4 + 0.9 * p;
      ctx.strokeStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(n.x!, n.y!, r + 3.5, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.restore();
    }
    // Grounded: strongest — a colored breathing ring.
    if (hi && isGrounded) {
      ctx.save();
      ctx.globalAlpha = 0.5 + 0.4 * p;
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.arc(n.x!, n.y!, r + 6.5, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.restore();
    }

    // Labels: always for highlighted/hovered; the user node in the calm state;
    // hover-only for everyone else (keeps the default view uncluttered).
    const showLabel =
      hovered === n.id || (hi && lit) || (!hi && n.kind === "user");
    if (showLabel) {
      const fontSize = 12 / scale;
      ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui, -apple-system, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      const tw = ctx.measureText(n.label).width;
      const ty = n.y! + r + 2.5;
      ctx.globalAlpha = !hi || lit || hovered === n.id ? 1 : 0.3;
      ctx.fillStyle = "rgba(8,14,24,0.72)";
      ctx.fillRect(n.x! - tw / 2 - 3 / scale, ty - 1 / scale, tw + 6 / scale, fontSize + 4 / scale);
      ctx.fillStyle = "#e9eff7";
      ctx.fillText(n.label, n.x!, ty + 1 / scale);
      ctx.globalAlpha = 1;
    }
  };

  const nodePointerArea = (node: any, color: string, ctx: CanvasRenderingContext2D) => {
    const n = node as FGNode;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(n.x!, n.y!, nodeRadius(n) + 4, 0, 2 * Math.PI);
    ctx.fill();
  };

  const linkCanvas = (link: any, ctx: CanvasRenderingContext2D) => {
    const s = link.source;
    const t = link.target;
    if (!s || !t || typeof s !== "object" || typeof t !== "object") return;
    const inSub = highlight.subgraphEdgeIds.has(link.id);
    const w = Number(link.weight ?? 1);
    const baseWidth = 0.35 + Math.min(4, w) * 0.4;
    const p = pulse();

    let alpha: number;
    let width = baseWidth;
    let color = "#33445e";
    ctx.save();
    if (!hi) {
      alpha = 0.45;
    } else if (inSub) {
      width = baseWidth * 1.9;
      color = "#9fd0ff";
      ctx.shadowColor = "#7fc1ff";
      ctx.shadowBlur = 8 * (0.6 + 0.4 * p);
      alpha = 0.65 + 0.35 * p;
    } else {
      alpha = 0.06;
    }
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(t.x, t.y);
    ctx.stroke();
    ctx.restore();
  };

  return (
    <ForceGraph2D
      ref={fgRef}
      graphData={data}
      width={width}
      height={height}
      backgroundColor="#0e1726"
      nodeId="id"
      // Keep the pulse animating while a retrieval is highlighted.
      autoPauseRedraw={!hi}
      cooldownTicks={220}
      warmupTicks={60}
      onEngineStop={() => {
        if (!fitted.current) {
          fitted.current = true;
          const fg = fgRef.current;
          fg?.zoomToFit(600, 38);
          // A second fit after the layout fully settles avoids a premature frame.
          setTimeout(() => fg?.zoomToFit(500, 38), 700);
        }
      }}
      onNodeHover={(n: any) => setHovered(n ? n.id : null)}
      nodeCanvasObjectMode={() => "replace"}
      nodeCanvasObject={nodeCanvas}
      nodePointerAreaPaint={nodePointerArea}
      linkCanvasObjectMode={() => "replace"}
      linkCanvasObject={linkCanvas}
    />
  );
}
