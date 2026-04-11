/**
 * Registry Benchmark
 * Measures package search, metadata lookup, and tarball operations.
 * Local mode: in-memory registry simulation.
 * Live mode: set REGISTRY_URL env var (no auth required for read endpoints).
 */

import { benchmark } from './src/stats.js';
import { printResult } from './src/reporters/console.js';

const LIVE = !!process.env['REGISTRY_URL'];
const BASE_URL = process.env['REGISTRY_URL'] ?? 'https://registry.therealcool.site';

// ── Local registry simulation ─────────────────────────────────────────────────

interface Package {
  name: string;
  version: string;
  description: string;
  author: string;
  downloads: number;
  createdAt: string;
  tags: string[];
}

class RegistrySimulator {
  private packages: Package[] = [];
  private byName = new Map<string, Package[]>();

  seed(count: number): void {
    const categories = ['tools', 'data', 'auth', 'search', 'storage'];
    for (let i = 0; i < count; i++) {
      const pkg: Package = {
        name: `mcp-${categories[i % categories.length]!}-${i}`,
        version: `${Math.floor(i / 10)}.${i % 10}.0`,
        description: `MCP server for ${categories[i % categories.length]!} operations — item ${i}`,
        author: `author-${i % 5}`,
        downloads: Math.floor(Math.random() * 10000),
        createdAt: new Date(Date.now() - i * 86400000).toISOString(),
        tags: [categories[i % categories.length]!, 'mcp', 'cerebrex'],
      };
      this.packages.push(pkg);
      const existing = this.byName.get(pkg.name) ?? [];
      existing.push(pkg);
      this.byName.set(pkg.name, existing);
    }
  }

  search(query: string, limit = 20): Package[] {
    const q = query.toLowerCase();
    return this.packages
      .filter((p) => p.name.includes(q) || p.description.toLowerCase().includes(q) || p.tags.some((t) => t.includes(q)))
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, limit);
  }

  getVersions(name: string): Package[] {
    return this.byName.get(name) ?? [];
  }

  getLatest(name: string): Package | null {
    const versions = this.getVersions(name);
    return versions[versions.length - 1] ?? null;
  }

  list(limit = 20, offset = 0): Package[] {
    return this.packages.slice(offset, offset + limit);
  }
}

const reg = new RegistrySimulator();
reg.seed(200);

// Pre-pick a valid name for getVersions lookups
const sampleName = 'mcp-tools-0';

const localResults = await Promise.all([
  benchmark({
    name: 'Registry: search (200 packages, keyword match)',
    suite: 'registry',
    options: { iterations: 500, warmupRuns: 50, metadata: { packages: 200 } },
    fn: () => reg.search('tools'),
  }),
  benchmark({
    name: 'Registry: search (200 packages, no match)',
    suite: 'registry',
    options: { iterations: 500, warmupRuns: 50, metadata: { packages: 200 } },
    fn: () => reg.search('zzz-nomatch-zzz'),
  }),
  benchmark({
    name: 'Registry: getVersions by name',
    suite: 'registry',
    options: { iterations: 1000, warmupRuns: 100 },
    fn: () => reg.getVersions(sampleName),
  }),
  benchmark({
    name: 'Registry: getLatest by name',
    suite: 'registry',
    options: { iterations: 1000, warmupRuns: 100 },
    fn: () => reg.getLatest(sampleName),
  }),
  benchmark({
    name: 'Registry: list packages (page 1)',
    suite: 'registry',
    options: { iterations: 500, warmupRuns: 50 },
    fn: () => reg.list(20, 0),
  }),
  benchmark({
    name: 'Registry: JSON serialize search results',
    suite: 'registry',
    options: { iterations: 500, warmupRuns: 50 },
    fn: () => JSON.stringify(reg.search('mcp')),
  }),
]);

for (const r of localResults) printResult(r);

// ── Live benchmarks ───────────────────────────────────────────────────────────

if (LIVE) {
  console.log('\nLive registry benchmarks against', BASE_URL);

  const liveResults = await Promise.all([
    benchmark({
      name: 'Registry: GET /health (live)',
      suite: 'registry-live',
      options: { iterations: 20, warmupRuns: 3, timeout: 10_000 },
      fn: async () => { await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(8000) }); },
    }),
    benchmark({
      name: 'Registry: GET /v1/packages (live, no auth)',
      suite: 'registry-live',
      options: { iterations: 20, warmupRuns: 3, timeout: 10_000 },
      fn: async () => {
        await fetch(`${BASE_URL}/v1/packages`, { signal: AbortSignal.timeout(8000) });
      },
    }),
    benchmark({
      name: 'Registry: GET /v1/packages?q=mcp (live)',
      suite: 'registry-live',
      options: { iterations: 20, warmupRuns: 3, timeout: 10_000 },
      fn: async () => {
        await fetch(`${BASE_URL}/v1/packages?q=mcp`, { signal: AbortSignal.timeout(8000) });
      },
    }),
  ]);

  for (const r of liveResults) printResult(r);
}
