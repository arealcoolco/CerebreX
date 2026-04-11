# CerebreX Python SDK

Async Python client for the [CerebreX Agent Infrastructure OS](https://therealcool.site).

```bash
pip install cerebrex
```

## Quick Start

```python
import asyncio
from cerebrex import CerebreXClient

async def main():
    async with CerebreXClient(api_key="cx-your-key") as client:

        # Write to agent memory (KV index — sub-ms reads)
        await client.memex.write_index("my-agent", "# Memory\n- learned today")

        # Assemble a full system prompt from all three memory layers
        ctx = await client.memex.assemble_context("my-agent", topics=["context"])
        print(ctx.system_prompt)

        # Search the MCP registry
        results = await client.registry.search("web-search")
        for pkg in results.packages:
            print(pkg.name, pkg.version)

asyncio.run(main())
```

## Configuration

| Environment Variable     | Description                          | Default                              |
|--------------------------|--------------------------------------|--------------------------------------|
| `CEREBREX_API_KEY`       | API key (required for auth'd routes) | —                                    |
| `CEREBREX_MEMEX_URL`     | MEMEX worker base URL                | `https://memex.cerebrex.workers.dev` |
| `CEREBREX_KAIROS_URL`    | KAIROS worker base URL               | `https://kairos.cerebrex.workers.dev`|
| `CEREBREX_REGISTRY_URL`  | Registry base URL                    | `https://registry.therealcool.site`  |

## Modules

### `client.memex` — Three-Layer Agent Memory

```python
# Layer 1: KV index (always hot, sub-ms, <=25KB)
await client.memex.write_index("agent-id", "# Memory\n- key facts")
resp = await client.memex.read_index("agent-id")

# Layer 2: R2 topic files (per-topic knowledge, <=512KB)
await client.memex.write_topic("agent-id", "tools", "# Tools\n- search")
topic = await client.memex.read_topic("agent-id", "tools")

# Layer 3: D1 transcripts (append-only session history)
await client.memex.append_transcript("agent-id", "user: hello\nagent: hi", session_id="sess-1")
results = await client.memex.search_transcripts("agent-id", "hello")

# Assemble all layers into one system prompt
ctx = await client.memex.assemble_context("agent-id", topics=["tools"])
print(ctx.system_prompt)   # ready to inject into claude.messages.create(system=...)

# Trigger nightly autoDream consolidation manually (rate-limited: 1/hour)
await client.memex.consolidate("agent-id")
```

### `client.registry` — MCP Package Registry

```python
# Search and browse packages (no auth required)
results = await client.registry.search("web-search")
versions = await client.registry.get("mcp-web-search")
pkg = await client.registry.get_version("mcp-web-search", "1.0.0")
download_url = await client.registry.download_url("mcp-web-search", "1.0.0")
```

### `client.kairos` — Autonomous Daemon + Task Queue

```python
# Start/stop the 5-minute tick daemon
await client.kairos.start_daemon("agent-id")
status = await client.kairos.daemon_status("agent-id")
print(status.running, status.tick_count)

# Submit tasks
task = await client.kairos.submit_task("agent-id", "fetch",
    payload={"url": "https://api.example.com/data"})
tasks = await client.kairos.list_tasks("agent-id", status="queued")

# Read the append-only daemon log
log = await client.kairos.daemon_log("agent-id", limit=20)
for entry in log:
    print(entry.tick_at, entry.decided, entry.result)
```

### `client.ultraplan` — Opus-Powered Long-Range Planning

```python
import asyncio

# Submit goal to Claude Opus for planning
resp = await client.ultraplan.create("Build a competitor analysis tool for our SaaS")
plan_id = resp.plan_id

# Poll until ready (Opus takes ~10-30s)
while True:
    plan = await client.ultraplan.get(plan_id)
    if plan.status != "planning":
        break
    await asyncio.sleep(5)

# Review plan.plan (JSON with tasks, risks, success criteria)
# Then approve or reject
await client.ultraplan.approve(plan_id)   # queues all tasks
# or
await client.ultraplan.reject(plan_id)
```

### `client.trace` — Agent Observability

```python
session_id = await client.trace.create_session("agent-id")

await client.trace.record_step(session_id, "tool_call",
    input={"tool": "search", "query": "CerebreX"},
    output={"results": [...]}, duration_ms=142)

session = await client.trace.get_session(session_id)
print(len(session["steps"]), "steps recorded")
```

## Framework Integrations

### LangChain

```python
from examples.langchain_integration import CerebreXMemory
from langchain.chains import ConversationChain
from langchain_anthropic import ChatAnthropic

memory = CerebreXMemory(agent_id="my-agent", api_key="cx-...")
chain = ConversationChain(llm=ChatAnthropic(model="claude-sonnet-4-6"), memory=memory)
print(chain.predict(input="What did we discuss last time?"))
```

### CrewAI

```python
from examples.crewai_integration import CerebreXTracer
from crewai import Crew, Agent, Task

tracer = CerebreXTracer(agent_id="my-crew", api_key="cx-...")
tracer.start_session()
crew = Crew(agents=[...], tasks=[...])
result = crew.kickoff()
tracer.end_session()
```

## Error Handling

```python
from cerebrex import CerebreXClient, AuthenticationError, NotFoundError, RateLimitError

async with CerebreXClient(api_key="cx-...") as client:
    try:
        await client.memex.read_topic("agent-id", "missing-topic")
    except NotFoundError:
        print("Topic does not exist yet")
    except AuthenticationError:
        print("Check your CEREBREX_API_KEY")
    except RateLimitError:
        print("Consolidation rate limit hit — try again in an hour")
```

## Development

```bash
cd sdks/python
pip install -e ".[dev]"
pytest tests/ -v
ruff check src/ tests/
```

## License

Apache 2.0 — see [LICENSE](../../LICENSE)
