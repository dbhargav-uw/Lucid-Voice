"""Embedding providers.

Default is a local sentence-transformers model. The model is loaded lazily on
first use so importing this module is cheap and dependency-free.
"""

from __future__ import annotations

from abc import ABC, abstractmethod

import numpy as np


class EmbeddingProvider(ABC):
    """Abstract base for text embedding models."""

    @abstractmethod
    def embed(self, text: str) -> list[float]:
        """Embed a single string into a vector of floats."""
        raise NotImplementedError

    @abstractmethod
    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """Embed a batch of strings into a list of vectors."""
        raise NotImplementedError

    @staticmethod
    def cosine_similarity(a, b) -> float:
        """Cosine similarity between two vectors (lists or arrays)."""
        va = np.asarray(a, dtype=np.float32)
        vb = np.asarray(b, dtype=np.float32)
        denom = float(np.linalg.norm(va) * np.linalg.norm(vb))
        if denom == 0.0:
            return 0.0
        return float(np.dot(va, vb) / denom)


class LocalEmbeddingProvider(EmbeddingProvider):
    """Local sentence-transformers embedding provider (DEFAULT)."""

    def __init__(self) -> None:
        from app.config import settings

        self.model_name: str = settings.embedding_model
        self._model = None  # loaded lazily on first use

    def _ensure_model(self):
        if self._model is None:
            # LAZY import: only require sentence-transformers when invoked.
            from sentence_transformers import SentenceTransformer

            self._model = SentenceTransformer(self.model_name)
        return self._model

    def embed(self, text: str) -> list[float]:
        model = self._ensure_model()
        vec = model.encode(text, normalize_embeddings=True)
        return np.asarray(vec, dtype=np.float32).tolist()

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        model = self._ensure_model()
        vecs = model.encode(texts, normalize_embeddings=True)
        return np.asarray(vecs, dtype=np.float32).tolist()
