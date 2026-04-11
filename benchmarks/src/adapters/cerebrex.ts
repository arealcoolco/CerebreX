/**
 * CerebreX Agent Task Adapter
 *
 * Five standardized tasks for cross-framework benchmarking:
 *   1. single-tool-call     — one-shot API round-trip
 *   2. state-persistence    — write then read back memory
 *   3. numeric-fidelity     — precision math preserved through storage
 *   4. error-recovery       — bad input yields structured error, not crash
 *   5. multi-step-discovery — chain three dependent reads
 */

export interface AgentTask {
  name: string;
  description: string;
  run: (baseUrl: string, apiKey: string) => Promise<TaskOutcome>;
}

export interface TaskOutcome {
  success: boolean;
  qualityScore: number;   // 0.0 - 1.0
  tokenCount: number | null;
  notes: string;
}

const AGENT_ID = 'bench-agent-01';

// ── Task 1: Single tool call ──────────────────────────────────────────────────

const singleToolCall: AgentTask = {
  name: 'single-tool-call',
  description: 'GET /health on the MEMEX worker — verifies basic connectivity.',
  async run(baseUrl: string, _apiKey: string): Promise<TaskOutcome> {
    const res = await fetch(`${baseUrl}/health`, { signal: AbortSignal.timeout(5000) });
    const ok = res.status === 200;
    return { success: ok, qualityScore: ok ? 1.0 : 0.0, tokenCount: null, notes: `HTTP ${res.status}` };
  },
};

// ── Task 2: State persistence ─────────────────────────────────────────────────

const statePersistence: AgentTask = {
  name: 'state-persistence',
  description: 'Write a value to MEMEX index, read it back, verify content matches.',
  async run(baseUrl: string, apiKey: string): Promise<TaskOutcome> {
    const content = `bench-test-${Date.now()}`;
    const headers = { 'Content-Type': 'application/json', 'x-api-key': apiKey };

    const writeRes = await fetch(`${baseUrl}/v1/agents/${AGENT_ID}/memory/index`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ content }),
      signal: AbortSignal.timeout(8000),
    });
    if (!writeRes.ok) {
      return { success: false, qualityScore: 0, tokenCount: null, notes: `write failed: HTTP ${writeRes.status}` };
    }

    const readRes = await fetch(`${baseUrl}/v1/agents/${AGENT_ID}/memory/index`, {
      headers: { 'x-api-key': apiKey },
      signal: AbortSignal.timeout(8000),
    });
    if (!readRes.ok) {
      return { success: false, qualityScore: 0.5, tokenCount: null, notes: `read failed: HTTP ${readRes.status}` };
    }

    const data = await readRes.json() as { index?: string };
    const match = data.index === content;
    return {
      success: match,
      qualityScore: match ? 1.0 : 0.3,
      tokenCount: null,
      notes: match ? 'content matched' : 'content mismatch',
    };
  },
};

// ── Task 3: Numeric fidelity ──────────────────────────────────────────────────

const numericFidelity: AgentTask = {
  name: 'numeric-fidelity',
  description: 'Store a float with 15 significant digits, verify it survives JSON round-trip.',
  async run(baseUrl: string, apiKey: string): Promise<TaskOutcome> {
    const value = 3.141592653589793;
    const content = `pi=${value}`;
    const headers = { 'Content-Type': 'application/json', 'x-api-key': apiKey };

    await fetch(`${baseUrl}/v1/agents/${AGENT_ID}/memory/topics/numeric-test`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ content }),
      signal: AbortSignal.timeout(8000),
    });

    const res = await fetch(`${baseUrl}/v1/agents/${AGENT_ID}/memory/topics/numeric-test`, {
      headers: { 'x-api-key': apiKey },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return { success: false, qualityScore: 0, tokenCount: null, notes: `read failed: HTTP ${res.status}` };
    }

    const data = await res.json() as { content?: string };
    const match = data.content === content;
    return {
      success: match,
      qualityScore: match ? 1.0 : 0.0,
      tokenCount: null,
      notes: match ? 'numeric content preserved' : `got: ${data.content ?? 'undefined'}`,
    };
  },
};

// ── Task 4: Error recovery ────────────────────────────────────────────────────

const errorRecovery: AgentTask = {
  name: 'error-recovery',
  description: 'Send a malformed agentId — expect 400, not 500.',
  async run(baseUrl: string, apiKey: string): Promise<TaskOutcome> {
    const res = await fetch(`${baseUrl}/v1/agents/../../../etc/passwd/memory/index`, {
      headers: { 'x-api-key': apiKey },
      signal: AbortSignal.timeout(5000),
    });
    // Should be 400 (invalid segment) or 404 — anything except 500
    const structured = res.status < 500;
    return {
      success: structured,
      qualityScore: structured ? 1.0 : 0.0,
      tokenCount: null,
      notes: `HTTP ${res.status} (expected <500)`,
    };
  },
};

// ── Task 5: Multi-step discovery ──────────────────────────────────────────────

const multiStepDiscovery: AgentTask = {
  name: 'multi-step-discovery',
  description: 'Status check -> topic list -> index read: three chained dependent reads.',
  async run(baseUrl: string, apiKey: string): Promise<TaskOutcome> {
    const headers = { 'x-api-key': apiKey };
    let score = 0;

    // Step 1: agent status
    const s1 = await fetch(`${baseUrl}/v1/agents/${AGENT_ID}/memory`, {
      headers,
      signal: AbortSignal.timeout(5000),
    });
    if (s1.ok) score += 0.33;

    // Step 2: topic list
    const s2 = await fetch(`${baseUrl}/v1/agents/${AGENT_ID}/memory/topics`, {
      headers,
      signal: AbortSignal.timeout(5000),
    });
    if (s2.ok) score += 0.33;

    // Step 3: index read
    const s3 = await fetch(`${baseUrl}/v1/agents/${AGENT_ID}/memory/index`, {
      headers,
      signal: AbortSignal.timeout(5000),
    });
    if (s3.ok) score += 0.34;

    return {
      success: score >= 0.99,
      qualityScore: score,
      tokenCount: null,
      notes: `steps passed: ${Math.round(score / 0.33)}/${3}`,
    };
  },
};

// ── Public task registry ──────────────────────────────────────────────────────

export const AGENT_TASKS: AgentTask[] = [
  singleToolCall,
  statePersistence,
  numericFidelity,
  errorRecovery,
  multiStepDiscovery,
];
