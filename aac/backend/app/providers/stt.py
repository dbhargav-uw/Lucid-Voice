"""Speech-to-text providers.

Default is local faster-whisper. Deepgram is a cloud, opt-in alternative.
"""

from __future__ import annotations

import base64
import os
import tempfile
from abc import ABC, abstractmethod

import httpx


class STTProvider(ABC):
    """Abstract base for speech-to-text engines."""

    @abstractmethod
    def transcribe(self, audio_b64: str) -> str:
        """Transcribe base64-encoded audio bytes into text."""
        raise NotImplementedError


class WhisperLocalProvider(STTProvider):
    """Local faster-whisper provider (DEFAULT).

    The model is loaded lazily on first use; base64 audio is decoded to a temp
    file then transcribed.
    """

    def __init__(self) -> None:
        from app.config import settings

        self.model_name: str = settings.whisper_model
        self.device: str = getattr(settings, "whisper_device", "cpu")
        self.compute_type: str = getattr(settings, "whisper_compute_type", "int8")
        self._model = None  # loaded lazily on first use

    def _ensure_model(self):
        if self._model is None:
            # LAZY import: only require faster-whisper when invoked.
            from faster_whisper import WhisperModel

            self._model = WhisperModel(
                self.model_name,
                device=self.device,
                compute_type=self.compute_type,
            )
        return self._model

    def transcribe(self, audio_b64: str) -> str:
        # TODO Phase 7: tune segment handling, language detection, vad filtering.
        model = self._ensure_model()
        audio_bytes = base64.b64decode(audio_b64)
        tmp_path = None
        try:
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                tmp.write(audio_bytes)
                tmp_path = tmp.name
            segments, _info = model.transcribe(tmp_path)
            return "".join(segment.text for segment in segments).strip()
        finally:
            if tmp_path and os.path.exists(tmp_path):
                os.unlink(tmp_path)


class DeepgramProvider(STTProvider):
    """Cloud Deepgram provider (opt-in)."""

    def __init__(self) -> None:
        from app.config import settings

        self.api_key: str | None = getattr(settings, "deepgram_api_key", None)
        self.model: str = getattr(settings, "deepgram_model", "nova-2")
        self.timeout: float = float(getattr(settings, "stt_timeout", 60.0))

    def transcribe(self, audio_b64: str) -> str:
        # TODO Phase 7: finalize encoding/mimetype + response parsing.
        if not self.api_key:
            raise RuntimeError("Deepgram provider requires settings.deepgram_api_key")
        audio_bytes = base64.b64decode(audio_b64)
        url = "https://api.deepgram.com/v1/listen"
        headers = {
            "Authorization": f"Token {self.api_key}",
            "Content-Type": "audio/wav",
        }
        params = {"model": self.model, "smart_format": "true"}
        with httpx.Client(timeout=self.timeout) as client:
            resp = client.post(url, headers=headers, params=params, content=audio_bytes)
            resp.raise_for_status()
            data = resp.json()
        return data["results"]["channels"][0]["alternatives"][0]["transcript"]
