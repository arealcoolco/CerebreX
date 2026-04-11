"""CerebreX ULTRAPLAN API — Opus-powered long-range planning with human approval."""

from __future__ import annotations

from ._http import HttpClient
from ._types import (
    SuccessResponse,
    UltraplanApproveResponse,
    UltraplanPlan,
    UltraplanResponse,
)


class UltraplanClient:
    """Async client for the CerebreX ULTRAPLAN API.

    ULTRAPLAN submits a goal to Claude Opus for comprehensive planning.
    The resulting plan requires human approval before execution tasks are queued.

    Workflow:
        1. POST /v1/ultraplan  (status: "planning")
        2. Poll GET /v1/ultraplan/{id} until status = "pending"
        3. Review the plan
        4. POST /v1/ultraplan/{id}/approve  ->  tasks queued to HIVE/KAIROS
           OR POST /v1/ultraplan/{id}/reject

    Example:
        async with CerebreXClient(...) as client:
            resp = await client.ultraplan.create("Build a competitor analysis tool")
            plan_id = resp.plan_id

            import asyncio
            while True:
                plan = await client.ultraplan.get(plan_id)
                if plan.status != "planning":
                    break
                await asyncio.sleep(5)

            print(plan.plan)  # Opus-generated JSON plan
            await client.ultraplan.approve(plan_id)
    """

    def __init__(self, http: HttpClient) -> None:
        self._http = http

    async def create(
        self,
        goal: str,
        created_by: str | None = None,
    ) -> UltraplanResponse:
        """Submit a goal to Opus for planning.

        The response is immediate (status: "planning"). Poll get() until
        status becomes "pending" (plan ready) or "error".

        Args:
            goal: Goal description. Max ~12K tokens. Be specific and thorough.
            created_by: Optional creator identifier for audit purposes.

        Returns:
            UltraplanResponse with plan_id and initial "planning" status.
        """
        body: dict[str, str] = {"goal": goal}
        if created_by is not None:
            body["createdBy"] = created_by
        r = await self._http.post("/v1/ultraplan", json=body)
        return UltraplanResponse.model_validate(r.json())

    async def get(self, plan_id: str) -> UltraplanPlan:
        """Retrieve a plan by ID. Poll until status leaves "planning".

        Args:
            plan_id: Plan identifier returned by create().

        Returns:
            UltraplanPlan with current status and, when ready, the full plan JSON.
        """
        r = await self._http.get(f"/v1/ultraplan/{plan_id}")
        return UltraplanPlan.model_validate(r.json())

    async def approve(self, plan_id: str) -> UltraplanApproveResponse:
        """Approve a plan and queue all tasks for execution.

        Only works when the plan status is "pending" (i.e., Opus has finished
        generating the plan and it is awaiting human review).

        Args:
            plan_id: Plan identifier.

        Returns:
            UltraplanApproveResponse with the count of tasks queued.
        """
        r = await self._http.post(f"/v1/ultraplan/{plan_id}/approve")
        return UltraplanApproveResponse.model_validate(r.json())

    async def reject(self, plan_id: str) -> SuccessResponse:
        """Reject a plan — marks it as rejected without queuing any tasks.

        Args:
            plan_id: Plan identifier.
        """
        r = await self._http.post(f"/v1/ultraplan/{plan_id}/reject")
        return SuccessResponse.model_validate(r.json())
