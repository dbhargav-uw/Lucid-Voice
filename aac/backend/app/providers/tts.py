"""Text-to-speech / voice-clone providers.

Default is local Coqui XTTS-v2 (on-device voice cloning). ElevenLabs is a
cloud, opt-in alternative. All ``synthesize`` bodies are minimal placeholders
for now; the class structure and lazy imports are real.
"""

from __future__ import annotations

import base64
from abc import ABC, abstractmethod

import httpx


class TTSProvider(ABC):
    """Abstract base for text-to-speech / voice-clone engines."""

    @abstractmethod
    def synthesize(self, text: str, voice_ref: str | None) -> str:
        """Synthesize ``text`` (optionally cloning ``voice_ref``) -> base64 wav."""
        raise NotImplementedError


class XTTSProvider(TTSProvider):
    """Local Coqui XTTS-v2 provider (DEFAULT).

    Loads the XTTS model lazily on first use and clones from a reference wav at
    ``voice_ref``.
    """

    def __init__(self) -> None:
        from app.config import settings

        self.model_name: str = settings.xtts_model
        self.language: str = getattr(settings, "xtts_language", "en")
        self._tts = None  # loaded lazily on first use

    def _ensure_model(self):
        if self._tts is None:
            # LAZY import: only require Coqui TTS when invoked.
            from TTS.api import TTS

            self._tts = TTS(self.model_name)
        return self._tts

    def synthesize(self, text: str, voice_ref: str | None) -> str:
        # TODO Phase 4: run XTTS-v2 clone to a wav buffer and return base64.
        # Structure: self._ensure_model().tts_to_file(text=text,
        #   speaker_wav=voice_ref, language=self.language, file_path=tmp) then
        # read bytes and base64-encode. Placeholder returns empty audio for now.
        return base64.b64encode(b"").decode("ascii")


class ElevenLabsProvider(TTSProvider):
    """Cloud ElevenLabs provider (opt-in)."""

    def __init__(self) -> None:
        from app.config import settings

        self.api_key: str | None = getattr(settings, "elevenlabs_api_key", None)
        self.voice_id: str | None = getattr(settings, "elevenlabs_voice_id", None)
        self.model: str = getattr(settings, "elevenlabs_model", "eleven_multilingual_v2")
        self.timeout: float = float(getattr(settings, "tts_timeout", 60.0))

    def synthesize(self, text: str, voice_ref: str | None) -> str:
        # TODO Phase 4: finalize voice selection + audio format handling.
        if not self.api_key:
            raise RuntimeError("ElevenLabs provider requires settings.elevenlabs_api_key")
        voice = voice_ref or self.voice_id
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice}"
        headers = {
            "xi-api-key": self.api_key,
            "Content-Type": "application/json",
        }
        payload = {"text": text, "model_id": self.model}
        with httpx.Client(timeout=self.timeout) as client:
            resp = client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            audio_bytes = resp.content
        return base64.b64encode(audio_bytes).decode("ascii")
