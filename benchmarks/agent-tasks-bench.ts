/**
 * Cross-Framework Agent Task Benchmark
 *
 * Runs five standardized tasks against CerebreX (and optionally LangChain,
 * CrewAI, AutoGen if adapters are configured). Produces a side-by-side
 * comparison report.
 *
 * Usage:
 *   bun benchmarks/agent-tasks-bench.ts
 *
 * Env vars (all optional, live runs only):
 *   MEMEX_URL           — CerebreX MEMEX worker base URL
 *   CEREBREX_API_KEY    — CerebreX API key
 */

import { benchmark } from './src/stats.js';
import { AGENT_TASKS } from './src/adapters/cerebrex.js';
import { printResult } from './src/reporters/console.js';
import type { BenchmarkResult } from './src/types.js';

const BASE_URL = process.env['MEMEX_URL'] ?? '';
const API_KEY  = process.env['CEREBREX_API_KEY'] ?? '';
const LIVE     = !!(BASE_URL && API_KEY);

console.log('\nCerebreX Cross-Framework Agent Task Benchmark');
console.log(LIVE ? `Live mode: ${BASE_URL}` : 'Dry-run mode (set MEMEX_URL + CEREBREX_API_KEY for live runs)');
console.log('');

// ── CerebreX adapter benchmarks ───────────────────────────────────────────────

const cerebreXResults: BenchmarkResult[] = [];

for (const task of AGENT_TASKS) {
  if (!LIVE) {
    // Dry-run: time a no-op to confirm the benchmark harness works
    const result = await benchmark({
      name: `CerebreX: ${task.name} (dry-run)`,
      suite: 'agent-tasks',
      options: { iterations: 100, warmupRuns: 10, metadata: { framework: 'cerebrex', task: task.name, mode: 'dry-run' } },
      fn: () => { /* no-op */ },
    });
    cerebreXResults.push(result);
    printResult(result);
  } else {
    const result = await benchmark({
      name: `CerebreX: ${task.name}`,
      suite: 'agent-tasks',
      options: { iterations: 20, warmupRuns: 3, timeout: 15_000, metadata: { framework: 'cerebrex', task: task.name } },
      fn: () => task.run(BASE_URL, API_KEY),
    });
    cerebreXResults.push(result);
    printResult(result);
  }
}

// ── Framework comparison summary ──────────────────────────────────────────────
// (LangChain / CrewAI / AutoGen adapters are stubbed — implement in
//  src/adapters/langchain.ts, crewai.ts, autogen.ts when those frameworks
//  are wired up)

console.log('\nFramework Comparison (CerebreX vs others)');
console.log('LangChain, CrewAI, AutoGen adapters: add implementations in src/adapters/ to compare.');
console.log('\nCerebreX task summary:');

const avgP95 = cerebreXResults.reduce((a, r) => a + r.latency.p95, 0) / cerebreXResults.length;
const avgSuccess = cerebreXResults.reduce((a, r) => a + r.successRate, 0) / cerebreXResults.length;
const mode = LIVE ? 'live' : 'dry-run';

console.log(`  Mode:         ${mode}`);
console.log(`  Tasks:        ${cerebreXResults.length}`);
console.log(`  Avg p95:      ${avgP95.toFixed(2)}ms`);
console.log(`  Avg success:  ${(avgSuccess * 100).toFixed(1)}%`);
