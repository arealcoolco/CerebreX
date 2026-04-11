/**
 * FORGE Benchmark
 * Measures spec parsing and MCP server scaffold generation time.
 * Runs entirely locally — no network required.
 */

import { benchmark } from './src/stats.js';
import { printResult } from './src/reporters/console.js';

const SAMPLE_SPEC = {
  title: 'bench-api',
  version: '1.0.0',
  description: 'Benchmark target API',
  baseUrl: 'https://api.example.com',
  auth: { type: 'bearer' as const },
  endpoints: Array.from({ length: 20 }, (_, i) => ({
    name: `operation_${i}`,
    method: 'GET' as const,
    path: `/v1/resource/${i}`,
    description: `Get resource ${i}`,
    parameters: [
      { name: 'id', in: 'path' as const, required: true, schema: { type: 'string' as const } },
    ],
    responses: { '200': { description: 'OK' } },
  })),
};

// Simulate the FORGE pipeline: parse -> validate -> generate tool definitions
function forgePipeline(spec: typeof SAMPLE_SPEC): string {
  // Parse phase
  const endpoints = spec.endpoints.map((ep) => ({
    ...ep,
    toolName: ep.name.replace(/[^a-zA-Z0-9]/g, '_'),
  }));

  // Validate phase
  for (const ep of endpoints) {
    if (!ep.name) throw new Error('Missing endpoint name');
    if (!ep.path.startsWith('/')) throw new Error('Path must start with /');
  }

  // Generate phase — produce MCP tool definitions
  const tools = endpoints.map((ep) => ({
    name: ep.toolName,
    description: ep.description,
    inputSchema: {
      type: 'object',
      properties: Object.fromEntries(
        ep.parameters.map((p) => [p.name, { type: p.schema.type, description: p.name }])
      ),
      required: ep.parameters.filter((p) => p.required).map((p) => p.name),
    },
  }));

  return JSON.stringify({ tools, serverInfo: { name: spec.title, version: spec.version } });
}

// Small spec (1 endpoint)
const smallSpec = { ...SAMPLE_SPEC, endpoints: SAMPLE_SPEC.endpoints.slice(0, 1) };
// Large spec (20 endpoints)
const largeSpec = SAMPLE_SPEC;

const results = await Promise.all([
  benchmark({
    name: 'FORGE: parse + generate (1 endpoint)',
    suite: 'forge',
    options: { iterations: 100, warmupRuns: 10, metadata: { endpoints: 1 } },
    fn: () => forgePipeline(smallSpec),
  }),
  benchmark({
    name: 'FORGE: parse + generate (20 endpoints)',
    suite: 'forge',
    options: { iterations: 100, warmupRuns: 10, metadata: { endpoints: 20 } },
    fn: () => forgePipeline(largeSpec),
  }),
  benchmark({
    name: 'FORGE: JSON serialization (20 endpoints)',
    suite: 'forge',
    options: { iterations: 200, warmupRuns: 20, metadata: { endpoints: 20 } },
    fn: () => JSON.stringify(largeSpec),
  }),
  benchmark({
    name: 'FORGE: schema validation (20 endpoints)',
    suite: 'forge',
    options: { iterations: 200, warmupRuns: 20, metadata: { endpoints: 20 } },
    fn: () => {
      for (const ep of largeSpec.endpoints) {
        if (!ep.name || !ep.path) throw new Error('Invalid');
      }
    },
  }),
]);

for (const r of results) printResult(r);
