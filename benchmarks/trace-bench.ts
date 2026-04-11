/**
 * TRACE Benchmark
 * Measures trace event throughput and step recording overhead.
 * Runs locally simulating the trace server's data structures.
 */

import { benchmark } from './src/stats.js';
import { printResult } from './src/reporters/console.js';

interface TraceStep {
  stepId: string;
  agentId: string;
  type: string;
  input: unknown;
  output: unknown;
  durationMs: number;
  timestamp: string;
}

interface TraceSession {
  sessionId: string;
  agentId: string;
  steps: TraceStep[];
  startedAt: string;
  totalTokens: number;
}

// In-memory trace store (mirrors the trace server data model)
class TraceStore {
  private sessions = new Map<string, TraceSession>();

  createSession(agentId: string): string {
    const sessionId = crypto.randomUUID();
    this.sessions.set(sessionId, {
      sessionId,
      agentId,
      steps: [],
      startedAt: new Date().toISOString(),
      totalTokens: 0,
    });
    return sessionId;
  }

  recordStep(sessionId: string, step: Omit<TraceStep, 'stepId'>): void {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);
    session.steps.push({ ...step, stepId: crypto.randomUUID() });
  }

  getSession(sessionId: string): TraceSession | undefined {
    return this.sessions.get(sessionId);
  }

  listSessions(agentId: string): TraceSession[] {
    return [...this.sessions.values()].filter((s) => s.agentId === agentId);
  }
}

const store = new TraceStore();
const sessionId = store.createSession('bench-agent');

const results = await Promise.all([
  benchmark({
    name: 'TRACE: create session',
    suite: 'trace',
    options: { iterations: 500, warmupRuns: 50 },
    fn: () => { store.createSession('bench-agent'); },
  }),
  benchmark({
    name: 'TRACE: record step (tool call)',
    suite: 'trace',
    options: { iterations: 1000, warmupRuns: 100 },
    fn: () => {
      store.recordStep(sessionId, {
        agentId: 'bench-agent',
        type: 'tool_call',
        input: { tool: 'search', query: 'test query' },
        output: { results: [{ title: 'Result', url: 'https://example.com' }] },
        durationMs: 42,
        timestamp: new Date().toISOString(),
      });
    },
  }),
  benchmark({
    name: 'TRACE: get session (100 steps)',
    suite: 'trace',
    options: { iterations: 500, warmupRuns: 50 },
    fn: () => { store.getSession(sessionId); },
  }),
  benchmark({
    name: 'TRACE: list sessions by agentId',
    suite: 'trace',
    options: { iterations: 500, warmupRuns: 50 },
    fn: () => { store.listSessions('bench-agent'); },
  }),
  benchmark({
    name: 'TRACE: JSON serialize session',
    suite: 'trace',
    options: { iterations: 200, warmupRuns: 20 },
    fn: () => { JSON.stringify(store.getSession(sessionId)); },
  }),
]);

for (const r of results) printResult(r);
