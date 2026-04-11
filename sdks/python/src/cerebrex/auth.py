"""CerebreX Auth helpers — API key management."""

from __future__ import annotations

import os


def get_api_key(key: str | None = None) -> str:
    """Resolve a CerebreX API key from the argument or environment.

    Checks (in order):
    1. The ``key`` argument if provided.
    2. The ``CEREBREX_API_KEY`` environment variable.

    Args:
        key: Explicit API key. If ``None``, falls back to the environment.

    Returns:
        Resolved API key string.

    Raises:
        ValueError: If no API key is found.
    """
    resolved = key or os.environ.get("CEREBREX_API_KEY")
    if not resolved:
        raise ValueError(
            "No CerebreX API key found. "
            "Pass api_key= to CerebreXClient or set the CEREBREX_API_KEY environment variable."
        )
    return resolved


def get_memex_url(url: str | None = None) -> str:
    """Resolve the MEMEX worker base URL.

    Checks (in order):
    1. The ``url`` argument if provided.
    2. The ``CEREBREX_MEMEX_URL`` environment variable.
    3. Falls back to ``https://memex.cerebrex.workers.dev``.

    Args:
        url: Explicit URL override.

    Returns:
        Resolved URL string (no trailing slash).
    """
    return (url or os.environ.get("CEREBREX_MEMEX_URL") or "https://memex.cerebrex.workers.dev").rstrip("/")


def get_kairos_url(url: str | None = None) -> str:
    """Resolve the KAIROS worker base URL.

    Checks (in order):
    1. The ``url`` argument if provided.
    2. The ``CEREBREX_KAIROS_URL`` environment variable.
    3. Falls back to ``https://kairos.cerebrex.workers.dev``.

    Args:
        url: Explicit URL override.

    Returns:
        Resolved URL string (no trailing slash).
    """
    return (url or os.environ.get("CEREBREX_KAIROS_URL") or "https://kairos.cerebrex.workers.dev").rstrip("/")


def get_registry_url(url: str | None = None) -> str:
    """Resolve the registry base URL.

    Checks (in order):
    1. The ``url`` argument if provided.
    2. The ``CEREBREX_REGISTRY_URL`` environment variable.
    3. Falls back to ``https://registry.therealcool.site``.

    Args:
        url: Explicit URL override.

    Returns:
        Resolved URL string (no trailing slash).
    """
    return (url or os.environ.get("CEREBREX_REGISTRY_URL") or "https://registry.therealcool.site").rstrip("/")
