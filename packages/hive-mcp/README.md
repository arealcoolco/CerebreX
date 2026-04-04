# @arealcoolco/hive-mcp

CerebreX HIVE — multi-agent orchestration MCP server.

Create and manage named agent networks (hives) — persistent configs that define which agents run,
what tools they use, and how they route tasks to each other.

## Install

```bash
cerebrex install @arealcoolco/hive-mcp
```

## Configuration

```bash
CEREBREX_TOKEN=your-token-here          # required — get from registry.therealcool.site
CEREBREX_REGISTRY_URL=https://...       # optional — defaults to registry.therealcool.site
```

## Claude Desktop Config

```json
{
  "mcpServers": {
    "hive": {
      "command": "node",
      "args": ["/path/to/hive-mcp/dist/index.js"],
      "env": {
        "CEREBREX_TOKEN": "your-token"
      }
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `hive_list` | List all hives for the authenticated user |
| `hive_create` | Create a new hive with name, description, and config |
| `hive_get` | Get a specific hive by ID |
| `hive_update` | Update a hive's config, description, or status |
| `hive_delete` | Delete a hive permanently |

## Hive Config Schema

```json
{
  "agents": [
    {
      "id": "planner",
      "role": "planner",
      "model": "claude-opus-4-6",
      "tools": ["memex-mcp", "fetch-mcp"]
    },
    {
      "id": "executor",
      "role": "executor",
      "model": "claude-sonnet-4-6",
      "tools": ["memex-mcp"]
    }
  ],
  "routing": "sequential",
  "shared_memory": true
}
```

## Swarm Strategies (CLI)

The `cerebrex hive` CLI supports three execution strategies and six built-in presets:

```bash
cerebrex hive strategies  # list all

# Parallel — all agents get the same task simultaneously
cerebrex hive swarm best-solution "What caching strategy should we use?"

# Pipeline — sequential refinement (researcher → writer → editor)
cerebrex hive swarm content-pipeline "Write a post on agent memory"

# Competitive — agents race; Opus picks the winner
cerebrex hive swarm best-solution "Optimal database indexing strategy?"
```

| Preset | Strategy | Best for |
|--------|----------|---------|
| `research-and-recommend` | pipeline | Deep research with a final recommendation |
| `code-review-pipeline` | pipeline | Multi-stage code review + security pass |
| `best-solution` | competitive | Finding the optimal answer among alternatives |
| `product-spec` | pipeline | PM → Eng → Design spec refinement |
| `content-pipeline` | pipeline | Research → Draft → Edit workflow |
| `contract-audit` | parallel | Multi-angle API contract review |

## Risk Gate (CLI Worker)

When running `cerebrex hive worker`, all tasks are classified before execution:

| Risk | Examples | Default |
|------|---------|---------|
| LOW | echo, memex-get, read | Always permitted |
| MEDIUM | fetch, memex-set, write | Permitted (block with `--block-medium-risk`) |
| HIGH | delete, deploy, send | **Blocked** (permit with `--allow-high-risk`) |

## Example Usage (via Claude)

```
Create a research pipeline hive:
→ hive_create { name: "research-pipeline", description: "planner + executor for deep research", config: { agents: [...], routing: "sequential" } }

List all my hives:
→ hive_list {}

Get hive config:
→ hive_get { id: "abc123..." }

Activate a hive:
→ hive_update { id: "abc123...", status: "active" }
```

---

Built by [A Real Cool Co.](https://therealcool.site) — part of the [CerebreX](https://registry.therealcool.site) Agent Infrastructure OS.
