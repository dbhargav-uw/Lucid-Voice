"""Application settings for Lucid Voice.

Loads configuration from environment variables / a `.env` file using
pydantic-settings. All defaults are local-first so the app survives airplane
mode; cloud providers are opt-in via env vars only.
"""

from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Typed application settings. Env names are read case-insensitively."""

    # --- Provider selection ---
    llm_provider: str = "lmstudio"
    embedding_provider: str = "local"
    stt_provider: str = "whisper"
    tts_provider: str = "xtts"

    # --- Mode ---
    demo_mode: bool = False

    # --- LM Studio (local LLM) ---
    lm_studio_base_url: str = "http://localhost:1234/v1"
    lm_studio_model: str = "local-model"
    lm_studio_api_key: str = "not-needed"

    # --- Cloud (opt-in) ---
    claude_model: str = "claude-sonnet-4-6"
    anthropic_api_key: str = ""
    deepgram_api_key: str = ""
    elevenlabs_api_key: str = ""

    # --- Local models ---
    embedding_model: str = "BAAI/bge-small-en-v1.5"
    whisper_model: str = "base"
    xtts_model: str = "tts_models/multilingual/multi-dataset/xtts_v2"

    # --- TTS knobs ---
    xtts_language: str = "en"
    tts_timeout: float = 60.0
    elevenlabs_voice_id: str = ""
    elevenlabs_model: str = "eleven_multilingual_v2"

    # --- Paths ---
    kuzu_db_path: str = "./data/kuzu_db"
    data_dir: str = "./data"
    cache_dir: str = "./data/cache"
    voices_dir: str = "./data/voices"
    demo_fixtures_path: str = "./data/demo_fixtures.json"

    # --- Retrieval ---
    retrieval_hops: int = 2
    retrieval_top_k: int = 8
    confidence_threshold: float = 0.35

    # --- Ranking weights ---
    rank_alpha: float = 0.4  # graph_proximity
    rank_beta: float = 0.3  # edge_weight
    rank_gamma: float = 0.2  # recency
    rank_delta: float = 0.3  # semantic_sim

    # --- Decay ---
    decay_factor: float = 0.98

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


# Module-level singleton.
settings = Settings()


def get_settings() -> Settings:
    """Return the shared Settings singleton."""
    return settings
