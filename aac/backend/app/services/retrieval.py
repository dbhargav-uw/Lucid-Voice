"""RetrievalService — grounding context assembly (Phase 3).

Turns sparse user fragments plus situational context into a grounded context
block for generation. It anchors the fragments into the graph, expands the
neighborhood, blends in vector (semantic) retrieval, reranks the candidates,
and assembles a context block plus a ``RetrievalInfo``-shaped dict.

``sentence-transformers`` (and any other heavy dep) must be LAZY-imported
inside methods, never at module top-level.

Confidence gate: when the reranked evidence is too weak (low graph proximity
and low semantic similarity, few anchors), ``retrieve`` reports a low
confidence so the caller can ABSTAIN rather than hallucinate.
"""

from __future__ import annotations

from typing import Any


class RetrievalService:
    """Assembles grounded context for generation from the graph + vectors."""

    def __init__(self, graph: Any, llm: Any, embedding: Any) -> None:
        """Wire up collaborating services.

        Args:
            graph: A :class:`~app.services.graph.GraphService` instance.
            llm: The LLM client (used for anchor extraction / query shaping).
            embedding: The embedding provider for vector retrieval.
        """
        self.graph = graph
        self.llm = llm
        self.embedding = embedding

    def extract_anchors(
        self,
        fragments: list[str],
        context: str,
        situation: Any | None = None,
    ) -> list[str]:
        """Map fragments + situation to anchor node ids in the graph.

        Anchors are the entry points (people, places, topics) the fragments
        most directly reference; they seed graph expansion.

        Args:
            fragments: The user's sparse input tokens/phrases.
            context: Free-text conversational context.
            situation: Optional ``Situation`` (time/place/present_people).

        Returns:
            A list of anchor node ids.

        # TODO Phase 3: entity-link fragments/situation to graph node ids.
        """
        # TODO Phase 3: implement anchor extraction / entity linking.
        return []

    def expand_graph(self, anchor_ids: list[str], hops: int = 2) -> dict[str, Any]:
        """Expand a subgraph around the anchors via the graph service.

        Args:
            anchor_ids: Seed node ids from :meth:`extract_anchors`.
            hops: Traversal depth.

        Returns:
            A ``{"nodes": [...], "edges": [...]}`` subgraph dict.

        # TODO Phase 3: delegate to graph.neighborhood(anchor_ids, hops).
        """
        # TODO Phase 3: implement subgraph expansion.
        return {"nodes": [], "edges": []}

    def vector_retrieve(self, query_text: str) -> list[dict[str, Any]]:
        """Retrieve semantically similar nodes/phrases via embeddings.

        LAZY-imports ``sentence-transformers`` inside this method.

        Args:
            query_text: Text to embed and search against stored vectors.

        Returns:
            A list of candidate node dicts with a ``semantic_sim`` score.

        # TODO Phase 3: embed query, do nearest-neighbor search over stored
        #               node/phrase embeddings.
        """
        # TODO Phase 3: implement vector retrieval.
        # from sentence_transformers import SentenceTransformer
        return []

    def rerank(self, nodes: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Rerank candidate nodes by a weighted relevance score.

        Score formula::

            score = a * graph_proximity
                  + b * edge_weight
                  + c * recency
                  + d * semantic_sim

        where (a, b, c, d) are tunable coefficients. Higher is more relevant.

        Args:
            nodes: Candidate node dicts carrying the component scores.

        Returns:
            The nodes sorted by descending score.

        # TODO Phase 3: compute the weighted score and sort.
        """
        # TODO Phase 3: implement reranking.
        return nodes

    def retrieve(
        self,
        person_id: str,
        fragments: list[str],
        context: str = "",
        situation: Any | None = None,
    ) -> dict[str, Any]:
        """Run the full retrieval pipeline and assemble grounding context.

        Pipeline: extract_anchors -> expand_graph -> vector_retrieve ->
        rerank -> assemble a human-readable context block.

        Confidence / abstain gate: ``confidence`` summarizes evidence
        strength (anchor count, top rerank score, semantic similarity). The
        caller (GenerationService / the /generate endpoint) should ABSTAIN
        when ``confidence`` falls below the configured threshold.

        Args:
            person_id: Owning person's id.
            fragments: The user's sparse input.
            context: Free-text conversational context.
            situation: Optional ``Situation``.

        Returns:
            A dict::

                {
                    "context_block": str,           # assembled facts text
                    "retrieval": {                  # RetrievalInfo shape
                        "anchor_ids": [...],
                        "subgraph_node_ids": [...],
                        "subgraph_edge_ids": [...],
                        "confidence": float,
                    },
                    "confidence": float,            # convenience copy
                }

        # TODO Phase 3: run pipeline, build context_block, compute confidence.
        """
        # TODO Phase 3: implement the full retrieval pipeline.
        return {
            "context_block": "",
            "retrieval": {
                "anchor_ids": [],
                "subgraph_node_ids": [],
                "subgraph_edge_ids": [],
                "confidence": 0.0,
            },
            "confidence": 0.0,
        }
