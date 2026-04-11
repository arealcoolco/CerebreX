"""CerebreX SDK exceptions."""

from __future__ import annotations


class CerebreXError(Exception):
    """Base class for all CerebreX SDK errors."""


class AuthenticationError(CerebreXError):
    """Raised when the API key is missing or invalid (HTTP 401)."""


class NotFoundError(CerebreXError):
    """Raised when the requested resource does not exist (HTTP 404)."""


class RateLimitError(CerebreXError):
    """Raised when a rate limit is exceeded (HTTP 429)."""


class PayloadTooLargeError(CerebreXError):
    """Raised when a request body exceeds the server-side size limit (HTTP 413)."""


class ServerError(CerebreXError):
    """Raised for unexpected server-side errors (HTTP 5xx)."""

    def __init__(self, message: str, status_code: int) -> None:
        super().__init__(message)
        self.status_code = status_code


class ValidationError(CerebreXError):
    """Raised when the server rejects the request due to invalid input (HTTP 400)."""
