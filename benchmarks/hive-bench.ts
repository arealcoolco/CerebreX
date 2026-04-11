/**
 * HIVE Benchmark
 * Measures swarm coordination overhead: task distribution, result aggregation,
 * risk gate evaluation, and preset loading.
 * Runs locally using in-memory simulation.
 */

import { benchmark } from './src/stats.js';
import { printResult } from './src/reporters/console.js';

// ── HIVE data model simulation ────────────────────────────────────────────────

type Strategy = 'parallel' | 'pipeline' | 'competitive';
type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

interface HiveTask {
  id: string;
  type: string;
  payload: unknown;
  priority: number;
}

interface HiveResult {
  taskId: string;
  success: boolean;
  output: unknown;
  latencyMs: number;
}

interface RiskPolicy {
  allowHighRisk: boolean;
  allowMediumRisk: boolean;
}

function assessRisk(task: HiveTask): RiskLevel {
  const payload = JSON.stringify(task.payload ?? {});
  if (payload.includes('delete') || payload.includes('destroy')) return 'HIGH';
  if (payload.includes('write') || payload.includes('update')) return 'MEDIUM';
  return 'LOW';
}

function passesRiskGate(task: HiveTask, policy: RiskPolicy): boolean {
  const level = assessRisk(task);
  if (level === 'HIGH' && !policy.allowHighRisk) return false;
  if (level === 'MEDIUM' && !policy.allowMediumRisk) return false;
  return true;
}

function distributeParallel(tasks: HiveTask[], policy: RiskPolicy): HiveTask[] {
  return tasks.filter((t) => passesRiskGate(t, policy));
}

function distributePipeline(tasks: HiveTask[], policy: RiskPolicy): HiveTask[][] {
  const allowed = tasks.filter((t) => passesRiskGate(t, policy));
  return allowed.map((t) => [t]);  // sequential: one stage per task
}

function distributeCompetitive(tasks: HiveTask[], n: number): HiveTask[][] {
  // Run same tasks across n agents, take fastest result
  return Array.from({ length: n }, () => tasks);
}

function aggregateResults(results: HiveResult[], strategy: Strategy): unknown {
  if (strategy === 'competitive') {
    // Take the fastest successful result
    return results.filter((r) => r.success).sort((a, b) => a.latencyMs - b.latencyMs)[0];
  }
  // Parallel / pipeline: collect all
  return { completed: results.filter((r) => r.success).length, failed: results.filter((r) => !r.success).length };
}

// HIVE presets
const PRESETS = {
  research:    { strategy: 'parallel',     risk: { allowHighRisk: false, allowMediumRisk: true },  agents: 3 },
  analysis:    { strategy: 'pipeline',     risk: { allowHighRisk: false, allowMediumRisk: true },  agents: 2 },
  creative:    { strategy: 'competitive',  risk: { allowHighRisk: false, allowMediumRisk: false }, agents: 4 },
  ops:         { strategy: 'parallel',     risk: { allowHighRisk: false, allowMediumRisk: true },  agents: 5 },
  validation:  { strategy: 'pipeline',     risk: { allowHighRisk: false, allowMediumRisk: false }, agents: 2 },
  exploration: { strategy: 'competitive',  risk: { allowHighRisk: false, allowMediumRisk: true },  agents: 3 },
} as const;

// Sample swarm tasks
function makeTasks(n: number): HiveTask[] {
  return Array.from({ length: n }, (_, i) => ({
    id: crypto.randomUUID(),
    type: i % 3 === 0 ? 'write' : 'read',
    payload: { key: `item-${i}`, value: `data-${i}` },
    priority: Math.floor(Math.random() * 10) + 1,
  }));
}

const tasks10  = makeTasks(10);
const tasks100 = makeTasks(100);
const defaultPolicy: RiskPolicy = { allowHighRisk: false, allowMediumRisk: true };

const results = await Promise.all([
  benchmark({
    name: 'HIVE: risk gate (10 tasks)',
    suite: 'hive',
    options: { iterations: 1000, warmupRuns: 100, metadata: { tasks: 10 } },
    fn: () => tasks10.every((t) => passesRiskGate(t, defaultPolicy)),
  }),
  benchmark({
    name: 'HIVE: risk gate (100 tasks)',
    suite: 'hive',
    options: { iterations: 500, warmupRuns: 50, metadata: { tasks: 100 } },
    fn: () => tasks100.every((t) => passesRiskGate(t, defaultPolicy)),
  }),
  benchmark({
    name: 'HIVE: parallel distribution (10 tasks)',
    suite: 'hive',
    options: { iterations: 1000, warmupRuns: 100 },
    fn: () => distributeParallel(tasks10, defaultPolicy),
  }),
  benchmark({
    name: 'HIVE: pipeline distribution (10 tasks)',
    suite: 'hive',
    options: { iterations: 1000, warmupRuns: 100 },
    fn: () => distributePipeline(tasks10, defaultPolicy),
  }),
  benchmark({
    name: 'HIVE: competitive distribution (10 tasks, 4 agents)',
    suite: 'hive',
    options: { iterations: 500, warmupRuns: 50 },
    fn: () => distributeCompetitive(tasks10, 4),
  }),
  benchmark({
    name: 'HIVE: result aggregation (parallel, 10 results)',
    suite: 'hive',
    options: { iterations: 1000, warmupRuns: 100 },
    fn: () => {
      const mockResults: HiveResult[] = tasks10.map((t) => ({
        taskId: t.id, success: true, output: { done: true }, latencyMs: Math.random() * 100,
      }));
      aggregateResults(mockResults, 'parallel');
    },
  }),
  benchmark({
    name: 'HIVE: load preset (research)',
    suite: 'hive',
    options: { iterations: 10000, warmupRuns: 1000 },
    fn: () => ({ ...PRESETS['research'] }),
  }),
  benchmark({
    name: 'HIVE: full swarm cycle (parallel, 10 tasks)',
    suite: 'hive',
    options: { iterations: 500, warmupRuns: 50 },
    fn: () => {
      const allowed = distributeParallel(tasks10, defaultPolicy);
      const results: HiveResult[] = allowed.map((t) => ({
        taskId: t.id, success: true, output: null, latencyMs: 1,
      }));
      aggregateResults(results, 'parallel');
    },
  }),
]);

for (const r of results) printResult(r);
