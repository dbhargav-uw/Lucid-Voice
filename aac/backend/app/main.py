"""FastAPI application entrypoint for Lucid Voice.

This is the Phase 1 SCAFFOLD. Every endpoint returns a correctly-SHAPED
placeholder response so the app is runnable end-to-end. Real logic lands in
later phases (see BUILD ORDER). Heavy/optional providers and services are
imported and instantiated lazily so the app starts even when on-device
dependencies (kuzu, sentence-transformers, TTS/coqui, faster-whisper) or
optional cloud SDKs are missing.
"""

from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.models import (
    ConfirmRequest,
    ConfirmResponse,
    ConsolidateRequest,
    ConsolidateResponse,
    EnrollRequest,
    EnrollResponse,
    GenerateRequest,
    GenerateResponse,
    GraphResponse,
    HealthResponse,
    SpeakRequest,
    SpeakResponse,
    STTRequest,
    STTResponse,
    Candidate,
    RetrievalInfo,
)

logger = logging.getLogger("lucid_voice")

app = FastAPI(title="Lucid Voice")

# CORS for the Vite dev server.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Most recent /generate trace, served by GET /trace/latest.
latest_trace: dict = {}


# --- Lazy service / provider wiring -----------------------------------------
#
# Services and providers are built lazily so a missing heavy dependency never
# crashes import. Each helper caches its result in `_services` and degrades to
# None (with a warning) on failure; endpoints stay shaped regardless.

_services: dict = {}


def _get_service(name: str):
    """Lazily construct and cache a service instance by name.

    Returns the service, or None if construction fails (logged). Endpoints
    still return correctly-shaped placeholders in the None case.
    """
    if name in _services:
        return _services[name]

    service = None
    try:
        from app import services as svc  # lazy import of service layer

        ctor = {
            "retrieval": getattr(svc, "RetrievalService", None),
            "generation": getattr(svc, "GenerationService", None),
            "graph": getattr(svc, "GraphService", None),
            "learning": getattr(svc, "LearningService", None),
            "cache": getattr(svc, "CacheService", None),
        }.get(name)
        if ctor is not None:
            service = ctor()
    except Exception as exc:  # pragma: no cover - defensive scaffold guard
        logger.warning("Could not initialize service %r: %s", name, exc)
        service = None

    _services[name] = service
    return service


def get_retrieval_service():
    return _get_service("retrieval")


def get_generation_service():
    return _get_service("generation")


def get_graph_service():
    return _get_service("graph")


def get_learning_service():
    return _get_service("learning")


def get_cache_service():
    return _get_service("cache")


def _provider_status() -> dict:
    """Best-effort report of the configured providers for /health.

    Reflects the env-selected provider names without instantiating heavy
    providers, so this stays cheap and import-safe.
    """
    return {
        "llm": settings.llm_provider,
        "embedding": settings.embedding_provider,
        "stt": settings.stt_provider,
        "tts": settings.tts_provider,
    }


# --- Endpoints --------------------------------------------------------------


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    """Liveness + configuration report."""
    return HealthResponse(
        status="ok",
        demo_mode=settings.demo_mode,
        providers=_provider_status(),
    )


@app.post("/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest) -> GenerateResponse:
    """Generate grounded utterance candidates from fragments + context."""
    global latest_trace

    # TODO Phase 3: real retrieval + generation. Placeholder shape only.
    retrieval = RetrievalInfo(
        anchor_ids=[],
        subgraph_node_ids=[],
        subgraph_edge_ids=[],
        confidence=0.0,
    )
    candidate = Candidate(
        text="",
        register="neutral",
        length_label="short",
        rationale="Phase 1 scaffold placeholder.",
        grounded_node_ids=[],
    )
    trace: dict = {
        "person_id": req.person_id,
        "fragments": req.fragments,
        "phase": "scaffold",
    }
    latest_trace = trace

    return GenerateResponse(
        candidates=[candidate],
        retrieval=retrieval,
        trace=trace,
        abstain=False,
        abstain_reason=None,
    )


@app.post("/speak", response_model=SpeakResponse)
def speak(req: SpeakRequest) -> SpeakResponse:
    """Synthesize speech for `text` in the person's cloned voice."""
    # TODO Phase 4: real XTTS synthesis + cache lookup.
    return SpeakResponse(audio_base64="", cached=False)


@app.post("/confirm", response_model=ConfirmResponse)
def confirm(req: ConfirmRequest) -> ConfirmResponse:
    """Confirm an utterance was spoken; reinforce the graph."""
    # TODO Phase 6: real learning / graph reinforcement.
    return ConfirmResponse(changed_node_ids=[], changed_edge_ids=[])


@app.post("/consolidate", response_model=ConsolidateResponse)
def consolidate(req: ConsolidateRequest) -> ConsolidateResponse:
    """Consolidate recent activity into the long-term graph."""
    # TODO Phase 6: real consolidation pass.
    return ConsolidateResponse(new_node_ids=[], new_edge_ids=[])


@app.post("/stt", response_model=STTResponse)
def stt(req: STTRequest) -> STTResponse:
    """Transcribe base64-encoded audio to text."""
    # TODO Phase 7: real faster-whisper transcription.
    return STTResponse(text="")


@app.post("/enroll", response_model=EnrollResponse)
def enroll(req: EnrollRequest) -> EnrollResponse:
    """Enroll a voice sample for later cloning."""
    # TODO Phase 4: real voice enrollment / reference storage.
    return EnrollResponse(ok=True, voice_ref="")


@app.get("/graph/{person_id}", response_model=GraphResponse)
def graph(person_id: str) -> GraphResponse:
    """Return the person's knowledge graph (nodes + edges)."""
    # TODO Phase 2/5: real graph read from Kuzu.
    return GraphResponse(nodes=[], edges=[])


@app.get("/trace/latest")
def trace_latest() -> dict:
    """Return the trace produced by the most recent /generate call."""
    return latest_trace
