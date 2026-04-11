"""Pydantic v2 models for the CerebreX API."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


# ── MEMEX ─────────────────────────────────────────────────────────────────────


class MemexIndexResponse(BaseModel):
    """Response from GET /v1/agents/{agentId}/memory/index."""

    agent_id: str = Field(alias="agentId")
    index: str
    exists: bool

    model_config = {"populate_by_name": True}


class MemexWriteResponse(BaseModel):
    """Response from POST /v1/agents/{agentId}/memory/index."""

    success: bool
    agent_id: str = Field(alias="agentId")
    lines: int

    model_config = {"populate_by_name": True}


class MemexTopicsResponse(BaseModel):
    """Response from GET /v1/agents/{agentId}/memory/topics."""

    agent_id: str = Field(alias="agentId")
    topics: list[str]

    model_config = {"populate_by_name": True}


class MemexTopicResponse(BaseModel):
    """Response from GET /v1/agents/{agentId}/memory/topics/{topic}."""

    agent_id: str = Field(alias="agentId")
    topic: str
    content: str

    model_config = {"populate_by_name": True}


class MemexTranscriptResponse(BaseModel):
    """Response from POST /v1/agents/{agentId}/memory/transcripts."""

    success: bool
    agent_id: str = Field(alias="agentId")
    session_id: str | None = Field(None, alias="sessionId")

    model_config = {"populate_by_name": True}


class MemexContextResponse(BaseModel):
    """Response from POST /v1/agents/{agentId}/memory/context."""

    agent_id: str = Field(alias="agentId")
    system_prompt: str = Field(alias="systemPrompt")
    layers: dict[str, int]

    model_config = {"populate_by_name": True}


class MemexStatusResponse(BaseModel):
    """Response from GET /v1/agents/{agentId}/memory."""

    agent_id: str = Field(alias="agentId")
    exists: bool
    created_at: str | None = None
    last_consolidation: str | None = None
    session_count: int = 0
    index_lines: int = 0
    topic_count: int = 0

    model_config = {"populate_by_name": True}


# ── Registry ──────────────────────────────────────────────────────────────────


class Package(BaseModel):
    """A published CerebreX registry package."""

    name: str
    version: str
    description: str = ""
    author: str = ""
    downloads: int = 0
    created_at: str = Field("", alias="createdAt")
    tags: list[str] = Field(default_factory=list)

    model_config = {"populate_by_name": True}


class PackageListResponse(BaseModel):
    """Response from GET /v1/packages."""

    packages: list[Package]
    total: int = 0
    query: str = ""


# ── KAIROS ────────────────────────────────────────────────────────────────────


class DaemonStatusResponse(BaseModel):
    """Response from GET /v1/agents/{agentId}/daemon/status."""

    running: bool
    agent_id: str = Field("", alias="agentId")
    tick_count: int = Field(0, alias="tickCount")
    last_tick: str | None = Field(None, alias="lastTick")

    model_config = {"populate_by_name": True}


class DaemonLogEntry(BaseModel):
    """One row from the append-only daemon log."""

    agent_id: str
    tick_at: str
    decided: int
    reasoning: str
    action: str
    result: str
    latency_ms: int


class TaskResponse(BaseModel):
    """Response from POST /v1/agents/{agentId}/tasks."""

    success: bool
    task_id: str = Field(alias="taskId")
    agent_id: str = Field(alias="agentId")
    type: str
    status: str

    model_config = {"populate_by_name": True}


# ── ULTRAPLAN ─────────────────────────────────────────────────────────────────


class UltraplanResponse(BaseModel):
    """Response from POST /v1/ultraplan."""

    success: bool
    plan_id: str = Field(alias="planId")
    status: str
    message: str = ""

    model_config = {"populate_by_name": True}


class UltraplanPlan(BaseModel):
    """A full ULTRAPLAN record returned by GET /v1/ultraplan/{planId}."""

    id: str
    goal: str
    status: str
    plan: str | None = None
    task_count: int = 0
    created_by: str | None = None
    created_at: str = ""
    approved_at: str | None = None


class UltraplanApproveResponse(BaseModel):
    """Response from POST /v1/ultraplan/{planId}/approve."""

    success: bool
    plan_id: str = Field(alias="planId")
    tasks_queued: int = Field(0, alias="tasksQueued")
    agent_id: str = Field("", alias="agentId")

    model_config = {"populate_by_name": True}


# ── Shared ────────────────────────────────────────────────────────────────────


class SuccessResponse(BaseModel):
    """Generic success-only response."""

    success: bool


class HealthResponse(BaseModel):
    """Response from GET /health on any CerebreX worker."""

    status: str
    service: str = ""
    version: str = ""


class ErrorResponse(BaseModel):
    """Standard error envelope returned by all CerebreX workers."""

    success: bool = False
    error: str


JsonDict = dict[str, Any]
