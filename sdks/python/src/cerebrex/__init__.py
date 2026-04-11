"""CerebreX Python SDK.

Async client for the CerebreX Agent Infrastructure OS.

Quick start::

    import asyncio
    from cerebrex import CerebreXClient

    async def main():
        async with CerebreXClient(api_key="cx-...") as client:
            await client.memex.write_index("my-agent", "# Memory\\n- learned today")
            resp = await client.memex.read_index("my-agent")
            print(resp.index)

    asyncio.run(main())
"""

from .client import CerebreXClient
from .exceptions import (
    AuthenticationError,
    CerebreXError,
    NotFoundError,
    PayloadTooLargeError,
    RateLimitError,
    ServerError,
    ValidationError,
)

__all__ = [
    "CerebreXClient",
    "CerebreXError",
    "AuthenticationError",
    "NotFoundError",
    "PayloadTooLargeError",
    "RateLimitError",
    "ServerError",
    "ValidationError",
]

__version__ = "0.9.2"
