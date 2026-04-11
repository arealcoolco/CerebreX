"""CerebreX TRACE API — agent observability and step recording."""

from __future__ import annotations

from ._http import HttpClient
from ._types import SuccessResponse


class TraceClient:
    """Async client for the CerebreX TRACE server.

    TRACE records agent execution steps for observability and debugging.
    The trace server runs locally on port 7432 by default.

    Example:
        async with CerebreXClient(...) as client:
            session_id = await client.trace.create_session("my-agent")
            await client.trace.record_step(session_id, "tool_call",
                input={"tool": "search", "query": "test"},
                output={"results": []}, duration_ms=42)
            sessions = await client.trace.list_sessions("my-agent")
    """

    def __init__(self, http: HttpClient) -> None:
        self._http = http

    async def health(self) -> dict[str, object]:
        """Check trace server health.

        Returns:
            Health response dict with status field.
        """
        r = await self._http.get("/health")
        result: dict[str, object] = r.json()
        return result

    async def create_session(self, agent_id: str) -> str:
        """Create a new trace session for an agent.

        Args:
            agent_id: Agent identifier.

        Returns:
            Session ID string.
        """
        r = await self._http.post("/sessions", json={"agentId": agent_id})
        data: dict[str, object] = r.json()
        return str(data.get("sessionId", ""))

    async def record_step(
        self,
        session_id: str,
        step_type: str,
        input: object = None,
        output: object = None,
        duration_ms: int = 0,
        metadata: dict[str, object] | None = None,
    ) -> SuccessResponse:
        """Record an agent execution step.

        Args:
            session_id: Session identifier from create_session().
            step_type: Step type (e.g., "tool_call", "llm_call", "decision").
            input: Input data for the step.
            output: Output/result of the step.
            duration_ms: Step execution time in milliseconds.
            metadata: Optional extra metadata dict.
        """
        body: dict[str, object] = {
            "sessionId": session_id,
            "type": step_type,
            "input": input,
            "output": output,
            "durationMs": duration_ms,
        }
        if metadata:
            body["metadata"] = metadata
        r = await self._http.post("/steps", json=body)
        return SuccessResponse.model_validate(r.json())

    async def get_session(self, session_id: str) -> dict[str, object]:
        """Get a full trace session with all recorded steps.

        Args:
            session_id: Session identifier.

        Returns:
            Session dict with "steps" list.
        """
        r = await self._http.get(f"/sessions/{session_id}")
        result: dict[str, object] = r.json()
        return result

    async def list_sessions(self, agent_id: str) -> list[dict[str, object]]:
        """List all trace sessions for an agent.

        Args:
            agent_id: Agent identifier.

        Returns:
            List of session summary dicts.
        """
        r = await self._http.get("/sessions", params={"agentId": agent_id})
        data: dict[str, object] = r.json()
        sessions: list[dict[str, object]] = list(data.get("sessions", []))  # type: ignore[arg-type]
        return sessions
