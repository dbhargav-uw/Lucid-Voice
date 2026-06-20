"""LearningService — online learning + memory consolidation (Phase 6).

Closes the loop: when a user confirms an utterance, the graph is reinforced;
periodically, frequent co-occurring patterns are mined into reusable phrases
and consolidated into durable nodes/edges; decay keeps the world model fresh.

``sentence-transformers`` and any other heavy deps are LAZY-imported inside
methods, never at module top-level.
"""

from __future__ import annotations

from typing import Any


class LearningService:
    """Reinforces, mines, consolidates and decays the person's world model."""

    def __init__(self, graph: Any, llm: Any, embedding: Any) -> None:
        """Wire up collaborating services.

        Args:
            graph: A :class:`~app.services.graph.GraphService` instance.
            llm: The LLM client (for phrase mining / summarization).
            embedding: The embedding provider (for clustering / dedup).
        """
        self.graph = graph
        self.llm = llm
        self.embedding = embedding

    def on_confirm(
        self,
        person_id: str,
        text: str,
        context: str = "",
        partner: str | None = None,
        situation: Any | None = None,
    ) -> dict[str, list[str]]:
        """Reinforce the graph after the user confirms an utterance.

        Behavior: extract the entities/topics referenced by ``text`` (and the
        conversation ``partner`` / ``situation``), bump the salience of the
        involved nodes and reinforce the edges between them
        (``weight += 1``, ``count += 1``, ``last_reinforced = now``), creating
        any missing nodes/edges.

        Args:
            person_id: Owning person's id.
            text: The confirmed (spoken) utterance.
            context: Free-text conversational context.
            partner: The conversation partner, if known.
            situation: Optional ``Situation``.

        Returns:
            ``{"changed_node_ids": [...], "changed_edge_ids": [...]}``.

        # TODO Phase 6: entity-link text, upsert nodes, reinforce edges,
        #               collect changed ids.
        """
        # TODO Phase 6: implement confirmation-driven reinforcement.
        return {"changed_node_ids": [], "changed_edge_ids": []}

    def mine_phrases(
        self,
        person_id: str,
        confirmed_texts: list[str] | None = None,
    ) -> list[dict[str, Any]]:
        """Mine frequently reused phrasings from confirmed utterances.

        Behavior: cluster recent confirmed utterances by semantic similarity,
        surface recurring phrasings as candidate Phrase nodes with usage
        counts, so the user's habitual expressions become first-class memory.

        Args:
            person_id: Owning person's id.
            confirmed_texts: Optional explicit corpus; otherwise pulled from
                the person's recent confirmed history.

        Returns:
            A list of candidate phrase dicts (text + support/count).

        # TODO Phase 6: embed + cluster confirmed texts, extract phrases.
        """
        # TODO Phase 6: implement phrase mining.
        return []

    def consolidate(self, person_id: str) -> dict[str, list[str]]:
        """Consolidate mined patterns into durable graph structure.

        Behavior: promote mined phrases and strong transient co-occurrences
        into persistent Phrase nodes and relationships, dedup against existing
        memory, and prune the noise — the "sleep" pass that turns short-term
        reinforcement into long-term knowledge.

        Args:
            person_id: Owning person's id.

        Returns:
            ``{"new_node_ids": [...], "new_edge_ids": [...]}``.

        # TODO Phase 6: run mine_phrases, upsert durable nodes/edges, dedup.
        """
        # TODO Phase 6: implement consolidation.
        return {"new_node_ids": [], "new_edge_ids": []}

    def run_decay(self, elapsed: float = 1.0) -> None:
        """Apply time-based decay to the world model.

        Delegates to :meth:`GraphService.decay` so salience and edge weight
        fade for unused memories.

        Args:
            elapsed: Elapsed time units since the last decay pass.

        # TODO Phase 6: call self.graph.decay(elapsed) on a schedule.
        """
        # TODO Phase 6: implement scheduled decay.
        return None
