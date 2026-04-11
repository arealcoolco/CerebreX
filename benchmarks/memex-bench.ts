/**
 * MEMEX Benchmark
 * Measures three-layer memory operations: KV index, topic files, transcript appends.
 * Uses in-memory simulation of the MEMEX worker data model.
 * Set MEMEX_URL and CEREBREX_API_KEY env vars to run against a live worker.
 */

import { benchmark } from './src/stats.js';
import { printResult } from './src/reporters/console.js';

const LIVE = !!(process.env['MEMEX_URL'] && process.env['CEREBREX_API_KEY']);
const BASE_URL = process.env['MEMEX_URL'] ?? '';
const API_KEY  = process.env['CEREBREX_API_KEY'] ?? '';

// ── Local simulation ──────────────────────────────────────────────────────────

class MemexSimulator {
  private index = new Map<string, string>();
  private topics = new Map<string, string>();
  private transcripts: Array<{ agentId: string; content: string; ts: string }> = [];

  readIndex(agentId: string): string {
    return this.index.get(`memex:index:${agentId}`) ?? '';
  }

  writeIndex(agentId: string, content: string): void {
    if (content.length > 25_600) throw new Error('Index too large');
    this.index.set(`memex:index:${agentId}`, content);
  }

  readTopic(agentId: string, topic: string): string | null {
    return this.topics.get(`memex/${agentId}/${topic}.md`) ?? null;
  }

  writeTopic(agentId: string, topic: string, content: string): void {
    if (content.length > 524_288) throw new Error('Topic too large');
    this.topics.set(`memex/${agentId}/${topic}.md`, content);
  }

  appendTranscript(agentId: string, content: string): void {
    this.transcripts.push({ agentId, content, ts: new Date().toISOString() });
  }

  searchTranscripts(agentId: string, query: string, limit = 20): typeof this.transcripts {
    return this.transcripts
      .filter((t) => t.agentId === agentId && t.content.includes(query))
      .slice(-limit);
  }

  assembleContext(agentId: string, topics: string[]): string {
    const index = this.readIndex(agentId);
    const parts = index ? [`## Index\n\n${index}`] : [];
    for (const t of topics) {
      const content = this.readTopic(agentId, t);
      if (content) parts.push(`## ${t}\n\n${content}`);
    }
    return parts.join('\n\n');
  }
}

const sim = new MemexSimulator();
const AGENT_ID = 'bench-agent';

// Pre-populate some data
sim.writeIndex(AGENT_ID, '# Memory\n\n- key fact 1\n- key fact 2\n'.repeat(10));
sim.writeTopic(AGENT_ID, 'context', '# Context\n\n' + 'Data line.\n'.repeat(50));
for (let i = 0; i < 20; i++) {
  sim.appendTranscript(AGENT_ID, `Session ${i}: user asked about topic ${i}. Agent replied with details.`);
}

// ── Local benchmarks ──────────────────────────────────────────────────────────

const localResults = await Promise.all([
  benchmark({
    name: 'MEMEX: read KV index (local)',
    suite: 'memex',
    options: { iterations: 1000, warmupRuns: 100 },
    fn: () => sim.readIndex(AGENT_ID),
  }),
  benchmark({
    name: 'MEMEX: write KV index (local)',
    suite: 'memex',
    options: { iterations: 500, warmupRuns: 50 },
    fn: () => sim.writeIndex(AGENT_ID, '# Memory\n\n- item: ' + Date.now()),
  }),
  benchmark({
    name: 'MEMEX: read R2 topic (local)',
    suite: 'memex',
    options: { iterations: 1000, warmupRuns: 100 },
    fn: () => sim.readTopic(AGENT_ID, 'context'),
  }),
  benchmark({
    name: 'MEMEX: append transcript (local)',
    suite: 'memex',
    options: { iterations: 1000, warmupRuns: 100 },
    fn: () => sim.appendTranscript(AGENT_ID, 'user: hello. agent: hello back.'),
  }),
  benchmark({
    name: 'MEMEX: search transcripts (local, 20 docs)',
    suite: 'memex',
    options: { iterations: 500, warmupRuns: 50 },
    fn: () => sim.searchTranscripts(AGENT_ID, 'topic'),
  }),
  benchmark({
    name: 'MEMEX: assemble context (index + 2 topics, local)',
    suite: 'memex',
    options: { iterations: 500, warmupRuns: 50 },
    fn: () => sim.assembleContext(AGENT_ID, ['context']),
  }),
]);

for (const r of localResults) printResult(r);

// ── Live benchmarks (opt-in) ──────────────────────────────────────────────────

if (LIVE) {
  console.log('\nLive MEMEX benchmarks against', BASE_URL);
  const headers = { 'Content-Type': 'application/json', 'x-api-key': API_KEY };

  const liveResults = await Promise.all([
    benchmark({
      name: 'MEMEX: GET /health (live)',
      suite: 'memex-live',
      options: { iterations: 20, warmupRuns: 3, timeout: 10_000 },
      fn: async () => { await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(8000) }); },
    }),
    benchmark({
      name: 'MEMEX: write index (live)',
      suite: 'memex-live',
      options: { iterations: 20, warmupRuns: 3, timeout: 10_000 },
      fn: async () => {
        await fetch(`${BASE_URL}/v1/agents/bench/memory/index`, {
          method: 'POST', headers,
          body: JSON.stringify({ content: `bench-${Date.now()}` }),
          signal: AbortSignal.timeout(8000),
        });
      },
    }),
    benchmark({
      name: 'MEMEX: read index (live)',
      suite: 'memex-live',
      options: { iterations: 20, warmupRuns: 3, timeout: 10_000 },
      fn: async () => {
        await fetch(`${BASE_URL}/v1/agents/bench/memory/index`, {
          headers: { 'x-api-key': API_KEY },
          signal: AbortSignal.timeout(8000),
        });
      },
    }),
  ]);

  for (const r of liveResults) printResult(r);
}
