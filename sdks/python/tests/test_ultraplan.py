"""Tests for UltraplanClient."""

from __future__ import annotations

import pytest
from pytest_httpx import HTTPXMock

from cerebrex._http import HttpClient
from cerebrex.ultraplan import UltraplanClient
from cerebrex.exceptions import NotFoundError

from .conftest import KAIROS_BASE


@pytest.fixture
def client(kairos_http: HttpClient) -> UltraplanClient:
    return UltraplanClient(kairos_http)


async def test_create_plan(client: UltraplanClient, httpx_mock: HTTPXMock) -> None:
    httpx_mock.add_response(
        url=f"{KAIROS_BASE}/v1/ultraplan",
        method="POST",
        json={"success": True, "planId": "plan-abc", "status": "planning", "message": "Opus is thinking..."},
    )
    resp = await client.create("Build a competitor analysis tool")
    assert resp.plan_id == "plan-abc"
    assert resp.status == "planning"


async def test_get_plan_pending(client: UltraplanClient, httpx_mock: HTTPXMock) -> None:
    httpx_mock.add_response(
        url=f"{KAIROS_BASE}/v1/ultraplan/plan-abc",
        method="GET",
        json={
            "id": "plan-abc",
            "goal": "Build a competitor analysis tool",
            "status": "pending",
            "plan": '{"summary":"Analyze competitors","tasks":[]}',
            "task_count": 0,
            "created_at": "2026-04-11T13:00:00Z",
        },
    )
    plan = await client.get("plan-abc")
    assert plan.status == "pending"
    assert plan.plan is not None


async def test_approve_plan(client: UltraplanClient, httpx_mock: HTTPXMock) -> None:
    httpx_mock.add_response(
        url=f"{KAIROS_BASE}/v1/ultraplan/plan-abc/approve",
        method="POST",
        json={"success": True, "planId": "plan-abc", "tasksQueued": 5, "agentId": "ultraplan-plan-abc"},
    )
    resp = await client.approve("plan-abc")
    assert resp.success is True
    assert resp.tasks_queued == 5


async def test_reject_plan(client: UltraplanClient, httpx_mock: HTTPXMock) -> None:
    httpx_mock.add_response(
        url=f"{KAIROS_BASE}/v1/ultraplan/plan-abc/reject",
        method="POST",
        json={"success": True},
    )
    resp = await client.reject("plan-abc")
    assert resp.success is True


async def test_get_plan_not_found(client: UltraplanClient, httpx_mock: HTTPXMock) -> None:
    httpx_mock.add_response(
        url=f"{KAIROS_BASE}/v1/ultraplan/bad-id",
        method="GET",
        status_code=404,
        json={"success": False, "error": "Plan not found"},
    )
    with pytest.raises(NotFoundError):
        await client.get("bad-id")
