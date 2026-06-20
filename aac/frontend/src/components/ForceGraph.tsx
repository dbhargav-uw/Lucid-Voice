// ForceGraph — thin wrapper around react-force-graph-2d (ForceGraph2D) with
// typed nodes/links props mapped from our GraphResponse shape.
// TODO Phase 5: highlight the retrieved subgraph (anchor/subgraph ids).

import ForceGraph2D from "react-force-graph-2d";
import type { GraphNode, GraphEdge } from "../lib/api";

// react-force-graph expects { nodes, links }. We adapt our domain types so
// callers can pass GraphResponse-shaped data directly.
export interface ForceGraphNode extends GraphNode {
  // react-force-graph mutates these at runtime for layout.
  x?: number;
  y?: number;
}

export interface ForceGraphLink extends GraphEdge {
  // ForceGraph2D reads `source`/`target` (already on GraphEdge).
  [key: string]: unknown;
}

export interface ForceGraphProps {
  nodes: ForceGraphNode[];
  links: ForceGraphLink[];
  width?: number;
  height?: number;
  // Phase 5: ids to emphasise (retrieved subgraph).
  highlightedNodeIds?: string[];
}

export default function ForceGraph({
  nodes,
  links,
  width,
  height,
  highlightedNodeIds = [],
}: ForceGraphProps) {
  const highlighted = new Set(highlightedNodeIds);

  return (
    <ForceGraph2D
      graphData={{ nodes, links }}
      width={width}
      height={height}
      nodeId="id"
      nodeLabel="label"
      // TODO Phase 5: size/color by salience and highlight retrieved subgraph.
      nodeRelSize={6}
      nodeColor={(node: ForceGraphNode) =>
        highlighted.has(node.id) ? "#2b6cff" : "#9aa0a6"
      }
      linkWidth={(link: ForceGraphLink) =>
        Math.max(1, Number(link.weight ?? 1) * 2)
      }
      linkColor={() => "rgba(0,0,0,0.15)"}
    />
  );
}
