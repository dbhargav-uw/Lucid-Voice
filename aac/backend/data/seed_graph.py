"""Seed graph data for Lucid Voice.

This module defines the seed knowledge-graph content for the app's demo
personas. Phase 2 fills in the real graph-insertion logic; for now this is a
SCAFFOLD that declares the seed data as plain Python data structures so Phase 2
can consume them directly, plus a `main()` stub that wires them into the
GraphService (lazily imported).

----------------------------------------------------------------------------
PRIMARY PERSONA — Elena
----------------------------------------------------------------------------
Elena, 67, retired high-school Spanish teacher. Expressive aphasia following a
stroke; comprehension is largely intact but speech production is effortful. She
is bilingual (English + Spanish) and frequently code-switches, especially terms
of endearment with family.

Contacts:
  - Marco  — husband, addresses_as "Marco"
  - Sofia  — daughter, addresses_as "sweetie"
  - Mateo  — grandson, age 4, addresses_as "mijo"; RELATED_TO Sofia (her son)

Routines:
  - Gardens in the morning
  - Naps after lunch
  - Dinner around 6pm
  - Calls Sofia on Sundays

Topics she returns to: garden, grandchildren, telenovelas.

Preferences:
  - No early-morning plans
  - Gentle pacing / simple language when interacting with Mateo

Common phrases: "I love you", "can I have some water".

Seed CO_OCCURS weights capture recurring situational pairings:
  - cold-window   : feeling cold tends to co-occur with the window being open
  - Mateo-play    : Mateo co-occurs with playing
  - Mateo-story   : Mateo co-occurs with story / storytime

----------------------------------------------------------------------------
SECONDARY PERSONA — Ben (lighter)
----------------------------------------------------------------------------
Ben, ALS. Included as a second, lighter persona to exercise voice-banking and
multi-condition support. ALS is progressive and motor-affecting (rather than
language-affecting), so this persona stresses the voice-clone / voice-banking
path and confirms the system handles more than one condition profile.
"""

from __future__ import annotations

from typing import Any, Dict, List


# ---------------------------------------------------------------------------
# Node type constants (kept as plain strings to match the GraphNode.type field).
# ---------------------------------------------------------------------------
NODE_PERSON = "person"
NODE_CONTACT = "contact"
NODE_ROUTINE = "routine"
NODE_TOPIC = "topic"
NODE_PREFERENCE = "preference"
NODE_PHRASE = "phrase"
NODE_CONDITION = "condition"


# ---------------------------------------------------------------------------
# Edge type constants.
# ---------------------------------------------------------------------------
EDGE_KNOWS = "KNOWS"
EDGE_RELATED_TO = "RELATED_TO"
EDGE_HAS_ROUTINE = "HAS_ROUTINE"
EDGE_INTERESTED_IN = "INTERESTED_IN"
EDGE_PREFERS = "PREFERS"
EDGE_USES_PHRASE = "USES_PHRASE"
EDGE_CO_OCCURS = "CO_OCCURS"
EDGE_HAS_CONDITION = "HAS_CONDITION"


# ===========================================================================
# PERSONA: ELENA
# ===========================================================================

ELENA_PERSON: Dict[str, Any] = {
    "id": "person:elena",
    "label": "Elena",
    "type": NODE_PERSON,
    "attrs": {
        "age": 67,
        "background": "retired high-school Spanish teacher",
        "condition": "expressive aphasia (post-stroke)",
        "languages": ["en", "es"],
    },
}

ELENA_CONTACTS: List[Dict[str, Any]] = [
    {
        "id": "contact:marco",
        "label": "Marco",
        "type": NODE_CONTACT,
        "relation": "husband",
        "addresses_as": "Marco",
    },
    {
        "id": "contact:sofia",
        "label": "Sofia",
        "type": NODE_CONTACT,
        "relation": "daughter",
        "addresses_as": "sweetie",
    },
    {
        "id": "contact:mateo",
        "label": "Mateo",
        "type": NODE_CONTACT,
        "relation": "grandson",
        "age": 4,
        "addresses_as": "mijo",
        # Mateo is Sofia's son.
        "related_to": "contact:sofia",
    },
]

ELENA_ROUTINES: List[Dict[str, Any]] = [
    {"id": "routine:gardens_am", "label": "gardens in the morning", "type": NODE_ROUTINE, "time_of_day": "morning"},
    {"id": "routine:naps_after_lunch", "label": "naps after lunch", "type": NODE_ROUTINE, "time_of_day": "afternoon"},
    {"id": "routine:dinner_6pm", "label": "dinner around 6pm", "type": NODE_ROUTINE, "time_of_day": "evening"},
    {"id": "routine:calls_sofia_sundays", "label": "calls Sofia on Sundays", "type": NODE_ROUTINE, "day_of_week": "sunday"},
]

ELENA_TOPICS: List[Dict[str, Any]] = [
    {"id": "topic:garden", "label": "garden", "type": NODE_TOPIC},
    {"id": "topic:grandchildren", "label": "grandchildren", "type": NODE_TOPIC},
    {"id": "topic:telenovelas", "label": "telenovelas", "type": NODE_TOPIC},
]

ELENA_PREFERENCES: List[Dict[str, Any]] = [
    {"id": "preference:no_early_plans", "label": "no early-morning plans", "type": NODE_PREFERENCE},
    {"id": "preference:gentle_with_mateo", "label": "gentle / simple language with Mateo", "type": NODE_PREFERENCE},
]

ELENA_PHRASES: List[Dict[str, Any]] = [
    {"id": "phrase:i_love_you", "label": "I love you", "type": NODE_PHRASE},
    {"id": "phrase:water", "label": "can I have some water", "type": NODE_PHRASE},
]

# CO_OCCURS edges encode recurring situational pairings used by retrieval.
ELENA_CO_OCCURS: List[Dict[str, Any]] = [
    {
        "id": "edge:cooccur_cold_window",
        "source": "topic:cold",
        "target": "topic:window",
        "type": EDGE_CO_OCCURS,
        "weight": 0.8,
        "count": 12,
    },
    {
        "id": "edge:cooccur_mateo_play",
        "source": "contact:mateo",
        "target": "topic:play",
        "type": EDGE_CO_OCCURS,
        "weight": 0.7,
        "count": 9,
    },
    {
        "id": "edge:cooccur_mateo_story",
        "source": "contact:mateo",
        "target": "topic:story",
        "type": EDGE_CO_OCCURS,
        "weight": 0.6,
        "count": 7,
    },
]


# ===========================================================================
# PERSONA: BEN (lighter, ALS — voice-banking / multi-condition coverage)
# ===========================================================================

BEN_PERSON: Dict[str, Any] = {
    "id": "person:ben",
    "label": "Ben",
    "type": NODE_PERSON,
    "attrs": {
        "condition": "ALS",
        "languages": ["en"],
        "note": "lighter persona to exercise voice-banking and multi-condition support",
    },
}

BEN_CONDITIONS: List[Dict[str, Any]] = [
    {"id": "condition:als", "label": "ALS", "type": NODE_CONDITION},
]


# ---------------------------------------------------------------------------
# Convenience aggregates Phase 2 can iterate over.
# ---------------------------------------------------------------------------
PERSONAS: List[Dict[str, Any]] = [ELENA_PERSON, BEN_PERSON]


def main() -> None:
    """Insert the seed graph for all personas.

    Phase 2 implements the real insertion logic. GraphService is imported
    lazily here so that importing / compiling this module does not require the
    heavy graph backend (kuzu) to be installed.
    """
    # TODO Phase 2: lazily import and use GraphService to insert the seed data.
    # from app.services.graph_service import GraphService
    # graph = GraphService()
    # for persona in PERSONAS:
    #     graph.upsert_person(persona)
    #     ... insert contacts / routines / topics / preferences / phrases / edges ...
    print("seed_graph: scaffold only — seeding logic arrives in Phase 2.")


if __name__ == "__main__":
    main()
