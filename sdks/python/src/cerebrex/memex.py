"""CerebreX MEMEX API — three-layer agent memory."""

from __future__ import annotations

from ._http import HttpClient
from ._types import (
    MemexContextResponse,
    MemexIndexResponse,
    MemexStatusResponse,
    MemexTopicResponse,
    MemexTopicsResponse,
    MemexTranscriptResponse,
    MemexWriteResponse,
    SuccessResponse,
)


class MemexClient:
    """Async client for the CerebreX MEMEX worker.

    Args:
        http: Shared HttpClient pointed at the MEMEX worker base URL.

    Example:
        async with CerebreXClient(...) as client:
            await client.memex.write_index("my-agent", "# Memory\\n- fact 1")
            resp = await client.memex.read_index("my-agent")
            print(resp.index)
    """

    def __init__(self, http: HttpClient) -> None:
        self._http = http

    # ── Layer 1: KV index ─────────────────────────────────────────────────────

    async def read_index(self, agent_id: str) -> MemexIndexResponse:
        """Read the KV memory index for an agent.

        Args:
            agent_id: Agent identifier (alphanumeric, dashes, underscores).

        Returns:
            MemexIndexResponse with the current index content.
        """
        r = await self._http.get(f"/v1/agents/{agent_id}/memory/index")
        return MemexIndexResponse.model_validate(r.json())

    async def write_index(self, agent_id: str, content: str) -> MemexWriteResponse:
        """Write (replace) the KV memory index for an agent.

        Args:
            agent_id: Agent identifier.
            content: New index content. Max 25KB, max 200 lines.

        Returns:
            MemexWriteResponse with line count written.
        """
        r = await self._http.post(
            f"/v1/agents/{agent_id}/memory/index",
            json={"content": content},
        )
        return MemexWriteResponse.model_validate(r.json())

    async def delete_index(self, agent_id: str) -> SuccessResponse:
        """Delete the KV memory index for an agent.

        Args:
            agent_id: Agent identifier.
        """
        r = await self._http.delete(f"/v1/agents/{agent_id}/memory/index")
        return SuccessResponse.model_validate(r.json())

    # ── Layer 2: R2 topic files ───────────────────────────────────────────────

    async def list_topics(self, agent_id: str) -> MemexTopicsResponse:
        """List all R2 topic files for an agent.

        Args:
            agent_id: Agent identifier.

        Returns:
            MemexTopicsResponse with list of topic names.
        """
        r = await self._http.get(f"/v1/agents/{agent_id}/memory/topics")
        return MemexTopicsResponse.model_validate(r.json())

    async def read_topic(self, agent_id: str, topic: str) -> MemexTopicResponse:
        """Read a single R2 topic file.

        Args:
            agent_id: Agent identifier.
            topic: Topic name (alphanumeric, dashes, underscores).

        Returns:
            MemexTopicResponse with topic content.
        """
        r = await self._http.get(f"/v1/agents/{agent_id}/memory/topics/{topic}")
        return MemexTopicResponse.model_validate(r.json())

    async def write_topic(self, agent_id: str, topic: str, content: str) -> SuccessResponse:
        """Write (replace) a single R2 topic file. Max 512KB.

        Args:
            agent_id: Agent identifier.
            topic: Topic name.
            content: Markdown content. Max 512KB.
        """
        r = await self._http.post(
            f"/v1/agents/{agent_id}/memory/topics/{topic}",
            json={"content": content},
        )
        return SuccessResponse.model_validate(r.json())

    async def delete_topic(self, agent_id: str, topic: str) -> SuccessResponse:
        """Delete an R2 topic file.

        Args:
            agent_id: Agent identifier.
            topic: Topic name.
        """
        r = await self._http.delete(f"/v1/agents/{agent_id}/memory/topics/{topic}")
        return SuccessResponse.model_validate(r.json())

    # ── Layer 3: D1 transcripts ───────────────────────────────────────────────

    async def append_transcript(
        self,
        agent_id: str,
        content: str,
        session_id: str | None = None,
    ) -> MemexTranscriptResponse:
        """Append a session transcript to D1 (append-only). Max 1MB.

        Args:
            agent_id: Agent identifier.
            content: Transcript content (raw text or markdown).
            session_id: Optional session identifier for grouping.

        Returns:
            MemexTranscriptResponse confirming the append.
        """
        payload: dict[str, str] = {"content": content}
        if session_id is not None:
            payload["sessionId"] = session_id
        r = await self._http.post(
            f"/v1/agents/{agent_id}/memory/transcripts",
            json=payload,
        )
        return MemexTranscriptResponse.model_validate(r.json())

    async def search_transcripts(
        self,
        agent_id: str,
        query: str,
        limit: int = 20,
    ) -> list[dict[str, object]]:
        """Full-text search across D1 transcripts for an agent.

        Args:
            agent_id: Agent identifier.
            query: Search string (SQL LIKE match).
            limit: Max results to return (1-100).

        Returns:
            List of matching transcript rows.
        """
        r = await self._http.get(
            f"/v1/agents/{agent_id}/memory/transcripts/search",
            params={"q": query, "limit": str(limit)},
        )
        data = r.json()
        results: list[dict[str, object]] = data.get("results", [])
        return results

    # ── Context assembly ──────────────────────────────────────────────────────

    async def assemble_context(
        self,
        agent_id: str,
        topics: list[str] | None = None,
        base_system_prompt: str = "",
    ) -> MemexContextResponse:
        """Assemble a full system prompt from all three memory layers.

        Combines the KV index, requested topic files, and recent transcripts
        into a single system prompt ready for injection into a Claude API call.

        Args:
            agent_id: Agent identifier.
            topics: Optional list of R2 topic names to include.
            base_system_prompt: Prepend this text before the memory blocks.

        Returns:
            MemexContextResponse with the assembled systemPrompt and layer sizes.
        """
        r = await self._http.post(
            f"/v1/agents/{agent_id}/memory/context",
            json={"topics": topics or [], "baseSystemPrompt": base_system_prompt},
        )
        return MemexContextResponse.model_validate(r.json())

    # ── Consolidation ─────────────────────────────────────────────────────────

    async def consolidate(self, agent_id: str) -> SuccessResponse:
        """Trigger an immediate autoDream consolidation (rate-limited: once/hour).

        Args:
            agent_id: Agent identifier.
        """
        r = await self._http.post(f"/v1/agents/{agent_id}/memory/consolidate")
        return SuccessResponse.model_validate(r.json())

    # ── Agent status ──────────────────────────────────────────────────────────

    async def status(self, agent_id: str) -> MemexStatusResponse:
        """Get memory status and layer sizes for an agent.

        Args:
            agent_id: Agent identifier.

        Returns:
            MemexStatusResponse with counts for all three layers.
        """
        r = await self._http.get(f"/v1/agents/{agent_id}/memory")
        return MemexStatusResponse.model_validate(r.json())
