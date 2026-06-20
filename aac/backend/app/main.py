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
import time

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

_singletons: dict = {}


def _get(name: str):
    """Lazily construct and cache a provider/service with its dependencies.

    Returns the instance, or None if construction fails (logged). Endpoints
    degrade to correctly-shaped placeholders in the None case, so a missing
    heavy dependency never crashes the API.
    """
    if name in _singletons:
        return _singletons[name]

    inst = None
    try:
        if name == "graph":
            from app.services.graph import GraphService

            inst = GraphService()
            inst.connect()  # opens/creates Kuzu + schema
        elif name == "embedding":
            from app.providers import get_embedding_provider

            inst = get_embedding_provider()
        elif name == "llm":
            from app.providers import get_llm_provider

            inst = get_llm_provider()
        elif name == "retrieval":
            from app.services.retrieval import RetrievalService

            inst = RetrievalService(_get("graph"), _get("llm"), _get("embedding"))
        elif name == "generation":
            from app.services.generation import GenerationService

            inst = GenerationService(_get("llm"))
        elif name == "learning":
            from app.services.learning import LearningService

            inst = LearningService(_get("graph"), _get("llm"), _get("embedding"))
        elif name == "cache":
            from app.services.cache import CacheService

            inst = CacheService()
        elif name == "tts":
            from app.providers import get_tts_provider

            inst = get_tts_provider()
        elif name == "stt":
            from app.providers import get_stt_provider

            inst = get_stt_provider()
    except Exception as exc:  # pragma: no cover - defensive guard
        logger.warning("Could not initialize %r: %s", name, exc)
        inst = None

    _singletons[name] = inst
    return inst


def get_retrieval_service():
    return _get("retrieval")


def get_generation_service():
    return _get("generation")


def get_graph_service():
    return _get("graph")


def get_learning_service():
    return _get("learning")


def get_cache_service():
    return _get("cache")


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
    """Reconstruct grounded utterance candidates from fragments + context.

    Pipeline: hybrid retrieval (anchor → graph expand → vector → rerank →
    confidence gate) then LLM generation. On low confidence, ABSTAIN and ask for
    one more word instead of guessing.
    """
    global latest_trace
    t0 = time.time()

    retrieval = get_retrieval_service()
    generation = get_generation_service()

    # Degraded mode: services unavailable (e.g. kuzu/LLM missing) -> shaped empty.
    if retrieval is None or generation is None:
        info = RetrievalInfo()
        trace = {"phase": "degraded", "reason": "retrieval/generation unavailable",
                 "person_id": req.person_id, "fragments": req.fragments}
        latest_trace = trace
        return GenerateResponse(candidates=[], retrieval=info, trace=trace,
                                abstain=True,
                                abstain_reason="The local engine is not available right now.")

    r = retrieval.retrieve(req.person_id, req.fragments, req.context or "", req.situation)
    info = RetrievalInfo(**r["retrieval"])

    if r.get("abstain"):
        trace = {
            "anchors": r["retrieval"]["anchor_ids"],
            "subgraph_node_ids": r["retrieval"]["subgraph_node_ids"],
            "subgraph_edge_ids": r["retrieval"]["subgraph_edge_ids"],
            "confidence": r["confidence"],
            "latency_ms": int((time.time() - t0) * 1000),
            "provider": {"llm": settings.llm_provider, "model": settings.lm_studio_model},
            "abstain": True,
            "rationales": [],
            "candidates": [],
            "topk": r.get("topk", []),
        }
        latest_trace = trace
        return GenerateResponse(candidates=[], retrieval=info, trace=trace,
                                abstain=True, abstain_reason=r.get("abstain_reason"))

    candidates = generation.generate_candidates(
        req.fragments, req.context or "", r["context_block"], valid_node_ids=r["grounded_ids"]
    )
    trace = {
        "anchors": r["retrieval"]["anchor_ids"],
        "subgraph_node_ids": r["retrieval"]["subgraph_node_ids"],
        "subgraph_edge_ids": r["retrieval"]["subgraph_edge_ids"],
        "confidence": r["confidence"],
        "latency_ms": int((time.time() - t0) * 1000),
        "provider": {"llm": settings.llm_provider, "model": settings.lm_studio_model},
        "abstain": False,
        "rationales": [c.get("rationale", "") for c in candidates],
        # Candidates are added to the (free-form) trace dict so the laptop
        # GraphView — which only observes /trace/latest — can render the
        # candidate panel and emphasize grounded nodes. This is NOT an API
        # contract change (trace is typed `dict`).
        "candidates": [
            {
                "text": c.get("text", ""),
                "register": c.get("register", "neutral"),
                "length_label": c.get("length_label", "medium"),
                "rationale": c.get("rationale", ""),
                "grounded_node_ids": c.get("grounded_node_ids", []),
            }
            for c in candidates
        ],
        "topk": r.get("topk", []),
    }
    latest_trace = trace

    return GenerateResponse(
        candidates=[Candidate(**c) for c in candidates],
        retrieval=info,
        trace=trace,
        abstain=False,
        abstain_reason=None,
    )


def _synthesize_with_fallback(person_id: str, text: str) -> str:
    """Synthesize via the configured provider, with fallbacks so we never raise.

    Order: configured provider (XTTS) -> ElevenLabs if a key is present and not
    already the primary -> "" (cache-only). Returns base64 wav, or "" on total
    failure (the caller then serves cache-only / empty so /speak never throws).
    """
    from app.providers.tts import voice_ref_path, ElevenLabsProvider

    ref = voice_ref_path(person_id)
    provider = _get("tts")
    if provider is not None:
        try:
            return provider.synthesize(text, ref)
        except Exception as exc:
            logger.error("primary TTS (%s) failed: %s", settings.tts_provider, exc)
    if settings.elevenlabs_api_key and settings.tts_provider != "elevenlabs":
        try:
            logger.warning("falling back to ElevenLabs for synthesis")
            return ElevenLabsProvider().synthesize(text, ref)
        except Exception as exc:
            logger.error("ElevenLabs fallback failed: %s", exc)
    logger.warning("no TTS available; serving cache-only for %r", person_id)
    return ""


@app.post("/speak", response_model=SpeakResponse)
def speak(req: SpeakRequest) -> SpeakResponse:
    """Speak `text` in the person's cloned voice (cache-first; never hard-fails).

    Cache-first also makes DEMO_MODE instant: pre-rendered demo lines (see
    data/prerender_demo.py) live in the same cache, so they return immediately.
    """
    cache = get_cache_service()
    if cache is not None:
        try:
            hit = cache.get(req.person_id, req.text)
        except Exception as exc:  # pragma: no cover - defensive
            logger.warning("cache get failed: %s", exc)
            hit = None
        if hit is not None:
            return SpeakResponse(audio_base64=hit, cached=True)

    audio_b64 = _synthesize_with_fallback(req.person_id, req.text)
    if audio_b64 and cache is not None:
        try:
            cache.put(req.person_id, req.text, audio_b64)
        except Exception as exc:  # pragma: no cover - defensive
            logger.warning("cache put failed: %s", exc)
    return SpeakResponse(audio_base64=audio_b64 or "", cached=False)


@app.post("/confirm", response_model=ConfirmResponse)
def confirm(req: ConfirmRequest) -> ConfirmResponse:
    """Confirm an utterance was spoken; reinforce the graph (online learning)."""
    learning = get_learning_service()
    if learning is None:
        return ConfirmResponse(changed_node_ids=[], changed_edge_ids=[])
    try:
        result = learning.on_confirm(
            req.person_id, req.text, req.context or "", req.partner, None
        )
    except Exception as exc:  # pragma: no cover - defensive
        logger.error("confirm(%r) failed: %s", req.person_id, exc)
        return ConfirmResponse(changed_node_ids=[], changed_edge_ids=[])
    return ConfirmResponse(
        changed_node_ids=result["changed_node_ids"],
        changed_edge_ids=result["changed_edge_ids"],
    )


@app.post("/consolidate", response_model=ConsolidateResponse)
def consolidate(req: ConsolidateRequest) -> ConsolidateResponse:
    """Consolidate recent Events into durable Preferences (scheduled/offline)."""
    learning = get_learning_service()
    if learning is None:
        return ConsolidateResponse(new_node_ids=[], new_edge_ids=[])
    try:
        result = learning.consolidate(req.person_id)
    except Exception as exc:  # pragma: no cover - defensive
        logger.error("consolidate(%r) failed: %s", req.person_id, exc)
        return ConsolidateResponse(new_node_ids=[], new_edge_ids=[])
    return ConsolidateResponse(
        new_node_ids=result["new_node_ids"],
        new_edge_ids=result["new_edge_ids"],
    )


@app.post("/stt", response_model=STTResponse)
def stt(req: STTRequest) -> STTResponse:
    """Transcribe base64-encoded audio to text (never throws -> "" on failure)."""
    provider = _get("stt")
    if provider is None:
        return STTResponse(text="")
    try:
        return STTResponse(text=provider.transcribe(req.audio_base64))
    except Exception as exc:  # pragma: no cover - provider already guards
        logger.error("stt failed: %s", exc)
        return STTResponse(text="")


@app.post("/enroll", response_model=EnrollResponse)
def enroll(req: EnrollRequest) -> EnrollResponse:
    """Store a person's reference wav (base64) for later voice cloning."""
    try:
        from app.providers.tts import save_reference

        path = save_reference(req.person_id, req.audio_base64)
        return EnrollResponse(ok=True, voice_ref=path)
    except Exception as exc:
        logger.error("enroll(%r) failed: %s", req.person_id, exc)
        return EnrollResponse(ok=False, voice_ref="")


@app.get("/graph/{person_id}", response_model=GraphResponse)
def graph(person_id: str) -> GraphResponse:
    """Return the person's knowledge graph (nodes + edges)."""
    svc = get_graph_service()
    if svc is None:
        return GraphResponse(nodes=[], edges=[])
    try:
        data = svc.get_graph(person_id)
    except Exception as exc:  # pragma: no cover - defensive
        logger.warning("get_graph(%r) failed: %s", person_id, exc)
        return GraphResponse(nodes=[], edges=[])
    # Pydantic coerces the GraphNode/GraphEdge-shaped dicts into models.
    return GraphResponse(nodes=data["nodes"], edges=data["edges"])


@app.get("/trace/latest")
def trace_latest() -> dict:
    """Return the trace produced by the most recent /generate call."""
    return latest_trace
