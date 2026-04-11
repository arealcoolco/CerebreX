"""CerebreX KAIROS API — autonomous agent daemon management."""

from __future__ import annotations

from ._http import HttpClient
from ._types import (
    DaemonLogEntry,
    DaemonStatusResponse,
    SuccessResponse,
    TaskResponse,
)


class KairosClient:
    """Async client for the CerebreX KAIROS worker.

    KAIROS runs a Durable Object daemon with a 5-minute tick loop.
    Each tick, Claude decides whether to act or stay quiet.

    Example:
        async with CerebreXClient(...) as client:
            await client.kairos.start_daemon("my-agent")
            status = await client.kairos.daemon_status("my-agent")
            print(status.running, status.tick_count)
    """

    def __init__(self, http: HttpClient) -> None:
        self._http = http

    # ── Daemon management ─────────────────────────────────────────────────────

    async def start_daemon(self, agent_id: str) -> SuccessResponse:
        """Start the KAIROS daemon for an agent.

        The daemon wakes every 5 minutes (by default) and asks Claude
        whether to act or stay quiet. All decisions are logged to D1.

        Args:
            agent_id: Agent identifier (alphanumeric, dashes, underscores).
        """
        r = await self._http.post(f"/v1/agents/{agent_id}/daemon/start")
        return SuccessResponse.model_validate(r.json())

    async def stop_daemon(self, agent_id: str) -> SuccessResponse:
        """Stop the KAIROS daemon for an agent.

        Args:
            agent_id: Agent identifier.
        """
        r = await self._http.post(f"/v1/agents/{agent_id}/daemon/stop")
        return SuccessResponse.model_validate(r.json())

    async def daemon_status(self, agent_id: str) -> DaemonStatusResponse:
        """Get the current daemon status for an agent.

        Args:
            agent_id: Agent identifier.

        Returns:
            DaemonStatusResponse with running state, tick count, and last tick time.
        """
        r = await self._http.get(f"/v1/agents/{agent_id}/daemon/status")
        return DaemonStatusResponse.model_validate(r.json())

    async def daemon_log(self, agent_id: str, limit: int = 50) -> list[DaemonLogEntry]:
        """Retrieve the append-only daemon activity log.

        Args:
            agent_id: Agent identifier.
            limit: Max log entries (1-200).

        Returns:
            List of DaemonLogEntry in reverse-chronological order.
        """
        r = await self._http.get(
            f"/v1/agents/{agent_id}/daemon/log",
            params={"limit": str(limit)},
        )
        data = r.json()
        return [DaemonLogEntry.model_validate(e) for e in data.get("log", [])]

    # ── Task management ───────────────────────────────────────────────────────

    async def submit_task(
        self,
        agent_id: str,
        task_type: str,
        payload: dict[str, object] | None = None,
        priority: int = 5,
    ) -> TaskResponse:
        """Submit a task to the KAIROS task queue.

        Built-in types: "noop", "echo", "fetch". Custom types are routed
        to external handlers.

        Args:
            agent_id: Agent identifier.
            task_type: Task type string.
            payload: Optional task payload dict.
            priority: Task priority (1-10, higher = processed first).

        Returns:
            TaskResponse with the new task ID and queued status.
        """
        r = await self._http.post(
            f"/v1/agents/{agent_id}/tasks",
            json={"type": task_type, "payload": payload or {}, "priority": priority},
        )
        return TaskResponse.model_validate(r.json())

    async def list_tasks(
        self,
        agent_id: str,
        status: str | None = None,
        limit: int = 50,
    ) -> list[dict[str, object]]:
        """List tasks for an agent, optionally filtered by status.

        Args:
            agent_id: Agent identifier.
            status: Optional filter: "queued", "running", "completed", "failed".
            limit: Max tasks to return (1-200).

        Returns:
            List of task records as dicts.
        """
        params: dict[str, str] = {"limit": str(limit)}
        if status:
            params["status"] = status
        r = await self._http.get(f"/v1/agents/{agent_id}/tasks", params=params)
        data = r.json()
        tasks: list[dict[str, object]] = data.get("tasks", [])
        return tasks

    async def update_task(
        self,
        agent_id: str,
        task_id: str,
        status: str,
        result: object | None = None,
        error: str | None = None,
    ) -> SuccessResponse:
        """Update a task's status (used by external task handlers).

        Args:
            agent_id: Agent identifier.
            task_id: Task identifier.
            status: New status: "running", "completed", or "failed".
            result: Optional result payload (for completed tasks).
            error: Optional error message (for failed tasks).
        """
        body: dict[str, object] = {"status": status}
        if result is not None:
            body["result"] = result
        if error is not None:
            body["error"] = error
        r = await self._http.patch(
            f"/v1/agents/{agent_id}/tasks/{task_id}",
            json=body,
        )
        return SuccessResponse.model_validate(r.json())
