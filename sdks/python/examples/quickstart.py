"""
CerebreX Python SDK — Quick Start

Demonstrates MEMEX, registry search, KAIROS task submission,
and ULTRAPLAN creation in under 50 lines.

Run:
    CEREBREX_API_KEY=cx-your-key python examples/quickstart.py
"""

import asyncio
import os

from cerebrex import CerebreXClient


async def main() -> None:
    async with CerebreXClient(
        api_key=os.environ.get("CEREBREX_API_KEY", "cx-demo"),
        memex_url=os.environ.get("CEREBREX_MEMEX_URL"),
        kairos_url=os.environ.get("CEREBREX_KAIROS_URL"),
    ) as client:

        # 1. Write to agent memory (Layer 1 — KV index)
        agent_id = "demo-agent"
        print(f"Writing index for {agent_id}...")
        write_resp = await client.memex.write_index(
            agent_id,
            "# Demo Agent Memory\n\n- CerebreX SDK installed\n- Ready to use"
        )
        print(f"  Written: {write_resp.lines} lines")

        # 2. Read it back
        print("Reading index back...")
        read_resp = await client.memex.read_index(agent_id)
        print(f"  Index exists: {read_resp.exists}")
        print(f"  Content preview: {read_resp.index[:60]}...")

        # 3. Write a topic file (Layer 2 — R2)
        print("Writing topic file...")
        await client.memex.write_topic(agent_id, "tools", "# Tools\n\n- web_search\n- code_runner")

        # 4. Assemble a full system prompt from all memory layers
        print("Assembling context...")
        ctx = await client.memex.assemble_context(agent_id, topics=["tools"])
        print(f"  System prompt length: {len(ctx.system_prompt)} chars")
        print(f"  Layers: {ctx.layers}")

        # 5. Search the registry
        print("Searching registry...")
        results = await client.registry.search("mcp")
        print(f"  Found {len(results.packages)} packages")
        for pkg in results.packages[:3]:
            print(f"    {pkg.name}@{pkg.version}")

        # 6. Submit a KAIROS task
        print(f"Submitting task for {agent_id}...")
        task = await client.kairos.submit_task(agent_id, "echo", payload={"message": "hello from SDK"})
        print(f"  Task ID: {task.task_id}  Status: {task.status}")

        print("\nDone!")


if __name__ == "__main__":
    asyncio.run(main())
