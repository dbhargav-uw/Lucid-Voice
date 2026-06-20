"""GenerationService — candidate utterance generation (Phase 3).

Given the user's fragments, conversational context and the grounded facts
from retrieval, asks the LLM to reconstruct full, natural utterances and
returns three ``Candidate``-shaped dicts.

The LLM client is passed in; no heavy deps are imported at module top-level.
"""

from __future__ import annotations

import json
from typing import Any

# System role for AAC reconstruction. The model expands sparse fragments into
# faithful, natural utterances grounded ONLY in the provided facts, and emits
# strict JSON with exactly three candidates spanning registers/lengths.
SYSTEM_PROMPT = """You are the voice of an AAC (augmentative and alternative \
communication) user. They type a few fragments; you reconstruct the full \
sentence they most likely intend to say, in their own voice.

Rules:
1. GROUND every claim ONLY in the supplied CONTEXT and RETRIEVED FACTS. Never \
invent names, events, places, or feelings that are not supported. If the \
evidence is insufficient, prefer a shorter, safer utterance.
2. PRESERVE the user's intent and emotional register from the fragments; do \
not editorialize or add opinions they did not express.
3. Be NATURAL and speakable — first person, conversational, contractions \
allowed; avoid robotic filler.
4. Return STRICT JSON ONLY — no prose, no markdown fences. Output an object \
with a "candidates" array of EXACTLY 3 objects, each:
   {
     "text": "<the full utterance>",
     "register": "warm" | "neutral" | "direct",
     "length_label": "short" | "medium" | "full",
     "rationale": "<one short sentence on why this fits>",
     "grounded_node_ids": ["<ids of facts this draws on>"]
   }
The three candidates should offer meaningfully different register/length \
trade-offs so the user can pick the one that fits the moment."""


class GenerationService:
    """Generates candidate utterances from fragments + grounded facts."""

    def __init__(self, llm: Any) -> None:
        """Store the LLM client used for generation.

        Args:
            llm: An LLM client exposing a chat/completion call (LM Studio by
                default; cloud providers are opt-in via env var).
        """
        self.llm = llm

    def _build_user_prompt(
        self,
        fragments: list[str],
        context: str,
        retrieved_facts: str,
    ) -> str:
        """Assemble the user-message prompt from its three sections.

        Layout::

            CONTEXT:
            <context>

            RETRIEVED FACTS:
            <retrieved_facts>

            INPUT (fragments):
            <fragments joined>

        # TODO Phase 3: finalize formatting/escaping of the sections.
        """
        joined = " | ".join(fragments)
        return (
            f"CONTEXT:\n{context}\n\n"
            f"RETRIEVED FACTS:\n{retrieved_facts}\n\n"
            f"INPUT (fragments):\n{joined}"
        )

    def generate_candidates(
        self,
        fragments: list[str],
        context: str,
        retrieved_facts: str,
    ) -> list[dict[str, Any]]:
        """Produce three candidate utterances as Candidate-shaped dicts.

        Sends ``SYSTEM_PROMPT`` plus a user prompt assembled from CONTEXT /
        RETRIEVED FACTS / INPUT to the LLM, then parses the strict-JSON
        response into a list of dicts matching the ``Candidate`` contract::

            { text, register, length_label, rationale, grounded_node_ids }

        Args:
            fragments: The user's sparse input.
            context: Free-text conversational context.
            retrieved_facts: The grounded context block from retrieval.

        Returns:
            A list of (ideally three) Candidate-shaped dicts.

        # TODO Phase 3: call self.llm with SYSTEM_PROMPT + _build_user_prompt,
        #               then json.loads the response and validate the shape.
        """
        # TODO Phase 3: implement LLM call + strict-JSON parsing.
        # prompt = self._build_user_prompt(fragments, context, retrieved_facts)
        # raw = self.llm.chat(system=SYSTEM_PROMPT, user=prompt)
        # return json.loads(raw)["candidates"]
        _ = json  # keep import referenced for Phase 3 parsing
        return []
