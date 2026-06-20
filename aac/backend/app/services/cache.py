"""CacheService — on-disk TTS audio cache (Phase 4).

Caches synthesized speech so repeated utterances are instant and work
offline. The cache key is a sha256 of ``person_id + text`` and entries are
stored as files under ``settings.cache_dir``.

The hashing and file get/put are implemented for real here (they are light
and dependency-free). The actual audio synthesis is the TTS provider's job;
this service only stores/retrieves the base64 audio it is given.
"""

from __future__ import annotations

import hashlib
from pathlib import Path

from app.config import settings


class CacheService:
    """Filesystem cache mapping (person_id, text) -> base64 audio."""

    def __init__(self, cache_dir: str | None = None) -> None:
        """Create the cache directory if needed.

        Args:
            cache_dir: Directory for cached audio. Defaults to
                ``settings.cache_dir``.
        """
        self.cache_dir = Path(cache_dir or settings.cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def key(self, person_id: str, text: str) -> str:
        """Return the cache key: sha256 hex of ``person_id + text``.

        Args:
            person_id: Owning person's id.
            text: The utterance text to be synthesized.

        Returns:
            A hex sha256 digest used as the cache filename stem.
        """
        digest = hashlib.sha256(f"{person_id}\x00{text}".encode("utf-8"))
        return digest.hexdigest()

    def _path(self, person_id: str, text: str) -> Path:
        """Return the on-disk path for a (person_id, text) cache entry."""
        return self.cache_dir / f"{self.key(person_id, text)}.b64"

    def get(self, person_id: str, text: str) -> str | None:
        """Return cached base64 audio for an utterance, or ``None`` on miss.

        Args:
            person_id: Owning person's id.
            text: The utterance text.

        Returns:
            The cached base64-encoded audio string, or ``None`` if absent.
        """
        path = self._path(person_id, text)
        if path.exists():
            return path.read_text(encoding="utf-8")
        return None

    def put(self, person_id: str, text: str, audio_b64: str) -> str:
        """Store base64 audio for an utterance and return its cache key.

        Args:
            person_id: Owning person's id.
            text: The utterance text.
            audio_b64: Base64-encoded synthesized audio to cache.

        Returns:
            The cache key under which the audio was stored.
        """
        path = self._path(person_id, text)
        path.write_text(audio_b64, encoding="utf-8")
        return self.key(person_id, text)
