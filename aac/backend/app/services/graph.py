"""GraphService — Kuzu-backed knowledge graph (Phase 2).

The graph stores a person's world model: people, places, topics, phrases and
the weighted relationships between them. Salience (on nodes) and weight/count
(on edges) drive retrieval ranking and decay over time.

Kuzu is LAZY-imported inside ``connect`` so that importing this module — and
running ``python -m py_compile`` — works even when kuzu is not installed.

Nodes returned by :meth:`get_graph` match the ``GraphNode`` contract::

    { id, label, type, salience, last_seen, group? }

Edges match the ``GraphEdge`` contract::

    { id, source, target, type, weight, count, last_reinforced }
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.config import settings


def _now_iso() -> str:
    """Return the current UTC time as an ISO-8601 string."""
    return datetime.now(timezone.utc).isoformat()


class GraphService:
    """Wrapper around a Kuzu graph database for a person's world model."""

    def __init__(self, db_path: str | None = None) -> None:
        """Store the on-disk path for the Kuzu database.

        Args:
            db_path: Directory for the Kuzu database. Defaults to
                ``settings.kuzu_db_path``. The actual connection is opened
                lazily in :meth:`connect`.
        """
        self.db_path = db_path or settings.kuzu_db_path
        self._db: Any | None = None
        self._conn: Any | None = None

    def connect(self) -> None:
        """Open (or create) the Kuzu database and a connection.

        LAZY-imports ``kuzu`` here so the module imports without the dep.

        # TODO Phase 2: import kuzu; self._db = kuzu.Database(self.db_path);
        #               self._conn = kuzu.Connection(self._db)
        """
        # TODO Phase 2: implement Kuzu connection.
        # import kuzu
        # self._db = kuzu.Database(self.db_path)
        # self._conn = kuzu.Connection(self._db)
        return None

    def init_schema(self) -> None:
        """Create node and relationship tables if they do not exist.

        Defines NODE TABLE schemas (Person, Place, Topic, Phrase, ...) with
        ``salience`` and ``last_seen`` columns, and REL TABLE schemas carrying
        ``weight``, ``count`` and ``last_reinforced`` columns.

        # TODO Phase 2: run CREATE NODE TABLE / CREATE REL TABLE DDL.
        """
        # TODO Phase 2: implement schema creation.
        return None

    def upsert_node(
        self,
        node_type: str,
        id: str,
        label: str,
        props: dict[str, Any] | None = None,
    ) -> str:
        """Insert a node or update it if it already exists.

        Args:
            node_type: Node table name (e.g. "Person", "Topic").
            id: Stable unique id for the node.
            label: Human-readable label.
            props: Extra properties (salience, group, last_seen, ...).

        Returns:
            The node id.

        # TODO Phase 2: MERGE node by id; set label/props; bump last_seen.
        """
        # TODO Phase 2: implement node upsert via Cypher MERGE.
        return id

    def upsert_edge(
        self,
        rel_type: str,
        src_id: str,
        dst_id: str,
        props: dict[str, Any] | None = None,
    ) -> str:
        """Insert a relationship or update it if it already exists.

        Args:
            rel_type: Relationship table name (e.g. "TALKS_ABOUT").
            src_id: Source node id.
            dst_id: Destination node id.
            props: Extra properties (weight, count, last_reinforced, ...).

        Returns:
            The edge id.

        # TODO Phase 2: MATCH src/dst; MERGE rel; set weight/count/props.
        """
        # TODO Phase 2: implement edge upsert via Cypher MERGE.
        return f"{src_id}->{dst_id}"

    def reinforce_edge(self, rel_type: str, src_id: str, dst_id: str) -> None:
        """Strengthen an existing edge after observing it again.

        Behavior: ``weight += 1``, ``count += 1``,
        ``last_reinforced = now``.

        # TODO Phase 2: MATCH the rel and SET the incremented values.
        """
        # TODO Phase 2: implement edge reinforcement.
        # weight += 1; count += 1; last_reinforced = _now_iso()
        return None

    def decay(self, elapsed: float) -> None:
        """Apply time-based decay across the graph.

        Behavior: node ``salience`` and edge ``weight`` are multiplied by a
        decay factor derived from ``elapsed`` (e.g.
        ``decay_factor ** elapsed``), so unused memories fade.

        Args:
            elapsed: Elapsed time units since the last decay pass.

        # TODO Phase 2: SET salience/weight *= decay_factor across nodes/rels.
        """
        # TODO Phase 2: implement decay sweep.
        return None

    def neighborhood(
        self, node_ids: list[str], hops: int = 1
    ) -> dict[str, list[dict[str, Any]]]:
        """Return the multi-hop neighborhood around anchor nodes.

        Runs a Cypher variable-length traversal out to ``hops`` hops from each
        anchor and collects the reachable nodes and the edges between them.

        Args:
            node_ids: Anchor node ids to expand from.
            hops: Maximum traversal depth.

        Returns:
            A dict ``{"nodes": [...], "edges": [...]}`` shaped like
            :meth:`get_graph` output.

        # TODO Phase 3: MATCH (a)-[*1..hops]-(b) WHERE a.id IN node_ids ...
        """
        # TODO Phase 3: implement multi-hop neighborhood traversal.
        return {"nodes": [], "edges": []}

    def get_graph(self, person_id: str) -> dict[str, list[dict[str, Any]]]:
        """Return the full graph for a person.

        Args:
            person_id: The owning person's id.

        Returns:
            A dict with ``nodes`` and ``edges`` lists matching the GraphNode /
            GraphEdge API contract.

        # TODO Phase 2: query all nodes/edges scoped to person_id and map
        #               them to the GraphNode / GraphEdge shapes.
        """
        # TODO Phase 2: implement full-graph fetch.
        return {"nodes": [], "edges": []}
