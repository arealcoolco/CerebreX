# @arealcoolco/memex-mcp

CerebreX MEMEX — persistent cloud memory MCP server for AI agents.

Give your AI agents durable memory that survives context windows, restarts, and redeployments.
Store facts, decisions, learned behaviors, and session context — queryable from any MCP-compatible runtime.

## Architecture

MEMEX v2 uses a three-layer cloud storage architecture:

| Layer | Storage | What lives here |
|-------|---------|----------------|
| **Index** | Cloudflare KV | Pointer map — always hot, ≤200 lines / 25KB |
| **Topics** | Cloudflare R2 | Per-topic knowledge files, on-demand, ≤512KB each |
| **Transcripts** | Cloudflare D1 | Append-only session history, full-text search, ≤1MB each |

**autoDream** runs nightly at 03:00 UTC: Claude reads the last 50 transcripts, synthesizes them
into topic files, removes contradictions, and prunes the index to fit within the hard size limits.

## Install

```bash
cerebrex install @arealcoolco/memex-mcp
```

## Configuration

Set these environment variables before running:

```bash
CEREBREX_TOKEN=your-token-here          # required — get from registry.therealcool.site
CEREBREX_AGENT_ID=my-agent              # optional — default agent identity
CEREBREX_REGISTRY_URL=https://...       # optional — defaults to registry.therealcool.site
```

## Claude Desktop Config

```json
{
  "mcpServers": {
    "memex": {
      "command": "node",
      "args": ["/path/to/memex-mcp/dist/index.js"],
      "env": {
        "CEREBREX_TOKEN": "your-token",
        "CEREBREX_AGENT_ID": "claude"
      }
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `memory_store` | Store or update a memory (key, value, namespace, type, TTL) |
| `memory_recall` | Search memories by agent, namespace, or key query |
| `memory_forget` | Delete a specific memory by ID |
| `memory_list` | List all memories grouped by namespace |

## Memory Types

- **episodic** — events, actions, and session history
- **semantic** — facts, knowledge, and long-term context
- **working** — current task state, temporary context

## Example Usage (via Claude)

```
Store what stack this project uses:
→ memory_store { key: "project:stack", value: { framework: "next.js", db: "postgres" }, namespace: "project" }

Recall project context:
→ memory_recall { namespace: "project" }

List everything this agent knows:
→ memory_list {}
```

## Security

- All API requests require a valid `CEREBREX_TOKEN` (checked with constant-time comparison)
- agentId values are validated against `^[a-zA-Z0-9_-]+$` — no path traversal possible
- Transcript size is capped at 1MB per write; topic files at 512KB; index at 25KB
- The `/consolidate` endpoint is rate-limited to 1 call per hour per agent

---

Built by [A Real Cool Co.](https://therealcool.site) — part of the [CerebreX](https://registry.therealcool.site) Agent Infrastructure OS.
